# Chapter 23 — Azure Landing Zones

> Last verified: 2026-04-06

---

## Overview

An **Azure Landing Zone (ALZ)** is a pre-configured Azure environment that follows the Cloud Adoption Framework (CAF) best practices for security, governance, networking, and identity. Think of it as a "blueprint" (conceptually — not the deprecated Azure Blueprints service) for how your Azure environment should be organized before workloads are deployed.

Landing zones answer a fundamental question: *How should my Azure environment be structured so that every team can deploy workloads securely, compliantly, and at scale — without reinventing the wheel each time?*

The ALZ conceptual architecture provides:

- A **management group hierarchy** that mirrors organizational responsibilities
- **Subscription-level isolation** between platform services and workloads
- **Centralized networking** with hub-and-spoke or Virtual WAN topologies
- **Baseline policies** for security, compliance, and cost governance
- **Centralized logging and monitoring** through a management subscription
- **Identity integration** with Microsoft Entra ID

```
                    ┌─────────────────────┐
                    │   Tenant Root Group  │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │     Organization     │
                    │  (Top-Level MG)      │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
   ┌──────┴──────┐    ┌───────┴───────┐    ┌───────┴───────┐
   │  Platform   │    │  Landing      │    │  Decomm /     │
   │             │    │  Zones        │    │  Sandbox      │
   └──────┬──────┘    └───────┬───────┘    └───────────────┘
          │                   │
   ┌──────┼──────┐     ┌─────┴──────┐
   │      │      │     │            │
 Mgmt  Conn  Identity  Corp      Online
```

---

## How It Works

### ALZ Design Areas

The ALZ architecture is organized around eight design areas, each addressing a critical aspect of enterprise cloud adoption:

#### 1. Billing and Microsoft Entra ID Tenants

- Align Azure subscriptions with your Enterprise Agreement (EA) or Microsoft Customer Agreement (MCA)
- Establish the relationship between your Microsoft Entra ID tenant and Azure subscriptions
- Decide on single-tenant vs. multi-tenant strategies

#### 2. Identity and Access Management

- Centralize identity with Microsoft Entra ID
- Enable Privileged Identity Management (PIM) for just-in-time access
- Federate on-premises Active Directory with Microsoft Entra ID via Microsoft Entra Connect
- Implement Conditional Access policies for platform administrators
- Use workload identity federation for CI/CD pipelines

#### 3. Management Group and Subscription Organization

The CAF recommends a specific management group hierarchy:

| Management Group | Purpose |
|---|---|
| **Tenant Root Group** | Top of the hierarchy; avoid assigning policies directly here |
| **Organization (Top-Level)** | Represents the organization; apply broad policies here |
| **Platform** | Contains subscriptions for shared platform services |
| **Platform → Management** | Centralized logging, monitoring, and automation |
| **Platform → Connectivity** | Hub networking, DNS, firewall, ExpressRoute/VPN |
| **Platform → Identity** | Domain controllers, identity services |
| **Landing Zones** | Contains workload subscriptions |
| **Landing Zones → Corp** | Workloads that require corporate network connectivity |
| **Landing Zones → Online** | Internet-facing workloads with no corporate network requirement |
| **Decommissioned** | Subscriptions being retired |
| **Sandbox** | Subscriptions for experimentation (no connectivity to production) |

#### 4. Network Topology and Connectivity

Choose between two primary topologies:

- **Hub-and-Spoke**: A central hub virtual network connected to spoke VNets via peering. Best for organizations with moderate networking complexity.
- **Virtual WAN**: A Microsoft-managed networking service for large-scale branch and global connectivity. Best for organizations with many branch offices or global presence.

#### 5. Security

- Enable Microsoft Defender for Cloud on all subscriptions
- Apply the Microsoft Cloud Security Benchmark (MCSB)
- Centralize security logging in the management subscription
- Implement network security with Azure Firewall or third-party NVAs

#### 6. Governance

- Assign Azure Policy at the appropriate management group level
- Enforce tagging, allowed regions, and allowed resource types
- Use policy-driven governance (DeployIfNotExists) for automatic remediation
- Implement resource locks on critical infrastructure

#### 7. Management and Monitoring

- Deploy Azure Monitor, Log Analytics, and Azure Monitor alerts centrally
- Configure diagnostic settings to send logs to the central workspace
- Use Azure Monitor workbooks for governance dashboards
- Enable Update Manager for patch compliance

#### 8. Platform Automation and DevOps

- Manage infrastructure as code (Bicep or Terraform)
- Implement CI/CD pipelines for policy and infrastructure deployment
- Use Policy as Code (EPAC or Azure DevOps/GitHub Actions)
- Automate subscription provisioning through subscription vending

### ALZ Accelerator

The **ALZ Accelerator** is the current recommended deployment approach for Azure Landing Zones. It replaces the older "Enterprise-Scale" terminology and provides a portal-based, guided deployment experience.

The ALZ Accelerator:

- Walks you through each design area via a step-by-step wizard
- Deploys the management group hierarchy, policies, and platform subscriptions
- Configures networking (Hub-and-Spoke or Virtual WAN)
- Sets up centralized logging and monitoring
- Applies baseline Azure Policy assignments
- Generates the IaC (Bicep) for everything it deploys, so you can manage it going forward

**How to access it:**

1. Navigate to the [ALZ Accelerator portal experience](https://aka.ms/caf/ready/accelerator)
2. Follow the guided wizard
3. Review and deploy

> **Tip:** Even if you plan to customize heavily, starting with the ALZ Accelerator gives you a solid foundation. You can always modify the generated Bicep templates afterward.

### Subscription Vending

**Subscription vending** is the practice of automating the creation and configuration of new Azure subscriptions. Instead of manually creating subscriptions and configuring them, teams request subscriptions through an automated process that:

1. Creates the subscription under the correct management group
2. Applies baseline policies and RBAC assignments
3. Configures networking (VNet peering to the hub, DNS)
4. Sets up diagnostic settings and monitoring
5. Applies required tags and budget alerts

Subscription vending can be implemented using:

- **Bicep/Terraform modules** — The ALZ Terraform module includes a built-in subscription vending module
- **Azure DevOps or GitHub Actions pipelines** — Triggered by a service catalog request
- **The Subscription Vending Bicep module** — Available in the Azure Verified Modules registry

```bicep
// Example: Subscription vending with Bicep (simplified)
targetScope = 'managementGroup'

module subVend 'br/public:avm/ptn/subscription-vending:0.1.0' = {
  name: 'sub-vend-${workloadName}'
  params: {
    subscriptionAliasName: workloadName
    subscriptionDisplayName: '${workloadName}-${environment}'
    subscriptionBillingScope: billingScope
    subscriptionManagementGroupId: targetManagementGroupId
    subscriptionTags: {
      Environment: environment
      CostCenter: costCenter
      Owner: ownerEmail
    }
    virtualNetworkEnabled: true
    virtualNetworkAddressSpace: ['10.1.0.0/16']
    virtualNetworkResourceGroupName: 'rg-networking'
    virtualNetworkPeeringEnabled: true
    hubNetworkResourceId: hubVnetResourceId
  }
}
```

### Reference Implementations

The ALZ reference implementations are available on GitHub and provide complete, deployable architectures:

| Reference Implementation | Description | Use When |
|---|---|---|
| **ALZ Foundation** (Wingtip) | Management groups, policies, and governance — no networking | You manage networking separately or are just starting |
| **ALZ Hub-and-Spoke** (AdventureWorks) | Full ALZ with hub-and-spoke networking topology | Most common choice for enterprises |
| **ALZ Virtual WAN** (Contoso) | Full ALZ with Azure Virtual WAN networking | Global organizations with many branch offices |

All three implementations are available at [github.com/Azure/Enterprise-Scale](https://github.com/Azure/Enterprise-Scale) and can be deployed via the ALZ Accelerator portal or directly from the repository.

### Hub-and-Spoke vs. Virtual WAN

| Consideration | Hub-and-Spoke | Virtual WAN |
|---|---|---|
| **Complexity** | You manage the hub VNet, peering, and routing | Microsoft manages the hub infrastructure |
| **Branch connectivity** | Manual VPN/ExpressRoute configuration | Automated branch-to-branch and branch-to-Azure |
| **Global transit** | Requires manual configuration | Built-in global transit routing |
| **Cost** | Lower baseline cost; pay for what you deploy | Higher baseline cost; includes managed routing |
| **Customization** | Full control over hub NVAs, routing tables | Limited customization of the managed hub |
| **Best for** | Single-region, moderate branch count | Multi-region, many branches, SD-WAN integration |

**Decision guidance:**

- Choose **Hub-and-Spoke** if you have a single Azure region, fewer than 10 branch offices, and want full control over your network design.
- Choose **Virtual WAN** if you operate across multiple Azure regions, have many branch offices, or need integrated SD-WAN connectivity.

---

## Best Practices

1. **Start with the ALZ Accelerator** — Even if your organization has unique requirements, the Accelerator provides a validated starting point. Customize afterward rather than building from scratch.

2. **Keep the management group hierarchy shallow** — The CAF recommends no more than six levels of depth. Most organizations need only three to four levels.

3. **Assign policies at the right level** — Apply broad policies (e.g., allowed regions, required tags) at the top-level management group. Apply workload-specific policies at the landing zone management group level.

4. **Use subscription vending** — Manual subscription creation does not scale. Automate subscription provisioning early, even if you only have a few subscriptions today.

5. **Separate platform and workload subscriptions** — Never mix platform services (networking, identity, management) with application workloads in the same subscription.

6. **Treat the landing zone as code** — Store all ALZ configuration (management groups, policies, RBAC, networking) in a Git repository. Use CI/CD pipelines for changes.

7. **Plan for growth** — Design your IP address space, management group structure, and policy assignments with future scale in mind. Retrofitting is much harder than planning ahead.

8. **Don't skip the Identity subscription** — Even if you don't have on-premises domain controllers today, having a dedicated identity subscription makes it easy to add them later.

---

## Common Pitfalls

| Pitfall | Why It Happens | How to Avoid |
|---|---|---|
| Deploying workloads before the landing zone is ready | Pressure to deliver quickly | Establish a minimum viable landing zone first, then iterate |
| Over-customizing the management group hierarchy | Trying to mirror the org chart exactly | Follow the CAF recommended hierarchy; it maps to functions, not departments |
| Assigning policies at the Tenant Root Group | Wanting universal coverage | Use the top-level organization management group instead; Tenant Root Group changes affect all future management groups |
| Ignoring subscription limits | Not planning for scale | Monitor subscription-level quotas; use subscription vending to spread workloads |
| Treating ALZ as a one-time deployment | "Set it and forget it" mentality | The landing zone evolves with your organization; plan for ongoing maintenance |
| Not involving networking and security teams early | Treating ALZ as purely an infrastructure concern | ALZ spans identity, networking, security, and governance — all teams must be involved |

---

## Code Samples

### Deploying ALZ with Bicep (Management Group Hierarchy)

```bicep
targetScope = 'tenant'

@description('Top-level management group name')
param topLevelMgName string = 'Contoso'

// Top-level management group
resource topLevelMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: topLevelMgName
  properties: {
    displayName: topLevelMgName
  }
}

// Platform management group
resource platformMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: '${topLevelMgName}-Platform'
  properties: {
    displayName: 'Platform'
    details: {
      parent: {
        id: topLevelMg.id
      }
    }
  }
}

// Landing Zones management group
resource landingZonesMg 'Microsoft.Management/managementGroups@2023-04-01' = {
  name: '${topLevelMgName}-LandingZones'
  properties: {
    displayName: 'Landing Zones'
    details: {
      parent: {
        id: topLevelMg.id
      }
    }
  }
}

// Child management groups under Platform
var platformChildren = ['Management', 'Connectivity', 'Identity']
resource platformChildMgs 'Microsoft.Management/managementGroups@2023-04-01' = [
  for child in platformChildren: {
    name: '${topLevelMgName}-Platform-${child}'
    properties: {
      displayName: child
      details: {
        parent: {
          id: platformMg.id
        }
      }
    }
  }
]

// Child management groups under Landing Zones
var lzChildren = ['Corp', 'Online']
resource lzChildMgs 'Microsoft.Management/managementGroups@2023-04-01' = [
  for child in lzChildren: {
    name: '${topLevelMgName}-LandingZones-${child}'
    properties: {
      displayName: child
      details: {
        parent: {
          id: landingZonesMg.id
        }
      }
    }
  }
]
```

### Querying Landing Zone Structure with Azure Resource Graph

```kusto
// List all management groups and their parents
resourcecontainers
| where type == "microsoft.management/managementgroups"
| extend parentId = properties.details.parent.id
| project name, displayName=properties.displayName, parentId
| order by name asc
```

---

## References

- [What is an Azure Landing Zone?](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/)
- [ALZ Design Areas](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-areas)
- [ALZ Accelerator](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/landing-zone-deploy)
- [Management Group and Subscription Organization](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org)
- [Network Topology and Connectivity](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/network-topology-and-connectivity)
- [Hub-and-Spoke Network Topology](https://learn.microsoft.com/azure/architecture/networking/architecture/hub-spoke)
- [Azure Virtual WAN](https://learn.microsoft.com/azure/virtual-wan/virtual-wan-about)
- [Subscription Vending](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending)
- [ALZ Reference Implementations (GitHub)](https://github.com/Azure/Enterprise-Scale)
- [Azure Verified Modules — Subscription Vending](https://learn.microsoft.com/azure/architecture/landing-zones/subscription-vending)

---

| Previous | Next |
|:---|:---|
| [Chapter 22 — AzGovViz](../part-6-observability/ch22-azgovviz.md) | [Chapter 24 — Azure Arc](ch24-azure-arc.md) |
