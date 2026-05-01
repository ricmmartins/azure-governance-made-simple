# Capítulo 20 — Azure Monitor para Governança

> Last verified: 2026-04-06

---

## Visão Geral

**Azure Monitor** é a plataforma unificada de observabilidade do Azure. Embora a maioria das equipes pense nele como uma ferramenta de monitoramento de desempenho de aplicações (APM), ele é igualmente poderoso para **observabilidade de governança** — rastreando quem fez o quê, quando e se os recursos estão em conformidade com os padrões organizacionais.

Para equipes de governança, o Azure Monitor fornece:

- **Activity Logs** — toda operação no plano de controle (criação de recursos, exclusão, alterações de RBAC, operações de política)
- **Diagnostic Settings** — configuração de quais dados de telemetria são coletados e para onde são enviados
- **Log Analytics** — repositório centralizado para consultar dados de governança com KQL
- **Azure Workbooks** — dashboards interativos para relatórios de governança
- **Regras de Alerta** — notificações automatizadas para eventos relevantes de governança

---

## Como Funciona

### Activity Logs

O **Activity Log** registra todas as operações no plano de controle do Azure. Toda chamada de API que modifica um recurso gera uma entrada no Activity Log. Para governança, as categorias mais relevantes são:

| Categoria | O Que Captura |
|-----------|---------------|
| **Administrative** | Operações de criação/atualização/exclusão de recursos |
| **Security** | Alertas do Microsoft Defender for Cloud |
| **Policy** | Resultados de avaliação de políticas e ações de remediação |
| **Recommendation** | Recomendações do Azure Advisor |

As entradas do Activity Log são retidas por **90 dias** por padrão. Para reter dados por mais tempo, configure Diagnostic Settings para enviar Activity Logs para um workspace do Log Analytics, conta de armazenamento ou Event Hub.

**Eventos-chave de governança para monitorar:**

- Atribuições de função RBAC criadas ou excluídas
- Atribuições de política criadas, modificadas ou excluídas
- Resource locks adicionados ou removidos
- Alterações na hierarquia de management groups
- Assinatura movida entre management groups
- Exclusão de recursos em assinaturas de produção

### Diagnostic Settings

**Diagnostic Settings** configuram para onde os logs e métricas da plataforma Azure são enviados. Para governança, você precisa coletar dados de múltiplas fontes em um local central:

| Fonte | Dados | Configuração |
|-------|-------|--------------|
| **Activity Log da Assinatura** | Todas as operações no plano de controle | Diagnostic setting no nível da assinatura |
| **Microsoft Entra ID** | Logs de sign-in, logs de auditoria | Diagnostic setting do Entra ID |
| **Recursos do Azure** | Logs e métricas específicos de cada recurso | Diagnostic setting por recurso |
| **Azure Policy** | Alterações de estado de política | Incluído no Activity Log |

**Destinos recomendados:**

| Destino | Caso de Uso |
|---------|-------------|
| **Workspace do Log Analytics** | Consultas KQL interativas, Workbooks, alertas |
| **Conta de armazenamento** | Retenção de longo prazo, arquivos de conformidade |
| **Event Hub** | Streaming em tempo real para ferramentas SIEM (Sentinel, Splunk) |

### Workspace do Log Analytics

Um **workspace do Log Analytics** é o repositório central de dados para Azure Monitor Logs. Para governança, um workspace dedicado (ou uma tabela dedicada dentro de um workspace compartilhado) coleta:

- Activity Logs de todas as assinaturas
- Logs de auditoria e sign-in do Microsoft Entra ID
- Dados de conformidade do Azure Policy
- Logs personalizados de automação de governança

**Design de workspace para governança:**

| Abordagem | Quando Usar |
|-----------|-------------|
| **Workspace dedicado de governança** | Controle de acesso rigoroso; equipe de governança precisa de isolamento |
| **Workspace compartilhado com RBAC** | Eficiente em custos; use RBAC em nível de tabela para restringir acesso |
| **Workspace por assinatura** | Requisito regulatório de residência de dados ou isolamento |

### Azure Workbooks para Dashboards de Governança

**Azure Workbooks** fornecem relatórios interativos combinando texto, consultas KQL, métricas e parâmetros. São ideais para dashboards de governança porque:

- Não requerem ferramentas externas
- Suportam parâmetros (ex.: selecionar uma assinatura ou intervalo de tempo)
- Podem ser compartilhados via Portal Azure ou exportados como templates ARM/Bicep
- Integram-se diretamente com Log Analytics e Azure Resource Graph

**Workbooks de governança recomendados:**

| Workbook | Conteúdo |
|----------|----------|
| **Visão Geral de RBAC** | Atribuições de função por escopo, alterações recentes, ativações PIM |
| **Conformidade de Política** | Recursos não conformes, tendências de conformidade, status de remediação |
| **Inventário de Recursos** | Recursos por tipo, região, conformidade de tags, recursos órfãos |
| **Governança de Custos** | Utilização de orçamento, anomalias, recomendações do Advisor |
| **Postura de Segurança** | Tendências do Secure Score, alertas do Defender, status de vulnerabilidades |

### Regras de Alerta para Eventos de Governança

Configure **regras de alerta** para notificar equipes de governança quando eventos críticos ocorrerem:

| Evento | Alvo da Consulta KQL | Severidade do Alerta |
|--------|----------------------|---------------------|
| Nova atribuição de função Owner | Activity Log — atribuições de função | Sev 1 (Crítico) |
| Resource lock removido | Activity Log — operações de lock | Sev 2 (Aviso) |
| Atribuição de política excluída | Activity Log — operações de política | Sev 1 (Crítico) |
| Recurso excluído em produção | Activity Log — operações de exclusão | Sev 2 (Aviso) |
| Assinatura movida | Activity Log — operações de assinatura | Sev 1 (Crítico) |
| Definição de função customizada modificada | Activity Log — definições de função | Sev 2 (Aviso) |

---

## Melhores Práticas

1. **Centralize Activity Logs** — envie todos os Activity Logs de assinatura para um único workspace do Log Analytics
2. **Retenha dados adequadamente** — 90 dias no Log Analytics para consultas interativas; arquive em armazenamento para conformidade (1–7 anos)
3. **Colete logs do Microsoft Entra ID** — logs de sign-in e auditoria são essenciais para governança; configure Diagnostic Settings do Entra ID
4. **Crie regras de alerta específicas para governança** — alerte sobre alterações de RBAC, exclusões de política e remoções de resource locks
5. **Construa Workbooks, não consultas pontuais** — Workbooks reutilizáveis fornecem relatórios consistentes para toda a equipe
6. **Use action groups para alertas** — direcione alertas de governança para canais de plantão, não apenas e-mail
7. **Aplique RBAC no workspace** — restrinja quem pode consultar dados sensíveis de governança
8. **Marque seus recursos de monitoramento** — o workspace de governança e os alertas devem ser tagueados e orçados
9. **Revise alertas regularmente** — ajuste regras de alerta para reduzir ruído e garantir sinal
10. **Integre com Microsoft Sentinel** — para detecção avançada de ameaças e investigação de violações de governança

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Não coletar Activity Logs centralmente | Sem visibilidade em operações entre assinaturas | Configure diagnostic settings em cada assinatura |
| Apenas retenção padrão de 90 dias | Dados históricos de governança perdidos | Arquive em conta de armazenamento para retenção de longo prazo |
| Fadiga de alertas | Alertas críticos ignorados | Ajuste regras de alerta; use níveis de severidade; direcione para canais apropriados |
| Sem logs do Entra ID | Não é possível correlacionar sign-ins com eventos de governança | Configure diagnostic settings do Entra ID |
| Proliferação de workspaces | Dados espalhados em muitos workspaces | Consolide em um ou poucos workspaces de governança |
| Sem RBAC no workspace | Dados sensíveis de governança acessíveis a todos | Aplique RBAC em nível de tabela ou workspace |

---

## Exemplos de Código

### KQL: Rastreando Atribuições de Função RBAC

```kql
// All RBAC role assignment changes in the last 7 days
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue has "Microsoft.Authorization/roleAssignments"
| where ActivityStatusValue == "Success"
| project
    TimeGenerated,
    Caller,
    OperationNameValue,
    ResourceGroup,
    SubscriptionId,
    Properties = parse_json(Properties)
| extend
    RoleDefinitionId = tostring(Properties.requestbody)
| order by TimeGenerated desc
```

```kql
// New Owner or Contributor role assignments (high-privilege)
AzureActivity
| where TimeGenerated > ago(30d)
| where OperationNameValue == "Microsoft.Authorization/roleAssignments/write"
| where ActivityStatusValue == "Success"
| extend Props = parse_json(Properties)
| extend RequestBody = parse_json(tostring(Props.requestbody))
| extend RoleDefinitionId = tostring(RequestBody.properties.roleDefinitionId)
| where RoleDefinitionId has "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"  // Owner
    or RoleDefinitionId has "b24988ac-6180-42a0-ab88-20f7382dd24c"    // Contributor
| project
    TimeGenerated,
    Caller,
    RoleDefinitionId,
    Scope = tostring(RequestBody.properties.scope),
    PrincipalId = tostring(RequestBody.properties.principalId)
| order by TimeGenerated desc
```

```kql
// Policy assignment changes
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue has "Microsoft.Authorization/policyAssignments"
| where ActivityStatusValue == "Success"
| project
    TimeGenerated,
    Caller,
    OperationNameValue,
    ResourceGroup,
    Resource
| order by TimeGenerated desc
```

```kql
// Resource deletions in production subscriptions
AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue endswith "/delete"
| where ActivityStatusValue == "Success"
| where SubscriptionId in ("prod-sub-id-1", "prod-sub-id-2")
| project
    TimeGenerated,
    Caller,
    OperationNameValue,
    ResourceGroup,
    Resource
| summarize DeletionCount = count() by Caller, bin(TimeGenerated, 1h)
| order by DeletionCount desc
```

### Bicep: Diagnostic Settings para Governança

```bicep
// governance-diagnostics.bicep
targetScope = 'subscription'

@description('Log Analytics workspace resource ID.')
param logAnalyticsWorkspaceId string

@description('Storage account resource ID for long-term archival.')
param storageAccountId string = ''

// Subscription-level diagnostic setting for Activity Log
resource activityLogDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01' = {
  name: 'governance-activity-logs'
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    storageAccountId: !empty(storageAccountId) ? storageAccountId : null
    logs: [
      {
        category: 'Administrative'
        enabled: true
      }
      {
        category: 'Security'
        enabled: true
      }
      {
        category: 'Policy'
        enabled: true
      }
      {
        category: 'Recommendation'
        enabled: true
      }
    ]
  }
}
```

### Bicep: Workspace do Log Analytics para Governança

```bicep
// log-analytics.bicep
targetScope = 'resourceGroup'

@description('Workspace name.')
param workspaceName string

@description('Azure region.')
param location string = resourceGroup().location

@description('Retention in days (30-730).')
@minValue(30)
@maxValue(730)
param retentionInDays int = 365

@description('Tags.')
param tags object = {}

resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: workspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionInDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

output workspaceId string = workspace.id
output workspaceName string = workspace.name
output customerId string = workspace.properties.customerId
```

### Bicep: Regra de Alerta para Alterações de RBAC

```bicep
// rbac-change-alert.bicep
targetScope = 'resourceGroup'

@description('Log Analytics workspace resource ID.')
param workspaceId string

@description('Action group resource ID for notifications.')
param actionGroupId string

resource rbacAlert 'Microsoft.Insights/scheduledQueryRules@2022-06-15' = {
  name: 'alert-rbac-owner-assignment'
  location: resourceGroup().location
  tags: {
    Purpose: 'Governance'
    AlertType: 'RBAC'
  }
  properties: {
    displayName: 'High-Privilege Role Assignment Detected'
    description: 'Fires when an Owner or Contributor role is assigned.'
    severity: 1
    enabled: true
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    scopes: [workspaceId]
    criteria: {
      allOf: [
        {
          query: '''
            AzureActivity
            | where OperationNameValue == "Microsoft.Authorization/roleAssignments/write"
            | where ActivityStatusValue == "Success"
            | extend Props = parse_json(Properties)
            | extend RequestBody = parse_json(tostring(Props.requestbody))
            | extend RoleDefId = tostring(RequestBody.properties.roleDefinitionId)
            | where RoleDefId has "8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
               or RoleDefId has "b24988ac-6180-42a0-ab88-20f7382dd24c"
          '''
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
        }
      ]
    }
    actions: {
      actionGroups: [actionGroupId]
    }
  }
}
```

---

## Referências

- [Azure Monitor overview](https://learn.microsoft.com/en-us/azure/azure-monitor/overview)
- [Activity Log](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log)
- [Diagnostic Settings](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings)
- [Log Analytics workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview)
- [Azure Workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview)
- [Log query alert rules](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-log)
- [KQL overview](https://learn.microsoft.com/en-us/kusto/query/)
- [Microsoft Entra ID reporting](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/overview-monitoring-health)
- [Azure Monitor RBAC](https://learn.microsoft.com/en-us/azure/azure-monitor/roles-permissions-security)

---

| Anterior | Próximo |
|:---------|:--------|
| [Cost Automation](../part-5-cost-finops/ch19-cost-automation.md) | [Resource Graph](ch21-resource-graph.md) |
