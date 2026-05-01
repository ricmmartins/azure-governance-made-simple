# Capítulo 27 — Governança de IA

> Last verified: 2026-04-06

---

## Visão Geral

À medida que as organizações adotam serviços de IA — particularmente IA generativa e modelos de linguagem de grande porte (LLMs) — uma nova disciplina de governança é necessária. Cargas de trabalho de IA introduzem riscos únicos: exposição descontrolada de dados, saídas tendenciosas ou prejudiciais, custos descontrolados de consumo de tokens e não conformidade regulatória. **Governança de IA** é o conjunto de políticas, controles e processos que garantem que cargas de trabalho de IA sejam usadas de forma responsável, segura e em conformidade com requisitos organizacionais e regulatórios.

Este capítulo foca em governar cargas de trabalho de IA dentro do Azure, particularmente o Azure OpenAI Service, e o desafio mais amplo de garantir que a adoção de IA não comprometa sua postura de governança existente.

---

## Como Funciona

### Controles de Acesso e Políticas do Azure OpenAI Service

O Azure OpenAI Service fornece acesso de nível empresarial a modelos como GPT-4, GPT-4o e outros. Governar o acesso a esses modelos requer controles em múltiplos níveis:

**Acesso e implantação de modelos:**

| Controle | Descrição |
|---|---|
| **Acesso no nível de subscription** | Azure OpenAI requer uma subscription aprovada; nem todas as subscriptions têm acesso por padrão |
| **RBAC no nível de recurso** | Atribua `Cognitive Services OpenAI User` para inferência, `Cognitive Services OpenAI Contributor` para gerenciamento de implantação |
| **Políticas de implantação de modelos** | Controle quais modelos podem ser implantados e em quais regiões usando Azure Policy |
| **API key vs. autenticação Microsoft Entra ID** | Prefira autenticação Microsoft Entra ID sobre API keys para cargas de trabalho de produção |
| **Private endpoints** | Restrinja acesso de rede a recursos Azure OpenAI |

```bicep
// RBAC: Grant a managed identity the OpenAI User role
resource openAiRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(openAiAccount.id, appIdentity.id, 'CognitiveServicesOpenAIUser')
  scope: openAiAccount
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd' // Cognitive Services OpenAI User
    )
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}
```

### Filtros de Segurança de Conteúdo e Configuração

O Azure OpenAI inclui filtros de segurança de conteúdo integrados que analisam tanto prompts (entradas) quanto completions (saídas):

**Categorias padrão do filtro de conteúdo:**

| Categoria | Descrição |
|---|---|
| Ódio | Conteúdo que ataca ou discrimina grupos |
| Sexual | Conteúdo sexualmente explícito |
| Violência | Descrições de dano físico |
| Autolesão | Conteúdo sobre automutilação |
| Detecção de jailbreak | Tentativas de burlar filtros de segurança |
| Material protegido | Texto ou código protegido por direitos autorais |

**Considerações de governança:**

- Filtros de conteúdo são **habilitados por padrão** em severidade média — não os desabilite sem uma justificativa de negócio documentada e revisão de conformidade
- Filtros de conteúdo customizados podem ser configurados para serem mais ou menos restritivos com base no caso de uso
- **Listas de bloqueio** permitem impedir que termos ou frases específicos apareçam em entradas ou saídas
- Resultados dos filtros são registrados e podem ser monitorados via Azure Monitor

```json
// Example: Custom content filter configuration
{
  "name": "strict-filter",
  "properties": {
    "basePolicyName": "Microsoft.DefaultV2",
    "contentFilters": [
      { "name": "hate", "severityThreshold": "Low", "blocking": true },
      { "name": "sexual", "severityThreshold": "Low", "blocking": true },
      { "name": "violence", "severityThreshold": "Low", "blocking": true },
      { "name": "selfharm", "severityThreshold": "Low", "blocking": true }
    ],
    "jailbreakDetection": { "blocking": true },
    "protectedMaterialDetection": { "blocking": true }
  }
}
```

### Microsoft Entra ID para Identidades de Agentes de IA

À medida que agentes de IA se tornam mais autônomos — fazendo chamadas de API, acessando dados e realizando ações em nome dos usuários — eles precisam de identidades adequadas. Em 2026, a Microsoft introduziu capacidades de **Agent ID** dentro do Microsoft Entra ID:

- **Identidade de carga de trabalho para agentes de IA** — Atribua managed identities a agentes de IA, habilitando RBAC granular sobre quais dados e serviços cada agente pode acessar
- **Limites de autorização de agentes** — Defina quais ações um agente de IA pode realizar, com políticas de Conditional Access que se aplicam a identidades de agentes
- **Trilha de auditoria** — Todas as ações dos agentes são registradas sob a identidade do agente, fornecendo uma trilha de auditoria clara separada da atividade de usuários humanos
- **Escopo de tokens** — Limite as permissões concedidas a tokens de agentes, aplicando o princípio do menor privilégio a cargas de trabalho de IA

### Princípios de IA Responsável como Mandatos de Governança

Os princípios de IA Responsável da Microsoft fornecem um framework para governar cargas de trabalho de IA:

| Princípio | Implementação de Governança |
|---|---|
| **Equidade** | Testar modelos para viés; monitorar saídas para padrões discriminatórios |
| **Confiabilidade e Segurança** | Implementar filtros de conteúdo, limites de taxa e human-in-the-loop para decisões críticas |
| **Privacidade e Segurança** | Usar private endpoints, chaves gerenciadas pelo cliente e prevenção contra perda de dados |
| **Inclusividade** | Garantir que serviços de IA sejam acessíveis e atendam populações diversas |
| **Transparência** | Registrar todas as interações de IA; fornecer explicações para decisões orientadas por IA |
| **Responsabilização** | Atribuir proprietários a cargas de trabalho de IA; implementar revisões de acesso para acesso a recursos de IA |

### Ferramentas de Governança de IA do Azure

O Azure fornece várias ferramentas para governar cargas de trabalho de IA:

**Limites de taxa e cotas:**

- O Azure OpenAI aplica limites de **Tokens Por Minuto (TPM)** e **Requisições Por Minuto (RPM)**
- Aloque cotas entre implantações para impedir que uma única aplicação consuma toda a capacidade
- Monitore o uso em relação aos limites para prevenir throttling

**Políticas de acesso a modelos:**

- Use Azure Policy para restringir quais modelos do Azure OpenAI podem ser implantados
- Aplique que apenas versões aprovadas de modelos sejam usadas em produção
- Exija configurações específicas de filtro de conteúdo em todas as implantações

**Azure API Management como Gateway de IA:**

- Coloque o Azure API Management na frente do Azure OpenAI para adicionar governança centralizada
- Implemente contagem de tokens, limitação de taxa e rastreamento de custos no nível do gateway
- Habilite cache semântico para reduzir custos e latência
- Registre todas as requisições e respostas para fins de auditoria

### Detecção de Shadow AI

**Shadow AI** refere-se ao uso de serviços de IA não autorizados por funcionários — usando contas pessoais do ChatGPT, ferramentas de IA de terceiros ou APIs não aprovadas para processar dados corporativos.

O Microsoft Entra ID agora fornece capacidades para detectar e governar shadow AI:

- **Descoberta de aplicativos** — Identifique quando usuários acessam serviços de IA não autorizados através de Conditional Access e Microsoft Defender for Cloud Apps
- **Detecção de exfiltração de dados** — Monitore dados sensíveis sendo enviados a serviços de IA externos
- **Catálogo de IA aprovada** — Publique um catálogo de serviços de IA aprovados e exija que os usuários passem por canais sancionados
- **Conditional Access para serviços de IA** — Bloqueie ou alerte quando usuários tentam acessar serviços de IA não aprovados

---

## Melhores Práticas

1. **Use autenticação Microsoft Entra ID, não API keys** — API keys são secrets compartilhados que são facilmente vazados. Use managed identities para serviço-a-serviço e tokens Microsoft Entra ID para aplicações voltadas ao usuário.

2. **Nunca desabilite filtros de conteúdo sem aprovação de governança** — Filtros de conteúdo existem para prevenir saídas prejudiciais. Qualquer modificação deve passar por um processo formal de revisão.

3. **Implemente limites de taxa antes que se tornem um problema** — Serviços de IA podem gerar custos significativos. Defina limites TPM/RPM no nível de implantação e monitore o uso.

4. **Trate agentes de IA como identidades de primeira classe** — Dê a agentes de IA suas próprias managed identities com RBAC de menor privilégio. Nunca execute agentes sob a identidade de um usuário humano.

5. **Registre tudo** — Interações de IA devem ser registradas para auditoria, conformidade e depuração. Use diagnostic settings para enviar logs do Azure OpenAI ao Log Analytics.

6. **Use Azure API Management como gateway de IA** — Centralize o acesso a modelos de IA através do APIM para aplicação consistente de políticas, logging e rastreamento de custos.

7. **Aborde shadow AI proativamente** — Publique um catálogo de IA aprovada, eduque funcionários e use o Defender for Cloud Apps para detectar uso não autorizado de IA.

8. **Estabeleça um comitê de governança de IA** — Crie uma equipe multifuncional (TI, jurídico, conformidade, negócios) para revisar casos de uso de IA e aprovar implantações.

9. **Monitore drift e viés de modelos** — Avalie regularmente as saídas de IA quanto a qualidade, viés e precisão. A governança não para na implantação.

10. **Planeje para mudanças regulatórias** — Regulamentações de IA (EU AI Act, NIST AI RMF e outras) estão evoluindo rapidamente. Construa processos de governança que possam se adaptar a novos requisitos.

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|---|---|---|
| Usar API keys no código-fonte | Vazamento de chave leva a acesso não autorizado e exposição de custos | Use managed identities e autenticação Microsoft Entra ID |
| Sem limites de taxa em implantações de IA | Uma única aplicação descontrolada esgota cota e orçamento | Defina limites TPM/RPM por implantação; implemente orçamentos e alertas |
| Desabilitar filtros de conteúdo por "flexibilidade" | Conteúdo prejudicial ou inapropriado em saídas de produção | Mantenha filtros habilitados; use configurações customizadas para casos de uso específicos |
| Ignorar shadow AI | Dados corporativos sensíveis enviados a serviços de IA não autorizados | Implante Defender for Cloud Apps; crie um catálogo de IA aprovada |
| Sem logging de auditoria para interações de IA | Não é possível demonstrar conformidade ou investigar incidentes | Habilite diagnostic settings em todos os recursos Azure OpenAI |
| Tratar governança de IA como preocupação apenas de TI | Riscos de negócios e jurídicos não são abordados | Estabeleça um comitê multifuncional de governança de IA |

---

## Exemplos de Código

### Azure Policy — Exigir Private Endpoints para Azure OpenAI

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.CognitiveServices/accounts"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/kind",
          "equals": "OpenAI"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/publicNetworkAccess",
          "notEquals": "Disabled"
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

### Azure Policy — Restringir Azure OpenAI a Regiões Específicas

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.CognitiveServices/accounts"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/kind",
          "equals": "OpenAI"
        },
        {
          "not": {
            "field": "location",
            "in": ["eastus", "eastus2", "westeurope"]
          }
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

### Monitorar Uso do Azure OpenAI com Log Analytics

```kusto
// Azure OpenAI request volume and token consumption
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.COGNITIVESERVICES"
| where Category == "RequestResponse"
| extend model = tostring(parse_json(properties_s).modelName)
| summarize
    RequestCount = count(),
    TotalTokens = sum(toint(parse_json(properties_s).totalTokens)),
    AvgLatencyMs = avg(DurationMs)
    by bin(TimeGenerated, 1h), model
| order by TimeGenerated desc
```

---

## Referências

- [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/overview)
- [Azure OpenAI RBAC Roles](https://learn.microsoft.com/azure/ai-services/openai/how-to/role-based-access-control)
- [Content Filtering in Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/concepts/content-filter)
- [Azure API Management as an AI Gateway](https://learn.microsoft.com/azure/api-management/api-management-ai-gateway)
- [Microsoft Responsible AI Principles](https://www.microsoft.com/ai/responsible-ai)
- [Microsoft Entra Workload ID](https://learn.microsoft.com/entra/workload-id/workload-identities-overview)
- [Microsoft Defender for Cloud Apps](https://learn.microsoft.com/defender-cloud-apps/what-is-defender-for-cloud-apps)
- [EU AI Act — Implications for Azure](https://learn.microsoft.com/azure/ai-services/openai/concepts/eu-ai-act)
- [Azure OpenAI Quotas and Limits](https://learn.microsoft.com/azure/ai-services/openai/quotas-limits)

---

| Anterior | Próximo |
|:---|:---|
| [Governança de Dados com Purview](ch26-data-governance-purview.md) | [Roteiro de Governança](../part-8-synthesis/ch28-governance-roadmap.md) |
