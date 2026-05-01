# Capítulo 15 — Template Specs

> Last verified: 2026-04-06

---

## Visão Geral

**Template Specs** são recursos do Azure que armazenam templates ARM JSON ou Bicep versionados no próprio Azure. Eles fornecem uma forma nativa e centralizada de compartilhar e distribuir templates de infraestrutura entre equipes, subscriptions e até tenants do Microsoft Entra ID — sem exigir acesso a um repositório de código-fonte.

Pense em um Template Spec como um "template publicado" que qualquer pessoa com as permissões Azure RBAC corretas pode implantar, sem precisar entender o código IaC subjacente ou ter acesso a um repositório Git.

Benefícios principais:

- **Versionado** — cada Template Spec suporta múltiplas versões, permitindo rollouts e rollbacks seguros
- **Armazenado no Azure** — nenhum armazenamento externo ou registro necessário; gerenciado como um recurso nativo do Azure
- **Controlado por RBAC** — o acesso é governado pelo Azure RBAC padrão; você controla quem pode ler, implantar ou gerenciar templates
- **Referenciável como módulos Bicep** — o Bicep pode consumir Template Specs diretamente usando a fonte de módulo `ts:`
- **Implantação cross-scope** — Template Specs podem implantar recursos em qualquer escopo (resource group, subscription, management group)

---

## Como Funciona

### Anatomia de um Template Spec

Um Template Spec é um recurso do Azure do tipo `Microsoft.Resources/templateSpecs` que reside em um resource group. Cada versão é um recurso filho (`Microsoft.Resources/templateSpecs/versions`) contendo o conteúdo real do template.

![Template Spec Versions](/images/template-spec-versions.svg)

### Criando um Template Spec

#### Usando Azure CLI

```bash
# Create a Template Spec from a Bicep file
az ts create \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --location eastus \
  --version '2.0' \
  --template-file governance-baseline.bicep \
  --description 'Standard governance baseline for new subscriptions' \
  --display-name 'Governance Baseline v2.0'
```

#### Usando Azure PowerShell

```powershell
New-AzTemplateSpec `
  -Name 'governance-baseline' `
  -ResourceGroupName 'rg-templates' `
  -Location 'eastus' `
  -Version '2.0' `
  -TemplateFile 'governance-baseline.bicep' `
  -Description 'Standard governance baseline for new subscriptions'
```

### Versionamento e Ciclo de Vida

Versões de Template Spec seguem uma convenção de nomenclatura (não imposta como versionamento semântico, mas recomendada):

| Versão | Descrição |
|--------|-----------|
| `1.0` | Release inicial |
| `1.1` | Atualização menor — adicionado parâmetro opcional |
| `2.0` | Quebra de compatibilidade — parâmetros renomeados |

**Dicas de gerenciamento de ciclo de vida:**

- Use versionamento semântico (`MAJOR.MINOR`) para clareza
- Nunca sobrescreva uma versão publicada; crie uma nova versão
- Exclua versões desatualizadas após confirmar que nenhuma implantação ativa as referencia
- Documente alterações no campo `--description` de cada versão

```bash
# List all versions of a Template Spec
az ts show \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --output table

# Delete an old version
az ts delete \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --version '1.0' \
  --yes
```

### Implantando um Template Spec

```bash
# Get the Template Spec version resource ID
SPEC_ID=$(az ts show \
  --name 'governance-baseline' \
  --resource-group 'rg-templates' \
  --version '2.0' \
  --query 'id' -o tsv)

# Deploy the Template Spec
az deployment sub create \
  --location eastus \
  --template-spec "$SPEC_ID" \
  --parameters environmentName='production'
```

### Compartilhando Templates Entre Equipes e Subscriptions

Template Specs são recursos Azure padrão, então o compartilhamento é controlado através do Azure RBAC:

| Role | Capacidade |
|------|-----------|
| **Reader** | Pode visualizar o Template Spec e implantá-lo |
| **Template Spec Reader** | Pode ler e implantar Template Specs (role construída para esse propósito) |
| **Contributor** | Pode criar, atualizar e implantar Template Specs |
| **Owner** | Controle total incluindo gerenciamento de RBAC |

**Compartilhamento cross-subscription** — atribua a role `Template Spec Reader` para usuários ou grupos em outras subscriptions:

```bash
# Grant a group in another subscription read access to a Template Spec
az role assignment create \
  --assignee 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --role 'Template Spec Reader' \
  --scope '/subscriptions/<sub-id>/resourceGroups/rg-templates/providers/Microsoft.Resources/templateSpecs/governance-baseline'
```

### Referenciando Template Specs como Módulos Bicep

Uma das funcionalidades mais poderosas é usar Template Specs diretamente como módulos Bicep com o prefixo `ts:`:

```bicep
// Reference a Template Spec as a module
module governanceBaseline 'ts:<subscriptionId>/rg-templates/governance-baseline:2.0' = {
  name: 'governanceBaselineDeployment'
  params: {
    environmentName: 'production'
    location: 'eastus'
  }
}
```

Você também pode configurar aliases em `bicepconfig.json` para referências mais limpas:

```json
{
  "moduleAliases": {
    "ts": {
      "GovernanceSpecs": {
        "subscription": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "resourceGroup": "rg-templates"
      }
    }
  }
}
```

Então referencie o módulo com o alias:

```bicep
module governanceBaseline 'ts/GovernanceSpecs:governance-baseline:2.0' = {
  name: 'governanceBaselineDeployment'
  params: {
    environmentName: 'production'
  }
}
```

---

## Template Specs vs. Bicep Module Registry

Tanto Template Specs quanto o Bicep Module Registry (apoiado pelo Azure Container Registry) permitem compartilhar templates. Veja quando usar cada um:

| Recurso | Template Specs | Bicep Module Registry (ACR) |
|---------|---------------|----------------------------|
| **Armazenamento** | Azure Resource Manager | Azure Container Registry |
| **Controle de acesso** | Azure RBAC no recurso Template Spec | ACR RBAC e tokens |
| **Versionamento** | Strings de versão customizadas | Tags OCI (versionamento semântico) |
| **Descoberta** | Azure Portal, CLI, PowerShell | Listagem do repositório ACR, prefixo `br:` no Bicep |
| **Implantação** | Diretamente implantável via `az deployment` | Deve ser referenciado como módulo Bicep |
| **Compartilhamento cross-tenant** | Via Azure Lighthouse ou acesso de convidado | Via token ACR ou replicação cross-registry |
| **Ideal para** | Implantação self-service por equipes que não usam IaC | Bibliotecas de módulos compartilhados consumidos por desenvolvedores IaC |

**Recomendação:** Use **Template Specs** quando quiser que equipes que não usam IaC implantem infraestrutura padronizada através do Azure Portal ou CLI. Use o **Bicep Module Registry** quando quiser que desenvolvedores IaC consumam módulos compartilhados em seus próprios arquivos Bicep.

---

## Melhores Práticas

1. **Centralize Template Specs em um resource group dedicado** — crie `rg-templates` em uma subscription de governança ou serviços compartilhados
2. **Use versionamento semântico** — siga `MAJOR.MINOR` para comunicar alterações com ou sem quebra de compatibilidade
3. **Automatize a publicação** — publique Template Specs a partir de pipelines CI/CD, não manualmente
4. **Documente cada versão** — use o parâmetro `--description` para registrar o que mudou
5. **Use RBAC para controle de acesso** — conceda `Template Spec Reader` para equipes consumidoras; limite `Contributor` à equipe de plataforma
6. **Teste antes de publicar** — valide templates com What-If e linting antes de publicar uma nova versão
7. **Configure aliases Bicep** — simplifique referências de módulos com aliases em `bicepconfig.json`

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Sobrescrever versões existentes | Consumidores recebem alterações inesperadas | Sempre publique como uma nova versão |
| Sem controle de acesso | Implantações não autorizadas de templates sensíveis | Aplique RBAC aos recursos Template Spec |
| Não testar antes de publicar | Templates quebrados compartilhados com todos os consumidores | Integre What-If e linting no CI/CD |
| Versões órfãs | Confusão sobre qual versão usar | Documente e limpe versões antigas |
| Usar Template Specs quando um module registry é mais apropriado | Equipes escrevem Bicep mas não conseguem usar `ts:` tão facilmente quanto `br:` | Combine a ferramenta com a audiência |

---

## Exemplos de Código

### Criando e Implantando um Template Spec (Ponta a Ponta)

**Passo 1: Escreva o template Bicep**

```bicep
// storage-account.bicep
targetScope = 'resourceGroup'

@description('Storage account name.')
@minLength(3)
@maxLength(24)
param storageAccountName string

@description('Azure region.')
param location string = resourceGroup().location

@description('SKU name.')
@allowed(['Standard_LRS', 'Standard_GRS', 'Standard_ZRS'])
param skuName string = 'Standard_LRS'

@description('Tags to apply.')
param tags object = {}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: skuName
  }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
  }
}

output storageAccountId string = storageAccount.id
output primaryBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
```

**Passo 2: Publique como um Template Spec**

```bash
# Create the resource group for templates (one-time setup)
az group create --name rg-templates --location eastus

# Publish v1.0
az ts create \
  --name 'secure-storage-account' \
  --resource-group rg-templates \
  --location eastus \
  --version '1.0' \
  --template-file storage-account.bicep \
  --description 'Secure storage account with TLS 1.2, HTTPS-only, no public blob access'
```

**Passo 3: Implante o Template Spec**

```bash
# Get the version ID
SPEC_ID=$(az ts show \
  --name 'secure-storage-account' \
  --resource-group rg-templates \
  --version '1.0' \
  --query 'id' -o tsv)

# Deploy to a target resource group
az deployment group create \
  --resource-group rg-app-prod \
  --template-spec "$SPEC_ID" \
  --parameters storageAccountName='stappdata001' skuName='Standard_ZRS'
```

**Passo 4: Use como módulo Bicep em outro template**

```bicep
// main.bicep
module secureStorage 'ts/GovernanceSpecs:secure-storage-account:1.0' = {
  name: 'storageDeployment'
  params: {
    storageAccountName: 'stappdata001'
    skuName: 'Standard_ZRS'
    tags: {
      Environment: 'production'
      CostCenter: 'APP-001'
    }
  }
}
```

---

## Referências

- [Visão geral de Template Specs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-specs)
- [Criar e implantar Template Specs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-specs-create-linked)
- [Usar Template Specs como módulos Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules#template-specs)
- [Role Template Spec Reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#template-spec-reader)
- [Registros de módulos Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry)
- [Configuração Bicep (bicepconfig.json)](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config-modules)

---

| Anterior | Próximo |
|:---------|:--------|
| [Deployment Stacks](ch14-deployment-stacks.md) | [Governança CI/CD](ch16-governance-cicd.md) |
