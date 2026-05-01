# Capítulo 25 — Sovereign Landing Zones

> Last verified: 2026-04-06

---

## Visão Geral

**Sovereign Landing Zones (SLZ)** são arquiteturas especializadas de Azure Landing Zone projetadas para organizações que devem atender a requisitos rigorosos de residência de dados, soberania de dados e conformidade regulatória. Elas se baseiam na arquitetura padrão de Azure Landing Zone e adicionam controles que garantem que os dados permaneçam dentro de limites geográficos ou políticos específicos e que as operações estejam em conformidade com regulamentações nacionais.

Sovereign Landing Zones são relevantes para:

- **Agências governamentais** sujeitas a leis nacionais de tratamento de dados
- **Organizações de serviços financeiros** com requisitos de localização de dados
- **Organizações de saúde** vinculadas a regras regionais de proteção de dados de pacientes
- **Qualquer organização** operando em jurisdições com leis rigorosas de soberania de dados (GDPR, LGPD, PIPL, etc.)

---

## Como Funciona

### Nuvens Soberanas vs. Nuvem Pública com Controles de Soberania

O Azure oferece ambientes de nuvem soberana dedicados, bem como controles de soberania dentro da nuvem pública:

| Ambiente | Descrição | Caso de Uso |
|---|---|---|
| **Azure Public** (com recursos de soberania) | Regiões Azure padrão com garantias de residência de dados, computação confidencial e chaves gerenciadas pelo cliente | Maioria das indústrias reguladas; conformidade com GDPR |
| **Azure Government** (EUA) | Datacenters fisicamente isolados para governo federal, estadual e local dos EUA | Cargas de trabalho do governo dos EUA; FedRAMP High, DoD IL4/IL5 |
| **Azure China** (operado pela 21Vianet) | Azure fisicamente e logicamente isolado operado por uma entidade chinesa | Cargas de trabalho que devem permanecer dentro da China |

> **Nota:** O Azure Germany (operado pela T-Systems) foi descontinuado. Os requisitos de residência de dados na Alemanha agora são atendidos pelas regiões públicas do Azure na Alemanha (Germany West Central, Germany North).

### Requisitos de Residência de Dados

Os controles de residência de dados garantem que os dados sejam armazenados, processados e — em alguns casos — nunca saiam de uma região geográfica específica.

O Azure fornece vários mecanismos para residência de dados:

1. **Seleção de região Azure** — A maioria dos serviços Azure armazena dados em repouso dentro da região selecionada. O Azure garante residência de dados para a maioria dos serviços.

2. **Política Allowed Locations** — Use Azure Policy para restringir em quais regiões Azure os recursos podem ser implantados:

   ```json
   {
     "properties": {
       "displayName": "Allowed locations",
       "policyType": "BuiltIn",
       "mode": "Indexed",
       "parameters": {
         "listOfAllowedLocations": {
           "type": "Array",
           "metadata": {
             "displayName": "Allowed locations",
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

3. **Chaves gerenciadas pelo cliente (CMK)** — Controle chaves de criptografia usando Azure Key Vault ou Azure Key Vault Managed HSM para garantir que apenas partes autorizadas possam descriptografar dados.

4. **Azure Confidential Computing** — Use Trusted Execution Environments (TEEs) baseados em hardware para proteger dados em uso, não apenas em repouso e em trânsito.

5. **Azure Data Boundary** — O EU Data Boundary para a Microsoft Cloud garante que dados de clientes baseados na UE sejam armazenados e processados dentro da UE.

### Padrões de Arquitetura de Sovereign Landing Zone

A arquitetura de Sovereign Landing Zone estende a ALZ padrão com controles adicionais:

![Sovereign Landing Zone Additions](/images/sovereign-lz-additions.svg)

**Principais adições arquiteturais:**

| Controle | Finalidade |
|---|---|
| **Allowed Locations** | Restringir implantação de recursos a regiões aprovadas para soberania |
| **Customer Lockbox** | Exigir aprovação antes que o suporte Microsoft acesse dados |
| **Chaves gerenciadas pelo cliente** | Manter controle sobre chaves de criptografia |
| **Confidential Computing** | Proteger dados em uso com TEEs baseados em hardware |
| **Private endpoints** | Impedir que dados trafeguem pela internet pública |
| **Restrições de peering de rede** | Impedir conectividade de rede transfronteiriça |
| **Diagnostic settings** | Rotear todos os logs para um workspace do Log Analytics controlado soberanamente |
| **Azure Key Vault Managed HSM** | Módulos de segurança de hardware validados FIPS 140-2 Nível 3 |

### Limites de Conformidade para Indústrias Reguladas

Diferentes indústrias têm requisitos de conformidade específicos que a Sovereign Landing Zone aborda:

**Saúde:**
- HIPAA (EUA), GDPR (UE), LGPD (Brasil)
- Dados de pacientes devem ser criptografados em repouso e em trânsito
- Acesso a dados de pacientes deve ser auditado
- Requisitos de residência de dados variam por jurisdição

**Serviços Financeiros:**
- PCI-DSS para dados de cartão de pagamento
- SOX para sistemas de relatórios financeiros
- Regulamentações bancárias nacionais (frequentemente exigem residência de dados)
- Requisitos fortes de criptografia e gerenciamento de chaves

**Governo:**
- FedRAMP (federal dos EUA), IRAP (Austrália), G-Cloud (Reino Unido)
- Soberania de dados é tipicamente obrigatória
- Requisitos de habilitação de segurança para pessoal de operações
- Requisitos rigorosos de isolamento de rede

### Controles de Governança de Privacidade e Proteção de Dados

Sovereign Landing Zones implementam controles de privacidade em múltiplos níveis:

1. **Nível de infraestrutura** — Criptografia, isolamento de rede, restrições de região
2. **Nível de plataforma** — Microsoft Purview para classificação de dados, rótulos de sensibilidade
3. **Nível de aplicação** — Conditional Access do Microsoft Entra ID, prevenção contra perda de dados
4. **Nível operacional** — Customer Lockbox, revisões de acesso, logging de auditoria

```bicep
// Example: Policy assignment to restrict resources to EU regions
targetScope = 'managementGroup'

param managementGroupId string

resource euOnlyPolicy 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'restrict-to-eu-regions'
  properties: {
    displayName: 'Restrict deployments to EU regions only'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c'
    parameters: {
      listOfAllowedLocations: {
        value: [
          'northeurope'
          'westeurope'
          'francecentral'
          'francesouth'
          'germanywestcentral'
          'germanynorth'
          'swedencentral'
          'switzerlandnorth'
          'switzerlandwest'
        ]
      }
    }
  }
}
```

---

## Melhores Práticas

1. **Entenda seus requisitos regulatórios primeiro** — Requisitos de soberania variam dramaticamente por jurisdição e indústria. Envolva equipes jurídicas e de conformidade antes de projetar a arquitetura.

2. **Use a implementação de referência de Sovereign Landing Zone** — A [Azure Sovereign Landing Zone](https://github.com/Azure/sovereign-landing-zone) fornece um ponto de partida para implantações soberanas.

3. **Aplique restrições de região cedo** — Aplique políticas Allowed Locations no nível mais alto de management group. É muito mais difícil realocar recursos após a implantação.

4. **Habilite Customer Lockbox** — Para cargas de trabalho verdadeiramente soberanas, o Customer Lockbox garante que o suporte Microsoft não pode acessar seus dados sem aprovação explícita.

5. **Use chaves gerenciadas pelo cliente para todos os armazenamentos de dados** — Mesmo quando chaves gerenciadas pelo serviço estão disponíveis, cargas de trabalho reguladas devem usar chaves gerenciadas pelo cliente para controle total.

6. **Planeje o gerenciamento de chaves** — Chaves gerenciadas pelo cliente requerem Key Vault ou Managed HSM. Planeje a estratégia de rotação de chaves, backup e recuperação de desastres.

7. **Considere computação confidencial para cargas de trabalho altamente sensíveis** — Azure Confidential VMs e contêineres confidenciais protegem dados mesmo do operador da nuvem.

8. **Documente sua postura de conformidade** — Use os dashboards de conformidade regulatória do Microsoft Defender for Cloud para demonstrar continuamente a conformidade com os frameworks aplicáveis.

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|---|---|---|
| Assumir que a seleção de região Azure sozinha garante soberania | Alguns serviços replicam metadados globalmente | Revise a documentação de residência de dados de cada serviço |
| Não restringir regiões pareadas | Armazenamento geo-redundante pode replicar para uma região fora do seu limite | Use armazenamento com redundância de zona (ZRS) em vez de geo-redundante (GRS) |
| Esquecer dos dados de suporte | Tickets de suporte podem conter dados de clientes | Habilite Customer Lockbox; revise o tratamento de dados de suporte |
| Restringir regiões excessivamente | Disponibilidade de serviço reduzida e latência mais alta | Equilibre requisitos de soberania com necessidades operacionais |
| Ignorar acesso operacional | Operadores de nuvem podem acessar infraestrutura durante incidentes | Use Customer Lockbox e controles de operações soberanas |

---

## Referências

- [Azure Sovereign Landing Zone (GitHub)](https://github.com/Azure/sovereign-landing-zone)
- [Data Residency in Azure](https://azure.microsoft.com/explore/global-infrastructure/data-residency/)
- [Azure Government](https://learn.microsoft.com/azure/azure-government/documentation-government-welcome)
- [Azure China — 21Vianet](https://learn.microsoft.com/azure/china/overview-operations)
- [EU Data Boundary for the Microsoft Cloud](https://learn.microsoft.com/privacy/eudb/eu-data-boundary-learn)
- [Azure Confidential Computing](https://learn.microsoft.com/azure/confidential-computing/overview)
- [Customer Lockbox for Azure](https://learn.microsoft.com/azure/security/fundamentals/customer-lockbox-overview)
- [Azure Key Vault Managed HSM](https://learn.microsoft.com/azure/key-vault/managed-hsm/overview)
- [Azure Compliance Offerings](https://learn.microsoft.com/azure/compliance/offerings/)

---

| Anterior | Próximo |
|:---|:---|
| [Azure Arc](ch24-azure-arc.md) | [Governança de Dados com Purview](ch26-data-governance-purview.md) |
