# Capítulo 30 — Perguntas Frequentes

> Last verified: 2026-04-06

---

## 1. Preciso de tudo isso para um ambiente Azure pequeno?

**Não.** A governança deve ser proporcional ao tamanho, risco e requisitos regulatórios do seu ambiente. Uma startup com uma subscription e uma equipe pequena precisa de governança fundamental — MFA, uma convenção de nomenclatura, algumas políticas essenciais e budgets. Isso é suficiente para começar.

O modelo de maturidade Crawl-Walk-Run (veja o Capítulo 28 e o Estudo de Caso 1) mostra que você pode implementar governança significativa em uma única semana. Você não precisa de management groups, Policy as Code ou Azure Landing Zones no primeiro dia. Comece com o básico e adicione complexidade apenas quando seu ambiente exigir.

**Governança mínima viável:**
- Aplicar MFA para todos os usuários
- Definir uma convenção de nomenclatura
- Atribuir 3–5 políticas essenciais (modo Audit)
- Definir um budget com alertas
- Habilitar Microsoft Defender for Cloud (tier gratuito)

---

## 2. Qual a diferença entre governança, gestão e conformidade?

Esses termos são relacionados mas distintos:

| Termo | Definição | Exemplo |
|---|---|---|
| **Governança** | As regras, políticas e processos que definem *como* recursos cloud devem ser utilizados | "Todos os recursos devem ter uma tag `Owner`" |
| **Gestão** | As operações do dia a dia de monitorar, manter e otimizar recursos | "Revisar alertas do Azure Monitor diariamente" |
| **Conformidade** | Demonstrar que seu ambiente atende a padrões regulatórios ou organizacionais específicos | "Todas as storage accounts criptografam dados em repouso (requisito SOC 2)" |

Governança define as regras. Gestão aplica e opera dentro dessas regras. Conformidade prova que as regras estão sendo seguidas.

---

## 3. Devo usar Azure Policy ou RBAC para restringir ações?

**Use ambos — eles servem propósitos diferentes.**

| Mecanismo | O que Controla | Exemplo |
|---|---|---|
| **Azure Policy** | Como os *recursos* devem ser (propriedades, configurações) | "Storage accounts devem usar TLS 1.2" |
| **RBAC** | O que os *usuários* podem fazer (ações, operações) | "Desenvolvedores podem implantar em dev, mas não em produção" |

**Regra geral:**
- Use **Azure Policy** quando a restrição é sobre *configuração de recurso* — independentemente de quem implanta
- Use **RBAC** quando a restrição é sobre *quem pode executar uma ação*

Por exemplo, "sem endereços IP públicos" é uma preocupação de Policy. "Apenas administradores de plataforma podem modificar recursos de rede" é uma preocupação de RBAC.

---

## 4. Como começo com governança se já tenho recursos implantados?

Este é o cenário mais comum. A maioria das organizações adota governança *após* os recursos já estarem no Azure.

**Abordagem recomendada:**

1. **Avalie** — Use Azure Resource Graph para inventariar todos os recursos, tags e configurações. Execute Microsoft Defender for Cloud para obter um Secure Score.
2. **Atribua políticas em modo Audit** — Não comece com Deny. O modo Audit mostra o que *seria* não conforme sem bloquear nada.
3. **Remedie** — Endereça os recursos não conformes de maior impacto primeiro (recursos sem tags, endpoints públicos, criptografia ausente).
4. **Aplique** — Quando a conformidade estiver acima de 80%, mude políticas críticas para Deny ou DeployIfNotExists.
5. **Itere** — Governança é contínua. Adicione novas políticas conforme suas necessidades evoluem.

> **Importante:** Nunca mude uma política de Audit para Deny sem antes notificar todas as equipes afetadas e remediar violações existentes.

---

## 5. O que aconteceu com o Azure Blueprints?

**Azure Blueprints foi descontinuado.** A Microsoft anunciou a descontinuação em 2024 e recomenda migrar para **Deployment Stacks** para a maioria dos casos de uso de Blueprints.

| Capacidade do Blueprints | Substituto |
|---|---|
| Empacotar templates ARM + políticas + RBAC | **Deployment Stacks** — implantar templates Bicep/ARM com deny settings e limpeza ao excluir |
| Definições de ambiente versionadas | **Template Specs** ou **módulos Bicep** em um registry |
| Atribuição de políticas em um pacote | **Policy as Code** (EPAC ou pipelines CI/CD) |
| Atribuição de RBAC em um pacote | Módulos RBAC em **Bicep/Terraform** |

Se você atualmente usa Blueprints, planeje sua migração para Deployment Stacks. Veja o Capítulo 14 (Deployment Stacks) para detalhes.

---

## 6. Devo usar Bicep ou Terraform?

**Ambos são excelentes escolhas.** A decisão depende das habilidades da sua equipe, requisitos multi-cloud e preferências de ecossistema.

| Fator | Bicep | Terraform |
|---|---|---|
| Azure-native | ✅ First-party, fortemente integrado | Third-party (provider AzureRM) |
| Multi-cloud | Apenas Azure | AWS, GCP, Azure e mais |
| Gerenciamento de estado | Sem arquivo de estado (usa histórico de deployment ARM) | Requer arquivo de estado (local, Azure Storage, Terraform Cloud) |
| Curva de aprendizado | Menor para equipes focadas em Azure | Moderada; sintaxe HCL é diferente de ARM/Bicep |
| Módulos da comunidade | Azure Verified Modules (AVM) | Terraform Registry (ecossistema massivo) |
| Policy as Code | EPAC (baseado em PowerShell) | Terraform nativo + Sentinel |

**Recomendação:** Se sua organização é exclusivamente Azure, Bicep é a escolha mais simples. Se você opera em um ambiente multi-cloud ou sua equipe já conhece Terraform, Terraform é a escolha pragmática. Evite usar ambos na mesma organização a menos que haja uma razão clara para isso.

---

## 7. Quantos níveis de management groups devo ter?

**No máximo seis níveis** (o Azure impõe este limite). A maioria das organizações precisa apenas de **três a quatro níveis**:

![Hierarquia de Management Groups](/images/faq-mg-hierarchy.svg)

**Erro comum:** Criar management groups que espelham o organograma (um por departamento, um por equipe). Isso leva a profundidade excessiva e complexidade de políticas. Management groups devem representar *limites de governança*, não hierarquia organizacional.

---

## 8. Qual é o conjunto mínimo de políticas que devo implantar?

Comece com estas políticas de alto impacto e baixo risco em **modo Audit**:

1. **Exigir uma tag em resource groups** — Tag `Environment` no mínimo
2. **Localizações permitidas** — Restringir às suas regiões Azure aprovadas
3. **Auditar VMs sem managed disks** — Baseline de segurança e gerenciabilidade
4. **Auditar storage accounts permitindo acesso público** — Proteção de dados
5. **Auditar recursos sem resource locks** — Proteção para recursos críticos

Quando estiver confortável, adicione políticas de aplicação:

6. **Negar endereços IP públicos** (no management group Corp)
7. **DeployIfNotExists: Habilitar Azure Monitor Agent** — Garantir monitoramento
8. **Negar storage accounts sem HTTPS** — Criptografia em trânsito
9. **Exigir valores específicos de tag** (ex.: `Environment` deve ser `prod`, `dev`, `staging`)
10. **Negar bancos de dados SQL sem criptografia** — Criptografia de dados em repouso

Veja o Apêndice C para um kit inicial completo de 30 políticas recomendadas.

---

## 9. Como governar workloads de IA?

Governança de IA requer controles em múltiplos níveis:

1. **Controle de acesso** — Use autenticação Microsoft Entra ID (não chaves de API) para Azure OpenAI Service. Atribua o role `Cognitive Services OpenAI User` via RBAC.
2. **Segurança de conteúdo** — Mantenha os filtros de conteúdo padrão habilitados. Crie configurações de filtro customizadas apenas com aprovação do comitê de governança.
3. **Rate limiting** — Defina cotas de Tokens Per Minute (TPM) por deployment para evitar custos descontrolados.
4. **Isolamento de rede** — Exija private endpoints para recursos Azure OpenAI.
5. **Log de auditoria** — Habilite diagnostic settings para registrar todas as chamadas de API.
6. **Detecção de shadow AI** — Use Microsoft Defender for Cloud Apps para detectar uso não autorizado de serviços de IA.

Veja o Capítulo 27 (Governança de IA) para um guia abrangente.

---

## 10. Qual a diferença entre Resource Locks e deny settings de Deployment Stacks?

Ambos previnem alterações indesejadas, mas funcionam de maneiras diferentes:

| Recurso | Resource Locks | Deny Settings de Deployment Stack |
|---|---|---|
| Escopo | Recurso individual ou resource group | Todos os recursos gerenciados pelo stack |
| Tipos de lock | CanNotDelete, ReadOnly | DenyDelete, DenyWriteAndDelete |
| Override | Usuários com permissão `Microsoft.Authorization/locks/write` | Usuários na lista excludePrincipals |
| Ciclo de vida | Independente do deployment | Vinculado ao ciclo de vida do Deployment Stack |
| Proteção contra órfãos | Não | Sim — excluir o stack pode limpar recursos |
| Melhor para | Proteger recursos críticos individuais | Proteger deployments inteiros contra drift |

**Use Resource Locks** para proteção pontual de recursos críticos (ex.: um banco de dados de produção). **Use deny settings de Deployment Stack** quando você gerencia infraestrutura como código e quer prevenir alterações fora de banda em todo o deployment.

---

## 11. Com que frequência devo executar access reviews?

| Tipo de Role | Frequência Recomendada |
|---|---|
| Global Administrator, Subscription Owner | Mensal |
| Roles privilegiados (Contributor, Security Admin) | Trimestral |
| Acesso a aplicações (roles de reader, service principals) | Semestral |
| Acesso de usuários convidados | Trimestral |

Access Reviews no Microsoft Entra ID podem ser automatizadas com auto-apply, então os revisores só precisam confirmar ou negar acesso continuado. Configure lembretes e escalonamento para revisores que não respondem.

---

## 12. Devo usar managed identities system-assigned ou user-assigned?

| Critério | System-Assigned | User-Assigned |
|---|---|---|
| Ciclo de vida | Vinculada ao recurso — excluída quando o recurso é excluído | Independente — existe até você excluí-la |
| Compartilhamento | Uma identidade por recurso | Uma identidade pode ser atribuída a múltiplos recursos |
| Gerenciamento | Mais simples para cenários de recurso único | Mais flexível para padrões de acesso compartilhado |
| Melhor para | VM ou App Service única acessando Key Vault | Múltiplas VMs ou apps compartilhando o mesmo acesso a banco de dados |

**Recomendação:** Use **system-assigned** para cenários simples de recurso único. Use **user-assigned** quando múltiplos recursos precisam das mesmas permissões, ou quando você precisa que a identidade persista independentemente de qualquer recurso individual.

---

## 13. Como aplicar tags em toda a organização?

Uma abordagem em múltiplas camadas funciona melhor:

1. **Azure Policy — Exigir tags em resource groups:**
   - Efeito: `Deny` — Resource groups não podem ser criados sem as tags obrigatórias

2. **Azure Policy — Herdar tags do resource group:**
   - Efeito: `Modify` — Recursos herdam automaticamente tags do seu resource group

3. **Azure Policy — Exigir tags em recursos:**
   - Efeito: `Audit` ou `Deny` — Sinalizar ou bloquear recursos sem tags obrigatórias

4. **Validação em pipeline CI/CD:**
   - Verificar tags obrigatórias em templates Bicep/Terraform antes do deployment

5. **Remediação regular:**
   - Executar tarefas de remediação para aplicar políticas `Modify` em recursos existentes

**Tags obrigatórias recomendadas:** `Environment`, `Owner`, `CostCenter`, `Application`

---

## 14. Quais frameworks de conformidade o Azure suporta nativamente?

Microsoft Defender for Cloud fornece avaliações de conformidade regulatória built-in para muitos frameworks:

| Framework | Região/Indústria |
|---|---|
| Microsoft Cloud Security Benchmark (MCSB) | Global |
| SOC 2 Type 2 | Global |
| ISO 27001:2022 | Global |
| PCI-DSS v4.0 | Indústria de cartões de pagamento |
| HIPAA / HITRUST | Saúde nos EUA |
| FedRAMP High | Governo federal dos EUA |
| NIST SP 800-53 Rev. 5 | Governo dos EUA |
| CIS Azure Benchmark | Global |
| GDPR | União Europeia |
| Australia IRAP | Austrália |
| Canada PBMM | Canadá |
| UK OFFICIAL / NHS | Reino Unido |
| NIS2 | União Europeia |

Você também pode adicionar padrões de conformidade customizados criando initiatives de política customizadas que mapeiam controles para os requisitos específicos da sua organização.

---

## 15. Como acompanhar o progresso da governança ao longo do tempo?

Use uma combinação de ferramentas e métricas:

1. **Tendência do Secure Score** — Monitore o Secure Score do Microsoft Defender for Cloud semanalmente. Deve ter tendência de alta.

2. **Porcentagem de conformidade com políticas** — Monitore a taxa geral de conformidade no dashboard do Azure Policy. Meta: >90%.

3. **Relatórios do AzGovViz** — Execute AzGovViz semanal ou diariamente para gerar relatórios abrangentes de governança mostrando atribuições de políticas, RBAC e estrutura de management groups.

4. **Queries do Azure Resource Graph** — Escreva queries para monitorar métricas específicas (recursos sem tags, endpoints públicos, locks ausentes). Veja o Apêndice D para queries iniciais.

5. **Tendências de custo** — Monitore variações de custo mês a mês. A governança deve estabilizar ou reduzir custos ao longo do tempo.

6. **Achados de auditoria** — Monitore o número de achados de auditoria relacionados à governança. Deve diminuir ao longo do tempo.

7. **Dashboard de governança** — Construa um workbook do Azure Monitor ou dashboard do Power BI que agregue todas as métricas de governança em um único lugar.

---

## 16. Posso usar Azure Policy para aplicar configurações dentro de máquinas virtuais?

**Sim** — via **Azure Machine Configuration** (anteriormente Guest Configuration). Machine Configuration usa Azure Policy para auditar e aplicar configurações dentro do sistema operacional guest:

- Requisitos de complexidade de senha
- Inventário de software instalado
- Configurações do Windows Registry
- Permissões de arquivo Linux
- Status de serviço (em execução/parado)
- Conformidade com benchmark CIS

Machine Configuration funciona em VMs Azure e servidores Azure Arc-enabled, fornecendo governança consistente no nível de SO em ambientes híbridos.

---

## 17. Como lidar com exceções às políticas de governança?

Use **Azure Policy exemptions** com estas diretrizes:

1. **Sempre defina uma data de expiração** — Exemptions devem ser temporárias. Defina um período máximo de exemption (ex.: 90 dias).
2. **Documente a justificativa** — Toda exemption deve ter uma razão clara e um registro de aprovação.
3. **Use a categoria `Waiver`** — Para desvios intencionais. Use `Mitigated` apenas quando um controle alternativo existe.
4. **Revise regularmente** — Inclua revisões de exemptions na sua cadência mensal de governança.
5. **Monitore em um registro central** — Use Azure Resource Graph para consultar todas as exemptions ativas:

```kusto
policyresources
| where type == "microsoft.authorization/policyexemptions"
| extend expiresOn = properties.expiresOn,
         category = properties.exemptionCategory,
         displayName = properties.displayName
| project name, displayName, category, expiresOn, resourceGroup
| order by expiresOn asc
```

---

## 18. Qual a diferença entre uma Policy Initiative e uma Policy individual?

Uma **Policy Definition** é uma regra individual (ex.: "Storage accounts devem usar HTTPS"). Uma **Policy Initiative** (também chamada de Policy Set) é um grupo de definições de política relacionadas atribuídas juntas.

**Quando usar initiatives:**
- Quando você quer monitorar conformidade contra um framework (ex.: MCSB, PCI-DSS)
- Quando múltiplas políticas são sempre atribuídas juntas
- Quando você quer um score de conformidade único para um grupo de controles

**Exemplo:** O "Microsoft Cloud Security Benchmark" é uma initiative contendo 200+ definições de políticas individuais em múltiplos domínios de segurança.

---

## 19. Devo atribuir políticas no nível de management group ou subscription?

**Prefira o nível de management group.** Atribuir políticas no nível de management group garante aplicação consistente em todas as subscriptions filhas — incluindo quaisquer subscriptions criadas no futuro.

| Nível de Atribuição | Quando Usar |
|---|---|
| Management group | Padrão para todas as políticas amplas de governança |
| Subscription | Políticas baseadas em exceção ou específicas da subscription |
| Resource group | Raramente; apenas para controles muito específicos |

Atribua políticas amplas (tags, regiões permitidas, baselines de segurança) no management group aplicável mais alto. Atribua políticas específicas de workload no nível de management group da landing zone. Evite atribuir no nível de resource group — não escala.

---

## 20. Como começo com governança hoje?

1. **Leia os Capítulos 1–3** — Entenda o que é governança e por que importa
2. **Execute Microsoft Defender for Cloud** — Obtenha seu Secure Score como baseline
3. **Execute queries do Azure Resource Graph** — Inventarie seus recursos (veja Apêndice D)
4. **Implemente o roadmap da Fase 1** — Siga o plano do Mês 1–3 do Capítulo 28
5. **Escolha três políticas** — Comece com modo Audit (veja FAQ #8 para recomendações)
6. **Defina um budget** — Mesmo um budget com um alerta é melhor que nenhum
7. **Habilite MFA** — O controle de segurança de maior impacto
8. **Agende 30 minutos semanais** — Revise métricas de governança e endereça problemas

Você não precisa fazer tudo de uma vez. Comece hoje, itere semanalmente, e sua postura de governança melhorará continuamente.

---

| Anterior | Próximo |
|:---|:---|
| [Estudos de Caso](ch29-case-studies.md) | [Apêndice A — Glossário](../appendices/appendix-a-glossary.md) |
