# Apêndice B — Árvores de Decisão

> Last verified: 2026-04-06

---

## Árvore de Decisão 1: Qual Ferramenta de Governança Devo Usar?

Use esta árvore de decisão para escolher o mecanismo de governança Azure correto para seu requisito.

```
INÍCIO: O que você deseja controlar?
│
├─► "Como os RECURSOS devem ser (configuração, propriedades)"
│   │
│   ├─► Deve impedir que recursos não conformes sejam criados?
│   │   │
│   │   ├─► SIM → Azure Policy (efeito Deny)
│   │   │   Exemplo: "Bloquear storage accounts sem HTTPS"
│   │   │
│   │   └─► NÃO → Você deseja auto-remediar?
│   │       │
│   │       ├─► SIM → Azure Policy (DeployIfNotExists / Modify)
│   │       │   Exemplo: "Auto-habilitar diagnostic settings"
│   │       │
│   │       └─► NÃO → Azure Policy (efeito Audit)
│   │           Exemplo: "Sinalizar VMs sem managed disks"
│   │
│   └─► É sobre configuração no nível de SO dentro de uma VM?
│       │
│       └─► SIM → Azure Machine Configuration (via Azure Policy)
│           Exemplo: "Garantir complexidade de senha em servidores Windows"
│
├─► "O que USUÁRIOS podem fazer (permissões, ações)"
│   │
│   ├─► É sobre acesso permanente?
│   │   │
│   │   └─► SIM → Azure RBAC (atribuições de role)
│   │       Exemplo: "Desenvolvedores recebem Contributor no resource group dev"
│   │
│   ├─► É sobre acesso temporário/privilegiado?
│   │   │
│   │   └─► SIM → PIM (Privileged Identity Management)
│   │       Exemplo: "Admins ativam role Owner por 4 horas"
│   │
│   └─► É sobre acesso condicional (localização, dispositivo, risco)?
│       │
│       └─► SIM → Microsoft Entra ID Conditional Access
│           Exemplo: "Exigir MFA de redes não confiáveis"
│
├─► "Prevenir exclusão ou modificação acidental de recursos"
│   │
│   ├─► É um único recurso crítico?
│   │   │
│   │   └─► SIM → Resource Lock (CanNotDelete ou ReadOnly)
│   │       Exemplo: "Bloquear o banco de dados SQL de produção"
│   │
│   └─► É um deployment inteiro gerenciado como código?
│       │
│       └─► SIM → Deployment Stack (deny settings)
│           Exemplo: "Prevenir alterações fora de banda no stack de rede"
│
└─► "Detectar e responder a ameaças de segurança"
    │
    └─► Microsoft Defender for Cloud
        ├─► Avaliação de postura → Defender CSPM
        ├─► Proteção de workloads → Defender for Servers, Containers, etc.
        └─► Monitoramento de conformidade → Dashboard de conformidade regulatória
```

---

## Árvore de Decisão 2: Como Devo Estruturar Meus Management Groups?

Use esta árvore de decisão para determinar o design correto de management groups para sua organização.

```
INÍCIO: Quantas subscriptions Azure sua organização tem (ou planeja ter)?
│
├─► 1–3 subscriptions
│   │
│   └─► Você tem requisitos regulatórios?
│       │
│       ├─► NÃO → Estrutura mínima:
│       │       Tenant Root Group
│       │       └── Sua Organização
│       │           ├── Produção (subscription)
│       │           ├── Não-Produção (subscription)
│       │           └── Sandbox (subscription)
│       │
│       │   Atribua políticas no nível "Sua Organização".
│       │
│       └─► SIM → Adicione um management group Regulado:
│               Tenant Root Group
│               └── Sua Organização
│                   ├── Regulado (subscriptions com necessidades de conformidade)
│                   ├── Geral (outras subscriptions)
│                   └── Sandbox
│
├─► 4–20 subscriptions
│   │
│   └─► Você tem serviços de plataforma centralizados (rede, logging)?
│       │
│       ├─► NÃO → Estrutura simples de Landing Zone:
│       │       Tenant Root Group
│       │       └── Sua Organização
│       │           ├── Produção
│       │           ├── Não-Produção
│       │           ├── Serviços Compartilhados
│       │           └── Sandbox
│       │
│       └─► SIM → Estrutura CAF Landing Zone:
│               Tenant Root Group
│               └── Sua Organização
│                   ├── Platform
│                   │   ├── Management
│                   │   ├── Connectivity
│                   │   └── Identity
│                   ├── Landing Zones
│                   │   ├── Corp
│                   │   └── Online
│                   └── Sandbox
│
└─► 20+ subscriptions
    │
    └─► Estrutura ALZ completa (recomendada):
            Tenant Root Group
            └── Sua Organização
                ├── Platform
                │   ├── Management
                │   ├── Connectivity
                │   └── Identity
                ├── Landing Zones
                │   ├── Corp
                │   ├── Online
                │   └── Regulado (se necessário)
                │       ├── HIPAA
                │       ├── PCI
                │       └── ...
                ├── Sandbox
                └── Decommissioned

        Considere adicionar subdivisões regionais ou
        por unidade de negócio sob Landing Zones se você
        tiver requisitos multi-região ou multi-BU.
```

**Princípios-chave independentemente do tamanho:**

- Nunca atribua políticas diretamente no Tenant Root Group
- Mantenha a profundidade em 3–4 níveis (6 é o máximo do Azure)
- Management groups representam limites de governança, não estrutura do organograma
- Planeje para crescimento — é mais fácil adicionar management groups do que reestruturar

---

## Árvore de Decisão 3: Qual Efeito de Política Devo Escolher?

Use esta árvore de decisão para selecionar o efeito de Azure Policy apropriado para seu requisito.

```
INÍCIO: O que deve acontecer quando um recurso corresponde à regra da política?
│
├─► "Quero BLOQUEAR recursos não conformes de serem criados ou modificados"
│   │
│   └─► Use: Deny
│       │
│       ├─► CUIDADO: Deny afeta TODOS os usuários, incluindo admins
│       ├─► DICA: Teste com Audit primeiro, depois mude para Deny
│       └─► EXEMPLO: "Negar storage accounts sem TLS 1.2"
│
├─► "Quero SINALIZAR recursos não conformes mas não bloqueá-los"
│   │
│   └─► Use: Audit
│       │
│       ├─► Recursos aparecem como "Não conforme" no dashboard de conformidade
│       ├─► Sem enforcement — recursos ainda são criados/modificados normalmente
│       └─► EXEMPLO: "Auditar VMs sem managed disks"
│
├─► "Quero CORRIGIR AUTOMATICAMENTE recursos não conformes"
│   │
│   ├─► A correção envolve implantar um RECURSO RELACIONADO?
│   │   │
│   │   └─► SIM → Use: DeployIfNotExists (DINE)
│   │       │
│   │       ├─► Implanta um recurso relacionado se não existir
│   │       ├─► Requer uma managed identity para remediação
│   │       ├─► Pode executar em recursos existentes via tarefas de remediação
│   │       └─► EXEMPLO: "Implantar diagnostic settings se não configurados"
│   │
│   └─► A correção envolve MODIFICAR propriedades no próprio recurso?
│       │
│       └─► SIM → Use: Modify
│           │
│           ├─► Adiciona, atualiza ou remove propriedades (tipicamente tags)
│           ├─► Requer uma managed identity para remediação
│           └─► EXEMPLO: "Herdar a tag Environment do resource group"
│
├─► "Quero ADICIONAR dados a um recurso durante a criação"
│   │
│   └─► Use: Append
│       │
│       ├─► Adiciona propriedades ao recurso durante create/update
│       ├─► Casos de uso limitados — Modify é geralmente preferível
│       └─► EXEMPLO: "Adicionar restrições de IP a um web app"
│
├─► "Quero que a política EXISTA mas não avalie"
│   │
│   └─► Use: Disabled
│       │
│       ├─► Política está atribuída mas não tem efeito
│       ├─► Útil para testes ou desativação temporária
│       └─► Prefira policy exemptions em vez de Disabled para escopos específicos
│
└─► "Preciso de ATESTAÇÃO MANUAL para conformidade"
    │
    └─► Use: Manual
        │
        ├─► Conformidade é determinada por atestação manual, não automação
        ├─► Usado para controles que não podem ser avaliados automaticamente
        └─► EXEMPLO: "Verificar se teste de recuperação de desastres foi conduzido"
```

**Tabela de referência rápida:**

| Efeito | Bloqueia Criação? | Auto-Remedia? | Caso de Uso |
|---|---|---|---|
| **Deny** | ✅ Sim | ❌ Não | Enforcement rígido — deve estar conforme |
| **Audit** | ❌ Não | ❌ Não | Visibilidade — entender conformidade |
| **DeployIfNotExists** | ❌ Não | ✅ Sim (recurso relacionado) | Auto-implantar configurações ausentes |
| **Modify** | ❌ Não | ✅ Sim (mesmo recurso) | Auto-corrigir propriedades (tags, configurações) |
| **Append** | ❌ Não | ❌ Não (apenas em create/update) | Adicionar propriedades durante deployment |
| **Disabled** | ❌ Não | ❌ Não | Desativar temporariamente uma política |
| **Manual** | ❌ Não | ❌ Não | Conformidade atestada por humano |

**Caminho de adoção recomendado:**

1. Comece com **Audit** para entender sua postura atual de conformidade
2. Habilite **DeployIfNotExists** / **Modify** para auto-remediação de problemas comuns
3. Mude para **Deny** para controles críticos quando as equipes estiverem cientes e recursos existentes estiverem conformes

---

| Anterior | Próximo |
|:---|:---|
| [Apêndice A — Glossário](appendix-a-glossary.md) | [Apêndice C — Kit Inicial de Políticas](appendix-c-policy-starter-kit.md) |
