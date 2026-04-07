# Azure Governance Made Simple

[![Book](https://img.shields.io/badge/📖_Read_Online-azgovernance.com-blue?style=for-the-badge)](https://azgovernance.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)


> **The comprehensive, open-source reference guide to Azure Governance — from foundations to enterprise scale.**

## About This Book

**Azure Governance Made Simple** is a practitioner-oriented guide to designing, implementing, and operating cloud governance on Microsoft Azure. Written for Azure architects, platform engineers, Cloud Center of Excellence (CCoE) teams, and IT leaders, it provides the depth needed to build governance frameworks that balance developer agility with organizational control.

This book covers the full governance lifecycle:

- **Identity & Access** — RBAC, Microsoft Entra ID Governance, PIM, managed identities
- **Policy & Compliance** — Azure Policy deep dives, regulatory frameworks, Microsoft Defender for Cloud
- **Infrastructure as Code** — Bicep, Azure Verified Modules, Deployment Stacks, governance CI/CD pipelines
- **Cost Governance** — Azure Cost Management, FinOps practices, budget automation
- **Observability** — Azure Monitor dashboards, Azure Resource Graph queries, AzGovViz
- **Governance at Scale** — Azure Landing Zones, Azure Arc, sovereign clouds, data governance with Microsoft Purview, AI governance

All content is aligned with the [Microsoft Cloud Adoption Framework](https://learn.microsoft.com/azure/cloud-adoption-framework/) and the [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/).

### What Makes This Book Different

| Feature | Details |
|---------|---------|
| **Practitioner-first** | Every chapter includes architecture context, best practices, common pitfalls, and hands-on exercises with real Bicep, CLI, and KQL code |
| **Maturity model** | A Crawl → Walk → Run framework helps teams adopt governance incrementally, not as a big-bang project |
| **Decision trees** | Visual flowcharts for choosing between management groups vs. subscriptions, built-in vs. custom policies, and more |
| **Policy starter kit** | 39 production-ready Azure Policy definitions organized by governance pillar |
| **Resource Graph queries** | 20 ready-to-run KQL queries for governance visibility across your entire Azure estate |
| **Current as of April 2026** | Reflects the latest Azure service names, GA features, and deprecations (Entra ID, Deployment Stacks GA, Blueprints EOL) |

---

## 📖 Read the Book

**Online:** [azgovernance.com](https://azgovernance.com/)

---

## Table of Contents

### Part I — Foundations

| # | Chapter | Description |
|---|---------|-------------|
| 1 | [Why Azure Governance Matters](guide/part-1-foundations/ch01-why-governance-matters.md) | The business case for governance — risks, benefits, and the cost of doing nothing |
| 2 | [Governance at a Glance](guide/part-1-foundations/ch02-governance-at-a-glance.md) | End-to-end governance architecture map and pillar overview |
| 3 | [Cloud Governance Maturity Model](guide/part-1-foundations/ch03-governance-maturity-model.md) | Crawl → Walk → Run assessment framework with self-assessment checklist |
| 4 | [The Azure Resource Hierarchy](guide/part-1-foundations/ch04-resource-hierarchy.md) | Tenants, management groups, subscriptions, and resource groups — design patterns and anti-patterns |
| 5 | [Naming & Tagging Strategy](guide/part-1-foundations/ch05-naming-tagging-strategy.md) | Naming conventions, tagging taxonomy, and policy enforcement for tags |

### Part II — Identity & Access Governance

| # | Chapter | Description |
|---|---------|-------------|
| 6 | [Role-Based Access Control (RBAC)](guide/part-2-identity-access/ch06-rbac.md) | Built-in vs. custom roles, scope strategy, least-privilege patterns |
| 7 | [Microsoft Entra ID Governance](guide/part-2-identity-access/ch07-entra-id-governance.md) | PIM, access reviews, entitlement management, lifecycle workflows |
| 8 | [Managed Identities & Workload Identity](guide/part-2-identity-access/ch08-managed-identities.md) | System vs. user-assigned identities, workload identity federation |

### Part III — Policy & Compliance

| # | Chapter | Description |
|---|---------|-------------|
| 9 | [Azure Policy — Deep Dive](guide/part-3-policy-compliance/ch09-azure-policy.md) | Core concepts, effects, Machine Configuration, EPAC, remediation, 39 starter policies |
| 10 | [Regulatory Compliance](guide/part-3-policy-compliance/ch10-regulatory-compliance.md) | Microsoft Cloud Security Benchmark, compliance frameworks, audit evidence |
| 11 | [Microsoft Defender for Cloud](guide/part-3-policy-compliance/ch11-defender-for-cloud.md) | CSPM, workload protection plans, security posture governance |
| 12 | [Resource Locks](guide/part-3-policy-compliance/ch12-resource-locks.md) | CanNotDelete vs. ReadOnly locks, automation patterns, who-locked-what queries |

### Part IV — Infrastructure as Code & Deployment Governance

| # | Chapter | Description |
|---|---------|-------------|
| 13 | [Bicep & Azure Verified Modules](guide/part-4-iac-deployment/ch13-bicep-avm.md) | Bicep fundamentals, AVM registry, governance-as-code patterns |
| 14 | [Deployment Stacks](guide/part-4-iac-deployment/ch14-deployment-stacks.md) | Managed resource lifecycle, deny settings, drift protection |
| 15 | [Template Specs & Reusable Modules](guide/part-4-iac-deployment/ch15-template-specs.md) | Centralized template catalogs, versioning strategy |
| 16 | [Governance CI/CD Pipelines](guide/part-4-iac-deployment/ch16-governance-cicd.md) | GitHub Actions and Azure DevOps pipelines for policy-as-code |

### Part V — Cost Governance & FinOps

| # | Chapter | Description |
|---|---------|-------------|
| 17 | [Azure Cost Management](guide/part-5-cost-finops/ch17-cost-management.md) | Cost analysis, exports, anomaly detection, advisor recommendations |
| 18 | [FinOps Practices on Azure](guide/part-5-cost-finops/ch18-finops.md) | FinOps Framework adoption, team models, showback/chargeback |
| 19 | [Budgets, Alerts & Cost Automation](guide/part-5-cost-finops/ch19-cost-automation.md) | Automated budget enforcement with Action Groups and Logic Apps |

### Part VI — Governance Observability

| # | Chapter | Description |
|---|---------|-------------|
| 20 | [Azure Monitor & Dashboards](guide/part-6-observability/ch20-azure-monitor.md) | Activity log governance, diagnostic settings, Azure Workbooks |
| 21 | [Azure Resource Graph](guide/part-6-observability/ch21-resource-graph.md) | KQL queries for governance visibility across your estate |
| 22 | [Azure Governance Visualizer](guide/part-6-observability/ch22-azgovviz.md) | AzGovViz setup, CI/CD integration, interpreting the output |

### Part VII — Governance at Scale

| # | Chapter | Description |
|---|---------|-------------|
| 23 | [Azure Landing Zones](guide/part-7-at-scale/ch23-azure-landing-zones.md) | ALZ architecture, platform vs. application landing zones |
| 24 | [Azure Arc](guide/part-7-at-scale/ch24-azure-arc.md) | Hybrid and multicloud governance with Arc-enabled servers and Kubernetes |
| 25 | [Sovereign Landing Zones](guide/part-7-at-scale/ch25-sovereign-landing-zones.md) | Data residency, sovereign clouds, confidential computing |
| 26 | [Data Governance with Microsoft Purview](guide/part-7-at-scale/ch26-data-governance-purview.md) | Data catalog, classification, lineage, and access policies |
| 27 | [AI Governance & Responsible AI](guide/part-7-at-scale/ch27-ai-governance.md) | Azure AI governance controls, content safety, model monitoring |

### Part VIII — Putting It All Together

| # | Chapter | Description |
|---|---------|-------------|
| 28 | [Governance Roadmap](guide/part-8-synthesis/ch28-governance-roadmap.md) | 90-day implementation plan aligned to the maturity model |
| 29 | [Real-World Case Studies](guide/part-8-synthesis/ch29-case-studies.md) | Three scenarios: startup, enterprise migration, regulated industry |
| 30 | [Frequently Asked Questions](guide/part-8-synthesis/ch30-faq.md) | Answers to the 20 most common Azure governance questions |

### Appendices

| | Appendix | Description |
|---|----------|-------------|
| A | [Glossary](guide/appendices/appendix-a-glossary.md) | Definitions of key Azure governance terms |
| B | [Decision Trees](guide/appendices/appendix-b-decision-trees.md) | Visual flowcharts for common governance decisions |
| C | [Policy Starter Kit](guide/appendices/appendix-c-policy-starter-kit.md) | 39 production-ready policy definitions by governance pillar |
| D | [Resource Graph Queries](guide/appendices/appendix-d-resource-graph-queries.md) | 20 ready-to-run KQL queries for governance reporting |
| E | [Learning Resources](guide/appendices/appendix-e-learning-resources.md) | Microsoft Learn paths, certifications, and community resources |
| F | [Changelog](guide/appendices/appendix-f-changelog.md) | Version history and update log |

---

## 🚀 Quick Start

If you're new to Azure governance, start here:

1. **[Chapter 1 — Why Governance Matters](guide/part-1-foundations/ch01-why-governance-matters.md)** — Understand the business case
2. **[Chapter 2 — Governance at a Glance](guide/part-1-foundations/ch02-governance-at-a-glance.md)** — See the big picture
3. **[Chapter 3 — Maturity Model](guide/part-1-foundations/ch03-governance-maturity-model.md)** — Assess where you are today
4. **[Chapter 28 — Governance Roadmap](guide/part-8-synthesis/ch28-governance-roadmap.md)** — Get a 90-day plan

If you're building a governance framework for an existing Azure environment:

1. **[Appendix B — Decision Trees](guide/appendices/appendix-b-decision-trees.md)** — Make key design decisions
2. **[Appendix C — Policy Starter Kit](guide/appendices/appendix-c-policy-starter-kit.md)** — Deploy baseline policies
3. **[Appendix D — Resource Graph Queries](guide/appendices/appendix-d-resource-graph-queries.md)** — Assess your current state

---

## Contributing

Contributions are welcome! Whether it's fixing a typo, updating a stale link, or adding a new Resource Graph query — every contribution helps keep this resource accurate for the global Azure community.

Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request. It includes terminology standards, the chapter template, and submission guidelines.

## Author

**Ricardo Martins** — Cloud Solution Architect at Microsoft, focused on Azure governance, platform engineering, and the Cloud Adoption Framework.

- 🔗 [ricmmartins.github.io](https://ricmmartins.github.io/)
- 🐙 [github.com/ricmmartins](https://github.com/ricmmartins)

## License

This project is licensed under the **GPL-3.0 License** — see the LICENSE file at the repository root for details.

---

*If this book helped you, consider ⭐ starring the repository and sharing it with your team.*
