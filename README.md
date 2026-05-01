# Governança Azure Simplificada

[![Livro](https://img.shields.io/badge/📖_Leia_Online-azgovernance.com-blue?style=for-the-badge)](https://azgovernance.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

> 🇧🇷 **Esta é a versão em Português-Brasil.** | [🇺🇸 English version](https://github.com/ricmmartins/azure-governance-made-simple/tree/en-us)

> **O guia de referência abrangente e open-source sobre Governança Azure — dos fundamentos à escala empresarial.**

## Sobre Este Livro

**Governança Azure Simplificada** é um guia orientado a profissionais para projetar, implementar e operar a governança em nuvem no Microsoft Azure. Escrito para arquitetos Azure, engenheiros de plataforma, equipes de Cloud Center of Excellence (CCoE) e líderes de TI, ele fornece a profundidade necessária para construir frameworks de governança que equilibram agilidade dos desenvolvedores com controle organizacional.

Este livro cobre todo o ciclo de vida da governança:

- **Identidade e Acesso** — RBAC, Microsoft Entra ID Governance, PIM, identidades gerenciadas
- **Política e Conformidade** — Azure Policy em profundidade, frameworks regulatórios, Microsoft Defender for Cloud
- **Infraestrutura como Código** — Bicep, Azure Verified Modules, Deployment Stacks, pipelines CI/CD de governança
- **Governança de Custos** — Azure Cost Management, práticas de FinOps, automação de orçamentos
- **Observabilidade** — Dashboards do Azure Monitor, consultas do Azure Resource Graph, AzGovViz
- **Governança em Escala** — Azure Landing Zones, Azure Arc, nuvens soberanas, governança de dados com Microsoft Purview, governança de IA

Todo o conteúdo está alinhado com o [Microsoft Cloud Adoption Framework](https://learn.microsoft.com/azure/cloud-adoption-framework/) e o [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/).

### O Que Torna Este Livro Diferente

| Característica | Detalhes |
|----------------|----------|
| **Orientado a profissionais** | Cada capítulo inclui contexto de arquitetura, melhores práticas, armadilhas comuns e exercícios práticos com código real em Bicep, CLI e KQL |
| **Modelo de maturidade** | Um framework Engatinhar → Andar → Correr ajuda equipes a adotar governança de forma incremental, não como um projeto big-bang |
| **Árvores de decisão** | Fluxogramas visuais para escolher entre grupos de gerenciamento vs. assinaturas, políticas built-in vs. customizadas, e mais |
| **Kit inicial de políticas** | 39 definições de Azure Policy prontas para produção organizadas por pilar de governança |
| **Consultas Resource Graph** | 20 consultas KQL prontas para executar para visibilidade de governança em todo o seu ambiente Azure |
| **Atualizado em abril de 2026** | Reflete os nomes mais recentes de serviços Azure, recursos GA e depreciações (Entra ID, Deployment Stacks GA, Blueprints EOL) |

---

## 📖 Leia o Livro

**Online:** [azgovernance.com](https://azgovernance.com/)

---

## Índice

### Parte I — Fundamentos

| # | Capítulo | Descrição |
|---|----------|-----------|
| 1 | [Por Que a Governança Azure Importa](guide/part-1-foundations/ch01-why-governance-matters.md) | O caso de negócio para governança — riscos, benefícios e o custo de não fazer nada |
| 2 | [Governança em um Olhar](guide/part-1-foundations/ch02-governance-at-a-glance.md) | Mapa de arquitetura de governança end-to-end e visão geral dos pilares |
| 3 | [Modelo de Maturidade de Governança em Nuvem](guide/part-1-foundations/ch03-governance-maturity-model.md) | Framework Engatinhar → Andar → Correr com checklist de autoavaliação |
| 4 | [A Hierarquia de Recursos Azure](guide/part-1-foundations/ch04-resource-hierarchy.md) | Tenants, grupos de gerenciamento, assinaturas e grupos de recursos — padrões de design e anti-padrões |
| 5 | [Estratégia de Nomenclatura e Etiquetagem](guide/part-1-foundations/ch05-naming-tagging-strategy.md) | Convenções de nomenclatura, taxonomia de tags e enforcement de políticas para tags |

### Parte II — Governança de Identidade e Acesso

| # | Capítulo | Descrição |
|---|----------|-----------|
| 6 | [Controle de Acesso Baseado em Função (RBAC)](guide/part-2-identity-access/ch06-rbac.md) | Funções built-in vs. customizadas, estratégia de escopo, padrões de menor privilégio |
| 7 | [Microsoft Entra ID Governance](guide/part-2-identity-access/ch07-entra-id-governance.md) | PIM, revisões de acesso, gerenciamento de direitos, workflows de ciclo de vida |
| 8 | [Identidades Gerenciadas e Workload Identity](guide/part-2-identity-access/ch08-managed-identities.md) | Identidades atribuídas pelo sistema vs. pelo usuário, federação de identidade de carga de trabalho |

### Parte III — Política e Conformidade

| # | Capítulo | Descrição |
|---|----------|-----------|
| 9 | [Azure Policy — Mergulho Profundo](guide/part-3-policy-compliance/ch09-azure-policy.md) | Conceitos fundamentais, efeitos, Machine Configuration, EPAC, remediação, 39 políticas iniciais |
| 10 | [Conformidade Regulatória](guide/part-3-policy-compliance/ch10-regulatory-compliance.md) | Microsoft Cloud Security Benchmark, frameworks de conformidade, evidências de auditoria |
| 11 | [Microsoft Defender for Cloud](guide/part-3-policy-compliance/ch11-defender-for-cloud.md) | CSPM, planos de proteção de workload, governança de postura de segurança |
| 12 | [Bloqueios de Recursos](guide/part-3-policy-compliance/ch12-resource-locks.md) | Bloqueios CanNotDelete vs. ReadOnly, padrões de automação, consultas de quem-bloqueou-o-quê |

### Parte IV — Infraestrutura como Código e Governança de Implantação

| # | Capítulo | Descrição |
|---|----------|-----------|
| 13 | [Bicep e Azure Verified Modules](guide/part-4-iac-deployment/ch13-bicep-avm.md) | Fundamentos do Bicep, registro AVM, padrões de governança como código |
| 14 | [Deployment Stacks](guide/part-4-iac-deployment/ch14-deployment-stacks.md) | Ciclo de vida gerenciado de recursos, configurações de negação, proteção contra drift |
| 15 | [Template Specs e Módulos Reutilizáveis](guide/part-4-iac-deployment/ch15-template-specs.md) | Catálogos centralizados de templates, estratégia de versionamento |
| 16 | [Pipelines CI/CD de Governança](guide/part-4-iac-deployment/ch16-governance-cicd.md) | GitHub Actions e Azure DevOps pipelines para policy-as-code |

### Parte V — Governança de Custos e FinOps

| # | Capítulo | Descrição |
|---|----------|-----------|
| 17 | [Azure Cost Management](guide/part-5-cost-finops/ch17-cost-management.md) | Análise de custos, exportações, detecção de anomalias, recomendações do advisor |
| 18 | [Práticas FinOps no Azure](guide/part-5-cost-finops/ch18-finops.md) | Adoção do FinOps Framework, modelos de equipe, showback/chargeback |
| 19 | [Orçamentos, Alertas e Automação de Custos](guide/part-5-cost-finops/ch19-cost-automation.md) | Enforcement automatizado de orçamentos com Action Groups e Logic Apps |

### Parte VI — Observabilidade de Governança

| # | Capítulo | Descrição |
|---|----------|-----------|
| 20 | [Azure Monitor e Dashboards](guide/part-6-observability/ch20-azure-monitor.md) | Governança do log de atividades, configurações de diagnóstico, Azure Workbooks |
| 21 | [Azure Resource Graph](guide/part-6-observability/ch21-resource-graph.md) | Consultas KQL para visibilidade de governança em todo o ambiente |
| 22 | [Azure Governance Visualizer](guide/part-6-observability/ch22-azgovviz.md) | Configuração do AzGovViz, integração CI/CD, interpretação dos resultados |

### Parte VII — Governança em Escala

| # | Capítulo | Descrição |
|---|----------|-----------|
| 23 | [Azure Landing Zones](guide/part-7-at-scale/ch23-azure-landing-zones.md) | Arquitetura ALZ, landing zones de plataforma vs. de aplicação |
| 24 | [Azure Arc](guide/part-7-at-scale/ch24-azure-arc.md) | Governança híbrida e multicloud com servidores e Kubernetes habilitados para Arc |
| 25 | [Sovereign Landing Zones](guide/part-7-at-scale/ch25-sovereign-landing-zones.md) | Residência de dados, nuvens soberanas, computação confidencial |
| 26 | [Governança de Dados com Microsoft Purview](guide/part-7-at-scale/ch26-data-governance-purview.md) | Catálogo de dados, classificação, linhagem e políticas de acesso |
| 27 | [Governança de IA e IA Responsável](guide/part-7-at-scale/ch27-ai-governance.md) | Controles de governança Azure AI, segurança de conteúdo, monitoramento de modelos |

### Parte VIII — Juntando Tudo

| # | Capítulo | Descrição |
|---|----------|-----------|
| 28 | [Roteiro de Governança](guide/part-8-synthesis/ch28-governance-roadmap.md) | Plano de implementação de 90 dias alinhado ao modelo de maturidade |
| 29 | [Estudos de Caso do Mundo Real](guide/part-8-synthesis/ch29-case-studies.md) | Três cenários: startup, migração empresarial, indústria regulada |
| 30 | [Perguntas Frequentes](guide/part-8-synthesis/ch30-faq.md) | Respostas às 20 perguntas mais comuns sobre governança Azure |

### Apêndices

| | Apêndice | Descrição |
|---|----------|-----------|
| A | [Glossário](guide/appendices/appendix-a-glossary.md) | Definições dos principais termos de governança Azure |
| B | [Árvores de Decisão](guide/appendices/appendix-b-decision-trees.md) | Fluxogramas visuais para decisões comuns de governança |
| C | [Kit Inicial de Políticas](guide/appendices/appendix-c-policy-starter-kit.md) | 39 definições de políticas prontas para produção por pilar de governança |
| D | [Consultas Resource Graph](guide/appendices/appendix-d-resource-graph-queries.md) | 20 consultas KQL prontas para executar para relatórios de governança |
| E | [Recursos de Aprendizagem](guide/appendices/appendix-e-learning-resources.md) | Caminhos de aprendizagem Microsoft Learn, certificações e recursos da comunidade |
| F | [Changelog](guide/appendices/appendix-f-changelog.md) | Histórico de versões e log de atualizações |

---

## 🚀 Início Rápido

Se você é novo em governança Azure, comece aqui:

1. **[Capítulo 1 — Por Que a Governança Importa](guide/part-1-foundations/ch01-why-governance-matters.md)** — Entenda o caso de negócio
2. **[Capítulo 2 — Governança em um Olhar](guide/part-1-foundations/ch02-governance-at-a-glance.md)** — Veja o panorama geral
3. **[Capítulo 3 — Modelo de Maturidade](guide/part-1-foundations/ch03-governance-maturity-model.md)** — Avalie onde você está hoje
4. **[Capítulo 28 — Roteiro de Governança](guide/part-8-synthesis/ch28-governance-roadmap.md)** — Obtenha um plano de 90 dias

Se você está construindo um framework de governança para um ambiente Azure existente:

1. **[Apêndice B — Árvores de Decisão](guide/appendices/appendix-b-decision-trees.md)** — Tome decisões-chave de design
2. **[Apêndice C — Kit Inicial de Políticas](guide/appendices/appendix-c-policy-starter-kit.md)** — Implante políticas de baseline
3. **[Apêndice D — Consultas Resource Graph](guide/appendices/appendix-d-resource-graph-queries.md)** — Avalie seu estado atual

---

## Contribuindo

Contribuições são bem-vindas! Seja corrigindo um erro de digitação, atualizando um link desatualizado ou adicionando uma nova consulta Resource Graph — cada contribuição ajuda a manter este recurso preciso para a comunidade Azure global.

Por favor, leia o [Guia de Contribuição](CONTRIBUTING.md) antes de enviar um pull request. Ele inclui padrões de terminologia, o template de capítulo e diretrizes de submissão.

## Autor

**Ricardo Martins** — Cloud Solution Architect na Microsoft, focado em governança Azure, engenharia de plataforma e Cloud Adoption Framework.

- 🔗 [ricmmartins.github.io](https://ricmmartins.github.io/)
- 🐙 [github.com/ricmmartins](https://github.com/ricmmartins)

## Licença

Este projeto está licenciado sob a **Licença GPL-3.0** — veja o arquivo LICENSE na raiz do repositório para detalhes.

---

*Se este livro te ajudou, considere ⭐ dar uma estrela no repositório e compartilhá-lo com sua equipe.*
