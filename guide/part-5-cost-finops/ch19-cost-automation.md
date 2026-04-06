# Chapter 19 — Cost Automation

> Last verified: 2026-04-06

---

## Overview

Manual cost management doesn't scale. As organizations grow their Azure footprint, automated cost controls become essential to prevent budget overruns, enforce spending policies, and optimize resource utilization without human intervention.

Cost automation covers:

- **Automated budget actions** — trigger workflows when spending thresholds are breached
- **Resource lifecycle automation** — auto-shutdown, auto-start, and auto-delete for dev/test environments
- **Programmatic budget management** — create and manage budgets via REST API, Bicep, or CLI
- **Advisor-driven optimization** — act on Azure Advisor recommendations automatically
- **Custom alert workflows** — route cost alerts to Slack, Teams, ticketing systems, or custom logic

---

## How It Works

### Automated Budget Actions with Action Groups

Azure budgets can trigger **action groups** when thresholds are crossed. Action groups support multiple notification and automation channels:

| Action Type | Description |
|-------------|-------------|
| **Email** | Send notifications to individuals or distribution lists |
| **SMS** | Text message alerts for urgent thresholds |
| **Azure Function** | Execute serverless code (e.g., shut down VMs, send API calls) |
| **Logic App** | Trigger a workflow (e.g., create a ServiceNow ticket, post to Teams) |
| **Webhook** | Call any HTTP endpoint |
| **Automation Runbook** | Execute an Azure Automation runbook |
| **Event Hub** | Stream to Event Hub for custom processing |
| **ITSM** | Integrate with IT Service Management tools |

### Logic Apps for Cost Alert Workflows

**Azure Logic Apps** enable low-code workflows triggered by budget alerts. Common patterns:

- **Escalation workflow** — when budget exceeds 80%, email the team lead; at 100%, email the VP and create a blocking ticket
- **Slack/Teams notification** — post cost alerts to a shared channel with a link to cost analysis
- **Resource action** — when a dev/test budget is exceeded, automatically deallocate all VMs in the resource group

### Auto-Shutdown for Dev/Test Environments

Dev/test environments are prime candidates for cost automation. Common approaches:

| Approach | Tool | Scope |
|----------|------|-------|
| **VM auto-shutdown** | Built-in Azure feature | Individual VMs |
| **Start/Stop VMs v2** | Azure Function-based solution | Multiple VMs by tag, resource group, or subscription |
| **Budget-triggered shutdown** | Budget + Action Group + Azure Function | Resource group or subscription |
| **Azure DevTest Labs** | Managed lab environments | Lab VMs with auto-shutdown policies |
| **Scheduled pipeline** | GitHub Actions / Azure DevOps on cron | Any resource via CLI commands |

### Programmatic Budget Management

#### REST API

```bash
# Create a budget via REST API
az rest --method put \
  --uri "https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Consumption/budgets/monthly-budget?api-version=2024-08-01" \
  --body '{
    "properties": {
      "category": "Cost",
      "amount": 10000,
      "timeGrain": "Monthly",
      "timePeriod": {
        "startDate": "2026-04-01",
        "endDate": "2027-03-31"
      },
      "notifications": {
        "actual80": {
          "enabled": true,
          "operator": "GreaterThan",
          "threshold": 80,
          "thresholdType": "Actual",
          "contactEmails": ["team@contoso.com"]
        }
      }
    }
  }'
```

### Azure Advisor API for Optimization Recommendations

The **Azure Advisor REST API** provides programmatic access to cost optimization recommendations:

```bash
# Get cost recommendations for a subscription
az advisor recommendation list \
  --category Cost \
  --output table

# Get detailed information about a specific recommendation
az advisor recommendation list \
  --category Cost \
  --query "[?shortDescription.solution=='Right-size or shutdown underutilized virtual machines']" \
  --output json
```

Common automation patterns with Advisor:

- **Weekly report** — query Advisor API and send a summary email with estimated savings
- **Auto-remediation** — for low-risk recommendations (e.g., delete unattached disks), apply automatically
- **Ticket creation** — for high-impact recommendations (e.g., resize VMs), create work items in your tracking system

---

## Best Practices

1. **Layer budget alerts** — set alerts at 50% (informational), 80% (warning), and 100% (action required)
2. **Use forecast alerts** — forecast alerts give you time to act before the actual threshold is hit
3. **Automate dev/test shutdowns** — schedule VMs to shut down at end of business day; start on demand
4. **Tag resources for automation scope** — use tags like `AutoShutdown: true` to target automation
5. **Test actions in non-production first** — validate budget actions and Logic Apps in a dev subscription
6. **Monitor automation health** — alert on action group failures to ensure automations are actually running
7. **Combine budgets with policy** — use budgets for alerting and Azure Policy for prevention (e.g., restrict expensive SKUs)
8. **Review Advisor recommendations weekly** — automate the retrieval; manually approve high-impact changes
9. **Use managed identities** — authenticate Azure Functions and Logic Apps with managed identities, not stored credentials
10. **Document automation behavior** — teams should know what happens when a budget is exceeded

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Budget actions that shut down production | Production outage | Never configure auto-shutdown actions on production scopes |
| No monitoring of action group health | Silent failures; alerts never sent | Monitor action group execution via Activity Log |
| Over-reliance on email alerts | Alert fatigue; emails ignored | Use actionable alerts (tickets, auto-remediation) in addition to email |
| Not testing budget actions | Actions fail when needed | Test action groups with a low threshold in a dev subscription |
| Auto-deleting resources without approval | Data loss | Only auto-delete clearly orphaned resources; require approval for others |
| Using client secrets in automation | Security risk | Use managed identities for Azure Functions and Logic Apps |

---

## Code Samples

### Budget with Action Group via Bicep

```bicep
// cost-automation.bicep
targetScope = 'resourceGroup'

@description('Monthly budget amount in USD.')
param budgetAmount int = 3000

@description('Budget start date (YYYY-MM-DD, first of month).')
param startDate string = '2026-04-01'

@description('Budget end date (YYYY-MM-DD).')
param endDate string = '2027-03-31'

@description('Email addresses for notifications.')
param alertEmails array = ['finops@contoso.com']

@description('Webhook URL for external integration (e.g., Slack, Teams).')
param webhookUrl string = ''

// Action group with email and optional webhook
resource costActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-cost-automation'
  location: 'global'
  properties: {
    groupShortName: 'CostAuto'
    enabled: true
    emailReceivers: [
      for (email, i) in alertEmails: {
        name: 'email-receiver-${i}'
        emailAddress: email
        useCommonAlertSchema: true
      }
    ]
    webhookReceivers: !empty(webhookUrl) ? [
      {
        name: 'external-webhook'
        serviceUri: webhookUrl
        useCommonAlertSchema: true
      }
    ] : []
  }
}

// Budget with tiered alerts
resource budget 'Microsoft.Consumption/budgets@2024-08-01' = {
  name: 'budget-${resourceGroup().name}'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
      endDate: endDate
    }
    notifications: {
      informational50: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: alertEmails
      }
      warning80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: alertEmails
        contactGroups: [costActionGroup.id]
      }
      critical100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: alertEmails
        contactGroups: [costActionGroup.id]
      }
      forecast100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: alertEmails
        contactGroups: [costActionGroup.id]
      }
    }
  }
}

output budgetName string = budget.name
output actionGroupId string = costActionGroup.id
```

### Auto-Shutdown Schedule via Bicep

```bicep
// vm-auto-shutdown.bicep
targetScope = 'resourceGroup'

@description('Name of the VM to configure auto-shutdown for.')
param vmName string

@description('Shutdown time in HHmm format (24-hour, UTC).')
param shutdownTime string = '1900'

@description('Time zone for the shutdown schedule.')
param timeZone string = 'Eastern Standard Time'

@description('Email for shutdown notifications.')
param notificationEmail string = ''

resource shutdownSchedule 'Microsoft.DevTestLab/schedules@2018-09-15' = {
  name: 'shutdown-computevm-${vmName}'
  location: resourceGroup().location
  properties: {
    status: 'Enabled'
    taskType: 'ComputeVmShutdownTask'
    dailyRecurrence: {
      time: shutdownTime
    }
    timeZoneId: timeZone
    targetResourceId: resourceId('Microsoft.Compute/virtualMachines', vmName)
    notificationSettings: !empty(notificationEmail) ? {
      status: 'Enabled'
      emailRecipient: notificationEmail
      timeInMinutes: 30
      notificationLocale: 'en'
    } : {
      status: 'Disabled'
    }
  }
}
```

### GitHub Actions: Weekly Advisor Cost Report

```yaml
# .github/workflows/advisor-cost-report.yml
name: Weekly Advisor Cost Report

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 8:00 UTC
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  advisor-report:
    runs-on: ubuntu-latest
    steps:
      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Get Advisor Cost Recommendations
        run: |
          echo "# Azure Advisor Cost Recommendations" > report.md
          echo "Generated: $(date -u)" >> report.md
          echo "" >> report.md

          az advisor recommendation list \
            --category Cost \
            --query "[].{Impact: impact, Problem: shortDescription.problem, Solution: shortDescription.solution, Savings: extendedProperties.annualSavingsAmount}" \
            --output table >> report.md

      - name: Send Report via Email
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.SMTP_SERVER }}
          server_port: 587
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: 'Weekly Azure Advisor Cost Report'
          to: finops@contoso.com
          from: azure-governance@contoso.com
          body: file://report.md
```

---

## References

- [Budget action groups](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets#configure-budget-action-groups)
- [Azure Advisor REST API](https://learn.microsoft.com/en-us/rest/api/advisor/)
- [Azure Advisor CLI reference](https://learn.microsoft.com/en-us/cli/azure/advisor)
- [Start/Stop VMs v2](https://learn.microsoft.com/en-us/azure/azure-functions/start-stop-vms/overview)
- [Auto-shutdown for VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/auto-shutdown-vm)
- [Azure Logic Apps overview](https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-overview)
- [Azure Automation runbooks](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-types)
- [Consumption Budgets API](https://learn.microsoft.com/en-us/rest/api/consumption/budgets)
- [Managed identities for Azure resources](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

---

| Previous | Next |
|:---------|:-----|
| [FinOps](ch18-finops.md) | [Azure Monitor](../part-6-observability/ch20-azure-monitor.md) |
