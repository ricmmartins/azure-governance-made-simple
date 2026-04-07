# Chapter 21 — Azure Resource Graph

> Last verified: 2026-04-06

---

## Overview

**Azure Resource Graph** is a query engine that lets you explore your Azure resources at scale — across subscriptions and management groups — with near-instant results. Unlike the Azure Portal's resource list (which queries each resource provider individually), Resource Graph maintains a pre-indexed cache of resource metadata, enabling complex queries to return in seconds.

For governance teams, Resource Graph is indispensable:

- **Inventory management** — know exactly what's deployed across all subscriptions
- **Tag compliance** — find resources that don't meet tagging standards
- **Orphan detection** — identify unused resources consuming budget
- **Policy compliance** — query policy state across the organization
- **RBAC auditing** — explore role assignments across scopes
- **Security posture** — find misconfigured resources before attackers do

Resource Graph uses the **Kusto Query Language (KQL)** — the same language used by Log Analytics, Microsoft Sentinel, and Azure Data Explorer.

---

## How It Works

### Architecture

Resource Graph indexes data from Azure Resource Manager (ARM) and various resource providers. When you submit a query, it runs against this pre-built index rather than calling individual resource providers:

![Resource Graph Query Engine](/images/resource-graph-engine.svg)

### Resource Graph Tables

| Table | Content |
|-------|---------|
| `Resources` | All Azure resources (VMs, storage, networking, etc.) |
| `ResourceContainers` | Subscriptions, resource groups, management groups |
| `AdvisorResources` | Azure Advisor recommendations |
| `AlertsManagementResources` | Azure Monitor alert instances |
| `ExtendedLocationResources` | Azure Arc-enabled resources |
| `GuestConfigurationResources` | Guest configuration (machine configuration) assignments |
| `HealthResources` | Resource health status |
| `IoTSecurityResources` | IoT security recommendations |
| `KubernetesConfigurationResources` | Azure Arc-enabled Kubernetes configurations |
| `PatchAssessmentResources` | OS patch assessment results |
| `PolicyResources` | Azure Policy compliance state |
| `SecurityResources` | Microsoft Defender for Cloud data |
| `ServiceHealthResources` | Azure service health events |

### Resource Graph Explorer

The **Resource Graph Explorer** is the Azure Portal's built-in query interface. Access it at: **Portal → Azure Resource Graph Explorer** or navigate to `portal.azure.com/#view/HubsExtension/ArgQueryBlade`.

Features:
- Interactive KQL editor with IntelliSense
- Schema browser for all available tables and columns
- Save and share queries
- Export results to CSV
- Pin results to dashboards
- Scope queries to specific subscriptions or management groups

### Programmatic Access

#### Azure CLI

```bash
# Run a Resource Graph query
az graph query -q "Resources | summarize count() by type | order by count_ desc | take 10"

# Query with subscription scope
az graph query -q "Resources | where tags.Environment == 'production'" \
  --subscriptions "sub-id-1" "sub-id-2"

# Output as table
az graph query -q "Resources | where type == 'microsoft.compute/virtualmachines'" --output table
```

#### Azure PowerShell

```powershell
# Install the module (if not already installed)
Install-Module -Name Az.ResourceGraph

# Run a query
Search-AzGraph -Query "Resources | summarize count() by type | order by count_ desc | take 10"

# Query across all management group subscriptions
Search-AzGraph -Query "Resources | where tags.Environment == 'production'" -ManagementGroup "mg-root"
```

#### REST API

```bash
# POST to the Resource Graph API
az rest --method post \
  --uri "https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01" \
  --body '{
    "query": "Resources | summarize count() by type | order by count_ desc | take 10",
    "subscriptions": ["subscription-id-1"]
  }'
```

---

## Top 20 Governance Queries

*For the complete query reference with full explanations, see [Appendix D — Top 20 Resource Graph Governance Queries](../appendices/appendix-d-resource-graph-queries.md).*

### 1. Find All Resources Without Tags

```kql
Resources
| where isnull(tags) or tags == "{}"
| project name, type, resourceGroup, subscriptionId, location
| order by type asc
```

### 2. List Non-Compliant Resources

```kql
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| project
    resourceId = tostring(properties.resourceId),
    policyDefinitionName = tostring(properties.policyDefinitionName),
    policyAssignmentName = tostring(properties.policyAssignmentName),
    complianceState = tostring(properties.complianceState)
| order by policyDefinitionName asc
```

### 3. Inventory Resources by Region

```kql
Resources
| summarize ResourceCount = count() by location
| order by ResourceCount desc
```

### 4. Find Orphaned Resources (Unattached Disks)

```kql
Resources
| where type == "microsoft.compute/disks"
| where properties.diskState == "Unattached"
| project name, resourceGroup, subscriptionId, location,
    diskSizeGB = tostring(properties.diskSizeGB),
    sku = tostring(sku.name)
| order by diskSizeGB desc
```

### 5. Query RBAC Assignments Across Subscriptions

```kql
AuthorizationResources
| where type == "microsoft.authorization/roleassignments"
| extend
    principalId = tostring(properties.principalId),
    roleDefinitionId = tostring(properties.roleDefinitionId),
    scope = tostring(properties.scope),
    principalType = tostring(properties.principalType)
| project principalId, roleDefinitionId, scope, principalType
| order by scope asc
```

### 6. Count Resources by Type

```kql
Resources
| summarize Count = count() by type
| order by Count desc
| take 20
```

### 7. Find Resources by Tag Value

```kql
Resources
| where tags.Environment == "production"
| project name, type, resourceGroup, subscriptionId, location
| order by type asc
```

### 8. List VMs by Size/SKU

```kql
Resources
| where type == "microsoft.compute/virtualmachines"
| project
    name,
    resourceGroup,
    location,
    vmSize = tostring(properties.hardwareProfile.vmSize),
    osType = tostring(properties.storageProfile.osDisk.osType),
    powerState = tostring(properties.extended.instanceView.powerState.displayStatus)
| order by vmSize asc
```

### 9. Find Resources Without Locks

```kql
resources
| project id, name, type, resourceGroup, subscriptionId
| join kind=leftanti (
    resources
    | where type =~ 'microsoft.authorization/locks'
    | extend lockScope = tolower(substring(id, 0, indexof(id, '/providers/Microsoft.Authorization/locks/')))
    | project lockScope
) on $left.id == $right.lockScope
| where type !in~ ('microsoft.authorization/locks', 'microsoft.authorization/roleassignments')
| project name, type, resourceGroup, subscriptionId
| take 100
```

### 10. Query Policy Compliance State

```kql
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| extend
    complianceState = tostring(properties.complianceState),
    policyDefinitionName = tostring(properties.policyDefinitionName)
| summarize
    Compliant = countif(complianceState == "Compliant"),
    NonCompliant = countif(complianceState == "NonCompliant"),
    Exempt = countif(complianceState == "Exempt")
    by policyDefinitionName
| order by NonCompliant desc
```

### 11. Find Public IP Addresses Not Attached to Any Resource

```kql
Resources
| where type == "microsoft.network/publicipaddresses"
| where isnull(properties.ipConfiguration) and isnull(properties.natGateway)
| project name, resourceGroup, subscriptionId, location,
    ipAddress = tostring(properties.ipAddress),
    sku = tostring(sku.name)
```

### 12. List Network Security Groups with "Allow All" Inbound Rules

```kql
Resources
| where type == "microsoft.network/networksecuritygroups"
| mv-expand rule = properties.securityRules
| where tostring(rule.properties.direction) == "Inbound"
    and tostring(rule.properties.access) == "Allow"
    and tostring(rule.properties.sourceAddressPrefix) == "*"
    and tostring(rule.properties.destinationPortRange) == "*"
| project name, resourceGroup, subscriptionId, ruleName = tostring(rule.name)
```

### 13. Find Storage Accounts Allowing Public Blob Access

```kql
Resources
| where type == "microsoft.storage/storageaccounts"
| where properties.allowBlobPublicAccess == true
| project name, resourceGroup, subscriptionId, location
```

### 14. List Subscriptions in Each Management Group

```kql
ResourceContainers
| where type == "microsoft.resources/subscriptions"
| extend mgParent = tostring(properties.managementGroupAncestorsChain[0].displayName)
| project subscriptionId, name, mgParent, state = tostring(properties.state)
| order by mgParent asc
```

### 15. Find Resources Missing a Specific Required Tag

```kql
Resources
| where isnull(tags.CostCenter) or isempty(tags.CostCenter)
| summarize Count = count() by type
| order by Count desc
```

### 16. Identify Unused Network Interfaces

```kql
Resources
| where type == "microsoft.network/networkinterfaces"
| where isnull(properties.virtualMachine)
| project name, resourceGroup, subscriptionId, location
```

### 17. List Key Vaults Without Soft Delete Enabled

```kql
Resources
| where type == "microsoft.keyvault/vaults"
| where properties.enableSoftDelete != true
| project name, resourceGroup, subscriptionId, location
```

### 18. Find SQL Databases Without Transparent Data Encryption

Transparent Data Encryption (TDE) is exposed as a child resource (`microsoft.sql/servers/databases/transparentdataencryption`), not as an inline property on the database resource itself.

```kql
resources
| where type =~ 'microsoft.sql/servers/databases/transparentdataencryption'
| where properties.state =~ 'disabled'
| project databaseId = tolower(substring(id, 0, indexof(id, '/transparentDataEncryption'))), state = properties.state
```

### 19. Resource Count by Subscription

```kql
Resources
| summarize Count = count() by subscriptionId
| join kind=inner (
    ResourceContainers
    | where type == "microsoft.resources/subscriptions"
    | project subscriptionId, subscriptionName = name
) on subscriptionId
| project subscriptionName, Count
| order by Count desc
```

### 20. Tag Compliance Summary (Percentage of Resources Tagged)

```kql
Resources
| extend hasRequiredTags = isnotnull(tags.CostCenter) and isnotnull(tags.Environment)
| summarize
    Total = count(),
    Tagged = countif(hasRequiredTags),
    Untagged = countif(not(hasRequiredTags))
| extend CompliancePercent = round(100.0 * Tagged / Total, 1)
```

---

## Integration with Azure Workbooks

Resource Graph queries can be embedded directly in **Azure Workbooks** to create governance dashboards:

```json
{
  "type": "Resource Graph",
  "query": "Resources | summarize count() by type | order by count_ desc | take 10",
  "visualization": "barchart"
}
```

Common Workbook patterns:

- **Parameter-driven queries** — let users select a subscription or management group scope
- **Combined views** — show Resource Graph data alongside Log Analytics data
- **Drilldowns** — click a bar in a chart to see detailed resources
- **Scheduled refresh** — Workbooks refresh on view; pin to dashboards for scheduled updates

---

## Best Practices

1. **Use Resource Graph for inventory, not monitoring** — it shows current state, not historical trends (use Log Analytics for history)
2. **Scope queries appropriately** — avoid scanning all subscriptions unless necessary; scope to management groups or specific subscriptions
3. **Save and share queries** — use Resource Graph Explorer's save feature to build a team query library
4. **Combine with Workbooks** — embed Resource Graph queries in governance Workbooks for executive dashboards
5. **Automate with CLI/PowerShell** — schedule governance queries as part of CI/CD or cron jobs
6. **Use `join` for enrichment** — join the `Resources` table with `PolicyResources`, `AuthorizationResources`, and `ResourceContainers` for richer results
7. **Monitor for orphaned resources regularly** — run orphan detection queries weekly and report findings to resource owners
8. **Export large result sets** — for datasets exceeding portal limits, use the CLI with `--first 1000` or paginate via REST API
9. **Pin queries to dashboards** — share governance metrics with leadership via Azure Portal dashboards
10. **Use `mv-expand` for arrays** — many resource properties are arrays (e.g., NSG rules, tags); use `mv-expand` to flatten and analyze

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Assuming real-time data | Resource Graph has near-real-time indexing (seconds to minutes delay) | Don't use for real-time monitoring; use Activity Log alerts instead |
| Not scoping queries | Slow queries; unnecessary data retrieval | Always scope to relevant subscriptions or management groups |
| Ignoring pagination | Results truncated at 1,000 rows | Use `$skipToken` for REST API or `--first` and `--skip` for CLI |
| Complex joins without filters | Timeouts or throttling | Filter each side of the join before joining |
| Not leveraging `PolicyResources` table | Writing custom queries for data that's already in Policy state | Query `PolicyResources` directly for compliance data |
| Hardcoding subscription IDs | Queries break when subscriptions change | Use management group scoping or dynamic subscription lists |

---

## References

- [Azure Resource Graph overview](https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview)
- [Resource Graph query language (KQL)](https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/query-language)
- [Resource Graph tables and resource types](https://learn.microsoft.com/en-us/azure/governance/resource-graph/reference/supported-tables-resources)
- [Starter queries](https://learn.microsoft.com/en-us/azure/governance/resource-graph/samples/starter)
- [Advanced queries](https://learn.microsoft.com/en-us/azure/governance/resource-graph/samples/advanced)
- [Azure Resource Graph Explorer](https://learn.microsoft.com/en-us/azure/governance/resource-graph/first-query-portal)
- [az graph CLI reference](https://learn.microsoft.com/en-us/cli/azure/graph)
- [Search-AzGraph PowerShell reference](https://learn.microsoft.com/en-us/powershell/module/az.resourcegraph/search-azgraph)
- [Azure Workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview)

---

| Previous | Next |
|:---------|:-----|
| [Azure Monitor](ch20-azure-monitor.md) | [AzGovViz](ch22-azgovviz.md) |
