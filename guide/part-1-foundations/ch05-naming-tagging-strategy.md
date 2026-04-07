# Chapter 5 — Naming and Tagging Strategy

> **Last verified: 2026-04-06**

---

## Overview

Naming conventions and tagging strategies are two of the most impactful governance controls you can implement — and two of the most frequently neglected. Without them, your Azure environment becomes an unmanageable collection of cryptically named resources with no way to determine who owns them, what they cost, or which application they support.

This chapter covers both topics together because they are complementary:

- **Naming conventions** make resources identifiable at a glance.
- **Tags** add structured metadata for cost allocation, automation, compliance, and operations.

Together, they form the **organizational backbone** of your governance strategy.

---

## Architecture: How Naming and Tagging Fit into Governance

![Naming and Tagging Architecture](/images/naming-tagging-architecture.svg)

---

## Part 1 — Naming Conventions

### Why Naming Matters

In a well-governed environment, you should be able to look at a resource name and immediately understand:

- **What type of resource** it is (VM, storage account, key vault)
- **What workload** it belongs to (payments, CRM, data-platform)
- **What environment** it is in (production, staging, development)
- **What region** it is deployed to (westeurope, eastus2)

Without a naming convention, you end up with resources named `myvm1`, `test-storage`, or `prod2-backup-old-DONOT-DELETE` — names that convey no useful information and make governance impossible at scale.

### Recommended Naming Convention Pattern

The Cloud Adoption Framework recommends the following pattern:

```
{resource-type}-{workload}-{environment}-{region}-{instance}
```

**Examples:**

| Resource | Name |
|---|---|
| Resource group | `rg-payments-prod-westeu` |
| Virtual machine | `vm-payments-prod-westeu-001` |
| Storage account | `stpaymentsprodwesteu001` (no hyphens — storage account constraint) |
| Key vault | `kv-payments-prod-westeu` |
| Virtual network | `vnet-payments-prod-westeu` |
| Network security group | `nsg-payments-prod-westeu` |
| App Service | `app-payments-prod-westeu` |
| SQL Database | `sql-payments-prod-westeu` |
| Log Analytics workspace | `log-payments-prod-westeu` |

### Common Azure Resource Abbreviations

Use these standardized abbreviations as the `{resource-type}` prefix. This is a subset of the [full CAF abbreviation list](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations):

| Resource Type | Abbreviation | Example |
|---|---|---|
| Resource group | `rg` | `rg-payments-prod-westeu` |
| Virtual machine | `vm` | `vm-web-prod-eastus2-001` |
| Storage account | `st` | `stwebprodeastus2001` |
| Key vault | `kv` | `kv-web-prod-eastus2` |
| Virtual network | `vnet` | `vnet-hub-prod-westeu` |
| Subnet | `snet` | `snet-app-prod-westeu` |
| Network security group | `nsg` | `nsg-app-prod-westeu` |
| Public IP address | `pip` | `pip-fw-prod-westeu` |
| Load balancer | `lb` | `lb-web-prod-westeu` |
| Application Gateway | `agw` | `agw-web-prod-westeu` |
| Azure Firewall | `afw` | `afw-hub-prod-westeu` |
| App Service / Web App | `app` | `app-api-prod-westeu` |
| Function App | `func` | `func-processor-prod-westeu` |
| Azure SQL Database | `sql` | `sql-orders-prod-westeu` |
| Azure Cosmos DB | `cosmos` | `cosmos-catalog-prod-westeu` |
| Azure Container Registry | `acr` | `acrprodwesteu001` |
| Azure Kubernetes Service | `aks` | `aks-platform-prod-westeu` |
| Log Analytics workspace | `log` | `log-central-prod-westeu` |
| Application Insights | `appi` | `appi-web-prod-westeu` |
| Managed identity | `id` | `id-app-prod-westeu` |
| Azure Policy definition | `policy` | `policy-require-tags` |
| Management group | `mg` | `mg-landingzones` |
| Subscription | `sub` | `sub-payments-prod` |

### Naming Constraints

Azure resources have different naming constraints. Be aware of:

| Resource | Max Length | Allowed Characters | Global Uniqueness |
|---|---|---|---|
| Resource group | 90 | Alphanumeric, hyphen, underscore, period, parenthesis | Unique within subscription |
| Storage account | 24 | Lowercase alphanumeric only (no hyphens) | Globally unique |
| Key vault | 24 | Alphanumeric and hyphens | Globally unique |
| Virtual machine | 64 (Linux), 15 (Windows) | Alphanumeric, hyphen, underscore | Unique within resource group |
| App Service | 60 | Alphanumeric and hyphens | Globally unique |

> **Tip:** For resources that require global uniqueness (storage accounts, key vaults, App Services), append a numeric instance suffix or hash to ensure uniqueness.

### Environment Abbreviations

| Environment | Abbreviation |
|---|---|
| Production | `prod` |
| Staging | `stag` |
| Development | `dev` |
| Test | `test` |
| Sandbox | `sbx` |
| Shared services | `shared` |

### Region Abbreviations

Use short, recognizable abbreviations for Azure regions:

| Region | Abbreviation |
|---|---|
| West Europe | `westeu` |
| North Europe | `northeu` |
| East US | `eastus` |
| East US 2 | `eastus2` |
| West US 2 | `westus2` |
| Southeast Asia | `southeastasia` |
| UK South | `uksouth` |

---

## Part 2 — Tagging Strategy

### Why Tags Matter

Tags are key-value metadata pairs applied to Azure resources and resource groups. They enable:

- **Cost allocation:** Which department or project is responsible for this spend?
- **Automation:** Which resources should be shut down at night? Which should be backed up?
- **Operations:** Who owns this resource? What SLA does it require?
- **Compliance:** Is this resource subject to GDPR? PCI-DSS?
- **Lifecycle management:** When was this resource created? When should it be reviewed?

Tags are applied to **resources and resource groups**, but tags on a resource group are **not** automatically inherited by the resources within it. Use Azure Policy to propagate tags from resource groups to resources (see code sample below).

### Recommended Minimum Tag Taxonomy

Every organization should define a **minimum set of required tags**. Start with these and expand as needs mature:

| Tag Name | Purpose | Example Value | Required? |
|---|---|---|---|
| `Environment` | Identifies the deployment environment | `prod`, `dev`, `test`, `stag` | ✅ Yes |
| `Owner` | Contact for the resource (email or team name) | `payments-team@contoso.com` | ✅ Yes |
| `CostCenter` | Maps spending to a financial cost center | `CC-4521` | ✅ Yes |
| `Application` | Identifies the workload or application name | `payments-api` | ✅ Yes |
| `CreatedBy` | How the resource was created | `bicep-pipeline`, `manual`, `terraform` | ✅ Yes |
| `CreatedDate` | Date the resource was created (ISO 8601) | `2026-04-06` | 🟡 Recommended |
| `Criticality` | Business criticality level | `high`, `medium`, `low` | 🟡 Recommended |
| `DataClassification` | Sensitivity of data stored | `public`, `internal`, `confidential` | 🟡 Recommended |
| `ExpirationDate` | When the resource should be reviewed or decommissioned | `2026-12-31` | 🟡 Recommended |
| `AutoShutdown` | Whether the resource should be stopped after hours | `true`, `false` | 🟡 Recommended |

### Tag Limits

- Maximum **50 tags** per resource or resource group.
- Tag name: maximum **512 characters** (128 for storage accounts).
- Tag value: maximum **256 characters**.
- Tag names are **case-insensitive** for operations but **case-preserving** in storage.

---

## How It Works: Enforcement via Azure Policy

Naming conventions and tags are only useful if they are **enforced**. Azure Policy is the primary enforcement mechanism.

### Policy Enforcement Modes

| Effect | Behavior |
|---|---|
| `deny` | Prevents resource creation if the condition is met (e.g., missing required tag) |
| `audit` | Allows creation but flags non-compliance in the compliance dashboard |
| `modify` | Automatically adds or corrects tag values during deployment |
| `append` | Adds a tag if it does not exist (legacy — prefer `modify`) |

---

## Best Practices

1. **Define naming and tagging standards before your first deployment.** Retroactive enforcement is painful — it is much easier to start right than to fix later.
2. **Use Azure Policy `deny` for critical tags.** Environment, Owner, and CostCenter should be required on every resource group.
3. **Use Azure Policy `modify` to inherit tags.** Automatically copy tags from resource groups to resources to reduce tagging burden on developers.
4. **Document your conventions in a central, accessible location.** A governance wiki or README in your IaC repository is ideal.
5. **Validate naming conventions in CI/CD.** Catch naming violations in pull request checks before deployment.
6. **Review and update your tag taxonomy annually.** As your organization matures, your tagging needs will evolve.
7. **Use tags for automation.** Shut down non-production VMs at night, identify resources for backup policies, or flag resources for decommissioning.

---

## Common Pitfalls

| Pitfall | Why It Hurts | What to Do Instead |
|---|---|---|
| No naming convention | Resources are unidentifiable; automation and querying fail | Define and enforce a convention before deployment |
| Too many required tags | Developers resist governance and find workarounds | Start with 4–5 required tags; expand gradually |
| Assuming resource group tags are inherited | Resources end up untagged; cost allocation breaks | Use Azure Policy to propagate tags |
| Inconsistent tag casing | `Environment` vs `environment` vs `ENVIRONMENT` creates chaos | Standardize on a single casing convention (PascalCase is common) |
| Tags with no governance owner | Tag values drift; "owner" tags point to people who left the company | Assign a governance team to review tag compliance quarterly |
| Naming convention is too long | Hits character limits on storage accounts, VMs | Use standard abbreviations; keep names concise |

---

## Code Samples

### Azure Policy — Require a Tag on Resource Groups

This policy **denies** the creation of a resource group if the specified tag is missing:

```json
{
  "properties": {
    "displayName": "Require a tag on resource groups",
    "description": "Enforces existence of a tag on resource groups.",
    "policyType": "Custom",
    "mode": "All",
    "parameters": {
      "tagName": {
        "type": "String",
        "metadata": {
          "displayName": "Tag Name",
          "description": "Name of the tag, such as 'Environment'"
        }
      }
    },
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Resources/subscriptions/resourceGroups"
          },
          {
            "field": "[concat('tags[', parameters('tagName'), ']')]",
            "exists": "false"
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

**Deploy with Azure CLI:**

```bash
# Create the policy definition
az policy definition create \
  --name "require-tag-on-rg" \
  --display-name "Require a tag on resource groups" \
  --rules '<paste policyRule JSON>' \
  --params '<paste parameters JSON>' \
  --mode All

# Assign it to require the "CostCenter" tag
az policy assignment create \
  --name "require-costcenter-tag" \
  --display-name "Require CostCenter tag on resource groups" \
  --policy "require-tag-on-rg" \
  --params '{"tagName": {"value": "CostCenter"}}' \
  --scope "/subscriptions/<subscription-id>"
```

### Azure Policy — Inherit a Tag from Resource Group

This policy uses the `modify` effect to automatically copy a tag from the resource group to resources that are missing it:

```json
{
  "properties": {
    "displayName": "Inherit a tag from the resource group",
    "description": "Adds the specified tag from the parent resource group when creating or updating any resource missing this tag.",
    "policyType": "Custom",
    "mode": "Indexed",
    "parameters": {
      "tagName": {
        "type": "String",
        "metadata": {
          "displayName": "Tag Name",
          "description": "Name of the tag to inherit, such as 'CostCenter'"
        }
      }
    },
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "[concat('tags[', parameters('tagName'), ']')]",
            "notEquals": "[resourceGroup().tags[parameters('tagName')]]"
          },
          {
            "value": "[resourceGroup().tags[parameters('tagName')]]",
            "notEquals": ""
          }
        ]
      },
      "then": {
        "effect": "modify",
        "details": {
          "roleDefinitionIds": [
            "/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
          ],
          "operations": [
            {
              "operation": "addOrReplace",
              "field": "[concat('tags[', parameters('tagName'), ']')]",
              "value": "[resourceGroup().tags[parameters('tagName')]]"
            }
          ]
        }
      }
    }
  }
}
```

### Azure Policy — Enforce Naming Convention (Pattern Match)

This policy denies resources whose names do not match a specified pattern. Uses the `like` condition with `*` as a multi-character wildcard to enforce the pattern `vm-{workload}-{environment}-{region}-{instance}`:

```json
{
  "properties": {
    "displayName": "Enforce VM naming convention",
    "description": "Denies VMs that do not follow the naming pattern vm-{workload}-{environment}-{region}-{instance}.",
    "policyType": "Custom",
    "mode": "Indexed",
    "parameters": {},
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Compute/virtualMachines"
          },
          {
            "not": {
              "field": "name",
              "like": "vm-*-*-*-*"
            }
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

> **Note:** The `match` condition uses `?` for a single letter, `#` for a single digit, and `.` for any single character. For variable-length patterns, use `like` with `*` wildcards (as shown above) or validate naming in CI/CD pipelines before deployment.

### Bicep — Deploy a Resource Group with Full Tagging

```bicep
targetScope = 'subscription'

param location string = 'westeurope'
param workload string = 'payments'
param environment string = 'prod'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${workload}-${environment}-${location}'
  location: location
  tags: {
    Environment: environment
    Owner: 'payments-team@contoso.com'
    CostCenter: 'CC-4521'
    Application: workload
    CreatedBy: 'bicep-pipeline'
    CreatedDate: '2026-04-06'
    Criticality: 'high'
    DataClassification: 'confidential'
  }
}
```

### Azure Resource Graph — Find Resources Missing Required Tags

```kusto
resources
| where isnull(tags.Environment) or isnull(tags.Owner) or isnull(tags.CostCenter)
| project name, type, resourceGroup, subscriptionId,
    missingEnvironment = isnull(tags.Environment),
    missingOwner = isnull(tags.Owner),
    missingCostCenter = isnull(tags.CostCenter)
| order by type asc
```

---

## Hands-On Exercise

**Scenario:** You are defining the naming and tagging standards for a greenfield Azure deployment.

1. **Define a naming convention** for your organization using the `{resource-type}-{workload}-{environment}-{region}-{instance}` pattern. Write out 5 example resource names.
2. **Define your minimum required tag taxonomy.** Choose 4–6 tags from the recommended table above (or define your own).
3. **Create an Azure Policy** (JSON or Bicep) that denies the creation of resource groups without your most critical tag (e.g., `CostCenter`).
4. **Create an Azure Policy** that inherits the `Environment` tag from resource groups to child resources using the `modify` effect.
5. **Deploy both policies** to a test subscription and verify they work:
   - Try creating a resource group without the required tag (should be denied).
   - Create a resource group with the `Environment` tag, then create a resource inside it — verify the tag is inherited.
6. **Run the Resource Graph query** above to find resources in your environment that are missing required tags.

---

## References

| Resource | Link |
|---|---|
| CAF naming conventions | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming) |
| CAF resource abbreviations | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) |
| CAF tagging strategy | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging) |
| CAF tagging best practices | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging) |
| Azure Policy built-in definitions for tags | [learn.microsoft.com/azure/governance/policy/samples/built-in-policies#tags](https://learn.microsoft.com/azure/governance/policy/samples/built-in-policies#tags) |
| Azure naming rules and restrictions | [learn.microsoft.com/azure/azure-resource-manager/management/resource-name-rules](https://learn.microsoft.com/azure/azure-resource-manager/management/resource-name-rules) |
| Policy rule definition structure | [learn.microsoft.com/azure/governance/policy/concepts/definition-structure-policy-rule](https://learn.microsoft.com/azure/governance/policy/concepts/definition-structure-policy-rule) |

---

| Previous | Next |
|:---|:---|
| [Chapter 4 — Resource Hierarchy](ch04-resource-hierarchy.md) | [Part 2 — Identity and Access](../part-2-identity-access/ch06-rbac.md) |
