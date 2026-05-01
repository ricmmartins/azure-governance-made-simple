# Capítulo 6 — Role-Based Access Control (RBAC)

> Last verified: 2026-04-06

---

## Visão Geral

Role-Based Access Control (RBAC) é o sistema de autorização integrado ao Azure Resource Manager. Ele permite conceder exatamente as permissões que pessoas e cargas de trabalho precisam — nada mais, nada menos. Em vez de conceder acesso amplo a uma assinatura, você define *quem* pode fazer *o quê* em um *escopo* específico.

O Azure hoje conta com **mais de 300 funções internas (built-in roles)**, cobrindo desde acesso amplo de "Contributor" até funções restritas e específicas de serviço como *Cosmos DB Operator* ou *Key Vault Secrets User*. Quando nenhuma delas atende, você pode criar uma **custom role** personalizada para sua organização.

![rbac](../../images/rbac.png)

---

## Como Funciona

Toda atribuição de RBAC é a interseção de três elementos:

| Conceito | Descrição |
|----------|-----------|
| **Security Principal** | A identidade solicitando acesso — um usuário, grupo, service principal ou managed identity (veja o [Capítulo 8](ch08-managed-identities.md)). |
| **Role Definition** | Uma coleção de ações permitidas (e negadas). Pode ser built-in ou custom. |
| **Scope** | Onde as permissões se aplicam — management group, subscription, resource group ou recurso individual. |

### Hierarquia de escopo

As permissões são **herdadas** de cima para baixo. Uma função atribuída no escopo da subscription se aplica a todos os resource groups e recursos abaixo dela.

![RBAC Scope Hierarchy](/images/rbac-scope-hierarchy.svg)

![scope](../../images/scope.png)

### Tipos de função

| Tipo | Descrição |
|------|-----------|
| **Built-in roles** | Mais de 300 funções predefinidas mantidas pela Microsoft (ex.: Owner, Contributor, Reader, além de funções específicas de serviço). |
| **Custom roles** | Funções que você cria quando as built-in roles não atendem aos seus requisitos. Custom roles podem ter escopo em management groups, subscriptions ou resource groups. |

---

## Attribute-Based Access Control (ABAC) — Condições no RBAC

O RBAC padrão responde *"Este principal pode executar esta ação neste escopo?"*. O ABAC adiciona uma quarta dimensão: **condições** baseadas em atributos de recursos.

Por exemplo, você pode conceder a um principal a função *Storage Blob Data Reader*, mas adicionar uma condição que restringe o acesso a blobs marcados com `project=alpha`. Isso é expresso por meio de **condições de atribuição de função** escritas em uma linguagem declarativa de condições.

### Quando usar ABAC

- **Storage accounts** — restringir leitura/escrita a blobs que correspondam a tags específicas, nomes de containers ou blob index tags.
- **Controle granular no plano de dados** — quando você precisa de permissões mais granulares do que uma role definition sozinha pode oferecer, sem criar dezenas de custom roles.

### Exemplo de condição (conceitual)

```
(
  @Resource[Microsoft.Storage/storageAccounts/blobServices/containers/blobs:tags<$key$>]
  StringEquals 'project' 'alpha'
)
```

> **Nota:** As condições ABAC atualmente são suportadas em um subconjunto de serviços do Azure, sendo o Azure Storage o mais maduro. Consulte a [documentação de condições ABAC](https://learn.microsoft.com/azure/role-based-access-control/conditions-overview) para o suporte mais atualizado de serviços.

---

## Criação de Custom Roles

Quando as mais de 300 built-in roles não são granulares o suficiente, crie uma custom role. Custom roles podem incluir qualquer combinação de `Actions`, `NotActions`, `DataActions` e `NotDataActions`.

### Exemplo Bicep — definição de custom role

O seguinte template Bicep cria uma custom role chamada *VM Restart Operator* com escopo em uma subscription, permitindo apenas a ação de reinicialização em máquinas virtuais:

```bicep
targetScope = 'subscription'

@description('The subscription ID where the custom role will be assignable.')
param assignableScope string = subscription().id

resource customRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(subscription().id, 'vm-restart-operator')
  properties: {
    roleName: 'VM Restart Operator'
    description: 'Can view virtual machines and restart them.'
    type: 'CustomRole'
    assignableScopes: [
      assignableScope
    ]
    permissions: [
      {
        actions: [
          'Microsoft.Compute/virtualMachines/read'
          'Microsoft.Compute/virtualMachines/restart/action'
        ]
        notActions: []
        dataActions: []
        notDataActions: []
      }
    ]
  }
}
```

> **Limites:** Cada tenant do Microsoft Entra ID pode ter até 5.000 custom roles. Custom roles podem ter escopo em management groups — use isso para compartilhar uma função entre múltiplas subscriptions.

---

## Melhores Práticas

1. **Aplique o princípio do menor privilégio** — atribua apenas as permissões necessárias para a tarefa. Evite Owner ou Contributor quando uma função mais restrita existir.

2. **Use grupos do Microsoft Entra ID, não atribuições individuais** — atribua funções a grupos e gerencie a associação. Isso escala melhor e é muito mais fácil de auditar.

3. **Evite Owner no escopo da subscription** — Owner inclui acesso total *mais* a capacidade de atribuir funções a outros. Reserve para contas break-glass apenas.

4. **Use Privileged Identity Management (PIM) para acesso elevado** — em vez de atribuições privilegiadas permanentes, use PIM para habilitar ativação just-in-time com fluxos de aprovação e acesso com tempo limitado. Veja o [Capítulo 7 — Microsoft Entra ID Governance](ch07-entra-id-governance.md) para um aprofundamento.

5. **Revise atribuições regularmente** — atribuições obsoletas são um risco de governança. Combine RBAC com Access Reviews (também no [Capítulo 7](ch07-entra-id-governance.md)) para automatizar revisões periódicas.

6. **Defina escopos de atribuição o mais restrito possível** — prefira atribuições com escopo de resource group ou recurso em vez de atribuições no nível da subscription.

7. **Utilize deny assignments quando necessário** — Azure Blueprints (descontinuado, EOL julho 2026) e Deployment Stacks podem criar deny assignments que bloqueiam ações específicas, mesmo para Owners.

8. **Audite com Azure Activity Log e Resource Graph** — use operações de `Microsoft.Authorization/roleAssignments` no Activity Log e consulte atribuições de função em escala com o Azure Resource Graph.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | Correção |
|-----------|-------------------|----------|
| Atribuir Owner no escopo da subscription "só para desbloquear o time" | Qualquer pessoa com Owner pode conceder a si mesma — ou a outros — qualquer permissão. | Use Contributor + uma custom role restrita para a lacuna específica. |
| Atribuir funções a usuários individuais | Difícil de auditar, inconsistente quando pessoas mudam de equipe. | Sempre atribua a grupos do Microsoft Entra ID. |
| Ignorar atribuições herdadas | Uma função ampla no management group se propaga para todos os níveis abaixo. | Revise periodicamente o acesso efetivo com `az role assignment list`. |
| Criar custom roles demais | Cada tenant pode ter até 5.000, mas gerenciar centenas é doloroso. | Avalie built-in roles primeiro; use condições ABAC antes de criar novas funções. |
| Esquecer funções do plano de dados | Contributor no plano de controle **não** concede acesso ao plano de dados (ex.: leitura de blobs). | Atribua a função de plano de dados apropriada (ex.: *Storage Blob Data Reader*). |

---

## Exemplos de Código

### Atribuir uma built-in role via Azure CLI

O comando a seguir atribui a função **Reader** a um grupo do Microsoft Entra ID em um resource group:

```bash
# Assign the "Reader" role to a group at a resource group scope
az role assignment create \
  --assignee-object-id "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" \
  --assignee-principal-type Group \
  --role "Reader" \
  --scope "/subscriptions/<subscription-id>/resourceGroups/<rg-name>"
```

> **Dica:** Sempre especifique `--assignee-principal-type` para evitar buscas ambíguas e acelerar a criação da atribuição.

### Listar todas as atribuições de função em uma subscription

```bash
az role assignment list \
  --subscription "<subscription-id>" \
  --output table
```

### Consultar atribuições de função em escala com Azure Resource Graph

```kusto
authorizationresources
| where type == "microsoft.authorization/roleassignments"
| extend roleDefinitionId = tostring(properties.roleDefinitionId)
| extend principalId = tostring(properties.principalId)
| extend scope = tostring(properties.scope)
| project roleDefinitionId, principalId, scope
```

---

## Referências

- [Visão geral do Azure RBAC](https://learn.microsoft.com/azure/role-based-access-control/overview)
- [Funções internas do Azure](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles)
- [Custom roles para recursos do Azure](https://learn.microsoft.com/azure/role-based-access-control/custom-roles)
- [Condições ABAC no Azure RBAC](https://learn.microsoft.com/azure/role-based-access-control/conditions-overview)
- [Gerenciar acesso com Azure RBAC (treinamento Microsoft Learn)](https://learn.microsoft.com/training/modules/manage-subscription-access-azure-rbac/)
- [Privileged Identity Management — Capítulo 7](ch07-entra-id-governance.md)

---

Anterior | Próximo
:--- | :---
[Parte 1 — Fundamentos](../part-1-foundations/ch01-why-governance-matters.md) | [Capítulo 7 — Microsoft Entra ID Governance](ch07-entra-id-governance.md)
