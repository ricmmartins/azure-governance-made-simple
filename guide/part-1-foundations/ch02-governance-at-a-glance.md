# Capítulo 2 — Governança em Uma Visão Geral: O Panorama Completo

> **Last verified: 2026-04-06**

---

## Visão Geral

O Azure oferece um rico conjunto de **capacidades de governança nativas** — ferramentas e serviços integrados à plataforma, que não requerem compras adicionais e estão disponíveis no momento em que você cria sua primeira assinatura. Entender como essas capacidades se encaixam é o primeiro passo para construir um framework de governança que escale com sua organização.

Este capítulo fornece um mapa abrangente de cada capacidade de governança do Azure, explica como elas se interconectam em diferentes níveis de escopo e mostra como pensar nelas como um sistema unificado em vez de uma coleção de recursos isolados.

---

## Arquitetura: O Mapa de Capacidades de Governança

O diagrama a seguir mostra todas as principais capacidades de governança do Azure organizadas pelo escopo em que operam:

![Mapa de Capacidades de Governança do Azure](/images/governance-capability-map.svg)

---

## Como Funciona: O Inventário Completo de Capacidades

Cada capacidade de governança listada abaixo é nativa do Azure. Elas estão agrupadas por função, não por nome de produto do Azure, para deixar claro como servem aos objetivos de governança.

### Identidade e Acesso

| Capacidade | O Que Faz | Escopo |
|---|---|---|
| **Microsoft Entra ID** | Plataforma de identidade em nuvem — gerencia usuários, grupos, service principals e managed identities. A âncora de confiança para todas as assinaturas do Azure. | Tenant |
| **Role-Based Access Control (RBAC)** | Atribui permissões (funções) a identidades no escopo de management group, assinatura, resource group ou recurso. Suporta mais de 500 funções internas e funções personalizadas. | Management Group → Recurso |
| **Privileged Identity Management (PIM)** | Fornece ativação just-in-time, com prazo determinado e baseada em aprovação para funções privilegiadas. | Tenant / Assinatura |
| **Conditional Access** | Aplica políticas de acesso baseadas em sinais como localização do usuário, conformidade do dispositivo ou nível de risco. | Tenant |
| **Access Reviews** | Revisa e certifica periodicamente o acesso para garantir que não haja acúmulo de privilégios. | Tenant |

### Política e Conformidade

| Capacidade | O Que Faz | Escopo |
|---|---|---|
| **Azure Policy** | Avalia recursos contra regras de política. Pode **negar** implantações não conformes, **auditar** recursos existentes, **modificar** propriedades de recursos ou **implantar** configurações ausentes. | Management Group → Recurso |
| **Azure Machine Configuration** | Estende o Azure Policy dentro de VMs e servidores habilitados para Arc. Audita e aplica configuração em nível de SO (anteriormente "Guest Configuration"). | Recurso (VMs) |
| **Microsoft Defender for Cloud** | Fornece gerenciamento de postura de segurança, avaliação de vulnerabilidades, detecção de ameaças e dashboards de conformidade regulatória. | Assinatura → Recurso |
| **Resource Locks** | Previne exclusão ou modificação acidental de recursos críticos. Dois modos: `CanNotDelete` e `ReadOnly`. | Assinatura → Recurso |

### Organização de Recursos

| Capacidade | O Que Faz | Escopo |
|---|---|---|
| **Management Groups** | Contêineres hierárquicos acima das assinaturas. Até 6 níveis de profundidade. Usados para aplicar RBAC e Azure Policy em escala. | Tenant (abaixo do MG raiz) |
| **Subscriptions** | Contêineres lógicos para recursos. Servem como limites de faturamento, limites de escala e limites de política. | Sob Management Groups |
| **Resource Groups** | Contêineres lógicos dentro de uma assinatura. Agrupam recursos por aplicação, ciclo de vida ou propósito de faturamento. | Assinatura |
| **Convenções de Nomenclatura** | Padrões padronizados para nomes de recursos que codificam tipo de recurso, carga de trabalho, ambiente e região. | Todos os escopos |
| **Tags** | Metadados de chave-valor aplicados a recursos e resource groups. Usados para alocação de custos, automação, operações e conformidade. | Resource Group / Recurso |

### Implantação e Infrastructure as Code

| Capacidade | O Que Faz | Escopo |
|---|---|---|
| **Bicep (Infrastructure as Code)** | Linguagem declarativa de infrastructure-as-code para definir e implantar recursos do Azure de forma repetível. | Todos os escopos |
| **Deployment Stacks** | Gerencia uma coleção de recursos como uma unidade única. Previne alterações não autorizadas e suporta configurações de negação para recursos gerenciados. | Management Group → Resource Group |
| **Terraform (provedor AzureRM)** | Ferramenta de IaC multi-cloud da HashiCorp. Amplamente usada para implantações no Azure com gerenciamento de estado. | Todos os escopos |

### Gerenciamento de Custos

| Capacidade | O Que Faz | Escopo |
|---|---|---|
| **Azure Cost Management** | Analisa custos, cria orçamentos, define alertas, exporta dados de faturamento e fornece recomendações de otimização. | Management Group → Resource Group |
| **Azure Reservations / Savings Plans** | Preços pré-comprometidos que reduzem custos para cargas de trabalho previsíveis. | Escopo de faturamento |

### Observabilidade e Visibilidade

| Capacidade | O Que Faz | Escopo |
|---|---|---|
| **Azure Monitor** | Coleta e analisa métricas, logs e traces dos recursos do Azure. Fornece alertas, dashboards e workbooks. | Recurso → Workspace |
| **Azure Resource Graph** | Um motor de consulta Big Data que permite explorar seu ambiente Azure em escala usando Kusto Query Language (KQL). Retorna resultados em segundos em milhares de assinaturas. | Tenant |
| **Azure Governance Visualizer** | Uma ferramenta comunitária de código aberto (também conhecida como "AzGovViz") que produz relatórios HTML/Markdown visualizando management groups, políticas, RBAC e mais. | Tenant |

> **Nota sobre Azure Blueprints:** O Azure Blueprints está descontinuado (aposentadoria: julho de 2026). As organizações devem usar **Deployment Stacks**, **Bicep** ou **Terraform** para implantação repetível de ambientes. Veja o [aviso de descontinuação do Azure Blueprints](https://learn.microsoft.com/azure/governance/blueprints/overview) para orientação de migração.

---

## Como as Capacidades se Interconectam

As capacidades de governança não operam isoladamente. Veja como elas se conectam entre os níveis de escopo:

### A Herança Flui para Baixo

Quando você atribui uma Azure Policy em um management group, cada assinatura, resource group e recurso abaixo desse management group herda a política. O mesmo se aplica às atribuições de função RBAC. Esse modelo de herança é o motor que torna a governança escalável:

![Fluxo de Herança de Policy e RBAC](/images/governance-inheritance-flow.svg)

### O Fluxo de Dados de Governança

1. **Microsoft Entra ID** autentica um usuário e fornece claims de identidade.
2. **RBAC** avalia se a identidade tem permissão para realizar a ação solicitada no escopo alvo.
3. **Azure Policy** avalia se a configuração do recurso está em conformidade com as políticas atribuídas.
4. **Azure Resource Manager** cria (ou nega) o recurso.
5. **Tags** são aplicadas ao recurso para alocação de custos e rastreamento operacional.
6. **Azure Cost Management** agrega dados de gastos por tag, assinatura e resource group.
7. **Azure Monitor** coleta telemetria operacional do recurso.
8. **Azure Resource Graph** indexa o recurso para consultas entre assinaturas.
9. **Microsoft Defender for Cloud** avalia a postura de segurança do recurso.

---

## Melhores Práticas

1. **Conheça o inventário completo.** Muitas organizações usam apenas uma fração das ferramentas de governança disponíveis. Revise o mapa de capacidades acima e identifique lacunas na sua implementação atual.
2. **Aplique controles em camadas por escopo.** Aplique políticas amplas e universais no management group raiz. Aplique políticas específicas de ambiente (ex.: regras mais rígidas para produção) em management groups filhos.
3. **Combine controles preventivos e detectivos.** Use efeitos `deny` do Azure Policy para prevenir configurações ruins e efeitos `audit` para detectar desvios em recursos existentes.
4. **Use o Azure Resource Graph para visibilidade.** Não dependa do Portal do Azure para entender seu ambiente em escala. Escreva consultas KQL para responder perguntas como "Quantas contas de armazenamento não possuem criptografia?"
5. **Automatize a implantação de governança.** Defina políticas, atribuições de função e estruturas de management group em Bicep ou Terraform. Implante-os por meio de pipelines de CI/CD.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | O Que Fazer em Vez Disso |
|---|---|---|
| Depender do Azure Blueprints para novos projetos | O Blueprints está descontinuado (julho 2026) | Migre para Deployment Stacks + Bicep ou Terraform |
| Atribuir políticas apenas no nível da assinatura | Novas assinaturas ficam sem governança até alguém lembrar de atribuir políticas | Atribua políticas fundamentais no nível do management group |
| Ignorar o Azure Resource Graph | As equipes não têm visibilidade sobre a proliferação de recursos | Construa uma biblioteca de consultas KQL para perguntas comuns de governança |
| Tratar tags como opcionais | Alocação de custos, automação e resposta a incidentes quebram sem etiquetagem consistente | Aplique tags obrigatórias via Azure Policy desde o primeiro dia |
| Não usar Managed Identities | Service principals com secrets criam risco de segurança e carga operacional | Prefira managed identities para autenticação Azure-para-Azure |

---

## Exemplos de Código

### Azure Resource Graph — Encontrar Recursos Sem Tags

```kusto
resources
| where isnull(tags) or tags == dynamic({})
| project name, type, resourceGroup, subscriptionId
| order by type asc
```

### Azure CLI — Listar Atribuições de Política em um Management Group

```bash
az policy assignment list \
  --scope "/providers/Microsoft.Management/managementGroups/my-root-mg" \
  --output table
```

### Bicep — Criar uma Hierarquia de Management Groups

```bicep
targetScope = 'tenant'

resource rootMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-contoso'
  properties: {
    displayName: 'Contoso Root'
  }
}

resource platformMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-platform'
  properties: {
    displayName: 'Platform'
    details: {
      parent: {
        id: rootMg.id
      }
    }
  }
}

resource landingZonesMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-landingzones'
  properties: {
    displayName: 'Landing Zones'
    details: {
      parent: {
        id: rootMg.id
      }
    }
  }
}
```

---

## Exercício Prático

**Cenário:** Você acabou de receber acesso ao ambiente Azure da sua organização. Sua tarefa é construir um inventário de governança.

1. **Abra o Azure Resource Graph Explorer** no Portal do Azure.
2. **Execute a seguinte consulta** para ver todas as atribuições de política no seu ambiente:
   ```kusto
   policyresources
   | where type == "microsoft.authorization/policyassignments"
   | project name, properties.displayName, properties.scope
   | order by name asc
   ```
3. **Identifique lacunas:** Existem management groups sem atribuições de política? Assinaturas sem orçamentos? Recursos sem tags?
4. **Crie uma lista de verificação de capacidades de governança** usando a tabela de inventário deste capítulo. Para cada capacidade, anote se está implementada, parcialmente implementada ou ainda não iniciada.

---

## Referências

| Recurso | Link |
|---|---|
| Visão geral de governança do Azure | [learn.microsoft.com/azure/governance/](https://learn.microsoft.com/azure/governance/) |
| Visão geral do Azure Policy | [learn.microsoft.com/azure/governance/policy/overview](https://learn.microsoft.com/azure/governance/policy/overview) |
| Visão geral de management groups | [learn.microsoft.com/azure/governance/management-groups/overview](https://learn.microsoft.com/azure/governance/management-groups/overview) |
| Visão geral do Azure Resource Graph | [learn.microsoft.com/azure/governance/resource-graph/overview](https://learn.microsoft.com/azure/governance/resource-graph/overview) |
| Visão geral do Azure RBAC | [learn.microsoft.com/azure/role-based-access-control/overview](https://learn.microsoft.com/azure/role-based-access-control/overview) |
| Microsoft Defender for Cloud | [learn.microsoft.com/azure/defender-for-cloud/](https://learn.microsoft.com/azure/defender-for-cloud/) |
| Azure Cost Management | [learn.microsoft.com/azure/cost-management-billing/](https://learn.microsoft.com/azure/cost-management-billing/) |
| Visão geral do Azure Monitor | [learn.microsoft.com/azure/azure-monitor/overview](https://learn.microsoft.com/azure/azure-monitor/overview) |
| Deployment Stacks | [learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks) |
| Azure Governance Visualizer (GitHub) | [github.com/Azure/Azure-Governance-Visualizer](https://github.com/Azure/Azure-Governance-Visualizer) |
| Descontinuação do Azure Blueprints | [learn.microsoft.com/azure/governance/blueprints/overview](https://learn.microsoft.com/azure/governance/blueprints/overview) |

---

| Anterior | Próximo |
|:---|:---|
| [Capítulo 1 — Por Que a Governança É Importante](ch01-why-governance-matters.md) | [Capítulo 3 — Modelo de Maturidade de Governança](ch03-governance-maturity-model.md) |
