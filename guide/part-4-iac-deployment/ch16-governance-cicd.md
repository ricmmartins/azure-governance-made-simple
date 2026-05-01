# Capítulo 16 — Governança CI/CD

> Last verified: 2026-04-06

---

## Visão Geral

Governança que existe apenas como documentação ou configurações no portal é frágil. Ela sofre drift, é inconsistente e não escala. **Governança CI/CD** aplica práticas de engenharia de software — controle de versão, testes automatizados, revisão por pares e implantação contínua — a artefatos de governança como templates Bicep, definições de policy e atribuições RBAC.

Por que governança precisa de CI/CD:

- **Consistência** — todo ambiente recebe o mesmo baseline de governança
- **Auditabilidade** — todas as alterações são rastreadas em controle de versão com aprovações
- **Velocidade** — novas subscriptions podem ser governadas em minutos, não dias
- **Segurança** — previews What-If e gates de aprovação previnem danos acidentais
- **Prevenção de drift** — execuções agendadas de pipeline detectam e corrigem drift de configuração

---

## Como Funciona

### Pipelines de Implantação IaC com Gates de Aprovação

Um pipeline de implantação de governança tipicamente segue este fluxo:

![CI/CD Governance Pipeline](/images/cicd-governance-pipeline.svg)

**Estágio 1: Lint & Testes**
- O Bicep linter valida os templates
- Testes unitários verificam restrições de parâmetros e configurações de recursos
- Validação de schema garante tags obrigatórias e convenções de nomenclatura

**Estágio 2: Preview What-If**
- `az deployment sub what-if` visualiza todas as alterações
- A saída é postada como comentário no pull request para revisão humana

**Estágio 3: Gate de Aprovação**
- Revisores obrigatórios aprovam ou rejeitam a implantação
- GitHub Environments com regras de proteção impõem isso

**Estágio 4: Implantação**
- `az deployment sub create` ou `az stack sub create` aplica as alterações
- Validação pós-implantação confirma que os recursos estão no estado esperado

### Policy as Code com EPAC

O framework **Enterprise Policy as Code (EPAC)** automatiza o ciclo de vida de definições, atribuições e isenções do Azure Policy através de CI/CD. O EPAC usa uma configuração declarativa baseada em JSON/CSV armazenada em controle de versão.

Fluxo de trabalho EPAC:

1. **Definir** — definições de policy, initiatives e atribuições são declaradas em arquivos JSON
2. **Planejar** — o EPAC calcula o estado desejado vs. estado atual e gera um plano de implantação
3. **Implantar** — o plano é aplicado, criando, atualizando ou excluindo recursos de policy
4. **Isentar** — isenções de policy são gerenciadas como código junto com as definições

Conceitos-chave do EPAC:

- **Configurações globais** — definem a hierarquia de management groups, localizações padrão e escopo
- **Definições de policy** — regras de policy customizadas armazenadas como JSON
- **Definições de policy set (initiatives)** — grupos de policies atribuídos juntos
- **Atribuições de policy** — vinculam definições/initiatives a escopos com parâmetros
- **Isenções** — exceções com prazo determinado rastreadas em controle de versão

Veja: [EPAC no GitHub](https://github.com/Azure/enterprise-azure-policy-as-code)

### Detecção e Remediação de Drift

Drift de governança ocorre quando o estado real dos recursos diverge do estado desejado. Causas comuns:

- Alterações manuais no portal
- Correções de emergência que ignoram pipelines
- Alterações de RBAC feitas fora do IaC

**Estratégias de detecção:**

| Estratégia | Ferramenta | Frequência |
|------------|-----------|------------|
| What-If agendado | Azure CLI no CI/CD | Diário ou semanal |
| Verificação de conformidade de policy | Azure Policy | Contínua (integrada) |
| Consultas ao Resource Graph | Azure Resource Graph | Sob demanda ou agendada |
| Drift de Deployment Stack | `az stack sub show` | Sob demanda |

**Abordagens de remediação:**

- **Remediação automática** — reexecute o pipeline de implantação para sobrescrever alterações manuais
- **Tarefas de remediação de policy** — o Azure Policy pode remediar automaticamente recursos não conformes via efeitos `deployIfNotExists` e `modify`
- **Remediação baseada em alertas** — alertas do Activity Log acionam Logic Apps ou Azure Functions para corrigir drift

### Promoção de Ambientes

Configurações de governança devem seguir o mesmo caminho de promoção que o código de aplicação:

![Environment Promotion Flow](/images/env-promotion-flow.svg)

| Estágio | Propósito | Aprovação |
|---------|-----------|-----------|
| **dev** | Validar que templates compilam e passam no lint | Automática |
| **staging** | What-If contra uma subscription de staging; testes de integração | Aprovação do líder técnico |
| **production** | Implantar no management group/subscriptions de produção | Aprovação do comitê de governança |

Use arquivos de parâmetros separados para cada ambiente:

![Bicep Parameter Structure](/images/bicep-param-structure.svg)

---

## Melhores Práticas

1. **Armazene todos os artefatos de governança em controle de versão** — policies, RBAC, templates Bicep e arquivos de parâmetros
2. **Exija revisões de pull request para alterações de governança** — imponha regras de branch protection
3. **Use What-If em todo pipeline** — nunca implante alterações de governança sem visualizá-las
4. **Separe responsabilidades** — use pipelines diferentes para infraestrutura, policy e RBAC
5. **Use GitHub Environments** — configure regras de proteção, revisores obrigatórios e secrets de implantação por ambiente
6. **Agende detecção de drift** — execute What-If em um cron schedule para detectar alterações manuais
7. **Use workload identity federation** — autentique pipelines no Azure usando OIDC, não client secrets
8. **Implemente least privilege para identidades de pipeline** — o service principal deve ter apenas as permissões necessárias para implantação de governança
9. **Aplique tags nas implantações** — inclua ID de execução do pipeline, SHA do commit e deployer nas tags de recursos para rastreabilidade
10. **Monitore a saúde dos pipelines** — alerte sobre falhas de pipeline para prevenir lacunas de governança

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Usar client secrets de longa duração | Risco de segurança se secrets forem comprometidos | Use workload identity federation (OIDC) |
| Sem gates de aprovação em produção | Alterações acidentais em produção | Configure revisores obrigatórios nos GitHub Environments |
| Pular What-If | Exclusões inesperadas de recursos | Torne o What-If um passo obrigatório do pipeline |
| Pipeline monolítico | Lento, frágil, difícil de debugar | Separe pipelines de infraestrutura, policy e RBAC |
| Não tratar falhas de pipeline | Drift de governança se acumula | Alerte sobre falhas; auto-retry em erros transientes |
| Correções de drift manuais | Correções não capturadas em código | Sempre corrija drift atualizando o IaC, não o portal |

---

## Exemplos de Código

### Workflow GitHub Actions: Implantação Bicep com What-If

Este workflow implanta um baseline de governança usando Bicep, com linting, preview What-If, aprovação manual e estágios de implantação.

```yaml
# .github/workflows/governance-deploy.yml
name: Governance Baseline Deployment

on:
  push:
    branches: [main]
    paths:
      - 'infra/**'
  pull_request:
    branches: [main]
    paths:
      - 'infra/**'
  workflow_dispatch:

permissions:
  id-token: write   # Required for OIDC authentication
  contents: read
  pull-requests: write  # Required for posting What-If comments

env:
  AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  LOCATION: eastus

jobs:
  lint:
    name: Lint Bicep Templates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Bicep CLI
        run: az bicep install

      - name: Lint Bicep files
        run: az bicep build --file infra/main.bicep --stdout > /dev/null

  what-if:
    name: What-If Preview
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ env.AZURE_SUBSCRIPTION_ID }}

      - name: Run What-If
        id: whatif
        run: |
          result=$(az deployment sub what-if \
            --location ${{ env.LOCATION }} \
            --template-file infra/main.bicep \
            --parameters infra/parameters/production.bicepparam \
            --no-pretty-print 2>&1)
          echo "## What-If Results" > whatif-output.md
          echo '```' >> whatif-output.md
          echo "$result" >> whatif-output.md
          echo '```' >> whatif-output.md

      - name: Post What-If as PR Comment
        if: github.event_name == 'pull_request'
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          path: whatif-output.md

  deploy:
    name: Deploy Governance Baseline
    needs: what-if
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ env.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy as Deployment Stack
        run: |
          az stack sub create \
            --name 'governance-baseline' \
            --location ${{ env.LOCATION }} \
            --template-file infra/main.bicep \
            --parameters infra/parameters/production.bicepparam \
            --deny-settings-mode DenyWriteAndDelete \
            --deny-settings-excluded-principals '${{ secrets.BREAK_GLASS_OBJECT_ID }}' \
            --action-on-unmanage deleteResources \
            --yes

      - name: Verify Deployment
        run: |
          az stack sub show \
            --name 'governance-baseline' \
            --query '{Status: provisioningState, Resources: length(resources)}' \
            --output table
```

### Workflow GitHub Actions: Detecção de Drift Agendada

```yaml
# .github/workflows/drift-detection.yml
name: Governance Drift Detection

on:
  schedule:
    - cron: '0 6 * * 1-5'  # Weekdays at 6:00 UTC
  workflow_dispatch:

permissions:
  id-token: write
  contents: read
  issues: write

jobs:
  detect-drift:
    name: Check for Governance Drift
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Run What-If for Drift Detection
        id: drift
        run: |
          result=$(az deployment sub what-if \
            --location eastus \
            --template-file infra/main.bicep \
            --parameters infra/parameters/production.bicepparam \
            --no-pretty-print 2>&1)

          if echo "$result" | grep -q "Modify\|Delete\|Create"; then
            echo "drift_detected=true" >> "$GITHUB_OUTPUT"
            echo "$result" > drift-report.txt
          else
            echo "drift_detected=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Create Issue for Drift
        if: steps.drift.outputs.drift_detected == 'true'
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: '⚠️ Governance Drift Detected'
          content-filepath: drift-report.txt
          labels: governance,drift
```

---

## Referências

- [Bicep CI/CD com GitHub Actions](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-github-actions)
- [Operação What-If de implantação Azure](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if)
- [GitHub Actions para Azure](https://learn.microsoft.com/en-us/azure/developer/github/github-actions)
- [Workload identity federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
- [GitHub Environments e regras de proteção](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Enterprise Policy as Code (EPAC)](https://github.com/Azure/enterprise-azure-policy-as-code)
- [Fluxo de trabalho Azure Policy as Code](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/policy-as-code)
- [Deployment Stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks)

---

| Anterior | Próximo |
|:---------|:--------|
| [Template Specs](ch15-template-specs.md) | [Gerenciamento de Custos](../part-5-cost-finops/ch17-cost-management.md) |
