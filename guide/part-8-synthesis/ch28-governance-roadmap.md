# Capítulo 28 — Roadmap de Governança

> Last verified: 2026-04-06

---

## Visão Geral

Implementar governança no Azure não é um projeto único — é uma jornada contínua. Este capítulo fornece um roadmap de implementação por fases, um checklist abrangente organizado por pilar de governança e orientações sobre ferramentas e próximos passos para manter sua postura de governança.

O roadmap está organizado em três fases baseadas no modelo de maturidade **Crawl-Walk-Run**:

- **Mês 1–3 (Crawl):** Estabelecer governança fundamental — identidade, nomenclatura, políticas essenciais, controles básicos de custo
- **Mês 3–6 (Walk):** Formalizar governança — hierarquia de management groups, Policy as Code, estratégia de RBAC, baselines de segurança
- **Mês 6–12 (Run):** Escalar governança — Landing Zones, segurança avançada, FinOps, automação, conformidade contínua

---

## Fase 1 — Fundação (Mês 1–3)

**Objetivo:** Estabelecer a postura mínima viável de governança para que workloads possam ser implantados com segurança.

| Semana | Atividade | Resultado |
|---|---|---|
| 1–2 | Configurar o tenant Microsoft Entra ID: habilitar MFA, configurar Conditional Access para administradores, criar contas de acesso de emergência | Fundação de identidade protegida |
| 2–3 | Definir convenção de nomenclatura e estratégia de tags | Padrão de nomenclatura documentado; tags obrigatórias definidas |
| 3–4 | Criar estrutura inicial de management groups (no mínimo: Produção, Não-Produção, Sandbox) | Hierarquia organizacional implementada |
| 4–6 | Atribuir Azure Policies essenciais em modo Audit: tags obrigatórias, regiões permitidas, tipos de recursos permitidos | Visibilidade da baseline de conformidade |
| 6–8 | Configurar Azure Budgets e alertas de custo para cada subscription | Visibilidade de custos e proteção contra gastos excessivos |
| 8–10 | Habilitar Microsoft Defender for Cloud (tier gratuito) em todas as subscriptions | Visibilidade da postura de segurança |
| 10–12 | Configurar Azure Monitor e criar um workspace central de Log Analytics | Logging centralizado |

**Principais entregas:**
- ✅ Microsoft Entra ID configurado com MFA e Conditional Access
- ✅ Convenção de nomenclatura e padrão de tags documentados
- ✅ Hierarquia inicial de management groups implantada
- ✅ Políticas essenciais atribuídas (modo Audit)
- ✅ Budgets e alertas de custo configurados
- ✅ Defender for Cloud habilitado
- ✅ Workspace central de Log Analytics operacional

---

## Fase 2 — Formalização (Mês 3–6)

**Objetivo:** Migrar de governança ad-hoc para processos formalizados e repetíveis.

| Semana | Atividade | Resultado |
|---|---|---|
| 1–2 | Projetar estratégia de RBAC: definir roles customizados, implementar PIM para roles privilegiados | Acesso com privilégio mínimo aplicado |
| 2–4 | Mover políticas de Audit para Deny/DeployIfNotExists para controles críticos | Aplicação proativa de políticas |
| 4–6 | Implementar Policy as Code: armazenar políticas no Git, implantar via pipeline CI/CD | Mudanças de governança versionadas e revisadas |
| 6–8 | Habilitar planos pagos do Defender for Cloud (CSPM, proteção de servidores) e aplicar MCSB | Baselines de segurança avançadas |
| 8–10 | Agendar Access Reviews do Microsoft Entra ID para roles privilegiados | Certificação periódica de acesso |
| 10–12 | Implantar resource locks em infraestrutura crítica (subscriptions, rede, identidade) | Proteção contra exclusão acidental |

**Principais entregas:**
- ✅ Estratégia de RBAC documentada e implementada
- ✅ PIM habilitado para todos os roles privilegiados
- ✅ Políticas essenciais em aplicação (Deny/DINE)
- ✅ Pipeline de Policy as Code operacional
- ✅ MCSB aplicado; Secure Score monitorado
- ✅ Access Reviews agendadas (trimestralmente)
- ✅ Resource locks em recursos críticos

---

## Fase 3 — Escala (Mês 6–12)

**Objetivo:** Habilitar autoatendimento em escala com guardrails.

| Semana | Atividade | Resultado |
|---|---|---|
| 1–4 | Implantar Azure Landing Zone (ALZ Accelerator ou customizado) | Ambiente padronizado e escalável |
| 4–6 | Implementar subscription vending para provisionamento automatizado de subscriptions | Autoatendimento com guardrails |
| 6–8 | Integrar recursos híbridos com Azure Arc | Governança consistente entre ambientes |
| 8–10 | Implementar práticas de FinOps: alocação de custos, chargeback, revisões de otimização | Responsabilização de custos |
| 10–12 | Implantar AzGovViz para relatórios automatizados de governança | Visibilidade contínua de governança |
| 12+ | Estabelecer cadência regular de revisão de governança (mensal) | Postura de governança sustentada |

**Principais entregas:**
- ✅ Azure Landing Zone implantada e operacional
- ✅ Subscription vending automatizado
- ✅ Recursos híbridos governados via Azure Arc
- ✅ Práticas de FinOps operacionais
- ✅ AzGovViz executando conforme agendamento
- ✅ Revisão mensal de governança estabelecida

---

## Checklist de Implementação por Pilar de Governança

### Identidade

- [ ] Tenant Microsoft Entra ID configurado
- [ ] Autenticação multifator (MFA) aplicada para todos os usuários
- [ ] Políticas de Conditional Access implantadas para administradores
- [ ] Contas de acesso de emergência (break-glass) criadas e protegidas
- [ ] Privileged Identity Management (PIM) habilitado para todos os roles privilegiados
- [ ] Access Reviews agendadas para roles privilegiados (trimestralmente)
- [ ] Workload identity federation configurado para pipelines CI/CD
- [ ] Inventário de service principals revisado e credenciais rotacionadas
- [ ] Managed identities utilizadas em vez de service principals onde possível
- [ ] Microsoft Entra ID Protection habilitado

### Organização

- [ ] Hierarquia de management groups projetada e implantada
- [ ] Subscriptions criadas e posicionadas nos management groups corretos
- [ ] Convenção de nomenclatura definida e documentada
- [ ] Estratégia de tags definida com tags obrigatórias
- [ ] Estrutura de resource groups padronizada
- [ ] Processo de subscription vending definido (manual ou automatizado)

### Política

- [ ] Políticas essenciais atribuídas no management group de nível superior
- [ ] Política de regiões permitidas aplicada
- [ ] Política de tags obrigatórias aplicada
- [ ] Baseline de conformidade estabelecida e monitorada
- [ ] Pipeline de Policy as Code implementado
- [ ] Exemptions de políticas documentadas e revisadas regularmente
- [ ] Políticas customizadas criadas para requisitos específicos da organização
- [ ] Definições de initiatives (policy sets) organizadas por propósito

### Custo

- [ ] Azure Budgets definidos para cada subscription e resource group
- [ ] Alertas de custo configurados (limites de 50%, 75%, 90%, 100%)
- [ ] Tags de alocação de custos definidas e aplicadas
- [ ] Processo mensal de revisão de custos estabelecido
- [ ] Práticas de FinOps iniciadas (showback/chargeback)
- [ ] Recomendações de custo do Azure Advisor revisadas regularmente
- [ ] Reserved Instances / Savings Plans avaliados

### Segurança

- [ ] Microsoft Defender for Cloud habilitado em todas as subscriptions
- [ ] Microsoft Cloud Security Benchmark (MCSB) aplicado
- [ ] Secure Score monitorado e plano de melhoria estabelecido
- [ ] Dashboard de conformidade regulatória do Microsoft Defender for Cloud configurado
- [ ] Segurança de rede: NSGs, Azure Firewall ou NVAs de terceiros implantados
- [ ] Key Vault implantado para segredos, chaves e certificados
- [ ] Diagnostic settings configurados para serviços relevantes de segurança
- [ ] Plano de resposta a incidentes documentado

### Operações

- [ ] Azure Monitor configurado com workspace central de Log Analytics
- [ ] Regras de alerta criadas para infraestrutura crítica
- [ ] Queries de Azure Resource Graph desenvolvidas para relatórios de governança
- [ ] AzGovViz implantado e executando conforme agendamento
- [ ] Azure Update Manager configurado para conformidade de patches
- [ ] Backup e recuperação de desastres validados
- [ ] Dashboard ou workbook de governança criado

---

## Resumo de Ferramentas

| Ferramenta | Propósito | Link |
|---|---|---|
| **AzGovViz** | Visualização automatizada da hierarquia de governança e relatórios | [GitHub](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting) |
| **Azure DevOps Governance Generator** | Gerar um projeto Azure DevOps pré-populado com itens de trabalho de governança | [aka.ms/azgovernancereadiness](https://aka.ms/azgovernancereadiness) |
| **Landing Zone Review Workbook** | Workbook do Azure Monitor para validar melhores práticas de landing zone do CAF | [GitHub](https://github.com/Azure/fta-landingzone) |
| **Enterprise Policy as Code (EPAC)** | Gerenciar Azure Policy em escala usando Git e pipelines CI/CD | [GitHub](https://github.com/Azure/enterprise-azure-policy-as-code) |
| **Azure Verified Modules (AVM)** | Módulos oficiais e testados de Bicep/Terraform para recursos Azure | [aka.ms/AVM](https://aka.ms/AVM) |
| **Maester** | Testes automatizados para configuração de segurança do Microsoft Entra ID e Azure | [GitHub](https://github.com/maester365/maester) |
| **Azure Resource Graph Explorer** | Consultar e explorar recursos Azure em escala | [Portal](https://portal.azure.com/#blade/HubsExtension/ArgQueryBlade) |

---

## Próximos Passos

1. **Avalie sua maturidade atual** — Use o checklist acima para identificar lacunas na sua postura de governança. Nem toda organização precisa de todos os controles desde o primeiro dia.

2. **Comece pequeno, itere frequentemente** — Governança é uma jornada. Comece com a fundação da Fase 1 e construa a partir daí. Uma postura de governança simples que é realmente seguida é melhor do que uma elaborada que é ignorada.

3. **Automatize tudo** — Processos manuais de governança não escalam. Invista em Policy as Code, subscription vending e relatórios automatizados assim que sua equipe estiver pronta.

4. **Construa uma comunidade de governança** — Governança não é responsabilidade exclusiva da equipe de plataforma cloud. Envolva equipes de segurança, conformidade, finanças e aplicações. Estabeleça um Cloud Center of Excellence (CCoE) ou comitê de governança.

5. **Mantenha-se atualizado** — O Azure evolui rapidamente. Inscreva-se nas atualizações do Azure, revise o Cloud Adoption Framework trimestralmente e atualize suas políticas de governança conforme novas capacidades surgem.

6. **Meça e reporte** — Use Azure Resource Graph, Defender for Cloud Secure Score e AzGovViz para produzir relatórios regulares de governança. O que é medido é gerenciado.

7. **Compartilhe seu conhecimento** — Contribua para a comunidade de governança Azure. Compartilhe suas políticas customizadas, queries do Resource Graph e lições aprendidas.

---

## Referências

- [Cloud Adoption Framework — Govern](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/)
- [Azure Governance Best Practices](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/guides/)
- [AzGovViz](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting)
- [Enterprise Policy as Code (EPAC)](https://github.com/Azure/enterprise-azure-policy-as-code)
- [Azure Verified Modules](https://azure.github.io/Azure-Verified-Modules/)
- [Azure DevOps Governance Generator](https://aka.ms/azgovernancereadiness)
- [CAF Landing Zone Review Workbook](https://github.com/Azure/fta-landingzone)
- [Microsoft Cloud Security Benchmark](https://learn.microsoft.com/security/benchmark/azure/overview)

---

| Anterior | Próximo |
|:---|:---|
| [Governança de IA](../part-7-at-scale/ch27-ai-governance.md) | [Estudos de Caso](ch29-case-studies.md) |
