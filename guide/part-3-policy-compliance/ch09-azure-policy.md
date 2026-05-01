# Capítulo 9 — Azure Policy

> Last verified: 2026-04-06

Azure Policy é a espinha dorsal da governança no Azure. Ele permite definir padrões organizacionais, avaliar recursos quanto à conformidade e aplicar ou remediar configurações não conformes em escala. Seja para restringir em quais regiões as equipes podem implantar, garantir que todo recurso esteja tagueado ou configurar automaticamente configurações de diagnóstico, Azure Policy é o mecanismo que torna isso possível.

Este capítulo cobre o ciclo de vida completo do Azure Policy — desde conceitos fundamentais até padrões avançados como Policy as Code e remediação em escala.

---

## 9.1 Conceitos Fundamentais

### Definições de Policy

Uma **definição de policy** é um objeto JSON que descreve uma regra de negócio. Ela contém:

- **Condições** (`if`) — quais recursos a regra se aplica.
- **Efeito** (`then`) — o que acontece quando as condições são atendidas (ex.: deny, audit, modify).

Cada definição trata de uma preocupação específica — por exemplo, "contas de armazenamento devem usar HTTPS" ou "máquinas virtuais devem usar discos gerenciados."

```json
{
  "properties": {
    "displayName": "Require HTTPS on Storage Accounts",
    "policyType": "Custom",
    "mode": "Indexed",
    "description": "Ensures all storage accounts enforce HTTPS traffic only.",
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Storage/storageAccounts"
          },
          {
            "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly",
            "notEquals": true
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

### Iniciativas (Conjuntos de Policies)

Uma **iniciativa** (também chamada de **policy set**) agrupa múltiplas definições de policy em uma única unidade atribuível. Isso simplifica o gerenciamento quando você tem dezenas ou centenas de policies. Por exemplo, a iniciativa integrada **Microsoft Cloud Security Benchmark** agrupa centenas de policies relacionadas à segurança.

```json
{
  "properties": {
    "displayName": "Tagging Governance Initiative",
    "policyType": "Custom",
    "description": "Ensures all resources and resource groups have required tags.",
    "policyDefinitions": [
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/96670d01-0a4d-4649-9c89-2d3abc0a5025",
        "parameters": {
          "tagName": { "value": "CostCenter" }
        }
      },
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/ea3f2387-9b95-492a-a190-fcdc54f7b070",
        "parameters": {
          "tagName": { "value": "CostCenter" }
        }
      }
    ]
  }
}
```

### Atribuições

Uma **atribuição de policy** é o ato de vincular uma definição de policy ou iniciativa a um escopo. Uma atribuição especifica:

- **Escopo** — Onde a policy se aplica (grupo de gerenciamento, assinatura ou grupo de recursos).
- **Parâmetros** — Valores que personalizam o comportamento da policy.
- **Modo de aplicação** — Se a policy é ativamente aplicada (`Default`) ou apenas avaliada para conformidade (`DoNotEnforce`).
- **Mensagem de não conformidade** — Uma mensagem personalizada exibida quando uma implantação é negada.

### Escopos

As atribuições de policy seguem a hierarquia de recursos do Azure:

![Policy Scope Hierarchy](/images/policy-scope-hierarchy.svg)

Policies atribuídas em um escopo superior são **herdadas** por todos os escopos filhos. Uma policy atribuída a um grupo de gerenciamento se aplica a toda assinatura e grupo de recursos abaixo dele.

### Isenções

Uma **isenção de policy** exclui temporária ou permanentemente um recurso ou escopo específico de uma atribuição de policy. Isenções são úteis para:

- **Waiver** — O recurso intencionalmente não está em conformidade, e a organização aceitou o risco.
- **Mitigated** — A intenção da policy é satisfeita por outro mecanismo.

Isenções possuem uma data de expiração opcional e são rastreadas como recursos do Azure, então aparecem nos relatórios de conformidade.

### Policy vs. RBAC

Uma fonte comum de confusão:

| Aspecto | Azure Policy | Azure RBAC |
|---------|-------------|------------|
| **Propósito** | Quais propriedades os recursos podem ter | Quais ações os usuários podem executar |
| **Padrão** | Permitir (a menos que explicitamente negado) | Negar (a menos que explicitamente permitido) |
| **Escopo** | Propriedades e configurações de recursos | Permissões de usuário/grupo/service principal |
| **Avaliação** | Na criação do recurso e em um agendamento | Em cada chamada de API |
| **Exemplo** | "Todas as VMs devem usar discos gerenciados" | "Usuário X pode criar VMs" |

Ambos são necessários — RBAC controla **quem** pode agir, e Policy controla **o que** pode ser criado ou como os recursos devem ser configurados.

---

## 9.2 Efeitos de Policy e Ordem de Avaliação

### Efeitos

Azure Policy suporta os seguintes efeitos:

| Efeito | Descrição |
|--------|-----------|
| **Disabled** | A regra de policy não é avaliada. Útil para testes ou desativar temporariamente uma policy. |
| **Append** | Adiciona campos à solicitação do recurso. Comumente usado para adicionar tags ou regras de IP. |
| **Deny** | Bloqueia a solicitação do recurso antes que ela chegue ao provedor de recursos. |
| **Audit** | Cria um evento de alerta no log de atividades, mas não bloqueia a solicitação. |
| **AuditIfNotExists** | Audita quando um recurso relacionado não existe (ex.: configurações de diagnóstico estão ausentes). |
| **DeployIfNotExists** | Implanta um recurso relacionado quando um não existe (ex.: implantar automaticamente uma configuração de diagnóstico). Requer uma identidade gerenciada. |
| **Modify** | Adiciona, atualiza ou remove propriedades ou tags em um recurso durante a criação ou atualização. Requer uma identidade gerenciada. |
| **Manual** | O estado de conformidade é gerenciado pelo usuário, não avaliado automaticamente. Usado para policies onde a avaliação automatizada não é possível. |
| **Mutate** | Corrige configurações de recursos usando mutação durante o pipeline de requisição do ARM, permitindo que o Policy corrija requisições não conformes antes da implantação em vez de negá-las. |
| **DenyAction** | Bloqueia ações específicas em recursos (ex.: impedir exclusão). |

### Ordem de Avaliação

Solicitações para criar ou atualizar um recurso através do Azure Resource Manager são avaliadas pelo Policy antes de chegar ao provedor de recursos. O Policy cria uma lista de todas as atribuições que se aplicam ao recurso e avalia o recurso em relação a cada definição. O processamento dos efeitos antes de entregar a solicitação ao provedor de recursos evita processamento desnecessário para recursos que não atendem aos controles de governança.

A ordem de avaliação é:

1. **Disabled** — verificado primeiro para determinar se a regra de policy deve ser avaliada.

2. **Append / Modify / Mutate** — avaliados em seguida porque podem alterar a solicitação. Uma alteração feita pelo Append pode impedir que um efeito Audit ou Deny seja disparado. Modify e Mutate também alteram o payload do recurso antes de uma avaliação adicional.

3. **Deny / DenyAction** — avaliados em seguida. Ao avaliar Deny antes de Audit, evita-se o registro duplo de uma solicitação de recurso indesejada. DenyAction bloqueia operações específicas (como exclusão) em recursos existentes.

4. **Audit** — avaliado antes que a solicitação vá para o provedor de recursos. Audit cria um evento de alerta no log de atividades ao avaliar um recurso não conforme, mas não bloqueia a solicitação.

5. **AuditIfNotExists / DeployIfNotExists** — avaliados após o provedor de recursos retornar um código de sucesso, para determinar se registro adicional de conformidade ou ação de remediação é necessário.

   - **AuditIfNotExists** habilita auditoria em recursos que correspondem à condição `if`, mas não possuem os componentes especificados nos `details` da condição `then`.
   - **DeployIfNotExists** dispara uma implantação de template quando a condição é atendida.

6. **Manual** — a conformidade é determinada pelo usuário ou um processo externo, não pelo motor de policy.

### Entendendo os Modos de Policy

- **All** — Avalia todos os tipos de recursos. Usado para policies que verificam propriedades de grupos de recursos ou configurações em nível de assinatura.
- **Indexed** — Avalia apenas tipos de recursos que suportam tags e localizações. Este é o modo mais comum.
- **Microsoft.Kubernetes.Data** — Usado para policies de controle de admissão do Kubernetes.
- **Microsoft.Network.Data** — Usado para policies personalizadas de plano de dados de rede.

---

## 9.3 Azure Machine Configuration

### O Que É

**Azure Machine Configuration** estende o Azure Policy para dentro do sistema operacional executado em máquinas virtuais e servidores habilitados para Arc. Enquanto o Azure Policy padrão governa as propriedades dos recursos Azure no plano de gerenciamento, o Azure Machine Configuration pode auditar e aplicar configurações **dentro** das VMs — como software instalado, configurações do SO, chaves de registro, conteúdo de arquivos e estados de serviços.

### Como Funciona

O Azure Machine Configuration utiliza a seguinte arquitetura:

1. **Extensão Machine Configuration** — Uma extensão de VM instalada na máquina de destino que executa o agente de configuração.
2. **Pacotes de configuração** — Criados como documentos PowerShell DSC (Desired State Configuration). Cada pacote contém as regras a serem avaliadas.
3. **Integração com Azure Policy** — Pacotes do Machine Configuration são atribuídos a VMs através do Azure Policy, usando efeitos `AuditIfNotExists` ou `DeployIfNotExists`. Os resultados de conformidade retornam ao painel de conformidade do Azure Policy.

O fluxo de avaliação:

![Machine Configuration Flow](/images/machine-config-flow.svg)

### Policies Integradas do Machine Configuration

O Azure fornece muitas policies integradas do Machine Configuration, incluindo:

- Auditar máquinas Windows que não possuem os recursos Windows especificados instalados.
- Auditar máquinas Linux que possuem contas sem senhas.
- Auditar máquinas Windows que não restringem o comprimento mínimo da senha.
- Auditar máquinas Windows que não armazenam senhas usando criptografia reversível.
- Auditar máquinas Windows nas quais o agente Log Analytics não está conectado. *(Nota: O agente Log Analytics foi descontinuado em agosto de 2024. Esta policy é mantida para ambientes legados. Para novas implantações, use policies baseadas no Azure Monitor Agent.)*

### Configurações Personalizadas

Você pode criar pacotes personalizados do Machine Configuration para requisitos específicos da organização:

1. **Criar** uma configuração DSC em PowerShell.
2. **Compilar** e **empacotar** usando o módulo PowerShell `GuestConfiguration`.
3. **Publicar** o pacote em um blob do Azure Storage (ou outro URI acessível).
4. **Criar uma definição de policy** que referencia o pacote.
5. **Atribuir** a policy ao escopo de destino.

```powershell
# Exemplo: Criar um pacote personalizado de Machine Configuration
Install-Module -Name GuestConfiguration -Force

# Compilar a configuração DSC
. ./MyConfig.ps1
MyConfig -OutputPath ./compiled

# Criar o pacote
New-GuestConfigurationPackage `
  -Name 'AuditSecureBaseline' `
  -Configuration './compiled/localhost.mof' `
  -Type AuditAndSet `
  -Force
```

### Considerações Importantes

- O Machine Configuration requer que a **extensão Azure Machine Configuration** esteja instalada nas VMs de destino.
- Para servidores habilitados para Arc, a extensão é gerenciada automaticamente.
- O Machine Configuration suporta os modos **Audit** (somente relatório) e **AuditAndSet** (aplicar).
- Pacotes personalizados devem ser armazenados em um local acessível à VM (Azure Blob Storage com token SAS ou acesso por identidade gerenciada).

---

## 9.4 Policy as Code (EPAC & CI/CD)

### O Que Significa Policy as Code

**Policy as Code** é a prática de gerenciar definições, iniciativas, atribuições e isenções do Azure Policy como código-fonte versionado — assim como você gerenciaria código de aplicação ou infraestrutura como código. Esta abordagem fornece:

- **Histórico de versões** — Rastrear quem alterou o quê e quando.
- **Revisão por pares** — Alterações de policy passam por pull requests.
- **Testes automatizados** — Validar policies antes de implantar em produção.
- **Repetibilidade** — Aplicar as mesmas policies consistentemente entre ambientes.
- **Rollback** — Reverter para um estado anterior de policy se problemas forem descobertos.

### Enterprise Policy as Code (EPAC)

O framework **Enterprise Policy as Code (EPAC)** é um projeto open-source apoiado pela Microsoft que fornece uma abordagem estruturada para gerenciar Azure Policy em escala empresarial. O EPAC usa um formato declarativo baseado em JSON/CSV para definir o estado desejado de todas as policies em seu ambiente Azure.

Principais funcionalidades do EPAC:

- **Modelo de estado desejado** — Você declara quais policies, iniciativas, atribuições e isenções devem existir, e o EPAC calcula o delta.
- **Suporte multi-ambiente** — Gerenciar estates de policy de dev, test e produção a partir de um único repositório.
- **Estágios de plan e deploy** — Separar planejamento (what-if) de implantação para rollouts seguros.
- **Gerenciamento de isenções** — Rastrear e gerenciar isenções junto com definições de policy.
- **Gerenciamento de atribuição de roles** — Criar automaticamente as atribuições de role de identidade gerenciada requeridas pelas policies DeployIfNotExists e Modify.

Uma estrutura de definição de policy EPAC se parece com:

![EPAC Folder Structure](/images/epac-folder-structure.svg)

> **Referência:** [Enterprise Policy as Code (EPAC)](https://aka.ms/epac)

### Pipeline CI/CD para o Ciclo de Vida de Policy

Um pipeline robusto de Policy as Code segue este fluxo de trabalho:

![Policy Lifecycle](/images/policy-lifecycle.svg)

#### Estágio 1: Criar

Autores de policy criam ou modificam definições de policy, iniciativas e atribuições no repositório Git.

#### Estágio 2: Validar

Verificações de validação automatizadas:

```yaml
# Exemplo: Etapa de pipeline do Azure DevOps para validação EPAC
- task: PowerShell@2
  displayName: 'Build EPAC Deployment Plan'
  inputs:
    targetType: inline
    script: |
      Build-DeploymentPlans `
        -DefinitionsRootFolder "$(Build.SourcesDirectory)/Definitions" `
        -OutputFolder "$(Build.ArtifactStagingDirectory)/plans"
```

#### Estágio 3: Planejar

Gerar um plano de implantação mostrando o que mudará:

- Novas definições de policy a criar.
- Atribuições a atualizar.
- Recursos que se tornarão não conformes.

#### Estágio 4: Revisar

O plano é anexado ao pull request para revisão por pares. Os revisores verificam:

- A lógica da policy está correta.
- O escopo é apropriado (não muito amplo, não muito restrito).
- Isenções possuem justificativas documentadas.

#### Estágio 5: Implantar

Após a aprovação, o pipeline implanta as policies:

```powershell
# Implantação EPAC
Deploy-PolicyPlan `
  -InputFolder "./plans" `
  -DefaultContext $context
```

#### Estágio 6: Monitorar

Monitoramento pós-implantação:

- Verificar o painel de conformidade para não conformidades inesperadas.
- Revisar o Azure Activity Log para eventos de avaliação de policy.
- Configurar alertas para mudanças de estado de conformidade.

### Estratégias de Teste de Policy

**Auditar primeiro, depois Deny:**

A abordagem mais segura para rollout de policy é:

1. Implantar com efeito `Audit` ou modo de aplicação `DoNotEnforce`.
2. Aguardar um ciclo de avaliação de conformidade (tipicamente 24 horas para uma varredura completa).
3. Revisar quais recursos seriam afetados.
4. Comunicar às equipes afetadas.
5. Mudar para efeito `Deny` após as equipes terem remediado ou reconhecido.

```json
{
  "properties": {
    "displayName": "Require HTTPS on Storage - Audit First",
    "policyRule": {
      "if": {
        "allOf": [
          { "field": "type", "equals": "Microsoft.Storage/storageAccounts" },
          { "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly", "notEquals": true }
        ]
      },
      "then": {
        "effect": "[parameters('effect')]"
      }
    },
    "parameters": {
      "effect": {
        "type": "String",
        "defaultValue": "Audit",
        "allowedValues": ["Audit", "Deny", "Disabled"]
      }
    }
  }
}
```

### Gerenciamento de Isenções de Policy em Código

Isenções devem ser rastreadas no controle de versão junto com as policies:

```json
{
  "exemptions": [
    {
      "name": "ProjectX-Legacy-StorageExemption",
      "displayName": "Project X Legacy Storage Exemption",
      "description": "Legacy storage accounts used by Project X cannot enable HTTPS due to client library limitations. Migration planned for Q3 2026.",
      "policyAssignmentId": "/providers/Microsoft.Management/managementGroups/myorg/providers/Microsoft.Authorization/policyAssignments/require-https-storage",
      "exemptionCategory": "Waiver",
      "expiresOn": "2026-09-30T00:00:00Z",
      "metadata": {
        "approvedBy": "security-team@contoso.com",
        "ticketRef": "SEC-2026-0142"
      }
    }
  ]
}
```

### Fluxo de Trabalho de Gerenciamento de Policy Baseado em Git

![Git-Based Policy Management](/images/policy-git-branching.svg)

Cada pull request dispara:
1. Validação de schema do JSON de policy.
2. Geração de plano EPAC (what-if).
3. Plano publicado como comentário no PR para revisão.
4. No merge, pipeline de implantação executa automaticamente.

---

## 9.5 Remediação de Policy em Escala

### Tarefas de Remediação

Quando policies usam efeitos `DeployIfNotExists` ou `Modify`, recursos não conformes existentes não são automaticamente corrigidos. Você deve criar **tarefas de remediação** para trazer recursos existentes à conformidade.

Uma tarefa de remediação:
1. Identifica todos os recursos não conformes para uma determinada atribuição de policy.
2. Implanta o template de remediação (para DeployIfNotExists) ou aplica modificações (para Modify) em cada recurso.
3. Reporta progresso e resultados.

```bash
# Criar uma tarefa de remediação via Azure CLI
az policy remediation create \
  --name "remediate-diagnostics-settings" \
  --policy-assignment "/subscriptions/{sub-id}/providers/Microsoft.Authorization/policyAssignments/deploy-diag-settings" \
  --resource-group "my-resource-group"
```

### Remediação DeployIfNotExists

O efeito `DeployIfNotExists` é uma das ferramentas mais poderosas para governança em escala. Ele permite que o Policy implante automaticamente recursos complementares — como configurações de diagnóstico, endpoints privados ou configurações do Microsoft Defender for Cloud.

Exemplo: Implantar automaticamente configurações de diagnóstico para Key Vaults:

```json
{
  "properties": {
    "displayName": "Deploy diagnostic settings for Key Vault",
    "policyRule": {
      "if": {
        "field": "type",
        "equals": "Microsoft.KeyVault/vaults"
      },
      "then": {
        "effect": "DeployIfNotExists",
        "details": {
          "type": "Microsoft.Insights/diagnosticSettings",
          "existenceCondition": {
            "field": "Microsoft.Insights/diagnosticSettings/workspaceId",
            "equals": "[parameters('logAnalyticsWorkspaceId')]"
          },
          "roleDefinitionIds": [
            "/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
          ],
          "deployment": {
            "properties": {
              "mode": "incremental",
              "template": {
                "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                  "vaultName": { "type": "string" },
                  "logAnalyticsWorkspaceId": { "type": "string" }
                },
                "resources": [
                  {
                    "type": "Microsoft.KeyVault/vaults/providers/diagnosticSettings",
                    "apiVersion": "2021-05-01-preview",
                    "name": "[concat(parameters('vaultName'), '/Microsoft.Insights/setByPolicy')]",
                    "properties": {
                      "workspaceId": "[parameters('logAnalyticsWorkspaceId')]",
                      "logs": [
                        {
                          "categoryGroup": "allLogs",
                          "enabled": true
                        }
                      ],
                      "metrics": [
                        {
                          "category": "AllMetrics",
                          "enabled": true
                        }
                      ]
                    }
                  }
                ]
              },
              "parameters": {
                "vaultName": { "value": "[field('name')]" },
                "logAnalyticsWorkspaceId": { "value": "[parameters('logAnalyticsWorkspaceId')]" }
              }
            }
          }
        }
      }
    },
    "parameters": {
      "logAnalyticsWorkspaceId": {
        "type": "String",
        "metadata": {
          "displayName": "Log Analytics Workspace ID",
          "description": "The resource ID of the Log Analytics workspace."
        }
      }
    }
  }
}
```

### Estratégias de Remediação de Conformidade em Larga Escala

Ao remediar milhares de recursos:

1. **Priorizar por risco** — Remediar os recursos não conformes mais críticos primeiro (ex.: contas de armazenamento com acesso público antes de recursos internos de desenvolvimento).

2. **Agrupar tarefas de remediação em lotes** — O Azure Policy processa até 500 recursos por tarefa de remediação. Para estates maiores, crie múltiplas tarefas ou use o EPAC para gerenciar remediação sistematicamente.

3. **Monitorar progresso da remediação** — Use o Azure Resource Graph para consultar o status de remediação:

```kusto
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| summarize count() by tostring(properties.policyDefinitionName)
| order by count_ desc
```

4. **Remediação paralela** — Execute tarefas de remediação para diferentes atribuições de policy em paralelo. Evite executar múltiplas remediações nos mesmos recursos simultaneamente.

5. **Tratar falhas com elegância** — Algumas remediações falharão devido a bloqueios de recurso, permissões insuficientes ou restrições específicas do recurso. Revise operações de remediação falhas e resolva bloqueios individualmente.

### Práticas Seguras de Implantação para Rollout de Policy

Implantar mudanças de policy em escala requer cuidado:

1. **Usar modo DoNotEnforce** — Testar novas atribuições com aplicação desabilitada para ver o impacto na conformidade sem bloquear implantações.

2. **Implantação em anéis** — Aplicar policies progressivamente:
   - Anel 0: Assinaturas Sandbox/Dev.
   - Anel 1: Assinaturas Test/Staging.
   - Anel 2: Assinaturas de Produção (não críticas).
   - Anel 3: Assinaturas de Produção (críticas).

3. **Monitorar delta de conformidade** — Após cada implantação de anel, aguardar uma varredura de conformidade e revisar a mudança na porcentagem de conformidade.

4. **Ter um plano de rollback** — Manter o estado anterior de policy no controle de versão para poder reverter rapidamente se uma policy causar problemas.

5. **Comunicar amplamente** — Notificar equipes de desenvolvimento e operações antes de aplicar novas policies Deny, e fornecer orientação de remediação.

---

## 9.6 Policies Iniciais de Governança

Abaixo está um conjunto curado de 36 definições integradas de Azure Policy organizadas por categoria. Estas servem como um forte ponto de partida para qualquer organização estabelecendo governança no Azure.

> **Dica:** Se você habilitar a iniciativa integrada do Microsoft Defender for Cloud, verifique policies sobrepostas. Consulte as [definições integradas de Azure Policy para o Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/policy-reference) para a lista completa.

---

### ☑️ Computação

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 1 | **Allowed virtual machine size SKUs** — Restringe quais tamanhos de VM podem ser implantados, controlando custos e padronizando ambientes. | Deny | `cccc23c7-8427-4f53-ad12-b6a63eb452b3` |
| 2 | **Virtual machines should use managed disks** — Audita VMs que não usam discos gerenciados para maior confiabilidade e segurança. | Audit | `06a78e20-9358-41c9-923c-fb736d382a4d` |
| 3 | **Require automatic OS image patching on Virtual Machine Scale Sets** — Garante que instâncias de VMSS recebam patches automáticos de SO. | Deny | `465f0161-0087-490a-9ad9-ad6217f4f43a` |
| 4 | **Azure Machine Configuration extension should be installed on machines** — Garante que a extensão Machine Configuration esteja instalada para avaliação de policy in-guest. Mapeia para baselines CIS e NIST. | AuditIfNotExists | `ae89ebca-1c92-4898-ac2c-9f63decb045c` |

### ☑️ Geral

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 5 | **Allowed locations** — Restringe as localizações onde recursos podem ser implantados. Aplica requisitos de conformidade geográfica. | Deny | `e56962a6-4747-49cd-b67b-bf8b01975c4c` |
| 6 | **Allowed locations for resource groups** — Restringe onde grupos de recursos podem ser criados. | Deny | `e765b5de-1225-4ba3-bd56-1ac6695af988` |
| 7 | **Allowed resource types** — Especifica quais tipos de recursos podem ser implantados. Afeta apenas tipos que suportam tags e localizações. | Deny | `a08ec900-254a-4555-9bf5-e42af04b5c5c` |
| 8 | **Not allowed resource types** — Bloqueia tipos de recursos específicos de serem implantados. Reduz complexidade e superfície de ataque. | Deny | `6c112d4e-5bc7-47ae-a041-ea2d9dccd749` |
| 9 | **Audit resource location matches resource group location** — Audita se a localização do recurso corresponde à localização do grupo de recursos pai. | Audit | `0a914e76-4921-4c19-b460-a2d36003525a` |

### ☑️ Segurança

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 10 | **A maximum of 3 owners should be designated for your subscription** — Limita proprietários de assinatura para reduzir o raio de explosão de violações. Mapeia para NIST AC-6. | AuditIfNotExists | `4f11b553-d42e-4e3a-89be-32ca364cad4c` |
| 11 | **MFA should be enabled on accounts with owner permissions on your subscription** — Garante que MFA esteja habilitado para contas de proprietário para prevenir ataques baseados em credenciais. Mapeia para NIST IA-2, PCI-DSS 8.3. | AuditIfNotExists | `aa633080-8b72-40c4-a2d7-d00c03e80bed` |
| 12 | **Subscriptions should have a contact email address for security issues** — Garante que contatos de segurança recebam notificações do Microsoft Defender for Cloud. | AuditIfNotExists | `4f4f78b8-e367-4b10-a341-d9a4ad5cf1c7` |
| 13 | **There should be more than one owner assigned to your subscription** — Garante redundância de acesso administrativo para gerenciamento de assinatura. | AuditIfNotExists | `09024ccc-0c5f-475e-9457-b7c0d9ed487b` |
| 14 | **Audit usage of custom RBAC rules** — Audita roles RBAC personalizados em vez de roles integrados. Roles personalizados são propensos a erros e requerem modelagem de ameaças rigorosa. | Audit | `a451c1ef-c6ca-483d-87ed-f49761e3ffb5` |
| 15 | **Custom subscription owner roles should not exist** — Garante que nenhum role personalizado replique o role Owner no escopo da assinatura. | Audit | `10ee2ea2-fb4d-45b8-a7e9-a2e770044cd9` |
| 16 | **Microsoft Defender for Cloud should be enabled on your subscription** — Garante que o Defender for Cloud esteja habilitado para avaliação contínua de segurança. | AuditIfNotExists | `ac076320-ddcf-4066-b451-6154267e8ad2` |
| 17 | **Azure DDoS Protection should be enabled** — Garante que a DDoS Protection esteja habilitada em redes virtuais com recursos de acesso público. Mapeia para NIST SC-5. | AuditIfNotExists | `a7aca53f-2ed4-4466-a25e-0b45ade68efd` |

### ☑️ Tags

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 18 | **Require a tag on resource groups** — Exige que grupos de recursos tenham uma tag especificada. | Deny | `96670d01-0a4d-4649-9c89-2d3abc0a5025` |
| 19 | **Inherit a tag from the resource group if missing** — Adiciona uma tag especificada com seu valor do grupo de recursos pai quando um recurso é criado ou atualizado sem ela. | Modify | `ea3f2387-9b95-492a-a190-fcdc54f7b070` |
| 20 | **Require a tag and its value on resources** — Exige que recursos tenham uma tag específica com um valor específico. | Deny | `1e30110a-5ceb-460c-a204-c1c3969c6d62` |
| 21 | **Add a tag to resource groups** — Adiciona a tag e valor especificados quando qualquer grupo de recursos é criado ou atualizado sem esta tag. Grupos de recursos existentes podem ser remediados. | Modify | `49c88fc8-6fd1-46fd-a676-f12d1d3a4c71` |
| 22 | **Require a tag on resources** — Exige a existência de uma tag em todos os recursos. | Deny | `871b6d14-10aa-478d-b590-94f262ecfa99` |

### ☑️ Rede

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 23 | **Network interfaces should not have public IPs** — Impede que interfaces de rede sejam configuradas com endereços IP públicos. Reduz superfície de ataque. | Deny | `83a86a26-fd1f-447c-b59d-e51f44264114` |
| 24 | **Subnets should be associated with a Network Security Group** — Audita subnets que não estão associadas a um NSG para proteger tráfego com controles de acesso em nível de rede. Mapeia para CIS, NIST SC-7. | AuditIfNotExists | `e71308d3-144b-4262-b144-efdc3cc90517` |
| 25 | **Web Application Firewall (WAF) should be enabled for Application Gateway** — Garante que WAF esteja implantado em frente a aplicações web de acesso público. Mapeia para PCI-DSS 6.6. | Audit | `564feb30-bf6a-4854-b4bb-0d2d2d1e6c66` |
| 26 | **Network Watcher should be enabled** — Audita que o Network Watcher está habilitado nas regiões onde redes virtuais existem. | AuditIfNotExists | `b6e2945c-0b7b-40f5-9233-7a5323b5cdc6` |

### ☑️ Armazenamento

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 27 | **Storage accounts should restrict network access** — Audita contas de armazenamento que permitem acesso de todas as redes. Use regras de rede virtual ou regras de firewall baseadas em IP. Mapeia para CIS, NIST SC-7. | Audit | `34c877ad-507e-4c82-993e-3452a6e0ad3c` |
| 28 | **Secure transfer to storage accounts should be enabled** — Garante que contas de armazenamento aceitem apenas solicitações via HTTPS. Mapeia para CIS, NIST SC-8. | Audit/Deny | `404c3081-a854-4457-ae30-26a93ef643f9` |
| 29 | **Storage accounts should use customer-managed key for encryption** — Audita contas de armazenamento que não usam CMK para criptografia de dados em repouso. Mapeia para NIST SC-28. | Audit | `6fac406b-40ca-413b-bf8e-0bf964659c25` |
| 30 | **Storage accounts should prevent shared key access** — Requer autorização do Microsoft Entra ID em vez de chave compartilhada para acesso à conta de armazenamento. | Audit | `8c6a50c6-9ffd-4ae7-986f-5fa6111f9a54` |

### ☑️ Identidade

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 31 | **External accounts with owner permissions should be removed from your subscription** — Remove contas externas com role de proprietário para prevenir acesso não monitorado. Mapeia para NIST AC-6. | AuditIfNotExists | `f8456c1c-aa66-4dfb-861a-25d127b775c9` |
| 32 | **Managed identity should be used in function apps** — Garante que function apps usem identidade gerenciada para autenticação em vez de connection strings. | AuditIfNotExists | `0da106f2-4ca3-48e8-bc85-c638fe6aea8f` |
| 33 | **Service Fabric clusters should only use Microsoft Entra ID for client authentication** — Garante que clusters Service Fabric autentiquem via Microsoft Entra ID em vez de apenas certificados. | Audit | `b54ed75b-3e1a-44ac-a333-05ba39b99ff0` |

### ☑️ Monitoramento

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 34 | **Activity log should be retained for at least 365 days** — Garante retenção adequada de logs de atividade para investigações de segurança. Mapeia para CIS, NIST AU-11. | AuditIfNotExists | `b02aacc0-b073-424e-8298-42b22829ee0a` |
| 35 | **Azure Monitor log profile should collect logs for categories 'write', 'delete', and 'action'** — Garante que o perfil de log colete logs de operações administrativas. | AuditIfNotExists | `1a4e592a-6a6e-44a5-9814-e36264ca96e7` |
| 36 | **An activity log alert should exist for specific Administrative operations** — Audita que alertas estão configurados para operações críticas como atribuições de policy ou mudanças em network security groups. | AuditIfNotExists | `b954148f-4c11-4c38-8221-be76711e194a` |

### ☑️ Kubernetes

| # | Nome da Policy | Efeito | ID da Definição Integrada |
|---|----------------|--------|--------------------------|
| 37 | **Azure Kubernetes Service clusters should have Defender profile enabled** — Garante que o Defender for Containers esteja habilitado em clusters AKS para proteção contra ameaças em runtime. | Audit, Disabled | `a1840de2-8088-4ea8-b153-b4c723e9cb01` |
| 38 | **Kubernetes cluster should not allow privileged containers** — Impede que containers executem em modo privilegiado, que concede acesso quase root ao host. Mapeia para CIS Kubernetes Benchmark. | Deny/Audit | `95edb821-ddaf-4404-9732-666045e056b4` |
| 39 | **Kubernetes cluster containers should only use allowed images** — Restringe imagens de container a um padrão definido de registry e repositório. Impede implantação de imagens não confiáveis. | Deny/Audit | `febd0533-8e55-448f-b837-bd0e06f16469` |

---

### Exemplo Bicep: Atribuindo uma Iniciativa de Policy

O seguinte template Bicep atribui a policy "Allowed locations" no escopo de um grupo de recursos:

```bicep
@description('The list of allowed Azure regions.')
param allowedLocations array = [
  'eastus'
  'eastus2'
  'westus2'
  'westeurope'
  'northeurope'
]

@description('The policy definition ID for Allowed Locations.')
var policyDefinitionId = '/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c'

resource policyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'allowed-locations-assignment'
  properties: {
    displayName: 'Restrict resource deployment to approved regions'
    description: 'This policy restricts resource deployment to the specified Azure regions.'
    policyDefinitionId: policyDefinitionId
    enforcementMode: 'Default'
    nonComplianceMessages: [
      {
        message: 'This resource cannot be deployed in the selected region. Allowed regions: ${join(allowedLocations, ', ')}.'
      }
    ]
    parameters: {
      listOfAllowedLocations: {
        value: allowedLocations
      }
    }
  }
}

output assignmentId string = policyAssignment.id
```

### Exemplo Bicep: Definição e Atribuição de Policy Personalizada

```bicep
targetScope = 'subscription'

@description('The effect of the policy.')
@allowed([
  'Audit'
  'Deny'
  'Disabled'
])
param effect string = 'Audit'

resource policyDef 'Microsoft.Authorization/policyDefinitions@2024-04-01' = {
  name: 'require-https-storage'
  properties: {
    displayName: 'Storage accounts must use HTTPS'
    description: 'Audits or denies storage accounts that do not enforce HTTPS-only traffic.'
    policyType: 'Custom'
    mode: 'Indexed'
    metadata: {
      category: 'Storage'
      version: '1.0.0'
    }
    parameters: {
      effect: {
        type: 'String'
        metadata: {
          displayName: 'Effect'
          description: 'The effect to apply when the policy rule is matched.'
        }
        allowedValues: [
          'Audit'
          'Deny'
          'Disabled'
        ]
        defaultValue: 'Audit'
      }
    }
    policyRule: {
      if: {
        allOf: [
          {
            field: 'type'
            equals: 'Microsoft.Storage/storageAccounts'
          }
          {
            field: 'Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly'
            notEquals: true
          }
        ]
      }
      then: {
        effect: '[parameters(\'effect\')]'
      }
    }
  }
}

resource policyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'require-https-storage-assignment'
  properties: {
    displayName: 'Require HTTPS on all storage accounts'
    policyDefinitionId: policyDef.id
    enforcementMode: 'Default'
    parameters: {
      effect: {
        value: effect
      }
    }
  }
}
```

---

## Melhores Práticas

1. **Comece com policies integradas** — O Azure fornece centenas de policies integradas. Use-as antes de escrever definições personalizadas.

2. **Use iniciativas, não atribuições individuais** — Agrupe policies relacionadas em iniciativas para facilitar o gerenciamento e relatórios de conformidade.

3. **Parametrize efeitos** — Torne o efeito um parâmetro para poder alternar entre Audit e Deny sem reescrever a policy.

4. **Atribua no nível de grupo de gerenciamento** — Aplique policies no escopo mais alto apropriado para garantir cobertura consistente.

5. **Use isenções com parcimônia** — Toda isenção deve ter uma justificativa documentada, um proprietário e uma data de expiração.

6. **Adote Policy as Code** — Gerencie todas as policies através do controle de versão com pipelines CI/CD para governança repetível e auditável.

7. **Teste em modo Audit primeiro** — Nunca implante uma policy Deny diretamente em produção. Sempre comece com Audit para entender o impacto.

8. **Monitore conformidade continuamente** — Use o painel de conformidade do Azure Policy e o Azure Resource Graph para rastrear tendências de conformidade ao longo do tempo.

9. **Limite policies personalizadas** — Policies personalizadas requerem manutenção contínua. Verifique se uma policy integrada ou combinação de policies integradas pode atender suas necessidades.

10. **Documente mensagens de não conformidade** — Use a propriedade `nonComplianceMessages` nas atribuições de policy para dar aos desenvolvedores feedback claro e acionável quando suas implantações são negadas.

---

## Armadilhas Comuns

1. **Implantar policies Deny sem testar** — Implantar uma policy Deny sem antes executá-la em modo Audit pode quebrar pipelines CI/CD e bloquear implantações legítimas em toda a organização.

2. **Escopo excessivamente amplo** — Atribuir uma policy restritiva no grupo de gerenciamento raiz do tenant sem isenções para serviços compartilhados ou assinaturas de plataforma.

3. **Esquecer a identidade gerenciada para remediação** — Policies `DeployIfNotExists` e `Modify` requerem uma identidade gerenciada com roles RBAC apropriados. Sem ela, tarefas de remediação falham silenciosamente.

4. **Ignorar atrasos na avaliação de policy** — A conformidade de policy não é em tempo real. Um ciclo completo de avaliação pode levar até 24 horas. Novos recursos são avaliados na criação, mas recursos existentes são avaliados em um agendamento.

5. **Não rastrear isenções** — Isenções sem datas de expiração ou documentação se tornam lacunas permanentes na sua postura de conformidade.

6. **Policies conflitantes** — Duas policies com efeitos conflitantes (ex.: uma exige uma tag e outra adiciona um valor diferente para a mesma tag) podem causar comportamento imprevisível.

7. **Azure Machine Configuration sem a extensão** — Atribuir policies de Machine Configuration a VMs que não possuem a extensão Machine Configuration instalada resulta em estado de conformidade "Not started" em vez de avaliação real.

8. **Exceder limites de policy** — O Azure possui limites no número de definições e atribuições de policy por escopo. Em escala empresarial, esteja atento a esses limites e use iniciativas para permanecer dentro dos limites.

---

## Exemplos de Código

### Azure CLI: Criar e Atribuir uma Policy

```bash
# Criar uma definição de policy personalizada
az policy definition create \
  --name "require-tag-environment" \
  --display-name "Require Environment tag on resources" \
  --description "Denies creation of resources without an Environment tag." \
  --rules '{
    "if": {
      "field": "[concat('"'"'tags['"'"', '"'"'Environment'"'"', '"'"']'"'"')]",
      "exists": "false"
    },
    "then": {
      "effect": "deny"
    }
  }' \
  --mode "Indexed"

# Atribuir a policy a um grupo de recursos
az policy assignment create \
  --name "require-tag-environment-rg" \
  --display-name "Require Environment tag" \
  --policy "require-tag-environment" \
  --scope "/subscriptions/{sub-id}/resourceGroups/my-rg" \
  --enforcement-mode "Default"
```

### Azure CLI: Disparar uma Tarefa de Remediação

```bash
az policy remediation create \
  --name "remediate-missing-diagnostics" \
  --policy-assignment "deploy-diagnostics-keyvault" \
  --scope "/subscriptions/{sub-id}" \
  --resource-discovery-mode "ReEvaluateCompliance"
```

### Azure Resource Graph: Consultar Recursos Não Conformes

```kusto
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| project
    resourceId = properties.resourceId,
    policyName = properties.policyDefinitionName,
    policyAction = properties.policyDefinitionAction,
    resourceType = properties.resourceType
| summarize NonCompliantCount = count() by tostring(policyName)
| order by NonCompliantCount desc
| take 20
```

---

## Referências

- [Visão geral do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/overview)
- [Estrutura de definição do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure)
- [Efeitos do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects)
- [Estrutura de iniciativa do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/initiative-definition-structure)
- [Estrutura de isenção do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/exemption-structure)
- [Remediação do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources)
- [Visão geral do Azure Machine Configuration](https://learn.microsoft.com/en-us/azure/governance/machine-configuration/overview)
- [Enterprise Policy as Code (EPAC)](https://aka.ms/epac)
- [Definições integradas do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-policies)
- [Limites do Azure Policy](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-policy-limits)
- [Referência de policy do Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/policy-reference)

---

Anterior | Próximo
:--- | :---
[Capítulo 6 — RBAC](/guide/part-2-identity-access/ch06-rbac.md) | [Capítulo 10 — Conformidade Regulatória](/guide/part-3-policy-compliance/ch10-regulatory-compliance.md)
