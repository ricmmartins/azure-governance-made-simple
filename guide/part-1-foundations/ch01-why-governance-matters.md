# Capítulo 1 — Por Que a Governança em Nuvem É Importante

> **Last verified: 2026-04-06**

---

## Visão Geral

Toda organização que migra para a nuvem enfrenta uma tensão fundamental: **velocidade versus controle**. As equipes de engenharia querem a agilidade para provisionar recursos em minutos, enquanto a liderança precisa da garantia de que gastos, segurança e conformidade permaneçam dentro de limites aceitáveis. A governança em nuvem é a disciplina que resolve essa tensão — não desacelerando as equipes, mas incorporando proteções diretamente na plataforma.

### O Que É Governança em Nuvem?

Governança em nuvem é o conjunto de **políticas, processos e ferramentas** que uma organização utiliza para garantir que seu ambiente de nuvem opere em conformidade com os objetivos de negócio, requisitos regulatórios e padrões técnicos.

O Microsoft Cloud Adoption Framework (CAF) define governança como:

> *"O processo de estabelecer políticas e monitorar continuamente sua aplicação adequada. É um conjunto de controles e processos que garantem que os recursos do Azure sejam implantados e gerenciados de forma compatível e econômica."*

Governança não se trata de restringir a inovação — trata-se de criar as condições sob as quais a inovação pode acontecer de forma segura e sustentável.

---

## A Narrativa Velocidade vs. Controle

As empresas adotam a nuvem para serem mais ágeis e reduzir custos de infraestrutura. Há pressão para transformar e inovar digitalmente, mudando o foco do gerenciamento de servidores para encantar os clientes com serviços de alta qualidade. Isso impulsiona uma mudança natural para DevOps em ambientes de nuvem, onde os engenheiros provisionam os recursos necessários para suportar soluções — frequentemente em minutos em vez de semanas.

No entanto, essa agilidade tem um preço. Sem governança, muitas organizações experimentam o **Cloud Sprawl** — a proliferação descontrolada de recursos, assinaturas e configurações que leva a custos descontrolados, vulnerabilidades de segurança e falhas de conformidade. Esse padrão não é novo. No início dos anos 2000, a virtualização de servidores levou ao "VM sprawl." A resposta da indústria na época foi severa: inserir um processo de aprovação, fazer as equipes preencherem formulários, esperar duas semanas para a equipe de infraestrutura configurar um ambiente.

![Abordagem tradicional](../../images/traditional-approach.png)
<div align="center"><em>Abordagem tradicional — sacrificando velocidade por controle</em></div>
<br>

Essa abordagem não funciona na era da nuvem. Ela sacrifica exatamente a agilidade que motivou a migração em primeiro lugar.

### O Modelo de Governança Cloud-Native

Em um modelo de governança cloud-native, você alcança **velocidade e controle simultaneamente**. Em vez de colocar um gargalo de aprovação na frente de cada equipe de DevOps, a própria plataforma de nuvem aplica os controles em seu nome. As equipes operam por meio de um modelo de autoatendimento — têm acesso total para provisionar recursos, mas apenas dentro dos limites que a plataforma aplica automaticamente.

- Recursos que violam políticas são negados no momento da implantação.
- Os custos permanecem previsíveis e alinhados com os orçamentos.
- Os controles de segurança são herdados, não opcionais.
- A conformidade é contínua, não periódica.

![Abordagem de governança em nuvem](../../images/cloud-governance-approach.png)
<div align="center"><em>Modelo de governança cloud-native — velocidade e controle juntos</em></div>
<br>

---

## As Cinco Disciplinas de Governança em Nuvem do CAF

O Cloud Adoption Framework organiza a governança em **cinco disciplinas**. Cada disciplina aborda uma área específica de risco que surge quando as organizações operam na nuvem:

| Disciplina | O Que Aborda | Pergunta-Chave |
|---|---|---|
| **Cost Management** | Estouros de orçamento, gastos descontrolados, recursos órfãos | *Estamos gastando o que planejamos gastar?* |
| **Security Baseline** | Proteção de dados, detecção de ameaças, criptografia, segurança de rede | *Nossas cargas de trabalho estão protegidas contra ameaças?* |
| **Identity Baseline** | Autenticação, autorização, ciclo de vida de identidade, acesso privilegiado | *Apenas as pessoas certas têm acesso aos recursos certos?* |
| **Resource Consistency** | Organização de recursos, nomenclatura, etiquetagem, gerenciamento de ciclo de vida | *Podemos encontrar, gerenciar e operar nossos recursos de forma confiável?* |
| **Deployment Acceleration** | Infrastructure as Code, pipelines de CI/CD, desvio de configuração, aplicação de políticas | *Podemos implantar e atualizar ambientes de forma rápida, segura e repetível?* |

Essas cinco disciplinas não são silos independentes — elas se interconectam. Por exemplo, aplicar uma **Security Baseline** requer uma **Identity Baseline** sólida, e alcançar **Deployment Acceleration** depende de **Resource Consistency** por meio de convenções de nomenclatura e estratégias de etiquetagem.

> **Insight principal:** Você não precisa amadurecer todas as cinco disciplinas de uma vez. Comece pelas áreas de maior risco para sua organização e expanda ao longo do tempo.

> *Nota: Essas cinco disciplinas se originam do modelo de governança fundamental do CAF e continuam amplamente referenciadas. A metodologia atual do CAF Govern organiza a governança como um processo contínuo: construir uma equipe de governança, avaliar riscos, documentar políticas, aplicar políticas e monitorar conformidade.*

---

## Arquitetura

A governança em nuvem não existe isoladamente — ela está entrelaçada em cada camada da hierarquia de recursos do Azure. O diagrama abaixo mostra como as políticas de governança fluem do topo da hierarquia para baixo:

![Hierarquia de Governança do Azure e Modelo de Herança](/images/governance-hierarchy.svg)

Controles de governança — políticas, atribuições de função RBAC, orçamentos — são aplicados no nível do management group ou da assinatura e **herdados** por todos os escopos filhos. Esse modelo de herança é o que torna a governança cloud-native escalável.

---

## Como Funciona

1. **Defina políticas** que codifiquem as regras da sua organização (ex.: "Todas as contas de armazenamento devem usar endpoints privados").
2. **Atribua políticas** no escopo de management group ou assinatura para que se apliquem amplamente.
3. **O Azure Resource Manager avalia** cada solicitação de implantação contra as políticas atribuídas.
4. **Solicitações não conformes são negadas** no momento da implantação (ou sinalizadas para remediação, dependendo do efeito da política).
5. **Conformidade contínua** é avaliada — o Azure Policy verifica periodicamente os recursos existentes e reporta desvios.

Essa abordagem "shift-left" significa que violações de governança são detectadas **antes** que os recursos sejam implantados, não depois que um auditor as descobre meses depois.

---

## Melhores Práticas

1. **Comece com proteções, não com portões.** Use o Azure Policy para prevenir implantações não conformes em vez de fluxos de aprovação manuais.
2. **Aplique governança no escopo mais alto praticável.** Atribua políticas no nível do management group para garantir aplicação consistente em todas as assinaturas.
3. **Adote as cinco disciplinas do CAF como seu framework.** Mesmo que comece pequeno, estruture seu programa de governança em torno dessas disciplinas para que ele escale.
4. **Trate governança como código.** Defina políticas, atribuições de função e configurações de recursos em Bicep ou Terraform. Armazene-os em controle de versão.
5. **Estabeleça responsabilidades claras da equipe.** Defina quem é proprietário das decisões de governança (ex.: um Cloud Center of Excellence) e quem é responsável pela implementação.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | O Que Fazer em Vez Disso |
|---|---|---|
| Nenhuma governança até após a migração | A aplicação retroativa é dolorosa e disruptiva | Estabeleça governança fundamental antes da primeira carga de trabalho |
| Governança excessiva desde o primeiro dia | As equipes se rebelam contra restrições excessivas e encontram soluções alternativas | Comece com a governança mínima viável e itere |
| Governança como projeto único | Ambientes de nuvem evoluem; regras estáticas se tornam obsoletas | Trate a governança como um processo contínuo com revisões regulares |
| Propriedade de governança em silos | Equipes de segurança, finanças e plataforma definem regras conflitantes | Estabeleça uma equipe de governança multifuncional ou Cloud CoE |
| Ignorar a experiência do desenvolvedor | Se a governança dificulta a implantação, a adoção sofre | Projete proteções que sejam invisíveis para equipes que fazem a coisa certa |

---

## Exemplos de Código

### Azure Policy — Negar Recursos em Regiões Não Aprovadas

Esta política garante que os recursos só possam ser implantados em regiões aprovadas do Azure:

```json
{
  "properties": {
    "displayName": "Allowed locations",
    "policyType": "BuiltIn",
    "mode": "Indexed",
    "description": "Restricts resource deployment to approved regions.",
    "parameters": {
      "listOfAllowedLocations": {
        "type": "Array",
        "metadata": {
          "displayName": "Allowed locations",
          "description": "The list of locations that can be specified when deploying resources.",
          "strongType": "location"
        }
      }
    },
    "policyRule": {
      "if": {
        "not": {
          "field": "location",
          "in": "[parameters('listOfAllowedLocations')]"
        }
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

### Azure CLI — Atribuir a Política Interna "Allowed Locations"

```bash
az policy assignment create \
  --name "restrict-locations" \
  --display-name "Restrict to West Europe and North Europe" \
  --policy "e56962a6-4747-49cd-b67b-bf8b01975c4c" \
  --params '{"listOfAllowedLocations": {"value": ["westeurope", "northeurope"]}}' \
  --scope "/providers/Microsoft.Management/managementGroups/my-mg"
```

---

## Exercício Prático

**Cenário:** Sua organização está prestes a iniciar sua jornada na nuvem. Você foi solicitado a preparar uma base de governança.

1. **Identifique seus três principais riscos de governança.** Considere: gastos descontrolados, acesso não autorizado, implantação em regiões não aprovadas ou falta de visibilidade de recursos.
2. **Mapeie cada risco para uma disciplina do CAF.** Por exemplo, "gastos descontrolados" mapeia para Cost Management.
3. **Elabore uma regra de Azure Policy** (em JSON ou pseudocódigo) que mitigaria seu risco número um.
4. **Determine o escopo** onde você atribuiria esta política (management group, assinatura ou resource group) e justifique sua escolha.

> **Bônus:** Revise a [metodologia CAF Govern](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) e identifique qual disciplina de governança sua organização deve priorizar primeiro.

---

## Estrutura da Equipe e Responsabilidades

Alinhado com a governança, é importante ter uma estrutura bem definida em torno das responsabilidades entre diferentes equipes — especialmente se você está migrando de uma abordagem tradicional on-premises para um modelo cloud-native. Os seguintes recursos ajudarão você a amadurecer as estruturas de equipe e alinhar responsabilidades:

- [Amadurecer estruturas de equipe](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/organization-structures)
- [Alinhar responsabilidades entre equipes](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/raci-alignment)
- [Desenvolver habilidades técnicas](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/suggested-skills)

---

## Referências

| Recurso | Link |
|---|---|
| Metodologia CAF Govern | [learn.microsoft.com/azure/cloud-adoption-framework/govern/](https://learn.microsoft.com/azure/cloud-adoption-framework/govern/) |
| Amadurecer estruturas de equipe | [learn.microsoft.com/azure/cloud-adoption-framework/organize/organization-structures](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/organization-structures) |
| Alinhar responsabilidades entre equipes | [learn.microsoft.com/azure/cloud-adoption-framework/organize/raci-alignment](https://learn.microsoft.com/azure/cloud-adoption-framework/organize/raci-alignment) |
| Visão geral do Azure Policy | [learn.microsoft.com/azure/governance/policy/overview](https://learn.microsoft.com/azure/governance/policy/overview) |

---

| | Próximo |
|:---|:---|
| | [Capítulo 2 — Governança em Uma Visão Geral](ch02-governance-at-a-glance.md) |
