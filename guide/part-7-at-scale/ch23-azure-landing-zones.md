# Capítulo 23 — Azure Landing Zones

> Last verified: 2026-04-06

---

## Visão Geral

Uma **Azure Landing Zone (ALZ)** é um ambiente Azure pré-configurado que segue as melhores práticas do Cloud Adoption Framework (CAF) para segurança, governança, rede e identidade. Pense nela como um "blueprint" (conceitualmente — não o serviço Azure Blueprints descontinuado) de como seu ambiente Azure deve ser organizado antes que as cargas de trabalho sejam implantadas.

As landing zones respondem a uma pergunta fundamental: *Como meu ambiente Azure deve ser estruturado para que cada equipe possa implantar cargas de trabalho de forma segura, em conformidade e em escala — sem reinventar a roda a cada vez?*

A arquitetura conceitual da ALZ fornece:

- Uma **hierarquia de management groups** que reflete as responsabilidades organizacionais
- **Isolamento no nível de subscription** entre serviços de plataforma e cargas de trabalho
- **Rede centralizada** com topologias hub-and-spoke ou Virtual WAN
- **Políticas de baseline** para segurança, conformidade e governança de custos
- **Logging e monitoramento centralizados** por meio de uma subscription de gerenciamento
- **Integração de identidade** com Microsoft Entra ID

![Azure Landing Zone Hierarchy](/images/alz-hierarchy-tree.svg)

---

## Como Funciona

### Áreas de Design da ALZ

A arquitetura da ALZ é organizada em torno de oito áreas de design, cada uma abordando um aspecto crítico da adoção corporativa de nuvem:

#### 1. Faturamento e Tenants do Microsoft Entra ID

- Alinhe as subscriptions Azure com seu Enterprise Agreement (EA) ou Microsoft Customer Agreement (MCA)
- Estabeleça a relação entre o tenant do Microsoft Entra ID e as subscriptions Azure
- Decida entre estratégias single-tenant vs. multi-tenant

#### 2. Gerenciamento de Identidade e Acesso

- Centralize a identidade com o Microsoft Entra ID
- Habilite o Privileged Identity Management (PIM) para acesso just-in-time
- Federe o Active Directory on-premises com o Microsoft Entra ID via Microsoft Entra Connect
- Implemente políticas de Conditional Access para administradores da plataforma
- Use federação de identidade de carga de trabalho para pipelines CI/CD

#### 3. Organização de Management Groups e Subscriptions

O CAF recomenda uma hierarquia específica de management groups:

| Management Group | Finalidade |
|---|---|
| **Tenant Root Group** | Topo da hierarquia; evite atribuir políticas diretamente aqui |
| **Organização (Nível Superior)** | Representa a organização; aplique políticas amplas aqui |
| **Platform** | Contém subscriptions para serviços compartilhados de plataforma |
| **Platform → Management** | Logging centralizado, monitoramento e automação |
| **Platform → Connectivity** | Rede hub, DNS, firewall, ExpressRoute/VPN |
| **Platform → Identity** | Controladores de domínio, serviços de identidade |
| **Landing Zones** | Contém subscriptions de carga de trabalho |
| **Landing Zones → Corp** | Cargas de trabalho que requerem conectividade de rede corporativa |
| **Landing Zones → Online** | Cargas de trabalho voltadas para internet sem requisito de rede corporativa |
| **Decommissioned** | Subscriptions sendo desativadas |
| **Sandbox** | Subscriptions para experimentação (sem conectividade com produção) |

#### 4. Topologia de Rede e Conectividade

Escolha entre duas topologias principais:

- **Hub-and-Spoke**: Uma rede virtual hub central conectada a VNets spoke via peering. Melhor para organizações com complexidade de rede moderada.
- **Virtual WAN**: Um serviço de rede gerenciado pela Microsoft para conectividade de filiais em grande escala e global. Melhor para organizações com muitas filiais ou presença global.

#### 5. Segurança

- Habilite o Microsoft Defender for Cloud em todas as subscriptions
- Aplique o Microsoft Cloud Security Benchmark (MCSB)
- Centralize o logging de segurança na subscription de gerenciamento
- Implemente segurança de rede com Azure Firewall ou NVAs de terceiros

#### 6. Governança

- Atribua Azure Policy no nível apropriado de management group
- Aplique tagging, regiões permitidas e tipos de recursos permitidos
- Use governança orientada por políticas (DeployIfNotExists) para remediação automática
- Implemente resource locks em infraestrutura crítica

#### 7. Gerenciamento e Monitoramento

- Implante Azure Monitor, Log Analytics e alertas do Azure Monitor de forma centralizada
- Configure diagnostic settings para enviar logs ao workspace central
- Use workbooks do Azure Monitor para dashboards de governança
- Habilite o Update Manager para conformidade de patches

#### 8. Automação de Plataforma e DevOps

- Gerencie infraestrutura como código (Bicep ou Terraform)
- Implemente pipelines CI/CD para implantação de políticas e infraestrutura
- Use Policy as Code (EPAC ou Azure DevOps/GitHub Actions)
- Automatize o provisionamento de subscriptions por meio de subscription vending

### ALZ Accelerator

O **ALZ Accelerator** é a abordagem de implantação recomendada atualmente para Azure Landing Zones. Ele substitui a terminologia mais antiga "Enterprise-Scale" e fornece uma experiência de implantação guiada baseada em portal.

O ALZ Accelerator:

- Guia você por cada área de design via um assistente passo a passo
- Implanta a hierarquia de management groups, políticas e subscriptions de plataforma
- Configura a rede (Hub-and-Spoke ou Virtual WAN)
- Configura logging e monitoramento centralizados
- Aplica atribuições de Azure Policy de baseline
- Gera o IaC (Bicep) para tudo que implanta, para que você possa gerenciar dali em diante

**Como acessá-lo:**

1. Navegue até a [experiência do portal ALZ Accelerator](https://aka.ms/caf/ready/accelerator)
2. Siga o assistente guiado
3. Revise e implante

> **Dica:** Mesmo que você planeje customizar bastante, começar com o ALZ Accelerator oferece uma base sólida. Você sempre pode modificar os templates Bicep gerados posteriormente.

### Subscription Vending

**Subscription vending** é a prática de automatizar a criação e configuração de novas subscriptions Azure. Em vez de criar subscriptions manualmente e configurá-las, as equipes solicitam subscriptions por meio de um processo automatizado que:

1. Cria a subscription sob o management group correto
2. Aplica políticas de baseline e atribuições RBAC
3. Configura a rede (VNet peering para o hub, DNS)
4. Configura diagnostic settings e monitoramento
5. Aplica tags obrigatórias e alertas de orçamento

Subscription vending pode ser implementado usando:

- **Módulos Bicep/Terraform** — O módulo Terraform da ALZ inclui um módulo de subscription vending integrado
- **Pipelines Azure DevOps ou GitHub Actions** — Acionados por uma solicitação de catálogo de serviços
- **O módulo Bicep de Subscription Vending** — Disponível no registro Azure Verified Modules

```bicep
// Example: Subscription vending with Bicep (simplified)
targetScope = 'managementGroup'

module subVend 'br/public:avm/ptn/subscription-vending:0.1.0' = {
  name: 'sub-vend-${workloadName}'
  params: {
    subscriptionAliasName: workloadName
    subscriptionDisplayName: '${workloadName}-${environment}'
    subscriptionBillingScope: billingScope
    subscriptionManagementGroupId: targetManagementGroupId
    subscriptionTags: {
      Environment: environment
      CostCenter: costCenter
      Owner: ownerEmail
    }
    virtualNetworkEnabled: true
    virtualNetworkAddressSpace: ['10.1.0.0/16']
    virtualNetworkResourceGroupName: 'rg-networking'
    virtualNetworkPeeringEnabled: true
    hubNetworkResourceId: hubVnetResourceId
  }
}
```

### Implementações de Referência

As implementações de referência da ALZ estão disponíveis no GitHub e fornecem arquiteturas completas e implantáveis:

| Implementação de Referência | Descrição | Quando Usar |
|---|---|---|
| **ALZ Foundation** (Wingtip) | Management groups, políticas e governança — sem rede | Você gerencia a rede separadamente ou está apenas começando |
| **ALZ Hub-and-Spoke** (AdventureWorks) | ALZ completa com topologia de rede hub-and-spoke | Escolha mais comum para empresas |
| **ALZ Virtual WAN** (Contoso) | ALZ completa com rede Azure Virtual WAN | Organizações globais com muitas filiais |

Todas as três implementações estão disponíveis em [github.com/Azure/Enterprise-Scale](https://github.com/Azure/Enterprise-Scale) e podem ser implantadas via portal do ALZ Accelerator ou diretamente do repositório.

### Hub-and-Spoke vs. Virtual WAN

| Consideração | Hub-and-Spoke | Virtual WAN |
|---|---|---|
| **Complexidade** | Você gerencia a VNet hub, peering e roteamento | Microsoft gerencia a infraestrutura do hub |
| **Conectividade de filiais** | Configuração manual de VPN/ExpressRoute | Automatizada branch-to-branch e branch-to-Azure |
| **Trânsito global** | Requer configuração manual | Roteamento de trânsito global integrado |
| **Custo** | Custo base menor; pague pelo que implanta | Custo base maior; inclui roteamento gerenciado |
| **Customização** | Controle total sobre NVAs do hub, tabelas de roteamento | Customização limitada do hub gerenciado |
| **Melhor para** | Região única, quantidade moderada de filiais | Multi-região, muitas filiais, integração SD-WAN |

**Orientação para decisão:**

- Escolha **Hub-and-Spoke** se você tem uma única região Azure, menos de 10 filiais e deseja controle total sobre o design de rede.
- Escolha **Virtual WAN** se você opera em múltiplas regiões Azure, tem muitas filiais ou precisa de conectividade SD-WAN integrada.

---

## Melhores Práticas

1. **Comece com o ALZ Accelerator** — Mesmo que sua organização tenha requisitos únicos, o Accelerator fornece um ponto de partida validado. Customize depois em vez de construir do zero.

2. **Mantenha a hierarquia de management groups rasa** — O CAF recomenda no máximo seis níveis de profundidade. A maioria das organizações precisa de apenas três a quatro níveis.

3. **Atribua políticas no nível correto** — Aplique políticas amplas (ex.: regiões permitidas, tags obrigatórias) no management group de nível superior. Aplique políticas específicas de carga de trabalho no nível do management group da landing zone.

4. **Use subscription vending** — Criação manual de subscriptions não escala. Automatize o provisionamento de subscriptions cedo, mesmo que você tenha apenas algumas subscriptions hoje.

5. **Separe subscriptions de plataforma e de carga de trabalho** — Nunca misture serviços de plataforma (rede, identidade, gerenciamento) com cargas de trabalho de aplicações na mesma subscription.

6. **Trate a landing zone como código** — Armazene toda a configuração da ALZ (management groups, políticas, RBAC, rede) em um repositório Git. Use pipelines CI/CD para alterações.

7. **Planeje para o crescimento** — Projete seu espaço de endereços IP, estrutura de management groups e atribuições de políticas pensando na escala futura. Refatorar é muito mais difícil do que planejar antecipadamente.

8. **Não pule a subscription de Identity** — Mesmo que você não tenha controladores de domínio on-premises hoje, ter uma subscription de identidade dedicada facilita adicioná-los posteriormente.

---

## Armadilhas Comuns

| Armadilha | Por Que Acontece | Como Evitar |
|---|---|---|
| Implantar cargas de trabalho antes da landing zone estar pronta | Pressão para entregar rapidamente | Estabeleça uma landing zone mínima viável primeiro, depois itere |
| Customizar excessivamente a hierarquia de management groups | Tentar espelhar o organograma exatamente | Siga a hierarquia recomendada pelo CAF; ela mapeia funções, não departamentos |
| Atribuir políticas no Tenant Root Group | Querer cobertura universal | Use o management group de organização de nível superior; alterações no Tenant Root Group afetam todos os management groups futuros |
| Ignorar limites de subscription | Não planejar para escala | Monitore cotas no nível de subscription; use subscription vending para distribuir cargas de trabalho |
| Tratar a ALZ como implantação única | Mentalidade "configure e esqueça" | A landing zone evolui com sua organização; planeje manutenção contínua |
| Não envolver equipes de rede e segurança cedo | Tratar ALZ como uma preocupação puramente de infraestrutura | ALZ abrange identidade, rede, segurança e governança — todas as equipes devem estar envolvidas |

---

## Exemplos de Código

### Implantando ALZ com Bicep (Hierarquia de Management Groups)

```bicep
targetScope = 'tenant'

@description('Top-level management group name')
param topLevelMgName string = 'Contoso'

// Top-level management group
resource topLevelMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: topLevelMgName
  properties: {
    displayName: topLevelMgName
  }
}

// Platform management group
resource platformMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: '${topLevelMgName}-Platform'
  properties: {
    displayName: 'Platform'
    details: {
      parent: {
        id: topLevelMg.id
      }
    }
  }
}

// Landing Zones management group
resource landingZonesMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: '${topLevelMgName}-LandingZones'
  properties: {
    displayName: 'Landing Zones'
    details: {
      parent: {
        id: topLevelMg.id
      }
    }
  }
}

// Child management groups under Platform
var platformChildren = ['Management', 'Connectivity', 'Identity']
resource platformChildMgs 'Microsoft.Management/managementGroups@2023-04-01' = [
  for child in platformChildren: {
    name: '${topLevelMgName}-Platform-${child}'
    properties: {
      displayName: child
      details: {
        parent: {
          id: platformMg.id
        }
      }
    }
  }
]

// Child management groups under Landing Zones
var lzChildren = ['Corp', 'Online']
resource lzChildMgs 'Microsoft.Management/managementGroups@2023-04-01' = [
  for child in lzChildren: {
    name: '${topLevelMgName}-LandingZones-${child}'
    properties: {
      displayName: child
      details: {
        parent: {
          id: landingZonesMg.id
        }
      }
    }
  }
]
```

### Consultando a Estrutura da Landing Zone com Azure Resource Graph

```kusto
// List all management groups and their parents
resourcecontainers
| where type == "microsoft.management/managementgroups"
| extend parentId = properties.details.parent.id
| project name, displayName=properties.displayName, parentId
| order by name asc
```

---

## Referências

- [What is an Azure Landing Zone?](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/)
- [ALZ Design Areas](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas)
- [ALZ Accelerator](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/landing-zone-deploy)
- [Management Group and Subscription Organization](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org)
- [Network Topology and Connectivity](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/network-topology-and-connectivity)
- [Hub-and-Spoke Network Topology](https://learn.microsoft.com/azure/architecture/networking/architecture/hub-spoke)
- [Azure Virtual WAN](https://learn.microsoft.com/azure/virtual-wan/virtual-wan-about)
- [Subscription Vending](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending)
- [ALZ Reference Implementations (GitHub)](https://github.com/Azure/Enterprise-Scale)
- [Azure Verified Modules — Subscription Vending](https://learn.microsoft.com/azure/architecture/landing-zones/subscription-vending)

---

| Anterior | Próximo |
|:---|:---|
| [Capítulo 22 — AzGovViz](../part-6-observability/ch22-azgovviz.md) | [Capítulo 24 — Azure Arc](ch24-azure-arc.md) |
