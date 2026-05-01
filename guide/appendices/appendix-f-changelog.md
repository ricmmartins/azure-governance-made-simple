# Apêndice F — Changelog

> Last verified: 2026-04-06

---

Todas as alterações notáveis em *Azure Governance Made Simple* estão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/), e este projeto segue [Semantic Versioning](https://semver.org/) para edições do livro.

---

## [2.0.0] — 2026-04-06

### Reestruturação Completa do Livro e Revisão de Conteúdo

Reorganizado todo o livro em 8 partes e 30 capítulos. Todo o conteúdo atualizado para precisão de abril de 2026.

#### Adicionado

- **Parte 7 — Em Escala**
  - Capítulo 23: Azure Landing Zones (grande reescrita da subseção de landing zone em subscription.md)
  - Capítulo 24: Azure Arc — governança híbrida e multi-cloud
  - Capítulo 25: Sovereign Landing Zones — residência de dados e conformidade regulatória
  - Capítulo 26: Governança de Dados com Microsoft Purview — catálogo de dados, classificação, linhagem
  - Capítulo 27: Governança de IA — controles de Azure OpenAI, segurança de conteúdo, detecção de shadow AI

- **Parte 8 — Síntese**
  - Capítulo 28: Roadmap de Governança — plano de implementação por fases (substitui conclusion.md)
  - Capítulo 29: Estudos de Caso — três cenários fictícios nas maturidades Crawl/Walk/Run
  - Capítulo 30: FAQ — 20 perguntas frequentes sobre governança Azure

- **Apêndices**
  - Apêndice A: Glossário — 40+ termos de governança Azure
  - Apêndice B: Árvores de Decisão — seleção de ferramenta de governança, design de management groups, seleção de efeito de política
  - Apêndice C: Kit Inicial de Políticas — 30 políticas built-in recomendadas com IDs
  - Apêndice D: Queries do Resource Graph — top 20 queries KQL de governança
  - Apêndice E: Recursos de Aprendizado — certificações, trilhas Learn, ferramentas da comunidade
  - Apêndice F: Changelog (este arquivo)

#### Alterado

- Todas as referências ao antigo nome do serviço de identidade atualizadas para "Microsoft Entra ID"
- Todas as abreviações legadas de identidade atualizadas para "Microsoft Entra ID"
- Todos os links de domínio de documentação legados atualizados para `learn.microsoft.com`
- Referências a Azure Blueprints substituídas por orientações de Deployment Stacks
- Terminologia "Enterprise-Scale" atualizada para "Azure Landing Zone Accelerator"
- Todo o conteúdo revisado e atualizado para precisão de abril de 2026

#### Descontinuado

- Conteúdo de Azure Blueprints removido (serviço descontinuado pela Microsoft)
- Referências à terminologia clássica de identidade substituídas

#### Removido

- Dependência direta de conclusion.md (substituído pelo Capítulo 28)

---

## [1.0.0] — Release Original

### Publicação Inicial

- Guia original de governança Azure cobrindo:
  - Visão geral e arquitetura de governança
  - Microsoft Entra ID (gerenciamento de identidade e acesso)
  - RBAC e permissões
  - Subscriptions e introdução a landing zones
  - Resource groups, nomenclatura e tags
  - Azure Policy e melhores práticas
  - Resource locks
  - Templates ARM
  - Azure Blueprints (agora descontinuado)
  - Resource Graph
  - Gestão de Custos
  - Conclusão com recomendações de ferramentas

---

## Como Contribuir

Se você encontrar imprecisões, informações desatualizadas ou tiver sugestões de melhoria:

1. Abra uma issue no [repositório GitHub](https://github.com/ricmmartins/azure-governance-made-simple)
2. Envie um pull request com suas alterações propostas
3. Referencie o capítulo e seção específicos na sua contribuição

Todas as contribuições são bem-vindas e apreciadas.

---

| Anterior |
|:---|
| [Apêndice E — Recursos de Aprendizado](appendix-e-learning-resources.md) |
