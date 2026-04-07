# Chapter 18 — FinOps

> Last verified: 2026-04-06

---

## Overview

**FinOps** (Financial Operations) is a cultural practice and operational framework that brings financial accountability to cloud spending. It unites engineering, finance, and business teams around data-driven decisions about where and how to invest in cloud resources.

FinOps is not a tool or a product — it's a **discipline** defined by the [FinOps Foundation](https://www.finops.org/) (part of The Linux Foundation). Azure provides the tooling, but FinOps is the practice that makes those tools effective.

Why governance teams should care about FinOps:

- Governance defines *what can be deployed*; FinOps ensures *what is deployed is cost-efficient*
- Tags, policies, and budgets are governance controls; FinOps is the operating model that makes them meaningful
- Without FinOps, cost optimization is reactive (responding to overruns) instead of proactive (optimizing continuously)

---

## How It Works

### The FinOps Framework

The FinOps Foundation defines three phases that organizations cycle through continuously:

![FinOps Lifecycle](/images/finops-lifecycle.svg)

#### Phase 1: Inform

**Goal:** Create visibility into cloud costs so teams can make informed decisions.

Activities:
- **Showback/chargeback reporting** — attribute costs to teams, projects, and cost centers
- **Tagging strategy** — enforce consistent tags for cost allocation
- **Dashboards** — build real-time cost visibility for engineering and finance
- **Anomaly detection** — surface unexpected spending patterns
- **Forecasting** — project future costs based on trends and committed plans

Azure tools: Cost Management, Cost Allocation Rules, Azure Resource Tags, Power BI integration

#### Phase 2: Optimize

**Goal:** Reduce cloud waste and improve pricing through commitment-based discounts.

Activities:
- **Right-sizing** — match resource SKUs to actual workload requirements
- **Savings Plans** — commit to hourly compute spend for up to 65% savings
- **Reservations** — commit to specific SKUs for up to 72% savings
- **Spot VMs** — use spare capacity at up to 90% discount for fault-tolerant workloads
- **Storage tiering** — move data to cool/archive tiers based on access patterns
- **Resource cleanup** — identify and delete orphaned resources (unattached disks, unused IPs, stopped VMs)

Azure tools: Azure Advisor, Savings Plans, Reservations, Azure Spot VMs, Storage lifecycle management

#### Phase 3: Operate

**Goal:** Embed FinOps into organizational processes so cost optimization is continuous, not one-time.

Activities:
- **Governance policies** — enforce tagging, budget limits, and approved SKUs
- **Automated actions** — auto-shutdown dev/test resources, auto-remediate policy violations
- **Regular reviews** — monthly cost reviews with engineering leads and finance
- **KPIs** — track metrics like cost per unit of business value (e.g., cost per transaction, cost per user)
- **Culture** — celebrate cost optimization wins; make cost awareness part of engineering culture

Azure tools: Azure Policy, Budgets with action groups, Azure Automation, Logic Apps

### FinOps Maturity Model

The FinOps Foundation defines three maturity levels:

| Level | Name | Characteristics |
|-------|------|-----------------|
| **1** | **Crawl** | Basic visibility; reactive cost management; limited tagging; no commitment-based pricing |
| **2** | **Walk** | Consistent tagging; active right-sizing; Savings Plans and Reservations in use; monthly cost reviews; some automation |
| **3** | **Run** | Real-time cost awareness; automated optimization; FinOps culture embedded in engineering; advanced forecasting; continuous rate and usage optimization |

Most organizations start at Crawl and should target Walk within 6–12 months. Run is an ongoing aspiration.

### Showback vs. Chargeback

| Model | Description | Governance Impact |
|-------|-------------|-------------------|
| **Showback** | Costs are *shown* to teams for awareness, but not billed to their budget | Lower friction; good for building cost awareness culture |
| **Chargeback** | Costs are *charged back* to team budgets through internal billing | Higher accountability; requires mature tagging and allocation |

**Recommendation:** Start with showback to build visibility and trust, then move to chargeback as tagging and allocation mature.

**Azure implementation:**
- Use **cost allocation rules** to distribute shared costs
- Use **tags** (`CostCenter`, `Team`, `Project`) for direct attribution
- Use **management group hierarchy** to align billing with organizational structure
- Export cost data to **Power BI** or **Azure Data Explorer** for custom showback/chargeback dashboards

---

## Azure Tools for FinOps

| Tool | FinOps Phase | Purpose |
|------|-------------|---------|
| **Azure Cost Management** | Inform, Operate | Cost analysis, budgets, exports, anomaly detection |
| **Azure Advisor** | Optimize | Right-sizing, shutdown, reservation, and Savings Plan recommendations |
| **Azure Savings Plans** | Optimize | Commitment-based compute discounts (flexible across SKUs/regions) |
| **Azure Reservations** | Optimize | Commitment-based discounts for specific SKUs |
| **Azure Policy** | Operate | Enforce tagging, allowed SKUs, region restrictions |
| **Resource Tags** | Inform | Cost allocation dimensions |
| **Cost Allocation Rules** | Inform | Distribute shared costs |
| **Power BI / Azure Data Explorer** | Inform | Custom dashboards and reporting |
| **Azure Automation / Logic Apps** | Operate | Automated cost actions (shutdown, alerts) |
| **Azure Resource Graph** | Inform | Query resource inventory for orphan detection |

---

## Organizational Models for FinOps

### Central FinOps Team

A dedicated team owns the FinOps practice and provides tooling, reporting, and guidance to all engineering teams.

**Pros:** Consistent practices, centralized expertise, efficient tooling
**Cons:** Can become a bottleneck; teams may not feel ownership of costs

### Embedded FinOps

Each engineering team has a designated FinOps champion who owns cost optimization for their area.

**Pros:** Teams own their costs; faster action; deep context
**Cons:** Inconsistent practices; duplicated effort; requires training

### Hub-and-Spoke (Recommended)

A central FinOps team provides the platform (tools, dashboards, policies), while embedded champions in each team drive day-to-day optimization.

**Pros:** Best of both models; central standards with local execution
**Cons:** Requires coordination and communication

---

## Best Practices

1. **Start with Inform** — you can't optimize what you can't see; get visibility before optimizing
2. **Enforce tags from day one** — retroactive tagging is painful; use Azure Policy to require tags at resource creation
3. **Set team-level budgets** — give each team a budget and the tools to manage it
4. **Combine Savings Plans and Reservations** — use Savings Plans for flexible coverage and Reservations for stable workloads
5. **Review Advisor weekly** — assign an owner to triage and act on Advisor recommendations
6. **Automate what you can** — auto-shutdown, auto-remediation, and automated reporting reduce manual effort
7. **Make costs visible** — publish cost dashboards in team Slack/Teams channels
8. **Celebrate wins** — recognize teams that reduce waste; create incentive alignment
9. **Iterate maturity** — don't try to jump from Crawl to Run; progress through Walk first
10. **Align FinOps with governance** — FinOps and governance are complementary; your tagging policy, budget policy, and SKU restrictions serve both disciplines

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Starting with optimization before visibility | Optimizing the wrong things | Invest in tagging and cost analysis first |
| No executive sponsor | FinOps practice lacks authority and budget | Secure VP/CTO sponsorship before starting |
| Over-committing on Reservations | Paying for unused capacity | Start with Savings Plans; reserve only after analyzing 3+ months of usage |
| Treating FinOps as a one-time project | Benefits erode as usage patterns change | Embed FinOps into monthly operating rhythms |
| No tagging enforcement | Cannot allocate costs to teams | Use Azure Policy deny effects for required tags |
| Ignoring shared costs | Teams under-report actual costs | Configure cost allocation rules for shared infrastructure |

---

## References

- [FinOps Foundation](https://www.finops.org/)
- [FinOps Framework](https://www.finops.org/framework/)
- [FinOps with Azure](https://learn.microsoft.com/en-us/azure/cost-management-billing/finops/)
- [Azure Cost Management overview](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-overview)
- [Azure Savings Plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)
- [Azure Advisor cost recommendations](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations)
- [Cost allocation rules](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/allocate-costs)
- [FinOps review assessment](https://learn.microsoft.com/en-us/assessments/ad1c0f6b-396b-44a4-924b-7a4c778a13d3/)
- [Well-Architected Framework — Cost Optimization](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/)

---

| Previous | Next |
|:---------|:-----|
| [Cost Management](ch17-cost-management.md) | [Cost Automation](ch19-cost-automation.md) |
