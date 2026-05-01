# Capítulo 18 — FinOps

> Last verified: 2026-04-06

---

## Visão Geral

**FinOps** (Financial Operations) é uma prática cultural e um framework operacional que traz responsabilidade financeira para os gastos em nuvem. Ele une equipes de engenharia, finanças e negócios em torno de decisões baseadas em dados sobre onde e como investir em recursos de nuvem.

FinOps não é uma ferramenta ou um produto — é uma **disciplina** definida pela [FinOps Foundation](https://www.finops.org/) (parte da Linux Foundation). O Azure fornece as ferramentas, mas FinOps é a prática que torna essas ferramentas eficazes.

Por que equipes de governança devem se preocupar com FinOps:

- Governança define *o que pode ser implantado*; FinOps garante que *o que está implantado seja eficiente em custos*
- Tags, políticas e orçamentos são controles de governança; FinOps é o modelo operacional que os torna significativos
- Sem FinOps, a otimização de custos é reativa (respondendo a estouros) em vez de proativa (otimizando continuamente)

---

## Como Funciona

### O Framework FinOps

A FinOps Foundation define três fases pelas quais as organizações ciclam continuamente:

![FinOps Lifecycle](/images/finops-lifecycle.svg)

#### Fase 1: Informar

**Objetivo:** Criar visibilidade sobre os custos de nuvem para que as equipes possam tomar decisões informadas.

Atividades:
- **Relatórios de showback/chargeback** — atribuir custos a equipes, projetos e centros de custo
- **Estratégia de tags** — aplicar tags consistentes para alocação de custos
- **Dashboards** — construir visibilidade de custos em tempo real para engenharia e finanças
- **Detecção de anomalias** — identificar padrões de gastos inesperados
- **Previsão** — projetar custos futuros com base em tendências e planos comprometidos

Ferramentas Azure: Cost Management, Cost Allocation Rules, Azure Resource Tags, integração com Power BI

#### Fase 2: Otimizar

**Objetivo:** Reduzir desperdício de nuvem e melhorar preços através de descontos baseados em compromisso.

Atividades:
- **Right-sizing** — adequar SKUs de recursos aos requisitos reais de carga de trabalho
- **Savings Plans** — comprometer-se com gastos de computação por hora para até 65% de economia
- **Reservations** — comprometer-se com SKUs específicas para até 72% de economia
- **Spot VMs** — usar capacidade ociosa com até 90% de desconto para cargas tolerantes a falhas
- **Camadas de armazenamento** — mover dados para camadas cool/archive com base em padrões de acesso
- **Limpeza de recursos** — identificar e excluir recursos órfãos (discos não anexados, IPs não utilizados, VMs paradas)

Ferramentas Azure: Azure Advisor, Savings Plans, Reservations, Azure Spot VMs, Storage lifecycle management

#### Fase 3: Operar

**Objetivo:** Incorporar FinOps nos processos organizacionais para que a otimização de custos seja contínua, não pontual.

Atividades:
- **Políticas de governança** — aplicar tags, limites de orçamento e SKUs aprovadas
- **Ações automatizadas** — auto-shutdown de recursos de dev/test, auto-remediação de violações de política
- **Revisões regulares** — revisões mensais de custos com líderes de engenharia e finanças
- **KPIs** — acompanhar métricas como custo por unidade de valor de negócio (ex.: custo por transação, custo por usuário)
- **Cultura** — celebrar vitórias de otimização de custos; tornar a consciência de custos parte da cultura de engenharia

Ferramentas Azure: Azure Policy, Budgets com action groups, Azure Automation, Logic Apps

### Modelo de Maturidade FinOps

A FinOps Foundation define três níveis de maturidade:

| Nível | Nome | Características |
|-------|------|-----------------|
| **1** | **Crawl** | Visibilidade básica; gestão de custos reativa; tags limitadas; sem preços baseados em compromisso |
| **2** | **Walk** | Tags consistentes; right-sizing ativo; Savings Plans e Reservations em uso; revisões mensais de custos; alguma automação |
| **3** | **Run** | Consciência de custos em tempo real; otimização automatizada; cultura FinOps incorporada na engenharia; previsão avançada; otimização contínua de tarifa e uso |

A maioria das organizações começa no Crawl e deve visar o Walk dentro de 6 a 12 meses. Run é uma aspiração contínua.

### Showback vs. Chargeback

| Modelo | Descrição | Impacto na Governança |
|--------|-----------|----------------------|
| **Showback** | Custos são *mostrados* às equipes para conscientização, mas não cobrados de seus orçamentos | Menor atrito; bom para construir cultura de consciência de custos |
| **Chargeback** | Custos são *cobrados de volta* dos orçamentos das equipes através de faturamento interno | Maior responsabilidade; requer tags e alocação maduros |

**Recomendação:** Comece com showback para construir visibilidade e confiança, depois migre para chargeback conforme as tags e a alocação amadureçam.

**Implementação no Azure:**
- Use **regras de alocação de custos** para distribuir custos compartilhados
- Use **tags** (`CostCenter`, `Team`, `Project`) para atribuição direta
- Use **hierarquia de management groups** para alinhar faturamento com a estrutura organizacional
- Exporte dados de custo para **Power BI** ou **Azure Data Explorer** para dashboards personalizados de showback/chargeback

---

## Ferramentas Azure para FinOps

| Ferramenta | Fase FinOps | Propósito |
|------------|-------------|-----------|
| **Azure Cost Management** | Informar, Operar | Análise de custos, orçamentos, exportações, detecção de anomalias |
| **Azure Advisor** | Otimizar | Recomendações de right-sizing, desligamento, reservas e Savings Plans |
| **Azure Savings Plans** | Otimizar | Descontos de computação baseados em compromisso (flexível entre SKUs/regiões) |
| **Azure Reservations** | Otimizar | Descontos baseados em compromisso para SKUs específicas |
| **Azure Policy** | Operar | Aplicar tags, SKUs permitidas, restrições de região |
| **Resource Tags** | Informar | Dimensões de alocação de custos |
| **Cost Allocation Rules** | Informar | Distribuir custos compartilhados |
| **Power BI / Azure Data Explorer** | Informar | Dashboards e relatórios personalizados |
| **Azure Automation / Logic Apps** | Operar | Ações automatizadas de custos (desligamento, alertas) |
| **Azure Resource Graph** | Informar | Consultar inventário de recursos para detecção de órfãos |

---

## Modelos Organizacionais para FinOps

### Equipe Central de FinOps

Uma equipe dedicada é responsável pela prática de FinOps e fornece ferramentas, relatórios e orientação para todas as equipes de engenharia.

**Prós:** Práticas consistentes, expertise centralizada, ferramentas eficientes
**Contras:** Pode se tornar um gargalo; equipes podem não sentir propriedade sobre os custos

### FinOps Incorporado

Cada equipe de engenharia tem um campeão de FinOps designado que é responsável pela otimização de custos em sua área.

**Prós:** Equipes são donas dos seus custos; ação mais rápida; contexto profundo
**Contras:** Práticas inconsistentes; esforço duplicado; requer treinamento

### Hub-and-Spoke (Recomendado)

Uma equipe central de FinOps fornece a plataforma (ferramentas, dashboards, políticas), enquanto campeões incorporados em cada equipe conduzem a otimização do dia a dia.

**Prós:** O melhor dos dois modelos; padrões centrais com execução local
**Contras:** Requer coordenação e comunicação

---

## Melhores Práticas

1. **Comece pela fase Informar** — você não pode otimizar o que não pode ver; obtenha visibilidade antes de otimizar
2. **Aplique tags desde o primeiro dia** — retroativamente aplicar tags é doloroso; use Azure Policy para exigir tags na criação de recursos
3. **Defina orçamentos por equipe** — dê a cada equipe um orçamento e as ferramentas para gerenciá-lo
4. **Combine Savings Plans e Reservations** — use Savings Plans para cobertura flexível e Reservations para cargas de trabalho estáveis
5. **Revise o Advisor semanalmente** — atribua um responsável para triar e atuar nas recomendações do Advisor
6. **Automatize o que puder** — auto-shutdown, auto-remediação e relatórios automatizados reduzem o esforço manual
7. **Torne os custos visíveis** — publique dashboards de custos nos canais de Slack/Teams das equipes
8. **Celebre as vitórias** — reconheça equipes que reduzem desperdício; crie alinhamento de incentivos
9. **Itere na maturidade** — não tente pular do Crawl para o Run; progrida pelo Walk primeiro
10. **Alinhe FinOps com governança** — FinOps e governança são complementares; sua política de tags, política de orçamento e restrições de SKU servem ambas as disciplinas

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Começar pela otimização antes da visibilidade | Otimizar as coisas erradas | Invista em tags e análise de custos primeiro |
| Sem patrocinador executivo | Prática de FinOps carece de autoridade e orçamento | Garanta o patrocínio de VP/CTO antes de começar |
| Comprometimento excessivo com Reservations | Pagando por capacidade não utilizada | Comece com Savings Plans; reserve apenas após analisar 3+ meses de uso |
| Tratar FinOps como um projeto pontual | Benefícios se deterioram conforme padrões de uso mudam | Incorpore FinOps nos ritmos operacionais mensais |
| Sem aplicação de tags | Impossível alocar custos para equipes | Use efeitos deny do Azure Policy para tags obrigatórias |
| Ignorar custos compartilhados | Equipes sub-reportam custos reais | Configure regras de alocação de custos para infraestrutura compartilhada |

---

## Referências

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

| Anterior | Próximo |
|:---------|:--------|
| [Cost Management](ch17-cost-management.md) | [Cost Automation](ch19-cost-automation.md) |
