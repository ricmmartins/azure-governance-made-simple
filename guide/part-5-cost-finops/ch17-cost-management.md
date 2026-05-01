# Capítulo 17 — Cost Management

> Last verified: 2026-04-06

---

## Visão Geral

**Azure Cost Management + Billing** é o serviço central para monitorar, alocar e otimizar os gastos no Azure. Para equipes de governança, ele fornece os controles necessários para prevenir estouros de orçamento, garantir responsabilidade e construir uma cultura de consciência de custos em toda a organização.

Governança de custos não é apenas sobre reduzir gastos — é sobre garantir que *cada real gasto entregue valor ao negócio* e que *os gastos sejam previsíveis, rastreáveis e alinhados com as políticas organizacionais*.

Capacidades principais:

- **Análise de custos** — exploração interativa de custos por serviço, grupo de recursos, tag, assinatura e dimensões customizadas
- **Orçamentos** — definição de limites de gastos com alertas e ações automatizadas
- **Detecção de anomalias** — identificação de picos de custo inesperados com inteligência artificial
- **Alocação de custos** — regras para distribuir custos compartilhados entre equipes e centros de custo
- **Exportações** — exportações programadas de dados para contas de armazenamento para análise externa
- **Recomendações do Advisor** — sugestões acionáveis para economia de custos
- **Savings Plans e Reservations** — modelos de preço com compromisso de uso para descontos significativos
- **Suporte multi-cloud** — visualize custos da AWS junto com os do Azure em um único painel

---

## Como Funciona

### Análise de Custos

A análise de custos é a principal ferramenta investigativa. Ela responde perguntas como *"Por que os gastos aumentaram no mês passado?"* e *"Qual equipe está consumindo mais computação?"*

Visões principais:

| Visão | Propósito |
|-------|-----------|
| **Custos acumulados** | Total acumulado ao longo de um período |
| **Custos diários** | Detalhamento dia a dia para análise de tendências |
| **Custo por serviço** | Quais serviços do Azure custam mais |
| **Custo por recurso** | Quais recursos individuais custam mais |
| **Custo por tag** | Alocação de custos por dimensões de negócio (CostCenter, Team, Project) |

A análise de custos suporta agrupamento por:
- Assinatura, grupo de recursos, recurso
- Nome do serviço, categoria de medidor
- Chave/valor de tag
- Localização (região)
- Modelo de preço (On-demand, Reservation, Savings Plan, Spot)

### Orçamentos e Alertas

Orçamentos definem limites de gastos em qualquer escopo (management group, assinatura ou grupo de recursos) e disparam alertas quando os gastos reais ou previstos ultrapassam os limites definidos.

**Tipos de alerta de orçamento:**

| Tipo | Gatilho | Caso de Uso |
|------|---------|-------------|
| **Actual** | Dispara quando o gasto real atinge o limite | Reagir a estouros atuais |
| **Forecast** | Dispara quando o gasto projetado deve exceder o limite | Intervenção proativa antes do estouro |

**Ações de alerta:**

- Notificações por e-mail para responsáveis pelo orçamento
- Acionamento de action groups (Azure Functions, Logic Apps, webhooks)
- Respostas automatizadas (ex.: desligar VMs de dev/test, enviar alertas no Slack/Teams)

### Detecção de Anomalias de Custo

O Azure Cost Management inclui **detecção de anomalias** integrada que utiliza machine learning para identificar padrões de gastos incomuns. As anomalias são exibidas em:

- **Análise de custos** — indicadores visuais no gráfico de custos
- **Alertas de anomalia** — notificações configuráveis por e-mail e action groups
- **API do Cost Management** — acesso programático para dashboards personalizados

A detecção de anomalias considera sazonalidade, tendências de crescimento e padrões históricos para minimizar falsos positivos.

### Regras de Alocação de Custos

**Regras de alocação de custos** distribuem custos compartilhados (ex.: uma rede virtual compartilhada, um workspace do Log Analytics) entre equipes consumidoras com base em critérios definidos:

- **Proporção fixa** — dividir custos por percentual (ex.: 60/40 entre duas equipes)
- **Divisão igualitária** — dividir igualmente entre os destinos
- **Proporcional** — alocar com base nas proporções reais de consumo de recursos

As regras de alocação de custos são aplicadas retroativamente e aparecem na análise de custos e exportações, tornando possíveis modelos de chargeback e showback.

### Azure Savings Plans

**Azure Savings Plans** (lançados em outubro de 2022) oferecem preços com desconto em troca de um compromisso de gastar um valor fixo por hora em serviços de computação elegíveis por 1 ou 3 anos.

| Característica | Savings Plans | Reservations |
|----------------|--------------|--------------|
| **Escopo** | Computação entre regiões e SKUs | SKU específica em uma região específica |
| **Flexibilidade** | Aplica-se automaticamente ao uso qualificado | Deve corresponder exatamente ao tipo de recurso e região |
| **Desconto** | Até 65% de desconto sobre pay-as-you-go | Até 72% de desconto sobre pay-as-you-go |
| **Serviços** | VMs, App Service, Container Instances, Azure Functions Premium, Azure Dedicated Hosts | VMs, SQL, Cosmos DB, Storage e muitos outros |

**Melhor prática:** Use Savings Plans para cargas de trabalho de computação que podem mudar de SKU ou região, e Reservations para cargas de trabalho estáveis e previsíveis.

### Reservations

**Azure Reservations** fornecem preços com desconto quando você se compromete com um tipo de recurso e configuração específicos por 1 ou 3 anos:

- **Virtual Machines** — compromisso com uma família de VM e região específicas
- **SQL Database** — reservar vCores ou DTUs
- **Cosmos DB** — reservar throughput (RU/s)
- **Storage** — reservar capacidade para blob, file e Data Lake
- **Muitos outros** — App Service, Synapse, Redis, Databricks, etc.

### Recomendações de Custo do Azure Advisor

O **Azure Advisor** analisa continuamente a utilização de recursos e fornece recomendações acionáveis:

- **Redimensionar ou desligar VMs subutilizadas**
- **Comprar Reservations ou Savings Plans** com base em padrões de uso
- **Excluir recursos não utilizados** (discos órfãos, IPs públicos não utilizados)
- **Usar Spot VMs** para cargas de trabalho tolerantes a falhas
- **Otimizar camadas de armazenamento** (mover dados acessados com pouca frequência para cool/archive)

---

## Melhores Práticas

1. **Defina orçamentos em cada escopo** — management group, assinatura e grupo de recursos; alerte em 50%, 75%, 90% e 100%
2. **Use tags para alocação de custos** — exija as tags `CostCenter`, `Team` e `Environment` via Azure Policy
3. **Habilite alertas de anomalia** — configure action groups para notificar líderes de FinOps sobre anomalias
4. **Revise as recomendações do Advisor semanalmente** — atribua responsáveis para atuar nas recomendações de redimensionamento e reservas
5. **Automatize desligamentos de dev/test** — use agendamentos de auto-shutdown ou ações acionadas por orçamento para parar recursos de não-produção fora do horário
6. **Exporte dados de custo** — agende exportações diárias para uma conta de armazenamento para integração com Power BI, dashboards personalizados ou ferramentas de FinOps
7. **Combine Savings Plans e Reservations** — use Savings Plans para computação flexível e Reservations para cargas de trabalho previsíveis
8. **Use regras de alocação de custos** — distribua custos de infraestrutura compartilhada para equipes consumidoras para garantir responsabilidade
9. **Revise custos mensalmente** — conduza revisões mensais de custos com stakeholders; compare real vs. orçamento
10. **Use orçamentos de management group** — defina limites de gastos corporativos além dos orçamentos no nível de assinatura

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Nenhum orçamento definido | Gastos passam despercebidos até a fatura chegar | Defina orçamentos com alertas de previsão em cada escopo |
| Tags não aplicadas | Impossível alocar custos para unidades de negócio | Use Azure Policy para exigir tags antes da criação de recursos |
| Ignorar recomendações do Advisor | Gastos desperdiçados em recursos subutilizados | Revise o Advisor semanalmente; acompanhe a adoção de recomendações |
| Comprometimento excessivo com Reservations | Pagando por capacidade que não utiliza | Comece com Savings Plans para flexibilidade; reserve apenas cargas de trabalho estáveis |
| Não usar detecção de anomalias | Picos de custo passam despercebidos por dias | Habilite alertas de anomalia com action groups |
| Revisões de custos apenas manuais | Lento, propenso a erros, infrequente | Automatize exportações e dashboards |
| Recursos compartilhados sem alocação | Equipes não têm visibilidade dos custos reais | Configure regras de alocação de custos |

---

## Exemplos de Código

### Criando um Orçamento via Azure CLI

```bash
# Create a monthly budget with alerts at 80% and 100%
az consumption budget create \
  --budget-name 'monthly-governance-budget' \
  --amount 5000 \
  --time-grain Monthly \
  --start-date '2026-04-01' \
  --end-date '2027-03-31' \
  --resource-group 'rg-governance-prod' \
  --category Cost \
  --notifications '{
    "actual_GreaterThan_80_Percent": {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 80,
      "contactEmails": ["governance-team@contoso.com"],
      "thresholdType": "Actual"
    },
    "forecasted_GreaterThan_100_Percent": {
      "enabled": true,
      "operator": "GreaterThan",
      "threshold": 100,
      "contactEmails": ["governance-team@contoso.com", "finance@contoso.com"],
      "thresholdType": "Forecasted"
    }
  }'
```

### Criando um Orçamento com Action Group via Bicep

Este template Bicep cria um orçamento com um action group que dispara um e-mail e um Logic App quando o limite do orçamento é excedido:

```bicep
// budget-with-alerts.bicep
targetScope = 'resourceGroup'

@description('Monthly budget amount in USD.')
param budgetAmount int = 5000

@description('Budget start date (first day of a month, YYYY-MM-DD).')
param startDate string = '2026-04-01'

@description('Budget end date (YYYY-MM-DD).')
param endDate string = '2027-03-31'

@description('Email addresses for budget notifications.')
param notificationEmails array = ['governance-team@contoso.com']

@description('Name of the budget.')
param budgetName string = 'monthly-governance-budget'

// Action group for budget alerts
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-budget-alerts'
  location: 'global'
  properties: {
    groupShortName: 'BudgetAlert'
    enabled: true
    emailReceivers: [
      for (email, i) in notificationEmails: {
        name: 'email-${i}'
        emailAddress: email
        useCommonAlertSchema: true
      }
    ]
  }
}

// Budget with notifications and action group
resource budget 'Microsoft.Consumption/budgets@2024-08-01' = {
  name: budgetName
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
      endDate: endDate
    }
    notifications: {
      actual80Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: notificationEmails
        contactGroups: [actionGroup.id]
      }
      actual100Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: notificationEmails
        contactGroups: [actionGroup.id]
      }
      forecasted100Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: notificationEmails
        contactGroups: [actionGroup.id]
      }
    }
  }
}

output budgetId string = budget.id
output actionGroupId string = actionGroup.id
```

### Consultando Anomalias de Custo via Azure CLI

```bash
# List recent cost anomalies for a subscription
az costmanagement query \
  --type ActualCost \
  --scope 'subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --timeframe MonthToDate \
  --dataset-grouping name="ResourceGroup" type="Dimension" \
  --output table
```

---

## Referências

- [Azure Cost Management + Billing overview](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-overview)
- [Create and manage budgets](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [Cost anomaly detection](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/analyze-unexpected-charges)
- [Cost allocation rules](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/allocate-costs)
- [Azure Savings Plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)
- [Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations)
- [Azure Advisor cost recommendations](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations)
- [Export cost data](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-export-acm-data)
- [Well-Architected Framework — Cost Optimization](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/)
- [Control Azure spending (Microsoft Learn path)](https://learn.microsoft.com/en-us/training/paths/control-spending-manage-bills/)

---

| Anterior | Próximo |
|:---------|:--------|
| [Governance CI/CD](../part-4-iac-deployment/ch16-governance-cicd.md) | [FinOps](ch18-finops.md) |
