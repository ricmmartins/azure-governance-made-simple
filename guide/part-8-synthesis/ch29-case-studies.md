# Capítulo 29 — Estudos de Caso

> Last verified: 2026-04-06

---

## Visão Geral

Este capítulo apresenta três estudos de caso fictícios, porém realistas, ilustrando implementações de governança Azure em diferentes escalas organizacionais. Cada estudo de caso segue o modelo de maturidade **Crawl-Walk-Run** e demonstra como as decisões de governança evoluem à medida que as organizações crescem.

---

## Estudo de Caso 1 — CloudBrew (Startup): Maturidade Crawl

### O Cenário

**CloudBrew** é uma startup SaaS de 50 pessoas que está construindo uma ferramenta de gerenciamento de projetos cloud-native. Eles utilizam Azure há 18 meses com uma única subscription, uma equipe de desenvolvimento e cerca de 40 recursos Azure. O CTO recentemente percebeu que o ambiente Azure cresceu organicamente sem nenhuma estrutura de governança.

**Estado atual:**
- 1 subscription Azure
- 1 tenant Microsoft Entra ID (usando configurações padrão)
- ~40 recursos em 3 resource groups (nomeados `rg1`, `dev-stuff`, `production`)
- 5 desenvolvedores com acesso Owner na subscription
- Sem convenção de nomenclatura
- Sem tags
- Sem budgets ou alertas de custo
- Gasto mensal no Azure: ~$3.500 (crescendo 15% mês a mês)

### Os Desafios

1. **Sem convenção de nomenclatura** — Recursos têm nomes inconsistentes, tornando difícil identificar o que pertence a quem
2. **Usuários com permissões excessivas** — Todos os desenvolvedores têm acesso Owner a toda a subscription
3. **Sem visibilidade de custos** — O CTO recebe uma fatura mensal mas não tem detalhamento por equipe ou projeto
4. **Sem baseline de segurança** — Microsoft Defender for Cloud nunca foi revisado; MFA é opcional
5. **Proliferação de recursos** — Recursos órfãos (VMs não utilizadas, storage accounts antigas) estão se acumulando

### Decisões de Governança

O CTO da CloudBrew gastou uma semana implementando governança fundamental:

**Identidade:**
- MFA aplicado para todos os usuários via Microsoft Entra ID Conditional Access
- Dois roles RBAC customizados criados:
  - `CloudBrew Developer` — Contributor no resource group, Reader na subscription
  - `CloudBrew Admin` — Contributor na subscription
- Acesso Owner removido de todos os desenvolvedores; apenas dois administradores mantiveram acesso elevado
- Uma conta de acesso de emergência (break-glass) criada

**Organização:**
- Convenção de nomenclatura definida: `{tipo-recurso}-{app}-{ambiente}-{região}-{instância}`
- Resource groups renomeados para: `rg-cloudbrew-prod-eastus`, `rg-cloudbrew-dev-eastus`, `rg-cloudbrew-shared-eastus`
- Três tags obrigatórias definidas: `Environment`, `Owner`, `CostCenter`

**Política:**
- Três políticas built-in atribuídas (modo Audit):
  - Exigir tag `Environment` em resource groups
  - Regiões permitidas: East US, East US 2
  - Auditar VMs que não usam managed disks

**Custo:**
- Budget de $4.500/mês definido na subscription com alertas em 75% e 100%
- Recomendações de custo do Azure Advisor revisadas — encontrados $420/mês em economias com right-sizing de VMs

**Segurança:**
- Microsoft Defender for Cloud habilitado (tier gratuito)
- Secure Score revisado (inicial: 32/100) e as 5 principais recomendações endereçadas

### Resultados

| Métrica | Antes | Depois (3 meses) |
|---|---|---|
| Usuários com acesso Owner | 5 | 2 |
| Recursos com tags obrigatórias | 0% | 78% |
| Custo mensal | $3.500 | $3.080 (reduzido + budget controlado) |
| Secure Score | 32 | 61 |
| Recursos órfãos | Desconhecido | 7 identificados e excluídos |

**Tempo investido:** ~40 horas no total (1 semana de trabalho focado + tagueamento contínuo)

**Principal aprendizado:** Mesmo uma implementação mínima de governança — MFA, convenção de nomenclatura, RBAC básico e budgets — melhora dramaticamente a postura cloud de uma startup. Você não precisa de uma configuração complexa para começar a governar de forma eficaz.

---

## Estudo de Caso 2 — Meridian Financial (Mid-Market): Maturidade Walk

### O Cenário

**Meridian Financial** é uma empresa de serviços financeiros com 500 pessoas, 10 subscriptions Azure, múltiplas equipes de desenvolvimento e um footprint cloud crescente. Eles adotaram Azure há dois anos e estão expandindo rapidamente. A equipe de plataforma cloud (3 pessoas) está lutando para acompanhar as demandas de governança.

**Estado atual:**
- 10 subscriptions Azure (sem estrutura de management groups — todas sob o Tenant Root Group)
- 1 tenant Microsoft Entra ID com licenciamento Entra ID P1
- ~600 recursos Azure em múltiplas subscriptions
- 8 equipes de desenvolvimento com níveis variados de expertise em Azure
- Convenção de nomenclatura básica (parcialmente seguida)
- Algumas tags (inconsistentes entre equipes)
- Budgets em 3 de 10 subscriptions
- Gasto mensal no Azure: ~$85.000
- Requisitos regulatórios: SOC 2, PCI-DSS para processamento de pagamentos

### Os Desafios

1. **Sem hierarquia de management groups** — Todas as subscriptions estão diretamente sob o Tenant Root Group, tornando impossível aplicar políticas de forma consistente
2. **RBAC inconsistente** — Algumas equipes usam roles customizados, outras usam roles built-in, e vários service principals têm acesso Contributor no nível de subscription
3. **Lacunas de política** — Políticas existem em algumas subscriptions mas não em outras; sem gerenciamento centralizado
4. **Pressão de conformidade** — Auditores de SOC 2 e PCI-DSS estão pedindo evidências de controles de segurança consistentes
5. **Atribuição de custos** — Finanças não consegue atribuir custos a equipes ou projetos específicos
6. **Sem IaC** — A maioria dos recursos implantados via portal ou scripts ad-hoc

### Decisões de Governança

A equipe de plataforma cloud gastou três meses implementando um framework formal de governança:

**Identidade:**
- Upgrade para Microsoft Entra ID P2 para PIM e Access Reviews
- PIM habilitado para todos os roles privilegiados (Global Admin, Subscription Owner, Subscription Contributor)
- Access Reviews trimestrais agendadas para todas as atribuições de roles privilegiados
- Pipelines CI/CD migrados de secrets de service principal para workload identity federation
- Conditional Access implementado: exigir dispositivos compatíveis para acesso ao portal Azure

**Organização:**
- Hierarquia de management groups projetada:

  ![Hierarquia MG Meridian Financial](/images/meridian-mg-hierarchy.svg)

- Todas as 10 subscriptions movidas para os management groups apropriados
- 2 novas subscriptions criadas: Management e Connectivity

**Política:**
- Enterprise Policy as Code (EPAC) implementado com pipeline GitHub Actions
- Políticas atribuídas no nível de management group:
  - Nível superior: Tags obrigatórias, regiões permitidas, auditoria MCSB
  - Corp: Aplicar private endpoints, negar endereços IP públicos
  - Online: Aplicar WAF no Application Gateway, exigir HTTPS
  - Sandbox: Aplicar auto-shutdown em VMs, restrições de tamanho máximo de VM

- Initiative específica para PCI-DSS criada para o management group Corp

**Custo:**
- Tags obrigatórias definidas: `CostCenter`, `Team`, `Project`, `Environment`
- Budgets definidos em cada subscription com alertas direcionados aos líderes de equipe
- Reuniões mensais de revisão de custos implementadas com líderes de equipe
- $12.000/mês em economias identificados de recursos órfãos e right-sizing

**Segurança:**
- Microsoft Defender for Cloud habilitado (Defender CSPM + proteção de servidores) em todas as subscriptions
- MCSB aplicado como padrão de conformidade
- Azure Key Vault implantado para cada equipe com acesso baseado em RBAC
- Conformidade regulatória do Defender for Cloud configurada para SOC 2 e PCI-DSS
- Secure Score inicial: 45 → Meta: 75 dentro de 6 meses

**Operações:**
- AzGovViz implantado executando semanalmente via GitHub Actions
- Workbooks do Azure Monitor criados para dashboards de governança
- Queries do Resource Graph implementadas para relatórios de conformidade

### Resultados

| Métrica | Antes | Depois (6 meses) |
|---|---|---|
| Taxa de conformidade com políticas | 42% (estimado) | 89% (medido) |
| Subscriptions com budgets | 3 de 10 | 12 de 12 (2 novas subs de plataforma) |
| Custo mensal | $85.000 | $73.000 (redução de 14%) |
| Secure Score | 45 | 72 |
| Roles protegidos por PIM | 0 | 100% dos roles privilegiados |
| Achados de auditoria SOC 2 (governança) | 12 | 2 |
| Frequência de relatórios de governança | Ad-hoc | Semanal (automatizado) |

**Tempo investido:** ~3 pessoa-meses na equipe de plataforma

**Principal aprendizado:** Uma hierarquia de management groups combinada com Policy as Code transforma a governança de combate a incêndios reativo para aplicação proativa e automatizada. O investimento se paga através de economias de custo e eficiência em auditorias.

---

## Estudo de Caso 3 — GlobalTech Industries (Enterprise): Maturidade Run

### O Cenário

**GlobalTech Industries** é uma empresa multinacional de manufatura com 5.000 pessoas, com operações na América do Norte, Europa e Ásia. Eles estão no Azure há quatro anos e operam um ambiente cloud maduro com requisitos regulatórios rigorosos.

**Estado atual:**
- 120+ subscriptions Azure em múltiplas unidades de negócio
- Microsoft Entra ID P2 com Microsoft Entra ID Governance
- ~15.000 recursos Azure
- 40+ equipes de aplicações em 3 continentes
- Azure Landing Zone implantada há 2 anos (topologia Hub-and-Spoke)
- Datacenters on-premises em 5 localidades (conectados via ExpressRoute)
- 200+ servidores on-premises gerenciados via Azure Arc
- Gasto mensal no Azure: ~$1,2 milhão
- Requisitos regulatórios: SOC 2, ISO 27001, GDPR, HIPAA (para plataforma de benefícios de saúde)

### Os Desafios

1. **Escala** — Com 120+ subscriptions, governança manual é impossível
2. **Conformidade multi-região** — GDPR exige que dados da UE permaneçam na UE; HIPAA exige controles específicos para dados de saúde
3. **Governança híbrida** — 200+ servidores on-premises precisam da mesma governança que recursos Azure
4. **Shadow IT** — Equipes implantando recursos fora da Landing Zone governada
5. **Gestão de custos** — Gasto de $1,2M/mês requer práticas sofisticadas de FinOps
6. **Adoção de IA** — Múltiplas equipes experimentando com Azure OpenAI Service sem controles centralizados

### Decisões de Governança

A GlobalTech opera um framework maduro de governança com melhoria contínua:

**Identidade:**
- Microsoft Entra ID Governance totalmente implantado:
  - Entitlement Management para pacotes de acesso
  - Access Reviews para todos os roles privilegiados (mensal) e acesso a aplicações (trimestral)
  - PIM para todos os roles administrativos com ativação limitada no tempo (máximo 8 horas)
- Conditional Access: políticas baseadas em localização, conformidade de dispositivo e risco
- Workload identity federation para todos os pipelines CI/CD (zero credenciais permanentes)
- Microsoft Entra Verified ID para acesso de parceiros

**Organização:**
- Hierarquia completa de management groups ALZ com landing zones por região:

  ![Hierarquia MG GlobalTech](/images/globaltech-mg-hierarchy.svg)

- Subscription vending totalmente automatizado via módulo Terraform + integração ServiceNow
- Tempo médio de solicitação de subscription até pronto para uso: 45 minutos

**Política:**
- EPAC gerencia 200+ atribuições de políticas na hierarquia de management groups
- Initiatives customizadas para cada framework regulatório (GDPR, HIPAA, PCI-DSS, ISO 27001)
- Processo de exemption de políticas com expiração automática e revisão trimestral
- Políticas de Azure Machine Configuration para conformidade no nível de SO em servidores Arc-enabled
- Novas políticas automaticamente implantadas no Sandbox (modo Audit) por 2 semanas antes da aplicação

**Custo:**
- Equipe dedicada de FinOps (2 pessoas) com showback e chargeback para unidades de negócio
- Azure Reservations para workloads previsíveis ($180K/ano em economias)
- Savings Plans para compute ($95K/ano em economias)
- Pipeline automatizado de detecção e limpeza de recursos órfãos
- Revisão mensal de FinOps com líderes de unidades de negócio
- Exportações do Azure Cost Management para Power BI para dashboards executivos

**Segurança:**
- Microsoft Defender for Cloud com todos os planos Defender habilitados
- MCSB aplicado em todas as subscriptions; Secure Score: 82
- Monitoramento de conformidade regulatória do Microsoft Defender for Cloud para SOC 2, ISO 27001, GDPR, HIPAA
- Microsoft Sentinel para SIEM/SOAR
- Revisões semanais de postura de segurança com o escritório do CISO
- Defender for Containers em todos os clusters AKS e Kubernetes Arc-enabled

**Híbrido (Azure Arc):**
- 200+ servidores on-premises integrados ao Azure Arc
- Mesmas Azure Policy, RBAC e monitoramento aplicados a servidores Arc-enabled
- Azure Update Manager para gerenciamento unificado de patches
- Azure Machine Configuration para conformidade de SO (benchmarks CIS)
- Paridade de governança: servidores on-premises têm a mesma postura de conformidade que VMs Azure

**Governança de IA:**
- Azure OpenAI Service centralizado na subscription Platform
- Azure API Management como gateway de IA para todas as equipes
- Filtros de segurança de conteúdo aplicados em todas as implantações
- Cota de tokens alocada por equipe com alertas de budget
- Comitê de governança de IA (CTO, CISO, Jurídico, Privacidade) revisa novos casos de uso de IA
- Defender for Cloud Apps monitorando para detecção de shadow AI

**Operações:**
- AzGovViz executando diariamente via pipeline Azure DevOps, relatórios publicados no SharePoint
- Workbooks customizados do Azure Monitor para dashboards de governança, custo e segurança
- Queries do Resource Graph automatizadas e resultados publicados semanalmente
- Comitê de revisão de governança se reúne mensalmente
- Revisão anual do framework de governança alinhada com o ciclo de auditoria regulatória

### Resultados

| Métrica | Valor |
|---|---|
| Taxa de conformidade com políticas | 96,4% |
| Secure Score | 82 |
| Tempo de provisionamento de subscription | 45 minutos (totalmente automatizado) |
| Custo mensal | $1,2M (controlado; 15% menor que projeção sem gerenciamento) |
| Economias anuais de custos com FinOps | $275K |
| Achados de auditoria regulatória (governança) | 0 críticos, 3 menores |
| Cobertura de governança híbrida | 100% dos servidores on-premises |
| Incidentes de shadow AI detectados | 14 (endereçados em até 48 horas) |
| Entrega de relatórios de governança | Diária (automatizada) |

**Principal aprendizado:** Em escala enterprise, a governança deve ser totalmente automatizada, continuamente monitorada e profundamente integrada aos processos organizacionais. A combinação de ALZ, Policy as Code, subscription vending, Arc e FinOps cria uma plataforma de autoatendimento com guardrails que permite às equipes se moverem rapidamente sem comprometer a conformidade.

---

## Resumo — Maturidade em um Olhar

| Capacidade | Crawl (CloudBrew) | Walk (Meridian) | Run (GlobalTech) |
|---|---|---|---|
| Identidade | MFA + RBAC básico | PIM + Access Reviews | Identity Governance + Conditional Access |
| Organização | 1 subscription, convenção de nomenclatura | Management groups + hierarquia | ALZ completo + subscription vending |
| Política | 3 políticas em modo audit | EPAC + Deny/DINE | 200+ políticas, initiatives customizadas por regulamentação |
| Custo | Budget + alertas | Budgets por equipe + revisões mensais | Equipe de FinOps + chargeback + Reservations |
| Segurança | Defender (gratuito) | Defender CSPM + MCSB | Defender completo + Sentinel + conformidade regulatória |
| Operações | Verificações manuais | AzGovViz + workbooks | Automação diária + comitê de governança |
| Híbrido | N/A | N/A | Azure Arc para 200+ servidores |
| IA | N/A | N/A | AOAI centralizado + comitê de governança de IA |

---

| Anterior | Próximo |
|:---|:---|
| [Roadmap de Governança](ch28-governance-roadmap.md) | [FAQ](ch30-faq.md) |
