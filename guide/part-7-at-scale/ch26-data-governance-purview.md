# Capítulo 26 — Governança de Dados com Microsoft Purview

> Last verified: 2026-04-06

---

## Visão Geral

O **Microsoft Purview** é uma plataforma unificada de governança de dados que ajuda organizações a descobrir, classificar, proteger e gerenciar seus dados em ambientes on-premises, multi-cloud e SaaS. Enquanto os capítulos anteriores focaram em governar a *infraestrutura* Azure, este capítulo aborda a governança dos *dados* que residem dentro dessa infraestrutura.

A governança de dados responde a perguntas como:

- *Quais dados temos e onde eles residem?*
- *Os dados sensíveis estão devidamente classificados e protegidos?*
- *Quem tem acesso a dados críticos?*
- *Como os dados fluem através dos nossos sistemas?*
- *Estamos atendendo aos requisitos regulatórios para o tratamento de dados?*

O Microsoft Purview reúne o que antes eram produtos separados — Azure Purview (catálogo de dados e linhagem) e Microsoft 365 Compliance (proteção de informações e prevenção contra perda de dados) — em uma única plataforma de governança.

---

## Como Funciona

### Catálogo de Dados — Descobrindo e Entendendo Ativos de Dados

O Purview Data Catalog fornece um inventário pesquisável de todos os ativos de dados em sua organização.

**Principais capacidades:**

- **Varredura automatizada** — O Purview escaneia fontes de dados (Azure SQL, Azure Data Lake, Azure Blob Storage, AWS S3, SQL Server on-premises e muitas outras) para descobrir ativos de dados
- **Inventário de ativos de dados** — Cada tabela, arquivo, banco de dados e schema é registrado no catálogo com metadados
- **Glossário de negócios** — Defina termos de negócios padrão e mapeie-os para ativos de dados técnicos
- **Administração de dados** — Atribua proprietários e administradores aos ativos de dados

**Fontes de dados suportadas incluem:**

| Categoria | Fontes |
|---|---|
| Azure | SQL Database, Synapse Analytics, Data Lake Storage, Blob Storage, Cosmos DB, Databricks |
| AWS | S3, RDS, Glue, Redshift |
| On-premises | SQL Server, Oracle, SAP, Teradata, Hive |
| SaaS | Power BI, Salesforce, Dataverse |

### Classificação de Dados — Classificação Automática e Manual

O Purview classifica dados automaticamente durante a varredura, identificando tipos de informações sensíveis:

- **Classificadores do sistema** — Mais de 200 classificadores integrados para padrões comuns de dados sensíveis (números de cartão de crédito, números de seguro social, números de passaporte, números de prontuários médicos, etc.)
- **Classificadores customizados** — Crie classificadores baseados em expressões regulares, listas de dicionário ou padrões de colunas específicos
- **Regras de classificação** — Defina quais classificadores executam contra quais fontes de dados

![Purview Scan Flow](/images/purview-scan-flow.svg)

### Rótulos de Sensibilidade — Protegendo Dados Sensíveis

Os rótulos de sensibilidade do Microsoft Purview Information Protection se estendem do Microsoft 365 para ativos de dados Azure:

- **Rotule dados na fonte** — Aplique rótulos de sensibilidade a colunas SQL, arquivos no Data Lake Storage e outros ativos de dados
- **Rotulagem consistente** — Os mesmos rótulos usados no Microsoft 365 (Confidencial, Altamente Confidencial, etc.) se aplicam a dados Azure
- **Proteção downstream** — Rótulos acompanham os dados conforme se movem através de pipelines, garantindo que a proteção persista

| Rótulo | Descrição | Controles Típicos |
|---|---|---|
| Public | Dados não sensíveis | Sem restrições |
| General | Dados normais de negócios | Compartilhamento interno permitido |
| Confidential | Dados sensíveis de negócios | Criptografia, compartilhamento restrito |
| Highly Confidential | Dados regulados ou críticos | Criptografia, DLP, logging de acesso |

### Linhagem de Dados — Rastreando o Fluxo de Dados

A linhagem de dados mostra como os dados fluem da origem ao destino, incluindo todas as transformações ao longo do caminho.

**Por que a linhagem importa para governança:**

- **Análise de impacto** — Entenda quais relatórios e aplicações downstream são afetados quando uma fonte muda
- **Auditoria de conformidade** — Prove aos reguladores que dados sensíveis são tratados corretamente durante todo seu ciclo de vida
- **Análise de causa raiz** — Rastreie problemas de qualidade de dados até sua origem

**Fontes de linhagem:**

O Purview captura linhagem automaticamente de:

- Pipelines do Azure Data Factory e Synapse
- Notebooks do Azure Databricks
- SQL Server Integration Services (SSIS)
- Dataflows e relatórios do Power BI

### Integração com Ferramentas de Governança Azure

O Purview se integra com outros serviços de governança Azure para criar uma postura de governança abrangente:

| Integração | Como Funciona |
|---|---|
| **Azure Policy** | Garantir que contas de armazenamento tenham varredura do Purview habilitada; exigir diagnostic settings |
| **Microsoft Defender for Cloud** | Expor descobertas de classificação do Purview em dashboards do Defender; priorizar proteção para dados altamente classificados |
| **Microsoft Entra ID** | Usar Entra ID para controle de acesso ao Purview; integrar com Conditional Access |
| **Azure Monitor** | Rotear logs de diagnóstico do Purview para o Log Analytics; criar alertas para falhas de varredura |
| **Azure Key Vault** | Armazenar credenciais para varreduras do Purview de forma segura; usar managed identities quando possível |

---

## Melhores Práticas

1. **Comece com descoberta de dados antes de aplicar controles** — Você não pode governar o que não conhece. Execute varreduras do Purview em todas as fontes de dados para construir um inventário abrangente antes de definir políticas.

2. **Defina um glossário de negócios cedo** — Um vocabulário comum para termos de dados (ex.: "Cliente", "Receita", "PII") garante consistência entre equipes e torna o catálogo de dados útil.

3. **Use managed identities para varredura** — Evite armazenar credenciais. Configure o Purview para usar managed identities ao acessar fontes de dados Azure.

4. **Alinhe rótulos de sensibilidade com o esquema de classificação da sua organização** — Trabalhe com suas equipes de segurança e conformidade para definir rótulos que mapeiem para políticas de classificação de dados existentes.

5. **Automatize agendamentos de varredura** — Configure varreduras recorrentes (semanais ou diárias) para manter o catálogo atualizado conforme as fontes de dados evoluem.

6. **Atribua administradores de dados** — Cada ativo de dados crítico deve ter um proprietário e um administrador responsável pela qualidade e governança dos dados.

7. **Habilite captura de linhagem em pipelines** — Garanta que os pipelines do Azure Data Factory e Synapse tenham a integração de linhagem com o Purview habilitada.

8. **Use Purview junto com Azure Policy** — O Purview governa conteúdo e classificação de dados; Azure Policy governa configuração de infraestrutura. Juntos, eles fornecem governança abrangente.

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|---|---|---|
| Escanear tudo de uma vez | Altos custos de varredura e tempos de varredura longos | Priorize fontes de dados críticas; expanda incrementalmente |
| Ignorar o glossário de negócios | O catálogo se torna um depósito de metadados técnicos | Invista tempo na definição de termos de negócios e seu mapeamento |
| Não revisar auto-classificações | Falsos positivos nos resultados de classificação | Revise e cuide regularmente dos resultados de classificação |
| Tratar o Purview como ferramenta apenas de TI | Baixa adoção por consumidores de dados | Envolva usuários de negócios como administradores de dados e contribuidores do glossário |
| Esquecer das fontes de dados não-Azure | Governança de dados incompleta | Escaneie fontes de dados on-premises e multi-cloud usando os conectores do Purview |

---

## Exemplos de Código

### Implantar uma Conta Purview com Bicep

```bicep
resource purviewAccount 'Microsoft.Purview/accounts@2021-12-01' = {
  name: 'purview-${uniqueString(resourceGroup().id)}'
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    managedResourceGroupName: 'rg-purview-managed'
  }
  tags: {
    Environment: 'Production'
    Purpose: 'DataGovernance'
  }
}

output purviewAccountName string = purviewAccount.name
output purviewIdentityPrincipalId string = purviewAccount.identity.principalId
```

### Azure Policy — Exigir Diagnostic Settings para Purview

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "field": "type",
      "equals": "Microsoft.Purview/accounts"
    },
    "then": {
      "effect": "DeployIfNotExists",
      "details": {
        "type": "Microsoft.Insights/diagnosticSettings",
        "existenceCondition": {
          "field": "Microsoft.Insights/diagnosticSettings/logs.enabled",
          "equals": "true"
        }
      }
    }
  }
}
```

### Resource Graph — Encontrar Contas Purview e Seu Status

```kusto
resources
| where type == "microsoft.purview/accounts"
| project name, location, resourceGroup, subscriptionId,
    provisioningState = properties.provisioningState,
    publicNetworkAccess = properties.publicNetworkAccess,
    managedRg = properties.managedResourceGroupName
```

---

## Referências

- [Microsoft Purview Documentation](https://learn.microsoft.com/purview/)
- [Microsoft Purview Data Catalog](https://learn.microsoft.com/purview/catalog)
- [Data Classification in Microsoft Purview](https://learn.microsoft.com/purview/concept-best-practices-classification)
- [Sensitivity Labels in Microsoft Purview](https://learn.microsoft.com/purview/sensitivity-labels)
- [Data Lineage in Microsoft Purview](https://learn.microsoft.com/purview/concept-data-lineage)
- [Supported Data Sources in Purview](https://learn.microsoft.com/purview/purview-connector-overview)
- [Microsoft Purview Information Protection](https://learn.microsoft.com/purview/information-protection)
- [Microsoft Purview Pricing](https://azure.microsoft.com/pricing/details/purview/)

---

| Anterior | Próximo |
|:---|:---|
| [Sovereign Landing Zones](ch25-sovereign-landing-zones.md) | [Governança de IA](ch27-ai-governance.md) |
