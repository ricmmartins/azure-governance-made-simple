# Chapter 3 — Cloud Governance Maturity Model

> **Last verified: 2026-04-06**

---

## Overview

Not every organization needs (or is ready for) a fully optimized governance framework on day one. Governance maturity is a journey. Trying to implement every control at once creates friction, slows adoption, and risks alienating the engineering teams whose cooperation you need most.

This chapter introduces a **three-level maturity model** — Crawl, Walk, Run — that helps you assess where your organization stands today and provides a clear path forward. Each level is described across five governance dimensions: Identity, Policy, Cost, Security, and Operations.

The model is aligned with the [CAF Govern methodology](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/), which recommends an incremental approach: establish a minimum viable product (MVP) governance foundation and then iterate as your cloud footprint grows.

---

## Architecture: The Three Maturity Levels

```
  ┌───────────────────────────────────────────────────────────────────┐
  │                                                                   │
  │   RUN (Optimized)       Automated · Proactive · Self-healing      │
  │   ──────────────────────────────────────────────────────────────── │
  │   WALK (Defined)        Standardized · Enforced · Measured        │
  │   ──────────────────────────────────────────────────────────────── │
  │   CRAWL (Ad-Hoc)        Reactive · Manual · Inconsistent          │
  │                                                                   │
  └───────────────────────────────────────────────────────────────────┘
```

---

## How It Works: Maturity Levels in Detail

### Level 1 — Crawl (Ad-Hoc)

At the Crawl level, the organization has started using Azure, but governance is **reactive and inconsistent**. There is no formal governance strategy. Controls are applied manually, if at all.

| Dimension | What It Looks Like |
|---|---|
| **Identity** | Users have standing privileged access. Shared accounts may exist. No formal access review process. Microsoft Entra ID is configured, but Conditional Access policies are minimal or absent. |
| **Policy** | Few or no Azure Policies are assigned. Policy decisions are made ad-hoc by individual teams. No management group hierarchy beyond the root. |
| **Cost** | No budgets or cost alerts. Spending surprises are discovered at invoice time. No tag-based cost allocation. Orphaned resources accumulate. |
| **Security** | Microsoft Defender for Cloud is in free tier or not reviewed. Network security groups are inconsistently configured. No encryption-at-rest policy. |
| **Operations** | Resources are named inconsistently. No standard tagging. Deployments are manual (portal clicks). No infrastructure as code. Monitoring is per-resource, not centralized. |

**Typical characteristics:**
- 1–5 subscriptions, usually created without a plan
- No Cloud Center of Excellence (CCoE) or governance team
- "It works" is the success criterion

---

### Level 2 — Walk (Defined)

At the Walk level, the organization has established **standards and enforcement mechanisms**. Governance is documented, policies are assigned, and there is a team responsible for governance decisions.

| Dimension | What It Looks Like |
|---|---|
| **Identity** | RBAC roles are assigned following least privilege. Privileged Identity Management (PIM) is enabled for critical roles. Access reviews are conducted quarterly. |
| **Policy** | A management group hierarchy exists. Azure Policy assignments enforce foundational rules (allowed regions, required tags, approved SKUs). Policy compliance is reviewed monthly. |
| **Cost** | Budgets and cost alerts are configured per subscription. Tags are used for cost allocation. Monthly cost reviews occur. Orphaned resource cleanup is periodic. |
| **Security** | Microsoft Defender for Cloud is enabled with enhanced security. Security recommendations are triaged. Diagnostic settings route logs to a central Log Analytics workspace. |
| **Operations** | A naming convention is defined and documented. Core infrastructure is deployed via Bicep or Terraform. Centralized monitoring with Azure Monitor. Deployment Stacks or CI/CD pipelines manage environment consistency. |

**Typical characteristics:**
- Management group hierarchy in place
- Cloud Center of Excellence (CCoE) established or emerging
- Governance treated as a workstream, not an afterthought

---

### Level 3 — Run (Optimized)

At the Run level, governance is **automated, proactive, and continuously improving**. The organization uses data-driven insights to optimize policies and predict issues before they occur.

| Dimension | What It Looks Like |
|---|---|
| **Identity** | Zero-standing-access for all privileged roles. Entitlement management automates access packages. Continuous access evaluation is enabled. Workload identities use managed identities exclusively. |
| **Policy** | Policy-as-code is fully integrated into CI/CD. Custom policies address organization-specific requirements. Policy exemptions are tracked and time-bound. Compliance dashboards are reviewed in real time. |
| **Cost** | FinOps practices are mature. Reservation and savings plan utilization is optimized. Anomaly detection alerts on unexpected spending. Chargeback/showback models are fully implemented. Tag governance is enforced automatically. |
| **Security** | Microsoft Defender for Cloud Secure Score is actively managed (target >80%). Automated remediation tasks fix common misconfigurations. Security posture is reported to leadership. Threat detection and response are integrated with SIEM/SOAR. |
| **Operations** | All infrastructure is deployed via IaC through CI/CD pipelines. Drift detection identifies manual changes. Azure Resource Graph powers custom governance dashboards. Subscription vending automates new workload onboarding. Azure Governance Visualizer runs on a schedule. |

**Typical characteristics:**
- Dozens to hundreds of subscriptions, all governed consistently
- Mature CCoE with defined processes and SLAs
- Governance metrics reported to leadership alongside other KPIs

---

## Self-Assessment Checklist

Use the following table to assess your organization's current maturity level. For each item, mark your current state.

| # | Governance Control | Crawl | Walk | Run |
|---|---|---|---|---|
| 1 | Management group hierarchy defined | ☐ No hierarchy | ☐ Basic hierarchy | ☐ CAF-aligned hierarchy with segmentation |
| 2 | Azure Policy assigned at MG scope | ☐ No policies | ☐ Foundational policies (regions, tags) | ☐ Policy-as-code in CI/CD with custom policies |
| 3 | RBAC follows least privilege | ☐ Broad Owner/Contributor | ☐ Role assignments reviewed quarterly | ☐ PIM + zero standing access |
| 4 | Naming convention defined | ☐ Ad-hoc naming | ☐ Documented convention | ☐ Convention enforced via policy |
| 5 | Tagging strategy implemented | ☐ No tags or inconsistent | ☐ Required tags enforced | ☐ Tag inheritance + compliance dashboards |
| 6 | Cost budgets and alerts | ☐ None | ☐ Per-subscription budgets | ☐ FinOps with anomaly detection |
| 7 | Microsoft Defender for Cloud | ☐ Free tier / not reviewed | ☐ Enhanced tier, recommendations triaged | ☐ Secure Score managed, auto-remediation |
| 8 | Infrastructure as Code | ☐ Manual / portal | ☐ Bicep/Terraform for core infra | ☐ All deployments via IaC + CI/CD |
| 9 | Centralized monitoring | ☐ Per-resource only | ☐ Central Log Analytics workspace | ☐ Unified dashboards, alerting, and AIOps |
| 10 | Subscription vending | ☐ Manual subscription creation | ☐ Templated process | ☐ Fully automated vending machine |
| 11 | Governance reporting | ☐ None | ☐ Monthly compliance reviews | ☐ Real-time dashboards + leadership reporting |
| 12 | Access reviews | ☐ No reviews | ☐ Quarterly manual reviews | ☐ Automated recurring access reviews |

**Scoring:**
- **Mostly Crawl:** Focus on establishing your governance MVP — management group hierarchy, foundational policies, and a naming convention.
- **Mostly Walk:** You have a solid foundation. Focus on automation, enforcement, and expanding policy coverage.
- **Mostly Run:** You are operating at a mature level. Focus on continuous improvement, optimization, and innovation.

---

## Best Practices

1. **Do not skip levels.** Each maturity level builds on the previous one. Jumping from Crawl to Run without establishing Walk-level foundations creates fragile governance.
2. **Start with an MVP governance foundation.** The CAF recommends starting with: one management group hierarchy, a small set of foundational policies, a naming convention, and RBAC assignments. This is your Crawl-to-Walk transition.
3. **Iterate based on risk.** As your cloud footprint grows, add governance controls where risk is highest. Do not try to govern everything at once.
4. **Measure and report.** Governance without measurement is governance without accountability. Track policy compliance rates, Secure Score, cost variance, and access review completion.
5. **Invest in automation at Walk level.** The transition from Walk to Run is primarily about automation — policy-as-code, subscription vending, IaC pipelines, and automated remediation.

---

## Common Pitfalls

| Pitfall | Why It Hurts | What to Do Instead |
|---|---|---|
| Attempting Run-level controls on a Crawl-level foundation | Complex policies fail without a management group hierarchy, naming, and RBAC | Build the foundation first; complexity comes later |
| No governance team or CCoE | Governance becomes nobody's job, so it does not get done | Establish a cross-functional governance team by Walk level |
| Treating maturity as a one-time assessment | Cloud environments change; maturity can regress | Reassess quarterly and adjust controls as the environment evolves |
| Focusing only on security governance | Cost overruns and operational chaos are just as damaging as security breaches | Address all five dimensions: Identity, Policy, Cost, Security, Operations |
| Ignoring developer experience | Governance that makes developers less productive will be circumvented | Design controls that are transparent when teams follow the rules |

---

## Recommended Actions by Level Transition

### Crawl → Walk

| Action | Priority |
|---|---|
| Design and implement a management group hierarchy | 🔴 Critical |
| Define and document a naming convention | 🔴 Critical |
| Assign foundational Azure Policies (allowed regions, required tags) | 🔴 Critical |
| Enable Microsoft Defender for Cloud enhanced security | 🟡 High |
| Configure cost budgets and alerts per subscription | 🟡 High |
| Implement RBAC with least privilege | 🟡 High |
| Enable PIM for Global Admin and Subscription Owner roles | 🟡 High |
| Adopt Bicep or Terraform for core infrastructure | 🟢 Medium |
| Establish a Cloud Center of Excellence (CCoE) | 🟢 Medium |

### Walk → Run

| Action | Priority |
|---|---|
| Implement policy-as-code with CI/CD deployment | 🔴 Critical |
| Automate subscription vending | 🟡 High |
| Deploy Azure Governance Visualizer on a schedule | 🟡 High |
| Implement FinOps practices with chargeback/showback | 🟡 High |
| Enable automated remediation in Defender for Cloud | 🟡 High |
| Deploy Deployment Stacks for managed environment lifecycle | 🟢 Medium |
| Implement drift detection for IaC-managed resources | 🟢 Medium |
| Build governance dashboards with Azure Resource Graph + workbooks | 🟢 Medium |
| Achieve and maintain Defender for Cloud Secure Score > 80% | 🟢 Medium |

---

## Code Samples

### Azure Resource Graph — Governance Maturity Dashboard Query

This query counts resources by compliance state, giving you a quick maturity signal:

```kusto
policyresources
| where type == "microsoft.policyinsights/policystates"
| summarize
    compliant = countif(properties.complianceState == "Compliant"),
    nonCompliant = countif(properties.complianceState == "NonCompliant"),
    exempt = countif(properties.complianceState == "Exempt")
| extend total = compliant + nonCompliant + exempt
| extend complianceRate = round(100.0 * compliant / total, 2)
```

### Azure CLI — Check Defender for Cloud Secure Score

```bash
az security secure-score-controls list \
  --output table \
  --query "[].{Control:displayName, Score:score.current, Max:score.max}"
```

---

## Hands-On Exercise

**Scenario:** You have been asked to assess your organization's governance maturity and propose a roadmap.

1. **Complete the self-assessment checklist** above for your organization.
2. **Identify your current maturity level** (Crawl, Walk, or Run) for each of the five dimensions.
3. **Pick the two dimensions with the lowest maturity** and identify three specific actions from the "Recommended Actions" tables that would move those dimensions up one level.
4. **Write a one-page governance roadmap** with quarterly milestones for the next 12 months.

> **Tip:** Use the [CAF Govern methodology](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) as your reference framework when building the roadmap.

---

## References

| Resource | Link |
|---|---|
| CAF Govern methodology | [learn.microsoft.com/azure/cloud-adoption-framework/govern/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) |
| Standard enterprise governance guide | [learn.microsoft.com/azure/cloud-adoption-framework/govern/guides/standard/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/guides/standard/) |
| Cloud Center of Excellence (CCoE) functions | [learn.microsoft.com/azure/cloud-adoption-framework/organize/cloud-center-of-excellence](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/cloud-center-of-excellence) |
| FinOps with Azure | [learn.microsoft.com/azure/cost-management-billing/finops/](https://learn.microsoft.com/azure/cost-management-billing/finops/) |

---

| Previous | Next |
|:---|:---|
| [Chapter 2 — Governance at a Glance](ch02-governance-at-a-glance.md) | [Chapter 4 — Resource Hierarchy](ch04-resource-hierarchy.md) |
