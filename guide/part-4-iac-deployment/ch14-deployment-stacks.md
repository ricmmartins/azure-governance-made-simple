# Chapter 14 — Deployment Stacks

> Last verified: 2026-04-06

---

## Overview

**Azure Blueprints is deprecated and reaches end of life on July 11, 2026. Deployment Stacks are the recommended replacement, generally available (GA) since May 2024.**

A **Deployment Stack** is an Azure resource that manages a collection of deployed resources as a single, atomic unit. When you create or update a Deployment Stack, you submit a Bicep file (or ARM JSON template), and Azure ensures that all resources defined in the template are deployed, updated, or cleaned up as a group.

Deployment Stacks solve a fundamental governance challenge: **how do you ensure that a set of resources stays consistent with its intended configuration, and how do you prevent unauthorized changes to governed resources?**

Key capabilities:

- **Atomic lifecycle management** — create, update, and delete a set of resources as one unit
- **Deny settings** — prevent modifications or deletions to managed resources, even by subscription owners
- **ActionOnUnmanage** — control what happens to resources removed from the template (delete, detach, or keep)
- **Cross-scope deployment** — a stack at the subscription scope can deploy resources into multiple resource groups
- **Governance enforcement** — deny settings act as a resource-level lock that is managed by the stack, not by individual RBAC assignments

---

## How It Works

### Deployment Stack Scopes

A Deployment Stack can be created at three scopes, each determining the blast radius and management hierarchy:

| Stack Scope | Can Deploy Resources To | Use Case |
|-------------|------------------------|----------|
| **Resource Group** | The same resource group | Single-application resource collections |
| **Subscription** | Any resource group within the subscription | Cross-resource-group deployments, subscription-level resources |
| **Management Group** | Any subscription/resource group within the management group | Enterprise-wide governance baselines |

### Deny Settings

Deny settings are the most powerful governance feature of Deployment Stacks. They prevent modifications to managed resources regardless of the user's RBAC role:

| Deny Setting | Effect |
|--------------|--------|
| `None` | No deny assignments applied — anyone with RBAC permissions can modify resources |
| `DenyDelete` | Managed resources cannot be deleted, but can be modified |
| `DenyWriteAndDelete` | Managed resources cannot be modified or deleted |

Deny settings are implemented through **deny assignments**, a feature of Azure RBAC. You can exclude specific principals (e.g., a break-glass account) or specific actions from the deny assignment:

```bash
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file main.bicep \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --deny-settings-excluded-actions 'Microsoft.Resources/tags/write'
```

### ActionOnUnmanage

When you update a Deployment Stack and remove a resource from the template, the `ActionOnUnmanage` setting determines what happens to the orphaned resource:

| Policy | Behavior |
|--------|----------|
| `deleteAll` | The resource is deleted from Azure |
| `deleteResources` | Resources are deleted; resource groups and management groups are detached |
| `detachAll` | The resource continues to exist but is no longer managed by the stack |

This is critical for governance — it prevents "resource sprawl" where resources are removed from templates but continue to exist (and cost money) in Azure.

### How a Stack Lifecycle Works

1. **Create** — you submit a Bicep template to create a stack; Azure deploys all resources and records them as "managed"
2. **Update** — you modify the template and update the stack; Azure computes the diff, deploys changes, and applies the `ActionOnUnmanage` policy to removed resources
3. **Deny** — deny assignments are applied to all managed resources according to the deny settings
4. **Delete** — when the stack is deleted, the `ActionOnUnmanage` policy determines whether managed resources are deleted or detached

---

## Blueprints vs. Deployment Stacks

For teams migrating from Azure Blueprints, this comparison highlights key differences:

| Feature | Azure Blueprints (Deprecated) | Deployment Stacks |
|---------|-------------------------------|-------------------|
| **Status** | Deprecated (EOL July 11, 2026) | GA since May 2024 |
| **Template language** | ARM JSON only | Bicep or ARM JSON |
| **Scope** | Management group, subscription | Resource group, subscription, management group |
| **Artifact types** | Policy, RBAC, ARM, resource groups | Any resources deployable via Bicep/ARM |
| **Versioning** | Built-in blueprint versions | Use source control and Template Specs |
| **Locking** | Blueprint-level locking (limited) | Deny assignments with fine-grained exclusions |
| **Orphan handling** | Manual cleanup | Automatic via ActionOnUnmanage |
| **CI/CD integration** | Limited | Full CLI/PowerShell/REST integration |
| **Module support** | None | Bicep modules, AVM, registries |
| **What-If support** | No | Yes |
| **State tracking** | Blueprint assignment object | Stack resource with managed resource list |

### Migration Guide: Blueprints to Deployment Stacks

**Step 1: Inventory your Blueprints**

```bash
# List all blueprint definitions
az blueprint list --management-group 'my-mg'

# List all blueprint assignments
az blueprint assignment list --subscription 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
```

**Step 2: Convert artifacts to Bicep**

Each Blueprint artifact type maps to a Bicep construct:

| Blueprint Artifact | Bicep Equivalent |
|-------------------|------------------|
| ARM template artifact | Bicep module or inline resource |
| Policy assignment artifact | `Microsoft.Authorization/policyAssignments` resource |
| Role assignment artifact | `Microsoft.Authorization/roleAssignments` resource |
| Resource group artifact | `Microsoft.Resources/resourceGroups` resource (at subscription scope) |

**Step 3: Create a Bicep template that includes all artifacts**

Consolidate all Blueprint artifacts into a single Bicep file (or a main file with modules).

**Step 4: Deploy as a Deployment Stack**

```bash
az stack sub create \
  --name 'migrated-governance-baseline' \
  --location eastus \
  --template-file governance-baseline.bicep \
  --deny-settings-mode DenyWriteAndDelete \
  --action-on-unmanage detachAll
```

**Step 5: Validate and remove the Blueprint assignment**

After verifying the Deployment Stack is correctly managing all resources:

```bash
az blueprint assignment delete \
  --name 'governance-baseline-assignment' \
  --subscription 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
```

---

## Best Practices

1. **Use `DenyWriteAndDelete` for production baselines** — this provides the strongest protection for governance-critical resources
2. **Exclude break-glass accounts** — always configure `deny-settings-excluded-principals` with your emergency access accounts
3. **Start with `detachAll` for ActionOnUnmanage** — while learning Deployment Stacks, use `detachAll` to avoid accidental resource deletion
4. **Use subscription-scope stacks for governance** — deploy policy assignments, RBAC, and resource groups from a single subscription-scoped stack
5. **Pin Bicep module versions** — reference specific versions of AVM or registry modules to prevent unexpected changes
6. **Integrate with CI/CD** — automate stack updates through pipelines with What-If and approval gates (see [Chapter 16](ch16-governance-cicd.md))
7. **Use consistent naming** — name stacks descriptively (e.g., `governance-baseline`, `app-infrastructure-prod`)
8. **Review managed resources regularly** — use `az stack sub show` to audit which resources are managed by each stack

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Using `deleteAll` without testing | Accidental deletion of resources | Start with `detachAll`; move to `deleteResources` after validation |
| Not excluding break-glass accounts from deny settings | Emergency operations blocked | Always exclude emergency access principals |
| Deploying at the wrong scope | Resources deployed to unexpected locations | Verify `targetScope` matches the stack scope |
| Forgetting deny settings protect against *everyone* | Administrators locked out of their own resources | Plan exclusions and document them |
| Not using What-If before stack updates | Unexpected changes to production resources | Always preview changes with `--confirm-with-what-if` |
| Treating stacks like one-time deployments | Drift accumulates over time | Update stacks regularly from CI/CD pipelines |

---

## Code Samples

### Creating a Deployment Stack via Azure CLI

```bash
# Create a subscription-scoped Deployment Stack with deny settings
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file governance-baseline.bicep \
  --parameters environmentName='production' \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --deny-settings-excluded-actions 'Microsoft.Resources/tags/write' \
  --action-on-unmanage deleteResources \
  --confirm-with-what-if \
  --yes

# List all Deployment Stacks in a subscription
az stack sub list --output table

# Show details of a specific stack (including managed resources)
az stack sub show --name 'governance-baseline' --output json

# Update an existing stack
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file governance-baseline-v2.bicep \
  --parameters environmentName='production' \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --action-on-unmanage deleteResources \
  --confirm-with-what-if \
  --yes

# Delete a stack (detaching managed resources)
az stack sub delete \
  --name 'governance-baseline' \
  --action-on-unmanage detachAll \
  --yes
```

### Creating a Deployment Stack via Bicep (Governance Baseline)

```bicep
// governance-baseline.bicep
targetScope = 'subscription'

@description('The Azure region for resources.')
param location string = 'eastus'

@description('The environment name.')
@allowed(['dev', 'staging', 'production'])
param environmentName string

var commonTags = {
  Environment: environmentName
  ManagedBy: 'DeploymentStack'
  GovernanceBaseline: 'v2.0'
}

// Create a governed resource group
resource governanceRg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-governance-${environmentName}'
  location: location
  tags: commonTags
}

// Assign the built-in "Require a tag on resources" policy
resource tagPolicy 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'require-cost-center-tag'
  properties: {
    displayName: 'Require CostCenter tag on resources'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/871b6d14-10aa-478d-b466-ef8e7a287eed'
    parameters: {
      tagName: {
        value: 'CostCenter'
      }
    }
    enforcementMode: 'Default'
  }
}

// Assign the built-in "Allowed locations" policy
resource locationPolicy 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'allowed-locations'
  properties: {
    displayName: 'Restrict resources to approved regions'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c'
    parameters: {
      listOfAllowedLocations: {
        value: [
          'eastus'
          'westus2'
          'westeurope'
        ]
      }
    }
    enforcementMode: 'Default'
  }
}

// Deploy Log Analytics workspace into the governance resource group
module logAnalytics 'modules/logAnalytics.bicep' = {
  name: 'logAnalyticsDeployment'
  scope: governanceRg
  params: {
    location: location
    workspaceName: 'log-governance-${environmentName}'
    tags: commonTags
  }
}
```

Deploy this as a Deployment Stack:

```bash
az stack sub create \
  --name 'governance-baseline' \
  --location eastus \
  --template-file governance-baseline.bicep \
  --parameters environmentName='production' \
  --deny-settings-mode DenyWriteAndDelete \
  --deny-settings-excluded-principals 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' \
  --action-on-unmanage deleteResources \
  --yes
```

---

## References

- [Deployment Stacks overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks)
- [Create a Deployment Stack with Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks-create)
- [Deployment Stack deny settings](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks-deny-settings)
- [Azure Blueprints deprecation announcement](https://learn.microsoft.com/en-us/azure/governance/blueprints/overview)
- [Migrate from Blueprints to Deployment Stacks](https://learn.microsoft.com/en-us/azure/governance/blueprints/migrate-to-deployment-stacks)
- [az stack CLI reference](https://learn.microsoft.com/en-us/cli/azure/stack)

---

| Previous | Next |
|:---------|:-----|
| [Bicep & Azure Verified Modules](ch13-bicep-avm.md) | [Template Specs](ch15-template-specs.md) |
