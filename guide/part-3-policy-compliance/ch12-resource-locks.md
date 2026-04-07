# Chapter 12 — Resource Locks

> Last verified: 2026-04-06

Resource Locks are a simple but powerful governance mechanism that prevents accidental deletion or modification of critical Azure resources. When human error or automation mistakes can cost hours of downtime or data loss, a well-placed lock is your last line of defense.

---

## Overview

Azure Resource Locks allow you to place a restriction on Azure resources that overrides any RBAC permissions a user might have. Even an Owner of a subscription cannot delete a resource that has a **CanNotDelete** lock — they must first remove the lock.

There are two lock types:

| Lock Type | Effect |
|-----------|--------|
| **CanNotDelete** (Delete) | Authorized users can read and modify the resource but cannot delete it. |
| **ReadOnly** | Authorized users can read the resource but cannot modify or delete it. Equivalent to granting all users the Reader role for that resource. |

### Lock Inheritance

When you apply a lock at a parent scope, all resources within that scope inherit the lock. Resources added later also inherit the parent's lock. The most restrictive lock in the inheritance chain takes precedence.

For example, a **ReadOnly** lock on a resource group applies to every resource in that group — even if individual resources do not have their own locks.

---

## How It Works

### Management Plane vs. Data Plane

Resource Manager locks apply only to operations on the **management plane** — that is, operations sent to `https://management.azure.com`. Locks do **not** restrict how resources perform their own data-plane functions.

| Scenario | Locked? |
|----------|---------|
| Deleting an Azure SQL Database | ✅ Blocked by CanNotDelete lock |
| Modifying SQL Database configuration (tier, size) | ✅ Blocked by ReadOnly lock |
| Inserting, updating, or deleting rows in the database | ❌ Not blocked (data-plane operation) |
| Deleting a Storage Account | ✅ Blocked by CanNotDelete lock |
| Uploading or deleting blobs in the storage account | ❌ Not blocked (data-plane operation) |
| Listing storage account keys | ✅ Blocked by ReadOnly lock (POST operation on management plane) |

This distinction is critical: **locks protect the resource itself, not the data inside it.** Data-plane security requires RBAC, network rules, and encryption.

### ReadOnly Lock Gotchas

Applying a **ReadOnly** lock can lead to unexpected results because some operations that appear to be read-only actually require write access on the management plane:

- **Storage account key listing** — A ReadOnly lock on a storage account prevents all users from listing keys, because the list-keys operation is a POST request that returns values available for write operations.

- **App Service deployment** — A ReadOnly lock on an App Service resource prevents the Kudu console and deployment operations from working, because deployment requires write access to the site configuration.

- **Virtual Machine restart** — A ReadOnly lock prevents restarting a VM because the restart operation is a POST action on the management plane.

- **Resource tag updates** — Tags are management-plane properties. A ReadOnly lock prevents any tag modifications, which can break tag-based automation or cost allocation workflows.

---

## Resource Locks vs. Deployment Stack Deny Settings

Azure Deployment Stacks provide an alternative mechanism for protecting resources through **deny settings**. Here is how the two compare:

| Aspect | Resource Locks | Deployment Stack Deny Settings |
|--------|---------------|-------------------------------|
| **Scope** | Any resource, resource group, or subscription | Resources managed by the deployment stack |
| **Granularity** | CanNotDelete or ReadOnly on any resource | DenyDelete, DenyWriteAndDelete on stack-managed resources |
| **Bypass** | Must remove the lock (requires `Microsoft.Authorization/locks/delete` permission) | Configurable exclude principals and exclude actions |
| **Lifecycle** | Independent of deployment — must be managed separately | Tied to the deployment stack lifecycle |
| **Drift protection** | No — locks do not detect or prevent configuration drift | Yes — deny settings prevent out-of-band modifications to stack-managed resources |
| **Cleanup** | Locks remain even if the resource is orphaned from IaC | Stack deletion can automatically clean up managed resources |
| **Use case** | Protect critical shared resources (hub VNet, DNS zones, Key Vaults) | Protect IaC-managed environments from manual changes |
| **Complexity** | Simple — one API call to create a lock | Requires adoption of Deployment Stacks as your deployment model |

**Recommendation:** Use Resource Locks for critical infrastructure resources that must never be deleted regardless of who manages them. Use Deployment Stack deny settings when you want to enforce infrastructure-as-code discipline and prevent drift on deployed environments.

---

## Best Practices

1. **Lock production shared infrastructure** — Apply CanNotDelete locks to resources that are shared across teams and expensive to recreate: hub virtual networks, DNS zones, ExpressRoute circuits, Log Analytics workspaces, Key Vaults.

2. **Use CanNotDelete over ReadOnly** — ReadOnly locks are very restrictive and frequently cause unexpected issues. Prefer CanNotDelete unless you have a specific need to prevent all modifications.

3. **Lock at the resource level, not resource group** — Locking an entire resource group prevents deletion of any resource in the group, which can interfere with normal operations like scaling or updating individual resources.

4. **Automate lock creation** — Include lock creation in your IaC templates (Bicep, Terraform, ARM) so locks are applied consistently and automatically.

5. **Document lock ownership** — Maintain a record of who created each lock and why. This prevents "orphaned locks" where no one remembers why the lock exists or feels authorized to remove it.

6. **Review locks periodically** — Locks on decommissioned resources waste time and cause confusion. Include lock review in your periodic governance audits.

7. **Use Azure Policy to enforce locks** — Create a `DeployIfNotExists` policy that automatically creates CanNotDelete locks on critical resource types (e.g., all Key Vaults, all virtual networks).

---

## Common Pitfalls

1. **Locks blocking auto-scaling** — A CanNotDelete lock on a Virtual Machine Scale Set does not prevent scaling in most cases, but a ReadOnly lock will block scale operations because they modify the resource. A ReadOnly lock on an App Service Plan will prevent scaling the plan up or out.

2. **Locks blocking certificate rotation** — A ReadOnly lock on a Key Vault prevents uploading new certificate versions. If your certificate rotation automation fails silently due to a lock, you may not discover the issue until the certificate expires and your application goes down.

3. **Locks preventing resource group deletion** — A CanNotDelete lock on any resource within a resource group prevents the entire resource group from being deleted. This is by design (deleting a resource group deletes all its resources), but it surprises teams trying to clean up environments.

4. **Locks interfering with CI/CD pipelines** — Deployment pipelines that delete and recreate resources will fail if those resources are locked. Design your pipelines to use incremental deployments rather than delete-and-replace patterns.

5. **Locks not protecting data** — Teams sometimes assume a CanNotDelete lock on a storage account protects the data inside it. It does not — anyone with data-plane access can still delete blobs, tables, or queues.

6. **Forgetting to lock dependent resources** — Locking a database but not its server, or locking a VM but not its OS disk, leaves gaps in protection. Identify all dependent resources and lock them together.

7. **ReadOnly locks breaking diagnostics** — A ReadOnly lock on a resource can prevent Azure Monitor from updating diagnostic settings, which may break log collection silently.

---

## Code Samples

### Azure CLI: Create a CanNotDelete Lock

```bash
# Create a CanNotDelete lock on a resource group
az lock create \
  --name "protect-production" \
  --resource-group "prod-networking-rg" \
  --lock-type CanNotDelete \
  --notes "Protects production networking resources. Contact: platform-team@contoso.com"

# Create a CanNotDelete lock on a specific resource
az lock create \
  --name "protect-keyvault" \
  --resource-group "prod-security-rg" \
  --resource-type "Microsoft.KeyVault/vaults" \
  --resource "prod-keyvault" \
  --lock-type CanNotDelete \
  --notes "Protects production Key Vault. Do not remove without approval."
```

### Azure CLI: Create a ReadOnly Lock

```bash
# Create a ReadOnly lock on a virtual network
az lock create \
  --name "readonly-hub-vnet" \
  --resource-group "prod-networking-rg" \
  --resource-type "Microsoft.Network/virtualNetworks" \
  --resource "hub-vnet" \
  --lock-type ReadOnly \
  --notes "Prevents modification of hub virtual network configuration."
```

### Azure CLI: List and Delete Locks

```bash
# List all locks in a resource group
az lock list --resource-group "prod-networking-rg" --output table

# Delete a lock by name
az lock delete \
  --name "protect-production" \
  --resource-group "prod-networking-rg"
```

### Bicep: Create a CanNotDelete Lock on a Key Vault

```bicep
@description('The name of the Key Vault to protect.')
param keyVaultName string

@description('The location for the Key Vault.')
param location string = resourceGroup().location

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enableSoftDelete: true
    enablePurgeProtection: true
  }
}

resource keyVaultLock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protect-keyvault'
  scope: keyVault
  properties: {
    level: 'CanNotDelete'
    notes: 'Protects production Key Vault from accidental deletion.'
  }
}
```

### Bicep: Create Locks on Multiple Critical Resources

```bicep
@description('The name of the virtual network to protect.')
param vnetName string

@description('The name of the Log Analytics workspace to protect.')
param lawName string

param location string = resourceGroup().location

resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
  }
}

resource vnetLock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protect-vnet'
  scope: vnet
  properties: {
    level: 'CanNotDelete'
    notes: 'Protects hub virtual network from accidental deletion.'
  }
}

resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: lawName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 365
  }
}

resource lawLock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protect-law'
  scope: law
  properties: {
    level: 'CanNotDelete'
    notes: 'Protects Log Analytics workspace from accidental deletion.'
  }
}
```

### Azure Policy: Automatically Deploy Locks on Key Vaults

```json
{
  "properties": {
    "displayName": "Deploy CanNotDelete lock on Key Vaults",
    "description": "Automatically creates a CanNotDelete lock on all Key Vault resources.",
    "policyType": "Custom",
    "mode": "Indexed",
    "policyRule": {
      "if": {
        "field": "type",
        "equals": "Microsoft.KeyVault/vaults"
      },
      "then": {
        "effect": "DeployIfNotExists",
        "details": {
          "type": "Microsoft.Authorization/locks",
          "existenceCondition": {
            "field": "Microsoft.Authorization/locks/level",
            "equals": "CanNotDelete"
          },
          "roleDefinitionIds": [
            "/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
          ],
          "deployment": {
            "properties": {
              "mode": "incremental",
              "template": {
                "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                  "vaultName": { "type": "string" }
                },
                "resources": [
                  {
                    "type": "Microsoft.KeyVault/vaults/providers/locks",
                    "apiVersion": "2020-05-01",
                    "name": "[concat(parameters('vaultName'), '/Microsoft.Authorization/auto-lock')]",
                    "properties": {
                      "level": "CanNotDelete",
                      "notes": "Auto-applied by Azure Policy to protect Key Vaults."
                    }
                  }
                ]
              },
              "parameters": {
                "vaultName": { "value": "[field('name')]" }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## References

- [Lock resources to prevent unexpected changes](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources)
- [Azure Deployment Stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks)
- [Microsoft.Authorization/locks Bicep reference](https://learn.microsoft.com/en-us/azure/templates/microsoft.authorization/locks)
- [az lock CLI reference](https://learn.microsoft.com/en-us/cli/azure/lock)
- [Management plane and data plane](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/control-plane-and-data-plane)

---

Previous | Next
:--- | :---
[Chapter 11 — Microsoft Defender for Cloud](/guide/part-3-policy-compliance/ch11-defender-for-cloud.md) | [Chapter 13 — Bicep & AVM](/guide/part-4-iac-deployment/ch13-bicep-avm.md)
