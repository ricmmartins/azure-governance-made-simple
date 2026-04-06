# Appendix D — Resource Graph Queries

> Last verified: 2026-04-06

---

The top 20 governance queries for Azure Resource Graph. These queries can be run in the Azure Portal (Resource Graph Explorer), Azure CLI, Azure PowerShell, or programmatically via the REST API.

> **Tip:** Bookmark the [Azure Resource Graph Explorer](https://portal.azure.com/#blade/HubsExtension/ArgQueryBlade) in the Azure Portal for quick access.

---

## Resource Inventory (Queries 1–5)

### 1. All Resources — Complete Inventory

List every resource across all subscriptions with key metadata.

```kusto
resources
| project name, type, location, resourceGroup, subscriptionId, tags
| order by type asc, name asc
```

---

### 2. Resource Count by Type

Understand the composition of your Azure environment.

```kusto
resources
| summarize Count = count() by type
| order by Count desc
```

---

### 3. Resource Count by Region

Identify how resources are distributed geographically.

```kusto
resources
| summarize Count = count() by location
| order by Count desc
```

---

### 4. Resources by Tag

Find all resources with a specific tag value (e.g., Environment=Production).

```kusto
resources
| where tags['Environment'] == 'Production'
| project name, type, location, resourceGroup, subscriptionId
| order by type asc, name asc
```

---

### 5. Resource Count by Subscription

See how resources are distributed across subscriptions.

```kusto
resources
| summarize Count = count() by subscriptionId
| join kind=leftouter (
    resourcecontainers
    | where type == "microsoft.resources/subscriptions"
    | project subscriptionId, subscriptionName = name
) on subscriptionId
| project subscriptionName, subscriptionId, Count
| order by Count desc
```

---

## Compliance (Queries 6–10)

### 6. Non-Compliant Resources (Policy)

List all resources that are non-compliant with Azure Policy.

```kusto
policyresources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| extend policyName = tostring(properties.policyDefinitionName),
         resourceId = tostring(properties.resourceId),
         policyEffect = tostring(properties.policyDefinitionAction)
| project resourceId, policyName, policyEffect
| order by policyName asc
```

---

### 7. Policy Assignment Summary

List all policy assignments with their scope and enforcement mode.

```kusto
policyresources
| where type == "microsoft.authorization/policyassignments"
| extend displayName = properties.displayName,
         enforcementMode = properties.enforcementMode,
         scope = properties.scope
| project name, displayName, enforcementMode, scope
| order by displayName asc
```

---

### 8. Untagged Resources

Find resources that are missing critical governance tags.

```kusto
resources
| where isnull(tags) or tags == '{}'
| project name, type, location, resourceGroup, subscriptionId
| order by type asc, name asc
```

To check for a specific missing tag:

```kusto
resources
| where isempty(tags['Environment'])
| project name, type, location, resourceGroup, subscriptionId
| order by type asc, name asc
```

---

### 9. Resources Without Resource Locks

Identify resources that have no locks applied. Locks do not expose a `properties.resourceId` field; instead, the locked resource's scope is derived by truncating the lock's own resource ID at `/providers/Microsoft.Authorization/locks/`.

```kusto
resources
| where type !~ 'microsoft.authorization/locks'
| project resourceId = tolower(id), name, type, resourceGroup, subscriptionId
| join kind=leftanti (
    resources
    | where type =~ 'microsoft.authorization/locks'
    | extend lockScope = tolower(substring(id, 0, indexof(id, '/providers/Microsoft.Authorization/locks/')))
    | project lockScope
) on $left.resourceId == $right.lockScope
| order by type asc
```

Alternative — list resource groups without locks:

```kusto
resourcecontainers
| where type == "microsoft.resources/subscriptions/resourcegroups"
| join kind=leftouter (
    resources
    | where type == "microsoft.authorization/locks"
    | project resourceGroup, lockName = name
) on resourceGroup
| where isempty(lockName)
| project name, subscriptionId, location
| order by name asc
```

---

### 10. Orphaned Resources

Find potentially orphaned resources (unattached disks, unused public IPs, empty NICs).

```kusto
// Unattached managed disks
resources
| where type == "microsoft.compute/disks"
| where properties.diskState == "Unattached"
| project name, resourceGroup, subscriptionId, diskSizeGb = properties.diskSizeGB,
    sku = sku.name, location
| order by tolong(diskSizeGb) desc
```

```kusto
// Unused public IP addresses
resources
| where type == "microsoft.network/publicipaddresses"
| where isnull(properties.ipConfiguration)
| project name, resourceGroup, subscriptionId, location,
    ipAddress = properties.ipAddress
```

```kusto
// Network interfaces not attached to any VM
resources
| where type == "microsoft.network/networkinterfaces"
| where isnull(properties.virtualMachine)
| project name, resourceGroup, subscriptionId, location
```

---

## Identity (Queries 11–15)

### 11. RBAC Role Assignments

List all role assignments across subscriptions.

```kusto
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend principalId = tostring(properties.principalId),
         roleDefinitionId = tostring(properties.roleDefinitionId),
         principalType = tostring(properties.principalType),
         scope = tostring(properties.scope)
| project principalId, principalType, roleDefinitionId, scope
| order by principalType asc
```

---

### 12. Service Principals with Role Assignments

Identify service principals that have Azure role assignments.

```kusto
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| where properties.principalType == "ServicePrincipal"
| extend principalId = tostring(properties.principalId),
         roleDefinitionId = tostring(properties.roleDefinitionId),
         scope = tostring(properties.scope)
| project principalId, roleDefinitionId, scope
| order by principalId asc
```

---

### 13. Managed Identities in Use

List all managed identities (system-assigned and user-assigned) across resources.

```kusto
resources
| where isnotnull(identity)
| extend identityType = tostring(identity.type)
| project name, type, identityType, resourceGroup, subscriptionId
| order by identityType asc, type asc
```

---

### 14. Resources with System-Assigned Managed Identity

Find resources using system-assigned managed identities.

```kusto
resources
| where identity.type has "SystemAssigned"
| extend principalId = tostring(identity.principalId)
| project name, type, principalId, resourceGroup, subscriptionId
| order by type asc
```

---

### 15. User-Assigned Managed Identity Usage

List user-assigned managed identities and the resources they are assigned to.

```kusto
resources
| where identity.type has "UserAssigned"
| mv-expand userIdentity = identity.userAssignedIdentities
| project name, type, resourceGroup, subscriptionId
| order by type asc
```

---

## Cost & Operations (Queries 16–20)

### 16. Resource Count Over Time (Snapshot)

Count total resources per subscription (use as a baseline for trending).

```kusto
resources
| summarize ResourceCount = count() by subscriptionId
| join kind=leftouter (
    resourcecontainers
    | where type == "microsoft.resources/subscriptions"
    | project subscriptionId, subscriptionName = name
) on subscriptionId
| project subscriptionName, ResourceCount
| order by ResourceCount desc
```

> **Note:** Resource Graph provides a point-in-time snapshot. For historical trending, export this query's results on a schedule (e.g., daily via Azure Automation or Logic Apps) and store in Log Analytics.

---

### 17. Recent Resource Changes (Change Analysis)

Query recent changes using the Resource Graph change tracking.

```kusto
resourcechanges
| extend changeTime = todatetime(properties.changeAttributes.timestamp),
         changeType = tostring(properties.changeType),
         targetResourceId = tostring(properties.targetResourceId),
         targetResourceType = tostring(properties.targetResourceType)
| where changeTime > ago(24h)
| project changeTime, changeType, targetResourceType, targetResourceId
| order by changeTime desc
| take 100
```

---

### 18. Azure Advisor Recommendations

List active Advisor recommendations across subscriptions.

```kusto
advisorresources
| where type == "microsoft.advisor/recommendations"
| extend category = tostring(properties.category),
         impact = tostring(properties.impact),
         recommendation = tostring(properties.shortDescription.solution)
| project category, impact, recommendation, resourceGroup, subscriptionId
| order by category asc, impact desc
```

---

### 19. Resource Health Status

Check the health status of Azure resources.

```kusto
healthresources
| where type == "microsoft.resourcehealth/availabilitystatuses"
| extend availabilityState = tostring(properties.availabilityState),
         reasonType = tostring(properties.reasonType),
         resourceId = tostring(properties.targetResourceId)
| project resourceId, availabilityState, reasonType
| where availabilityState != "Available"
| order by availabilityState asc
```

---

### 20. Management Group Hierarchy

Visualize the entire management group structure.

```kusto
resourcecontainers
| where type == "microsoft.management/managementgroups"
| extend parentId = tostring(properties.details.parent.id),
         displayName = tostring(properties.displayName)
| project id, name, displayName, parentId
| order by id asc
```

---

## Running Resource Graph Queries

### Azure CLI

```bash
az graph query -q "resources | summarize count() by type | order by count_ desc" --first 20
```

### Azure PowerShell

```powershell
Search-AzGraph -Query "resources | summarize count() by type | order by count_ desc" -First 20
```

### Bicep (Deployment Script)

For scheduled queries, use Azure Automation Runbooks or Logic Apps with the Resource Graph REST API:

```
POST https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01
{
  "query": "resources | summarize count() by type | order by count_ desc"
}
```

---

| Previous | Next |
|:---|:---|
| [Appendix C — Policy Starter Kit](appendix-c-policy-starter-kit.md) | [Appendix E — Learning Resources](appendix-e-learning-resources.md) |
