# Capítulo 14 — Deployment Stacks

> Last verified: 2026-04-06

---

## Visão Geral

**O Azure Blueprints está descontinuado e atinge o fim da vida útil em 11 de julho de 2026. Deployment Stacks são a substituição recomendada, com disponibilidade geral (GA) desde maio de 2024.**

Um **Deployment Stack** é um recurso do Azure que gerencia uma coleção de recursos implantados como uma única unidade atômica. Quando você cria ou atualiza um Deployment Stack, você envia um arquivo Bicep (ou template ARM JSON), e o Azure garante que todos os recursos definidos no template sejam implantados, atualizados ou limpos como um grupo.

Deployment Stacks resolvem um desafio fundamental de governança: **como garantir que um conjunto de recursos permaneça consistente com sua configuração pretendida, e como prevenir alterações não autorizadas em recursos governados?**

Capacidades principais:

- **Gerenciamento de ciclo de vida atômico** — crie, atualize e exclua um conjunto de recursos como uma unidade
- **Deny settings** — previnem modificações ou exclusões em recursos gerenciados, mesmo por proprietários da subscription
- **ActionOnUnmanage** — controla o que acontece com recursos removidos do template (excluir, desanexar ou manter)
- **Implantação cross-scope** — um stack no escopo de subscription pode implantar recursos em múltiplos resource groups
- **Aplicação de governança** — deny settings atuam como um lock em nível de recurso gerenciado pelo stack, não por atribuições RBAC individuais

---

## Como Funciona

### Escopos de Deployment Stack

Um Deployment Stack pode ser criado em três escopos, cada um determinando o raio de impacto e a hierarquia de gerenciamento:

| Escopo do Stack | Pode Implantar Recursos Em | Caso de Uso |
|-----------------|---------------------------|-------------|
| **Resource Group** | O mesmo resource group | Coleções de recursos de uma única aplicação |
| **Subscription** | Qualquer resource group dentro da subscription | Implantações cross-resource-group, recursos em nível de subscription |
| **Management Group** | Qualquer subscription/resource group dentro do management group | Baselines de governança empresarial |

### Deny Settings

Deny settings são o recurso de governança mais poderoso dos Deployment Stacks. Eles previnem modificações em recursos gerenciados independentemente da role RBAC do usuário:

| Deny Setting | Efeito |
|--------------|--------|
| `None` | Nenhuma deny assignment aplicada — qualquer pessoa com permissões RBAC pode modificar recursos |
| `DenyDelete` | Recursos gerenciados não podem ser excluídos, mas podem ser modificados |
| `DenyWriteAndDelete` | Recursos gerenciados não podem ser modificados ou excluídos |

Deny settings são implementados através de **deny assignments**, um recurso do Azure RBAC. Você pode excluir principals específicos (ex.: uma conta break-glass) ou ações específicas da deny assignment:

```bash
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file main.bicep \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --deny-settings-excluded-actions 'Microsoft.Resources/tags/write'
```

### ActionOnUnmanage

Quando você atualiza um Deployment Stack e remove um recurso do template, a configuração `ActionOnUnmanage` determina o que acontece com o recurso órfão:

| Política | Comportamento |
|----------|---------------|
| `deleteAll` | O recurso é excluído do Azure |
| `deleteResources` | Recursos são excluídos; resource groups e management groups são desanexados |
| `detachAll` | O recurso continua existindo mas não é mais gerenciado pelo stack |

Isso é crítico para governança — previne o "espalhamento de recursos" onde recursos são removidos dos templates mas continuam existindo (e custando dinheiro) no Azure.

### Como o Ciclo de Vida de um Stack Funciona

1. **Criação** — você envia um template Bicep para criar um stack; o Azure implanta todos os recursos e os registra como "gerenciados"
2. **Atualização** — você modifica o template e atualiza o stack; o Azure calcula o diff, implanta as alterações e aplica a política `ActionOnUnmanage` aos recursos removidos
3. **Negação** — deny assignments são aplicadas a todos os recursos gerenciados de acordo com os deny settings
4. **Exclusão** — quando o stack é excluído, a política `ActionOnUnmanage` determina se os recursos gerenciados são excluídos ou desanexados

---

## Blueprints vs. Deployment Stacks

Para equipes migrando do Azure Blueprints, esta comparação destaca as principais diferenças:

| Recurso | Azure Blueprints (Descontinuado) | Deployment Stacks |
|---------|----------------------------------|-------------------|
| **Status** | Descontinuado (EOL 11 de julho de 2026) | GA desde maio de 2024 |
| **Linguagem de template** | Somente ARM JSON | Bicep ou ARM JSON |
| **Escopo** | Management group, subscription | Resource group, subscription, management group |
| **Tipos de artefato** | Policy, RBAC, ARM, resource groups | Qualquer recurso implantável via Bicep/ARM |
| **Versionamento** | Versões de blueprint integradas | Use controle de versão e Template Specs |
| **Bloqueio** | Bloqueio em nível de blueprint (limitado) | Deny assignments com exclusões granulares |
| **Tratamento de órfãos** | Limpeza manual | Automático via ActionOnUnmanage |
| **Integração CI/CD** | Limitada | Integração completa via CLI/PowerShell/REST |
| **Suporte a módulos** | Nenhum | Módulos Bicep, AVM, registros |
| **Suporte What-If** | Não | Sim |
| **Rastreamento de estado** | Objeto de assignment do blueprint | Recurso stack com lista de recursos gerenciados |

### Guia de Migração: Blueprints para Deployment Stacks

**Passo 1: Inventarie seus Blueprints**

```bash
# List all blueprint definitions
az blueprint list --management-group 'my-mg'

# List all blueprint assignments
az blueprint assignment list --subscription 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
```

**Passo 2: Converta artefatos para Bicep**

Cada tipo de artefato Blueprint mapeia para um construto Bicep:

| Artefato Blueprint | Equivalente Bicep |
|-------------------|-------------------|
| Artefato de template ARM | Módulo Bicep ou recurso inline |
| Artefato de policy assignment | Recurso `Microsoft.Authorization/policyAssignments` |
| Artefato de role assignment | Recurso `Microsoft.Authorization/roleAssignments` |
| Artefato de resource group | Recurso `Microsoft.Resources/resourceGroups` (no escopo de subscription) |

**Passo 3: Crie um template Bicep que inclua todos os artefatos**

Consolide todos os artefatos Blueprint em um único arquivo Bicep (ou um arquivo principal com módulos).

**Passo 4: Implante como um Deployment Stack**

```bash
az stack sub create \
  --name 'migrated-governance-baseline' \
  --location eastus \
  --template-file governance-baseline.bicep \
  --deny-settings-mode DenyWriteAndDelete \
  --action-on-unmanage detachAll
```

**Passo 5: Valide e remova o assignment do Blueprint**

Após verificar que o Deployment Stack está gerenciando corretamente todos os recursos:

```bash
az blueprint assignment delete \
  --name 'governance-baseline-assignment' \
  --subscription 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
```

---

## Melhores Práticas

1. **Use `DenyWriteAndDelete` para baselines de produção** — isso fornece a proteção mais forte para recursos críticos de governança
2. **Exclua contas break-glass** — sempre configure `deny-settings-excluded-principals` com suas contas de acesso emergencial
3. **Comece com `detachAll` para ActionOnUnmanage** — enquanto aprende Deployment Stacks, use `detachAll` para evitar exclusão acidental de recursos
4. **Use stacks no escopo de subscription para governança** — implante policy assignments, RBAC e resource groups a partir de um único stack no escopo de subscription
5. **Fixe versões de módulos Bicep** — referencie versões específicas de módulos AVM ou do registro para prevenir alterações inesperadas
6. **Integre com CI/CD** — automatize atualizações de stacks através de pipelines com What-If e gates de aprovação (veja [Capítulo 16](ch16-governance-cicd.md))
7. **Use nomenclatura consistente** — nomeie stacks de forma descritiva (ex.: `governance-baseline`, `app-infrastructure-prod`)
8. **Revise recursos gerenciados regularmente** — use `az stack sub show` para auditar quais recursos são gerenciados por cada stack

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Usar `deleteAll` sem testar | Exclusão acidental de recursos | Comece com `detachAll`; mude para `deleteResources` após validação |
| Não excluir contas break-glass dos deny settings | Operações de emergência bloqueadas | Sempre exclua principals de acesso emergencial |
| Implantar no escopo errado | Recursos implantados em locais inesperados | Verifique se `targetScope` corresponde ao escopo do stack |
| Esquecer que deny settings protegem contra *todos* | Administradores bloqueados de seus próprios recursos | Planeje exclusões e documente-as |
| Não usar What-If antes de atualizações de stack | Alterações inesperadas em recursos de produção | Sempre visualize alterações com `--confirm-with-what-if` |
| Tratar stacks como implantações únicas | Drift se acumula ao longo do tempo | Atualize stacks regularmente a partir de pipelines CI/CD |

---

## Exemplos de Código

### Criando um Deployment Stack via Azure CLI

```bash
# Create a subscription-scoped Deployment Stack with deny settings
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file governance-baseline.bicep \
  --parameters environmentName='production' \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --deny-settings-excluded-actions 'Microsoft.Resources/tags/write' \
  --action-on-unmanage deleteResources \
  --confirm-with-what-if \
  --yes

# List all Deployment Stacks in a subscription
az stack sub list --output table

# Show details of a specific stack (including managed resources)
az stack sub show --name 'governance-baseline' --output json

# Update an existing stack
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file governance-baseline-v2.bicep \
  --parameters environmentName='production' \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --action-on-unmanage deleteResources \
  --confirm-with-what-if \
  --yes

# Delete a stack (detaching managed resources)
az stack sub delete \
  --name 'governance-baseline' \
  --action-on-unmanage detachAll \
  --yes
```

### Criando um Deployment Stack via Bicep (Baseline de Governança)

```bicep
// governance-baseline.bicep
targetScope = 'subscription'

@description('The Azure region for resources.')
param location string = 'eastus'

@description('The environment name.')
@allowed(['dev', 'staging', 'production'])
param environmentName string

var commonTags = {
  Environment: environmentName
  ManagedBy: 'DeploymentStack'
  GovernanceBaseline: 'v2.0'
}

// Create a governed resource group
resource governanceRg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-governance-${environmentName}'
  location: location
  tags: commonTags
}

// Assign the built-in "Require a tag on resources" policy
resource tagPolicy 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'require-cost-center-tag'
  properties: {
    displayName: 'Require CostCenter tag on resources'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/871b6d14-10aa-478d-b466-ef8e7a287eed'
    parameters: {
      tagName: {
        value: 'CostCenter'
      }
    }
    enforcementMode: 'Default'
  }
}

// Assign the built-in "Allowed locations" policy
resource locationPolicy 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'allowed-locations'
  properties: {
    displayName: 'Restrict resources to approved regions'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c'
    parameters: {
      listOfAllowedLocations: {
        value: [
          'eastus'
          'westus2'
          'westeurope'
        ]
      }
    }
    enforcementMode: 'Default'
  }
}

// Deploy Log Analytics workspace into the governance resource group
module logAnalytics 'modules/logAnalytics.bicep' = {
  name: 'logAnalyticsDeployment'
  scope: governanceRg
  params: {
    location: location
    workspaceName: 'log-governance-${environmentName}'
    tags: commonTags
  }
}
```

Implante como um Deployment Stack:

```bash
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file governance-baseline.bicep \
  --parameters environmentName='production' \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --action-on-unmanage deleteResources \
  --yes
```

---

## Referências

- [Visão geral de Deployment Stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks)
- [Criar um Deployment Stack com Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks-create)
- [Deny settings de Deployment Stack](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks-deny-settings)
- [Anúncio de descontinuação do Azure Blueprints](https://learn.microsoft.com/en-us/azure/governance/blueprints/overview)
- [Migrar de Blueprints para Deployment Stacks](https://learn.microsoft.com/en-us/azure/governance/blueprints/migrate-to-deployment-stacks)
- [Referência CLI az stack](https://learn.microsoft.com/en-us/cli/azure/stack)

---

| Anterior | Próximo |
|:---------|:--------|
| [Bicep & Azure Verified Modules](ch13-bicep-avm.md) | [Template Specs](ch15-template-specs.md) |
