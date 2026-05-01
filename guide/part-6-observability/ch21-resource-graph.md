# Capítulo 21 — Azure Resource Graph

> Last verified: 2026-04-06

---

## Visão Geral

**Azure Resource Graph** é um mecanismo de consulta que permite explorar seus recursos do Azure em escala — entre assinaturas e management groups — com resultados quase instantâneos. Diferente da lista de recursos do Portal Azure (que consulta cada resource provider individualmente), o Resource Graph mantém um cache pré-indexado de metadados de recursos, permitindo que consultas complexas retornem em segundos.

Para equipes de governança, o Resource Graph é indispensável:

- **Gestão de inventário** — saber exatamente o que está implantado em todas as assinaturas
- **Conformidade de tags** — encontrar recursos que não atendem aos padrões de tags
- **Detecção de órfãos** — identificar recursos não utilizados que consomem orçamento
- **Conformidade de políticas** — consultar o estado de políticas em toda a organização
- **Auditoria de RBAC** — explorar atribuições de função entre escopos
- **Postura de segurança** — encontrar recursos mal configurados antes que atacantes o façam

O Resource Graph usa a **Kusto Query Language (KQL)** — a mesma linguagem utilizada pelo Log Analytics, Microsoft Sentinel e Azure Data Explorer.

---

## Como Funciona

### Arquitetura

O Resource Graph indexa dados do Azure Resource Manager (ARM) e de vários resource providers. Quando você submete uma consulta, ela é executada contra esse índice pré-construído em vez de chamar resource providers individuais:

![Resource Graph Query Engine](/images/resource-graph-engine.svg)

### Tabelas do Resource Graph

| Tabela | Conteúdo |
|--------|----------|
| `Resources` | Todos os recursos do Azure (VMs, storage, networking, etc.) |
| `ResourceContainers` | Assinaturas, grupos de recursos, management groups |
| `AdvisorResources` | Recomendações do Azure Advisor |
| `AlertsManagementResources` | Instâncias de alerta do Azure Monitor |
| `ExtendedLocationResources` | Recursos habilitados para Azure Arc |
| `GuestConfigurationResources` | Atribuições de configuração de convidado (machine configuration) |
| `HealthResources` | Status de saúde dos recursos |
| `IoTSecurityResources` | Recomendações de segurança IoT |
| `KubernetesConfigurationResources` | Configurações de Kubernetes habilitado para Azure Arc |
| `PatchAssessmentResources` | Resultados de avaliação de patches do SO |
| `PolicyResources` | Estado de conformidade do Azure Policy |
| `SecurityResources` | Dados do Microsoft Defender for Cloud |
| `ServiceHealthResources` | Eventos de saúde de serviço do Azure |

### Resource Graph Explorer

O **Resource Graph Explorer** é a interface de consulta integrada do Portal Azure. Acesse em: **Portal → Azure Resource Graph Explorer** ou navegue para `portal.azure.com/#view/HubsExtension/ArgQueryBlade`.

Recursos:
- Editor KQL interativo com IntelliSense
- Navegador de schema para todas as tabelas e colunas disponíveis
- Salvar e compartilhar consultas
- Exportar resultados para CSV
- Fixar resultados em dashboards
- Limitar consultas a assinaturas ou management groups específicos

### Acesso Programático

#### Azure CLI

```bash
# Run a Resource Graph query
az graph query -q "Resources | summarize count() by type | order by count_ desc | take 10"

# Query with subscription scope
az graph query -q "Resources | where tags.Environment == 'production'" \
  --subscriptions "sub-id-1" "sub-id-2"

# Output as table
az graph query -q "Resources | where type == 'microsoft.compute/virtualmachines'" --output table
```

#### Azure PowerShell

```powershell
# Install the module (if not already installed)
Install-Module -Name Az.ResourceGraph

# Run a query
Search-AzGraph -Query "Resources | summarize count() by type | order by count_ desc | take 10"

# Query across all management group subscriptions
Search-AzGraph -Query "Resources | where tags.Environment == 'production'" -ManagementGroup "mg-root"
```

#### REST API

```bash
# POST to the Resource Graph API
az rest --method post \
  --uri "https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01" \
  --body '{
    "query": "Resources | summarize count() by type | order by count_ desc | take 10",
    "subscriptions": ["subscription-id-1"]
  }'
```

---

## Top 20 Consultas de Governança

*Para a referência completa de consultas com explicações detalhadas, veja o [Apêndice D — Top 20 Consultas de Governança com Resource Graph](../appendices/appendix-d-resource-graph-queries.md).*

### 1. Encontrar Todos os Recursos Sem Tags

```kql
Resources
| where isnull(tags) or tags == "{}"
| project name, type, resourceGroup, subscriptionId, location
| order by type asc
```

### 2. Listar Recursos Não Conformes

```kql
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| project
    resourceId = tostring(properties.resourceId),
    policyDefinitionName = tostring(properties.policyDefinitionName),
    policyAssignmentName = tostring(properties.policyAssignmentName),
    complianceState = tostring(properties.complianceState)
| order by policyDefinitionName asc
```

### 3. Inventário de Recursos por Região

```kql
Resources
| summarize ResourceCount = count() by location
| order by ResourceCount desc
```

### 4. Encontrar Recursos Órfãos (Discos Não Anexados)

```kql
Resources
| where type == "microsoft.compute/disks"
| where properties.diskState == "Unattached"
| project name, resourceGroup, subscriptionId, location,
    diskSizeGB = tostring(properties.diskSizeGB),
    sku = tostring(sku.name)
| order by diskSizeGB desc
```

### 5. Consultar Atribuições de RBAC Entre Assinaturas

```kql
AuthorizationResources
| where type == "microsoft.authorization/roleassignments"
| extend
    principalId = tostring(properties.principalId),
    roleDefinitionId = tostring(properties.roleDefinitionId),
    scope = tostring(properties.scope),
    principalType = tostring(properties.principalType)
| project principalId, roleDefinitionId, scope, principalType
| order by scope asc
```

### 6. Contagem de Recursos por Tipo

```kql
Resources
| summarize Count = count() by type
| order by Count desc
| take 20
```

### 7. Encontrar Recursos por Valor de Tag

```kql
Resources
| where tags.Environment == "production"
| project name, type, resourceGroup, subscriptionId, location
| order by type asc
```

### 8. Listar VMs por Tamanho/SKU

```kql
Resources
| where type == "microsoft.compute/virtualmachines"
| project
    name,
    resourceGroup,
    location,
    vmSize = tostring(properties.hardwareProfile.vmSize),
    osType = tostring(properties.storageProfile.osDisk.osType),
    powerState = tostring(properties.extended.instanceView.powerState.displayStatus)
| order by vmSize asc
```

### 9. Encontrar Recursos Sem Locks

```kql
resources
| project id, name, type, resourceGroup, subscriptionId
| join kind=leftanti (
    resources
    | where type =~ 'microsoft.authorization/locks'
    | extend lockScope = tolower(substring(id, 0, indexof(id, '/providers/Microsoft.Authorization/locks/')))
    | project lockScope
) on $left.id == $right.lockScope
| where type !in~ ('microsoft.authorization/locks', 'microsoft.authorization/roleassignments')
| project name, type, resourceGroup, subscriptionId
| take 100
```

### 10. Consultar Estado de Conformidade de Política

```kql
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| extend
    complianceState = tostring(properties.complianceState),
    policyDefinitionName = tostring(properties.policyDefinitionName)
| summarize
    Compliant = countif(complianceState == "Compliant"),
    NonCompliant = countif(complianceState == "NonCompliant"),
    Exempt = countif(complianceState == "Exempt")
    by policyDefinitionName
| order by NonCompliant desc
```

### 11. Encontrar IPs Públicos Não Anexados a Nenhum Recurso

```kql
Resources
| where type == "microsoft.network/publicipaddresses"
| where isnull(properties.ipConfiguration) and isnull(properties.natGateway)
| project name, resourceGroup, subscriptionId, location,
    ipAddress = tostring(properties.ipAddress),
    sku = tostring(sku.name)
```

### 12. Listar Network Security Groups com Regras de Entrada "Allow All"

```kql
Resources
| where type == "microsoft.network/networksecuritygroups"
| mv-expand rule = properties.securityRules
| where tostring(rule.properties.direction) == "Inbound"
    and tostring(rule.properties.access) == "Allow"
    and tostring(rule.properties.sourceAddressPrefix) == "*"
    and tostring(rule.properties.destinationPortRange) == "*"
| project name, resourceGroup, subscriptionId, ruleName = tostring(rule.name)
```

### 13. Encontrar Storage Accounts Permitindo Acesso Público a Blobs

```kql
Resources
| where type == "microsoft.storage/storageaccounts"
| where properties.allowBlobPublicAccess == true
| project name, resourceGroup, subscriptionId, location
```

### 14. Listar Assinaturas em Cada Management Group

```kql
ResourceContainers
| where type == "microsoft.resources/subscriptions"
| extend mgParent = tostring(properties.managementGroupAncestorsChain[0].displayName)
| project subscriptionId, name, mgParent, state = tostring(properties.state)
| order by mgParent asc
```

### 15. Encontrar Recursos Sem uma Tag Obrigatória Específica

```kql
Resources
| where isnull(tags.CostCenter) or isempty(tags.CostCenter)
| summarize Count = count() by type
| order by Count desc
```

### 16. Identificar Interfaces de Rede Não Utilizadas

```kql
Resources
| where type == "microsoft.network/networkinterfaces"
| where isnull(properties.virtualMachine)
| project name, resourceGroup, subscriptionId, location
```

### 17. Listar Key Vaults Sem Soft Delete Habilitado

```kql
Resources
| where type == "microsoft.keyvault/vaults"
| where properties.enableSoftDelete != true
| project name, resourceGroup, subscriptionId, location
```

### 18. Encontrar SQL Databases Sem Transparent Data Encryption

Transparent Data Encryption (TDE) é exposto como um recurso filho (`microsoft.sql/servers/databases/transparentdataencryption`), não como uma propriedade inline no recurso de banco de dados.

```kql
resources
| where type =~ 'microsoft.sql/servers/databases/transparentdataencryption'
| where properties.state =~ 'disabled'
| project databaseId = tolower(substring(id, 0, indexof(id, '/transparentDataEncryption'))), state = properties.state
```

### 19. Contagem de Recursos por Assinatura

```kql
Resources
| summarize Count = count() by subscriptionId
| join kind=inner (
    ResourceContainers
    | where type == "microsoft.resources/subscriptions"
    | project subscriptionId, subscriptionName = name
) on subscriptionId
| project subscriptionName, Count
| order by Count desc
```

### 20. Resumo de Conformidade de Tags (Percentual de Recursos com Tags)

```kql
Resources
| extend hasRequiredTags = isnotnull(tags.CostCenter) and isnotnull(tags.Environment)
| summarize
    Total = count(),
    Tagged = countif(hasRequiredTags),
    Untagged = countif(not(hasRequiredTags))
| extend CompliancePercent = round(100.0 * Tagged / Total, 1)
```

---

## Integração com Azure Workbooks

Consultas do Resource Graph podem ser incorporadas diretamente em **Azure Workbooks** para criar dashboards de governança:

```json
{
  "type": "Resource Graph",
  "query": "Resources | summarize count() by type | order by count_ desc | take 10",
  "visualization": "barchart"
}
```

Padrões comuns de Workbook:

- **Consultas orientadas por parâmetros** — permitir que usuários selecionem um escopo de assinatura ou management group
- **Visões combinadas** — mostrar dados do Resource Graph junto com dados do Log Analytics
- **Drilldowns** — clicar em uma barra no gráfico para ver os recursos detalhados
- **Atualização programada** — Workbooks atualizam ao visualizar; fixe em dashboards para atualizações agendadas

---

## Melhores Práticas

1. **Use Resource Graph para inventário, não monitoramento** — ele mostra o estado atual, não tendências históricas (use Log Analytics para histórico)
2. **Limite o escopo das consultas adequadamente** — evite varrer todas as assinaturas a menos que necessário; limite a management groups ou assinaturas específicas
3. **Salve e compartilhe consultas** — use o recurso de salvamento do Resource Graph Explorer para construir uma biblioteca de consultas da equipe
4. **Combine com Workbooks** — incorpore consultas do Resource Graph em Workbooks de governança para dashboards executivos
5. **Automatize com CLI/PowerShell** — agende consultas de governança como parte de CI/CD ou cron jobs
6. **Use `join` para enriquecimento** — faça join da tabela `Resources` com `PolicyResources`, `AuthorizationResources` e `ResourceContainers` para resultados mais ricos
7. **Monitore recursos órfãos regularmente** — execute consultas de detecção de órfãos semanalmente e reporte achados aos proprietários de recursos
8. **Exporte conjuntos grandes de resultados** — para datasets que excedem os limites do portal, use a CLI com `--first 1000` ou pagine via REST API
9. **Fixe consultas em dashboards** — compartilhe métricas de governança com a liderança via dashboards do Portal Azure
10. **Use `mv-expand` para arrays** — muitas propriedades de recursos são arrays (ex.: regras de NSG, tags); use `mv-expand` para achatar e analisar

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Assumir dados em tempo real | Resource Graph tem indexação quase em tempo real (segundos a minutos de atraso) | Não use para monitoramento em tempo real; use alertas do Activity Log em vez disso |
| Não limitar escopo de consultas | Consultas lentas; recuperação desnecessária de dados | Sempre limite a assinaturas ou management groups relevantes |
| Ignorar paginação | Resultados truncados em 1.000 linhas | Use `$skipToken` para REST API ou `--first` e `--skip` para CLI |
| Joins complexos sem filtros | Timeouts ou throttling | Filtre cada lado do join antes de fazer o join |
| Não aproveitar a tabela `PolicyResources` | Escrever consultas customizadas para dados que já estão no estado de Policy | Consulte `PolicyResources` diretamente para dados de conformidade |
| Hardcoding de IDs de assinatura | Consultas quebram quando assinaturas mudam | Use escopo de management group ou listas dinâmicas de assinaturas |

---

## Referências

- [Azure Resource Graph overview](https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview)
- [Resource Graph query language (KQL)](https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/query-language)
- [Resource Graph tables and resource types](https://learn.microsoft.com/en-us/azure/governance/resource-graph/reference/supported-tables-resources)
- [Starter queries](https://learn.microsoft.com/en-us/azure/governance/resource-graph/samples/starter)
- [Advanced queries](https://learn.microsoft.com/en-us/azure/governance/resource-graph/samples/advanced)
- [Azure Resource Graph Explorer](https://learn.microsoft.com/en-us/azure/governance/resource-graph/first-query-portal)
- [az graph CLI reference](https://learn.microsoft.com/en-us/cli/azure/graph)
- [Search-AzGraph PowerShell reference](https://learn.microsoft.com/en-us/powershell/module/az.resourcegraph/search-azgraph)
- [Azure Workbooks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview)

---

| Anterior | Próximo |
|:---------|:--------|
| [Azure Monitor](ch20-azure-monitor.md) | [AzGovViz](ch22-azgovviz.md) |
