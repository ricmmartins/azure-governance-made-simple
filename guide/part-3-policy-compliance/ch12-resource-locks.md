# Capítulo 12 — Resource Locks

> Last verified: 2026-04-06

Resource Locks são um mecanismo de governança simples, mas poderoso, que previne a exclusão ou modificação acidental de recursos críticos do Azure. Quando erros humanos ou falhas de automação podem custar horas de indisponibilidade ou perda de dados, um lock bem posicionado é sua última linha de defesa.

---

## Visão Geral

Os Azure Resource Locks permitem que você coloque uma restrição em recursos do Azure que substitui quaisquer permissões RBAC que um usuário possa ter. Mesmo um Owner de uma assinatura não pode excluir um recurso que possui um lock **CanNotDelete** — ele deve primeiro remover o lock.

Existem dois tipos de lock:

| Tipo de Lock | Efeito |
|-------------|--------|
| **CanNotDelete** (Delete) | Usuários autorizados podem ler e modificar o recurso, mas não podem excluí-lo. |
| **ReadOnly** | Usuários autorizados podem ler o recurso, mas não podem modificá-lo ou excluí-lo. Equivalente a conceder a todos os usuários o role Reader para aquele recurso. |

### Herança de Lock

Quando você aplica um lock em um escopo pai, todos os recursos dentro desse escopo herdam o lock. Recursos adicionados posteriormente também herdam o lock do pai. O lock mais restritivo na cadeia de herança tem precedência.

Por exemplo, um lock **ReadOnly** em um grupo de recursos se aplica a todos os recursos naquele grupo — mesmo que recursos individuais não tenham seus próprios locks.

---

## Como Funciona

### Plano de Gerenciamento vs. Plano de Dados

Resource Manager locks se aplicam apenas a operações no **plano de gerenciamento** — ou seja, operações enviadas para `https://management.azure.com`. Locks **não** restringem como os recursos executam suas próprias funções de plano de dados.

| Cenário | Bloqueado? |
|---------|-----------|
| Excluir um Azure SQL Database | ✅ Bloqueado por lock CanNotDelete |
| Modificar configuração do SQL Database (camada, tamanho) | ✅ Bloqueado por lock ReadOnly |
| Inserir, atualizar ou excluir linhas no banco de dados | ❌ Não bloqueado (operação de plano de dados) |
| Excluir uma Storage Account | ✅ Bloqueado por lock CanNotDelete |
| Fazer upload ou excluir blobs na conta de armazenamento | ❌ Não bloqueado (operação de plano de dados) |
| Listar chaves da conta de armazenamento | ✅ Bloqueado por lock ReadOnly (operação POST no plano de gerenciamento) |

Essa distinção é crítica: **locks protegem o recurso em si, não os dados dentro dele.** A segurança do plano de dados requer RBAC, regras de rede e criptografia.

### Armadilhas do Lock ReadOnly

Aplicar um lock **ReadOnly** pode levar a resultados inesperados porque algumas operações que parecem ser somente leitura na verdade requerem acesso de escrita no plano de gerenciamento:

- **Listagem de chaves da conta de armazenamento** — Um lock ReadOnly em uma conta de armazenamento impede todos os usuários de listar chaves, porque a operação list-keys é uma requisição POST que retorna valores disponíveis para operações de escrita.

- **Deploy do App Service** — Um lock ReadOnly em um recurso App Service impede o console Kudu e operações de deploy de funcionar, porque o deploy requer acesso de escrita à configuração do site.

- **Reinício de Máquina Virtual** — Um lock ReadOnly impede reiniciar uma VM porque a operação de reinício é uma ação POST no plano de gerenciamento.

- **Atualizações de tags de recurso** — Tags são propriedades do plano de gerenciamento. Um lock ReadOnly impede qualquer modificação de tags, o que pode quebrar automação baseada em tags ou workflows de alocação de custos.

---

## Resource Locks vs. Configurações de Deny do Deployment Stack

Azure Deployment Stacks fornecem um mecanismo alternativo para proteger recursos através de **configurações de deny**. Veja como os dois se comparam:

| Aspecto | Resource Locks | Configurações de Deny do Deployment Stack |
|---------|---------------|-------------------------------------------|
| **Escopo** | Qualquer recurso, grupo de recursos ou assinatura | Recursos gerenciados pelo deployment stack |
| **Granularidade** | CanNotDelete ou ReadOnly em qualquer recurso | DenyDelete, DenyWriteAndDelete em recursos gerenciados pelo stack |
| **Bypass** | Deve remover o lock (requer permissão `Microsoft.Authorization/locks/delete`) | Principals e ações de exclusão configuráveis |
| **Ciclo de vida** | Independente do deploy — deve ser gerenciado separadamente | Vinculado ao ciclo de vida do deployment stack |
| **Proteção contra drift** | Não — locks não detectam ou previnem drift de configuração | Sim — configurações de deny previnem modificações fora de banda em recursos gerenciados pelo stack |
| **Limpeza** | Locks permanecem mesmo se o recurso for órfão do IaC | Exclusão do stack pode limpar automaticamente recursos gerenciados |
| **Caso de uso** | Proteger recursos compartilhados críticos (hub VNet, zonas DNS, Key Vaults) | Proteger ambientes gerenciados por IaC contra mudanças manuais |
| **Complexidade** | Simples — uma chamada de API para criar um lock | Requer adoção de Deployment Stacks como modelo de deploy |

**Recomendação:** Use Resource Locks para recursos de infraestrutura críticos que nunca devem ser excluídos independentemente de quem os gerencia. Use configurações de deny do Deployment Stack quando quiser impor disciplina de infraestrutura como código e prevenir drift em ambientes implantados.

---

## Melhores Práticas

1. **Proteja infraestrutura compartilhada de produção com lock** — Aplique locks CanNotDelete em recursos compartilhados entre equipes e caros de recriar: redes virtuais hub, zonas DNS, circuitos ExpressRoute, workspaces Log Analytics, Key Vaults.

2. **Use CanNotDelete em vez de ReadOnly** — Locks ReadOnly são muito restritivos e frequentemente causam problemas inesperados. Prefira CanNotDelete a menos que tenha uma necessidade específica de prevenir todas as modificações.

3. **Aplique lock no nível do recurso, não do grupo de recursos** — Bloquear um grupo de recursos inteiro previne exclusão de qualquer recurso no grupo, o que pode interferir com operações normais como escalonamento ou atualização de recursos individuais.

4. **Automatize a criação de locks** — Inclua a criação de locks nos seus templates IaC (Bicep, Terraform, ARM) para que locks sejam aplicados consistente e automaticamente.

5. **Documente a propriedade do lock** — Mantenha um registro de quem criou cada lock e por quê. Isso previne "locks órfãos" onde ninguém lembra por que o lock existe ou se sente autorizado a removê-lo.

6. **Revise locks periodicamente** — Locks em recursos descomissionados desperdiçam tempo e causam confusão. Inclua revisão de locks nas suas auditorias periódicas de governança.

7. **Use Azure Policy para aplicar locks** — Crie uma policy `DeployIfNotExists` que automaticamente cria locks CanNotDelete em tipos de recursos críticos (ex.: todos os Key Vaults, todas as redes virtuais).

---

## Armadilhas Comuns

1. **Locks bloqueando auto-scaling** — Um lock CanNotDelete em um Virtual Machine Scale Set não previne escalonamento na maioria dos casos, mas um lock ReadOnly bloqueará operações de escala porque elas modificam o recurso. Um lock ReadOnly em um App Service Plan impedirá escalar o plano para cima ou para fora.

2. **Locks bloqueando rotação de certificados** — Um lock ReadOnly em um Key Vault impede o upload de novas versões de certificados. Se sua automação de rotação de certificados falhar silenciosamente devido a um lock, você pode não descobrir o problema até que o certificado expire e sua aplicação fique indisponível.

3. **Locks prevenindo exclusão de grupo de recursos** — Um lock CanNotDelete em qualquer recurso dentro de um grupo de recursos impede que o grupo de recursos inteiro seja excluído. Isso é por design (excluir um grupo de recursos exclui todos os seus recursos), mas surpreende equipes tentando limpar ambientes.

4. **Locks interferindo com pipelines CI/CD** — Pipelines de deploy que excluem e recriam recursos falharão se esses recursos estiverem com lock. Projete seus pipelines para usar deploys incrementais em vez de padrões de delete-and-replace.

5. **Locks não protegendo dados** — Equipes às vezes assumem que um lock CanNotDelete em uma conta de armazenamento protege os dados dentro dela. Não protege — qualquer pessoa com acesso ao plano de dados ainda pode excluir blobs, tabelas ou filas.

6. **Esquecer de aplicar lock em recursos dependentes** — Aplicar lock em um banco de dados mas não no seu servidor, ou lock em uma VM mas não no seu disco de SO, deixa lacunas na proteção. Identifique todos os recursos dependentes e aplique lock neles juntos.

7. **Locks ReadOnly quebrando diagnósticos** — Um lock ReadOnly em um recurso pode impedir o Azure Monitor de atualizar configurações de diagnóstico, o que pode quebrar silenciosamente a coleta de logs.

---

## Exemplos de Código

### Azure CLI: Criar um Lock CanNotDelete

```bash
# Criar um lock CanNotDelete em um grupo de recursos
az lock create \
  --name "protect-production" \
  --resource-group "prod-networking-rg" \
  --lock-type CanNotDelete \
  --notes "Protects production networking resources. Contact: platform-team@contoso.com"

# Criar um lock CanNotDelete em um recurso específico
az lock create \
  --name "protect-keyvault" \
  --resource-group "prod-security-rg" \
  --resource-type "Microsoft.KeyVault/vaults" \
  --resource "prod-keyvault" \
  --lock-type CanNotDelete \
  --notes "Protects production Key Vault. Do not remove without approval."
```

### Azure CLI: Criar um Lock ReadOnly

```bash
# Criar um lock ReadOnly em uma rede virtual
az lock create \
  --name "readonly-hub-vnet" \
  --resource-group "prod-networking-rg" \
  --resource-type "Microsoft.Network/virtualNetworks" \
  --resource "hub-vnet" \
  --lock-type ReadOnly \
  --notes "Prevents modification of hub virtual network configuration."
```

### Azure CLI: Listar e Excluir Locks

```bash
# Listar todos os locks em um grupo de recursos
az lock list --resource-group "prod-networking-rg" --output table

# Excluir um lock por nome
az lock delete \
  --name "protect-production" \
  --resource-group "prod-networking-rg"
```

### Bicep: Criar um Lock CanNotDelete em um Key Vault

```bicep
@description('The name of the Key Vault to protect.')
param keyVaultName string

@description('The location for the Key Vault.')
param location string = resourceGroup().location

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enableSoftDelete: true
    enablePurgeProtection: true
  }
}

resource keyVaultLock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protect-keyvault'
  scope: keyVault
  properties: {
    level: 'CanNotDelete'
    notes: 'Protects production Key Vault from accidental deletion.'
  }
}
```

### Bicep: Criar Locks em Múltiplos Recursos Críticos

```bicep
@description('The name of the virtual network to protect.')
param vnetName string

@description('The name of the Log Analytics workspace to protect.')
param lawName string

param location string = resourceGroup().location

resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
  }
}

resource vnetLock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protect-vnet'
  scope: vnet
  properties: {
    level: 'CanNotDelete'
    notes: 'Protects hub virtual network from accidental deletion.'
  }
}

resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: lawName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 365
  }
}

resource lawLock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protect-law'
  scope: law
  properties: {
    level: 'CanNotDelete'
    notes: 'Protects Log Analytics workspace from accidental deletion.'
  }
}
```

### Azure Policy: Implantar Locks Automaticamente em Key Vaults

```json
{
  "properties": {
    "displayName": "Deploy CanNotDelete lock on Key Vaults",
    "description": "Automatically creates a CanNotDelete lock on all Key Vault resources.",
    "policyType": "Custom",
    "mode": "Indexed",
    "policyRule": {
      "if": {
        "field": "type",
        "equals": "Microsoft.KeyVault/vaults"
      },
      "then": {
        "effect": "DeployIfNotExists",
        "details": {
          "type": "Microsoft.Authorization/locks",
          "existenceCondition": {
            "field": "Microsoft.Authorization/locks/level",
            "equals": "CanNotDelete"
          },
          "roleDefinitionIds": [
            "/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635"
          ],
          "deployment": {
            "properties": {
              "mode": "incremental",
              "template": {
                "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                  "vaultName": { "type": "string" }
                },
                "resources": [
                  {
                    "type": "Microsoft.KeyVault/vaults/providers/locks",
                    "apiVersion": "2020-05-01",
                    "name": "[concat(parameters('vaultName'), '/Microsoft.Authorization/auto-lock')]",
                    "properties": {
                      "level": "CanNotDelete",
                      "notes": "Auto-applied by Azure Policy to protect Key Vaults."
                    }
                  }
                ]
              },
              "parameters": {
                "vaultName": { "value": "[field('name')]" }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Referências

- [Bloquear recursos para prevenir mudanças inesperadas](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources)
- [Azure Deployment Stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks)
- [Referência Bicep Microsoft.Authorization/locks](https://learn.microsoft.com/en-us/azure/templates/microsoft.authorization/locks)
- [Referência CLI az lock](https://learn.microsoft.com/en-us/cli/azure/lock)
- [Plano de gerenciamento e plano de dados](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/control-plane-and-data-plane)

---

Anterior | Próximo
:--- | :---
[Capítulo 11 — Microsoft Defender for Cloud](/guide/part-3-policy-compliance/ch11-defender-for-cloud.md) | [Capítulo 13 — Bicep & AVM](/guide/part-4-iac-deployment/ch13-bicep-avm.md)
