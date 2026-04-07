# Chapter 29 — Case Studies

> Last verified: 2026-04-06

---

## Overview

This chapter presents three fictional but realistic case studies illustrating Azure governance implementations at different organizational scales. Each case study follows the **Crawl-Walk-Run** maturity model and demonstrates how governance decisions evolve as organizations grow.

---

## Case Study 1 — CloudBrew (Startup): Crawl Maturity

### The Scenario

**CloudBrew** is a 50-person SaaS startup building a cloud-native project management tool. They have been using Azure for 18 months with a single subscription, one development team, and about 40 Azure resources. Their CTO recently realized that their Azure environment has grown organically with no governance structure.

**Current state:**
- 1 Azure subscription
- 1 Microsoft Entra ID tenant (using default settings)
- ~40 resources across 3 resource groups (named `rg1`, `dev-stuff`, `production`)
- 5 developers with Owner access to the subscription
- No naming convention
- No tagging
- No budgets or cost alerts
- Monthly Azure spend: ~$3,500 (growing 15% month over month)

### The Challenges

1. **No naming convention** — Resources have inconsistent names, making it difficult to identify what belongs to whom
2. **Over-permissioned users** — All developers have Owner access to the entire subscription
3. **No cost visibility** — The CTO receives a monthly bill but has no breakdown by team or project
4. **No security baseline** — Microsoft Defender for Cloud has never been reviewed; MFA is optional
5. **Resource sprawl** — Orphaned resources (unused VMs, old storage accounts) are accumulating

### Governance Decisions

CloudBrew's CTO spent one week implementing foundational governance:

**Identity:**
- Enforced MFA for all users via Microsoft Entra ID Conditional Access
- Created two custom RBAC roles:
  - `CloudBrew Developer` — Contributor on the resource group, Reader on the subscription
  - `CloudBrew Admin` — Contributor on the subscription
- Removed Owner access from all developers; only two admins retained elevated access
- Created one emergency access (break-glass) account

**Organization:**
- Defined a naming convention: `{resource-type}-{app}-{environment}-{region}-{instance}`
- Renamed resource groups to: `rg-cloudbrew-prod-eastus`, `rg-cloudbrew-dev-eastus`, `rg-cloudbrew-shared-eastus`
- Defined three mandatory tags: `Environment`, `Owner`, `CostCenter`

**Policy:**
- Assigned three built-in policies (Audit mode):
  - Require `Environment` tag on resource groups
  - Allowed regions: East US, East US 2
  - Audit VMs that do not use managed disks

**Cost:**
- Set a $4,500/month budget on the subscription with alerts at 75% and 100%
- Reviewed Azure Advisor cost recommendations — found $420/month in savings from right-sizing VMs

**Security:**
- Enabled Microsoft Defender for Cloud (free tier)
- Reviewed Secure Score (initial: 32/100) and addressed the top 5 recommendations

### Outcomes

| Metric | Before | After (3 months) |
|---|---|---|
| Users with Owner access | 5 | 2 |
| Resources with required tags | 0% | 78% |
| Monthly cost | $3,500 | $3,080 (reduced + budget controlled) |
| Secure Score | 32 | 61 |
| Orphaned resources | Unknown | 7 identified and deleted |

**Time invested:** ~40 hours total (1 week of focused work + ongoing tagging)

**Key takeaway:** Even a minimal governance implementation — MFA, naming convention, basic RBAC, and budgets — dramatically improves a startup's cloud posture. You do not need a complex setup to start governing effectively.

---

## Case Study 2 — Meridian Financial (Mid-Market): Walk Maturity

### The Scenario

**Meridian Financial** is a 500-person financial services company with 10 Azure subscriptions, multiple development teams, and a growing cloud footprint. They adopted Azure two years ago and have been expanding rapidly. The cloud platform team (3 people) is struggling to keep up with governance demands.

**Current state:**
- 10 Azure subscriptions (no management group structure — all under Tenant Root Group)
- 1 Microsoft Entra ID tenant with Entra ID P1 licensing
- ~600 Azure resources across multiple subscriptions
- 8 development teams with varying levels of Azure expertise
- Basic naming convention (partially followed)
- Some tagging (inconsistent across teams)
- Budgets on 3 of 10 subscriptions
- Monthly Azure spend: ~$85,000
- Regulatory requirements: SOC 2, PCI-DSS for payment processing

### The Challenges

1. **No management group hierarchy** — All subscriptions sit directly under the Tenant Root Group, making it impossible to apply policies consistently
2. **Inconsistent RBAC** — Some teams use custom roles, others use built-in roles, and several service principals have Contributor access at the subscription level
3. **Policy gaps** — Policies exist on some subscriptions but not others; no central management
4. **Compliance pressure** — SOC 2 and PCI-DSS auditors are asking for evidence of consistent security controls
5. **Cost attribution** — Finance cannot attribute costs to specific teams or projects
6. **No IaC** — Most resources deployed via the portal or ad-hoc scripts

### Governance Decisions

The cloud platform team spent three months implementing a formal governance framework:

**Identity:**
- Upgraded to Microsoft Entra ID P2 for PIM and Access Reviews
- Enabled PIM for all privileged roles (Global Admin, Subscription Owner, Subscription Contributor)
- Scheduled quarterly Access Reviews for all privileged role assignments
- Migrated CI/CD pipelines from service principal secrets to workload identity federation
- Implemented Conditional Access: require compliant devices for Azure portal access

**Organization:**
- Designed management group hierarchy:

  ![Meridian Financial MG Hierarchy](/images/meridian-mg-hierarchy.svg)

- Moved all 10 subscriptions into the appropriate management groups
- Created 2 new subscriptions: Management and Connectivity

**Policy:**
- Implemented Enterprise Policy as Code (EPAC) with a GitHub Actions pipeline
- Assigned policies at the management group level:
  - Top-level: Required tags, allowed regions, audit MCSB
  - Corp: Enforce private endpoints, deny public IP addresses
  - Online: Enforce WAF on Application Gateway, require HTTPS
  - Sandbox: Enforce auto-shutdown on VMs, maximum VM size restrictions
- Created a PCI-DSS-specific initiative for the Corp management group

**Cost:**
- Defined mandatory tags: `CostCenter`, `Team`, `Project`, `Environment`
- Set budgets on every subscription with alerts routed to team leads
- Implemented monthly cost review meetings with team leads
- Identified $12,000/month in savings from orphaned resources and right-sizing

**Security:**
- Enabled Microsoft Defender for Cloud (Defender CSPM + server protection) on all subscriptions
- Applied MCSB as the compliance standard
- Deployed Azure Key Vault for each team with RBAC-based access
- Configured Defender for Cloud regulatory compliance for SOC 2 and PCI-DSS
- Initial Secure Score: 45 → Target: 75 within 6 months

**Operations:**
- Deployed AzGovViz running weekly via GitHub Actions
- Created Azure Monitor workbooks for governance dashboards
- Implemented Resource Graph queries for compliance reporting

### Outcomes

| Metric | Before | After (6 months) |
|---|---|---|
| Policy compliance rate | 42% (estimated) | 89% (measured) |
| Subscriptions with budgets | 3 of 10 | 12 of 12 (2 new platform subs) |
| Monthly cost | $85,000 | $73,000 (14% reduction) |
| Secure Score | 45 | 72 |
| PIM-protected roles | 0 | 100% of privileged roles |
| SOC 2 audit findings (governance) | 12 | 2 |
| Governance report frequency | Ad-hoc | Weekly (automated) |

**Time invested:** ~3 person-months across the platform team

**Key takeaway:** A management group hierarchy combined with Policy as Code transforms governance from reactive firefighting to proactive, automated enforcement. The investment pays for itself through cost savings and audit efficiency.

---

## Case Study 3 — GlobalTech Industries (Enterprise): Run Maturity

### The Scenario

**GlobalTech Industries** is a 5,000-person multinational manufacturing company with operations in North America, Europe, and Asia. They have been on Azure for four years and operate a mature cloud environment with strict regulatory requirements.

**Current state:**
- 120+ Azure subscriptions across multiple business units
- Microsoft Entra ID P2 with Microsoft Entra ID Governance
- ~15,000 Azure resources
- 40+ application teams across 3 continents
- Azure Landing Zone deployed 2 years ago (Hub-and-Spoke topology)
- On-premises datacenters in 5 locations (connected via ExpressRoute)
- 200+ on-premises servers managed via Azure Arc
- Monthly Azure spend: ~$1.2 million
- Regulatory requirements: SOC 2, ISO 27001, GDPR, HIPAA (for health benefits platform)

### The Challenges

1. **Scale** — With 120+ subscriptions, manual governance is impossible
2. **Multi-region compliance** — GDPR requires EU data to stay in EU; HIPAA requires specific controls for health data
3. **Hybrid governance** — 200+ on-premises servers need the same governance as Azure resources
4. **Shadow IT** — Teams deploying resources outside of the governed Landing Zone
5. **Cost management** — $1.2M/month spend requires sophisticated FinOps practices
6. **AI adoption** — Multiple teams experimenting with Azure OpenAI Service without centralized controls

### Governance Decisions

GlobalTech operates a mature governance framework with continuous improvement:

**Identity:**
- Microsoft Entra ID Governance fully deployed:
  - Entitlement Management for access packages
  - Access Reviews for all privileged roles (monthly) and application access (quarterly)
  - PIM for all administrative roles with time-limited activation (8 hours max)
- Conditional Access: location-based, device compliance, risk-based policies
- Workload identity federation for all CI/CD pipelines (zero standing credentials)
- Microsoft Entra Verified ID for partner access

**Organization:**
- Full ALZ management group hierarchy with per-region landing zones:

  ![GlobalTech MG Hierarchy](/images/globaltech-mg-hierarchy.svg)

- Subscription vending fully automated via Terraform module + ServiceNow integration
- Average time from subscription request to ready-to-use: 45 minutes

**Policy:**
- EPAC manages 200+ policy assignments across the management group hierarchy
- Custom policy initiatives for each regulatory framework (GDPR, HIPAA, PCI-DSS, ISO 27001)
- Policy exemption process with automated expiration and quarterly review
- Azure Machine Configuration policies for OS-level compliance on Arc-enabled servers
- New policies automatically deployed to Sandbox (Audit mode) for 2 weeks before enforcement

**Cost:**
- Dedicated FinOps team (2 people) with showback and chargeback to business units
- Azure Reservations for predictable workloads ($180K/year savings)
- Savings Plans for compute ($95K/year savings)
- Automated orphaned resource detection and cleanup pipeline
- Monthly FinOps review with business unit leaders
- Azure Cost Management exports to Power BI for executive dashboards

**Security:**
- Microsoft Defender for Cloud with all Defender plans enabled
- MCSB enforced across all subscriptions; Secure Score: 82
- Microsoft Defender for Cloud regulatory compliance tracking for SOC 2, ISO 27001, GDPR, HIPAA
- Microsoft Sentinel for SIEM/SOAR
- Weekly security posture reviews with the CISO office
- Defender for Containers on all AKS and Arc-enabled Kubernetes clusters

**Hybrid (Azure Arc):**
- 200+ on-premises servers onboarded to Azure Arc
- Same Azure Policy, RBAC, and monitoring applied to Arc-enabled servers
- Azure Update Manager for unified patch management
- Azure Machine Configuration for OS compliance (CIS benchmarks)
- Governance parity: on-premises servers have the same compliance posture as Azure VMs

**AI Governance:**
- Centralized Azure OpenAI Service in the Platform subscription
- Azure API Management as an AI gateway for all teams
- Content safety filters enforced on all deployments
- Token quota allocated per team with budget alerts
- AI governance board (CTO, CISO, Legal, Privacy) reviews new AI use cases
- Defender for Cloud Apps monitoring for shadow AI detection

**Operations:**
- AzGovViz running daily via Azure DevOps pipeline, reports published to SharePoint
- Custom Azure Monitor workbooks for governance, cost, and security dashboards
- Resource Graph queries automated and results published weekly
- Governance review board meets monthly
- Annual governance framework review aligned with regulatory audit cycle

### Outcomes

| Metric | Value |
|---|---|
| Policy compliance rate | 96.4% |
| Secure Score | 82 |
| Subscription provisioning time | 45 minutes (fully automated) |
| Monthly cost | $1.2M (controlled; 15% lower than unmanaged projection) |
| Annual cost savings from FinOps | $275K |
| Regulatory audit findings (governance) | 0 critical, 3 minor |
| Hybrid governance coverage | 100% of on-premises servers |
| Shadow AI incidents detected | 14 (addressed within 48 hours) |
| Governance report delivery | Daily (automated) |

**Key takeaway:** At enterprise scale, governance must be fully automated, continuously monitored, and deeply integrated with organizational processes. The combination of ALZ, Policy as Code, subscription vending, Arc, and FinOps creates a self-service platform with guardrails that enables teams to move fast without compromising compliance.

---

## Summary — Maturity at a Glance

| Capability | Crawl (CloudBrew) | Walk (Meridian) | Run (GlobalTech) |
|---|---|---|---|
| Identity | MFA + basic RBAC | PIM + Access Reviews | Identity Governance + Conditional Access |
| Organization | 1 subscription, naming convention | Management groups + hierarchy | Full ALZ + subscription vending |
| Policy | 3 audit-mode policies | EPAC + Deny/DINE | 200+ policies, custom initiatives per regulation |
| Cost | Budget + alerts | Team-level budgets + monthly reviews | FinOps team + chargeback + Reservations |
| Security | Defender (free) | Defender CSPM + MCSB | Full Defender + Sentinel + regulatory compliance |
| Operations | Manual checks | AzGovViz + workbooks | Daily automation + governance board |
| Hybrid | N/A | N/A | Azure Arc for 200+ servers |
| AI | N/A | N/A | Centralized AOAI + AI governance board |

---

| Previous | Next |
|:---|:---|
| [Governance Roadmap](ch28-governance-roadmap.md) | [FAQ](ch30-faq.md) |
