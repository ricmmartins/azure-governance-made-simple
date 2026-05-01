# Apêndice C — Kit Inicial de Políticas

> Last verified: 2026-04-06

---

Uma lista curada de 30 definições de Azure Policy recomendadas para estabelecer uma baseline de governança. Todas as políticas listadas são built-in, salvo indicação contrária. Atribua-as no nível apropriado de management group usando modo Audit primeiro, depois mude para Deny ou DeployIfNotExists conforme sua organização amadurece.

> **Dica:** Policy IDs são estáveis em todos os tenants Azure. Use-os para referenciar políticas programaticamente em configurações Bicep, Terraform ou EPAC.

---

## Geral

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 1 | Allowed locations | `e56962a6-4747-49cd-b67b-bf8b01975c4c` | Deny | Restringe as regiões Azure onde recursos podem ser implantados |
| 2 | Allowed locations for resource groups | `e765b5de-1225-4ba3-bd56-1ac6695af988` | Deny | Restringe as regiões Azure onde resource groups podem ser criados |
| 3 | Not allowed resource types | `6c112d4e-5bc7-47ae-a041-ea2d9dccd749` | Deny | Bloqueia implantação de tipos de recurso específicos (ex.: recursos clássicos) |
| 4 | Allowed resource types | `a08ec900-254a-4555-9bf5-e42af04b5c5c` | Deny | Permite apenas tipos de recursos aprovados serem implantados |

---

## Tags

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 5 | Require a tag on resource groups | `96670d01-0a4d-4649-9c89-2d3abc0a5025` | Deny | Resource groups devem ter uma tag especificada |
| 6 | Require a tag on resources | `871b6d14-10aa-478d-b590-94f262ecfa99` | Deny | Recursos devem ter uma tag especificada |
| 7 | Inherit a tag from the resource group | `cd3aa116-8754-49c9-a813-ad46512ece54` | Modify | Recursos herdam uma tag especificada do seu resource group |
| 8 | Inherit a tag from the subscription | `b27a0cbd-a167-4571-a2ac-1f2bef19b462` | Modify | Recursos herdam uma tag especificada da sua subscription |

---

## Compute

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 9 | Audit VMs that do not use managed disks | `06a78e20-9358-41c9-923c-fb736d382a4d` | Audit | Identifica VMs ainda usando discos não gerenciados (clássicos) |
| 10 | Allowed virtual machine size SKUs | `cccc23c7-8427-4f53-ad12-b6a63eb452b3` | Deny | Restringe tamanhos de VM para controlar custos e prevenir deployments superdimensionados |
| 11 | Azure Backup should be enabled for Virtual Machines | `013e242c-8828-4970-87b3-ab247555486d` | Audit | Garante que VMs tenham Azure Backup configurado |
| 12 | Virtual machines should have the Guest Configuration extension | `ae89ebca-1c92-4898-ac2c-9f63decb045c` | Audit | Necessário para políticas de Azure Machine Configuration funcionarem |

---

## Rede

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 13 | Network interfaces should not have public IPs | `83a86a26-fd1f-447c-b59d-e51f44264114` | Deny | Impede NICs de terem endereços IP públicos diretamente anexados |
| 14 | Subnets should have a Network Security Group | `e71308d3-144b-4262-b144-efdc3cc90517` | Audit | Garante que todas as subnets tenham NSGs para filtragem de tráfego |
| 15 | Network Watcher should be enabled | `b6e2945c-0b7b-40f5-9233-7a5323b5cdc6` | Audit | Garante que Network Watcher está implantado em cada região |
| 16 | Web Application Firewall should be enabled for Application Gateway | `564feb30-bf6a-4854-b4bb-0d2d2d1e6c66` | Audit | Garante que WAF está habilitado nos Application Gateways |

---

## Storage

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 17 | Secure transfer to storage accounts should be enabled | `404c3081-a854-4457-ae30-26a93ef643f9` | Audit / Deny | Requer HTTPS para todo o tráfego de storage accounts |
| 18 | Storage accounts should restrict network access | `34c877ad-507e-4c82-993e-3452a6e0ad3c` | Audit | Garante que storage accounts não permitem acesso irrestrito de rede pública |
| 19 | Storage accounts should use customer-managed key for encryption | `6fac406b-40ca-413b-bf8e-0bf964659c25` | Audit | Audita storage accounts que não usam chaves de criptografia gerenciadas pelo cliente |
| 20 | Storage account public access should be disallowed | `4fa4b6c0-31ca-4c0d-b10d-24b96f62a751` | Deny | Impede acesso público a blobs em storage accounts |

---

## Segurança

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 21 | Microsoft Defender for Cloud should be enabled | `ac076320-ddcf-4066-b451-6154267e8ad2` | Audit | Garante que Defender for Cloud está habilitado nas subscriptions |
| 22 | Azure Key Vault should use RBAC authorization | `12451c01-ab15-41e8-9d64-9a636b34f218` | Audit | Garante que Key Vaults usam RBAC em vez de access policies |
| 23 | Key vaults should have soft delete enabled | `1e66c121-a66a-4b1f-9b83-0fd5c6a02e3f` | Audit / Deny | Previne exclusão permanente de segredos e chaves do Key Vault |
| 24 | SQL databases should have Transparent Data Encryption enabled | `86a912f6-9a06-4e26-b447-11b16ba8659f` | Audit | Garante que bancos de dados SQL criptografam dados em repouso com TDE |

---

## Identidade

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 25 | MFA should be enabled on accounts with owner permissions | `e3e008c3-56b9-4133-8fd7-d3347377893a` | Audit | Identifica owners de subscription sem MFA habilitado |
| 26 | There should be more than one owner assigned to a subscription | `09024ccc-0c5f-474e-9509-f8a3847b8e28` | Audit | Garante redundância para ownership de subscription |
| 27 | External accounts with owner permissions should be removed | `f8456c1c-aa66-4dfb-861a-25d127b775c9` | Audit | Identifica contas externas (convidados) com acesso owner |
| 28 | Managed identity should be used in function apps | `0da106f2-4ca3-48e8-bc85-c638fe6aea8f` | Audit | Garante que Azure Functions usam managed identity em vez de connection strings |

---

## Monitoramento

| # | Nome da Política | Policy ID | Efeito | Descrição |
|---|---|---|---|---|
| 29 | Azure Monitor Agent should be installed on virtual machines | `845857af-0333-4c5d-bbbc-6076697da122` | Audit | Garante que o Azure Monitor Agent está implantado para coleta de logs |
| 30 | Activity log should be retained for at least 365 days | `b02aacc0-b073-424e-8298-42b22829ee0a` | Audit | Garante que logs de atividade são retidos para fins de conformidade |

---

## Como Atribuir Essas Políticas

### Usando Azure CLI

```bash
# Assign a single policy at a management group scope
az policy assignment create \
  --name "require-environment-tag" \
  --display-name "Require Environment tag on resource groups" \
  --policy "96670d01-0a4d-4649-9c89-2d3abc0a5025" \
  --scope "/providers/Microsoft.Management/managementGroups/YOUR_MG_NAME" \
  --params '{"tagName": {"value": "Environment"}}' \
  --enforcement-mode "DoNotEnforce"  # Audit mode — use "Default" for enforcement
```

### Usando Bicep

```bicep
targetScope = 'managementGroup'

resource policyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'require-environment-tag'
  properties: {
    displayName: 'Require Environment tag on resource groups'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/96670d01-0a4d-4649-9c89-2d3abc0a5025'
    parameters: {
      tagName: {
        value: 'Environment'
      }
    }
    enforcementMode: 'DoNotEnforce' // Audit mode
  }
}
```

### Usando Enterprise Policy as Code (EPAC)

Para gerenciar todas as 30+ políticas em escala, consulte a [documentação do EPAC](https://github.com/Azure/enterprise-azure-policy-as-code) e o capítulo de Policy as Code (Capítulo 9, Seção 9.4).

---

## Estratégia de Atribuição Recomendada

| Fase | Políticas | Efeito | Escopo |
|---|---|---|---|
| **Fase 1 (Mês 1)** | #1, #5, #6, #17, #21 | Audit | Management group de nível superior |
| **Fase 2 (Mês 2)** | #7, #9, #13, #25, #29 | Audit / Modify | Management group de nível superior |
| **Fase 3 (Mês 3)** | Mudar Fase 1 para Deny/DINE | Deny / DINE | Management group de nível superior |
| **Fase 4 (Mês 4+)** | #3, #10, #14, #18, #20 | Deny | Management groups específicos |
| **Contínuo** | Todas as políticas restantes | Audit → Deny | Conforme necessidade |

---

| Anterior | Próximo |
|:---|:---|
| [Apêndice B — Árvores de Decisão](appendix-b-decision-trees.md) | [Apêndice D — Queries do Resource Graph](appendix-d-resource-graph-queries.md) |
