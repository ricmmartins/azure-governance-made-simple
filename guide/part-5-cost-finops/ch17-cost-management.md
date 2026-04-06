# Chapter 17 — Cost Management

> Last verified: 2026-04-06

---

## Overview

**Azure Cost Management + Billing** is the central service for monitoring, allocating, and optimizing Azure spending. For governance teams, it provides the controls needed to prevent budget overruns, enforce accountability, and build a culture of cost awareness across the organization.

Cost governance is not just about reducing spend — it's about ensuring that *every dollar spent delivers business value* and that *spending is predictable, accountable, and aligned with organizational policy*.

Key capabilities:

- **Cost analysis** — interactive exploration of costs by service, resource group, tag, subscription, and custom dimensions
- **Budgets** — set spending thresholds with automated alerts and actions
- **Anomaly detection** — AI-powered identification of unexpected cost spikes
- **Cost allocation** — rules for splitting shared costs across teams and cost centers
- **Exports** — scheduled data exports to storage accounts for external analysis
- **Advisor recommendations** — actionable cost-saving suggestions
- **Savings Plans and Reservations** — commit-to-use pricing models for significant discounts
- **Multi-cloud support** — view AWS costs alongside Azure in a single pane

---

## How It Works

### Cost Analysis

Cost analysis is the primary investigative tool. It answers questions like *"Why did spending increase last month?"* and *"Which team is consuming the most compute?"*

Key views:

| View | Purpose |
|------|---------|
| **Accumulated costs** | Running total over a period |
| **Daily costs** | Day-by-day breakdown for trend analysis |
| **Cost by service** | Which Azure services cost the most |
| **Cost by resource** | Which individual resources cost the most |
| **Cost by tag** | Cost allocation by business dimensions (CostCenter, Team, Project) |

Cost analysis supports grouping by:
- Subscription, resource group, resource
- Service name, meter category
- Tag key/value
- Location (region)
- Pricing model (On-demand, Reservation, Savings Plan, Spot)

### Budgets and Alerts

Budgets define spending limits at any scope (management group, subscription, or resource group) and trigger alerts when actual or forecasted spending crosses defined thresholds.

**Budget alert types:**

| Type | Trigger | Use Case |
|------|---------|----------|
| **Actual** | Fires when actual spend reaches the threshold | React to current overruns |
| **Forecast** | Fires when projected spend is expected to exceed the threshold | Proactive intervention before overspend |

**Alert actions:**

- Email notifications to budget owners
- Action group triggers (Azure Functions, Logic Apps, webhooks)
- Automated responses (e.g., shut down dev/test VMs, send Slack/Teams alerts)

### Cost Anomaly Detection

Azure Cost Management includes built-in **anomaly detection** that uses machine learning to identify unusual spending patterns. Anomalies are surfaced in:

- **Cost analysis** — visual indicators on the cost chart
- **Anomaly alerts** — configurable email and action group notifications
- **Cost Management API** — programmatic access for custom dashboards

Anomaly detection considers seasonality, growth trends, and historical patterns to minimize false positives.

### Cost Allocation Rules

**Cost allocation rules** distribute shared costs (e.g., a shared virtual network, a Log Analytics workspace) across consuming teams based on defined criteria:

- **Fixed proportion** — split costs by percentage (e.g., 60/40 between two teams)
- **Even split** — divide equally among targets
- **Proportional** — allocate based on actual resource consumption ratios

Cost allocation rules are applied retroactively and appear in cost analysis and exports, making chargeback and showback models possible.

### Azure Savings Plans

**Azure Savings Plans** (launched October 2022) offer discounted pricing in exchange for a commitment to spend a fixed hourly amount on eligible compute services for 1 or 3 years.

| Feature | Savings Plans | Reservations |
|---------|--------------|--------------|
| **Scope** | Compute across regions and SKUs | Specific SKU in a specific region |
| **Flexibility** | Automatically applies to qualifying usage | Must match exact resource type and region |
| **Discount** | Up to 65% off pay-as-you-go | Up to 72% off pay-as-you-go |
| **Services** | VMs, App Service, Container Instances, Azure Functions Premium, Azure Dedicated Hosts | VMs, SQL, Cosmos DB, Storage, and many more |

**Best practice:** Use Savings Plans for compute workloads that may change SKU or region, and Reservations for stable, predictable workloads.

### Reservations

**Azure Reservations** provide discounted pricing when you commit to a specific resource type and configuration for 1 or 3 years:

- **Virtual Machines** — commit to a specific VM family and region
- **SQL Database** — reserve vCores or DTUs
- **Cosmos DB** — reserve throughput (RU/s)
- **Storage** — reserve capacity for blob, file, and Data Lake
- **Many more** — App Service, Synapse, Redis, Databricks, etc.

### Azure Advisor Cost Recommendations

**Azure Advisor** continuously analyzes resource utilization and provides actionable recommendations:

- **Right-size or shut down underutilized VMs**
- **Purchase Reservations or Savings Plans** based on usage patterns
- **Delete unused resources** (orphaned disks, unused public IPs)
- **Use Spot VMs** for fault-tolerant workloads
- **Optimize storage tiers** (move infrequently accessed data to cool/archive)

---

## Best Practices

1. **Set budgets at every scope** — management group, subscription, and resource group; alert at 50%, 75%, 90%, and 100%
2. **Use tags for cost allocation** — require `CostCenter`, `Team`, and `Environment` tags via Azure Policy
3. **Enable anomaly alerts** — configure action groups to notify FinOps leads on anomalies
4. **Review Advisor recommendations weekly** — assign owners to act on right-sizing and reservation recommendations
5. **Automate dev/test shutdowns** — use auto-shutdown schedules or budget-triggered actions to stop non-production resources after hours
6. **Export cost data** — schedule daily exports to a storage account for integration with Power BI, custom dashboards, or FinOps tools
7. **Combine Savings Plans and Reservations** — use Savings Plans for flexible compute and Reservations for predictable workloads
8. **Use cost allocation rules** — distribute shared infrastructure costs to consuming teams for accountability
9. **Review costs monthly** — conduct monthly cost reviews with stakeholders; compare actual vs. budget
10. **Use management group budgets** — set enterprise-wide spending limits in addition to subscription-level budgets

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| No budgets set | Spending goes unnoticed until the bill arrives | Set budgets with forecast alerts at every scope |
| Tags not enforced | Cannot allocate costs to business units | Use Azure Policy to require tags before resource creation |
| Ignoring Advisor recommendations | Wasted spend on underutilized resources | Review Advisor weekly; track recommendation adoption |
| Over-committing on Reservations | Paying for capacity you don't use | Start with Savings Plans for flexibility; reserve only stable workloads |
| Not using anomaly detection | Cost spikes go undetected for days | Enable anomaly alerts with action groups |
| Manual cost reviews only | Slow, error-prone, infrequent | Automate exports and dashboards |
| Shared resources without allocation | Teams have no visibility into their true costs | Configure cost allocation rules |

---

## Code Samples

### Creating a Budget via Azure CLI

```bash
# Create a monthly budget with alerts at 80% and 100%
az consumption budget create \
  --budget-name 'monthly-governance-budget' \
  --amount 5000 \
  --time-grain Monthly \
  --start-date '2026-04-01' \
  --end-date '2027-03-31' \
  --resource-group 'rg-governance-prod' \
  --category Cost \
  --notifications '{
    "actual_GreaterThan_80_Percent": {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 80,
      "contactEmails": ["governance-team@contoso.com"],
      "thresholdType": "Actual"
    },
    "forecasted_GreaterThan_100_Percent": {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 100,
      "contactEmails": ["governance-team@contoso.com", "finance@contoso.com"],
      "thresholdType": "Forecasted"
    }
  }'
```

### Creating a Budget with Action Group via Bicep

This Bicep template creates a budget with an action group that triggers an email and a Logic App when the budget threshold is exceeded:

```bicep
// budget-with-alerts.bicep
targetScope = 'resourceGroup'

@description('Monthly budget amount in USD.')
param budgetAmount int = 5000

@description('Budget start date (first day of a month, YYYY-MM-DD).')
param startDate string = '2026-04-01'

@description('Budget end date (YYYY-MM-DD).')
param endDate string = '2027-03-31'

@description('Email addresses for budget notifications.')
param notificationEmails array = ['governance-team@contoso.com']

@description('Name of the budget.')
param budgetName string = 'monthly-governance-budget'

// Action group for budget alerts
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-budget-alerts'
  location: 'global'
  properties: {
    groupShortName: 'BudgetAlert'
    enabled: true
    emailReceivers: [
      for (email, i) in notificationEmails: {
        name: 'email-${i}'
        emailAddress: email
        useCommonAlertSchema: true
      }
    ]
  }
}

// Budget with notifications and action group
resource budget 'Microsoft.Consumption/budgets@2024-08-01' = {
  name: budgetName
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
      endDate: endDate
    }
    notifications: {
      actual80Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: notificationEmails
        contactGroups: [actionGroup.id]
      }
      actual100Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: notificationEmails
        contactGroups: [actionGroup.id]
      }
      forecasted100Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: notificationEmails
        contactGroups: [actionGroup.id]
      }
    }
  }
}

output budgetId string = budget.id
output actionGroupId string = actionGroup.id
```

### Querying Cost Anomalies via Azure CLI

```bash
# List recent cost anomalies for a subscription
az costmanagement query \
  --type ActualCost \
  --scope 'subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --timeframe MonthToDate \
  --dataset-grouping name="ResourceGroup" type="Dimension" \
  --output table
```

---

## References

- [Azure Cost Management + Billing overview](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-overview)
- [Create and manage budgets](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [Cost anomaly detection](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/analyze-unexpected-charges)
- [Cost allocation rules](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/allocate-costs)
- [Azure Savings Plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)
- [Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations)
- [Azure Advisor cost recommendations](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations)
- [Export cost data](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-export-acm-data)
- [Well-Architected Framework — Cost Optimization](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/)
- [Control Azure spending (Microsoft Learn path)](https://learn.microsoft.com/en-us/training/paths/control-spending-manage-bills/)

---

| Previous | Next |
|:---------|:-----|
| [Governance CI/CD](../part-4-iac-deployment/ch16-governance-cicd.md) | [FinOps](ch18-finops.md) |
