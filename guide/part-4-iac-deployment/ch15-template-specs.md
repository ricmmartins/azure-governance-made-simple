# Chapter 15 — Template Specs

> Last verified: 2026-04-06

---

## Overview

**Template Specs** are Azure resources that store versioned ARM JSON or Bicep templates in Azure itself. They provide a native, centralized way to share and distribute infrastructure templates across teams, subscriptions, and even Microsoft Entra ID tenants — without requiring access to a source code repository.

Think of a Template Spec as a "published template" that anyone with the right Azure RBAC permissions can deploy, without needing to understand the underlying IaC code or have access to a Git repository.

Key benefits:

- **Versioned** — each Template Spec supports multiple versions, enabling safe rollouts and rollbacks
- **Stored in Azure** — no external storage or registry required; managed as a native Azure resource
- **RBAC-controlled** — access is governed by standard Azure RBAC; you control who can read, deploy, or manage templates
- **Referenceable as Bicep modules** — Bicep can consume Template Specs directly using the `ts:` module source
- **Cross-scope deployment** — Template Specs can deploy resources at any scope (resource group, subscription, management group)

---

## How It Works

### Template Spec Anatomy

A Template Spec is an Azure resource of type `Microsoft.Resources/templateSpecs` that lives in a resource group. Each version is a child resource (`Microsoft.Resources/templateSpecs/versions`) containing the actual template content.

![Template Spec Versions](/images/template-spec-versions.svg)

### Creating a Template Spec

#### Using Azure CLI

```bash
# Create a Template Spec from a Bicep file
az ts create \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --location eastus \
  --version '2.0' \
  --template-file governance-baseline.bicep \
  --description 'Standard governance baseline for new subscriptions' \
  --display-name 'Governance Baseline v2.0'
```

#### Using Azure PowerShell

```powershell
New-AzTemplateSpec `
  -Name 'governance-baseline' `
  -ResourceGroupName 'rg-templates' `
  -Location 'eastus' `
  -Version '2.0' `
  -TemplateFile 'governance-baseline.bicep' `
  -Description 'Standard governance baseline for new subscriptions'
```

### Versioning and Lifecycle

Template Spec versions follow a naming convention (not enforced as semantic versioning, but recommended):

| Version | Description |
|---------|-------------|
| `1.0` | Initial release |
| `1.1` | Minor update — added optional parameter |
| `2.0` | Breaking change — renamed parameters |

**Lifecycle management tips:**

- Use semantic versioning (`MAJOR.MINOR`) for clarity
- Never overwrite a published version; create a new version instead
- Delete outdated versions after confirming no active deployments reference them
- Document changes in the `--description` field of each version

```bash
# List all versions of a Template Spec
az ts show \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --output table

# Delete an old version
az ts delete \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --version '1.0' \
  --yes
```

### Deploying a Template Spec

```bash
# Get the Template Spec version resource ID
SPEC_ID=$(az ts show \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --version '2.0' \
  --query 'id' -o tsv)

# Deploy the Template Spec
az deployment sub create \
  --location eastus \
  --template-spec "$SPEC_ID" \
  --parameters environmentName='production'
```

### Sharing Templates Across Teams and Subscriptions

Template Specs are standard Azure resources, so sharing is controlled through Azure RBAC:

| Role | Capability |
|------|-----------|
| **Reader** | Can view the Template Spec and deploy it |
| **Template Spec Reader** | Can read and deploy Template Specs (purpose-built role) |
| **Contributor** | Can create, update, and deploy Template Specs |
| **Owner** | Full control including RBAC management |

**Cross-subscription sharing** — assign the `Template Spec Reader` role to users or groups in other subscriptions:

```bash
# Grant a group in another subscription read access to a Template Spec
az role assignment create \
  --assignee 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --role 'Template Spec Reader' \
  --scope '/subscriptions/<sub-id>/resourceGroups/rg-templates/providers/Microsoft.Resources/templateSpecs/governance-baseline'
```

### Referencing Template Specs as Bicep Modules

One of the most powerful features is using Template Specs directly as Bicep modules with the `ts:` prefix:

```bicep
// Reference a Template Spec as a module
module governanceBaseline 'ts:<subscriptionId>/rg-templates/governance-baseline:2.0' = {
  name: 'governanceBaselineDeployment'
  params: {
    environmentName: 'production'
    location: 'eastus'
  }
}
```

You can also configure aliases in `bicepconfig.json` for cleaner references:

```json
{
  "moduleAliases": {
    "ts": {
      "GovernanceSpecs": {
        "subscription": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "resourceGroup": "rg-templates"
      }
    }
  }
}
```

Then reference the module with the alias:

```bicep
module governanceBaseline 'ts/GovernanceSpecs:governance-baseline:2.0' = {
  name: 'governanceBaselineDeployment'
  params: {
    environmentName: 'production'
  }
}
```

---

## Template Specs vs. Bicep Module Registry

Both Template Specs and the Bicep Module Registry (backed by Azure Container Registry) allow you to share templates. Here's when to use each:

| Feature | Template Specs | Bicep Module Registry (ACR) |
|---------|---------------|----------------------------|
| **Storage** | Azure Resource Manager | Azure Container Registry |
| **Access control** | Azure RBAC on the Template Spec resource | ACR RBAC and tokens |
| **Versioning** | Custom version strings | OCI tags (semantic versioning) |
| **Discoverability** | Azure Portal, CLI, PowerShell | ACR repository listing, `br:` prefix in Bicep |
| **Deployment** | Directly deployable via `az deployment` | Must be referenced as a Bicep module |
| **Cross-tenant sharing** | Via Azure Lighthouse or guest access | Via ACR token or cross-registry replication |
| **Best for** | Self-service deployment by non-IaC teams | Shared module libraries consumed by IaC developers |

**Recommendation:** Use **Template Specs** when you want non-IaC teams to deploy standardized infrastructure through the Azure Portal or CLI. Use the **Bicep Module Registry** when you want IaC developers to consume shared modules in their own Bicep files.

---

## Best Practices

1. **Centralize Template Specs in a dedicated resource group** — create `rg-templates` in a governance or shared-services subscription
2. **Use semantic versioning** — follow `MAJOR.MINOR` to communicate breaking vs. non-breaking changes
3. **Automate publishing** — publish Template Specs from CI/CD pipelines, not manually
4. **Document each version** — use the `--description` parameter to record what changed
5. **Use RBAC for access control** — grant `Template Spec Reader` to consuming teams; limit `Contributor` to the platform team
6. **Test before publishing** — validate templates with What-If and linting before publishing a new version
7. **Configure Bicep aliases** — simplify module references with `bicepconfig.json` aliases

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Overwriting existing versions | Consumers get unexpected changes | Always publish as a new version |
| No access control | Unauthorized deployments of sensitive templates | Apply RBAC to Template Spec resources |
| Not testing before publishing | Broken templates shared to all consumers | Integrate What-If and linting in CI/CD |
| Orphaned versions | Confusion over which version to use | Document and clean up old versions |
| Using Template Specs when a module registry is more appropriate | Teams author Bicep but can't use `ts:` as easily as `br:` | Match the tool to the audience |

---

## Code Samples

### Creating and Deploying a Template Spec (End-to-End)

**Step 1: Author the Bicep template**

```bicep
// storage-account.bicep
targetScope = 'resourceGroup'

@description('Storage account name.')
@minLength(3)
@maxLength(24)
param storageAccountName string

@description('Azure region.')
param location string = resourceGroup().location

@description('SKU name.')
@allowed(['Standard_LRS', 'Standard_GRS', 'Standard_ZRS'])
param skuName string = 'Standard_LRS'

@description('Tags to apply.')
param tags object = {}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: skuName
  }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
  }
}

output storageAccountId string = storageAccount.id
output primaryBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
```

**Step 2: Publish as a Template Spec**

```bash
# Create the resource group for templates (one-time setup)
az group create --name rg-templates --location eastus

# Publish v1.0
az ts create \
  --name 'secure-storage-account' \
  --resource-group rg-templates \
  --location eastus \
  --version '1.0' \
  --template-file storage-account.bicep \
  --description 'Secure storage account with TLS 1.2, HTTPS-only, no public blob access'
```

**Step 3: Deploy the Template Spec**

```bash
# Get the version ID
SPEC_ID=$(az ts show \
  --name 'secure-storage-account' \
  --resource-group rg-templates \
  --version '1.0' \
  --query 'id' -o tsv)

# Deploy to a target resource group
az deployment group create \
  --resource-group rg-app-prod \
  --template-spec "$SPEC_ID" \
  --parameters storageAccountName='stappdata001' skuName='Standard_ZRS'
```

**Step 4: Use as a Bicep module in another template**

```bicep
// main.bicep
module secureStorage 'ts/GovernanceSpecs:secure-storage-account:1.0' = {
  name: 'storageDeployment'
  params: {
    storageAccountName: 'stappdata001'
    skuName: 'Standard_ZRS'
    tags: {
      Environment: 'production'
      CostCenter: 'APP-001'
    }
  }
}
```

---

## References

- [Template Specs overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-specs)
- [Create and deploy Template Specs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-specs-create-linked)
- [Use Template Specs as Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules#template-specs)
- [Template Spec Reader role](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#template-spec-reader)
- [Bicep module registries](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry)
- [Bicep configuration (bicepconfig.json)](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config-modules)

---

| Previous | Next |
|:---------|:-----|
| [Deployment Stacks](ch14-deployment-stacks.md) | [Governance CI/CD](ch16-governance-cicd.md) |
