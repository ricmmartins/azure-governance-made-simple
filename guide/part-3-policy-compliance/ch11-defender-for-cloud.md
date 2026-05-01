# Capítulo 11 — Microsoft Defender for Cloud

> Last verified: 2026-04-06

Microsoft Defender for Cloud é o serviço centralizado de gerenciamento de segurança e proteção contra ameaças para ambientes Azure, híbridos e multi-cloud. Para equipes de governança, o Defender for Cloud fornece a camada de gerenciamento de postura de segurança que traduz políticas de segurança em recomendações acionáveis e métricas mensuráveis. Este capítulo cobre como usar o Defender for Cloud como uma ferramenta de governança — não apenas um produto de segurança.

---

## Visão Geral

O Microsoft Defender for Cloud fornece duas capacidades centrais:

1. **Cloud Security Posture Management (CSPM)** — Avalia continuamente seu ambiente, identifica configurações incorretas e fornece recomendações de segurança com um Secure Score quantificável.

2. **Cloud Workload Protection (CWP)** — Fornece detecção de ameaças e proteção avançada para tipos específicos de carga de trabalho (VMs, containers, bancos de dados, armazenamento, App Service, Key Vault, DNS e mais).

Para fins de governança, CSPM é o foco principal. Ele oferece uma visão mensurável e rastreável da sua postura de segurança e se integra diretamente com o Azure Policy para aplicar padrões de segurança.

---

## Como Funciona

### Cloud Security Posture Management (CSPM)

O CSPM avalia continuamente seus recursos Azure contra melhores práticas de segurança e reporta achados como **recomendações de segurança**. Toda assinatura Azure recebe automaticamente as capacidades de **CSPM fundamental** sem custo.

#### Camada Gratuita (CSPM Fundamental)

Incluída em toda assinatura Azure:

- Recomendações de segurança baseadas no Microsoft Cloud Security Benchmark (MCSB).
- Cálculo do Secure Score.
- Integração com Azure Policy para padrões de segurança.
- Inventário de ativos.
- Painel de conformidade regulatória com MCSB.

#### Camada Paga (Defender CSPM)

Adiciona capacidades avançadas:

- **Análise de caminho de ataque** — Identifica caminhos que um atacante poderia percorrer em seu ambiente, combinando configurações incorretas, acesso excessivamente permissivo e exposição de rede.
- **Grafo de segurança na nuvem** — Banco de dados de grafo consultável de todos os recursos, identidades e seus relacionamentos para análise de risco.
- **Varredura sem agente** — Varre VMs em busca de vulnerabilidades e segredos sem instalar agentes.
- **Postura de segurança ciente de dados** — Descobre e classifica dados sensíveis em armazenamento e bancos de dados.
- **Regras de governança** — Atribui recomendações a proprietários específicos com datas de vencimento e rastreamento.
- **Gerenciamento de superfície de ataque externa (EASM)** — Descobre e monitora ativos expostos à internet.

### Secure Score

**Secure Score** é uma medida numérica (0–100%) da sua postura de segurança. É calculado com base na proporção de recursos saudáveis (conformes) em relação ao total de recursos avaliados, ponderado pela severidade e importância de cada recomendação.

#### Como o Secure Score Funciona

1. O Defender for Cloud avalia seus recursos contra todas as recomendações de segurança ativas.
2. Cada **controle de segurança** possui um **valor de pontuação máxima** (ex.: 10 pontos para o controle Habilitar MFA). Sua pontuação atual para cada controle depende de quantas de suas recomendações você remediou.
3. A **pontuação atual** para uma recomendação é proporcional à porcentagem de recursos conformes.
4. O Secure Score total é a soma de todas as pontuações atuais dividida pela soma de todas as pontuações máximas.

```
Secure Score = Σ(pontuações atuais) / Σ(pontuações máximas) × 100
```

#### Usando o Secure Score como Métrica de Governança

O Secure Score é uma das métricas de governança mais eficazes porque:

- **É quantificável** — Rastrear um número ao longo do tempo em vez de avaliações subjetivas.
- **É acionável** — Cada ponto mapeia para ações de remediação específicas.
- **É comparável** — Comparar Secure Score entre assinaturas, grupos de gerenciamento e unidades de negócio.
- **Gera responsabilização** — Definir metas de Secure Score por equipe e rastrear progresso.

**Exemplo de meta de governança:**

| Público | Meta | Cadência de Revisão |
|---------|------|---------------------|
| Equipe de plataforma | ≥ 85% | Semanal |
| Equipes de aplicação | ≥ 70% | Quinzenal |
| Novas assinaturas | ≥ 60% em 30 dias | Mensal |

### Recomendações de Segurança

Recomendações de segurança são os achados individuais que o Defender for Cloud gera. Cada recomendação inclui:

- **Descrição** — Qual é o problema.
- **Severidade** — Alta, Média ou Baixa.
- **Recursos afetados** — Quais recursos específicos estão não conformes.
- **Passos de remediação** — Como corrigir o problema (frequentemente com um botão "Quick Fix").
- **Policy associada** — A definição de Azure Policy que avalia este controle.

Recomendações são agrupadas em **controles de segurança**, que se alinham com os domínios de controle do MCSB. Exemplos de controles de segurança:

| Controle de Segurança | Pontuação Máx. | Exemplos de Recomendações |
|----------------------|----------------|--------------------------|
| Habilitar MFA | 10 | MFA deve estar habilitado em contas com permissões de proprietário |
| Gerenciar acesso e permissões | 4 | Contas externas com permissões de proprietário devem ser removidas |
| Habilitar criptografia em repouso | 4 | Contas de armazenamento devem usar chaves gerenciadas pelo cliente |
| Restringir acesso de rede não autorizado | 4 | Contas de armazenamento devem restringir acesso de rede |
| Habilitar proteção de endpoint | 6 | Proteção de endpoint deve estar instalada nas máquinas |
| Aplicar atualizações do sistema | 6 | Atualizações do sistema devem ser instaladas em suas máquinas |

### Recomendações de Segurança como Sinais de Governança

Recomendações servem como sinais de governança que podem ser operacionalizados:

1. **Atribuição** — Use regras de governança do Defender for Cloud para atribuir recomendações a proprietários específicos com datas de vencimento.
2. **Rastreamento** — Monitore o progresso da remediação através do portal do Defender for Cloud ou via Azure Resource Graph.
3. **Escalação** — Configure alertas quando recomendações permanecem sem resolução além da data de vencimento.
4. **Relatórios** — Exporte dados de recomendações para Power BI ou sua plataforma GRC para relatórios executivos.

### Visão Geral dos Planos Defender

Além do CSPM, o Defender for Cloud oferece planos de proteção específicos por carga de trabalho. Para governança, a decisão chave é quais planos habilitar:

| Plano Defender | O Que Protege | Valor para Governança |
|----------------|--------------|----------------------|
| **Defender for Servers** | VMs, servidores habilitados para Arc | Avaliação de vulnerabilidades, monitoramento de integridade de arquivos, controles adaptativos de aplicação |
| **Defender for Containers** | AKS, registros de container, Kubernetes | Detecção de ameaças em runtime, varredura de vulnerabilidades de imagens, aplicação de policy do Kubernetes |
| **Defender for Databases** | Azure SQL, Cosmos DB, DBs open-source | Avaliação de vulnerabilidades, detecção de ameaças para cargas de trabalho de dados |
| **Defender for Storage** | Blob, File, Data Lake | Varredura de malware, detecção de ameaças a dados sensíveis |
| **Defender for Key Vault** | Key Vault | Detecta padrões incomuns de acesso a segredos e chaves |
| **Defender for App Service** | App Service, Functions | Detecta ataques direcionados a aplicações web |
| *(Defender for DNS foi descontinuado em agosto de 2023; a proteção DNS agora está incluída no Defender for Servers Plan 2.)* | | |
| **Defender for Resource Manager**| ARM API | Detecta operações de gerenciamento suspeitas |
| **Defender CSPM** | Todos os recursos | Análise de caminho de ataque, grafo de segurança na nuvem, regras de governança |

**Recomendação de governança:** No mínimo, habilite **Defender CSPM** e **Defender for Resource Manager** em todas as assinaturas. Estes fornecem as capacidades relevantes para governança (gerenciamento de postura e detecção de ameaças no plano de controle) a um custo razoável.

### Integração com Azure Policy

O Defender for Cloud é profundamente integrado com o Azure Policy:

1. **A iniciativa MCSB é uma iniciativa de policy** — Quando você integra uma assinatura ao Defender for Cloud, a iniciativa MCSB é automaticamente atribuída. Ela contém centenas de definições de policy que avaliam seus recursos.

2. **Recomendações de segurança são avaliações de policy** — Cada recomendação de segurança corresponde a uma ou mais definições de Azure Policy. O estado de conformidade reportado pelo Defender for Cloud vem do motor de avaliação do Azure Policy.

3. **Iniciativas de conformidade regulatória são iniciativas de policy** — Os padrões de conformidade que você adiciona no Defender for Cloud (NIST, CIS, PCI-DSS, etc.) são iniciativas de Azure Policy atribuídas à sua assinatura.

4. **Remediação usa remediação do Azure Policy** — Quando você remedia uma recomendação que usa `DeployIfNotExists`, o Defender for Cloud dispara uma tarefa de remediação do Azure Policy.

Essa integração significa que tudo que você aprende sobre Azure Policy (Capítulo 9) se aplica diretamente ao Defender for Cloud. O Defender for Cloud é, de muitas formas, uma camada de UX amigável para governança sobre o Azure Policy.

---

## Melhores Práticas

1. **Habilite o CSPM fundamental em todas as assinaturas** — A camada gratuita fornece Secure Score, recomendações de segurança e o painel de conformidade sem custo. Não há razão para não habilitá-lo em todos os lugares.

2. **Habilite o Defender CSPM para cargas de trabalho de produção** — A camada paga de CSPM adiciona análise de caminho de ataque e regras de governança, que são essenciais para programas de governança maduros.

3. **Rastreie o Secure Score ao longo do tempo** — Configure um processo semanal ou mensal para revisar tendências do Secure Score. Use o Azure Resource Graph para exportar dados históricos.

4. **Use regras de governança para atribuir proprietários** — As regras de governança do Defender for Cloud permitem atribuir recomendações específicas a proprietários de recursos com datas de vencimento. Isso cria responsabilização.

5. **Use recomendações para impulsionar a remediação** — Priorize recomendações por impacto (contribuição de pontuação máxima) e severidade. Foque em achados de Alta severidade primeiro.

6. **Defina metas de Secure Score por unidade de negócio** — Diferentes equipes podem ter diferentes requisitos de baseline. Defina metas alcançáveis e aumente-as ao longo do tempo.

7. **Integre com seu workflow de ITSM** — Configure o Defender for Cloud para criar tickets no seu sistema ITSM (ServiceNow, Jira) quando novas recomendações de alta severidade forem detectadas.

8. **Exporte dados para Log Analytics** — Configure exportação contínua dos dados do Defender for Cloud para um workspace Log Analytics para dashboards personalizados, alertas e retenção de longo prazo.

9. **Revise e racionalize planos Defender** — Nem todo plano é necessário para toda assinatura. Habilite planos com base nos tipos de carga de trabalho presentes em cada assinatura.

10. **Não desabilite atribuições de policy padrão** — Algumas equipes desabilitam a iniciativa MCSB para reduzir "ruído". Isso remove sua visibilidade de governança. Em vez disso, use isenções para achados específicos que não são aplicáveis.

---

## Armadilhas Comuns

1. **Tratar o Secure Score como métrica de vaidade** — Um Secure Score alto é sem sentido se alcançado desabilitando policies ou criando isenções generalizadas. Foque em remediação genuína.

2. **Ignorar alertas do Defender for Cloud** — Equipes que não integram o Defender for Cloud em seu workflow de resposta a incidentes perdem ameaças reais. Configure roteamento de alertas e playbooks de resposta.

3. **Habilitar todos os planos Defender sem análise de custos** — Planos Defender incorrem em custos por recurso por mês. Habilite planos deliberadamente com base nos requisitos de carga de trabalho e avaliação de risco.

4. **Não configurar exportação contínua** — Sem exportação contínua, os dados do Defender for Cloud estão disponíveis apenas no portal. Exporte para Log Analytics para consultabilidade, alertas e retenção.

5. **Confundir CSPM com CWP** — CSPM (gerenciamento de postura) e CWP (proteção contra ameaças) servem propósitos diferentes. CSPM é para governança; CWP é para operações de segurança. Ambos são necessários, mas servem diferentes equipes e workflows.

6. **Esperar atualizações do Secure Score em tempo real** — O Secure Score não é atualizado em tempo real. Ele é atualizado periodicamente (tipicamente a cada poucas horas). Não o use para gates de conformidade em tempo real.

---

## Exemplos de Código

### Azure Resource Graph: Consultar Secure Score

```kusto
SecurityResources
| where type == "microsoft.security/securescores"
| extend scorePercentage = round(
    100.0 * todouble(properties.score.current) / todouble(properties.score.max), 2)
| project
    subscriptionId,
    scoreName = tostring(properties.displayName),
    currentScore = todouble(properties.score.current),
    maxScore = todouble(properties.score.max),
    scorePercentage
| order by scorePercentage asc
```

### Azure Resource Graph: Consultar Recomendações de Segurança

```kusto
SecurityResources
| where type == "microsoft.security/assessments"
| extend status = tostring(properties.status.code)
| extend severity = tostring(properties.metadata.severity)
| extend displayName = tostring(properties.displayName)
| where status == "Unhealthy"
| summarize count() by displayName, severity
| order by count_ desc
| take 20
```

### Azure CLI: Habilitar Defender CSPM

```bash
# Habilitar Defender CSPM em uma assinatura
az security pricing create \
  --name "CloudPosture" \
  --tier "Standard"
```

### Azure CLI: Habilitar Defender for Servers

```bash
# Habilitar Defender for Servers Plan 2
az security pricing create \
  --name "VirtualMachines" \
  --tier "Standard" \
  --subplan "P2"
```

### Azure CLI: Configurar Exportação Contínua

```bash
# Configurar exportação contínua dos dados do Defender for Cloud para Log Analytics
az security automation create \
  --name "export-to-law" \
  --resource-group "security-rg" \
  --scopes '[{"description": "subscription", "scopePath": "/subscriptions/{sub-id}"}]' \
  --sources '[{"eventSource": "Assessments"}, {"eventSource": "Alerts"}]' \
  --actions '[{
    "actionType": "LogAnalytics",
    "workspaceResourceId": "/subscriptions/{sub-id}/resourceGroups/security-rg/providers/Microsoft.OperationalInsights/workspaces/security-law"
  }]'
```

### Bicep: Habilitar Camadas de Preço do Defender for Cloud

```bicep
targetScope = 'subscription'

@description('The Defender plans to enable.')
var defenderPlans = [
  { name: 'CloudPosture', tier: 'Standard' }
  { name: 'VirtualMachines', tier: 'Standard' }
  { name: 'KeyVaults', tier: 'Standard' }
  { name: 'Arm', tier: 'Standard' }
  { name: 'Containers', tier: 'Standard' }
]

resource defenderPricing 'Microsoft.Security/pricings@2024-01-01' = [for plan in defenderPlans: {
  name: plan.name
  properties: {
    pricingTier: plan.tier
  }
}]
```

---

## Referências

- [O que é Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction)
- [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management)
- [Secure Score no Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls)
- [Referência de recomendações de segurança](https://learn.microsoft.com/en-us/azure/defender-for-cloud/recommendations-reference)
- [Preços do Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/plan-defender-for-cloud)
- [Regras de governança no Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules)
- [Exportação contínua de dados do Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/continuous-export)
- [Consultas do Azure Resource Graph para Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/resource-graph-samples)
- [Microsoft Cloud Security Benchmark](https://learn.microsoft.com/en-us/security/benchmark/azure/overview)
- [Integração do Defender for Cloud com Azure Policy](https://learn.microsoft.com/en-us/azure/defender-for-cloud/policy-reference)

---

Anterior | Próximo
:--- | :---
[Capítulo 10 — Conformidade Regulatória](/guide/part-3-policy-compliance/ch10-regulatory-compliance.md) | [Capítulo 12 — Resource Locks](/guide/part-3-policy-compliance/ch12-resource-locks.md)
