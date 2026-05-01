# Capítulo 10 — Conformidade Regulatória & Microsoft Cloud Security Benchmark

> Last verified: 2026-04-06

Atender a requisitos de conformidade regulatória é um fator fundamental da governança em nuvem. O Azure fornece ferramentas integradas para mapear seu ambiente de nuvem contra padrões da indústria e frameworks regulatórios, rastrear a postura de conformidade ao longo do tempo e reportar lacunas. Este capítulo cobre como a conformidade regulatória funciona no Azure, o Microsoft Cloud Security Benchmark e como operacionalizar a conformidade usando Azure Policy e Microsoft Defender for Cloud.

---

## Visão Geral

Conformidade regulatória no Azure refere-se ao processo de garantir que seus recursos e configurações de nuvem atendam aos requisitos de padrões da indústria, regulamentações governamentais e políticas organizacionais. O Azure não torna você conforme — **você** é responsável pela conformidade — mas o Azure fornece as ferramentas e controles para ajudá-lo a chegar lá.

Principais serviços Azure envolvidos na conformidade regulatória:

| Serviço | Função |
|---------|--------|
| **Azure Policy** | Define e aplica padrões de configuração. Iniciativas de conformidade mapeiam para frameworks regulatórios. |
| **Microsoft Defender for Cloud** | Fornece um painel de conformidade, secure score e recomendações de segurança alinhadas a padrões regulatórios. |
| **Microsoft Purview** | Governança de dados, classificação e conformidade para cargas de trabalho de dados. |
| **Azure Audit Logs** | Logs de atividade e diagnóstico para trilhas de auditoria. |
| **Microsoft Entra ID** | Governança de identidade, revisões de acesso e acesso condicional para controles de conformidade relacionados a identidade. |

### Modelo de Responsabilidade Compartilhada

A conformidade na nuvem segue o modelo de responsabilidade compartilhada:

- **Microsoft** é responsável pela conformidade da infraestrutura de nuvem (segurança física, SO do host, hypervisor).
- **Você** é responsável pela conformidade do que você implanta na nuvem (dados, aplicações, identidade, configuração de rede, patching de SO para IaaS).

O grau de responsabilidade muda dependendo do modelo de serviço:

| Controle | IaaS | PaaS | SaaS |
|----------|------|------|------|
| Classificação de dados | Cliente | Cliente | Cliente |
| Identidade e acesso | Cliente | Cliente | Compartilhado |
| Aplicação | Cliente | Compartilhado | Microsoft |
| Controles de rede | Cliente | Compartilhado | Microsoft |
| Patching de SO | Cliente | Microsoft | Microsoft |
| Segurança física | Microsoft | Microsoft | Microsoft |

---

## Como Funciona

### Microsoft Cloud Security Benchmark (MCSB)

O **Microsoft Cloud Security Benchmark (MCSB)** é um conjunto de melhores práticas de segurança e conformidade criado pela Microsoft. Ele fornece um framework unificado de controles de segurança que mapeia para múltiplos padrões da indústria. O MCSB é a iniciativa de segurança padrão atribuída a cada assinatura Azure através do Microsoft Defender for Cloud.

O MCSB é organizado em **domínios de controle**:

| Domínio de Controle | Descrição |
|--------------------|-----------|
| Network Security (NS) | Proteger redes virtuais, endpoints privados, firewalls, DNS |
| Identity Management (IM) | Autenticação, autorização, identidades gerenciadas, acesso condicional |
| Privileged Access (PA) | Proteção de contas administrativas e acesso JIT |
| Data Protection (DP) | Criptografia em repouso, em trânsito, gerenciamento de chaves |
| Asset Management (AM) | Inventário, descoberta, governança de recursos |
| Logging and Threat Detection (LT) | Configurações de diagnóstico, logs de auditoria, detecção de ameaças |
| Incident Response (IR) | Preparação, detecção, contenção, pós-incidente |
| Posture and Vulnerability Management (PV) | Varredura de vulnerabilidades, configurações seguras |
| Endpoint Security (ES) | EDR, anti-malware, segurança de host |
| Backup and Recovery (BR) | Políticas de backup, teste de recuperação |
| DevOps Security (DS) | Pipelines seguros, varredura de código, cadeia de suprimentos |
| Governance and Strategy (GS) | Alinhamento organizacional, políticas e gerenciamento de riscos |

### Como o MCSB Mapeia para Padrões da Indústria

O MCSB fornece mapeamentos diretos para os seguintes frameworks regulatórios:

| Framework | Descrição | Mapeamento |
|-----------|-----------|------------|
| **CIS Benchmarks** | Baselines de configuração do Center for Internet Security para Azure | Controles MCSB mapeiam para recomendações CIS específicas |
| **NIST SP 800-53 Rev. 5** | Controles federais de segurança e privacidade dos EUA | Cada controle MCSB referencia famílias de controle NIST aplicáveis |
| **PCI-DSS v4.0** | Payment Card Industry Data Security Standard | MCSB mapeia controles relevantes para ambientes de processamento de pagamentos |
| **ISO 27001:2022** | Padrão internacional de gerenciamento de segurança da informação | Controles MCSB se alinham com controles do Anexo A da ISO 27001 |

Isso significa que ao implementar controles MCSB, você está simultaneamente atendendo requisitos de múltiplos frameworks. O painel de conformidade do Defender for Cloud mostra esse mapeamento visualmente.

### Iniciativas Integradas de Conformidade Regulatória no Azure Policy

O Azure Policy fornece **iniciativas de conformidade integradas** que mapeiam diretamente para padrões regulatórios. Essas iniciativas são coleções de definições de policy agrupadas por área de controle. Quando atribuídas, elas avaliam seus recursos e reportam o status de conformidade por controle.

Principais iniciativas integradas incluem:

| Iniciativa | ID do Conjunto de Definições de Policy |
|-----------|---------------------------------------|
| Microsoft Cloud Security Benchmark | `1f3afdf9-d0c9-4c3d-847f-89da613e70a8` |
| NIST SP 800-53 Rev. 5 | `179d1daa-458f-4e47-8086-2a68d0d6c38f` |
| CIS Microsoft Azure Foundations Benchmark v2.0.0 | `06f19060-9e68-4070-92ca-f15cc126059e` |
| PCI DSS v4.0 | `c676748e-3af9-4e22-bc28-50fed0f511a8` |
| ISO 27001:2022 | `89c6cddc-1c73-4ac1-b19c-54d1a15a42f2` |
| FedRAMP High | `d5264498-16f4-418a-b659-fa7ef418175f` |
| HIPAA / HITRUST | `a169a624-5599-4385-a696-c8d643089fab` |
| SOC 2 Type 2 | `4054785f-702b-4a98-9215-009571ba8f21` |
| Canada Federal PBMM | `4c4a5f27-de81-430b-b4e5-9cbd50595a87` |

Para atribuir uma iniciativa de conformidade:

```bash
# Atribuir a iniciativa NIST SP 800-53 Rev. 5 a uma assinatura
az policy assignment create \
  --name "nist-800-53-assignment" \
  --display-name "NIST SP 800-53 Rev. 5 Compliance" \
  --policy-set-definition "179d1daa-458f-4e47-8086-2a68d0d6c38f" \
  --scope "/subscriptions/{subscription-id}" \
  --enforcement-mode "Default"
```

### Painel de Conformidade no Microsoft Defender for Cloud

O Microsoft Defender for Cloud fornece um painel de **Regulatory Compliance** que oferece uma visão em tempo real da sua postura de conformidade contra as iniciativas atribuídas.

O painel mostra:

1. **Porcentagem geral de conformidade** por padrão atribuído.
2. **Detalhamento por controle** — quais controles estão passando, falhando ou não avaliados.
3. **Detalhe por recomendação** — recursos específicos que estão não conformes e orientação de remediação.
4. **Relatórios de conformidade para download** — Exportações PDF e CSV para auditores e stakeholders.

Para acessar o painel:

1. Navegue até **Microsoft Defender for Cloud** no portal do Azure.
2. Selecione **Regulatory compliance** no menu lateral.
3. Selecione o padrão que deseja revisar (ex.: NIST SP 800-53 Rev. 5).
4. Aprofunde-se em controles e recomendações individuais.

> **Nota:** O painel de conformidade requer que pelo menos uma iniciativa de conformidade regulatória esteja atribuída à sua assinatura. A iniciativa MCSB é atribuída por padrão.

### Padrões de Conformidade Personalizados

Embora as iniciativas integradas cubram os principais frameworks, organizações frequentemente possuem requisitos internos adicionais. Você pode criar **iniciativas de conformidade personalizadas** que:

- Incluem uma combinação de definições de policy integradas e personalizadas.
- Mapeiam para o framework de controles da sua organização.
- Aparecem no painel de conformidade do Defender for Cloud junto com padrões integrados.

Passos para criar um padrão de conformidade personalizado:

1. **Definir seu framework de controles** — Documentar os controles de segurança da sua organização.
2. **Mapear controles para policies** — Para cada controle, identificar definições de Azure Policy (integradas ou personalizadas) que avaliam conformidade.
3. **Criar uma iniciativa de policy** — Agrupar as policies mapeadas em uma iniciativa.
4. **Atribuir a iniciativa** — Atribuí-la no nível de grupo de gerenciamento ou assinatura.
5. **Registrar como padrão de conformidade** — Usar a API do Defender for Cloud para registrar sua iniciativa personalizada como padrão regulatório para que apareça no painel de conformidade.

Exemplo de estrutura de iniciativa personalizada:

```json
{
  "properties": {
    "displayName": "Contoso Internal Security Standard v2",
    "policyType": "Custom",
    "description": "Contoso internal security baseline mapped to corporate InfoSec policy.",
    "metadata": {
      "category": "Regulatory Compliance",
      "version": "2.0.0"
    },
    "policyDefinitionGroups": [
      {
        "name": "CONTOSO-IM-1",
        "category": "Identity Management",
        "displayName": "IM-1: Use managed identities for service authentication"
      },
      {
        "name": "CONTOSO-NS-1",
        "category": "Network Security",
        "displayName": "NS-1: Restrict public network access"
      },
      {
        "name": "CONTOSO-DP-1",
        "category": "Data Protection",
        "displayName": "DP-1: Encrypt data at rest with customer-managed keys"
      }
    ],
    "policyDefinitions": [
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/0da106f2-4ca3-48e8-bc85-c638fe6aea8f",
        "groupNames": ["CONTOSO-IM-1"],
        "parameters": {}
      },
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/34c877ad-507e-4c82-993e-3452a6e0ad3c",
        "groupNames": ["CONTOSO-NS-1"],
        "parameters": {}
      },
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/6fac406b-40ca-413b-bf8e-0bf964659c25",
        "groupNames": ["CONTOSO-DP-1"],
        "parameters": {}
      }
    ]
  }
}
```

---

## Melhores Práticas

1. **Use iniciativas integradas como sua baseline** — Comece com MCSB e adicione iniciativas específicas de framework adicionais conforme necessário. Não duplique controles que o MCSB já cobre.

2. **Crie iniciativas personalizadas para requisitos específicos da organização** — Mapeie suas políticas de segurança internas para definições de Azure Policy e registre-as como padrões de conformidade no Defender for Cloud.

3. **Atribua iniciativas de conformidade no nível de grupo de gerenciamento** — Isso garante cobertura consistente em todas as assinaturas e evita overhead de gerenciamento por assinatura.

4. **Separe aplicação de relatórios de conformidade** — Use iniciativas de conformidade em modo Audit para visibilidade e relatórios. Use atribuições separadas de policy Deny/Modify para aplicação. Isso mantém os relatórios de conformidade limpos e evita contagem dupla.

5. **Automatize relatórios de conformidade** — Exporte dados de conformidade usando a API REST de Conformidade do Azure Policy ou consultas do Azure Resource Graph. Integre com suas ferramentas de GRC (Governança, Risco e Conformidade).

6. **Revise a postura de conformidade regularmente** — Agende revisões semanais ou mensais de conformidade usando o painel do Defender for Cloud. Rastreie tendências ao longo do tempo.

7. **Use isenções para risco aceito** — Quando um recurso legitimamente não pode cumprir um controle, crie uma isenção de policy com justificativa documentada em vez de ignorar a não conformidade.

8. **Mapeie para múltiplos frameworks simultaneamente** — Os mapeamentos cross-framework do MCSB permitem demonstrar conformidade com múltiplos padrões com um único conjunto de controles. Use isso para reduzir a carga de auditoria.

9. **Prepare-se para auditorias proativamente** — Mantenha relatórios de conformidade atualizados, documente todas as isenções e mantenha evidências de ações de remediação. Auditores pedirão snapshots de conformidade point-in-time.

10. **Integre conformidade no CI/CD** — Use as APIs de verificação de conformidade do Azure Policy em seus pipelines de implantação para detectar implantações não conformes antes que cheguem à produção.

---

## Armadilhas Comuns

1. **Confundir conformidade do Azure com conformidade organizacional** — O Azure fornece ferramentas e controles, mas a conformidade é, em última instância, sua responsabilidade. Atribuir uma iniciativa NIST não torna você conforme ao NIST — você também deve abordar controles fora do escopo do Azure (pessoas, processos, segurança física).

2. **Atribuir muitas iniciativas sobrepostas** — Múltiplas iniciativas de conformidade frequentemente incluem as mesmas policies subjacentes. Isso cria achados duplicados no painel de conformidade e infla a carga de trabalho de remediação. Racionalize suas atribuições de iniciativa.

3. **Ignorar controles "Não Aplicável"** — Alguns controles em um framework podem não se aplicar ao seu ambiente. Documente por que não são aplicáveis em vez de deixá-los sem tratamento.

4. **Não rastrear conformidade ao longo do tempo** — Um snapshot point-in-time de conformidade tem valor limitado. Rastreie tendências de conformidade para identificar regressão e medir melhoria.

5. **Tratar conformidade como um projeto único** — Conformidade regulatória é um processo contínuo. Recursos estão constantemente sendo implantados e modificados. Sem monitoramento contínuo, a deriva de conformidade é inevitável.

6. **Não envolver equipes de conformidade cedo** — Equipes técnicas podem implementar controles que não satisfazem os requisitos específicos de evidência que auditores precisam. Envolva equipes de conformidade e jurídicas ao definir implementações de controle.

---

## Exemplos de Código

### Azure Resource Graph: Consultar Estado de Conformidade

```kusto
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| extend complianceState = tostring(properties.complianceState)
| extend policySetName = tostring(properties.policySetDefinitionName)
| where policySetName contains "nist" or policySetName contains "cis"
| summarize
    Compliant = countif(complianceState == "Compliant"),
    NonCompliant = countif(complianceState == "NonCompliant"),
    Total = count()
  by policySetName
| extend CompliancePercentage = round(100.0 * Compliant / Total, 2)
| order by CompliancePercentage asc
```

### Azure CLI: Listar Estados de Conformidade para uma Atribuição de Iniciativa

```bash
# Obter resumo de conformidade para uma atribuição de policy específica
az policy state summarize \
  --policy-assignment "nist-800-53-assignment" \
  --top 10
```

### Bicep: Atribuir uma Iniciativa de Conformidade Regulatória

```bicep
targetScope = 'subscription'

var mcsb_initiative_id = '/providers/Microsoft.Authorization/policySetDefinitions/1f3afdf9-d0c9-4c3d-847f-89da613e70a8'

resource complianceAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'mcsb-compliance'
  properties: {
    displayName: 'Microsoft Cloud Security Benchmark'
    description: 'Assigns the MCSB initiative for baseline security compliance evaluation.'
    policyDefinitionId: mcsb_initiative_id
    enforcementMode: 'Default'
    nonComplianceMessages: [
      {
        message: 'This resource does not meet the Microsoft Cloud Security Benchmark requirements. Review the compliance dashboard for details.'
      }
    ]
  }
}
```

---

## Referências

- [Visão geral do Microsoft Cloud Security Benchmark](https://learn.microsoft.com/en-us/security/benchmark/azure/overview)
- [Domínios de controle do MCSB](https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-overview)
- [Conformidade regulatória no Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard)
- [Iniciativas integradas de conformidade regulatória do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-initiatives#regulatory-compliance)
- [Documentação de conformidade do Azure](https://learn.microsoft.com/en-us/azure/compliance/)
- [Microsoft Trust Center](https://www.microsoft.com/en-us/trust-center)
- [Padrões de conformidade personalizados no Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/custom-security-policies)
- [Responsabilidade compartilhada na nuvem](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)
- [Estados de conformidade do Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/get-compliance-data)
- [Iniciativa NIST SP 800-53 Rev. 5](https://learn.microsoft.com/en-us/azure/governance/policy/samples/nist-sp-800-53-r5)

---

Anterior | Próximo
:--- | :---
[Capítulo 9 — Azure Policy](/guide/part-3-policy-compliance/ch09-azure-policy.md) | [Capítulo 11 — Microsoft Defender for Cloud](/guide/part-3-policy-compliance/ch11-defender-for-cloud.md)
