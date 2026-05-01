# Contribuindo para o Azure Governance Made Simple

Obrigado pelo seu interesse em contribuir com este projeto! Este guia ajudará você a começar.

## Regras de Conteúdo

### Padrões de Terminologia

| ❌ Não Use | ✅ Use em Vez Disso |
|--------------|---------------|
| Azure Active Directory / AAD | Microsoft Entra ID |
| Azure AD Connect | Microsoft Entra Connect / Microsoft Entra Cloud Sync |
| Azure Security Center | Microsoft Defender for Cloud |
| Azure Blueprints (sem nota de descontinuação) | Deployment Stacks |
| ARM Templates (como abordagem recomendada) | Bicep (principal); ARM JSON (apenas referência legada) |
| Guest Configuration / VM Guest Policy | Azure Machine Configuration |
| docs.microsoft.com | learn.microsoft.com |

### Autoria

- **NUNCA adicione o Copilot ou qualquer assistente de IA como coautor** nas mensagens de commit. Todos os commits devem atribuir autoria exclusivamente a contribuidores humanos.

### Voz Editorial

- **Tom:** Autoritativo mas acessível — como um arquiteto de nuvem sênior orientando uma equipe.
- **Pessoa:** Use "você" para instruções. Use "recomendamos" para melhores práticas.
- **Links:** Use texto descritivo nos links (nunca "clique aqui"). Sempre use o domínio `learn.microsoft.com` para documentação da Microsoft.

### Estrutura dos Capítulos

Todo capítulo deve seguir esta estrutura:

```
## [Título do Capítulo]

*Última verificação: AAAA-MM-DD*

### Visão Geral
### Como Funciona
### Melhores Práticas
### Armadilhas Comuns
### Exemplos de Código
### Exercício Prático (quando aplicável)
### Referências
```

### Exemplos de Código

- Use blocos de código cercados com identificadores de linguagem: `bicep`, `json`, `powershell`, `bash`, `kusto`
- Forneça exemplos funcionais e prontos para copiar e colar
- Prefira Bicep em vez de ARM JSON para novo conteúdo de IaC

## Como Contribuir

1. **Faça um fork** do repositório
2. **Crie uma branch** para suas alterações (`git checkout -b improve/chapter-name`)
3. **Faça suas alterações** seguindo as regras de conteúdo acima
4. **Atualize a data de "Última verificação"** em qualquer capítulo que você modificar
5. **Adicione uma entrada no registro de alterações** em `guide/appendices/appendix-f-changelog.md`
6. **Envie um pull request** com uma descrição clara das suas alterações

## Reportando Problemas

Se você encontrar conteúdo desatualizado, links quebrados ou imprecisões, por favor [abra uma issue](https://github.com/ricmmartins/azure-governance-made-simple/issues/new) com:

- O capítulo e a seção afetados
- O que está incorreto
- Qual deveria ser a informação correta (com um link de referência, se possível)

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença GPL-3.0.
