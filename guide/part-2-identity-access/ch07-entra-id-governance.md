# Capítulo 7 — Microsoft Entra ID Governance

> Last verified: 2026-04-06

---

## Visão Geral

Conceder acesso é fácil. Governá-lo ao longo do tempo — essa é a parte difícil.

**Microsoft Entra ID Governance** é um conjunto de capacidades que ajuda a equilibrar *produtividade* (pessoas obtêm o acesso que precisam, quando precisam) com *segurança* (o acesso é apropriado, revisado e revogado quando não é mais necessário). Ele se baseia na plataforma de identidade do Microsoft Entra ID e aborda o ciclo de vida completo da governança de identidade:

| Capacidade | Propósito |
|------------|-----------|
| **Privileged Identity Management (PIM)** | Acesso privilegiado just-in-time, com tempo limitado e aprovação |
| **Access Reviews** | Recertificação periódica de quem tem acesso a quê |
| **Entitlement Management** | Pacotes de acesso self-service com políticas e expiração |
| **Lifecycle Workflows** | Onboarding, mudanças de função e offboarding automatizados |
| **AI Agent Identity Governance** | Controles de governança para identidades de agentes de IA e cargas de trabalho |

Cada um funciona de forma independente, mas juntos formam uma estratégia abrangente de governança que mantém o acesso dimensionado corretamente e auditável.

---

## 7.1 Privileged Identity Management (PIM)

### O que é PIM e Por Que Importa

Acesso privilegiado permanente é um dos vetores de ataque mais comuns em ambientes de nuvem. Se uma conta de Global Administrator for comprometida, o raio de explosão é todo o seu tenant. **Privileged Identity Management (PIM)** elimina privilégios permanentes convertendo atribuições de função permanentes em atribuições *elegíveis* que devem ser **ativadas** sob demanda.

Pense assim: em vez de dar a alguém uma chave-mestra que carregam 24 horas por dia, você dá a capacidade de *solicitar* a chave por uma janela limitada, com um fluxo de aprovação e uma trilha de auditoria.

### Como Funciona

![PIM Activation Flow](/images/pim-activation-flow.svg)

1. **Atribuição elegível** — o usuário é *elegível* para uma função, mas não a tem ativa. Nenhuma permissão até que ative.
2. **Ativação** — o usuário solicita ativação pelo portal do Azure, Microsoft Graph API ou PowerShell. Deve satisfazer quaisquer requisitos configurados (MFA, justificativa, aprovação).
3. **Acesso com tempo limitado** — uma vez ativada, a função fica ativa por uma duração máxima (ex.: 8 horas) e então é automaticamente desativada.
4. **Trilha de auditoria** — toda ativação, aprovação e expiração é registrada e disponível no log de auditoria do Microsoft Entra.

### PIM para Azure Resources vs. PIM para Funções do Microsoft Entra ID

| Dimensão | PIM para Azure Resources | PIM para Funções do Entra ID |
|----------|--------------------------|------------------------------|
| **Escopo** | Management group, subscription, resource group ou recurso | Funções de diretório do Entra ID em todo o tenant |
| **Funções** | Funções Azure RBAC (Owner, Contributor, custom roles, etc.) | Funções do Entra ID (Global Administrator, User Administrator, etc.) |
| **Ativação** | Ativação por escopo | Ativação no nível do tenant |
| **Caso de uso** | Governar quem pode gerenciar infraestrutura Azure | Governar quem pode gerenciar identidade e configuração do tenant |

> **Ponto-chave:** Você deve configurar PIM para *ambos* — recursos Azure e funções do Entra ID. Um Global Administrator comprometido pode redefinir qualquer senha; um Owner de subscription comprometido pode excluir qualquer recurso.

### Melhores Práticas

1. **Exija MFA para toda ativação** — este é o controle mais eficaz. Mesmo que as credenciais sejam comprometidas, o atacante não consegue ativar a função sem o segundo fator.

2. **Defina a duração máxima de ativação para a janela mínima prática** — 8 horas é o padrão comum, mas muitas tarefas exigem apenas 1–2 horas. Janelas mais curtas reduzem a exposição.

3. **Configure fluxos de aprovação para funções de alto impacto** — funções como Owner, Global Administrator e Security Administrator devem exigir aprovação de um aprovador designado.

4. **Use atribuições elegíveis, não permanentes** — as únicas atribuições permanentes devem ser contas break-glass (e essas devem ser monitoradas com alertas).

5. **Habilite alertas do PIM** — configure notificações para ativações e quando atribuições elegíveis estiverem prestes a expirar.

6. **Combine PIM com Access Reviews** — configure revisões recorrentes de quem é *elegível* para funções privilegiadas (veja a seção 7.2).

---

## 7.2 Access Reviews

### O que são Access Reviews

Access reviews são um mecanismo integrado para verificar periodicamente se os usuários ainda precisam do acesso que lhes foi concedido. Sem elas, o acesso se acumula ao longo do tempo — um fenômeno às vezes chamado de *"privilege creep"* ou *"acúmulo de acessos"*.

As access reviews do Microsoft Entra podem ter como alvo:

- **Associações a grupos** — cada membro ainda é apropriado?
- **Atribuições de aplicativos** — este usuário ainda deve ter acesso a este app SaaS?
- **Atribuições de funções Azure** — esta pessoa ainda precisa de Contributor nesta subscription?
- **Atribuições de funções do Microsoft Entra ID** — este usuário ainda deve ser elegível para Global Reader?
- **Atribuições de pacotes de acesso** — o projeto do usuário terminou?

### Como Funciona

1. **Criar uma revisão** — um administrador define o escopo (qual grupo, função ou pacote), os revisores (autorrevisão, gerente, proprietário do recurso ou usuários específicos) e a recorrência (única, semanal, mensal, trimestral).
2. **Período de revisão inicia** — os revisores recebem um e-mail e um link para o portal My Access onde aprovam ou negam o acesso continuado de cada usuário.
3. **Remediação automática** — quando o período de revisão encerra, usuários negados podem ser removidos automaticamente. Nenhuma limpeza manual necessária.
4. **Log de auditoria** — todas as decisões são registradas e exportáveis.

### Melhores Práticas

1. **Execute revisões trimestrais no mínimo** — revisões anuais permitem que acessos obsoletos persistam por tempo demais. Trimestral atinge um bom equilíbrio entre segurança e fadiga dos revisores.

2. **Habilite remoção automática para acessos negados** — acompanhamento manual não é confiável. Deixe o sistema executar a decisão.

3. **Envolva proprietários de recursos como revisores** — gerentes podem não saber o que um resource group contém. A equipe que possui o recurso está mais bem posicionada para julgar.

4. **Use revisões em múltiplos estágios para recursos sensíveis** — uma primeira passagem pelo gerente do usuário, seguida por uma segunda passagem pelo proprietário do recurso.

5. **Revise atribuições elegíveis do PIM** — não revise apenas o acesso ativo; revise quem é *elegível* para ativar funções privilegiadas.

---

## 7.3 Entitlement Management

### O que é Entitlement Management

Entitlement Management permite agrupar direitos de acesso relacionados — associações a grupos, atribuições de aplicativos, sites do SharePoint e funções Azure — em **pacotes de acesso (access packages)**. Os usuários podem então solicitar esses pacotes por meio de um portal self-service, com aprovação orientada por políticas, expiração e revisão periódica incorporadas.

Pense em um access package como um "kit inicial de projeto": quando alguém entra no projeto Contoso Analytics, solicita o access package *Contoso Analytics* e recebe automaticamente as associações ao security group, o acesso ao workspace do Power BI e a função Contributor no resource group do projeto.

### Conceitos-Chave

| Conceito | Descrição |
|----------|-----------|
| **Access Package** | Um pacote nomeado de acesso a recursos (grupos, apps, funções, sites). |
| **Catalog** | Um container para organizar access packages. Frequentemente alinhado com unidades de negócio ou projetos. |
| **Policy** | Regras que governam quem pode solicitar, quem aprova, quanto tempo o acesso dura e se revisões são necessárias. |
| **Connected Organization** | Uma organização externa cujos usuários podem solicitar access packages — crítico para colaboração B2B. |
| **Automatic Assignment Policy** | Regras que atribuem ou removem automaticamente access packages com base em atributos do usuário (ex.: department = "Engineering"). |

### Melhores Práticas

1. **Use access packages para acesso baseado em projetos** — quando um projeto começa, crie um pacote. Quando termina, expire o pacote. Sem permissões residuais.

2. **Defina políticas de expiração** — toda atribuição deve ter uma duração máxima. Usuários podem solicitar renovação, o que dispara um novo ciclo de aprovação.

3. **Delegue o gerenciamento de catálogos para proprietários de negócio** — TI não deve ser o gargalo para criar pacotes. Deixe líderes de departamento gerenciarem seus próprios catálogos.

4. **Combine com access reviews** — access packages podem exigir revisões periódicas de acesso, garantindo que atribuições de longa duração ainda sejam válidas.

5. **Use políticas de atribuição automática** — para acesso universal dentro de um departamento (ex.: todos os engenheiros precisam da ferramenta de CI/CD), use atribuição automática baseada em atributos em vez de exigir solicitações individuais.

---

## 7.4 Lifecycle Workflows

### O que são Lifecycle Workflows

Lifecycle Workflows automatizam tarefas relacionadas a identidade disparadas por mudanças no ciclo de vida do usuário — contratação, mudanças de função e desligamento. Em vez de depender de chamados de TI e checklists manuais, você define **workflows** que executam automaticamente quando condições específicas são atendidas.

### Cenários

| Cenário | Gatilho | Tarefas de Exemplo |
|---------|---------|-------------------|
| **Pré-contratação** | Antes da data de início do funcionário | Gerar um temporary access pass, criar a conta de usuário, enviar e-mail de boas-vindas |
| **Joiner** | Primeiro dia do funcionário (ou atributo de data de contratação) | Adicionar a grupos padrão, atribuir licenças, provisionar access packages |
| **Mover** | Mudanças de departamento ou cargo | Atualizar associações a grupos, revogar access packages antigos, atribuir novos pacotes |
| **Leaver** | Último dia de trabalho ou data de desligamento | Revogar todo acesso, remover de grupos, desabilitar conta, disparar retenção de dados |

### Gatilhos Baseados em Atributos

Lifecycle Workflows são orientados por **atributos de usuário** no Microsoft Entra ID — principalmente `employeeHireDate`, `employeeLeaveDateTime`, `department`, `jobTitle` e `companyName`. Os workflows avaliam esses atributos em um agendamento e disparam quando as condições são atendidas.

A partir de 2026, a Microsoft expandiu o conjunto de atributos de gatilho suportados, incluindo custom security attributes e extension attributes provisionados por RH, proporcionando controle muito mais refinado sobre quando os workflows disparam (ex.: disparar na mudança de `costCenter` ou transição de `employeeType` de terceirizado para efetivo).

### Integração com Sistemas de RH

Lifecycle Workflows são mais poderosos quando combinados com **provisionamento de entrada de sistemas de RH** (Workday, SAP SuccessFactors ou RH customizado via API de inbound provisioning). O sistema de RH se torna a fonte autoritativa de eventos do ciclo de vida:

![Lifecycle Workflow Flow](/images/lifecycle-workflow-flow.svg)

### Melhores Práticas

1. **Automatize o provisionamento do Dia 1** — novos funcionários devem ter contas, associações a grupos e licenças antes de entrarem pela porta.

2. **Automatize o offboarding do Dia 0** — no momento em que o RH marca alguém como desligado, desabilite a conta e revogue o acesso. Não espere por um chamado de helpdesk.

3. **Use o cenário de mover** — é o mais negligenciado. Quando alguém transfere de departamento, o acesso antigo deve ser removido e o novo acesso concedido automaticamente.

4. **Teste workflows em um tenant de não-produção** — lifecycle workflows podem ter efeitos abrangentes. Teste cuidadosamente.

5. **Monitore a execução dos workflows** — revise o log de auditoria de Lifecycle Workflows regularmente para identificar falhas.

---

## 7.5 AI Agent Identity Governance

### O Desafio: IA como Identidade de Primeira Classe

À medida que organizações implantam agentes de IA — sistemas autônomos que chamam APIs, acessam dados e tomam decisões — um novo desafio de governança emerge. A governança tradicional pressupõe que há um humano no loop. Agentes de IA operam de forma autônoma, frequentemente em escala e velocidade que tornam a supervisão manual impraticável.

### Microsoft Entra Agent ID

A Microsoft introduziu o **Agent ID** como um tipo de identidade de primeira classe dentro do Microsoft Entra ID. Um Agent ID representa um agente de IA ou carga de trabalho autônoma e é distinto de service principals e managed identities:

- **Projetado para agentes de IA** — Agent IDs carregam metadados sobre o propósito do agente, equipe proprietária e restrições operacionais.
- **Consciente de governança** — Agent IDs se integram com Conditional Access, PIM e access reviews assim como identidades de usuário e carga de trabalho.
- **Auditável** — toda ação tomada por um Agent ID é registrada com a identidade do agente, tornando possível rastrear decisões autônomas até um agente específico e sua configuração.

### Governança e Políticas de Acesso para Agentes de IA

Os princípios de governança se aplicam a agentes de IA assim como a usuários humanos — possivelmente ainda mais, dada sua velocidade e autonomia:

| Princípio | Como se Aplica a Agentes de IA |
|-----------|-------------------------------|
| **Menor privilégio** | Conceda aos agentes apenas o acesso a dados e APIs que precisam. Um agente de sumarização não precisa de acesso de escrita a bancos de dados de produção. |
| **Acesso com tempo limitado** | Use atribuições elegíveis no estilo PIM para que agentes ativem permissões elevadas apenas quando necessário. |
| **Conditional Access** | Aplique políticas de Conditional Access a Agent IDs — restrinja por localização de rede, exija contexto de dispositivo em conformidade para o orquestrador e aplique limites de tempo de vida de token. |
| **Access reviews** | Inclua Agent IDs em revisões periódicas de acesso. Quando um agente é descomissionado ou seu escopo muda, seu acesso deve ser revogado. |
| **Avaliação de risco** | Microsoft Entra ID Protection pode avaliar risco de login para Agent IDs em tempo real, detectando padrões anômalos como volumes incomuns de chamadas de API ou acesso de localizações inesperadas. |

### Melhores Práticas

1. **Trate cada agente de IA como uma identidade distinta** — não compartilhe service principals entre agentes. Cada agente deve ter seu próprio Agent ID com propriedade clara.

2. **Atribua um proprietário a cada Agent ID** — assim como aplicações, agentes precisam de um humano ou equipe responsável por seu acesso e comportamento.

3. **Aplique políticas de Conditional Access** — agentes não devem ser isentos da sua postura de segurança. Use Conditional Access de identidade de carga de trabalho.

4. **Inclua agentes nas access reviews** — revisões trimestrais devem cobrir Agent IDs junto com acesso de usuários e service principals.

5. **Monitore com logs de identidade de carga de trabalho do Microsoft Entra** — rastreie emissão de tokens, chamadas de API e atividade anômala para cada Agent ID.

---

## Armadilhas Comuns

| Armadilha | Por Que Prejudica | Correção |
|-----------|-------------------|----------|
| Deixar atribuições permanentes de Global Admin | Se qualquer uma dessas contas for comprometida, o atacante tem controle total do tenant. | Converta para atribuições elegíveis do PIM; mantenha no máximo duas contas break-glass como permanentes. |
| Pular access reviews porque "confiamos em nossas pessoas" | O acesso se acumula silenciosamente. Após 18 meses, metade das atribuições são obsoletas. | Exija revisões trimestrais para todas as funções privilegiadas e grupos sensíveis. |
| Usar entitlement management sem expiração | Access packages se tornam apenas mais uma forma de conceder acesso permanente. | Sempre defina uma duração máxima de atribuição. |
| Não automatizar o offboarding | Ex-funcionários mantêm acesso por dias ou semanas após o desligamento. | Implemente lifecycle workflows conectados ao seu sistema de RH. |
| Ignorar governança de agentes de IA | Agentes acumulam permissões, agem de forma autônoma e ninguém revisa seu acesso. | Registre agentes com Agent ID, aplique Conditional Access e inclua nas access reviews. |

---

## Referências

- [O que é Microsoft Entra ID Governance?](https://learn.microsoft.com/entra/id-governance/identity-governance-overview)
- [Documentação do Privileged Identity Management](https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure)
- [Visão geral das Access Reviews](https://learn.microsoft.com/entra/id-governance/access-reviews-overview)
- [Visão geral do Entitlement Management](https://learn.microsoft.com/entra/id-governance/entitlement-management-overview)
- [Visão geral dos Lifecycle Workflows](https://learn.microsoft.com/entra/id-governance/what-are-lifecycle-workflows)
- [Workload Identity Federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [Microsoft Entra ID Protection para identidades de carga de trabalho](https://learn.microsoft.com/entra/id-protection/concept-workload-identity-risk)
- [RBAC — Capítulo 6](ch06-rbac.md)
- [Managed Identities — Capítulo 8](ch08-managed-identities.md)

---

Anterior | Próximo
:--- | :---
[Capítulo 6 — RBAC](ch06-rbac.md) | [Capítulo 8 — Managed Identities & Workload Identity](ch08-managed-identities.md)
