# Chapter 20 — Azure Monitor for Governance

> Last verified: 2026-04-06

---

## Overview

**Azure Monitor** is the unified observability platform for Azure. While most teams think of it as an application performance monitoring (APM) tool, it's equally powerful for **governance observability** — tracking who did what, when, and whether resources comply with organizational standards.

For governance teams, Azure Monitor provides:

- **Activity Logs** — every control-plane operation (resource creation, deletion, RBAC changes, policy operations)
- **Diagnostic Settings** — configuring what telemetry data is collected and where it's sent
- **Log Analytics** — centralized store for querying governance data with KQL
- **Azure Workbooks** — interactive dashboards for governance reporting
- **Alert Rules** — automated notifications for governance-relevant events

---

## How It Works

### Activity Logs

The **Activity Log** records all control-plane operations in Azure. Every API call that modifies a resource generates an Activity Log entry. For governance, the most relevant categories are:

| Category | What It Captures |
|----------|------------------|
| **Administrative** | Resource create/update/delete operations |
| **Security** | Microsoft Defender for Cloud alerts |
| **Policy** | Policy evaluation results and remediation actions |
| **Recommendation** | Azure Advisor recommendations |

Activity Log entries are retained for **90 days** by default. To retain data longer, configure Diagnostic Settings to send Activity Logs to a Log Analytics workspace, storage account, or Event Hub.

**Key governance events to monitor:**

- RBAC role assignments created or deleted
- Policy assignments created, modified, or deleted
- Resource locks added or removed
- Management group hierarchy changes
- Subscription moved between management groups
- Resource deletions in production subscriptions

### Diagnostic Settings

**Diagnostic Settings** configure where Azure platform logs and metrics are sent. For governance, you need to collect data from multiple sources into a central location:

| Source | Data | Configuration |
|--------|------|---------------|
| **Subscription Activity Log** | All control-plane operations | Subscription-level diagnostic setting |
| **Microsoft Entra ID** | Sign-in logs, audit logs | Entra ID diagnostic setting |
| **Azure resources** | Resource-specific logs and metrics | Per-resource diagnostic setting |
| **Azure Policy** | Policy state changes | Included in Activity Log |

**Recommended destinations:**

| Destination | Use Case |
|-------------|----------|
| **Log Analytics workspace** | Interactive KQL queries, Workbooks, alerts |
| **Storage account** | Long-term retention, compliance archives |
| **Event Hub** | Real-time streaming to SIEM tools (Sentinel, Splunk) |

### Log Analytics Workspace

A **Log Analytics workspace** is the central data store for Azure Monitor Logs. For governance, a dedicated workspace (or a dedicated table within a shared workspace) collects:

- Activity Logs from all subscriptions
- Microsoft Entra ID audit and sign-in logs
- Azure Policy compliance data
- Custom logs from governance automation

**Workspace design for governance:**

| Approach | When to Use |
|----------|-------------|
| **Dedicated governance workspace** | Strict access control; governance team needs isolation |
| **Shared workspace with RBAC** | Cost-efficient; use table-level RBAC to restrict access |
| **Per-subscription workspace** | Regulatory requirement for data residency or isolation |

### Azure Workbooks for Governance Dashboards

**Azure Workbooks** provide interactive reports combining text, KQL queries, metrics, and parameters. They're ideal for governance dashboards because they:

- Require no external tooling
- Support parameters (e.g., select a subscription or time range)
- Can be shared via Azure Portal or exported as ARM/Bicep templates
- Integrate directly with Log Analytics and Azure Resource Graph

**Recommended governance workbooks:**

| Workbook | Content |
|----------|---------|
| **RBAC Overview** | Role assignments by scope, recent changes, PIM activations |
| **Policy Compliance** | Non-compliant resources, compliance trends, remediation status |
| **Resource Inventory** | Resources by type, region, tag compliance, orphaned resources |
| **Cost Governance** | Budget utilization, anomalies, Advisor recommendations |
| **Security Posture** | Secure Score trends, Defender alerts, vulnerability status |

### Alert Rules for Governance Events

Configure **alert rules** to notify governance teams when critical events occur:

| Event | KQL Query Target | Alert Severity |
|-------|-------------------|----------------|
| New Owner role assignment | Activity Log — role assignments | Sev 1 (Critical) |
| Resource lock removed | Activity Log — lock operations | Sev 2 (Warning) |
| Policy assignment deleted | Activity Log — policy operations | Sev 1 (Critical) |
| Resource deleted in production | Activity Log — delete operations | Sev 2 (Warning) |
| Subscription moved | Activity Log — subscription operations | Sev 1 (Critical) |
| Custom role definition modified | Activity Log — role definitions | Sev 2 (Warning) |

---

## Best Practices

1. **Centralize Activity Logs** — send all subscription Activity Logs to a single Log Analytics workspace
2. **Retain data appropriately** — 90 days in Log Analytics for interactive queries; archive to storage for compliance (1–7 years)
3. **Collect Microsoft Entra ID logs** — sign-in and audit logs are essential for governance; configure Entra ID diagnostic settings
4. **Create governance-specific alert rules** — alert on RBAC changes, policy deletions, and resource lock removals
5. **Build Workbooks, not one-off queries** — reusable Workbooks provide consistent reporting across the team
6. **Use action groups for alerts** — route governance alerts to on-call channels, not just email
7. **Apply workspace RBAC** — restrict who can query sensitive governance data
8. **Tag your monitoring resources** — the governance workspace and alerts should be tagged and budgeted
9. **Review alerts regularly** — tune alert rules to reduce noise and ensure signal
10. **Integrate with Microsoft Sentinel** — for advanced threat detection and investigation of governance violations

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Not collecting Activity Logs centrally | No visibility into cross-subscription operations | Configure diagnostic settings on every subscription |
| Default 90-day retention only | Historical governance data lost | Archive to storage account for long-term retention |
| Alert fatigue | Critical alerts ignored | Tune alert rules; use severity levels; route to appropriate channels |
| No Entra ID logs | Cannot correlate sign-ins with governance events | Configure Entra ID diagnostic settings |
| Workspace sprawl | Data scattered across many workspaces | Consolidate into one or few governance workspaces |
| No RBAC on workspace | Sensitive governance data accessible to all | Apply table-level or workspace-level RBAC |

---

## Code Samples

### KQL: Tracking RBAC Role Assignments

```kql
// All RBAC role assignment changes in the last 7 days
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue has "Microsoft.Authorization/roleAssignments"
| where ActivityStatusValue == "Success"
| project
    TimeGenerated,
    Caller,
    OperationNameValue,
    ResourceGroup,
    SubscriptionId,
    Properties = parse_json(Properties)
| extend
    RoleDefinitionId = tostring(Properties.requestbody)
| order by TimeGenerated desc
```

```kql
// New Owner or Contributor role assignments (high-privilege)
AzureActivity
| where TimeGenerated > ago(30d)
| where OperationNameValue == "Microsoft.Authorization/roleAssignments/write"
| where ActivityStatusValue == "Success"
| extend Props = parse_json(Properties)
| extend RequestBody = parse_json(tostring(Props.requestbody))
| extend RoleDefinitionId = tostring(RequestBody.properties.roleDefinitionId)
| where RoleDefinitionId has "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"  // Owner
    or RoleDefinitionId has "b24988ac-6180-42a0-ab88-20f7382dd24c"    // Contributor
| project
    TimeGenerated,
    Caller,
    RoleDefinitionId,
    Scope = tostring(RequestBody.properties.scope),
    PrincipalId = tostring(RequestBody.properties.principalId)
| order by TimeGenerated desc
```

```kql
// Policy assignment changes
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue has "Microsoft.Authorization/policyAssignments"
| where ActivityStatusValue == "Success"
| project
    TimeGenerated,
    Caller,
    OperationNameValue,
    ResourceGroup,
    Resource
| order by TimeGenerated desc
```

```kql
// Resource deletions in production subscriptions
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue endswith "/delete"
| where ActivityStatusValue == "Success"
| where SubscriptionId in ("prod-sub-id-1", "prod-sub-id-2")
| project
    TimeGenerated,
    Caller,
    OperationNameValue,
    ResourceGroup,
    Resource
| summarize DeletionCount = count() by Caller, bin(TimeGenerated, 1h)
| order by DeletionCount desc
```

### Bicep: Diagnostic Settings for Governance

```bicep
// governance-diagnostics.bicep
targetScope = 'subscription'

@description('Log Analytics workspace resource ID.')
param logAnalyticsWorkspaceId string

@description('Storage account resource ID for long-term archival.')
param storageAccountId string = ''

// Subscription-level diagnostic setting for Activity Log
resource activityLogDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01' = {
  name: 'governance-activity-logs'
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    storageAccountId: !empty(storageAccountId) ? storageAccountId : null
    logs: [
      {
        category: 'Administrative'
        enabled: true
      }
      {
        category: 'Security'
        enabled: true
      }
      {
        category: 'Policy'
        enabled: true
      }
      {
        category: 'Recommendation'
        enabled: true
      }
    ]
  }
}
```

### Bicep: Log Analytics Workspace for Governance

```bicep
// log-analytics.bicep
targetScope = 'resourceGroup'

@description('Workspace name.')
param workspaceName string

@description('Azure region.')
param location string = resourceGroup().location

@description('Retention in days (30-730).')
@minValue(30)
@maxValue(730)
param retentionInDays int = 365

@description('Tags.')
param tags object = {}

resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: workspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionInDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

output workspaceId string = workspace.id
output workspaceName string = workspace.name
output customerId string = workspace.properties.customerId
```

### Bicep: Alert Rule for RBAC Changes

```bicep
// rbac-change-alert.bicep
targetScope = 'resourceGroup'

@description('Log Analytics workspace resource ID.')
param workspaceId string

@description('Action group resource ID for notifications.')
param actionGroupId string

resource rbacAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = {
  name: 'alert-rbac-owner-assignment'
  location: resourceGroup().location
  tags: {
    Purpose: 'Governance'
    AlertType: 'RBAC'
  }
  properties: {
    displayName: 'High-Privilege Role Assignment Detected'
    description: 'Fires when an Owner or Contributor role is assigned.'
    severity: 1
    enabled: true
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    scopes: [workspaceId]
    criteria: {
      allOf: [
        {
          query: '''
            AzureActivity
            | where OperationNameValue == "Microsoft.Authorization/roleAssignments/write"
            | where ActivityStatusValue == "Success"
            | extend Props = parse_json(Properties)
            | extend RequestBody = parse_json(tostring(Props.requestbody))
            | extend RoleDefId = tostring(RequestBody.properties.roleDefinitionId)
            | where RoleDefId has "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
               or RoleDefId has "b24988ac-6180-42a0-ab88-20f7382dd24c"
          '''
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
        }
      ]
    }
    actions: {
      actionGroups: [actionGroupId]
    }
  }
}
```

---

## References

- [Azure Monitor overview](https://learn.microsoft.com/en-us/azure/azure-monitor/overview)
- [Activity Log](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log)
- [Diagnostic Settings](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings)
- [Log Analytics workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview)
- [Azure Workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview)
- [Log query alert rules](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-log)
- [KQL overview](https://learn.microsoft.com/en-us/kusto/query/)
- [Microsoft Entra ID reporting](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/overview-monitoring-health)
- [Azure Monitor RBAC](https://learn.microsoft.com/en-us/azure/azure-monitor/roles-permissions-security)

---

| Previous | Next |
|:---------|:-----|
| [Cost Automation](../part-5-cost-finops/ch19-cost-automation.md) | [Resource Graph](ch21-resource-graph.md) |
