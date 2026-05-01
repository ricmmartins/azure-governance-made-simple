# Capítulo 24 — Azure Arc

> Last verified: 2026-04-06

---

## Visão Geral

O **Azure Arc** estende as capacidades de governança e gerenciamento do Azure para recursos executados fora do Azure — seja on-premises, em outras nuvens (AWS, GCP) ou na borda. Com o Azure Arc, você pode projetar recursos não-Azure no Azure Resource Manager (ARM), permitindo usar as mesmas ferramentas de governança (Azure Policy, RBAC, tags, monitoramento) em toda sua infraestrutura, independentemente de onde ela é executada.

O Azure Arc responde a uma questão crítica de governança: *Como aplico políticas consistentes, controles de acesso e monitoramento em um ambiente híbrido e multi-cloud?*

### O Que o Azure Arc Habilita

| Capacidade | Sem Arc | Com Arc |
|---|---|---|
| Azure Policy | Apenas recursos Azure | Qualquer servidor ou cluster Kubernetes conectado |
| RBAC | Apenas recursos Azure | Recursos habilitados para Arc recebem IDs de recurso ARM |
| Tagging | Apenas recursos Azure | Tagueie servidores on-premises, VMs multi-cloud |
| Azure Monitor | Apenas recursos Azure | Monitore qualquer máquina conectada |
| Microsoft Defender for Cloud | Apenas recursos Azure | Postura de segurança para recursos híbridos |
| Update Manager | Apenas VMs Azure | Aplique patches em qualquer servidor conectado |

---

## Como Funciona

### Servidores Habilitados para Arc

Os servidores habilitados para Arc permitem gerenciar servidores físicos Windows e Linux e máquinas virtuais hospedadas fora do Azure como se fossem recursos Azure.

**Como funciona:**

1. Instale o **Azure Connected Machine agent** no servidor alvo
2. O agente estabelece uma conexão de saída segura para o Azure (nenhuma porta de entrada necessária)
3. O servidor aparece como um recurso no Azure Resource Manager com um ID de recurso completo
4. Agora você pode aplicar Azure Policy, atribuir roles RBAC, taguear o recurso e configurar monitoramento

```bash
# Install the Azure Connected Machine agent (Linux)
wget https://aka.ms/azcmagent -O install_linux_azcmagent.sh
bash install_linux_azcmagent.sh

# Connect the server to Azure
azcmagent connect \
  --resource-group "rg-arc-servers" \
  --tenant-id "YOUR_TENANT_ID" \
  --location "eastus" \
  --subscription-id "YOUR_SUBSCRIPTION_ID" \
  --tags "Environment=Production,CostCenter=IT"
```

**Onboarding em escala:**

Para ambientes grandes, use uma dessas abordagens em vez da instalação manual:

- **Service principal** — Script de instalação do agente com service principal para onboarding não assistido
- **Group Policy** — Implante o agente via Group Policy para servidores Windows associados ao domínio
- **Ansible/Chef/Puppet** — Use ferramentas de gerenciamento de configuração para frotas Linux/Windows
- **Integração com VMware vCenter** — Azure Arc-enabled VMware vSphere para VMs gerenciadas pelo vCenter
- **Integração com SCVMM** — Azure Arc-enabled System Center Virtual Machine Manager

### Kubernetes Habilitado para Arc

O Kubernetes habilitado para Arc permite conectar e gerenciar clusters Kubernetes executados em qualquer lugar — AKS no Azure Stack HCI, EKS, GKE, Rancher ou clusters autogerenciados.

**Como funciona:**

1. Instale os agentes Arc no cluster Kubernetes usando Helm ou o Azure CLI
2. O cluster é representado como um recurso no Azure Resource Manager
3. Você pode então aplicar Azure Policy for Kubernetes (baseado em Gatekeeper), configurações GitOps e monitoramento

```bash
# Connect a Kubernetes cluster to Azure Arc
az connectedk8s connect \
  --name "my-k8s-cluster" \
  --resource-group "rg-arc-k8s" \
  --location "eastus" \
  --tags "Environment=Production"
```

**Principais capacidades para Kubernetes habilitado para Arc:**

- **Azure Policy for Kubernetes** — Aplique segurança de pods, restrições de imagens de contêiner e políticas de namespace
- **GitOps com Flux** — Implante configurações e aplicações a partir de repositórios Git
- **Azure Monitor Container Insights** — Monitore a saúde e desempenho do cluster
- **Microsoft Defender for Containers** — Detecção de ameaças em tempo de execução para clusters habilitados para Arc
- **Azure Key Vault Secrets Provider** — Monte secrets do Key Vault em pods

### Azure Policy via Arc

Uma das capacidades de governança mais poderosas do Azure Arc é a habilidade de aplicar Azure Policy a recursos não-Azure.

**Para servidores habilitados para Arc:**

As políticas do Azure Machine Configuration (anteriormente Guest Configuration) podem auditar e aplicar configurações dentro do sistema operacional:

| Categoria de Política | Exemplos |
|---|---|
| Baselines de segurança | Garantir complexidade de senha, retenção de logs de auditoria |
| Inventário de software | Auditar aplicações instaladas |
| Desvio de configuração | Detectar e remediar alterações de configuração |
| Conformidade | Aplicar benchmarks CIS, conformidade STIG |
| Gerenciamento de certificados | Monitorar expiração de certificados |

```json
{
  "properties": {
    "displayName": "Audit Windows machines that do not have the password complexity setting enabled",
    "policyType": "BuiltIn",
    "mode": "Indexed",
    "description": "Requires that prerequisites are deployed to the policy assignment scope.",
    "metadata": {
      "category": "Guest Configuration"
    }
  }
}
```

**Para Kubernetes habilitado para Arc:**

O Azure Policy for Kubernetes traduz políticas em constraints do OPA Gatekeeper:

- Garantir que contêineres só possam baixar imagens de registros aprovados
- Exigir limites de recursos (CPU e memória) em todos os contêineres
- Prevenir contêineres privilegiados
- Aplicar políticas de rede no nível de namespace

### RBAC e Monitoramento para Recursos Gerenciados por Arc

**RBAC:**

Como recursos habilitados para Arc têm IDs de recurso completos do Azure Resource Manager, o RBAC padrão do Azure funciona perfeitamente:

```
/subscriptions/{subId}/resourceGroups/{rgName}/providers/Microsoft.HybridCompute/machines/{machineName}
```

Você pode atribuir roles integradas como Reader, Contributor ou roles customizadas com escopo para recursos habilitados para Arc, resource groups ou subscriptions.

**Monitoramento:**

- Instale o Azure Monitor Agent (AMA) em servidores habilitados para Arc para coletar logs e métricas
- Configure Data Collection Rules (DCRs) para rotear dados para workspaces do Log Analytics
- Use os mesmos workbooks e alertas do Azure Monitor que você usa para VMs Azure
- Habilite VM Insights para monitoramento de desempenho e mapeamento de dependências

```bash
# Install Azure Monitor Agent on an Arc-enabled server
az connectedmachine extension create \
  --machine-name "my-server" \
  --resource-group "rg-arc-servers" \
  --name "AzureMonitorLinuxAgent" \
  --publisher "Microsoft.Azure.Monitor" \
  --type "AzureMonitorLinuxAgent" \
  --location "eastus"
```

---

## Melhores Práticas

1. **Comece com inventário** — Antes do onboarding, faça o inventário de todos os recursos não-Azure. Entenda o que você tem, onde é executado e quais lacunas de governança existem.

2. **Use resource groups estrategicamente** — Organize recursos habilitados para Arc em resource groups por localização, função ou unidade de negócio — assim como faria para recursos nativos Azure.

3. **Tagueie consistentemente** — Aplique a mesma estratégia de tagging aos recursos habilitados para Arc que aplica aos recursos nativos Azure. Isso permite rastreamento de custos e relatórios de governança unificados.

4. **Faça onboarding em escala** — Instalação manual do agente não escala. Use automação (Group Policy, Ansible, service principals) desde o início.

5. **Aplique políticas incrementalmente** — Comece com políticas em modo Audit para entender sua postura de conformidade. Mude para Deny ou DeployIfNotExists apenas após remediar violações existentes.

6. **Proteja a conexão do agente** — O Connected Machine agent usa HTTPS de saída. Garanta que seu firewall permita os endpoints necessários. Use private endpoints para ambientes sensíveis.

7. **Monitore a saúde do agente** — Configure alertas para falhas de heartbeat do agente. Um agente offline significa um ponto cego na sua governança.

8. **Use Azure Machine Configuration para governança no nível do SO** — Azure Policy sozinha governa o plano de recursos. Machine Configuration estende a governança para dentro do sistema operacional.

---

## Armadilhas Comuns

| Armadilha | Impacto | Mitigação |
|---|---|---|
| Esquecer de renovar credenciais do service principal usado para onboarding | Novos servidores falham ao conectar | Use managed identity quando possível; defina lembretes no calendário para renovação do SP |
| Não planejar conectividade de rede para o agente | Agente não consegue alcançar endpoints Azure | Libere as URLs necessárias; considere usar proxy ou private link |
| Tratar Arc como "apenas monitoramento" | Perder a oportunidade de governança | Aplique políticas, RBAC e tagging — não apenas monitoramento |
| Fazer onboarding de tudo de uma vez | Sobrecarregar a equipe de operações | Faça onboarding em fases: comece com servidores de produção, depois expanda |
| Ignorar Kubernetes habilitado para Arc | Clusters K8s permanecem sem governança | Estenda o Arc para Kubernetes para aplicação consistente de políticas |

---

## Exemplos de Código

### Azure Policy — Exigir Tags em Servidores Habilitados para Arc

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.HybridCompute/machines"
        },
        {
          "field": "tags['Environment']",
          "exists": "false"
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

### Resource Graph — Inventário de Todos os Recursos Habilitados para Arc

```kusto
resources
| where type in (
    "microsoft.hybridcompute/machines",
    "microsoft.kubernetes/connectedclusters"
  )
| project name, type, location, resourceGroup, subscriptionId,
    os = properties.osType,
    status = properties.status,
    tags
| order by type asc, name asc
```

### Resource Graph — Saúde do Agente Arc

```kusto
resources
| where type == "microsoft.hybridcompute/machines"
| extend lastHeartbeat = properties.lastStatusChange,
         agentVersion = properties.agentVersion,
         status = properties.status
| project name, status, lastHeartbeat, agentVersion, resourceGroup
| order by status asc
```

---

## Referências

- [Azure Arc Overview](https://learn.microsoft.com/azure/azure-arc/overview)
- [Arc-Enabled Servers](https://learn.microsoft.com/azure/azure-arc/servers/overview)
- [Arc-Enabled Kubernetes](https://learn.microsoft.com/azure/azure-arc/kubernetes/overview)
- [Azure Policy for Arc-Enabled Servers](https://learn.microsoft.com/azure/azure-arc/servers/policy-reference)
- [Azure Machine Configuration](https://learn.microsoft.com/azure/governance/machine-configuration/overview)
- [Azure Policy for Kubernetes](https://learn.microsoft.com/azure/governance/policy/concepts/policy-for-kubernetes)
- [Arc-Enabled Servers — At-Scale Onboarding](https://learn.microsoft.com/azure/azure-arc/servers/onboard-service-principal)
- [Azure Monitor Agent for Arc](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage)

---

| Anterior | Próximo |
|:---|:---|
| [Azure Landing Zones](ch23-azure-landing-zones.md) | [Sovereign Landing Zones](ch25-sovereign-landing-zones.md) |
