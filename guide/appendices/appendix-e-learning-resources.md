# Appendix E — Learning Resources

> Last verified: 2026-04-06

---

A curated collection of learning resources for Azure governance professionals.

---

## Microsoft Learn Paths

### Foundations

| Learning Path | Description | Link |
|---|---|---|
| **AZ-900: Azure Fundamentals** | Introduction to cloud concepts, Azure services, and governance basics | [learn.microsoft.com/training/paths/az-900-describe-cloud-concepts/](https://learn.microsoft.com/training/paths/az-900-describe-cloud-concepts/) |
| **Describe Azure Management and Governance** (AZ-900 module) | Management groups, policy, RBAC, cost management | [learn.microsoft.com/training/paths/describe-azure-management-governance/](https://learn.microsoft.com/training/paths/describe-azure-management-governance/) |

### Administration

| Learning Path | Description | Link |
|---|---|---|
| **AZ-104: Azure Administrator** | Comprehensive Azure administration including identity, governance, networking, compute, and storage | [learn.microsoft.com/training/paths/az-104-administrator-prerequisites/](https://learn.microsoft.com/training/paths/az-104-administrator-prerequisites/) |
| **Manage Identities and Governance in Azure** (AZ-104 module) | Microsoft Entra ID, RBAC, subscriptions, and governance | [learn.microsoft.com/training/paths/az-104-manage-identities-governance/](https://learn.microsoft.com/training/paths/az-104-manage-identities-governance/) |

### Architecture

| Learning Path | Description | Link |
|---|---|---|
| **AZ-305: Azure Solutions Architect** | Design identity, governance, monitoring, data storage, and infrastructure solutions | [learn.microsoft.com/training/paths/design-identity-governance-monitor-solutions/](https://learn.microsoft.com/training/paths/design-identity-governance-monitor-solutions/) |
| **Design Governance Solutions** (AZ-305 module) | Management groups, Azure Policy, RBAC design patterns for architects | [learn.microsoft.com/training/modules/design-governance/](https://learn.microsoft.com/training/modules/design-governance/) |

### Security

| Learning Path | Description | Link |
|---|---|---|
| **SC-100: Cybersecurity Architect** | Design security strategies for identity, compliance, and cloud security posture management | [learn.microsoft.com/training/paths/sc-100-design-solutions-align-cloud-adoption-framework-well-architected-framework/](https://learn.microsoft.com/training/paths/sc-100-design-solutions-align-cloud-adoption-framework-well-architected-framework/) |
| **SC-200: Security Operations Analyst** | Microsoft Sentinel, Defender for Cloud, threat hunting | [learn.microsoft.com/training/paths/sc-200-mitigate-threats-using-microsoft-defender-for-cloud/](https://learn.microsoft.com/training/paths/sc-200-mitigate-threats-using-microsoft-defender-for-cloud/) |

### Governance-Specific Modules

| Module | Description | Link |
|---|---|---|
| Build a cloud governance strategy on Azure | Management groups, policies, RBAC, resource locks, tags | [learn.microsoft.com/training/modules/build-cloud-governance-strategy-azure/](https://learn.microsoft.com/training/modules/build-cloud-governance-strategy-azure/) |
| Introduction to Azure Policy | Policy concepts, effects, assignments, compliance | [learn.microsoft.com/training/modules/intro-to-azure-policy/](https://learn.microsoft.com/training/modules/intro-to-azure-policy/) |
| Configure Azure resources with tools | ARM, Bicep, PowerShell, CLI | [learn.microsoft.com/training/modules/configure-azure-resources-tools/](https://learn.microsoft.com/training/modules/configure-azure-resources-tools/) |

---

## Microsoft Certifications Relevant to Governance

| Certification | Code | Focus | Governance Relevance |
|---|---|---|---|
| Azure Fundamentals | AZ-900 | Cloud concepts, Azure services | Governance basics, cost management |
| Azure Administrator | AZ-104 | Azure administration | Identity, governance, policy, RBAC |
| Azure Solutions Architect | AZ-305 | Solution design | Governance architecture, Landing Zones |
| Cybersecurity Architect | SC-100 | Security strategy | Compliance, security governance |
| Azure Security Engineer | AZ-500 | Security implementation | Identity, network security, compliance |
| Identity and Access Administrator | SC-300 | Microsoft Entra ID | Identity governance, PIM, Conditional Access |
| Azure DevOps Engineer | AZ-400 | DevOps practices | IaC, Policy as Code, CI/CD governance |

---

## Cloud Adoption Framework Documentation

| Topic | Link |
|---|---|
| CAF Overview | [learn.microsoft.com/azure/cloud-adoption-framework/](https://learn.microsoft.com/azure/cloud-adoption-framework/) |
| Govern Methodology | [learn.microsoft.com/azure/cloud-adoption-framework/govern/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) |
| Ready Methodology (Landing Zones) | [learn.microsoft.com/azure/cloud-adoption-framework/ready/](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/) |
| Azure Landing Zone Design Areas | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas) |
| Governance Benchmark Tool | [learn.microsoft.com/assessments/b1891add-7646-4d60-a875-32a4ab26327e/](https://learn.microsoft.com/assessments/b1891add-7646-4d60-a875-32a4ab26327e/) |
| Naming and Tagging Conventions | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging) |
| Resource Organization Design Area | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org) |

---

## Community Tools and Open-Source Projects

| Tool | Description | Link |
|---|---|---|
| **AzGovViz** (Azure Governance Visualizer) | PowerShell-based tool that creates a comprehensive hierarchy map of Azure management groups, subscriptions, policies, RBAC, and more | [github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting) |
| **EPAC** (Enterprise Policy as Code) | Framework for managing Azure Policy definitions, initiatives, assignments, and exemptions at scale using CI/CD | [github.com/Azure/enterprise-azure-policy-as-code](https://github.com/Azure/enterprise-azure-policy-as-code) |
| **Azure Verified Modules (AVM)** | Official, tested, and supported Bicep and Terraform modules for Azure resources | [github.com/Azure/Azure-Verified-Modules](https://github.com/Azure/Azure-Verified-Modules) |
| **ALZ Bicep** | Bicep modules for deploying Azure Landing Zone architecture | [github.com/Azure/ALZ-Bicep](https://github.com/Azure/ALZ-Bicep) |
| **ALZ Terraform** | Terraform modules for deploying Azure Landing Zone architecture | [github.com/Azure/terraform-azurerm-caf-enterprise-scale](https://github.com/Azure/terraform-azurerm-caf-enterprise-scale) |
| **ALZ Reference Implementations** | Complete, deployable reference implementations for Azure Landing Zones | [github.com/Azure/Enterprise-Scale](https://github.com/Azure/Enterprise-Scale) |
| **Maester** | Automated testing framework for Microsoft Entra ID and Azure security configuration | [github.com/maester365/maester](https://github.com/maester365/maester) |
| **Azure Resource Inventory (ARI)** | PowerShell tool that generates Excel reports of all Azure resources | [github.com/microsoft/ARI](https://github.com/microsoft/ARI) |
| **PSRule for Azure** | Validate Azure infrastructure as code and resources against the Azure Well-Architected Framework | [github.com/Azure/PSRule.Rules.Azure](https://github.com/Azure/PSRule.Rules.Azure) |
| **Continuous Cloud Optimization (CCO)** | Power BI dashboards for Azure governance, security, and compliance insights | [github.com/Azure/CCOInsights](https://github.com/Azure/CCOInsights) |

---

## Azure Documentation — Key Governance Pages

| Topic | Link |
|---|---|
| Azure Governance Documentation | [learn.microsoft.com/azure/governance/](https://learn.microsoft.com/azure/governance/) |
| Azure Policy | [learn.microsoft.com/azure/governance/policy/](https://learn.microsoft.com/azure/governance/policy/) |
| Azure RBAC | [learn.microsoft.com/azure/role-based-access-control/](https://learn.microsoft.com/azure/role-based-access-control/) |
| Azure Resource Graph | [learn.microsoft.com/azure/governance/resource-graph/](https://learn.microsoft.com/azure/governance/resource-graph/) |
| Management Groups | [learn.microsoft.com/azure/governance/management-groups/](https://learn.microsoft.com/azure/governance/management-groups/) |
| Azure Cost Management | [learn.microsoft.com/azure/cost-management-billing/](https://learn.microsoft.com/azure/cost-management-billing/) |
| Microsoft Defender for Cloud | [learn.microsoft.com/azure/defender-for-cloud/](https://learn.microsoft.com/azure/defender-for-cloud/) |
| Microsoft Entra ID | [learn.microsoft.com/entra/identity/](https://learn.microsoft.com/entra/identity/) |
| Azure Landing Zones | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) |
| Azure Arc | [learn.microsoft.com/azure/azure-arc/](https://learn.microsoft.com/azure/azure-arc/) |
| Microsoft Purview | [learn.microsoft.com/purview/](https://learn.microsoft.com/purview/) |
| Deployment Stacks | [learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks) |

---

## Blogs and Community Content

| Resource | Description | Link |
|---|---|---|
| **Azure Governance and Management Blog** | Official Microsoft blog on governance features and updates | [techcommunity.microsoft.com/t5/azure-governance-and-management/bg-p/AzureGovernanceandManagementBlog](https://techcommunity.microsoft.com/t5/azure-governance-and-management/bg-p/AzureGovernanceandManagementBlog) |
| **Azure Updates** | Official feed of Azure service updates and announcements | [azure.microsoft.com/updates/](https://azure.microsoft.com/updates/) |
| **FinOps Foundation** | Community and best practices for cloud financial management | [finops.org](https://www.finops.org/) |
| **Azure Charts** | Visual representation of Azure service status, regions, and updates | [azurecharts.com](https://azurecharts.com/) |

---

## Recommended Reading Order for This Book

If you are new to Azure governance, we recommend reading the chapters in this order:

1. **Part 1 (Foundations)** — Understand what governance is and why it matters
2. **Chapter 30 (FAQ)** — Get answers to common questions early
3. **Part 2 (Identity)** — Identity is the foundation of all governance
4. **Part 3 (Policy)** — Azure Policy is the core governance engine
5. **Part 5 (Cost)** — Cost governance protects the budget
6. **Part 6 (Observability)** — You cannot govern what you cannot see
7. **Part 4 (IaC)** — Infrastructure as Code enables repeatable governance
8. **Part 7 (At Scale)** — Scale governance as your environment grows
9. **Part 8 (Synthesis)** — Bring it all together
10. **Appendices** — Reference material for ongoing use

---

| Previous | Next |
|:---|:---|
| [Appendix D — Resource Graph Queries](appendix-d-resource-graph-queries.md) | [Appendix F — Changelog](appendix-f-changelog.md) |
