# Capítulo 8 — Managed Identities & Workload Identity

> Last verified: 2026-04-06

---

## Visão Geral

Credenciais são um passivo. Todo segredo armazenado em código, configuração ou key vault é um segredo que pode vazar. **Managed identities** eliminam esse risco para cargas de trabalho Azure fornecendo uma identidade gerenciada automaticamente no Microsoft Entra ID — sem senhas, sem certificados, sem dores de cabeça com rotação.

**Workload Identity Federation** estende esse modelo para além do Azure, permitindo que cargas de trabalho externas (GitHub Actions, clusters Kubernetes, outros provedores de nuvem) se autentiquem no Microsoft Entra ID sem armazenar segredos, usando credenciais federadas baseadas em tokens OIDC padrão da indústria.

Juntas, essas capacidades formam a base de uma estratégia de autenticação **sem segredos (secretless)** — e isso é uma vitória de governança.

---

## Como Funciona

### Managed Identities — O Básico

Uma managed identity é um service principal no Microsoft Entra ID cujo ciclo de vida está vinculado a um recurso Azure. O Azure gerencia a criação, rotação e exclusão de credenciais automaticamente.

![Managed Identity Flow](/images/managed-identity-flow.svg)

Não há senha ou certificado para você gerenciar — o Azure rotaciona as credenciais subjacentes automaticamente.

### System-Assigned vs. User-Assigned

| Dimensão | System-Assigned | User-Assigned |
|----------|----------------|---------------|
| **Ciclo de vida** | Vinculada ao recurso Azure. Criada quando habilitada, excluída quando o recurso é excluído. | Independente. Você a cria como um recurso standalone e a anexa a um ou mais recursos Azure. |
| **Compartilhamento** | Uma identidade por recurso. Não pode ser compartilhada. | Pode ser atribuída a múltiplos recursos. |
| **Caso de uso** | Cenários simples de recurso único. A identidade não sobrevive ao recurso. | Identidade compartilhada entre múltiplos recursos (ex.: diversas VMs acessando a mesma storage account), ou quando você precisa que a identidade persista entre recriações de recurso. |
| **Governança** | Fácil de auditar — identidade mapeia 1:1 para um recurso. | Requer gerenciamento deliberado de ciclo de vida para evitar identidades órfãs. |

### Quando Usar Cada Uma

- **System-assigned** — Use quando a identidade é exclusivamente para aquele único recurso e deve ser automaticamente limpa junto com ele. Exemplo: um Function App individual acessando um Key Vault específico.

- **User-assigned** — Use quando múltiplos recursos precisam da mesma identidade, ou quando você precisa pré-criar a identidade antes do recurso existir (comum em pipelines de infraestrutura como código). Exemplo: um pool de VMs atrás de um load balancer que todas precisam acessar uma storage account compartilhada.

> **Recomendação de governança:** Use **user-assigned** como padrão para cargas de trabalho de produção. O leve overhead adicional de gerenciamento é compensado por melhor controle sobre o ciclo de vida da identidade, atribuições RBAC mais limpas e migração mais fácil quando recursos são recriados.

---

## Workload Identity Federation

### O que É

Workload Identity Federation permite que provedores de identidade (IdPs) externos emitam tokens nos quais o Microsoft Entra ID confia — sem trocar segredos. Você configura uma **credencial federada** em um app registration ou user-assigned managed identity que diz: *"Eu confio em tokens deste emissor, para este sujeito."*

### Como Funciona

![Workload Identity Federation Flow](/images/workload-identity-flow.svg)

Sem client secret. Sem certificado. A confiança é baseada nas claims de emissor (`iss`) e sujeito (`sub`) do token correspondendo à configuração da credencial federada.

### Cenários Comuns

| Cenário | Emissor | Exemplo de Subject |
|---------|---------|-------------------|
| **GitHub Actions** | `https://token.actions.githubusercontent.com` | `repo:contoso/app:ref:refs/heads/main` |
| **Kubernetes (AKS, EKS, GKE)** | URL do emissor OIDC do cluster | `system:serviceaccount:my-namespace:my-sa` |
| **Outras nuvens (AWS, GCP)** | Endpoint STS/OIDC do provedor de nuvem | Claims de subject específicas do provedor |
| **Terraform Cloud/Enterprise** | `https://app.terraform.io` | Identificador de organização e workspace |

### Melhores Práticas para Federação

1. **Restrinja a claim de subject ao máximo** — para GitHub Actions, restrinja a um repositório *e* branch específicos (ex.: `repo:contoso/app:ref:refs/heads/main`). Uma claim de subject com wildcard é tão perigosa quanto um segredo vazado.

2. **Prefira managed identities a app registrations** — ao usar federação com cargas de trabalho Azure, federe em uma user-assigned managed identity em vez de um app registration. Managed identities não têm client secrets que possam ser acidentalmente criados depois.

3. **Rotacione credenciais federadas se o IdP externo mudar** — se você alterar a configuração OIDC do cluster Kubernetes ou mover repositórios, atualize as credenciais federadas.

---

## Exemplos de Código

### Bicep — Criar uma user-assigned managed identity e atribuir uma função

```bicep
@description('The Azure region for the managed identity.')
param location string = resourceGroup().location

@description('The name of the user-assigned managed identity.')
param identityName string = 'mi-app-backend'

@description('The name of the storage account to grant access to.')
param storageAccountName string

// Built-in role: Storage Blob Data Reader
var storageBlobDataReaderRoleId = '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, managedIdentity.id, storageBlobDataReaderRoleId)
  scope: storageAccount
  properties: {
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      storageBlobDataReaderRoleId
    )
  }
}

output identityClientId string = managedIdentity.properties.clientId
output identityPrincipalId string = managedIdentity.properties.principalId
```

### Bicep — Atribuir uma system-assigned managed identity a um Web App

```bicep
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-contoso-api'
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    // ... other properties
  }
}

output webAppPrincipalId string = webApp.identity.principalId
```

### Usando DefaultAzureCredential no Código da Aplicação

A classe `DefaultAzureCredential` do Azure Identity SDK fornece uma experiência de autenticação transparente que funciona tanto no desenvolvimento local quanto em produção. Ela tenta múltiplas fontes de credencial em ordem — managed identity, variáveis de ambiente, Azure CLI e mais — então o mesmo código funciona em qualquer lugar.

**Python:**

```python
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

credential = DefaultAzureCredential()
blob_service = BlobServiceClient(
    account_url="https://stcontosodata.blob.core.windows.net",
    credential=credential
)

# List containers — no connection string, no key, no secret
for container in blob_service.list_containers():
    print(container.name)
```

**C#:**

```csharp
using Azure.Identity;
using Azure.Storage.Blobs;

var credential = new DefaultAzureCredential();
var blobServiceClient = new BlobServiceClient(
    new Uri("https://stcontosodata.blob.core.windows.net"),
    credential);

await foreach (var container in blobServiceClient.GetBlobContainersAsync())
{
    Console.WriteLine(container.Name);
}
```

**JavaScript/TypeScript:**

```typescript
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  "https://stcontosodata.blob.core.windows.net",
  credential
);

for await (const container of blobServiceClient.listContainers()) {
  console.log(container.name);
}
```

> **Dica:** Em produção, se estiver usando uma user-assigned managed identity, passe o client ID para `DefaultAzureCredential` para evitar ambiguidade quando múltiplas identidades estão atribuídas ao mesmo recurso:
>
> ```python
> credential = DefaultAzureCredential(managed_identity_client_id="<client-id>")
> ```

---

## Governança da Proliferação de Identidades

Managed identities são fáceis de criar — talvez fáceis demais. Sem governança, você acaba com centenas de identidades, muitas delas órfãs (o recurso ao qual estavam anexadas há muito tempo se foi, mas a identidade persiste no Entra ID).

### Como Rastrear e Auditar Managed Identities

1. **Use Azure Resource Graph** para inventariar todas as managed identities entre subscriptions:

    ```kusto
    resources
    | where type == "microsoft.managedidentity/userassignedidentities"
    | project name, resourceGroup, subscriptionId, location, tags
    | order by subscriptionId, resourceGroup
    ```

2. **Detecte user-assigned identities órfãs** — quando um recurso é excluído, o service principal da system-assigned identity pode persistir brevemente (o Azure faz a limpeza, mas pode haver um atraso). Para user-assigned identities, identidades órfãs são sua responsabilidade. A consulta a seguir cruza atribuições de identidade em todos os recursos para encontrar identidades que nenhum recurso referencia:

    ```kusto
    resources
    | where type =~ 'microsoft.managedidentity/userassignedidentities'
    | project identityId = tolower(id), name, resourceGroup, subscriptionId
    | join kind=leftanti (
        resources
        | mv-expand bagexpansion=array identity.userAssignedIdentities
        | extend uaiId = tolower(tostring(bag_keys(identity.userAssignedIdentities)[0]))
        | where isnotempty(uaiId)
        | project uaiId
        | distinct uaiId
    ) on $left.identityId == $right.uaiId
    ```

3. **Revise atribuições RBAC para managed identities** — combine o inventário de identidades com dados de atribuição de função para encontrar identidades com permissões excessivas:

    ```bash
    az role assignment list --all --query "[?principalType=='ServicePrincipal']" --output table
    ```

4. **Aplique tags em user-assigned managed identities** — aplique tags como `owner`, `project` e `environment` em toda user-assigned managed identity. Isso torna possível identificar proprietários e limpar identidades obsoletas.

5. **Aplique convenções de nomenclatura** — use um prefixo consistente (ex.: `mi-<app>-<env>`) para que managed identities sejam facilmente identificáveis no Entra ID e Azure Resource Graph.

6. **Use Azure Policy** para aplicar governança:
    - Exija tags em recursos `Microsoft.ManagedIdentity/userAssignedIdentities`.
    - Audite recursos que usam system-assigned identities quando uma user-assigned identity é preferida.

---

## Melhores Práticas

1. **Prefira managed identities a service principals com segredos** — se sua carga de trabalho roda no Azure, quase nunca há razão para usar client secrets ou certificados.

2. **Use user-assigned como padrão para produção** — elas sobrevivem à recriação de recursos, podem ser compartilhadas e têm gerenciamento de ciclo de vida mais claro.

3. **Use Workload Identity Federation para cargas de trabalho externas** — GitHub Actions, Terraform Cloud, Kubernetes — todos suportam federação OIDC. Pare de armazenar segredos em CI/CD.

4. **Aplique RBAC de menor privilégio em managed identities** — uma managed identity ainda é um security principal. Atribua a função mais restrita possível (veja o [Capítulo 6 — RBAC](ch06-rbac.md)).

5. **Inclua managed identities nas access reviews** — use access reviews do Microsoft Entra para verificar periodicamente se managed identities ainda precisam de suas atribuições de função (veja o [Capítulo 7 — Entra ID Governance](ch07-entra-id-governance.md)).

6. **Limpe identidades órfãs** — agende varreduras periódicas usando consultas do Azure Resource Graph. Uma identidade órfã com permissões permanentes é um risco.

7. **Use DefaultAzureCredential no código da aplicação** — fornece uma experiência de desenvolvimento consistente e sem credenciais que automaticamente usa a credencial certa para o ambiente.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | Correção |
|-----------|-------------------|----------|
| Usar client secrets "porque é mais simples" | Segredos vazam. Acabam em logs, arquivos de configuração e controle de versão. | Use managed identities ou workload identity federation. |
| Criar uma system-assigned identity em cada recurso | Bom para casos simples, mas leva a uma proliferação de atribuições de função difíceis de auditar. | Use user-assigned identities quando múltiplos recursos precisam do mesmo acesso. |
| User-assigned identities órfãs | Persistem no Entra ID com atribuições RBAC ativas, criando uma superfície de risco. | Aplique tags nas identidades, consulte com Resource Graph e agende limpeza. |
| Usar `DefaultAzureCredential` sem especificar client ID em cenários multi-identidade | O SDK pode escolher a identidade errada, causando falhas intermitentes de autenticação. | Passe o `managed_identity_client_id` explicitamente. |
| Claims de subject com wildcard em credenciais federadas | Qualquer workflow no repositório (ou organização) pode se autenticar como a identidade. | Restrinja a repositório, branch e ambiente específicos. |

---

## Referências

- [Managed identities para recursos Azure](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview)
- [User-assigned vs. system-assigned managed identities](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/managed-identity-best-practice-recommendations)
- [Workload Identity Federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [DefaultAzureCredential (Azure Identity SDK)](https://learn.microsoft.com/python/api/azure-identity/azure.identity.defaultazurecredential)
- [Consultas Azure Resource Graph para managed identities](https://learn.microsoft.com/azure/governance/resource-graph/samples/starter)
- [RBAC — Capítulo 6](ch06-rbac.md)
- [Microsoft Entra ID Governance — Capítulo 7](ch07-entra-id-governance.md)

---

Anterior | Próximo
:--- | :---
[Capítulo 7 — Microsoft Entra ID Governance](ch07-entra-id-governance.md) | [Parte 3 — Política & Conformidade](../part-3-policy-compliance/ch09-azure-policy.md)
