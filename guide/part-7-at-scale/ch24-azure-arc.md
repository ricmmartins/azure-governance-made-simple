# Chapter 24 — Azure Arc

> Last verified: 2026-04-06

---

## Overview

**Azure Arc** extends Azure's governance and management capabilities to resources running outside of Azure — whether on-premises, in other clouds (AWS, GCP), or at the edge. With Azure Arc, you can project non-Azure resources into Azure Resource Manager (ARM), enabling you to use the same governance tools (Azure Policy, RBAC, tags, monitoring) on all your infrastructure, regardless of where it runs.

Azure Arc answers a critical governance question: *How do I apply consistent policies, access controls, and monitoring across a hybrid and multi-cloud estate?*

### What Azure Arc Enables

| Capability | Without Arc | With Arc |
|---|---|---|
| Azure Policy | Azure resources only | Any connected server or Kubernetes cluster |
| RBAC | Azure resources only | Arc-enabled resources get ARM resource IDs |
| Tagging | Azure resources only | Tag on-premises servers, multi-cloud VMs |
| Azure Monitor | Azure resources only | Monitor any connected machine |
| Microsoft Defender for Cloud | Azure resources only | Security posture for hybrid resources |
| Update Manager | Azure VMs only | Patch any connected server |

---

## How It Works

### Arc-Enabled Servers

Arc-enabled servers allow you to manage Windows and Linux physical servers and virtual machines hosted outside of Azure as if they were Azure resources.

**How it works:**

1. Install the **Azure Connected Machine agent** on the target server
2. The agent establishes a secure outbound connection to Azure (no inbound ports required)
3. The server appears as a resource in Azure Resource Manager with a full resource ID
4. You can now apply Azure Policy, assign RBAC roles, tag the resource, and configure monitoring

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

**At-scale onboarding:**

For large environments, use one of these approaches instead of manual installation:

- **Service principal** — Script the agent installation with a service principal for unattended onboarding
- **Group Policy** — Deploy the agent via Group Policy for domain-joined Windows servers
- **Ansible/Chef/Puppet** — Use configuration management tools for Linux/Windows fleets
- **VMware vCenter integration** — Azure Arc-enabled VMware vSphere for vCenter-managed VMs
- **SCVMM integration** — Azure Arc-enabled System Center Virtual Machine Manager

### Arc-Enabled Kubernetes

Arc-enabled Kubernetes lets you attach and manage Kubernetes clusters running anywhere — AKS on Azure Stack HCI, EKS, GKE, Rancher, or self-managed clusters.

**How it works:**

1. Install the Arc agents on the Kubernetes cluster using Helm or the Azure CLI
2. The cluster is represented as a resource in Azure Resource Manager
3. You can then apply Azure Policy for Kubernetes (Gatekeeper-based), GitOps configurations, and monitoring

```bash
# Connect a Kubernetes cluster to Azure Arc
az connectedk8s connect \
  --name "my-k8s-cluster" \
  --resource-group "rg-arc-k8s" \
  --location "eastus" \
  --tags "Environment=Production"
```

**Key capabilities for Arc-enabled Kubernetes:**

- **Azure Policy for Kubernetes** — Enforce pod security, container image restrictions, and namespace policies
- **GitOps with Flux** — Deploy configurations and applications from Git repositories
- **Azure Monitor Container Insights** — Monitor cluster health and performance
- **Microsoft Defender for Containers** — Runtime threat detection for Arc-enabled clusters
- **Azure Key Vault Secrets Provider** — Mount secrets from Key Vault into pods

### Azure Policy via Arc

One of the most powerful governance capabilities of Azure Arc is the ability to apply Azure Policy to non-Azure resources.

**For Arc-enabled servers:**

Azure Machine Configuration (formerly Guest Configuration) policies can audit and enforce settings inside the operating system:

| Policy Category | Examples |
|---|---|
| Security baselines | Ensure password complexity, audit log retention |
| Software inventory | Audit installed applications |
| Configuration drift | Detect and remediate configuration changes |
| Compliance | Enforce CIS benchmarks, STIG compliance |
| Certificate management | Monitor certificate expiration |

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

**For Arc-enabled Kubernetes:**

Azure Policy for Kubernetes translates policies into OPA Gatekeeper constraints:

- Enforce that containers can only pull images from approved registries
- Require resource limits (CPU and memory) on all containers
- Prevent privileged containers
- Enforce namespace-level network policies

### RBAC and Monitoring for Arc-Managed Resources

**RBAC:**

Since Arc-enabled resources have full Azure Resource Manager resource IDs, standard Azure RBAC works seamlessly:

```
/subscriptions/{subId}/resourceGroups/{rgName}/providers/Microsoft.HybridCompute/machines/{machineName}
```

You can assign built-in roles like Reader, Contributor, or custom roles scoped to Arc-enabled resources, resource groups, or subscriptions.

**Monitoring:**

- Install the Azure Monitor Agent (AMA) on Arc-enabled servers to collect logs and metrics
- Configure Data Collection Rules (DCRs) to route data to Log Analytics workspaces
- Use the same Azure Monitor workbooks and alerts that you use for Azure VMs
- Enable VM Insights for performance monitoring and dependency mapping

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

## Best Practices

1. **Start with inventory** — Before onboarding, inventory all non-Azure resources. Understand what you have, where it runs, and what governance gaps exist.

2. **Use resource groups strategically** — Organize Arc-enabled resources into resource groups by location, function, or business unit — just as you would for native Azure resources.

3. **Tag consistently** — Apply the same tagging strategy to Arc-enabled resources as you do to Azure-native resources. This enables unified cost tracking and governance reporting.

4. **Onboard at scale** — Manual agent installation does not scale. Use automation (Group Policy, Ansible, service principals) from the start.

5. **Apply policies incrementally** — Start with Audit-mode policies to understand your compliance posture. Switch to Deny or DeployIfNotExists only after remediating existing violations.

6. **Secure the agent connection** — The Connected Machine agent uses outbound HTTPS. Ensure your firewall allows the required endpoints. Use private endpoints for sensitive environments.

7. **Monitor agent health** — Set up alerts for agent heartbeat failures. An offline agent means a blind spot in your governance.

8. **Use Azure Machine Configuration for OS-level governance** — Azure Policy alone governs the resource plane. Machine Configuration extends governance inside the operating system.

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---|---|---|
| Forgetting to renew service principal credentials used for onboarding | New servers fail to connect | Use managed identity where possible; set calendar reminders for SP renewal |
| Not planning network connectivity for the agent | Agent cannot reach Azure endpoints | Whitelist required URLs; consider using a proxy or private link |
| Treating Arc as "just monitoring" | Missing the governance opportunity | Apply policies, RBAC, and tagging — not just monitoring |
| Onboarding everything at once | Overwhelming the operations team | Onboard in phases: start with production servers, then expand |
| Ignoring Arc-enabled Kubernetes | K8s clusters remain ungoverned | Extend Arc to Kubernetes for consistent policy enforcement |

---

## Code Samples

### Azure Policy — Require Tags on Arc-Enabled Servers

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

### Resource Graph — Inventory All Arc-Enabled Resources

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

### Resource Graph — Arc Agent Health

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

## References

- [Azure Arc Overview](https://learn.microsoft.com/azure/azure-arc/overview)
- [Arc-Enabled Servers](https://learn.microsoft.com/azure/azure-arc/servers/overview)
- [Arc-Enabled Kubernetes](https://learn.microsoft.com/azure/azure-arc/kubernetes/overview)
- [Azure Policy for Arc-Enabled Servers](https://learn.microsoft.com/azure/azure-arc/servers/policy-reference)
- [Azure Machine Configuration](https://learn.microsoft.com/azure/governance/machine-configuration/overview)
- [Azure Policy for Kubernetes](https://learn.microsoft.com/azure/governance/policy/concepts/policy-for-kubernetes)
- [Arc-Enabled Servers — At-Scale Onboarding](https://learn.microsoft.com/azure/azure-arc/servers/onboard-service-principal)
- [Azure Monitor Agent for Arc](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage)

---

| Previous | Next |
|:---|:---|
| [Azure Landing Zones](ch23-azure-landing-zones.md) | [Sovereign Landing Zones](ch25-sovereign-landing-zones.md) |
