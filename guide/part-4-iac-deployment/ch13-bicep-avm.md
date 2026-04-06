# Chapter 13 — Bicep & Azure Verified Modules

> Last verified: 2026-04-06

---

## Overview

Bicep is Azure's domain-specific language (DSL) for deploying Azure resources declaratively. It compiles down to ARM JSON templates but offers a dramatically cleaner authoring experience — concise syntax, type safety, first-class module support, and built-in linting.

Bicep reached **General Availability (GA) in June 2021** and is now the **recommended Infrastructure as Code (IaC) language** for Azure deployments. ARM JSON templates remain supported but are considered legacy for new projects.

Why Bicep replaced ARM JSON as the primary recommendation:

| Concern | ARM JSON | Bicep |
|---------|----------|-------|
| **Readability** | Verbose, deeply nested JSON | Clean, concise DSL |
| **Modularity** | Linked/nested templates with complex URI management | Native `module` keyword with local, registry, and Template Spec references |
| **Tooling** | Limited IntelliSense | Rich VS Code extension with IntelliSense, validation, and refactoring |
| **Type safety** | Runtime errors common | Compile-time type checking |
| **Learning curve** | Steep for non-developers | Approachable for infrastructure engineers |
| **Linting** | External tools required | Built-in linter with configurable rules |
| **Decompilation** | N/A | `az bicep decompile` converts existing ARM JSON to Bicep |

> **Key point:** Every Bicep file compiles to an equivalent ARM JSON template. There is no runtime difference — Azure Resource Manager only sees ARM JSON. Bicep is purely an authoring improvement.

---

## How It Works

### Bicep Syntax Fundamentals

A Bicep file (`.bicep`) declares the desired state of Azure resources. The Bicep CLI or Azure CLI compiles it to ARM JSON before deployment.

#### Parameters

Parameters allow callers to provide values at deployment time:

```bicep
@description('The Azure region for all resources.')
@allowed([
  'eastus'
  'westus2'
  'westeurope'
])
param location string = 'eastus'

@description('Environment name used for naming and tagging.')
@minLength(2)
@maxLength(10)
param environmentName string
```

#### Variables

Variables hold computed or reusable values:

```bicep
var resourcePrefix = 'gov-${environmentName}'
var commonTags = {
  Environment: environmentName
  ManagedBy: 'Bicep'
  CostCenter: 'IT-Governance'
}
```

#### Resources

Resources declare the Azure infrastructure to deploy:

```bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: '${resourcePrefix}sa'
  location: location
  tags: commonTags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}
```

#### Outputs

Outputs return values from the deployment for use by other templates or scripts:

```bicep
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
```

#### Modules

Modules enable composition by referencing other Bicep files, Bicep registries, or Template Specs:

```bicep
// Local module
module networking './modules/networking.bicep' = {
  name: 'networkingDeployment'
  params: {
    location: location
    vnetName: '${resourcePrefix}-vnet'
  }
}

// Module from a Bicep registry
module storageModule 'br:myregistry.azurecr.io/bicep/modules/storage:v1.0' = {
  name: 'storageDeployment'
  params: {
    location: location
  }
}

// Module from a Template Spec
module policyModule 'ts:00000000-0000-0000-0000-000000000000/governance-rg/policy-template:v2.0' = {
  name: 'policyDeployment'
  params: {
    scope: subscription().id
  }
}
```

### Azure Verified Modules (AVM)

**Azure Verified Modules (AVM)** are Microsoft's official, community-maintained library of pre-built Bicep and Terraform modules. They implement Azure best practices out of the box — including proper naming, diagnostics, RBAC integration, and Private Endpoint support.

AVM modules are published to the **Bicep Public Module Registry** (`mcr.microsoft.com/bicep`) and follow a strict quality bar:

- **Consistent interface:** All modules follow a common specification for parameters, outputs, and naming
- **Well-tested:** Every module has automated tests covering deployment and idempotency
- **Versioned:** Semantic versioning ensures safe upgrades
- **Two tiers:**
  - **Resource modules** — wrap a single Azure resource type (e.g., `avm/res/storage/storage-account`)
  - **Pattern modules** — compose multiple resources into common architectures (e.g., a hub-spoke network)

To discover available AVM modules, visit the [AVM Module Index](https://aka.ms/avm/moduleindex).

#### Using an AVM Module

```bicep
// Deploy a Key Vault using the AVM resource module
module keyVault 'br/public:avm/res/key-vault/vault:0.11.0' = {
  name: 'keyVaultDeployment'
  params: {
    name: '${resourcePrefix}-kv'
    location: location
    tags: commonTags
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
  }
}
```

### Bicep Linter

Bicep includes a **built-in linter** that runs automatically during compilation, catching common mistakes and enforcing best practices. Rules include:

| Rule | What it catches |
|------|----------------|
| `no-unused-params` | Parameters declared but never referenced |
| `no-unused-vars` | Variables declared but never referenced |
| `no-hardcoded-env` | Hardcoded Azure environment URLs (e.g., `management.azure.com`) |
| `prefer-interpolation` | Using `concat()` instead of string interpolation |
| `secure-parameter-default` | Default values on `@secure()` parameters |
| `use-resource-id-functions` | Manually constructing resource IDs instead of using `.id` |
| `explicit-values-for-loc-params` | Not passing `location` explicitly to modules |
| `max-outputs` / `max-params` | Exceeding recommended limits |

Configure the linter in `bicepconfig.json`:

```json
{
  "analyzers": {
    "core": {
      "rules": {
        "no-unused-params": {
          "level": "error"
        },
        "no-hardcoded-env": {
          "level": "warning"
        },
        "use-resource-id-functions": {
          "level": "error"
        }
      }
    }
  }
}
```

### What-If Deployments

**What-If** lets you preview the changes a deployment would make *before* executing it — similar to `terraform plan`. This is critical for governance because it allows review and approval before any modifications occur.

```bash
# Preview changes at subscription scope
az deployment sub what-if \
  --location eastus \
  --template-file main.bicep \
  --parameters environmentName='production'
```

Output shows changes categorized as:
- **Create** — new resources to be created
- **Delete** — existing resources to be removed
- **Modify** — properties that will change (with before/after values)
- **NoChange** — resources that remain unchanged
- **Ignore** — resources outside the template's scope

### Terraform as an Alternative

While Bicep is Microsoft's recommended IaC language for Azure, **Terraform** (by HashiCorp) remains a popular alternative, especially for organizations that manage multi-cloud environments.

| Consideration | Bicep | Terraform |
|---------------|-------|-----------|
| **Azure support** | Day-zero support for new Azure features | Slight lag behind Azure API updates |
| **Multi-cloud** | Azure only | AWS, GCP, Azure, and 3,000+ providers |
| **State management** | Managed by Azure (no state file) | Requires state file management |
| **Learning curve** | Lower for Azure-focused teams | HCL syntax to learn, but broad community |
| **Module ecosystem** | AVM + Bicep Registry | Terraform Registry |

For Azure-only governance implementations, Bicep is the natural choice. For multi-cloud organizations, Terraform provides a unified workflow.

See: [Terraform on Azure documentation](https://learn.microsoft.com/en-us/azure/developer/terraform/)

---

## Best Practices

1. **Use modules for reusability** — break templates into composable modules; prefer AVM modules for common resource types
2. **Use a Bicep registry** — publish shared modules to an Azure Container Registry for cross-team consumption
3. **Enable the linter** — treat linter warnings as errors in CI pipelines
4. **Always run What-If before production deployments** — integrate What-If into CI/CD approval gates
5. **Use parameter files** — separate configuration from code; use `.bicepparam` files (Bicep-native parameter format)
6. **Tag all resources** — enforce tags via parameters and module interfaces
7. **Pin module versions** — always reference specific versions of registry modules, not `latest`
8. **Secure secrets** — use `@secure()` decorator for parameters; reference Key Vault secrets with `getSecret()`
9. **Use `targetScope`** — explicitly declare the deployment scope (`resourceGroup`, `subscription`, `managementGroup`, `tenant`)
10. **Version your templates** — store Bicep files in source control; use branching and pull requests for changes

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Hardcoding resource names | Naming collisions, inability to deploy to multiple environments | Use parameters and naming conventions |
| Ignoring linter warnings | Subtle bugs and non-idiomatic code reach production | Configure linter rules as errors |
| Not using What-If | Unexpected resource deletions or modifications | Mandate What-If in deployment pipelines |
| Storing secrets in parameter files | Credentials committed to source control | Use Key Vault references and `@secure()` |
| Using `dependsOn` excessively | Slower deployments, unnecessary serialization | Let Bicep infer dependencies via resource references |
| Deploying ARM JSON alongside Bicep | Confusion over which is the source of truth | Standardize on Bicep; decompile legacy ARM JSON |
| Not pinning AVM module versions | Breaking changes from module updates | Always specify a version number |
| Ignoring `targetScope` | Deployment fails at wrong scope | Always declare `targetScope` explicitly |

---

## Code Samples

### Complete Bicep Template: Resource Group with RBAC and Tags

This template deploys at the **subscription scope**, creating a resource group with mandatory tags and assigning the Reader role to a security group.

```bicep
// main.bicep
targetScope = 'subscription'

@description('The Azure region for the resource group.')
param location string = 'eastus'

@description('The environment name (dev, staging, production).')
@allowed(['dev', 'staging', 'production'])
param environmentName string

@description('The object ID of the Microsoft Entra ID group to assign the Reader role.')
param readerGroupObjectId string

@description('Cost center for billing allocation.')
param costCenter string

var rgName = 'rg-governance-${environmentName}'

@description('Deployment date for tagging (auto-populated).')
param createdDate string = utcNow('yyyy-MM-dd')

var commonTags = {
  Environment: environmentName
  CostCenter: costCenter
  ManagedBy: 'Bicep'
  CreatedDate: createdDate
}

// Reader role definition ID (built-in)
var readerRoleDefinitionId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'acdd72a7-3385-48ef-bd42-f606fba81ae7'
)

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: rgName
  location: location
  tags: commonTags
}

module rbacAssignment 'modules/roleAssignment.bicep' = {
  name: 'readerRoleAssignment'
  scope: rg
  params: {
    principalId: readerGroupObjectId
    roleDefinitionId: readerRoleDefinitionId
    principalType: 'Group'
  }
}

output resourceGroupName string = rg.name
output resourceGroupId string = rg.id
```

```bicep
// modules/roleAssignment.bicep
targetScope = 'resourceGroup'

@description('The principal ID to assign the role to.')
param principalId string

@description('The full resource ID of the role definition.')
param roleDefinitionId string

@description('The type of principal (User, Group, ServicePrincipal).')
@allowed(['User', 'Group', 'ServicePrincipal'])
param principalType string

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, roleDefinitionId)
  properties: {
    principalId: principalId
    roleDefinitionId: roleDefinitionId
    principalType: principalType
  }
}
```

Deploy with:

```bash
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environmentName='production' \
               readerGroupObjectId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
               costCenter='IT-GOV-001'
```

### Using an Azure Verified Module

This example deploys an Azure Key Vault using the AVM resource module, with RBAC authorization, network restrictions, and diagnostics enabled:

```bicep
// keyvault-main.bicep
targetScope = 'resourceGroup'

@description('The Azure region for the Key Vault.')
param location string = resourceGroup().location

@description('The environment name.')
param environmentName string = 'dev'

@description('Log Analytics workspace resource ID for diagnostics.')
param logAnalyticsWorkspaceId string

var kvName = 'kv-gov-${environmentName}-${uniqueString(resourceGroup().id)}'

module keyVault 'br/public:avm/res/key-vault/vault:0.11.0' = {
  name: 'keyVaultDeployment'
  params: {
    name: kvName
    location: location
    tags: {
      Environment: environmentName
      ManagedBy: 'Bicep-AVM'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
    diagnosticSettings: [
      {
        workspaceResourceId: logAnalyticsWorkspaceId
        logCategoriesAndGroups: [
          { categoryGroup: 'allLogs' }
        ]
        metricCategories: [
          { category: 'AllMetrics' }
        ]
      }
    ]
  }
}

output keyVaultName string = keyVault.outputs.name
output keyVaultUri string = keyVault.outputs.uri
```

---

## References

- [Bicep documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)
- [Bicep language reference](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/file)
- [Azure Verified Modules (AVM)](https://aka.ms/avm)
- [AVM Module Index](https://aka.ms/avm/moduleindex)
- [Bicep linter rules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter)
- [What-If deployment operation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if)
- [Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules)
- [Bicep parameter files (.bicepparam)](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameter-files)
- [Terraform on Azure](https://learn.microsoft.com/en-us/azure/developer/terraform/)
- [Migrate from ARM JSON to Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/migrate)

---

| Previous | Next |
|:---------|:-----|
| [Governance Suggested Policies](../governance-policies.md) | [Deployment Stacks](ch14-deployment-stacks.md) |
