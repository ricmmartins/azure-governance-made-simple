# Capítulo 4 — A Hierarquia de Recursos do Azure

> **Last verified: 2026-04-06**

---

## Visão Geral

Toda implantação no Azure — de uma única máquina virtual a uma plataforma empresarial multi-região — existe dentro de uma hierarquia de recursos bem definida. Entender essa hierarquia não é opcional; é a **base estrutural** sobre a qual todos os controles de governança são construídos.

A hierarquia tem quatro níveis:

![Hierarquia de Recursos do Azure](/images/resource-hierarchy-simple.svg)

**Controles de governança — atribuições de função RBAC, Azure Policy, orçamentos — são aplicados em qualquer nível e herdados para baixo.** Esse modelo de herança é o que torna a governança do Azure escalável. Uma política atribuída em um management group se aplica automaticamente a cada assinatura, resource group e recurso abaixo dele.

Este capítulo cobre cada nível em detalhe: o que é, como projetá-lo e as implicações de governança das suas decisões de design.

---

## Arquitetura

A hierarquia de recursos do Azure é uma estrutura em árvore com quatro níveis. Controles de governança aplicados em qualquer nível são herdados por todos os níveis filhos:

![Hierarquia de Recursos do Azure — Estrutura Detalhada de Landing Zone do CAF](/images/resource-hierarchy-detailed.svg)

Cada nível serve a um propósito distinto. As seções abaixo cobrem-nos em detalhe.

---

## 4.1 — Tenant do Microsoft Entra ID

### O Que É

O **tenant do Microsoft Entra ID** é a base de identidade do seu ambiente Azure. É o contêiner de nível superior para todas as identidades — usuários, grupos, service principals e managed identities — e a âncora de confiança para toda assinatura do Azure.

Quando você cria sua primeira assinatura do Azure, um tenant do Microsoft Entra ID é criado automaticamente. O tenant recebe um domínio padrão no formato `seunome.onmicrosoft.com`, que você pode personalizar para o domínio da sua organização (ex.: `contoso.com`).

> **Conceito-chave:** Um tenant não é apenas "uma representação do domínio da sua empresa." É o **limite de segurança** para gerenciamento de identidade e acesso. Tudo dentro do tenant compartilha um plano de identidade comum; tudo fora dele é um domínio de confiança separado.

### Componentes do Tenant

| Componente | Propósito |
|---|---|
| **Usuários** | Identidades humanas que se autenticam no Azure e em outros serviços Microsoft. |
| **Grupos** | Coleções de usuários (ou outros grupos) usados para simplificar atribuições RBAC. Prefira grupos a atribuições individuais de usuários. |
| **Service Principals** | Identidades para aplicações e automação. Criados quando você registra um app no Microsoft Entra ID. |
| **Managed Identities** | Service principals gerenciados pelo Azure que eliminam a necessidade de credenciais no código. Prefira-os para autenticação Azure-para-Azure. |
| **Enterprise Applications** | Aplicações SaaS de terceiros ou da Microsoft integradas via SAML, OIDC ou SCIM. |
| **Políticas de Conditional Access** | Regras que aplicam requisitos de acesso (MFA, dispositivo compatível, localização aprovada) com base em sinais. |

### Como Funciona

1. Um usuário se autentica no **Microsoft Entra ID** e recebe um token.
2. O token é apresentado ao **Azure Resource Manager** com uma solicitação (ex.: "criar uma VM").
3. O Azure Resource Manager verifica as **atribuições de função RBAC** do usuário no escopo alvo.
4. Se autorizado, o Azure Resource Manager avalia o **Azure Policy** para determinar se a configuração do recurso está em conformidade.
5. O recurso é criado (ou a solicitação é negada).

### Microsoft Entra ID vs. Active Directory Domain Services

Estes são serviços distintos. Entender a diferença previne erros arquiteturais custosos:

| Aspecto | Microsoft Entra ID | Active Directory Domain Services (AD DS) |
|---|---|---|
| **Propósito** | Gerenciamento de identidade e acesso em nuvem para Azure, Microsoft 365 e apps SaaS | Serviços de diretório on-premises, Group Policy, autenticação Kerberos/NTLM |
| **Protocolos** | OAuth 2.0, OpenID Connect, SAML | Kerberos, NTLM, LDAP |
| **Estrutura** | Plana (sem OUs ou GPOs) | Hierárquica (domínios, OUs, florestas) |
| **Escopo** | Nuvem e híbrido | On-premises |

Para cenários híbridos, use o **Microsoft Entra Connect** ou **Microsoft Entra Cloud Sync** para sincronizar identidades do AD DS on-premises para seu tenant do Microsoft Entra ID. Isso permite single sign-on entre recursos na nuvem e on-premises.

### Considerações Multi-Tenant

A maioria das organizações deve operar com um **único tenant do Microsoft Entra ID**. Múltiplos tenants introduzem complexidade:

- Identidades não podem ser compartilhadas entre tenants nativamente.
- Azure Policy e RBAC não abrangem tenants.
- O acesso a recursos entre tenants requer configuração explícita (ex.: Azure Lighthouse, configurações de acesso entre tenants).

Razões comuns para múltiplos tenants incluem fusões/aquisições, requisitos de isolamento regulatório ou limites separados de identidade entre desenvolvimento/produção. Se você precisar operar múltiplos tenants, use as **configurações de acesso entre tenants do Microsoft Entra External ID** para gerenciar relacionamentos de confiança.

### Melhores Práticas para Governança de Tenant

1. **Proteja o tenant com Conditional Access.** Exija MFA para todos os usuários, bloqueie autenticação legada e aplique conformidade de dispositivo para cargas de trabalho sensíveis.
2. **Habilite o Privileged Identity Management (PIM).** Elimine acesso privilegiado permanente. Todas as funções elevadas devem exigir ativação just-in-time com aprovação e limites de tempo.
3. **Conduza revisões de acesso.** Use as revisões de acesso do Microsoft Entra para certificar periodicamente que usuários e grupos ainda precisam de suas funções atribuídas.
4. **Use managed identities em todos os lugares.** Para recursos do Azure que precisam se autenticar em outros serviços do Azure, managed identities eliminam o gerenciamento de credenciais inteiramente.
5. **Proteja a função de Global Administrator.** Limite a 2–3 contas de emergência. Exija MFA. Monitore sign-ins com Entra ID Protection.

### Dicas Profissionais

- [Microsoft Entra ID Governance](https://learn.microsoft.com/entra/id-governance/identity-governance-overview)
- [Revisões de acesso do Microsoft Entra](https://learn.microsoft.com/entra/id-governance/access-reviews-overview)
- [Comparar Microsoft Entra ID e AD DS](https://learn.microsoft.com/entra/fundamentals/compare)

---

## 4.2 — Management Groups

### O Que São

**Management groups** são contêineres acima das assinaturas que permitem organizar assinaturas em uma hierarquia e aplicar controles de governança — RBAC, Azure Policy, orçamentos — em escala. O que você aplica em um management group é **herdado** por cada assinatura (e cada recurso) abaixo dele.

Management groups resolvem um problema crítico: sem eles, os controles de governança devem ser aplicados a cada assinatura individualmente. Em um ambiente com dezenas ou centenas de assinaturas, essa abordagem não escala e inevitavelmente leva a inconsistências.

### Como os Management Groups Funcionam

- Todo tenant do Microsoft Entra ID tem um **management group raiz** (criado automaticamente).
- Você pode criar até **6 níveis de profundidade** abaixo do management group raiz.
- Cada management group pode conter outros management groups ou assinaturas.
- Uma assinatura pode pertencer a apenas um management group de cada vez.
- Você pode mover assinaturas entre management groups sem interrupção.

### A Hierarquia de Management Groups Recomendada pelo CAF

O Cloud Adoption Framework recomenda a seguinte hierarquia como ponto de partida. Você pode adaptá-la às necessidades da sua organização, mas essa estrutura foi validada em milhares de implantações empresariais:

![Hierarquia de Management Groups Recomendada pelo CAF](/images/caf-mg-hierarchy.svg)

### Herança de Governança em Ação

![Herança de Governança em Ação](/images/governance-inheritance-action.svg)

Um benefício-chave: se um proprietário de assinatura tentar remover uma política ou atribuição de função herdada, **ele não consegue**. Controles herdados são imutáveis nos escopos filhos. Isso garante que os controles de segurança aplicados por uma equipe central (ex.: um SOC) permaneçam em vigor independentemente do que os proprietários de assinatura façam.

### Movendo Assinaturas

Se você inicialmente tomou decisões erradas sobre sua hierarquia — ou se uma aplicação passa de desenvolvimento para produção — você pode criar novos management groups e mover assinaturas sem tempo de inatividade. A assinatura herda as políticas e RBAC do seu novo management group pai.

### Melhores Práticas para Management Groups

1. **Mantenha a hierarquia rasa.** 2–3 níveis abaixo da raiz é suficiente para a maioria das organizações. Hierarquias profundas são mais difíceis de entender.
2. **Não atribua cargas de trabalho ao management group raiz.** A raiz deve conter apenas políticas que se aplicam universalmente (ex.: logging de auditoria, regiões permitidas).
3. **Use Sandbox para experimentação.** Dê aos desenvolvedores um espaço seguro com políticas relaxadas mas limites de custo rigorosos.
4. **Use Decommissioned para limpeza.** Mova assinaturas para cá antes da exclusão para garantir que os recursos sejam inventariados e os dados retidos conforme a política.
5. **Evite atribuir a função Owner no nível do management group.** Owner no management group raiz dá controle sobre todas as assinaturas no tenant.

### Dica Profissional

- [Visão geral de management groups](https://learn.microsoft.com/azure/governance/management-groups/overview)
- [Design de management group e organização de assinaturas do CAF](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-management-groups)

---

## 4.3 — Assinaturas

### O Que São

Uma **assinatura** é um contêiner lógico para recursos do Azure. Ela serve a múltiplos propósitos simultaneamente:

| Propósito | Descrição |
|---|---|
| **Limite de faturamento** | Todos os recursos em uma assinatura são faturados juntos. |
| **Limite de escala** | Cada assinatura tem [limites de serviço](https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits) (ex.: máximo de VMs por região, máximo de VNets). |
| **Limite de política** | O Azure Policy pode ter escopo de assinatura. |
| **Limite de acesso** | Atribuições RBAC no nível da assinatura concedem acesso a todos os recursos dentro dela. |

### Assinatura e Identidade

Uma assinatura tem uma **relação de confiança** com um tenant do Microsoft Entra ID para autenticação e autorização:

- O mesmo tenant do Microsoft Entra ID pode ser confiado por **múltiplas assinaturas**.
- Cada assinatura confia em **exatamente um** tenant do Microsoft Entra ID.
- Isso significa que você pode gerenciar uma base de usuários unificada em muitas assinaturas a partir de um único tenant.

Após criar ou sincronizar usuários no Microsoft Entra ID, você concede a esses usuários do Entra ID acesso a assinaturas e recursos por meio de atribuições de função RBAC.

### Funções e Atribuições

Existem duas categorias distintas de funções:

1. **Funções do Azure (RBAC):** Concedidas no contexto de recursos do Azure. Essas funções usam [Role-Based Access Control](https://learn.microsoft.com/azure/role-based-access-control/overview) e são atribuídas no escopo de management group, assinatura, resource group ou recurso. As três funções fundamentais são Owner, Contributor e Reader. Além destas, existem mais de 500 funções internas para serviços específicos ([veja a lista completa](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles)). Você também pode criar [funções personalizadas](https://learn.microsoft.com/azure/role-based-access-control/custom-roles) para controle granular.

2. **Funções do Microsoft Entra ID:** Usadas exclusivamente para gerenciar recursos do Microsoft Entra ID (usuários, grupos, registros de app). Essas funções são separadas das funções RBAC do Azure.

![Funções do Azure vs funções do Entra ID](../../images/ad-rbac-roles.png)

### Projetando Sua Estratégia de Assinatura

Ter pelo menos duas assinaturas — uma para o ambiente de **produção** e uma para não-produção — é um ponto de partida recomendado para segregação de ambiente e controle de acesso. Dependendo do tamanho e dos requisitos de conformidade do seu ambiente, você pode precisar de assinaturas adicionais.

Use o [guia de decisão de design de assinatura](https://learn.microsoft.com/azure/cloud-adoption-framework/decision-guides/subscriptions/) para determinar a melhor abordagem para sua organização. Perguntas-chave a fazer:

- Precisamos separar cargas de trabalho por limite de conformidade?
- Precisamos isolar faturamento para diferentes unidades de negócio?
- Estamos nos aproximando dos limites de serviço no nível da assinatura?

### Subscription Vending

Em escala, criar e configurar assinaturas manualmente é lento e propenso a erros. **Subscription vending** é a prática de automatizar a criação de assinaturas por meio de um processo de autoatendimento:

1. Uma equipe solicita uma nova assinatura (ex.: via formulário ServiceNow ou um pull request no Git).
2. Automação (Bicep, Terraform ou pipelines do Azure DevOps) cria a assinatura, coloca-a no management group correto, atribui políticas de base, configura RBAC, configura rede e aplica tags.
3. A equipe recebe uma assinatura pronta para produção em minutos, não semanas.

Veja a [orientação de subscription vending do CAF](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending) para padrões de implementação.

### Azure Landing Zones

A [arquitetura Azure Landing Zone](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) fornece um design modular e escalável para organizar assinaturas. Ela aborda:

- Enrollment e tenants do Microsoft Entra ID
- Gerenciamento de identidade e acesso
- Organização de management groups e assinaturas
- Topologia de rede e conectividade
- Gerenciamento e monitoramento
- Continuidade de negócios e recuperação de desastres
- Segurança, governança e conformidade
- Automação de plataforma e DevOps

![Arquitetura de landing zone](../../images/landing-zone.png)

A arquitetura de landing zone suporta diferentes topologias de rede. Por exemplo, a topologia **Hub and Spoke** mapeia para assinaturas da seguinte forma:

- Uma **assinatura de serviços compartilhados** (Hub Virtual Network)
- Uma **assinatura de produção** (Spoke 1 Virtual Network)
- Uma **assinatura de não-produção** (Spoke 2 Virtual Network)

Referências de Hub and Spoke:
- [Topologia de rede hub-spoke](https://learn.microsoft.com/azure/architecture/reference-architectures/hybrid-networking/hub-spoke)
- [Definir uma topologia de rede Azure](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/define-an-azure-network-topology)

### Implementações de Referência do Azure Landing Zone Accelerator

O Azure Landing Zone Accelerator (anteriormente "Enterprise-Scale") oferece implementações de referência que podem ser implantadas e escaladas sem refatoração:

| Implementação | Descrição | Link |
|---|---|---|
| **Foundation** (anteriormente Wingtip) | Landing zone mínima sem conectividade híbrida | [GitHub](https://github.com/Azure/Enterprise-Scale/blob/main/docs/reference/wingtip/README.md) |
| **Hub and Spoke** (anteriormente AdventureWorks) | Landing zone com topologia de rede hub-spoke | [GitHub](https://github.com/Azure/Enterprise-Scale/blob/main/docs/reference/adventureworks/README.md) |
| **Virtual WAN** (anteriormente Contoso) | Landing zone com topologia de rede Azure Virtual WAN | [GitHub](https://github.com/Azure/Enterprise-Scale/blob/main/docs/reference/contoso/Readme.md) |

### Ciclo de Vida da Assinatura

Os dados da assinatura são retidos por um período após o cancelamento, e assinaturas canceladas permanecem visíveis no Portal e APIs. Revise a [documentação do processo de cancelamento](https://learn.microsoft.com/azure/cost-management-billing/manage/cancel-azure-subscription) antes de descomissionar.

### Melhores Práticas para Assinaturas

1. **Use assinaturas como limites de escala e isolamento.** Separe produção de não-produção. Separe cargas de trabalho com diferentes requisitos de conformidade.
2. **Automatize a criação de assinaturas.** Use subscription vending para garantir que cada nova assinatura seja configurada de forma consistente.
3. **Coloque cada assinatura em um management group.** Assinaturas fora da hierarquia perdem políticas e RBAC herdados.
4. **Monitore limites de serviço no nível da assinatura.** Use o Azure Resource Graph para acompanhar o uso contra os limites antes de atingir tetos.
5. **Atribua Contributor (não Owner) para equipes de carga de trabalho.** Reserve Owner para a equipe de plataforma. Use PIM para elevação temporária de Owner.

### Dica Profissional

- [Azure Landing Zone Accelerator](https://github.com/Azure/Enterprise-Scale)
- [Subscription vending](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending)

---

## 4.4 — Resource Groups

### O Que São

Um **resource group** é um contêiner lógico dentro de uma assinatura que mantém recursos do Azure relacionados. Todo recurso do Azure deve pertencer a exatamente um resource group.

Resource groups são alimentados pelo **Azure Resource Manager (ARM)**, que substituiu o modelo de implantação legado Azure Service Manager (ASM). O ARM introduziu organização estruturada de recursos, implantações declarativas e gerenciamento de dependências.

### Padrões de Design de Resource Groups

Como você organiza recursos em resource groups tem implicações de governança. Aqui estão três padrões comuns:

| Padrão | Quando Usar | Exemplo |
|---|---|---|
| **Por aplicação** | Recursos compartilham o mesmo ciclo de vida da aplicação | `rg-webapp-prod-westeu` contém o App Service, SQL Database, Key Vault e Application Insights para um único app |
| **Por ciclo de vida** | Recursos são criados e excluídos juntos | `rg-networking-prod-westeu` contém todos os VNets e firewalls, que têm um ciclo de vida mais longo que os recursos de aplicação |
| **Por faturamento / centro de custo** | Recursos devem ser rastreados para um orçamento específico | `rg-marketing-analytics-prod` contém todos os recursos cobrados do departamento de marketing |

> **Orientação prática:** O padrão "por aplicação" é o mais comum e o padrão mais seguro. Ele garante que excluir um resource group remove todos os componentes de uma aplicação sem afetar outras cargas de trabalho.

### Como os Resource Groups Funcionam

- Um resource group tem uma **localização** (região), mas isso apenas armazena os metadados do resource group. Recursos dentro do grupo podem estar em qualquer região.
- **RBAC, Azure Policy, tags e resource locks** podem todos ser aplicados no nível do resource group.
- Excluir um resource group **exclui todos os recursos dentro dele** — use resource locks para prevenir exclusão acidental de grupos críticos.
- Recursos podem ser **movidos** entre resource groups (com algumas limitações específicas de serviço).

### Melhores Práticas para Resource Groups

1. **Use uma convenção de nomenclatura consistente.** Exemplo: `rg-{workload}-{environment}-{region}` → `rg-payments-prod-westeu`.
2. **Aplique tags no nível do resource group.** Tags em um resource group **não** são herdadas pelos recursos dentro dele. Use Azure Policy para propagar tags se necessário.
3. **Use resource locks em resource groups críticos.** Aplique um lock `CanNotDelete` para prevenir exclusão acidental de resource groups de produção.
4. **Projete para gerenciamento de ciclo de vida.** Agrupe recursos que compartilham o mesmo ciclo de vida de criação/atualização/exclusão. Isso torna a limpeza e reimplantação diretas.
5. **Mantenha resource groups focados.** Um resource group com mais de 200 recursos é difícil de gerenciar. Divida por aplicação ou limite de serviço.

---

## Exemplos de Código

### Bicep — Criar um Resource Group com Tags

```bicep
targetScope = 'subscription'

param location string = 'westeurope'
param environment string = 'prod'
param workload string = 'payments'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${workload}-${environment}-${location}'
  location: location
  tags: {
    Environment: environment
    Application: workload
    CostCenter: 'CC-4521'
    Owner: 'platform-team@contoso.com'
    CreatedBy: 'bicep'
    CreatedDate: '2026-04-06'
  }
}

output resourceGroupName string = rg.name
output resourceGroupId string = rg.id
```

### Azure CLI — Criar um Resource Group

```bash
az group create \
  --name "rg-payments-prod-westeurope" \
  --location "westeurope" \
  --tags Environment=prod Application=payments CostCenter=CC-4521
```

### Azure CLI — Aplicar um Resource Lock

```bash
az lock create \
  --name "prevent-deletion" \
  --resource-group "rg-payments-prod-westeurope" \
  --lock-type CanNotDelete \
  --notes "Production resource group — do not delete"
```

### Bicep — Hierarquia de Management Groups (Exemplo Completo)

```bicep
targetScope = 'tenant'

resource rootMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-contoso'
  properties: {
    displayName: 'Contoso'
  }
}

resource platformMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-platform'
  properties: {
    displayName: 'Platform'
    details: { parent: { id: rootMg.id } }
  }
}

resource landingZonesMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-landingzones'
  properties: {
    displayName: 'Landing Zones'
    details: { parent: { id: rootMg.id } }
  }
}

resource corpMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-corp'
  properties: {
    displayName: 'Corp'
    details: { parent: { id: landingZonesMg.id } }
  }
}

resource onlineMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-online'
  properties: {
    displayName: 'Online'
    details: { parent: { id: landingZonesMg.id } }
  }
}

resource sandboxMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-sandbox'
  properties: {
    displayName: 'Sandbox'
    details: { parent: { id: rootMg.id } }
  }
}

resource decommissionedMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-decommissioned'
  properties: {
    displayName: 'Decommissioned'
    details: { parent: { id: rootMg.id } }
  }
}
```

---

## Exercício Prático

**Cenário:** Você está projetando a hierarquia de recursos para uma empresa de médio porte que tem três unidades de negócio (Engenharia, Marketing, Finanças), dois ambientes (produção, não-produção) e planeja crescer de 5 para 30 assinaturas nos próximos 18 meses.

1. **Projete uma hierarquia de management groups.** Desenhe-a (texto ou diagrama) usando a referência do CAF como ponto de partida. Decida onde as assinaturas de cada unidade de negócio viverão.
2. **Defina uma convenção de nomenclatura de assinaturas.** Por exemplo: `sub-{unidadedenegocio}-{workload}-{environment}`.
3. **Defina uma convenção de nomenclatura de resource groups.** Por exemplo: `rg-{workload}-{environment}-{region}`.
4. **Identifique quais Azure Policies** você atribuiria no management group raiz versus no management group de landing zone.
5. **Implante o exemplo de código Bicep acima** para criar sua hierarquia de management groups em um ambiente de teste.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | O Que Fazer em Vez Disso |
|---|---|---|
| Sem hierarquia de management group | Políticas devem ser atribuídas por assinatura; novas assinaturas ficam sem governança | Implemente a hierarquia do CAF antes de adicionar mais assinaturas |
| Tratar o tenant apenas como um provedor de identidade | Falta de Conditional Access, PIM e revisões de acesso cria lacunas de segurança | Governe o tenant como um limite de segurança crítico |
| Muitas assinaturas sem convenção de nomenclatura | Impossível identificar propósito, proprietário ou ambiente | Defina nomenclatura antes de criar assinaturas |
| Todos os recursos em um resource group | Excluir o grupo ou aplicar RBAC se torna tudo-ou-nada | Agrupe por ciclo de vida da aplicação |
| Conceder Owner no escopo da assinatura | Usuários com excesso de privilégio podem contornar controles de governança | Use Contributor + PIM para elevação |

---

## Referências

| Recurso | Link |
|---|---|
| Visão geral do Microsoft Entra ID | [learn.microsoft.com/entra/fundamentals/whatis](https://learn.microsoft.com/entra/fundamentals/whatis) |
| Microsoft Entra ID Governance | [learn.microsoft.com/entra/id-governance/identity-governance-overview](https://learn.microsoft.com/entra/id-governance/identity-governance-overview) |
| Comparar Microsoft Entra ID e AD DS | [learn.microsoft.com/entra/fundamentals/compare](https://learn.microsoft.com/entra/fundamentals/compare) |
| Visão geral de management groups | [learn.microsoft.com/azure/governance/management-groups/overview](https://learn.microsoft.com/azure/governance/management-groups/overview) |
| Design de management group do CAF | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-management-groups](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-management-groups) |
| Limites de serviço de assinatura do Azure | [learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits](https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits) |
| Guia de decisão de assinatura | [learn.microsoft.com/azure/cloud-adoption-framework/decision-guides/subscriptions/](https://learn.microsoft.com/azure/cloud-adoption-framework/decision-guides/subscriptions/) |
| Visão geral do Azure Landing Zone | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) |
| Subscription vending | [learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending) |
| Funções internas do Azure RBAC | [learn.microsoft.com/azure/role-based-access-control/built-in-roles](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles) |
| Visão geral do Azure Resource Manager | [learn.microsoft.com/azure/azure-resource-manager/management/overview](https://learn.microsoft.com/azure/azure-resource-manager/management/overview) |
| Princípios de resource groups | [learn.microsoft.com/training/modules/control-and-organize-with-azure-resource-manager/2-principles-of-resource-groups](https://learn.microsoft.com/training/modules/control-and-organize-with-azure-resource-manager/2-principles-of-resource-groups) |

---

| Anterior | Próximo |
|:---|:---|
| [Capítulo 3 — Modelo de Maturidade de Governança](ch03-governance-maturity-model.md) | [Capítulo 5 — Estratégia de Nomenclatura e Etiquetagem](ch05-naming-tagging-strategy.md) |
