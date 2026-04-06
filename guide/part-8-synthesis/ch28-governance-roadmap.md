# Chapter 28 — Governance Roadmap

> Last verified: 2026-04-06

---

## Overview

Implementing Azure governance is not a one-time project — it is a continuous journey. This chapter provides a phased implementation roadmap, a comprehensive checklist organized by governance pillar, and guidance on tools and next steps for sustaining your governance posture.

The roadmap is organized into three phases based on the **Crawl-Walk-Run** maturity model:

- **Month 1–3 (Crawl):** Establish foundational governance — identity, naming, core policies, basic cost controls
- **Month 3–6 (Walk):** Formalize governance — management group hierarchy, Policy as Code, RBAC strategy, security baselines
- **Month 6–12 (Run):** Scale governance — Landing Zones, advanced security, FinOps, automation, continuous compliance

---

## Phase 1 — Foundation (Month 1–3)

**Goal:** Establish the minimum viable governance posture so that workloads can be deployed safely.

| Week | Activity | Outcome |
|---|---|---|
| 1–2 | Configure Microsoft Entra ID tenant: enable MFA, configure Conditional Access for admins, set up emergency access accounts | Identity foundation secured |
| 2–3 | Define naming convention and tagging strategy | Documented naming standard; mandatory tags defined |
| 3–4 | Create initial management group structure (at minimum: Production, Non-Production, Sandbox) | Organizational hierarchy in place |
| 4–6 | Assign core Azure Policies in Audit mode: required tags, allowed regions, allowed resource types | Compliance baseline visibility |
| 6–8 | Set up Azure Budgets and cost alerts for each subscription | Cost visibility and overspend protection |
| 8–10 | Enable Microsoft Defender for Cloud (free tier) on all subscriptions | Security posture visibility |
| 10–12 | Configure Azure Monitor and create a central Log Analytics workspace | Centralized logging |

**Key deliverables:**
- ✅ Microsoft Entra ID configured with MFA and Conditional Access
- ✅ Naming convention and tagging standard documented
- ✅ Initial management group hierarchy deployed
- ✅ Core policies assigned (Audit mode)
- ✅ Budgets and cost alerts configured
- ✅ Defender for Cloud enabled
- ✅ Central Log Analytics workspace operational

---

## Phase 2 — Formalization (Month 3–6)

**Goal:** Move from ad-hoc governance to formalized, repeatable processes.

| Week | Activity | Outcome |
|---|---|---|
| 1–2 | Design RBAC strategy: define custom roles, implement PIM for privileged roles | Least-privilege access enforced |
| 2–4 | Move policies from Audit to Deny/DeployIfNotExists for critical controls | Proactive policy enforcement |
| 4–6 | Implement Policy as Code: store policies in Git, deploy via CI/CD pipeline | Governance changes are versioned and reviewed |
| 6–8 | Enable Defender for Cloud paid plans (CSPM, server protection) and apply MCSB | Advanced security baselines |
| 8–10 | Schedule Microsoft Entra ID Access Reviews for privileged roles | Periodic access certification |
| 10–12 | Deploy resource locks on critical infrastructure (subscriptions, networking, identity) | Protection against accidental deletion |

**Key deliverables:**
- ✅ RBAC strategy documented and implemented
- ✅ PIM enabled for all privileged roles
- ✅ Core policies enforcing (Deny/DINE)
- ✅ Policy as Code pipeline operational
- ✅ MCSB applied; Secure Score tracked
- ✅ Access Reviews scheduled (quarterly)
- ✅ Resource locks on critical resources

---

## Phase 3 — Scale (Month 6–12)

**Goal:** Enable self-service at scale with guardrails.

| Week | Activity | Outcome |
|---|---|---|
| 1–4 | Deploy Azure Landing Zone (ALZ Accelerator or custom) | Standardized, scalable environment |
| 4–6 | Implement subscription vending for automated subscription provisioning | Self-service with guardrails |
| 6–8 | Onboard hybrid resources with Azure Arc | Consistent governance across environments |
| 8–10 | Implement FinOps practices: cost allocation, chargeback, optimization reviews | Cost accountability |
| 10–12 | Deploy AzGovViz for automated governance reporting | Continuous governance visibility |
| 12+ | Establish regular governance review cadence (monthly) | Sustained governance posture |

**Key deliverables:**
- ✅ Azure Landing Zone deployed and operational
- ✅ Subscription vending automated
- ✅ Hybrid resources governed via Azure Arc
- ✅ FinOps practices operational
- ✅ AzGovViz running on schedule
- ✅ Monthly governance review established

---

## Implementation Checklist by Governance Pillar

### Identity

- [ ] Microsoft Entra ID tenant configured
- [ ] Multi-factor authentication (MFA) enforced for all users
- [ ] Conditional Access policies deployed for administrators
- [ ] Emergency access (break-glass) accounts created and secured
- [ ] Privileged Identity Management (PIM) enabled for all privileged roles
- [ ] Access Reviews scheduled for privileged roles (quarterly)
- [ ] Workload identity federation configured for CI/CD pipelines
- [ ] Service principal inventory reviewed and credentials rotated
- [ ] Managed identities used instead of service principals where possible
- [ ] Microsoft Entra ID Protection enabled

### Organization

- [ ] Management group hierarchy designed and deployed
- [ ] Subscriptions created and placed in correct management groups
- [ ] Naming convention defined and documented
- [ ] Tagging strategy defined with mandatory tags
- [ ] Resource group structure standardized
- [ ] Subscription vending process defined (manual or automated)

### Policy

- [ ] Core policies assigned at top-level management group
- [ ] Allowed regions policy enforced
- [ ] Required tags policy enforced
- [ ] Compliance baseline established and tracked
- [ ] Policy as Code pipeline implemented
- [ ] Policy exemptions documented and reviewed regularly
- [ ] Custom policies created for organization-specific requirements
- [ ] Initiative (policy set) definitions organized by purpose

### Cost

- [ ] Azure Budgets set for each subscription and resource group
- [ ] Cost alerts configured (50%, 75%, 90%, 100% thresholds)
- [ ] Cost allocation tags defined and enforced
- [ ] Monthly cost review process established
- [ ] FinOps practices initiated (showback/chargeback)
- [ ] Azure Advisor cost recommendations reviewed regularly
- [ ] Reserved Instances / Savings Plans evaluated

### Security

- [ ] Microsoft Defender for Cloud enabled on all subscriptions
- [ ] Microsoft Cloud Security Benchmark (MCSB) applied
- [ ] Secure Score tracked and improvement plan established
- [ ] Microsoft Defender for Cloud regulatory compliance dashboard configured
- [ ] Network security: NSGs, Azure Firewall, or third-party NVAs deployed
- [ ] Key Vault deployed for secrets, keys, and certificates
- [ ] Diagnostic settings configured for security-relevant services
- [ ] Incident response plan documented

### Operations

- [ ] Azure Monitor configured with central Log Analytics workspace
- [ ] Alert rules created for critical infrastructure
- [ ] Azure Resource Graph queries developed for governance reporting
- [ ] AzGovViz deployed and running on schedule
- [ ] Azure Update Manager configured for patch compliance
- [ ] Backup and disaster recovery validated
- [ ] Governance dashboard or workbook created

---

## Tools Summary

| Tool | Purpose | Link |
|---|---|---|
| **AzGovViz** | Automated governance hierarchy visualization and reporting | [GitHub](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting) |
| **Azure DevOps Governance Generator** | Generate an Azure DevOps project pre-populated with governance work items | [aka.ms/azgovernancereadiness](https://aka.ms/azgovernancereadiness) |
| **Landing Zone Review Workbook** | Azure Monitor workbook to validate CAF landing zone best practices | [GitHub](https://github.com/Azure/fta-landingzone) |
| **Enterprise Policy as Code (EPAC)** | Manage Azure Policy at scale using Git and CI/CD pipelines | [GitHub](https://github.com/Azure/enterprise-azure-policy-as-code) |
| **Azure Verified Modules (AVM)** | Official, tested Bicep/Terraform modules for Azure resources | [aka.ms/AVM](https://aka.ms/AVM) |
| **Maester** | Automated testing for Microsoft Entra ID and Azure security configuration | [GitHub](https://github.com/maester365/maester) |
| **Azure Resource Graph Explorer** | Query and explore Azure resources at scale | [Portal](https://portal.azure.com/#blade/HubsExtension/ArgQueryBlade) |

---

## Where to Go from Here

1. **Assess your current maturity** — Use the checklist above to identify gaps in your governance posture. Not every organization needs every control from day one.

2. **Start small, iterate often** — Governance is a journey. Begin with the Phase 1 foundation and build from there. A simple governance posture that is actually followed is better than an elaborate one that is ignored.

3. **Automate everything** — Manual governance processes do not scale. Invest in Policy as Code, subscription vending, and automated reporting as soon as your team is ready.

4. **Build a governance community** — Governance is not solely the responsibility of the cloud platform team. Involve security, compliance, finance, and application teams. Establish a Cloud Center of Excellence (CCoE) or governance board.

5. **Stay current** — Azure evolves rapidly. Subscribe to Azure updates, review the Cloud Adoption Framework quarterly, and update your governance policies as new capabilities emerge.

6. **Measure and report** — Use Azure Resource Graph, Defender for Cloud Secure Score, and AzGovViz to produce regular governance reports. What gets measured gets managed.

7. **Share your knowledge** — Contribute to the Azure governance community. Share your custom policies, Resource Graph queries, and lessons learned.

---

## References

- [Cloud Adoption Framework — Govern](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/)
- [Azure Governance Best Practices](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/guides/)
- [AzGovViz](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting)
- [Enterprise Policy as Code (EPAC)](https://github.com/Azure/enterprise-azure-policy-as-code)
- [Azure Verified Modules](https://azure.github.io/Azure-Verified-Modules/)
- [Azure DevOps Governance Generator](https://aka.ms/azgovernancereadiness)
- [CAF Landing Zone Review Workbook](https://github.com/Azure/fta-landingzone)
- [Microsoft Cloud Security Benchmark](https://learn.microsoft.com/security/benchmark/azure/overview)

---

| Previous | Next |
|:---|:---|
| [AI Governance](../part-7-at-scale/ch27-ai-governance.md) | [Case Studies](ch29-case-studies.md) |
