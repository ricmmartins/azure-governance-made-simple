# Capítulo 3 — Modelo de Maturidade de Governança em Nuvem

> **Last verified: 2026-04-06**

---

## Visão Geral

Nem toda organização precisa (ou está pronta para) um framework de governança totalmente otimizado no primeiro dia. A maturidade da governança é uma jornada. Tentar implementar todos os controles de uma vez cria atrito, desacelera a adoção e arrisca alienar as equipes de engenharia cuja cooperação você mais precisa.

Este capítulo apresenta um **modelo de maturidade em três níveis** — Engatinhar, Andar, Correr — que ajuda você a avaliar onde sua organização está hoje e fornece um caminho claro para avançar. Cada nível é descrito em cinco dimensões de governança: Identidade, Política, Custo, Segurança e Operações.

O modelo está alinhado com a [metodologia CAF Govern](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/), que recomenda uma abordagem incremental: estabelecer uma base de governança com produto mínimo viável (MVP) e depois iterar conforme sua presença na nuvem cresce.

---

## Arquitetura: Os Três Níveis de Maturidade

![Modelo de Maturidade de Governança em Nuvem — Engatinhar, Andar, Correr](/images/governance-maturity-model.svg)

---

## Como Funciona: Níveis de Maturidade em Detalhe

### Nível 1 — Engatinhar (Ad-Hoc)

No nível Engatinhar, a organização começou a usar o Azure, mas a governança é **reativa e inconsistente**. Não há estratégia formal de governança. Os controles são aplicados manualmente, se é que são aplicados.

| Dimensão | Como Se Parece |
|---|---|
| **Identidade** | Usuários têm acesso privilegiado permanente. Contas compartilhadas podem existir. Sem processo formal de revisão de acesso. Microsoft Entra ID está configurado, mas as políticas de Conditional Access são mínimas ou ausentes. |
| **Política** | Poucas ou nenhuma Azure Policy atribuída. Decisões de política são tomadas de forma ad-hoc por equipes individuais. Nenhuma hierarquia de management group além da raiz. |
| **Custo** | Sem orçamentos ou alertas de custo. Surpresas de gastos são descobertas no momento da fatura. Sem alocação de custos baseada em tags. Recursos órfãos se acumulam. |
| **Segurança** | Microsoft Defender for Cloud está no tier gratuito ou não é revisado. Network security groups são configurados de forma inconsistente. Sem política de criptografia em repouso. |
| **Operações** | Recursos são nomeados de forma inconsistente. Sem etiquetagem padrão. Implantações são manuais (cliques no portal). Sem infrastructure as code. Monitoramento é por recurso, não centralizado. |

**Características típicas:**
- 1–5 assinaturas, geralmente criadas sem um plano
- Sem Cloud Center of Excellence (CCoE) ou equipe de governança
- "Funciona" é o critério de sucesso

---

### Nível 2 — Andar (Definido)

No nível Andar, a organização estabeleceu **padrões e mecanismos de aplicação**. A governança está documentada, políticas estão atribuídas e há uma equipe responsável pelas decisões de governança.

| Dimensão | Como Se Parece |
|---|---|
| **Identidade** | Funções RBAC são atribuídas seguindo o menor privilégio. Privileged Identity Management (PIM) está habilitado para funções críticas. Revisões de acesso são conduzidas trimestralmente. |
| **Política** | Uma hierarquia de management group existe. Atribuições de Azure Policy aplicam regras fundamentais (regiões permitidas, tags obrigatórias, SKUs aprovados). A conformidade de políticas é revisada mensalmente. |
| **Custo** | Orçamentos e alertas de custo estão configurados por assinatura. Tags são usadas para alocação de custos. Revisões mensais de custos ocorrem. Limpeza de recursos órfãos é periódica. |
| **Segurança** | Microsoft Defender for Cloud está habilitado com segurança aprimorada. Recomendações de segurança são triadas. Configurações de diagnóstico encaminham logs para um workspace central de Log Analytics. |
| **Operações** | Uma convenção de nomenclatura está definida e documentada. A infraestrutura central é implantada via Bicep ou Terraform. Monitoramento centralizado com Azure Monitor. Deployment Stacks ou pipelines de CI/CD gerenciam a consistência do ambiente. |

**Características típicas:**
- Hierarquia de management group implementada
- Cloud Center of Excellence (CCoE) estabelecido ou emergindo
- Governança tratada como uma linha de trabalho, não como um adendo

---

### Nível 3 — Correr (Otimizado)

No nível Correr, a governança é **automatizada, proativa e em melhoria contínua**. A organização usa insights baseados em dados para otimizar políticas e prever problemas antes que ocorram.

| Dimensão | Como Se Parece |
|---|---|
| **Identidade** | Acesso privilegiado permanente zero para todas as funções privilegiadas. Gerenciamento de direitos automatiza pacotes de acesso. Avaliação de acesso contínua está habilitada. Identidades de carga de trabalho usam managed identities exclusivamente. |
| **Política** | Policy-as-code está totalmente integrada ao CI/CD. Políticas personalizadas atendem a requisitos específicos da organização. Isenções de política são rastreadas e com prazo determinado. Dashboards de conformidade são revisados em tempo real. |
| **Custo** | Práticas de FinOps estão maduras. A utilização de reservas e savings plans é otimizada. Detecção de anomalias alerta sobre gastos inesperados. Modelos de chargeback/showback estão totalmente implementados. Governança de tags é aplicada automaticamente. |
| **Segurança** | O Secure Score do Microsoft Defender for Cloud é gerenciado ativamente (meta >80%). Tarefas de remediação automatizadas corrigem configurações incorretas comuns. A postura de segurança é reportada à liderança. Detecção e resposta a ameaças são integradas com SIEM/SOAR. |
| **Operações** | Toda a infraestrutura é implantada via IaC através de pipelines de CI/CD. Detecção de desvio identifica alterações manuais. Azure Resource Graph alimenta dashboards de governança personalizados. Subscription vending automatiza a integração de novas cargas de trabalho. Azure Governance Visualizer executa em agendamento. |

**Características típicas:**
- Dezenas a centenas de assinaturas, todas governadas de forma consistente
- CCoE maduro com processos e SLAs definidos
- Métricas de governança reportadas à liderança junto com outros KPIs

---

## Lista de Verificação de Autoavaliação

Use a tabela a seguir para avaliar o nível de maturidade atual da sua organização. Para cada item, marque seu estado atual.

| # | Controle de Governança | Engatinhar | Andar | Correr |
|---|---|---|---|---|
| 1 | Hierarquia de management group definida | ☐ Sem hierarquia | ☐ Hierarquia básica | ☐ Hierarquia alinhada ao CAF com segmentação |
| 2 | Azure Policy atribuída no escopo de MG | ☐ Sem políticas | ☐ Políticas fundamentais (regiões, tags) | ☐ Policy-as-code em CI/CD com políticas personalizadas |
| 3 | RBAC segue menor privilégio | ☐ Owner/Contributor amplo | ☐ Atribuições de função revisadas trimestralmente | ☐ PIM + acesso privilegiado permanente zero |
| 4 | Convenção de nomenclatura definida | ☐ Nomenclatura ad-hoc | ☐ Convenção documentada | ☐ Convenção aplicada via política |
| 5 | Estratégia de etiquetagem implementada | ☐ Sem tags ou inconsistente | ☐ Tags obrigatórias aplicadas | ☐ Herança de tags + dashboards de conformidade |
| 6 | Orçamentos e alertas de custo | ☐ Nenhum | ☐ Orçamentos por assinatura | ☐ FinOps com detecção de anomalias |
| 7 | Microsoft Defender for Cloud | ☐ Tier gratuito / não revisado | ☐ Tier aprimorado, recomendações triadas | ☐ Secure Score gerenciado, auto-remediação |
| 8 | Infrastructure as Code | ☐ Manual / portal | ☐ Bicep/Terraform para infra central | ☐ Todas as implantações via IaC + CI/CD |
| 9 | Monitoramento centralizado | ☐ Apenas por recurso | ☐ Workspace central de Log Analytics | ☐ Dashboards unificados, alertas e AIOps |
| 10 | Subscription vending | ☐ Criação manual de assinatura | ☐ Processo com template | ☐ Máquina de vending totalmente automatizada |
| 11 | Relatórios de governança | ☐ Nenhum | ☐ Revisões mensais de conformidade | ☐ Dashboards em tempo real + relatórios para liderança |
| 12 | Revisões de acesso | ☐ Sem revisões | ☐ Revisões manuais trimestrais | ☐ Revisões de acesso recorrentes automatizadas |

**Pontuação:**
- **Maioria Engatinhar:** Foque em estabelecer seu MVP de governança — hierarquia de management group, políticas fundamentais e uma convenção de nomenclatura.
- **Maioria Andar:** Você tem uma base sólida. Foque em automação, aplicação e expansão da cobertura de políticas.
- **Maioria Correr:** Você está operando em um nível maduro. Foque em melhoria contínua, otimização e inovação.

---

## Melhores Práticas

1. **Não pule níveis.** Cada nível de maturidade se constrói sobre o anterior. Pular de Engatinhar para Correr sem estabelecer os fundamentos do nível Andar cria governança frágil.
2. **Comece com uma base de governança MVP.** O CAF recomenda começar com: uma hierarquia de management group, um pequeno conjunto de políticas fundamentais, uma convenção de nomenclatura e atribuições RBAC. Esta é sua transição de Engatinhar para Andar.
3. **Itere com base no risco.** Conforme sua presença na nuvem cresce, adicione controles de governança onde o risco é maior. Não tente governar tudo de uma vez.
4. **Meça e reporte.** Governança sem medição é governança sem responsabilidade. Acompanhe taxas de conformidade de políticas, Secure Score, variação de custos e conclusão de revisões de acesso.
5. **Invista em automação no nível Andar.** A transição de Andar para Correr é principalmente sobre automação — policy-as-code, subscription vending, pipelines de IaC e remediação automatizada.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | O Que Fazer em Vez Disso |
|---|---|---|
| Tentar controles do nível Correr em uma base do nível Engatinhar | Políticas complexas falham sem uma hierarquia de management group, nomenclatura e RBAC | Construa a base primeiro; a complexidade vem depois |
| Sem equipe de governança ou CCoE | A governança se torna responsabilidade de ninguém, então não é feita | Estabeleça uma equipe de governança multifuncional até o nível Andar |
| Tratar maturidade como avaliação única | Ambientes de nuvem mudam; a maturidade pode regredir | Reavalie trimestralmente e ajuste os controles conforme o ambiente evolui |
| Focar apenas na governança de segurança | Estouros de custos e caos operacional são tão prejudiciais quanto violações de segurança | Aborde todas as cinco dimensões: Identidade, Política, Custo, Segurança, Operações |
| Ignorar a experiência do desenvolvedor | Governança que torna os desenvolvedores menos produtivos será contornada | Projete controles que sejam transparentes quando as equipes seguem as regras |

---

## Ações Recomendadas por Transição de Nível

### Engatinhar → Andar

| Ação | Prioridade |
|---|---|
| Projetar e implementar uma hierarquia de management group | 🔴 Crítica |
| Definir e documentar uma convenção de nomenclatura | 🔴 Crítica |
| Atribuir Azure Policies fundamentais (regiões permitidas, tags obrigatórias) | 🔴 Crítica |
| Habilitar segurança aprimorada do Microsoft Defender for Cloud | 🟡 Alta |
| Configurar orçamentos e alertas de custo por assinatura | 🟡 Alta |
| Implementar RBAC com menor privilégio | 🟡 Alta |
| Habilitar PIM para funções de Global Admin e Subscription Owner | 🟡 Alta |
| Adotar Bicep ou Terraform para infraestrutura central | 🟢 Média |
| Estabelecer um Cloud Center of Excellence (CCoE) | 🟢 Média |

### Andar → Correr

| Ação | Prioridade |
|---|---|
| Implementar policy-as-code com implantação via CI/CD | 🔴 Crítica |
| Automatizar subscription vending | 🟡 Alta |
| Implantar Azure Governance Visualizer em agendamento | 🟡 Alta |
| Implementar práticas de FinOps com chargeback/showback | 🟡 Alta |
| Habilitar remediação automatizada no Defender for Cloud | 🟡 Alta |
| Implantar Deployment Stacks para ciclo de vida de ambientes gerenciados | 🟢 Média |
| Implementar detecção de desvio para recursos gerenciados por IaC | 🟢 Média |
| Construir dashboards de governança com Azure Resource Graph + workbooks | 🟢 Média |
| Alcançar e manter Secure Score do Defender for Cloud > 80% | 🟢 Média |

---

## Exemplos de Código

### Azure Resource Graph — Consulta para Dashboard de Maturidade de Governança

Esta consulta conta recursos por estado de conformidade, fornecendo um sinal rápido de maturidade:

```kusto
policyresources
| where type == "microsoft.policyinsights/policystates"
| summarize
    compliant = countif(properties.complianceState == "Compliant"),
    nonCompliant = countif(properties.complianceState == "NonCompliant"),
    exempt = countif(properties.complianceState == "Exempt")
| extend total = compliant + nonCompliant + exempt
| extend complianceRate = round(100.0 * compliant / total, 2)
```

### Azure CLI — Verificar Secure Score do Defender for Cloud

```bash
az security secure-score-controls list \
  --output table \
  --query "[].{Control:displayName, Score:score.current, Max:score.max}"
```

---

## Exercício Prático

**Cenário:** Você foi solicitado a avaliar a maturidade de governança da sua organização e propor um roteiro.

1. **Complete a lista de verificação de autoavaliação** acima para sua organização.
2. **Identifique seu nível de maturidade atual** (Engatinhar, Andar ou Correr) para cada uma das cinco dimensões.
3. **Escolha as duas dimensões com a menor maturidade** e identifique três ações específicas das tabelas de "Ações Recomendadas" que moveriam essas dimensões um nível acima.
4. **Escreva um roteiro de governança de uma página** com marcos trimestrais para os próximos 12 meses.

> **Dica:** Use a [metodologia CAF Govern](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) como seu framework de referência ao construir o roteiro.

---

## Referências

| Recurso | Link |
|---|---|
| Metodologia CAF Govern | [learn.microsoft.com/azure/cloud-adoption-framework/govern/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) |
| Guia de governança empresarial padrão | [learn.microsoft.com/azure/cloud-adoption-framework/govern/guides/standard/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/guides/standard/) |
| Funções do Cloud Center of Excellence (CCoE) | [learn.microsoft.com/azure/cloud-adoption-framework/organize/cloud-center-of-excellence](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/cloud-center-of-excellence) |
| FinOps com Azure | [learn.microsoft.com/azure/cost-management-billing/finops/](https://learn.microsoft.com/azure/cost-management-billing/finops/) |

---

| Anterior | Próximo |
|:---|:---|
| [Capítulo 2 — Governança em Uma Visão Geral](ch02-governance-at-a-glance.md) | [Capítulo 4 — Hierarquia de Recursos](ch04-resource-hierarchy.md) |
