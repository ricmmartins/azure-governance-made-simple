# Capítulo 22 — AzGovViz (Azure Governance Visualizer)

> Last verified: 2026-04-06

---

## Visão Geral

**AzGovViz** (Azure Governance Visualizer) é uma ferramenta open-source em PowerShell que fornece uma representação visual abrangente da sua implementação de governança no Azure. Ela itera por toda a hierarquia de management groups — desde a raiz do tenant até assinaturas individuais — e captura dados sobre Azure Policy, RBAC, Blueprints (legado) e configurações de recursos.

A saída é um relatório HTML rico que equipes de governança podem usar para:

- **Entender a postura atual de governança** em uma visão rápida
- **Identificar lacunas** — políticas ausentes, atribuições de RBAC excessivamente amplas, recursos órfãos
- **Auditar alterações** — comparar relatórios ao longo do tempo para detectar desvios de governança
- **Comunicar** — compartilhar relatórios visuais com stakeholders que não utilizam o Portal Azure

AzGovViz é mantido por Julian Hayward e pela comunidade Azure:
- **GitHub:** [github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting)

---

## Como Funciona

### O Que o AzGovViz Captura

O AzGovViz consulta a API do Azure Resource Manager e produz relatórios cobrindo:

| Área | Detalhes |
|------|----------|
| **Hierarquia de Management Groups** | Mapa visual em árvore da estrutura de MGs com posicionamento de assinaturas |
| **Azure Policy** | Definições de política (built-in e customizadas), atribuições de iniciativas, estado de conformidade |
| **RBAC** | Atribuições de função em cada escopo, definições de funções customizadas, elegibilidade PIM |
| **Recursos** | Contagens de recursos por tipo, região e assinatura |
| **Blueprints** (legado) | Definições e atribuições de Blueprints |
| **Diagnósticos** | Assinaturas sem diagnostic settings |
| **Microsoft Defender for Cloud** | Secure Score, status dos planos do Defender |
| **Custos** | Dados de consumo (opcional) |
| **Rede** | Private endpoints, redes virtuais (opcional) |

### Componentes da Saída

O AzGovViz gera três seções principais de relatório:

#### 1. Mapa de Hierarquia

Uma árvore visual interativa mostrando sua hierarquia de management groups com assinaturas aninhadas abaixo. Cada nó é clicável e mostra detalhes sobre o management group ou assinatura.

#### 2. Resumo do Tenant

Um dashboard de alto nível com estatísticas agregadas:
- Total de management groups, assinaturas e recursos
- Definições e atribuições de políticas (built-in vs. customizadas)
- Atribuições de função RBAC e definições de funções customizadas
- Recursos e atribuições de função órfãs
- Percentuais de conformidade de política

#### 3. Scope Insights

Drill-downs detalhados para cada management group e assinatura:
- Atribuições de política neste escopo (herdadas vs. diretas)
- Atribuições de função RBAC (herdadas vs. diretas)
- Inventário de recursos
- Conformidade de tags
- Status de diagnostic settings

---

## Setup e Pré-requisitos

### Requisitos

| Requisito | Detalhes |
|-----------|----------|
| **PowerShell** | PowerShell 7.x (multiplataforma) |
| **Módulos Azure PowerShell** | `Az.Accounts`, `Az.Resources` (tratados automaticamente) |
| **Permissões** | `Reader` no management group raiz (mínimo) |
| **Microsoft Entra ID** | Função `Directory Reader` para resolução de usuários/grupos (recomendado) |
| **Git** | Para clonar o repositório |

### Instalação

```powershell
# Clone the repository
git clone https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting.git
cd Azure-MG-Sub-Governance-Reporting

# Verify PowerShell version (7.x required)
$PSVersionTable.PSVersion
```

### Permissões Azure Necessárias

A identidade que executa o AzGovViz precisa de:

| Permissão | Escopo | Propósito |
|-----------|--------|-----------|
| `Reader` | Management group raiz | Ler todos os recursos, políticas e RBAC |
| `Directory Reader` | Microsoft Entra ID | Resolver nomes de principals (usuários, grupos, service principals) |

Para execuções automatizadas (pipelines), crie um service principal ou managed identity com estas permissões:

```bash
# Create a service principal
az ad sp create-for-rbac --name "sp-azgovviz" --role Reader \
  --scopes "/providers/Microsoft.Management/managementGroups/<root-mg-id>"
```

---

## Executando o AzGovViz

### Execução Local

```powershell
# Connect to Azure
Connect-AzAccount

# Run AzGovViz (basic)
.\pwsh\AzGovVizParallel.ps1 `
  -ManagementGroupId "<your-root-mg-id>"

# Run with all features enabled
.\pwsh\AzGovVizParallel.ps1 `
  -ManagementGroupId "<your-root-mg-id>" `
  -CsvExport `
  -DoAzureConsumption `
  -ThrottleLimit 10 `
  -ChangeTrackingDays 14 `
  -NoJsonExport
```

### Parâmetros Comuns

| Parâmetro | Descrição |
|-----------|-----------|
| `-ManagementGroupId` | O management group raiz a partir do qual iniciar |
| `-CsvExport` | Exportar dados para arquivos CSV para análise externa |
| `-DoAzureConsumption` | Incluir dados de consumo/custo (requer permissões adicionais) |
| `-ThrottleLimit` | Número de chamadas de API paralelas (padrão: 10) |
| `-ChangeTrackingDays` | Número de dias para consultar alterações (padrão: 14) |
| `-NoJsonExport` | Pular exportação JSON (reduz tamanho da saída) |
| `-HtmlTableRowsLimit` | Limitar linhas em tabelas HTML (para tenants muito grandes) |
| `-SubscriptionId4AzContext` | Executar para um contexto de assinatura específico |
| `-ExcludedSubscriptions` | Lista separada por vírgulas de IDs de assinatura a excluir |

### Pipeline do GitHub Actions

Crie um workflow agendado do GitHub Actions para executar o AzGovViz automaticamente:

```yaml
# .github/workflows/azgovviz.yml
name: AzGovViz Report

on:
  schedule:
    - cron: '0 4 * * 1'  # Weekly on Monday at 4:00 UTC
  workflow_dispatch:

permissions:
  id-token: write
  contents: write

env:
  ManagementGroupId: 'mg-root'
  OutputPath: 'wiki'

jobs:
  azgovviz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true

      - name: Clone AzGovViz
        run: |
          git clone https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting.git
          cd Azure-MG-Sub-Governance-Reporting

      - name: Run AzGovViz
        uses: azure/powershell@v2
        with:
          inlineScript: |
            ./Azure-MG-Sub-Governance-Reporting/pwsh/AzGovVizParallel.ps1 `
              -ManagementGroupId $env:ManagementGroupId `
              -CsvExport `
              -ThrottleLimit 10 `
              -OutputPath $env:OutputPath
          azPSVersion: latest

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: azgovviz-report-${{ github.run_number }}
          path: ${{ env.OutputPath }}
          retention-days: 90
```

### Pipeline do Azure DevOps

```yaml
# azure-pipelines-azgovviz.yml
trigger: none

schedules:
  - cron: '0 4 * * 1'
    displayName: 'Weekly Monday 4AM UTC'
    branches:
      include:
        - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  ManagementGroupId: 'mg-root'

steps:
  - task: AzurePowerShell@5
    displayName: 'Run AzGovViz'
    inputs:
      azureSubscription: 'azgovviz-service-connection'
      ScriptType: InlineScript
      Inline: |
        git clone https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting.git
        ./Azure-MG-Sub-Governance-Reporting/pwsh/AzGovVizParallel.ps1 `
          -ManagementGroupId '$(ManagementGroupId)' `
          -CsvExport `
          -OutputPath '$(Build.ArtifactStagingDirectory)'
      azurePowerShellVersion: LatestVersion
      pwsh: true

  - task: PublishBuildArtifacts@1
    displayName: 'Publish Report'
    inputs:
      PathtoPublish: '$(Build.ArtifactStagingDirectory)'
      ArtifactName: 'AzGovViz-Report'
```

---

## Lendo e Interpretando a Saída

### Mapa de Hierarquia

O mapa de hierarquia é uma árvore interativa em SVG/HTML:

- **Codificação por cores** — management groups e assinaturas são coloridos por profundidade
- **Detalhes ao passar o mouse** — passe o mouse sobre qualquer nó para ver contagens de políticas, atribuições de RBAC e contagens de recursos
- **Clique para drill-down** — clique em um nó para navegar até sua seção de Scope Insights

**O que procurar:**
- Assinaturas no management group errado
- Management groups sem políticas atribuídas
- Assinaturas órfãs (não em nenhum MG gerenciado pela governança)

### Resumo do Tenant

O resumo do tenant fornece métricas agregadas. Indicadores-chave para revisar:

| Métrica | Saudável | Preocupante |
|---------|----------|-------------|
| **Definições de política customizadas** | Documentadas, bem nomeadas | Grande número de políticas customizadas não testadas |
| **Atribuições de função órfãs** | 0 | Qualquer atribuição órfã (principals excluídos) |
| **Conformidade de política** | >95% | <80% |
| **Definições de funções customizadas** | Mínimas, com escopo bem definido | Muitas funções customizadas com permissões amplas |
| **Recursos sem tags** | <5% | >20% |

### Scope Insights

Para cada management group e assinatura, o Scope Insights mostra:

- **Políticas herdadas vs. diretas** — as políticas de governança estão sendo herdadas corretamente dos MGs pais?
- **Atribuições de RBAC** — quem tem acesso neste escopo? Alguma atribuição direta de Owner?
- **Detalhamento de recursos** — o que está implantado? É o esperado?
- **Diagnostic settings** — o encaminhamento do Activity Log está configurado?

---

## Melhores Práticas

1. **Execute semanalmente** — agende execuções automáticas toda segunda-feira de manhã para manter a visibilidade atual
2. **Armazene a saída em uma conta de armazenamento** — faça upload de relatórios HTML para um container de blob com website estático para fácil compartilhamento
3. **Compartilhe com a equipe de governança** — distribua links para o relatório mais recente nos canais da equipe
4. **Compare relatórios ao longo do tempo** — use o recurso de change tracking para detectar desvios de governança
5. **Use autenticação OIDC em pipelines** — evite armazenar secrets de service principal; use workload identity federation
6. **Comece pelo MG raiz** — sempre escaneie toda a hierarquia para capturar lacunas de governança
7. **Habilite exportação CSV** — arquivos CSV são mais fáceis de importar no Power BI ou Excel para análise customizada
8. **Revise atribuições de função órfãs** — estas indicam usuários/grupos excluídos que ainda possuem entradas de RBAC
9. **Configure alertas sobre falhas do relatório** — se o AzGovViz falhar, sua visibilidade de governança está desatualizada
10. **Combine com Resource Graph** — use AzGovViz para a visão geral visual e Resource Graph para consultas direcionadas

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|-----------|---------|-----------|
| Permissões insuficientes | Relatórios incompletos; dados ausentes | Garanta `Reader` no MG raiz e `Directory Reader` no Entra ID |
| Executar com pouca frequência | Desvios de governança passam despercebidos | Agende execuções automáticas semanais |
| Não compartilhar o relatório | Apenas a pessoa que executa o AzGovViz se beneficia | Armazene em local compartilhado (conta de armazenamento, wiki, SharePoint) |
| Tenants grandes causando timeouts | Geração de relatório falha | Aumente `ThrottleLimit`; use `ExcludedSubscriptions` para assinaturas não governadas |
| Usar login interativo em pipelines | Pipeline falha na autenticação | Use service principal ou managed identity com OIDC |
| Não revisar a saída | Relatórios são gerados mas nunca lidos | Agende reuniões mensais de revisão de governança usando o relatório como agenda |

---

## Referências

- [AzGovViz GitHub repository](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting)
- [AzGovViz setup guide](https://github.com/JulianHayward/Azure-MG-Sub-Governance-Reporting/blob/main/setup.md)
- [Azure management group hierarchy](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview)
- [Azure Policy overview](https://learn.microsoft.com/en-us/azure/governance/policy/overview)
- [Azure RBAC overview](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- [Workload identity federation for GitHub Actions](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
- [Azure Landing Zone review workbook](https://github.com/Azure/fta-landingzone/tree/main/LZReview)

---

| Anterior | Próximo |
|:---------|:--------|
| [Resource Graph](ch21-resource-graph.md) | — |
