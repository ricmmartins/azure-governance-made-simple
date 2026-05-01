# Capítulo 5 — Estratégia de Nomenclatura e Etiquetagem

> **Last verified: 2026-04-06**

---

## Visão Geral

Convenções de nomenclatura e estratégias de etiquetagem são dois dos controles de governança mais impactantes que você pode implementar — e dois dos mais frequentemente negligenciados. Sem eles, seu ambiente Azure se torna uma coleção ingerenciável de recursos com nomes crípticos sem nenhuma forma de determinar quem os possui, quanto custam ou qual aplicação suportam.

Este capítulo cobre ambos os tópicos juntos porque são complementares:

- **Convenções de nomenclatura** tornam os recursos identificáveis à primeira vista.
- **Tags** adicionam metadados estruturados para alocação de custos, automação, conformidade e operações.

Juntos, eles formam a **espinha dorsal organizacional** da sua estratégia de governança.

---

## Arquitetura: Como Nomenclatura e Etiquetagem se Encaixam na Governança

![Arquitetura de Nomenclatura e Etiquetagem](/images/naming-tagging-architecture.svg)

---

## Parte 1 — Convenções de Nomenclatura

### Por Que a Nomenclatura É Importante

Em um ambiente bem governado, você deve ser capaz de olhar para o nome de um recurso e imediatamente entender:

- **Que tipo de recurso** é (VM, storage account, key vault)
- **A qual carga de trabalho** pertence (payments, CRM, data-platform)
- **Em qual ambiente** está (produção, staging, desenvolvimento)
- **Em qual região** está implantado (westeurope, eastus2)

Sem uma convenção de nomenclatura, você acaba com recursos nomeados `myvm1`, `test-storage` ou `prod2-backup-old-DONOT-DELETE` — nomes que não transmitem informação útil e tornam a governança impossível em escala.

### Padrão de Convenção de Nomenclatura Recomendado

O Cloud Adoption Framework recomenda o seguinte padrão:

```
{resource-type}-{workload}-{environment}-{region}-{instance}
```

**Exemplos:**

| Recurso | Nome |
|---|---|
| Resource group | `rg-payments-prod-westeu` |
| Máquina virtual | `vm-payments-prod-westeu-001` |
| Storage account | `stpaymentsprodwesteu001` (sem hífens — restrição de storage account) |
| Key vault | `kv-payments-prod-westeu` |
| Virtual network | `vnet-payments-prod-westeu` |
| Network security group | `nsg-payments-prod-westeu` |
| App Service | `app-payments-prod-westeu` |
| SQL Database | `sql-payments-prod-westeu` |
| Log Analytics workspace | `log-payments-prod-westeu` |

### Abreviações Comuns de Recursos do Azure

Use estas abreviações padronizadas como o prefixo `{resource-type}`. Este é um subconjunto da [lista completa de abreviações do CAF](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations):

| Tipo de Recurso | Abreviação | Exemplo |
|---|---|---|
| Resource group | `rg` | `rg-payments-prod-westeu` |
| Máquina virtual | `vm` | `vm-web-prod-eastus2-001` |
| Storage account | `st` | `stwebprodeastus2001` |
| Key vault | `kv` | `kv-web-prod-eastus2` |
| Virtual network | `vnet` | `vnet-hub-prod-westeu` |
| Subnet | `snet` | `snet-app-prod-westeu` |
| Network security group | `nsg` | `nsg-app-prod-westeu` |
| Endereço IP público | `pip` | `pip-fw-prod-westeu` |
| Load balancer | `lb` | `lb-web-prod-westeu` |
| Application Gateway | `agw` | `agw-web-prod-westeu` |
| Azure Firewall | `afw` | `afw-hub-prod-westeu` |
| App Service / Web App | `app` | `app-api-prod-westeu` |
| Function App | `func` | `func-processor-prod-westeu` |
| Azure SQL Database | `sql` | `sql-orders-prod-westeu` |
| Azure Cosmos DB | `cosmos` | `cosmos-catalog-prod-westeu` |
| Azure Container Registry | `acr` | `acrprodwesteu001` |
| Azure Kubernetes Service | `aks` | `aks-platform-prod-westeu` |
| Log Analytics workspace | `log` | `log-central-prod-westeu` |
| Application Insights | `appi` | `appi-web-prod-westeu` |
| Managed identity | `id` | `id-app-prod-westeu` |
| Definição de Azure Policy | `policy` | `policy-require-tags` |
| Management group | `mg` | `mg-landingzones` |
| Assinatura | `sub` | `sub-payments-prod` |

### Restrições de Nomenclatura

Os recursos do Azure têm diferentes restrições de nomenclatura. Esteja ciente de:

| Recurso | Comprimento Máximo | Caracteres Permitidos | Unicidade Global |
|---|---|---|---|
| Resource group | 90 | Alfanumérico, hífen, sublinhado, ponto, parêntesis | Único dentro da assinatura |
| Storage account | 24 | Apenas alfanumérico minúsculo (sem hífens) | Globalmente único |
| Key vault | 24 | Alfanumérico e hífens | Globalmente único |
| Máquina virtual | 64 (Linux), 15 (Windows) | Alfanumérico, hífen, sublinhado | Único dentro do resource group |
| App Service | 60 | Alfanumérico e hífens | Globalmente único |

> **Dica:** Para recursos que requerem unicidade global (storage accounts, key vaults, App Services), adicione um sufixo numérico de instância ou hash para garantir unicidade.

### Abreviações de Ambiente

| Ambiente | Abreviação |
|---|---|
| Produção | `prod` |
| Staging | `stag` |
| Desenvolvimento | `dev` |
| Teste | `test` |
| Sandbox | `sbx` |
| Serviços compartilhados | `shared` |

### Abreviações de Região

Use abreviações curtas e reconhecíveis para regiões do Azure:

| Região | Abreviação |
|---|---|
| West Europe | `westeu` |
| North Europe | `northeu` |
| East US | `eastus` |
| East US 2 | `eastus2` |
| West US 2 | `westus2` |
| Southeast Asia | `southeastasia` |
| UK South | `uksouth` |

---

## Parte 2 — Estratégia de Etiquetagem

### Por Que as Tags São Importantes

Tags são pares de metadados chave-valor aplicados a recursos e resource groups do Azure. Elas permitem:

- **Alocação de custos:** Qual departamento ou projeto é responsável por este gasto?
- **Automação:** Quais recursos devem ser desligados à noite? Quais devem ter backup?
- **Operações:** Quem é o proprietário deste recurso? Qual SLA ele requer?
- **Conformidade:** Este recurso está sujeito ao GDPR? PCI-DSS?
- **Gerenciamento de ciclo de vida:** Quando este recurso foi criado? Quando deve ser revisado?

Tags são aplicadas a **recursos e resource groups**, mas tags em um resource group **não** são automaticamente herdadas pelos recursos dentro dele. Use Azure Policy para propagar tags de resource groups para recursos (veja o exemplo de código abaixo).

### Taxonomia Mínima de Tags Recomendada

Toda organização deve definir um **conjunto mínimo de tags obrigatórias**. Comece com estas e expanda conforme as necessidades amadurecem:

| Nome da Tag | Propósito | Exemplo de Valor | Obrigatória? |
|---|---|---|---|
| `Environment` | Identifica o ambiente de implantação | `prod`, `dev`, `test`, `stag` | ✅ Sim |
| `Owner` | Contato do recurso (email ou nome da equipe) | `payments-team@contoso.com` | ✅ Sim |
| `CostCenter` | Mapeia gastos para um centro de custo financeiro | `CC-4521` | ✅ Sim |
| `Application` | Identifica o nome da carga de trabalho ou aplicação | `payments-api` | ✅ Sim |
| `CreatedBy` | Como o recurso foi criado | `bicep-pipeline`, `manual`, `terraform` | ✅ Sim |
| `CreatedDate` | Data de criação do recurso (ISO 8601) | `2026-04-06` | 🟡 Recomendada |
| `Criticality` | Nível de criticidade para o negócio | `high`, `medium`, `low` | 🟡 Recomendada |
| `DataClassification` | Sensibilidade dos dados armazenados | `public`, `internal`, `confidential` | 🟡 Recomendada |
| `ExpirationDate` | Quando o recurso deve ser revisado ou descomissionado | `2026-12-31` | 🟡 Recomendada |
| `AutoShutdown` | Se o recurso deve ser parado fora do horário comercial | `true`, `false` | 🟡 Recomendada |

### Limites de Tags

- Máximo de **50 tags** por recurso ou resource group.
- Nome da tag: máximo de **512 caracteres** (128 para storage accounts).
- Valor da tag: máximo de **256 caracteres**.
- Nomes de tags são **insensíveis a maiúsculas/minúsculas** para operações, mas **preservam maiúsculas/minúsculas** no armazenamento.

---

## Como Funciona: Aplicação via Azure Policy

Convenções de nomenclatura e tags só são úteis se forem **aplicadas**. O Azure Policy é o mecanismo principal de aplicação.

### Modos de Aplicação de Política

| Efeito | Comportamento |
|---|---|
| `deny` | Previne criação de recurso se a condição for atendida (ex.: tag obrigatória ausente) |
| `audit` | Permite a criação mas sinaliza não-conformidade no dashboard de conformidade |
| `modify` | Adiciona ou corrige automaticamente valores de tags durante a implantação |
| `append` | Adiciona uma tag se ela não existir (legado — prefira `modify`) |

---

## Melhores Práticas

1. **Defina padrões de nomenclatura e etiquetagem antes da sua primeira implantação.** A aplicação retroativa é dolorosa — é muito mais fácil começar certo do que corrigir depois.
2. **Use `deny` do Azure Policy para tags críticas.** Environment, Owner e CostCenter devem ser obrigatórias em todo resource group.
3. **Use `modify` do Azure Policy para herdar tags.** Copie automaticamente tags de resource groups para recursos para reduzir a carga de etiquetagem nos desenvolvedores.
4. **Documente suas convenções em um local central e acessível.** Uma wiki de governança ou README no seu repositório de IaC é ideal.
5. **Valide convenções de nomenclatura no CI/CD.** Capture violações de nomenclatura em verificações de pull request antes da implantação.
6. **Revise e atualize sua taxonomia de tags anualmente.** Conforme sua organização amadurece, suas necessidades de etiquetagem evoluirão.
7. **Use tags para automação.** Desligue VMs de não-produção à noite, identifique recursos para políticas de backup ou sinalize recursos para descomissionamento.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | O Que Fazer em Vez Disso |
|---|---|---|
| Sem convenção de nomenclatura | Recursos são não identificáveis; automação e consultas falham | Defina e aplique uma convenção antes da implantação |
| Muitas tags obrigatórias | Desenvolvedores resistem à governança e encontram soluções alternativas | Comece com 4–5 tags obrigatórias; expanda gradualmente |
| Assumir que tags do resource group são herdadas | Recursos acabam sem tags; alocação de custos quebra | Use Azure Policy para propagar tags |
| Capitalização inconsistente de tags | `Environment` vs `environment` vs `ENVIRONMENT` cria caos | Padronize em uma única convenção de capitalização (PascalCase é comum) |
| Tags sem proprietário de governança | Valores de tags divergem; tags "owner" apontam para pessoas que saíram da empresa | Atribua uma equipe de governança para revisar conformidade de tags trimestralmente |
| Convenção de nomenclatura muito longa | Atinge limites de caracteres em storage accounts, VMs | Use abreviações padrão; mantenha nomes concisos |

---

## Exemplos de Código

### Azure Policy — Exigir uma Tag em Resource Groups

Esta política **nega** a criação de um resource group se a tag especificada estiver ausente:

```json
{
  "properties": {
    "displayName": "Require a tag on resource groups",
    "description": "Enforces existence of a tag on resource groups.",
    "policyType": "Custom",
    "mode": "All",
    "parameters": {
      "tagName": {
        "type": "String",
        "metadata": {
          "displayName": "Tag Name",
          "description": "Name of the tag, such as 'Environment'"
        }
      }
    },
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Resources/subscriptions/resourceGroups"
          },
          {
            "field": "[concat('tags[', parameters('tagName'), ']')]",
            "exists": "false"
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

**Implantar com Azure CLI:**

```bash
# Create the policy definition
az policy definition create \
  --name "require-tag-on-rg" \
  --display-name "Require a tag on resource groups" \
  --rules '<paste policyRule JSON>' \
  --params '<paste parameters JSON>' \
  --mode All

# Assign it to require the "CostCenter" tag
az policy assignment create \
  --name "require-costcenter-tag" \
  --display-name "Require CostCenter tag on resource groups" \
  --policy "require-tag-on-rg" \
  --params '{"tagName": {"value": "CostCenter"}}' \
  --scope "/subscriptions/<subscription-id>"
```

### Azure Policy — Herdar uma Tag do Resource Group

Esta política usa o efeito `modify` para copiar automaticamente uma tag do resource group para recursos que não a possuem:

```json
{
  "properties": {
    "displayName": "Inherit a tag from the resource group",
    "description": "Adds the specified tag from the parent resource group when creating or updating any resource missing this tag.",
    "policyType": "Custom",
    "mode": "Indexed",
    "parameters": {
      "tagName": {
        "type": "String",
        "metadata": {
          "displayName": "Tag Name",
          "description": "Name of the tag to inherit, such as 'CostCenter'"
        }
      }
    },
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "[concat('tags[', parameters('tagName'), ']')]",
            "notEquals": "[resourceGroup().tags[parameters('tagName')]]"
          },
          {
            "value": "[resourceGroup().tags[parameters('tagName')]]",
            "notEquals": ""
          }
        ]
      },
      "then": {
        "effect": "modify",
        "details": {
          "roleDefinitionIds": [
            "/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
          ],
          "operations": [
            {
              "operation": "addOrReplace",
              "field": "[concat('tags[', parameters('tagName'), ']')]",
              "value": "[resourceGroup().tags[parameters('tagName')]]"
            }
          ]
        }
      }
    }
  }
}
```

### Azure Policy — Aplicar Convenção de Nomenclatura (Correspondência de Padrão)

Esta política nega recursos cujos nomes não correspondem a um padrão especificado. Usa a condição `like` com `*` como curinga de múltiplos caracteres para aplicar o padrão `vm-{workload}-{environment}-{region}-{instance}`:

```json
{
  "properties": {
    "displayName": "Enforce VM naming convention",
    "description": "Denies VMs that do not follow the naming pattern vm-{workload}-{environment}-{region}-{instance}.",
    "policyType": "Custom",
    "mode": "Indexed",
    "parameters": {},
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Compute/virtualMachines"
          },
          {
            "not": {
              "field": "name",
              "like": "vm-*-*-*-*"
            }
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

> **Nota:** A condição `match` usa `?` para uma única letra, `#` para um único dígito e `.` para qualquer caractere único. Para padrões de comprimento variável, use `like` com curingas `*` (como mostrado acima) ou valide nomenclatura em pipelines de CI/CD antes da implantação.

### Bicep — Implantar um Resource Group com Etiquetagem Completa

```bicep
targetScope = 'subscription'

param location string = 'westeurope'
param workload string = 'payments'
param environment string = 'prod'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${workload}-${environment}-${location}'
  location: location
  tags: {
    Environment: environment
    Owner: 'payments-team@contoso.com'
    CostCenter: 'CC-4521'
    Application: workload
    CreatedBy: 'bicep-pipeline'
    CreatedDate: '2026-04-06'
    Criticality: 'high'
    DataClassification: 'confidential'
  }
}
```

### Azure Resource Graph — Encontrar Recursos Sem Tags Obrigatórias

```kusto
resources
| where isnull(tags.Environment) or isnull(tags.Owner) or isnull(tags.CostCenter)
| project name, type, resourceGroup, subscriptionId,
    missingEnvironment = isnull(tags.Environment),
    missingOwner = isnull(tags.Owner),
    missingCostCenter = isnull(tags.CostCenter)
| order by type asc
```

---

## Exercício Prático

**Cenário:** Você está definindo os padrões de nomenclatura e etiquetagem para uma implantação greenfield do Azure.

1. **Defina uma convenção de nomenclatura** para sua organização usando o padrão `{resource-type}-{workload}-{environment}-{region}-{instance}`. Escreva 5 exemplos de nomes de recursos.
2. **Defina sua taxonomia mínima de tags obrigatórias.** Escolha 4–6 tags da tabela recomendada acima (ou defina as suas próprias).
3. **Crie uma Azure Policy** (JSON ou Bicep) que nega a criação de resource groups sem sua tag mais crítica (ex.: `CostCenter`).
4. **Crie uma Azure Policy** que herda a tag `Environment` de resource groups para recursos filhos usando o efeito `modify`.
5. **Implante ambas as políticas** em uma assinatura de teste e verifique que funcionam:
   - Tente criar um resource group sem a tag obrigatória (deve ser negado).
   - Crie um resource group com a tag `Environment`, depois crie um recurso dentro dele — verifique que a tag é herdada.
6. **Execute a consulta do Resource Graph** acima para encontrar recursos no seu ambiente que estão sem tags obrigatórias.

---

## Referências

| Recurso | Link |
|---|---|
| Convenções de nomenclatura do CAF | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming) |
| Abreviações de recursos do CAF | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) |
| Estratégia de etiquetagem do CAF | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging) |
| Melhores práticas de etiquetagem do CAF | [learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging) |
| Definições internas de Azure Policy para tags | [learn.microsoft.com/azure/governance/policy/samples/built-in-policies#tags](https://learn.microsoft.com/azure/governance/policy/samples/built-in-policies#tags) |
| Regras e restrições de nomenclatura do Azure | [learn.microsoft.com/azure/azure-resource-manager/management/resource-name-rules](https://learn.microsoft.com/azure/azure-resource-manager/management/resource-name-rules) |
| Estrutura de definição de regra de política | [learn.microsoft.com/azure/governance/policy/concepts/definition-structure-policy-rule](https://learn.microsoft.com/azure/governance/policy/concepts/definition-structure-policy-rule) |

---

| Anterior | Próximo |
|:---|:---|
| [Capítulo 4 — Hierarquia de Recursos](ch04-resource-hierarchy.md) | [Parte 2 — Identidade e Acesso](../part-2-identity-access/ch06-rbac.md) |
