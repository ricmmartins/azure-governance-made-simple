# Apêndice E — Recursos de Aprendizado

> Last verified: 2026-04-06

---

Uma coleção curada de recursos de aprendizado para profissionais de governança Azure.

---

## Trilhas de Aprendizado Microsoft Learn

### Fundamentos

| Trilha de Aprendizado | Descrição | Link |
|---|---|---|
| **AZ-900: Azure Fundamentals** | Introdução a conceitos de cloud, serviços Azure e fundamentos de governança | [learn.microsoft.com/training/paths/az-900-describe-cloud-concepts/](https://learn.microsoft.com/training/paths/az-900-describe-cloud-concepts/) |
| **Describe Azure Management and Governance** (módulo AZ-900) | Management groups, policy, RBAC, gestão de custos | [learn.microsoft.com/training/paths/describe-azure-management-governance/](https://learn.microsoft.com/training/paths/describe-azure-management-governance/) |

### Administração

| Trilha de Aprendizado | Descrição | Link |
|---|---|---|
| **AZ-104: Azure Administrator** | Administração abrangente do Azure incluindo identidade, governança, rede, compute e storage | [learn.microsoft.com/training/paths/az-104-administrator-prerequisites/](https://learn.microsoft.com/training/paths/az-104-administrator-prerequisites/) |
| **Manage Identities and Governance in Azure** (módulo AZ-104) | Microsoft Entra ID, RBAC, subscriptions e governança | [learn.microsoft.com/training/paths/az-104-manage-identities-governance/](https://learn.microsoft.com/training/paths/az-104-manage-identities-governance/) |

### Arquitetura

| Trilha de Aprendizado | Descrição | Link |
|---|---|---|
| **AZ-305: Azure Solutions Architect** | Projetar soluções de identidade, governança, monitoramento, armazenamento de dados e infraestrutura | [learn.microsoft.com/training/paths/design-identity-governance-monitor-solutions/](https://learn.microsoft.com/training/paths/design-identity-governance-monitor-solutions/) |
| **Design Governance Solutions** (módulo AZ-305) | Management groups, Azure Policy, padrões de design de RBAC para arquitetos | [learn.microsoft.com/training/modules/design-governance/](https://learn.microsoft.com/training/modules/design-governance/) |

### Segurança

| Trilha de Aprendizado | Descrição | Link |
|---|---|---|
| **SC-100: Cybersecurity Architect** | Projetar estratégias de segurança para identidade, conformidade e gerenciamento de postura de segurança cloud | [learn.microsoft.com/training/paths/sc-100-design-solutions-align-cloud-adoption-framework-well-architected-framework/](https://learn.microsoft.com/training/paths/sc-100-design-solutions-align-cloud-adoption-framework-well-architected-framework/) |
| **SC-200: Security Operations Analyst** | Microsoft Sentinel, Defender for Cloud, threat hunting | [learn.microsoft.com/training/paths/sc-200-mitigate-threats-using-microsoft-defender-for-cloud/](https://learn.microsoft.com/training/paths/sc-200-mitigate-threats-using-microsoft-defender-for-cloud/) |

### Módulos Específicos de Governança

| Módulo | Descrição | Link |
|---|---|---|
| Build a cloud governance strategy on Azure | Management groups, políticas, RBAC, resource locks, tags | [learn.microsoft.com/training/modules/build-cloud-governance-strategy-azure/](https://learn.microsoft.com/training/modules/build-cloud-governance-strategy-azure/) |
| Introduction to Azure Policy | Conceitos de política, efeitos, atribuições, conformidade | [learn.microsoft.com/training/modules/intro-to-azure-policy/](https://learn.microsoft.com/training/modules/intro-to-azure-policy/) |
| Configure Azure resources with tools | ARM, Bicep, PowerShell, CLI | [learn.microsoft.com/training/modules/configure-azure-resources-tools/](https://learn.microsoft.com/training/modules/configure-azure-resources-tools/) |

---

## Certificações Microsoft Relevantes para Governança

| Certificação | Código | Foco | Relevância para Governança |
|---|---|---|---|
| Azure Fundamentals | AZ-900 | Conceitos de cloud, serviços Azure | Fundamentos de governança, gestão de custos |
| Azure Administrator | AZ-104 | Administração Azure | Identidade, governança, policy, RBAC |
| Azure Solutions Architect | AZ-305 | Design de soluções | Arquitetura de governança, Landing Zones |
| Cybersecurity Architect | SC-100 | Estratégia de segurança | Conformidade, governança de segurança |
| Azure Security Engineer | AZ-500 | Implementação de segurança | Identidade, segurança de rede, conformidade |
| Identity and Access Administrator | SC-300 | Microsoft Entra ID | Governança de identidade, PIM, Conditional Access |
| Azure DevOps Engineer | AZ-400 | Práticas DevOps | IaC, Policy as Code, governança CI/CD |

---

## Documentação do Cloud Adoption Framework

| Tópico | Link |
|---|---|
| Visão Geral do CAF | [learn.microsoft.com/azure/cloud-adoption-framework/](https://learn.microsoft.com/azure/cloud-adoption-framework/) |
| Metodologia Govern | [learn.microsoft.com/azure/cloud-adoption-framework/govern/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) |
| Metodologia Ready (Landing Zones) | [learn.microsoft.com/azure/cloud-adoption-framework/ready/](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/) |
| Áreas de Design da Azure Landing Zone | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas) |
| Ferramenta de Benchmark de Governança | [learn.microsoft.com/assessments/b1891add-7646-4d60-a875-32a4ab26327e/](https://learn.microsoft.com/assessments/b1891add-7646-4d60-a875-32a4ab26327e/) |
| Convenções de Nomenclatura e Tags | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging) |
| Área de Design de Organização de Recursos | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org) |

---

## Ferramentas da Comunidade e Projetos Open-Source

| Ferramenta | Descrição | Link |
|---|---|---|
| **AzGovViz** (Azure Governance Visualizer) | Ferramenta baseada em PowerShell que cria um mapa hierárquico abrangente de management groups, subscriptions, políticas, RBAC e mais | [github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting) |
| **EPAC** (Enterprise Policy as Code) | Framework para gerenciar definições, initiatives, atribuições e exemptions de Azure Policy em escala usando CI/CD | [github.com/Azure/enterprise-azure-policy-as-code](https://github.com/Azure/enterprise-azure-policy-as-code) |
| **Azure Verified Modules (AVM)** | Módulos oficiais, testados e suportados de Bicep e Terraform para recursos Azure | [github.com/Azure/Azure-Verified-Modules](https://github.com/Azure/Azure-Verified-Modules) |
| **ALZ Bicep** | Módulos Bicep para implantar a arquitetura Azure Landing Zone | [github.com/Azure/ALZ-Bicep](https://github.com/Azure/ALZ-Bicep) |
| **ALZ Terraform** | Módulos Terraform para implantar a arquitetura Azure Landing Zone | [github.com/Azure/terraform-azurerm-caf-enterprise-scale](https://github.com/Azure/terraform-azurerm-caf-enterprise-scale) |
| **ALZ Reference Implementations** | Implementações de referência completas e implantáveis para Azure Landing Zones | [github.com/Azure/Enterprise-Scale](https://github.com/Azure/Enterprise-Scale) |
| **Maester** | Framework de testes automatizados para configuração de segurança do Microsoft Entra ID e Azure | [github.com/maester365/maester](https://github.com/maester365/maester) |
| **Azure Resource Inventory (ARI)** | Ferramenta PowerShell que gera relatórios Excel de todos os recursos Azure | [github.com/microsoft/ARI](https://github.com/microsoft/ARI) |
| **PSRule for Azure** | Validar infraestrutura como código e recursos Azure contra o Azure Well-Architected Framework | [github.com/Azure/PSRule.Rules.Azure](https://github.com/Azure/PSRule.Rules.Azure) |
| **Continuous Cloud Optimization (CCO)** | Dashboards Power BI para insights de governança, segurança e conformidade Azure | [github.com/Azure/CCOInsights](https://github.com/Azure/CCOInsights) |

---

## Documentação Azure — Páginas-Chave de Governança

| Tópico | Link |
|---|---|
| Documentação de Governança Azure | [learn.microsoft.com/azure/governance/](https://learn.microsoft.com/azure/governance/) |
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

## Blogs e Conteúdo da Comunidade

| Recurso | Descrição | Link |
|---|---|---|
| **Azure Governance and Management Blog** | Blog oficial da Microsoft sobre recursos e atualizações de governança | [techcommunity.microsoft.com/t5/azure-governance-and-management/bg-p/AzureGovernanceandManagementBlog](https://techcommunity.microsoft.com/t5/azure-governance-and-management/bg-p/AzureGovernanceandManagementBlog) |
| **Azure Updates** | Feed oficial de atualizações e anúncios de serviços Azure | [azure.microsoft.com/updates/](https://azure.microsoft.com/updates/) |
| **FinOps Foundation** | Comunidade e melhores práticas para gestão financeira cloud | [finops.org](https://www.finops.org/) |
| **Azure Charts** | Representação visual do status de serviços Azure, regiões e atualizações | [azurecharts.com](https://azurecharts.com/) |

---

## Ordem de Leitura Recomendada para Este Livro

Se você é novo em governança Azure, recomendamos ler os capítulos nesta ordem:

1. **Parte 1 (Fundamentos)** — Entenda o que é governança e por que importa
2. **Capítulo 30 (FAQ)** — Obtenha respostas para perguntas comuns logo no início
3. **Parte 2 (Identidade)** — Identidade é a fundação de toda governança
4. **Parte 3 (Política)** — Azure Policy é o motor central de governança
5. **Parte 5 (Custo)** — Governança de custos protege o orçamento
6. **Parte 6 (Observabilidade)** — Você não pode governar o que não pode ver
7. **Parte 4 (IaC)** — Infrastructure as Code habilita governança repetível
8. **Parte 7 (Em Escala)** — Escale a governança conforme seu ambiente cresce
9. **Parte 8 (Síntese)** — Junte tudo
10. **Apêndices** — Material de referência para uso contínuo

---

| Anterior | Próximo |
|:---|:---|
| [Apêndice D — Queries do Resource Graph](appendix-d-resource-graph-queries.md) | [Apêndice F — Changelog](appendix-f-changelog.md) |
