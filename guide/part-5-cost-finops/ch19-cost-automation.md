# Capítulo 19 — Automação de Custos

> Last verified: 2026-04-06

---

## Visão Geral

A gestão manual de custos não escala. Conforme as organizações expandem sua presença no Azure, controles automatizados de custos se tornam essenciais para prevenir estouros de orçamento, aplicar políticas de gastos e otimizar a utilização de recursos sem intervenção humana.

A automação de custos abrange:

- **Ações automatizadas de orçamento** — acionar workflows quando limites de gastos são ultrapassados
- **Automação do ciclo de vida de recursos** — auto-shutdown, auto-start e auto-delete para ambientes de dev/test
- **Gestão programática de orçamentos** — criar e gerenciar orçamentos via REST API, Bicep ou CLI
- **Otimização orientada pelo Advisor** — atuar nas recomendações do Azure Advisor automaticamente
- **Workflows personalizados de alerta** — direcionar alertas de custo para Slack, Teams, sistemas de tickets ou lógica customizada

---

## Como Funciona

### Ações Automatizadas de Orçamento com Action Groups

Os orçamentos do Azure podem acionar **action groups** quando limites são ultrapassados. Action groups suportam múltiplos canais de notificação e automação:

| Tipo de Ação | Descrição |
|--------------|-----------|
| **Email** | Enviar notificações para indivíduos ou listas de distribuição |
| **SMS** | Alertas por mensagem de texto para limites urgentes |
| **Azure Function** | Executar código serverless (ex.: desligar VMs, enviar chamadas de API) |
| **Logic App** | Acionar um workflow (ex.: criar um ticket no ServiceNow, postar no Teams) |
| **Webhook** | Chamar qualquer endpoint HTTP |
| **Automation Runbook** | Executar um runbook do Azure Automation |
| **Event Hub** | Transmitir para Event Hub para processamento customizado |
| **ITSM** | Integrar com ferramentas de IT Service Management |

### Logic Apps para Workflows de Alerta de Custo

**Azure Logic Apps** habilitam workflows low-code acionados por alertas de orçamento. Padrões comuns:

- **Workflow de escalonamento** — quando o orçamento excede 80%, enviar e-mail ao líder da equipe; em 100%, enviar e-mail ao VP e criar um ticket bloqueador
- **Notificação no Slack/Teams** — postar alertas de custo em um canal compartilhado com link para a análise de custos
- **Ação em recursos** — quando um orçamento de dev/test é excedido, desalocar automaticamente todas as VMs no grupo de recursos

### Auto-Shutdown para Ambientes de Dev/Test

Ambientes de dev/test são candidatos ideais para automação de custos. Abordagens comuns:

| Abordagem | Ferramenta | Escopo |
|-----------|------------|--------|
| **Auto-shutdown de VM** | Recurso nativo do Azure | VMs individuais |
| **Start/Stop VMs v2** | Solução baseada em Azure Function | Múltiplas VMs por tag, grupo de recursos ou assinatura |
| **Shutdown acionado por orçamento** | Budget + Action Group + Azure Function | Grupo de recursos ou assinatura |
| **Azure DevTest Labs** | Ambientes de laboratório gerenciados | VMs de laboratório com políticas de auto-shutdown |
| **Pipeline agendado** | GitHub Actions / Azure DevOps via cron | Qualquer recurso via comandos CLI |

### Gestão Programática de Orçamentos

#### REST API

```bash
# Create a budget via REST API
az rest --method put \
  --uri "https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Consumption/budgets/monthly-budget?api-version=2024-08-01" \
  --body '{
    "properties": {
      "category": "Cost",
      "amount": 10000,
      "timeGrain": "Monthly",
      "timePeriod": {
        "startDate": "2026-04-01",
        "endDate": "2027-03-31"
      },
      "notifications": {
        "actual80": {
          "enabled": true,
          "operator": "GreaterThan",
          "threshold": 80,
          "thresholdType": "Actual",
          "contactEmails": ["team@contoso.com"]
        }
      }
    }
  }'
```

### API do Azure Advisor para Recomendações de Otimização

A **REST API do Azure Advisor** fornece acesso programático às recomendações de otimização de custos:

```bash
# Get cost recommendations for a subscription
az advisor recommendation list \
  --category Cost \
  --output table

# Get detailed information about a specific recommendation
az advisor recommendation list \
  --category Cost \
  --query "[?shortDescription.solution=='Right-size or shutdown underutilized virtual machines']" \
  --output json
```

Padrões comuns de automação com o Advisor:

- **Relatório semanal** — consultar a API do Advisor e enviar um e-mail resumo com economias estimadas
- **Auto-remediação** — para recomendações de baixo risco (ex.: excluir discos não anexados), aplicar automaticamente
- **Criação de tickets** — para recomendações de alto impacto (ex.: redimensionar VMs), criar itens de trabalho no sistema de rastreamento

---

## Melhores Práticas

1. **Escalone alertas de orçamento** — defina alertas em 50% (informativo), 80% (aviso) e 100% (ação necessária)
2. **Use alertas de previsão** — alertas de previsão dão tempo para agir antes que o limite real seja atingido
3. **Automatize desligamentos de dev/test** — agende VMs para desligar no fim do expediente; inicie sob demanda
4. **Marque recursos para escopo de automação** — use tags como `AutoShutdown: true` para direcionar a automação
5. **Teste ações em não-produção primeiro** — valide ações de orçamento e Logic Apps em uma assinatura de dev
6. **Monitore a saúde da automação** — alerte sobre falhas de action groups para garantir que as automações estão realmente executando
7. **Combine orçamentos com políticas** — use orçamentos para alertas e Azure Policy para prevenção (ex.: restringir SKUs caras)
8. **Revise recomendações do Advisor semanalmente** — automatize a recuperação; aprove manualmente mudanças de alto impacto
9. **Use managed identities** — autentique Azure Functions e Logic Apps com managed identities, não credenciais armazenadas
10. **Documente o comportamento da automação** — as equipes devem saber o que acontece quando um orçamento é excedido

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Ações de orçamento que desligam produção | Interrupção de produção | Nunca configure ações de auto-shutdown em escopos de produção |
| Sem monitoramento da saúde do action group | Falhas silenciosas; alertas nunca enviados | Monitore a execução do action group via Activity Log |
| Dependência excessiva de alertas por e-mail | Fadiga de alertas; e-mails ignorados | Use alertas acionáveis (tickets, auto-remediação) além de e-mail |
| Não testar ações de orçamento | Ações falham quando necessárias | Teste action groups com limite baixo em uma assinatura de dev |
| Auto-exclusão de recursos sem aprovação | Perda de dados | Apenas auto-exclua recursos claramente órfãos; exija aprovação para outros |
| Usar client secrets na automação | Risco de segurança | Use managed identities para Azure Functions e Logic Apps |

---

## Exemplos de Código

### Orçamento com Action Group via Bicep

```bicep
// cost-automation.bicep
targetScope = 'resourceGroup'

@description('Monthly budget amount in USD.')
param budgetAmount int = 3000

@description('Budget start date (YYYY-MM-DD, first of month).')
param startDate string = '2026-04-01'

@description('Budget end date (YYYY-MM-DD).')
param endDate string = '2027-03-31'

@description('Email addresses for notifications.')
param alertEmails array = ['finops@contoso.com']

@description('Webhook URL for external integration (e.g., Slack, Teams).')
param webhookUrl string = ''

// Action group with email and optional webhook
resource costActionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-cost-automation'
  location: 'global'
  properties: {
    groupShortName: 'CostAuto'
    enabled: true
    emailReceivers: [
      for (email, i) in alertEmails: {
        name: 'email-receiver-${i}'
        emailAddress: email
        useCommonAlertSchema: true
      }
    ]
    webhookReceivers: !empty(webhookUrl) ? [
      {
        name: 'external-webhook'
        serviceUri: webhookUrl
        useCommonAlertSchema: true
      }
    ] : []
  }
}

// Budget with tiered alerts
resource budget 'Microsoft.Consumption/budgets@2024-08-01' = {
  name: 'budget-${resourceGroup().name}'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
      endDate: endDate
    }
    notifications: {
      informational50: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: alertEmails
      }
      warning80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: alertEmails
        contactGroups: [costActionGroup.id]
      }
      critical100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: alertEmails
        contactGroups: [costActionGroup.id]
      }
      forecast100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: alertEmails
        contactGroups: [costActionGroup.id]
      }
    }
  }
}

output budgetName string = budget.name
output actionGroupId string = costActionGroup.id
```

### Agendamento de Auto-Shutdown via Bicep

```bicep
// vm-auto-shutdown.bicep
targetScope = 'resourceGroup'

@description('Name of the VM to configure auto-shutdown for.')
param vmName string

@description('Shutdown time in HHmm format (24-hour, UTC).')
param shutdownTime string = '1900'

@description('Time zone for the shutdown schedule.')
param timeZone string = 'Eastern Standard Time'

@description('Email for shutdown notifications.')
param notificationEmail string = ''

resource shutdownSchedule 'Microsoft.DevTestLab/schedules@2018-09-15' = {
  name: 'shutdown-computevm-${vmName}'
  location: resourceGroup().location
  properties: {
    status: 'Enabled'
    taskType: 'ComputeVmShutdownTask'
    dailyRecurrence: {
      time: shutdownTime
    }
    timeZoneId: timeZone
    targetResourceId: resourceId('Microsoft.Compute/virtualMachines', vmName)
    notificationSettings: !empty(notificationEmail) ? {
      status: 'Enabled'
      emailRecipient: notificationEmail
      timeInMinutes: 30
      notificationLocale: 'en'
    } : {
      status: 'Disabled'
    }
  }
}
```

### GitHub Actions: Relatório Semanal de Custos do Advisor

```yaml
# .github/workflows/advisor-cost-report.yml
name: Weekly Advisor Cost Report

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 8:00 UTC
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  advisor-report:
    runs-on: ubuntu-latest
    steps:
      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Get Advisor Cost Recommendations
        run: |
          echo "# Azure Advisor Cost Recommendations" > report.md
          echo "Generated: $(date -u)" >> report.md
          echo "" >> report.md

          az advisor recommendation list \
            --category Cost \
            --query "[].{Impact: impact, Problem: shortDescription.problem, Solution: shortDescription.solution, Savings: extendedProperties.annualSavingsAmount}" \
            --output table >> report.md

      - name: Send Report via Email
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.SMTP_SERVER }}
          server_port: 587
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: 'Weekly Azure Advisor Cost Report'
          to: finops@contoso.com
          from: azure-governance@contoso.com
          body: file://report.md
```

---

## Referências

- [Budget action groups](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets#configure-budget-action-groups)
- [Azure Advisor REST API](https://learn.microsoft.com/en-us/rest/api/advisor/)
- [Azure Advisor CLI reference](https://learn.microsoft.com/en-us/cli/azure/advisor)
- [Start/Stop VMs v2](https://learn.microsoft.com/en-us/azure/azure-functions/start-stop-vms/overview)
- [Auto-shutdown for VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/auto-shutdown-vm)
- [Azure Logic Apps overview](https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-overview)
- [Azure Automation runbooks](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-types)
- [Consumption Budgets API](https://learn.microsoft.com/en-us/rest/api/consumption/budgets)
- [Managed identities for Azure resources](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

---

| Anterior | Próximo |
|:---------|:--------|
| [FinOps](ch18-finops.md) | [Azure Monitor](../part-6-observability/ch20-azure-monitor.md) |
