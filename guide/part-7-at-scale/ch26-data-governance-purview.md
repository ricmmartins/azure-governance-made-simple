# Chapter 26 — Data Governance with Microsoft Purview

> Last verified: 2026-04-06

---

## Overview

**Microsoft Purview** is a unified data governance platform that helps organizations discover, classify, protect, and manage their data across on-premises, multi-cloud, and SaaS environments. While the previous chapters focused on governing Azure *infrastructure*, this chapter addresses governing the *data* that lives within that infrastructure.

Data governance answers questions like:

- *What data do we have, and where does it live?*
- *Is sensitive data properly classified and protected?*
- *Who has access to critical data?*
- *How does data flow through our systems?*
- *Are we meeting regulatory requirements for data handling?*

Microsoft Purview brings together what were previously separate products — Azure Purview (data catalog and lineage) and Microsoft 365 Compliance (information protection and data loss prevention) — into a single governance platform.

---

## How It Works

### Data Catalog — Discovering and Understanding Data Assets

The Purview Data Catalog provides a searchable inventory of all data assets across your organization.

**Key capabilities:**

- **Automated scanning** — Purview scans data sources (Azure SQL, Azure Data Lake, Azure Blob Storage, AWS S3, on-premises SQL Server, and many more) to discover data assets
- **Data asset inventory** — Every table, file, database, and schema is registered in the catalog with metadata
- **Business glossary** — Define standard business terms and map them to technical data assets
- **Data stewardship** — Assign owners and stewards to data assets

**Supported data sources include:**

| Category | Sources |
|---|---|
| Azure | SQL Database, Synapse Analytics, Data Lake Storage, Blob Storage, Cosmos DB, Databricks |
| AWS | S3, RDS, Glue, Redshift |
| On-premises | SQL Server, Oracle, SAP, Teradata, Hive |
| SaaS | Power BI, Salesforce, Dataverse |

### Data Classification — Automatic and Manual Classification

Purview automatically classifies data as it scans, identifying sensitive information types:

- **System classifiers** — Over 200 built-in classifiers for common sensitive data patterns (credit card numbers, Social Security numbers, passport numbers, medical record numbers, etc.)
- **Custom classifiers** — Create classifiers based on regular expressions, dictionary lists, or specific column patterns
- **Classification rules** — Define which classifiers run against which data sources

```
┌─────────────┐    ┌──────────────┐    ┌───────────────────┐
│ Data Source  │───►│ Purview Scan  │───►│ Classifications   │
│ (SQL, Lake)  │    │              │    │ • SSN detected    │
│              │    │              │    │ • Email detected  │
└─────────────┘    └──────────────┘    │ • Credit card     │
                                       └───────────────────┘
```

### Sensitivity Labels — Protecting Sensitive Data

Sensitivity labels from Microsoft Purview Information Protection extend from Microsoft 365 to Azure data assets:

- **Label data at the source** — Apply sensitivity labels to SQL columns, files in Data Lake Storage, and other data assets
- **Consistent labeling** — The same labels used in Microsoft 365 (Confidential, Highly Confidential, etc.) apply to Azure data
- **Downstream protection** — Labels travel with data as it moves through pipelines, ensuring protection persists

| Label | Description | Typical Controls |
|---|---|---|
| Public | Non-sensitive data | No restrictions |
| General | Normal business data | Internal sharing allowed |
| Confidential | Sensitive business data | Encryption, restricted sharing |
| Highly Confidential | Regulated or critical data | Encryption, DLP, access logging |

### Data Lineage — Tracking Data Flow

Data lineage shows how data flows from source to destination, including all transformations along the way.

**Why lineage matters for governance:**

- **Impact analysis** — Understand which downstream reports and applications are affected when a source changes
- **Compliance auditing** — Prove to regulators that sensitive data is handled correctly throughout its lifecycle
- **Root cause analysis** — Trace data quality issues back to their source

**Lineage sources:**

Purview captures lineage automatically from:

- Azure Data Factory and Synapse pipelines
- Azure Databricks notebooks
- SQL Server Integration Services (SSIS)
- Power BI dataflows and reports

### Integration with Azure Governance Tools

Purview integrates with other Azure governance services to create a comprehensive governance posture:

| Integration | How It Works |
|---|---|
| **Azure Policy** | Enforce that storage accounts have Purview scanning enabled; require diagnostic settings |
| **Microsoft Defender for Cloud** | Surface Purview classification findings in Defender dashboards; prioritize protection for highly classified data |
| **Microsoft Entra ID** | Use Entra ID for Purview access control; integrate with Conditional Access |
| **Azure Monitor** | Route Purview diagnostic logs to Log Analytics; create alerts on scan failures |
| **Azure Key Vault** | Store credentials for Purview scans securely; use managed identities where possible |

---

## Best Practices

1. **Start with data discovery before applying controls** — You cannot govern what you do not know about. Run Purview scans across all data sources to build a comprehensive inventory before defining policies.

2. **Define a business glossary early** — A common vocabulary for data terms (e.g., "Customer," "Revenue," "PII") ensures consistency across teams and makes the data catalog useful.

3. **Use managed identities for scanning** — Avoid storing credentials. Configure Purview to use managed identities to access Azure data sources.

4. **Align sensitivity labels with your organization's classification scheme** — Work with your security and compliance teams to define labels that map to existing data classification policies.

5. **Automate scanning schedules** — Configure recurring scans (weekly or daily) to keep the catalog current as data sources evolve.

6. **Assign data stewards** — Every critical data asset should have an owner and a steward responsible for data quality and governance.

7. **Enable lineage capture in pipelines** — Ensure that Azure Data Factory and Synapse pipelines have Purview lineage integration enabled.

8. **Use Purview alongside Azure Policy** — Purview governs data content and classification; Azure Policy governs infrastructure configuration. Together, they provide comprehensive governance.

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---|---|---|
| Scanning everything at once | High scan costs and long scan times | Prioritize critical data sources; expand incrementally |
| Ignoring the business glossary | The catalog becomes a dump of technical metadata | Invest time in defining business terms and mapping them |
| Not reviewing auto-classifications | False positives in classification results | Regularly review and curate classification results |
| Treating Purview as an IT-only tool | Low adoption by data consumers | Involve business users as data stewards and glossary contributors |
| Forgetting about non-Azure data sources | Incomplete data governance | Scan on-premises and multi-cloud data sources using Purview's connectors |

---

## Code Samples

### Deploy a Purview Account with Bicep

```bicep
resource purviewAccount 'Microsoft.Purview/accounts@2021-12-01' = {
  name: 'purview-${uniqueString(resourceGroup().id)}'
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    managedResourceGroupName: 'rg-purview-managed'
  }
  tags: {
    Environment: 'Production'
    Purpose: 'DataGovernance'
  }
}

output purviewAccountName string = purviewAccount.name
output purviewIdentityPrincipalId string = purviewAccount.identity.principalId
```

### Azure Policy — Require Purview Diagnostic Settings

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "field": "type",
      "equals": "Microsoft.Purview/accounts"
    },
    "then": {
      "effect": "DeployIfNotExists",
      "details": {
        "type": "Microsoft.Insights/diagnosticSettings",
        "existenceCondition": {
          "field": "Microsoft.Insights/diagnosticSettings/logs.enabled",
          "equals": "true"
        }
      }
    }
  }
}
```

### Resource Graph — Find Purview Accounts and Their Status

```kusto
resources
| where type == "microsoft.purview/accounts"
| project name, location, resourceGroup, subscriptionId,
    provisioningState = properties.provisioningState,
    publicNetworkAccess = properties.publicNetworkAccess,
    managedRg = properties.managedResourceGroupName
```

---

## References

- [Microsoft Purview Documentation](https://learn.microsoft.com/purview/)
- [Microsoft Purview Data Catalog](https://learn.microsoft.com/purview/catalog)
- [Data Classification in Microsoft Purview](https://learn.microsoft.com/purview/concept-best-practices-classification)
- [Sensitivity Labels in Microsoft Purview](https://learn.microsoft.com/purview/sensitivity-labels)
- [Data Lineage in Microsoft Purview](https://learn.microsoft.com/purview/concept-data-lineage)
- [Supported Data Sources in Purview](https://learn.microsoft.com/purview/purview-connector-overview)
- [Microsoft Purview Information Protection](https://learn.microsoft.com/purview/information-protection)
- [Microsoft Purview Pricing](https://azure.microsoft.com/pricing/details/purview/)

---

| Previous | Next |
|:---|:---|
| [Sovereign Landing Zones](ch25-sovereign-landing-zones.md) | [AI Governance](ch27-ai-governance.md) |
