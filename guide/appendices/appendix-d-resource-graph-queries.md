# Apêndice D — Queries do Resource Graph

> Last verified: 2026-04-06

---

As 20 principais queries de governança para Azure Resource Graph. Estas queries podem ser executadas no Portal Azure (Resource Graph Explorer), Azure CLI, Azure PowerShell ou programaticamente via API REST.

> **Dica:** Adicione aos favoritos o [Azure Resource Graph Explorer](https://portal.azure.com/#blade/HubsExtension/ArgQueryBlade) no Portal Azure para acesso rápido.

---

## Inventário de Recursos (Queries 1–5)

### 1. Todos os Recursos — Inventário Completo

Listar todos os recursos em todas as subscriptions com metadados-chave.

```kusto
resources
| project name, type, location, resourceGroup, subscriptionId, tags
| order by type asc, name asc
```

---

### 2. Contagem de Recursos por Tipo

Entender a composição do seu ambiente Azure.

```kusto
resources
| summarize Count = count() by type
| order by Count desc
```

---

### 3. Contagem de Recursos por Região

Identificar como os recursos estão distribuídos geograficamente.

```kusto
resources
| summarize Count = count() by location
| order by Count desc
```

---

### 4. Recursos por Tag

Encontrar todos os recursos com um valor de tag específico (ex.: Environment=Production).

```kusto
resources
| where tags['Environment'] == 'Production'
| project name, type, location, resourceGroup, subscriptionId
| order by type asc, name asc
```

---

### 5. Contagem de Recursos por Subscription

Ver como os recursos estão distribuídos entre subscriptions.

```kusto
resources
| summarize Count = count() by subscriptionId
| join kind=leftouter (
    resourcecontainers
    | where type == "microsoft.resources/subscriptions"
    | project subscriptionId, subscriptionName = name
) on subscriptionId
| project subscriptionName, subscriptionId, Count
| order by Count desc
```

---

## Conformidade (Queries 6–10)

### 6. Recursos Não Conformes (Policy)

Listar todos os recursos não conformes com Azure Policy.

```kusto
policyresources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| extend policyName = tostring(properties.policyDefinitionName),
         resourceId = tostring(properties.resourceId),
         policyEffect = tostring(properties.policyDefinitionAction)
| project resourceId, policyName, policyEffect
| order by policyName asc
```

---

### 7. Resumo de Atribuições de Política

Listar todas as atribuições de política com seu escopo e modo de enforcement.

```kusto
policyresources
| where type == "microsoft.authorization/policyassignments"
| extend displayName = properties.displayName,
         enforcementMode = properties.enforcementMode,
         scope = properties.scope
| project name, displayName, enforcementMode, scope
| order by displayName asc
```

---

### 8. Recursos Sem Tags

Encontrar recursos que estão sem tags críticas de governança.

```kusto
resources
| where isnull(tags) or tags == '{}'
| project name, type, location, resourceGroup, subscriptionId
| order by type asc, name asc
```

Para verificar uma tag específica ausente:

```kusto
resources
| where isempty(tags['Environment'])
| project name, type, location, resourceGroup, subscriptionId
| order by type asc, name asc
```

---

### 9. Recursos Sem Resource Locks

Identificar recursos que não possuem locks aplicados. Locks não expõem um campo `properties.resourceId`; em vez disso, o escopo do recurso bloqueado é derivado truncando o ID do próprio lock em `/providers/Microsoft.Authorization/locks/`.

```kusto
resources
| where type !~ 'microsoft.authorization/locks'
| project resourceId = tolower(id), name, type, resourceGroup, subscriptionId
| join kind=leftanti (
    resources
    | where type =~ 'microsoft.authorization/locks'
    | extend lockScope = tolower(substring(id, 0, indexof(id, '/providers/Microsoft.Authorization/locks/')))
    | project lockScope
) on $left.resourceId == $right.lockScope
| order by type asc
```

Alternativa — listar resource groups sem locks:

```kusto
resourcecontainers
| where type == "microsoft.resources/subscriptions/resourcegroups"
| join kind=leftouter (
    resources
    | where type == "microsoft.authorization/locks"
    | project resourceGroup, lockName = name
) on resourceGroup
| where isempty(lockName)
| project name, subscriptionId, location
| order by name asc
```

---

### 10. Recursos Órfãos

Encontrar recursos potencialmente órfãos (discos não anexados, IPs públicos não utilizados, NICs vazias).

```kusto
// Unattached managed disks
resources
| where type == "microsoft.compute/disks"
| where properties.diskState == "Unattached"
| project name, resourceGroup, subscriptionId, diskSizeGb = properties.diskSizeGB,
    sku = sku.name, location
| order by tolong(diskSizeGb) desc
```

```kusto
// Unused public IP addresses
resources
| where type == "microsoft.network/publicipaddresses"
| where isnull(properties.ipConfiguration)
| project name, resourceGroup, subscriptionId, location,
    ipAddress = properties.ipAddress
```

```kusto
// Network interfaces not attached to any VM
resources
| where type == "microsoft.network/networkinterfaces"
| where isnull(properties.virtualMachine)
| project name, resourceGroup, subscriptionId, location
```

---

## Identidade (Queries 11–15)

### 11. Atribuições de Role RBAC

Listar todas as atribuições de role entre subscriptions.

```kusto
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend principalId = tostring(properties.principalId),
         roleDefinitionId = tostring(properties.roleDefinitionId),
         principalType = tostring(properties.principalType),
         scope = tostring(properties.scope)
| project principalId, principalType, roleDefinitionId, scope
| order by principalType asc
```

---

### 12. Service Principals com Atribuições de Role

Identificar service principals que possuem atribuições de role Azure.

```kusto
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| where properties.principalType == "ServicePrincipal"
| extend principalId = tostring(properties.principalId),
         roleDefinitionId = tostring(properties.roleDefinitionId),
         scope = tostring(properties.scope)
| project principalId, roleDefinitionId, scope
| order by principalId asc
```

---

### 13. Managed Identities em Uso

Listar todas as managed identities (system-assigned e user-assigned) entre recursos.

```kusto
resources
| where isnotnull(identity)
| extend identityType = tostring(identity.type)
| project name, type, identityType, resourceGroup, subscriptionId
| order by identityType asc, type asc
```

---

### 14. Recursos com Managed Identity System-Assigned

Encontrar recursos usando managed identities system-assigned.

```kusto
resources
| where identity.type has "SystemAssigned"
| extend principalId = tostring(identity.principalId)
| project name, type, principalId, resourceGroup, subscriptionId
| order by type asc
```

---

### 15. Uso de Managed Identity User-Assigned

Listar managed identities user-assigned e os recursos aos quais estão atribuídas.

```kusto
resources
| where identity.type has "UserAssigned"
| mv-expand userIdentity = identity.userAssignedIdentities
| project name, type, resourceGroup, subscriptionId
| order by type asc
```

---

## Custo e Operações (Queries 16–20)

### 16. Contagem de Recursos ao Longo do Tempo (Snapshot)

Contar total de recursos por subscription (use como baseline para tendências).

```kusto
resources
| summarize ResourceCount = count() by subscriptionId
| join kind=leftouter (
    resourcecontainers
    | where type == "microsoft.resources/subscriptions"
    | project subscriptionId, subscriptionName = name
) on subscriptionId
| project subscriptionName, ResourceCount
| order by ResourceCount desc
```

> **Nota:** Resource Graph fornece um snapshot point-in-time. Para tendências históricas, exporte os resultados desta query em um agendamento (ex.: diariamente via Azure Automation ou Logic Apps) e armazene no Log Analytics.

---

### 17. Alterações Recentes em Recursos (Change Analysis)

Consultar alterações recentes usando o rastreamento de mudanças do Resource Graph.

```kusto
resourcechanges
| extend changeTime = todatetime(properties.changeAttributes.timestamp),
         changeType = tostring(properties.changeType),
         targetResourceId = tostring(properties.targetResourceId),
         targetResourceType = tostring(properties.targetResourceType)
| where changeTime > ago(24h)
| project changeTime, changeType, targetResourceType, targetResourceId
| order by changeTime desc
| take 100
```

---

### 18. Recomendações do Azure Advisor

Listar recomendações ativas do Advisor entre subscriptions.

```kusto
advisorresources
| where type == "microsoft.advisor/recommendations"
| extend category = tostring(properties.category),
         impact = tostring(properties.impact),
         recommendation = tostring(properties.shortDescription.solution)
| project category, impact, recommendation, resourceGroup, subscriptionId
| order by category asc, impact desc
```

---

### 19. Status de Saúde dos Recursos

Verificar o status de saúde dos recursos Azure.

```kusto
healthresources
| where type == "microsoft.resourcehealth/availabilitystatuses"
| extend availabilityState = tostring(properties.availabilityState),
         reasonType = tostring(properties.reasonType),
         resourceId = tostring(properties.targetResourceId)
| project resourceId, availabilityState, reasonType
| where availabilityState != "Available"
| order by availabilityState asc
```

---

### 20. Hierarquia de Management Groups

Visualizar toda a estrutura de management groups.

```kusto
resourcecontainers
| where type == "microsoft.management/managementgroups"
| extend parentId = tostring(properties.details.parent.id),
         displayName = tostring(properties.displayName)
| project id, name, displayName, parentId
| order by id asc
```

---

## Executando Queries do Resource Graph

### Azure CLI

```bash
az graph query -q "resources | summarize count() by type | order by count_ desc" --first 20
```

### Azure PowerShell

```powershell
Search-AzGraph -Query "resources | summarize count() by type | order by count_ desc" -First 20
```

### Bicep (Deployment Script)

Para queries agendadas, use Azure Automation Runbooks ou Logic Apps com a API REST do Resource Graph:

```
POST https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01
{
  "query": "resources | summarize count() by type | order by count_ desc"
}
```

---

| Anterior | Próximo |
|:---|:---|
| [Apêndice C — Kit Inicial de Políticas](appendix-c-policy-starter-kit.md) | [Apêndice E — Recursos de Aprendizado](appendix-e-learning-resources.md) |
