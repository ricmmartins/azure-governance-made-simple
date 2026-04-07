# Chapter 2 — Governance at a Glance: The Big Picture

> **Last verified: 2026-04-06**

---

## Overview

Azure provides a rich set of **native governance capabilities** — tools and services that are built into the platform, require no additional purchases, and are available the moment you create your first subscription. Understanding how these capabilities fit together is the first step toward building a governance framework that scales with your organization.

This chapter provides a comprehensive map of every Azure governance capability, explains how they interconnect at different scope levels, and shows how to think about them as a unified system rather than a collection of isolated features.

---

## Architecture: The Governance Capability Map

The following diagram shows all major Azure governance capabilities organized by the scope at which they operate:

![Azure Governance Capability Map](/images/governance-capability-map.svg)

---

## How It Works: The Full Capability Inventory

Every governance capability listed below is native to Azure. They are grouped by function, not by Azure product name, to make it clear how they serve governance objectives.

### Identity and Access

| Capability | What It Does | Scope |
|---|---|---|
| **Microsoft Entra ID** | Cloud identity platform — manages users, groups, service principals, and managed identities. The trust anchor for all Azure subscriptions. | Tenant |
| **Role-Based Access Control (RBAC)** | Assigns permissions (roles) to identities at management group, subscription, resource group, or resource scope. Supports 500+ built-in roles and custom roles. | Management Group → Resource |
| **Privileged Identity Management (PIM)** | Provides just-in-time, time-bound, and approval-based activation for privileged roles. | Tenant / Subscription |
| **Conditional Access** | Enforces access policies based on signals like user location, device compliance, or risk level. | Tenant |
| **Access Reviews** | Periodically reviews and certifies access to ensure no privilege creep. | Tenant |

### Policy and Compliance

| Capability | What It Does | Scope |
|---|---|---|
| **Azure Policy** | Evaluates resources against policy rules. Can **deny** non-compliant deployments, **audit** existing resources, **modify** resource properties, or **deploy** missing configurations. | Management Group → Resource |
| **Azure Machine Configuration** | Extends Azure Policy inside VMs and Arc-enabled servers. Audits and enforces OS-level configuration (formerly "Guest Configuration"). | Resource (VMs) |
| **Microsoft Defender for Cloud** | Provides security posture management, vulnerability assessment, threat detection, and regulatory compliance dashboards. | Subscription → Resource |
| **Resource Locks** | Prevents accidental deletion or modification of critical resources. Two modes: `CanNotDelete` and `ReadOnly`. | Subscription → Resource |

### Resource Organization

| Capability | What It Does | Scope |
|---|---|---|
| **Management Groups** | Hierarchical containers above subscriptions. Up to 6 levels deep. Used to apply RBAC and Azure Policy at scale. | Tenant (below root MG) |
| **Subscriptions** | Logical containers for resources. Serve as billing boundaries, scale boundaries, and policy boundaries. | Under Management Groups |
| **Resource Groups** | Logical containers within a subscription. Group resources by application, lifecycle, or billing purpose. | Subscription |
| **Naming Conventions** | Standardized patterns for resource names that encode resource type, workload, environment, and region. | All scopes |
| **Tags** | Key-value metadata applied to resources and resource groups. Used for cost allocation, automation, operations, and compliance. | Resource Group / Resource |

### Deployment and Infrastructure as Code

| Capability | What It Does | Scope |
|---|---|---|
| **Bicep (Infrastructure as Code)** | Declarative infrastructure-as-code language for defining and deploying Azure resources repeatably. | All scopes |
| **Deployment Stacks** | Manages a collection of resources as a single unit. Prevents unauthorized changes and supports deny settings for managed resources. | Management Group → Resource Group |
| **Terraform (AzureRM provider)** | HashiCorp's multi-cloud IaC tool. Widely used for Azure deployments with state management. | All scopes |

### Cost Management

| Capability | What It Does | Scope |
|---|---|---|
| **Azure Cost Management** | Analyzes costs, creates budgets, sets alerts, exports billing data, and provides optimization recommendations. | Management Group → Resource Group |
| **Azure Reservations / Savings Plans** | Pre-committed pricing that reduces costs for predictable workloads. | Billing scope |

### Observability and Visibility

| Capability | What It Does | Scope |
|---|---|---|
| **Azure Monitor** | Collects and analyzes metrics, logs, and traces from Azure resources. Provides alerting, dashboards, and workbooks. | Resource → Workspace |
| **Azure Resource Graph** | A Big Data query engine that allows you to explore your Azure environment at scale using Kusto Query Language (KQL). Returns results in seconds across thousands of subscriptions. | Tenant |
| **Azure Governance Visualizer** | An open-source community tool (aka "AzGovViz") that produces HTML/Markdown reports visualizing management groups, policies, RBAC, and more. | Tenant |

> **Note on Azure Blueprints:** Azure Blueprints is deprecated (retirement: July 2026). Organizations should use **Deployment Stacks**, **Bicep**, or **Terraform** for repeatable environment deployment. See the [Azure Blueprints deprecation notice](https://learn.microsoft.com/azure/governance/blueprints/overview) for migration guidance.

---

## How Capabilities Interconnect

Governance capabilities do not operate in isolation. Here is how they connect across scope levels:

### Inheritance Flows Downward

When you assign an Azure Policy at a management group, every subscription, resource group, and resource beneath that management group inherits the policy. The same applies to RBAC role assignments. This inheritance model is the engine that makes governance scalable:

![Policy & RBAC Inheritance Flow](/images/governance-inheritance-flow.svg)

### The Governance Data Flow

1. **Microsoft Entra ID** authenticates a user and provides identity claims.
2. **RBAC** evaluates whether the identity has permission to perform the requested action at the target scope.
3. **Azure Policy** evaluates whether the resource configuration complies with assigned policies.
4. **Azure Resource Manager** creates (or denies) the resource.
5. **Tags** are applied to the resource for cost allocation and operational tracking.
6. **Azure Cost Management** aggregates spending data by tag, subscription, and resource group.
7. **Azure Monitor** collects operational telemetry from the resource.
8. **Azure Resource Graph** indexes the resource for cross-subscription querying.
9. **Microsoft Defender for Cloud** assesses the resource's security posture.

---

## Best Practices

1. **Know the full inventory.** Many organizations use only a fraction of available governance tools. Review the capability map above and identify gaps in your current implementation.
2. **Layer controls by scope.** Apply broad, universal policies at the root management group. Apply environment-specific policies (e.g., stricter rules for production) at child management groups.
3. **Combine preventive and detective controls.** Use Azure Policy `deny` effects to prevent bad configurations and `audit` effects to detect drift in existing resources.
4. **Use Azure Resource Graph for visibility.** Do not rely on the Azure Portal to understand your environment at scale. Write KQL queries to answer questions like "How many storage accounts lack encryption?"
5. **Automate governance deployment.** Define policies, role assignments, and management group structures in Bicep or Terraform. Deploy them through CI/CD pipelines.

---

## Common Pitfalls

| Pitfall | Why It Hurts | What to Do Instead |
|---|---|---|
| Relying on Azure Blueprints for new projects | Blueprints is deprecated (July 2026) | Migrate to Deployment Stacks + Bicep or Terraform |
| Assigning policies only at the subscription level | New subscriptions are ungoverned until someone remembers to assign policies | Assign foundational policies at the management group level |
| Ignoring Azure Resource Graph | Teams lack visibility into resource sprawl | Build a library of KQL queries for common governance questions |
| Treating tags as optional | Cost allocation, automation, and incident response all break without consistent tagging | Enforce mandatory tags via Azure Policy from day one |
| Not using Managed Identities | Service principals with secrets create security risk and operational burden | Prefer managed identities for Azure-to-Azure authentication |

---

## Code Samples

### Azure Resource Graph — Find Untagged Resources

```kusto
resources
| where isnull(tags) or tags == dynamic({})
| project name, type, resourceGroup, subscriptionId
| order by type asc
```

### Azure CLI — List Policy Assignments at a Management Group

```bash
az policy assignment list \
  --scope "/providers/Microsoft.Management/managementGroups/my-root-mg" \
  --output table
```

### Bicep — Create a Management Group Hierarchy

```bicep
targetScope = 'tenant'

resource rootMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-contoso'
  properties: {
    displayName: 'Contoso Root'
  }
}

resource platformMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-platform'
  properties: {
    displayName: 'Platform'
    details: {
      parent: {
        id: rootMg.id
      }
    }
  }
}

resource landingZonesMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: 'mg-landingzones'
  properties: {
    displayName: 'Landing Zones'
    details: {
      parent: {
        id: rootMg.id
      }
    }
  }
}
```

---

## Hands-On Exercise

**Scenario:** You have just been given access to your organization's Azure environment. Your task is to build a governance inventory.

1. **Open Azure Resource Graph Explorer** in the Azure Portal.
2. **Run the following query** to see all policy assignments in your environment:
   ```kusto
   policyresources
   | where type == "microsoft.authorization/policyassignments"
   | project name, properties.displayName, properties.scope
   | order by name asc
   ```
3. **Identify gaps:** Are there management groups without policy assignments? Subscriptions without budgets? Resources without tags?
4. **Create a governance capability checklist** using the inventory table in this chapter. For each capability, note whether it is implemented, partially implemented, or not yet started.

---

## References

| Resource | Link |
|---|---|
| Azure governance overview | [learn.microsoft.com/azure/governance/](https://learn.microsoft.com/azure/governance/) |
| Azure Policy overview | [learn.microsoft.com/azure/governance/policy/overview](https://learn.microsoft.com/azure/governance/policy/overview) |
| Management groups overview | [learn.microsoft.com/azure/governance/management-groups/overview](https://learn.microsoft.com/azure/governance/management-groups/overview) |
| Azure Resource Graph overview | [learn.microsoft.com/azure/governance/resource-graph/overview](https://learn.microsoft.com/azure/governance/resource-graph/overview) |
| Azure RBAC overview | [learn.microsoft.com/azure/role-based-access-control/overview](https://learn.microsoft.com/azure/role-based-access-control/overview) |
| Microsoft Defender for Cloud | [learn.microsoft.com/azure/defender-for-cloud/](https://learn.microsoft.com/azure/defender-for-cloud/) |
| Azure Cost Management | [learn.microsoft.com/azure/cost-management-billing/](https://learn.microsoft.com/azure/cost-management-billing/) |
| Azure Monitor overview | [learn.microsoft.com/azure/azure-monitor/overview](https://learn.microsoft.com/azure/azure-monitor/overview) |
| Deployment Stacks | [learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deployment-stacks) |
| Azure Governance Visualizer (GitHub) | [github.com/Azure/Azure-Governance-Visualizer](https://github.com/Azure/Azure-Governance-Visualizer) |
| Azure Blueprints deprecation | [learn.microsoft.com/azure/governance/blueprints/overview](https://learn.microsoft.com/azure/governance/blueprints/overview) |

---

| Previous | Next |
|:---|:---|
| [Chapter 1 — Why Governance Matters](ch01-why-governance-matters.md) | [Chapter 3 — Governance Maturity Model](ch03-governance-maturity-model.md) |
