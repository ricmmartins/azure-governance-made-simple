# Chapter 22 — AzGovViz (Azure Governance Visualizer)

> Last verified: 2026-04-06

---

## Overview

**AzGovViz** (Azure Governance Visualizer) is an open-source PowerShell tool that provides a comprehensive, visual representation of your Azure governance implementation. It iterates through your entire management group hierarchy — from the tenant root down to individual subscriptions — and captures data on Azure Policy, RBAC, Blueprints (legacy), and resource configurations.

The output is a rich HTML report that governance teams can use to:

- **Understand the current governance posture** at a glance
- **Identify gaps** — missing policies, overly broad RBAC assignments, orphaned resources
- **Audit changes** — compare reports over time to detect governance drift
- **Communicate** — share visual reports with stakeholders who don't use the Azure Portal

AzGovViz is maintained by Julian Hayward and the Azure community:
- **GitHub:** [github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting)

---

## How It Works

### What AzGovViz Captures

AzGovViz queries the Azure Resource Manager API and produces reports covering:

| Area | Details |
|------|---------|
| **Management Group hierarchy** | Visual tree map of MG structure with subscription placement |
| **Azure Policy** | Policy definitions (built-in and custom), initiative assignments, compliance state |
| **RBAC** | Role assignments at every scope, custom role definitions, PIM eligibility |
| **Resources** | Resource counts by type, region, and subscription |
| **Blueprints** (legacy) | Blueprint definitions and assignments |
| **Diagnostics** | Subscriptions missing diagnostic settings |
| **Microsoft Defender for Cloud** | Secure Score, defender plan status |
| **Cost** | Consumption data (optional) |
| **Network** | Private endpoints, virtual networks (optional) |

### Output Components

AzGovViz generates three main report sections:

#### 1. Hierarchy Map

An interactive visual tree showing your management group hierarchy with subscriptions nested underneath. Each node is clickable and shows details about the management group or subscription.

#### 2. Tenant Summary

A high-level dashboard with aggregated statistics:
- Total management groups, subscriptions, and resources
- Policy definitions and assignments (built-in vs. custom)
- RBAC role assignments and custom role definitions
- Orphaned resources and role assignments
- Policy compliance percentages

#### 3. Scope Insights

Detailed drill-downs for each management group and subscription:
- Policy assignments at this scope (inherited vs. direct)
- RBAC role assignments (inherited vs. direct)
- Resource inventory
- Tag compliance
- Diagnostic settings status

---

## Setup and Prerequisites

### Requirements

| Requirement | Details |
|-------------|---------|
| **PowerShell** | PowerShell 7.x (cross-platform) |
| **Azure PowerShell modules** | `Az.Accounts`, `Az.Resources` (automatically handled) |
| **Permissions** | `Reader` on the root management group (minimum) |
| **Microsoft Entra ID** | `Directory Reader` role for user/group resolution (recommended) |
| **Git** | For cloning the repository |

### Installation

```powershell
# Clone the repository
git clone https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting.git
cd Azure-MG-Sub-Governance-Reporting

# Verify PowerShell version (7.x required)
$PSVersionTable.PSVersion
```

### Required Azure Permissions

The identity running AzGovViz needs:

| Permission | Scope | Purpose |
|------------|-------|---------|
| `Reader` | Root management group | Read all resources, policies, and RBAC |
| `Directory Reader` | Microsoft Entra ID | Resolve principal names (users, groups, service principals) |

For automated runs (pipelines), create a service principal or managed identity with these permissions:

```bash
# Create a service principal
az ad sp create-for-rbac --name "sp-azgovviz" --role Reader \
  --scopes "/providers/Microsoft.Management/managementGroups/<root-mg-id>"
```

---

## Running AzGovViz

### Local Execution

```powershell
# Connect to Azure
Connect-AzAccount

# Run AzGovViz (basic)
.\pwsh\AzGovVizParallel.ps1 `
  -ManagementGroupId "<your-root-mg-id>"

# Run with all features enabled
.\pwsh\AzGovVizParallel.ps1 `
  -ManagementGroupId "<your-root-mg-id>" `
  -CsvExport `
  -DoAzureConsumption `
  -ThrottleLimit 10 `
  -ChangeTrackingDays 14 `
  -NoJsonExport
```

### Common Parameters

| Parameter | Description |
|-----------|-------------|
| `-ManagementGroupId` | The root management group to start from |
| `-CsvExport` | Export data to CSV files for external analysis |
| `-DoAzureConsumption` | Include consumption/cost data (requires additional permissions) |
| `-ThrottleLimit` | Number of parallel API calls (default: 10) |
| `-ChangeTrackingDays` | Number of days to look back for changes (default: 14) |
| `-NoJsonExport` | Skip JSON export (reduces output size) |
| `-HtmlTableRowsLimit` | Limit HTML table rows (for very large tenants) |
| `-SubscriptionId4AzContext` | Run for a specific subscription context |
| `-ExcludedSubscriptions` | Comma-separated list of subscription IDs to exclude |

### GitHub Actions Pipeline

Create a scheduled GitHub Actions workflow to run AzGovViz automatically:

```yaml
# .github/workflows/azgovviz.yml
name: AzGovViz Report

on:
  schedule:
    - cron: '0 4 * * 1'  # Weekly on Monday at 4:00 UTC
  workflow_dispatch:

permissions:
  id-token: write
  contents: write

env:
  ManagementGroupId: 'mg-root'
  OutputPath: 'wiki'

jobs:
  azgovviz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true

      - name: Clone AzGovViz
        run: |
          git clone https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting.git
          cd Azure-MG-Sub-Governance-Reporting

      - name: Run AzGovViz
        uses: azure/powershell@v2
        with:
          inlineScript: |
            ./Azure-MG-Sub-Governance-Reporting/pwsh/AzGovVizParallel.ps1 `
              -ManagementGroupId $env:ManagementGroupId `
              -CsvExport `
              -ThrottleLimit 10 `
              -OutputPath $env:OutputPath
          azPSVersion: latest

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: azgovviz-report-${{ github.run_number }}
          path: ${{ env.OutputPath }}
          retention-days: 90
```

### Azure DevOps Pipeline

```yaml
# azure-pipelines-azgovviz.yml
trigger: none

schedules:
  - cron: '0 4 * * 1'
    displayName: 'Weekly Monday 4AM UTC'
    branches:
      include:
        - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  ManagementGroupId: 'mg-root'

steps:
  - task: AzurePowerShell@5
    displayName: 'Run AzGovViz'
    inputs:
      azureSubscription: 'azgovviz-service-connection'
      ScriptType: InlineScript
      Inline: |
        git clone https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting.git
        ./Azure-MG-Sub-Governance-Reporting/pwsh/AzGovVizParallel.ps1 `
          -ManagementGroupId '$(ManagementGroupId)' `
          -CsvExport `
          -OutputPath '$(Build.ArtifactStagingDirectory)'
      azurePowerShellVersion: LatestVersion
      pwsh: true

  - task: PublishBuildArtifacts@1
    displayName: 'Publish Report'
    inputs:
      PathtoPublish: '$(Build.ArtifactStagingDirectory)'
      ArtifactName: 'AzGovViz-Report'
```

---

## Reading and Interpreting the Output

### Hierarchy Map

The hierarchy map is an interactive SVG/HTML tree:

- **Color coding** — management groups and subscriptions are color-coded by depth
- **Hover details** — hover over any node to see policy counts, RBAC assignments, and resource counts
- **Click to drill down** — click a node to navigate to its Scope Insights section

**What to look for:**
- Subscriptions in the wrong management group
- Management groups with no policies assigned
- Orphaned subscriptions (not in any governance-managed MG)

### Tenant Summary

The tenant summary provides aggregate metrics. Key indicators to review:

| Metric | Healthy | Concerning |
|--------|---------|------------|
| **Custom policy definitions** | Documented, well-named | Large number of untested custom policies |
| **Orphaned role assignments** | 0 | Any orphaned assignments (deleted principals) |
| **Policy compliance** | >95% | <80% |
| **Custom role definitions** | Minimal, well-scoped | Many custom roles with broad permissions |
| **Resources without tags** | <5% | >20% |

### Scope Insights

For each management group and subscription, Scope Insights shows:

- **Inherited vs. direct policies** — are governance policies properly inherited from parent MGs?
- **RBAC assignments** — who has access at this scope? Any direct Owner assignments?
- **Resource breakdown** — what's deployed? Is it what's expected?
- **Diagnostic settings** — is Activity Log forwarding configured?

---

## Best Practices

1. **Run weekly** — schedule automated runs every Monday morning to maintain current visibility
2. **Store output in a storage account** — upload HTML reports to a blob container with a static website for easy sharing
3. **Share with the governance team** — distribute links to the latest report in team channels
4. **Compare reports over time** — use the change tracking feature to detect governance drift
5. **Use OIDC authentication in pipelines** — avoid storing service principal secrets; use workload identity federation
6. **Start from the root MG** — always scan the entire hierarchy to catch governance gaps
7. **Enable CSV export** — CSV files are easier to import into Power BI or Excel for custom analysis
8. **Review orphaned role assignments** — these indicate deleted users/groups that still have RBAC entries
9. **Set up alerting on report failures** — if AzGovViz fails, your governance visibility is stale
10. **Combine with Resource Graph** — use AzGovViz for the visual overview and Resource Graph for targeted queries

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Insufficient permissions | Incomplete reports; missing data | Ensure `Reader` on root MG and `Directory Reader` in Entra ID |
| Running too infrequently | Governance drift goes undetected | Schedule weekly automated runs |
| Not sharing the report | Only the person running AzGovViz benefits | Store in a shared location (storage account, wiki, SharePoint) |
| Large tenants causing timeouts | Report generation fails | Increase `ThrottleLimit`; use `ExcludedSubscriptions` for non-governed subs |
| Using interactive login in pipelines | Pipeline fails on auth | Use service principal or managed identity with OIDC |
| Not reviewing the output | Reports are generated but never read | Schedule monthly governance review meetings using the report as the agenda |

---

## References

- [AzGovViz GitHub repository](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting)
- [AzGovViz setup guide](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting/blob/main/setup.md)
- [Azure management group hierarchy](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview)
- [Azure Policy overview](https://learn.microsoft.com/en-us/azure/governance/policy/overview)
- [Azure RBAC overview](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- [Workload identity federation for GitHub Actions](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
- [Azure Landing Zone review workbook](https://github.com/Azure/fta-landingzone/tree/main/LZReview)

---

| Previous | Next |
|:---------|:-----|
| [Resource Graph](ch21-resource-graph.md) | — |
