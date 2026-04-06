# Chapter 11 — Microsoft Defender for Cloud

> Last verified: 2026-04-06

Microsoft Defender for Cloud is the centralized security management and threat protection service for Azure, hybrid, and multi-cloud environments. For governance teams, Defender for Cloud provides the security posture management layer that translates security policies into actionable recommendations and measurable metrics. This chapter covers how to use Defender for Cloud as a governance tool — not just a security product.

---

## Overview

Microsoft Defender for Cloud provides two core capabilities:

1. **Cloud Security Posture Management (CSPM)** — Continuously assesses your environment, identifies misconfigurations, and provides security recommendations with a quantifiable Secure Score.

2. **Cloud Workload Protection (CWP)** — Provides threat detection and advanced protection for specific workload types (VMs, containers, databases, storage, App Service, Key Vault, DNS, and more).

For governance purposes, CSPM is the primary focus. It gives you a measurable, trackable view of your security posture and integrates directly with Azure Policy to enforce security standards.

---

## How It Works

### Cloud Security Posture Management (CSPM)

CSPM continuously evaluates your Azure resources against security best practices and reports findings as **security recommendations**. Every Azure subscription automatically gets the **foundational CSPM** capabilities at no cost.

#### Free Tier (Foundational CSPM)

Included with every Azure subscription:

- Security recommendations based on the Microsoft Cloud Security Benchmark (MCSB).
- Secure Score calculation.
- Azure Policy integration for security standards.
- Asset inventory.
- Regulatory compliance dashboard with MCSB.

#### Paid Tier (Defender CSPM)

Adds advanced capabilities:

- **Attack path analysis** — Identifies paths an attacker could take through your environment, combining misconfigurations, overly permissive access, and network exposure.
- **Cloud security graph** — Queryable graph database of all resources, identities, and their relationships for risk analysis.
- **Agentless scanning** — Scans VMs for vulnerabilities and secrets without installing agents.
- **Data-aware security posture** — Discovers and classifies sensitive data in storage and databases.
- **Governance rules** — Assigns recommendations to specific owners with due dates and tracking.
- **External attack surface management (EASM)** — Discovers and monitors internet-facing assets.

### Secure Score

**Secure Score** is a numerical measurement (0–100%) of your security posture. It is calculated based on the ratio of healthy (compliant) resources to total assessed resources, weighted by the severity and importance of each recommendation.

#### How Secure Score Works

1. Defender for Cloud evaluates your resources against all active security recommendations.
2. Each **security control** has a **max score** value (e.g., 10 points for the Enable MFA control). Your current score for each control depends on how many of its recommendations you have remediated.
3. The **current score** for a recommendation is proportional to the percentage of compliant resources.
4. The total Secure Score is the sum of all current scores divided by the sum of all max scores.

```
Secure Score = Σ(current scores) / Σ(max scores) × 100
```

#### Using Secure Score as a Governance Metric

Secure Score is one of the most effective governance metrics because:

- **It is quantifiable** — Track a number over time rather than subjective assessments.
- **It is actionable** — Each point maps to specific remediation actions.
- **It is comparable** — Compare Secure Score across subscriptions, management groups, and business units.
- **It drives accountability** — Set Secure Score targets per team and track progress.

**Governance target example:**

| Audience | Target | Review Cadence |
|----------|--------|---------------|
| Platform team | ≥ 85% | Weekly |
| Application teams | ≥ 70% | Bi-weekly |
| New subscriptions | ≥ 60% within 30 days | Monthly |

### Security Recommendations

Security recommendations are the individual findings that Defender for Cloud generates. Each recommendation includes:

- **Description** — What the issue is.
- **Severity** — High, Medium, or Low.
- **Affected resources** — Which specific resources are non-compliant.
- **Remediation steps** — How to fix the issue (often with a "Quick Fix" button).
- **Associated policy** — The Azure Policy definition that evaluates this control.

Recommendations are grouped into **security controls**, which align with the MCSB control domains. Examples of security controls:

| Security Control | Max Score | Example Recommendations |
|-----------------|-----------|------------------------|
| Enable MFA | 10 | MFA should be enabled on accounts with owner permissions |
| Manage access and permissions | 4 | External accounts with owner permissions should be removed |
| Enable encryption at rest | 4 | Storage accounts should use customer-managed keys |
| Restrict unauthorized network access | 4 | Storage accounts should restrict network access |
| Enable endpoint protection | 6 | Endpoint protection should be installed on machines |
| Apply system updates | 6 | System updates should be installed on your machines |

### Security Recommendations as Governance Signals

Recommendations serve as governance signals that can be operationalized:

1. **Assignment** — Use Defender for Cloud governance rules to assign recommendations to specific owners with due dates.
2. **Tracking** — Monitor remediation progress through the Defender for Cloud portal or via Azure Resource Graph.
3. **Escalation** — Set up alerts when recommendations remain unresolved past their due date.
4. **Reporting** — Export recommendation data to Power BI or your GRC platform for executive reporting.

### Defender Plans Overview

Beyond CSPM, Defender for Cloud offers workload-specific protection plans. For governance, the key decision is which plans to enable:

| Defender Plan | What It Protects | Governance Value |
|--------------|-----------------|-----------------|
| **Defender for Servers** | VMs, Arc-enabled servers | Vulnerability assessment, file integrity monitoring, adaptive application controls |
| **Defender for Containers** | AKS, container registries, Kubernetes | Runtime threat detection, image vulnerability scanning, Kubernetes policy enforcement |
| **Defender for Databases** | Azure SQL, Cosmos DB, open-source DBs | Vulnerability assessment, threat detection for data workloads |
| **Defender for Storage** | Blob, File, Data Lake | Malware scanning, sensitive data threat detection |
| **Defender for Key Vault** | Key Vault | Detects unusual access patterns to secrets and keys |
| **Defender for App Service** | App Service, Functions | Detects attacks targeting web applications |
| *(Defender for DNS was retired in August 2023; DNS protection is now included in Defender for Servers Plan 2.)* | | |
| **Defender for Resource Manager**| ARM API | Detects suspicious management operations |
| **Defender CSPM** | All resources | Attack path analysis, cloud security graph, governance rules |

**Governance recommendation:** At minimum, enable **Defender CSPM** and **Defender for Resource Manager** across all subscriptions. These provide the governance-relevant capabilities (posture management and control-plane threat detection) at reasonable cost.

### Integration with Azure Policy

Defender for Cloud is deeply integrated with Azure Policy:

1. **The MCSB initiative is a policy initiative** — When you onboard a subscription to Defender for Cloud, the MCSB initiative is automatically assigned. It contains hundreds of policy definitions that evaluate your resources.

2. **Security recommendations are policy evaluations** — Each security recommendation corresponds to one or more Azure Policy definitions. The compliance state reported by Defender for Cloud comes from Azure Policy's evaluation engine.

3. **Regulatory compliance initiatives are policy initiatives** — The compliance standards you add in Defender for Cloud (NIST, CIS, PCI-DSS, etc.) are Azure Policy initiatives assigned to your subscription.

4. **Remediation uses Azure Policy remediation** — When you remediate a recommendation that uses `DeployIfNotExists`, Defender for Cloud triggers an Azure Policy remediation task.

This integration means that everything you learn about Azure Policy (Chapter 9) directly applies to Defender for Cloud. Defender for Cloud is, in many ways, a governance-friendly UX layer on top of Azure Policy.

---

## Best Practices

1. **Enable foundational CSPM on all subscriptions** — The free tier provides Secure Score, security recommendations, and the compliance dashboard at no cost. There is no reason not to enable it everywhere.

2. **Enable Defender CSPM for production workloads** — The paid CSPM tier adds attack path analysis and governance rules, which are essential for mature governance programs.

3. **Track Secure Score over time** — Set up a weekly or monthly process to review Secure Score trends. Use Azure Resource Graph to export historical data.

4. **Use governance rules to assign owners** — Defender for Cloud's governance rules let you assign specific recommendations to resource owners with due dates. This creates accountability.

5. **Use recommendations to drive remediation** — Prioritize recommendations by impact (max score contribution) and severity. Focus on High-severity findings first.

6. **Set Secure Score targets per business unit** — Different teams may have different baseline requirements. Set achievable targets and increase them over time.

7. **Integrate with your ITSM workflow** — Configure Defender for Cloud to create tickets in your ITSM system (ServiceNow, Jira) when new high-severity recommendations are detected.

8. **Export data to Log Analytics** — Configure continuous export of Defender for Cloud data to a Log Analytics workspace for custom dashboards, alerting, and long-term retention.

9. **Review and rationalize Defender plans** — Not every plan is needed for every subscription. Enable plans based on the workload types present in each subscription.

10. **Do not disable default policy assignments** — Some teams disable the MCSB initiative to reduce "noise." This removes your governance visibility. Instead, use exemptions for specific findings that are not applicable.

---

## Common Pitfalls

1. **Treating Secure Score as a vanity metric** — A high Secure Score is meaningless if it is achieved by disabling policies or creating blanket exemptions. Focus on genuine remediation.

2. **Ignoring Defender for Cloud alerts** — Teams that do not integrate Defender for Cloud into their incident response workflow miss real threats. Configure alert routing and response playbooks.

3. **Enabling all Defender plans without cost analysis** — Defender plans incur costs per resource per month. Enable plans deliberately based on workload requirements and risk assessment.

4. **Not configuring continuous export** — Without continuous export, Defender for Cloud data is only available in the portal. Export to Log Analytics for queryability, alerting, and retention.

5. **Conflating CSPM with CWP** — CSPM (posture management) and CWP (threat protection) serve different purposes. CSPM is for governance; CWP is for security operations. Both are needed, but they serve different teams and workflows.

6. **Expecting real-time Secure Score updates** — Secure Score is not updated in real-time. It refreshes periodically (typically every few hours). Do not use it for real-time compliance gates.

---

## Code Samples

### Azure Resource Graph: Query Secure Score

```kusto
SecurityResources
| where type == "microsoft.security/securescores"
| extend scorePercentage = round(
    100.0 * todouble(properties.score.current) / todouble(properties.score.max), 2)
| project
    subscriptionId,
    scoreName = tostring(properties.displayName),
    currentScore = todouble(properties.score.current),
    maxScore = todouble(properties.score.max),
    scorePercentage
| order by scorePercentage asc
```

### Azure Resource Graph: Query Security Recommendations

```kusto
SecurityResources
| where type == "microsoft.security/assessments"
| extend status = tostring(properties.status.code)
| extend severity = tostring(properties.metadata.severity)
| extend displayName = tostring(properties.displayName)
| where status == "Unhealthy"
| summarize count() by displayName, severity
| order by count_ desc
| take 20
```

### Azure CLI: Enable Defender CSPM

```bash
# Enable Defender CSPM on a subscription
az security pricing create \
  --name "CloudPosture" \
  --tier "Standard"
```

### Azure CLI: Enable Defender for Servers

```bash
# Enable Defender for Servers Plan 2
az security pricing create \
  --name "VirtualMachines" \
  --tier "Standard" \
  --subplan "P2"
```

### Azure CLI: Configure Continuous Export

```bash
# Configure continuous export of Defender for Cloud data to Log Analytics
az security automation create \
  --name "export-to-law" \
  --resource-group "security-rg" \
  --scopes '[{"description": "subscription", "scopePath": "/subscriptions/{sub-id}"}]' \
  --sources '[{"eventSource": "Assessments"}, {"eventSource": "Alerts"}]' \
  --actions '[{
    "actionType": "LogAnalytics",
    "workspaceResourceId": "/subscriptions/{sub-id}/resourceGroups/security-rg/providers/Microsoft.OperationalInsights/workspaces/security-law"
  }]'
```

### Bicep: Enable Defender for Cloud Pricing Tiers

```bicep
targetScope = 'subscription'

@description('The Defender plans to enable.')
var defenderPlans = [
  { name: 'CloudPosture', tier: 'Standard' }
  { name: 'VirtualMachines', tier: 'Standard' }
  { name: 'KeyVaults', tier: 'Standard' }
  { name: 'Arm', tier: 'Standard' }
  { name: 'Containers', tier: 'Standard' }
]

resource defenderPricing 'Microsoft.Security/pricings@2024-01-01' = [for plan in defenderPlans: {
  name: plan.name
  properties: {
    pricingTier: plan.tier
  }
}]
```

---

## References

- [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction)
- [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management)
- [Secure Score in Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls)
- [Security recommendations reference](https://learn.microsoft.com/en-us/azure/defender-for-cloud/recommendations-reference)
- [Defender for Cloud pricing](https://learn.microsoft.com/en-us/azure/defender-for-cloud/plan-defender-for-cloud)
- [Governance rules in Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules)
- [Continuous export of Defender for Cloud data](https://learn.microsoft.com/en-us/azure/defender-for-cloud/continuous-export)
- [Azure Resource Graph queries for Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/resource-graph-samples)
- [Microsoft Cloud Security Benchmark](https://learn.microsoft.com/en-us/security/benchmark/azure/overview)
- [Defender for Cloud integration with Azure Policy](https://learn.microsoft.com/en-us/azure/defender-for-cloud/policy-reference)

---

Previous | Next
:--- | :---
[Chapter 10 — Regulatory Compliance](/guide/part-3-policy-compliance/ch10-regulatory-compliance.md) | [Chapter 12 — Resource Locks](/guide/part-3-policy-compliance/ch12-resource-locks.md)
