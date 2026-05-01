# Capítulo 13 — Bicep & Azure Verified Modules

> Last verified: 2026-04-06

---

## Visão Geral

Bicep é a linguagem de domínio específico (DSL) do Azure para implantar recursos de forma declarativa. Ele compila para templates ARM JSON, mas oferece uma experiência de autoria dramaticamente mais limpa — sintaxe concisa, segurança de tipos, suporte nativo a módulos e linting integrado.

O Bicep alcançou **Disponibilidade Geral (GA) em junho de 2021** e agora é a **linguagem de Infrastructure as Code (IaC) recomendada** para implantações no Azure. Templates ARM JSON continuam sendo suportados, mas são considerados legados para novos projetos.

Por que o Bicep substituiu o ARM JSON como recomendação principal:

| Aspecto | ARM JSON | Bicep |
|---------|----------|-------|
| **Legibilidade** | JSON verboso e profundamente aninhado | DSL limpa e concisa |
| **Modularidade** | Templates vinculados/aninhados com gerenciamento complexo de URIs | Palavra-chave `module` nativa com referências locais, de registro e de Template Specs |
| **Ferramentas** | IntelliSense limitado | Extensão rica para VS Code com IntelliSense, validação e refatoração |
| **Segurança de tipos** | Erros em tempo de execução comuns | Verificação de tipos em tempo de compilação |
| **Curva de aprendizado** | Íngreme para não-desenvolvedores | Acessível para engenheiros de infraestrutura |
| **Linting** | Ferramentas externas necessárias | Linter integrado com regras configuráveis |
| **Descompilação** | N/A | `az bicep decompile` converte ARM JSON existente para Bicep |

> **Ponto-chave:** Todo arquivo Bicep compila para um template ARM JSON equivalente. Não há diferença em tempo de execução — o Azure Resource Manager só enxerga ARM JSON. Bicep é puramente uma melhoria de autoria.

---

## Como Funciona

### Fundamentos da Sintaxe Bicep

Um arquivo Bicep (`.bicep`) declara o estado desejado dos recursos do Azure. O Bicep CLI ou Azure CLI o compila para ARM JSON antes da implantação.

#### Parâmetros

Parâmetros permitem que os chamadores forneçam valores no momento da implantação:

```bicep
@description('The Azure region for all resources.')
@allowed([
  'eastus'
  'westus2'
  'westeurope'
])
param location string = 'eastus'

@description('Environment name used for naming and tagging.')
@minLength(2)
@maxLength(10)
param environmentName string
```

#### Variáveis

Variáveis armazenam valores computados ou reutilizáveis:

```bicep
var resourcePrefix = 'gov-${environmentName}'
var commonTags = {
  Environment: environmentName
  ManagedBy: 'Bicep'
  CostCenter: 'IT-Governance'
}
```

#### Recursos

Recursos declaram a infraestrutura Azure a ser implantada:

```bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: '${resourcePrefix}sa'
  location: location
  tags: commonTags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}
```

#### Outputs

Outputs retornam valores da implantação para uso por outros templates ou scripts:

```bicep
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
```

#### Módulos

Módulos permitem composição referenciando outros arquivos Bicep, registros Bicep ou Template Specs:

```bicep
// Local module
module networking './modules/networking.bicep' = {
  name: 'networkingDeployment'
  params: {
    location: location
    vnetName: '${resourcePrefix}-vnet'
  }
}

// Module from a Bicep registry
module storageModule 'br:myregistry.azurecr.io/bicep/modules/storage:v1.0' = {
  name: 'storageDeployment'
  params: {
    location: location
  }
}

// Module from a Template Spec
module policyModule 'ts:00000000-0000-0000-0000-000000000000/governance-rg/policy-template:v2.0' = {
  name: 'policyDeployment'
  params: {
    scope: subscription().id
  }
}
```

### Azure Verified Modules (AVM)

**Azure Verified Modules (AVM)** são a biblioteca oficial da Microsoft, mantida pela comunidade, de módulos pré-construídos para Bicep e Terraform. Eles implementam as melhores práticas do Azure prontas para uso — incluindo nomenclatura adequada, diagnósticos, integração RBAC e suporte a Private Endpoint.

Os módulos AVM são publicados no **Bicep Public Module Registry** (`mcr.microsoft.com/bicep`) e seguem um rigoroso padrão de qualidade:

- **Interface consistente:** todos os módulos seguem uma especificação comum para parâmetros, outputs e nomenclatura
- **Bem testados:** todo módulo possui testes automatizados cobrindo implantação e idempotência
- **Versionados:** versionamento semântico garante atualizações seguras
- **Duas categorias:**
  - **Resource modules** — encapsulam um único tipo de recurso Azure (ex.: `avm/res/storage/storage-account`)
  - **Pattern modules** — compõem múltiplos recursos em arquiteturas comuns (ex.: uma rede hub-spoke)

Para descobrir os módulos AVM disponíveis, visite o [AVM Module Index](https://aka.ms/avm/moduleindex).

#### Usando um Módulo AVM

```bicep
// Deploy a Key Vault using the AVM resource module
module keyVault 'br/public:avm/res/key-vault/vault:0.11.0' = {
  name: 'keyVaultDeployment'
  params: {
    name: '${resourcePrefix}-kv'
    location: location
    tags: commonTags
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
  }
}
```

### Bicep Linter

O Bicep inclui um **linter integrado** que executa automaticamente durante a compilação, detectando erros comuns e aplicando melhores práticas. As regras incluem:

| Regra | O que detecta |
|-------|---------------|
| `no-unused-params` | Parâmetros declarados mas nunca referenciados |
| `no-unused-vars` | Variáveis declaradas mas nunca referenciadas |
| `no-hardcoded-env` | URLs de ambiente Azure hardcoded (ex.: `management.azure.com`) |
| `prefer-interpolation` | Uso de `concat()` ao invés de interpolação de string |
| `secure-parameter-default` | Valores padrão em parâmetros `@secure()` |
| `use-resource-id-functions` | Construção manual de IDs de recurso ao invés de usar `.id` |
| `explicit-values-for-loc-params` | Não passar `location` explicitamente para módulos |
| `max-outputs` / `max-params` | Exceder limites recomendados |

Configure o linter em `bicepconfig.json`:

```json
{
  "analyzers": {
    "core": {
      "rules": {
        "no-unused-params": {
          "level": "error"
        },
        "no-hardcoded-env": {
          "level": "warning"
        },
        "use-resource-id-functions": {
          "level": "error"
        }
      }
    }
  }
}
```

### Implantações What-If

**What-If** permite visualizar as alterações que uma implantação faria *antes* de executá-la — semelhante ao `terraform plan`. Isso é crítico para governança pois permite revisão e aprovação antes de qualquer modificação ocorrer.

```bash
# Preview changes at subscription scope
az deployment sub what-if \
  --location eastus \
  --template-file main.bicep \
  --parameters environmentName='production'
```

A saída mostra alterações categorizadas como:
- **Create** — novos recursos a serem criados
- **Delete** — recursos existentes a serem removidos
- **Modify** — propriedades que serão alteradas (com valores antes/depois)
- **NoChange** — recursos que permanecem inalterados
- **Ignore** — recursos fora do escopo do template

### Terraform como Alternativa

Embora o Bicep seja a linguagem IaC recomendada pela Microsoft para o Azure, o **Terraform** (da HashiCorp) permanece como uma alternativa popular, especialmente para organizações que gerenciam ambientes multi-cloud.

| Consideração | Bicep | Terraform |
|--------------|-------|-----------|
| **Suporte ao Azure** | Suporte day-zero para novos recursos Azure | Pequeno atraso em relação às atualizações da API do Azure |
| **Multi-cloud** | Somente Azure | AWS, GCP, Azure e mais de 3.000 provedores |
| **Gerenciamento de estado** | Gerenciado pelo Azure (sem arquivo de estado) | Requer gerenciamento de arquivo de estado |
| **Curva de aprendizado** | Menor para equipes focadas em Azure | Sintaxe HCL para aprender, mas ampla comunidade |
| **Ecossistema de módulos** | AVM + Bicep Registry | Terraform Registry |

Para implementações de governança exclusivamente Azure, o Bicep é a escolha natural. Para organizações multi-cloud, o Terraform fornece um fluxo de trabalho unificado.

Veja: [Documentação do Terraform no Azure](https://learn.microsoft.com/en-us/azure/developer/terraform/)

---

## Melhores Práticas

1. **Use módulos para reutilização** — divida templates em módulos composíveis; prefira módulos AVM para tipos de recursos comuns
2. **Use um registro Bicep** — publique módulos compartilhados em um Azure Container Registry para consumo entre equipes
3. **Habilite o linter** — trate avisos do linter como erros em pipelines de CI
4. **Sempre execute What-If antes de implantações em produção** — integre o What-If nos gates de aprovação do CI/CD
5. **Use arquivos de parâmetros** — separe configuração do código; use arquivos `.bicepparam` (formato nativo de parâmetros do Bicep)
6. **Aplique tags em todos os recursos** — imponha tags via parâmetros e interfaces de módulos
7. **Fixe versões de módulos** — sempre referencie versões específicas de módulos do registro, não `latest`
8. **Proteja segredos** — use o decorator `@secure()` para parâmetros; referencie segredos do Key Vault com `getSecret()`
9. **Use `targetScope`** — declare explicitamente o escopo da implantação (`resourceGroup`, `subscription`, `managementGroup`, `tenant`)
10. **Versione seus templates** — armazene arquivos Bicep em controle de versão; use branching e pull requests para alterações

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Hardcoding de nomes de recursos | Colisões de nomes, incapacidade de implantar em múltiplos ambientes | Use parâmetros e convenções de nomenclatura |
| Ignorar avisos do linter | Bugs sutis e código não idiomático chegam à produção | Configure regras do linter como erros |
| Não usar What-If | Exclusões ou modificações inesperadas de recursos | Torne o What-If obrigatório nos pipelines de implantação |
| Armazenar segredos em arquivos de parâmetros | Credenciais commitadas no controle de versão | Use referências ao Key Vault e `@secure()` |
| Uso excessivo de `dependsOn` | Implantações mais lentas, serialização desnecessária | Deixe o Bicep inferir dependências via referências de recursos |
| Implantar ARM JSON junto com Bicep | Confusão sobre qual é a fonte da verdade | Padronize em Bicep; descompile ARM JSON legado |
| Não fixar versões de módulos AVM | Quebras por atualizações de módulos | Sempre especifique um número de versão |
| Ignorar `targetScope` | Implantação falha no escopo errado | Sempre declare `targetScope` explicitamente |

---

## Exemplos de Código

### Template Bicep Completo: Resource Group com RBAC e Tags

Este template implanta no **escopo de subscription**, criando um resource group com tags obrigatórias e atribuindo a role Reader a um grupo de segurança.

```bicep
// main.bicep
targetScope = 'subscription'

@description('The Azure region for the resource group.')
param location string = 'eastus'

@description('The environment name (dev, staging, production).')
@allowed(['dev', 'staging', 'production'])
param environmentName string

@description('The object ID of the Microsoft Entra ID group to assign the Reader role.')
param readerGroupObjectId string

@description('Cost center for billing allocation.')
param costCenter string

var rgName = 'rg-governance-${environmentName}'

@description('Deployment date for tagging (auto-populated).')
param createdDate string = utcNow('yyyy-MM-dd')

var commonTags = {
  Environment: environmentName
  CostCenter: costCenter
  ManagedBy: 'Bicep'
  CreatedDate: createdDate
}

// Reader role definition ID (built-in)
var readerRoleDefinitionId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'acdd72a7-3385-48ef-bd42-f606fba81ae7'
)

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: rgName
  location: location
  tags: commonTags
}

module rbacAssignment 'modules/roleAssignment.bicep' = {
  name: 'readerRoleAssignment'
  scope: rg
  params: {
    principalId: readerGroupObjectId
    roleDefinitionId: readerRoleDefinitionId
    principalType: 'Group'
  }
}

output resourceGroupName string = rg.name
output resourceGroupId string = rg.id
```

```bicep
// modules/roleAssignment.bicep
targetScope = 'resourceGroup'

@description('The principal ID to assign the role to.')
param principalId string

@description('The full resource ID of the role definition.')
param roleDefinitionId string

@description('The type of principal (User, Group, ServicePrincipal).')
@allowed(['User', 'Group', 'ServicePrincipal'])
param principalType string

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, roleDefinitionId)
  properties: {
    principalId: principalId
    roleDefinitionId: roleDefinitionId
    principalType: principalType
  }
}
```

Implante com:

```bash
az deployment sub create \
  --location eastus \
  --template-file main.bicep \
  --parameters environmentName='production' \
               readerGroupObjectId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
               costCenter='IT-GOV-001'
```

### Usando um Azure Verified Module

Este exemplo implanta um Azure Key Vault usando o módulo de recurso AVM, com autorização RBAC, restrições de rede e diagnósticos habilitados:

```bicep
// keyvault-main.bicep
targetScope = 'resourceGroup'

@description('The Azure region for the Key Vault.')
param location string = resourceGroup().location

@description('The environment name.')
param environmentName string = 'dev'

@description('Log Analytics workspace resource ID for diagnostics.')
param logAnalyticsWorkspaceId string

var kvName = 'kv-gov-${environmentName}-${uniqueString(resourceGroup().id)}'

module keyVault 'br/public:avm/res/key-vault/vault:0.11.0' = {
  name: 'keyVaultDeployment'
  params: {
    name: kvName
    location: location
    tags: {
      Environment: environmentName
      ManagedBy: 'Bicep-AVM'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
    diagnosticSettings: [
      {
        workspaceResourceId: logAnalyticsWorkspaceId
        logCategoriesAndGroups: [
          { categoryGroup: 'allLogs' }
        ]
        metricCategories: [
          { category: 'AllMetrics' }
        ]
      }
    ]
  }
}

output keyVaultName string = keyVault.outputs.name
output keyVaultUri string = keyVault.outputs.uri
```

---

## Referências

- [Documentação do Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)
- [Referência da linguagem Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/file)
- [Azure Verified Modules (AVM)](https://aka.ms/avm)
- [AVM Module Index](https://aka.ms/avm/moduleindex)
- [Regras do Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter)
- [Operação de implantação What-If](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if)
- [Módulos Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules)
- [Arquivos de parâmetros Bicep (.bicepparam)](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameter-files)
- [Terraform no Azure](https://learn.microsoft.com/en-us/azure/developer/terraform/)
- [Migrar de ARM JSON para Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/migrate)

---

| Anterior | Próximo |
|:---------|:--------|
| [Políticas Sugeridas de Governança](../part-3-policy-compliance/ch09-azure-policy.md) | [Deployment Stacks](ch14-deployment-stacks.md) |
