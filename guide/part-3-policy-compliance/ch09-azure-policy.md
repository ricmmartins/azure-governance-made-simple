# Chapter 9 — Azure Policy

> Last verified: 2026-04-06

Azure Policy is the backbone of governance in Azure. It lets you define organizational standards, evaluate resources for compliance, and enforce or remediate non-compliant configurations at scale. Whether you need to restrict which regions teams can deploy to, ensure every resource is tagged, or automatically configure diagnostic settings, Azure Policy is the mechanism that makes it happen.

This chapter covers the full lifecycle of Azure Policy — from core concepts through advanced patterns like Policy as Code and remediation at scale.

---

## 9.1 Core Concepts

### Policy Definitions

A **policy definition** is a JSON object that describes a business rule. It contains:

- **Conditions** (`if`) — which resources the rule applies to.
- **Effect** (`then`) — what happens when the conditions are met (e.g., deny, audit, modify).

Each definition targets a specific concern — for example, "storage accounts must use HTTPS" or "virtual machines must use managed disks."

```json
{
  "properties": {
    "displayName": "Require HTTPS on Storage Accounts",
    "policyType": "Custom",
    "mode": "Indexed",
    "description": "Ensures all storage accounts enforce HTTPS traffic only.",
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Storage/storageAccounts"
          },
          {
            "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly",
            "notEquals": true
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

### Initiatives (Policy Sets)

An **initiative** (also called a **policy set**) groups multiple policy definitions into a single assignable unit. This simplifies management when you have dozens or hundreds of policies. For example, the built-in **Microsoft Cloud Security Benchmark** initiative bundles hundreds of security-related policies.

```json
{
  "properties": {
    "displayName": "Tagging Governance Initiative",
    "policyType": "Custom",
    "description": "Ensures all resources and resource groups have required tags.",
    "policyDefinitions": [
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/96670d01-0a4d-4649-9c89-2d3abc0a5025",
        "parameters": {
          "tagName": { "value": "CostCenter" }
        }
      },
      {
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/ea3f2387-9b95-492a-a190-fcdc54f7b070",
        "parameters": {
          "tagName": { "value": "CostCenter" }
        }
      }
    ]
  }
}
```

### Assignments

A **policy assignment** is the act of attaching a policy definition or initiative to a scope. An assignment specifies:

- **Scope** — Where the policy applies (management group, subscription, or resource group).
- **Parameters** — Values that customize the behavior of the policy.
- **Enforcement mode** — Whether the policy is actively enforced (`Default`) or only evaluated for compliance (`DoNotEnforce`).
- **Non-compliance message** — A custom message shown when a deployment is denied.

### Scopes

Policy assignments follow the Azure resource hierarchy:

![Policy Scope Hierarchy](/images/policy-scope-hierarchy.svg)

Policies assigned at a higher scope are **inherited** by all child scopes. A policy assigned to a management group applies to every subscription and resource group beneath it.

### Exemptions

A **policy exemption** temporarily or permanently excludes a specific resource or scope from a policy assignment. Exemptions are useful for:

- **Waiver** — The resource intentionally does not comply, and the organization has accepted the risk.
- **Mitigated** — The intent of the policy is satisfied through another mechanism.

Exemptions have an optional expiration date, and they are tracked as Azure resources so they appear in compliance reports.

### Policy vs. RBAC

A common source of confusion:

| Aspect | Azure Policy | Azure RBAC |
|--------|-------------|------------|
| **Purpose** | What properties resources can have | What actions users can perform |
| **Default** | Allow (unless explicitly denied) | Deny (unless explicitly allowed) |
| **Scope** | Resource properties and configurations | User/group/service principal permissions |
| **Evaluation** | At resource creation and on a schedule | At every API call |
| **Example** | "All VMs must use managed disks" | "User X can create VMs" |

Both are needed — RBAC controls **who** can act, and Policy controls **what** can be created or how resources must be configured.

---

## 9.2 Policy Effects & Evaluation Order

### Effects

Azure Policy supports the following effects:

| Effect | Description |
|--------|-------------|
| **Disabled** | The policy rule is not evaluated. Useful for testing or temporarily turning off a policy. |
| **Append** | Adds fields to the resource request. Commonly used to add tags or IP rules. |
| **Deny** | Blocks the resource request before it reaches the resource provider. |
| **Audit** | Creates a warning event in the activity log but does not block the request. |
| **AuditIfNotExists** | Audits when a related resource does not exist (e.g., diagnostic settings are missing). |
| **DeployIfNotExists** | Deploys a related resource when one does not exist (e.g., automatically deploy a diagnostic setting). Requires a managed identity. |
| **Modify** | Adds, updates, or removes properties or tags on a resource during creation or update. Requires a managed identity. |
| **Manual** | The compliance state is managed by the user, not evaluated automatically. Used for policies where automated evaluation is not possible. |
| **Mutate** | Corrects resource configurations using mutation during the ARM request pipeline, allowing Policy to fix non-compliant requests before deployment rather than denying them. |
| **DenyAction** | Blocks specific actions on resources (e.g., prevent deletion). |

### Evaluation Order

Requests to create or update a resource through Azure Resource Manager are evaluated by Policy before reaching the resource provider. Policy creates a list of all assignments that apply to the resource and evaluates the resource against each definition. Processing effects before handing the request to the resource provider prevents unnecessary processing for resources that do not meet governance controls.

The evaluation order is:

1. **Disabled** — checked first to determine whether the policy rule should be evaluated at all.

2. **Append / Modify / Mutate** — evaluated next because they can change the request. A change made by Append may prevent an Audit or Deny effect from triggering. Modify and Mutate similarly alter the resource payload before further evaluation.

3. **Deny / DenyAction** — evaluated next. By evaluating Deny before Audit, double-logging of an unwanted resource request is avoided. DenyAction blocks specific operations (like delete) on existing resources.

4. **Audit** — evaluated before the request goes to the resource provider. Audit creates a warning event in the activity log when evaluating a non-compliant resource but does not block the request.

5. **AuditIfNotExists / DeployIfNotExists** — evaluated after the resource provider returns a success code, to determine whether additional compliance logging or remediation action is required.

   - **AuditIfNotExists** enables auditing on resources that match the `if` condition but do not have the components specified in the `details` of the `then` condition.
   - **DeployIfNotExists** triggers a template deployment when the condition is met.

6. **Manual** — compliance is determined by the user or an external process, not by the policy engine.

### Understanding Policy Modes

- **All** — Evaluates all resource types. Used for policies that check resource group properties or subscription-level settings.
- **Indexed** — Evaluates only resource types that support tags and locations. This is the most common mode.
- **Microsoft.Kubernetes.Data** — Used for Kubernetes admission control policies.
- **Microsoft.Network.Data** — Used for custom network data-plane policies.

---

## 9.3 Azure Machine Configuration

### What It Is

**Azure Machine Configuration** extends Azure Policy into the operating system running inside virtual machines and Arc-enabled servers. While standard Azure Policy governs the properties of Azure resources on the management plane, Azure Machine Configuration can audit and enforce settings **inside** VMs — such as installed software, OS configurations, registry keys, file contents, and service states.

### How It Works

Azure Machine Configuration uses the following architecture:

1. **Machine Configuration extension** — A VM extension installed on the target machine that runs the configuration agent.
2. **Configuration packages** — Authored as PowerShell DSC (Desired State Configuration) documents. Each package contains the rules to evaluate.
3. **Azure Policy integration** — Machine Configuration packages are assigned to VMs through Azure Policy, using `AuditIfNotExists` or `DeployIfNotExists` effects. Compliance results flow back to the Azure Policy compliance dashboard.

The evaluation flow:

![Machine Configuration Flow](/images/machine-config-flow.svg)

### Built-in Machine Configuration Policies

Azure provides many built-in Machine Configuration policies, including:

- Audit Windows machines that do not have the specified Windows features installed.
- Audit Linux machines that have accounts without passwords.
- Audit Windows machines that do not restrict the minimum password length.
- Audit Windows machines that do not store passwords using reversible encryption.
- Audit Windows machines on which the Log Analytics agent is not connected. *(Note: The Log Analytics agent was retired in August 2024. This policy is maintained for legacy environments. For new deployments, use Azure Monitor Agent-based policies.)*

### Custom Configurations

You can author custom Machine Configuration packages for organization-specific requirements:

1. **Author** a DSC configuration in PowerShell.
2. **Compile** and **package** it using the `GuestConfiguration` PowerShell module.
3. **Publish** the package to an Azure Storage blob (or other accessible URI).
4. **Create a policy definition** that references the package.
5. **Assign** the policy to the target scope.

```powershell
# Example: Create a custom Machine Configuration package
Install-Module -Name GuestConfiguration -Force

# Compile the DSC configuration
. ./MyConfig.ps1
MyConfig -OutputPath ./compiled

# Create the package
New-GuestConfigurationPackage `
  -Name 'AuditSecureBaseline' `
  -Configuration './compiled/localhost.mof' `
  -Type AuditAndSet `
  -Force
```

### Key Considerations

- Machine Configuration requires the **Azure Machine Configuration extension** to be installed on target VMs.
- For Arc-enabled servers, the extension is automatically managed.
- Machine Configuration supports both **Audit** (report-only) and **AuditAndSet** (enforce) modes.
- Custom packages must be stored in a location accessible to the VM (Azure Blob Storage with SAS token or managed identity access).

---

## 9.4 Policy as Code (EPAC & CI/CD)

### What Policy as Code Means

**Policy as Code** is the practice of managing Azure Policy definitions, initiatives, assignments, and exemptions as version-controlled source code — just as you would manage application code or infrastructure as code. This approach provides:

- **Version history** — Track who changed what and when.
- **Peer review** — Policy changes go through pull requests.
- **Automated testing** — Validate policies before deploying to production.
- **Repeatability** — Apply the same policies consistently across environments.
- **Rollback** — Revert to a previous policy state if issues are discovered.

### Enterprise Policy as Code (EPAC)

The **Enterprise Policy as Code (EPAC)** framework is a Microsoft-supported open-source project that provides a structured approach to managing Azure Policy at enterprise scale. EPAC uses a declarative, JSON/CSV-based format to define the desired state of all policies across your Azure environment.

Key features of EPAC:

- **Desired-state model** — You declare what policies, initiatives, assignments, and exemptions should exist, and EPAC calculates the delta.
- **Multi-environment support** — Manage dev, test, and production policy estates from a single repository.
- **Plan and deploy stages** — Separate planning (what-if) from deployment for safe rollouts.
- **Exemption management** — Track and manage exemptions alongside policy definitions.
- **Role assignment management** — Automatically create the managed identity role assignments required by DeployIfNotExists and Modify policies.

An EPAC policy definition structure looks like:

![EPAC Folder Structure](/images/epac-folder-structure.svg)

> **Reference:** [Enterprise Policy as Code (EPAC)](https://aka.ms/epac)

### CI/CD Pipeline for Policy Lifecycle

A robust Policy as Code pipeline follows this workflow:

![Policy Lifecycle](/images/policy-lifecycle.svg)

#### Stage 1: Author

Policy authors create or modify policy definitions, initiatives, and assignments in the Git repository.

#### Stage 2: Validate

Automated validation checks:

```yaml
# Example: Azure DevOps pipeline step for EPAC validation
- task: PowerShell@2
  displayName: 'Build EPAC Deployment Plan'
  inputs:
    targetType: inline
    script: |
      Build-DeploymentPlans `
        -DefinitionsRootFolder "$(Build.SourcesDirectory)/Definitions" `
        -OutputFolder "$(Build.ArtifactStagingDirectory)/plans"
```

#### Stage 3: Plan

Generate a deployment plan showing what will change:

- New policy definitions to create.
- Assignments to update.
- Resources that will become non-compliant.

#### Stage 4: Review

The plan is attached to the pull request for peer review. Reviewers verify:

- The policy logic is correct.
- The scope is appropriate (not too broad, not too narrow).
- Exemptions have documented justifications.

#### Stage 5: Deploy

After approval, the pipeline deploys the policies:

```powershell
# EPAC deployment
Deploy-PolicyPlan `
  -InputFolder "./plans" `
  -DefaultContext $context
```

#### Stage 6: Monitor

Post-deployment monitoring:

- Check the compliance dashboard for unexpected non-compliance.
- Review Azure Activity Log for policy evaluation events.
- Set up alerts for compliance state changes.

### Policy Testing Strategies

**Audit-first, then Deny:**

The safest approach to policy rollout is:

1. Deploy with `Audit` effect or `DoNotEnforce` enforcement mode.
2. Wait for a compliance evaluation cycle (typically 24 hours for a full scan).
3. Review which resources would be affected.
4. Communicate with affected teams.
5. Switch to `Deny` effect after teams have remediated or acknowledged.

```json
{
  "properties": {
    "displayName": "Require HTTPS on Storage - Audit First",
    "policyRule": {
      "if": {
        "allOf": [
          { "field": "type", "equals": "Microsoft.Storage/storageAccounts" },
          { "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly", "notEquals": true }
        ]
      },
      "then": {
        "effect": "[parameters('effect')]"
      }
    },
    "parameters": {
      "effect": {
        "type": "String",
        "defaultValue": "Audit",
        "allowedValues": ["Audit", "Deny", "Disabled"]
      }
    }
  }
}
```

### Policy Exemption Management in Code

Exemptions should be tracked in source control alongside policies:

```json
{
  "exemptions": [
    {
      "name": "ProjectX-Legacy-StorageExemption",
      "displayName": "Project X Legacy Storage Exemption",
      "description": "Legacy storage accounts used by Project X cannot enable HTTPS due to client library limitations. Migration planned for Q3 2026.",
      "policyAssignmentId": "/providers/Microsoft.Management/managementGroups/myorg/providers/Microsoft.Authorization/policyAssignments/require-https-storage",
      "exemptionCategory": "Waiver",
      "expiresOn": "2026-09-30T00:00:00Z",
      "metadata": {
        "approvedBy": "security-team@contoso.com",
        "ticketRef": "SEC-2026-0142"
      }
    }
  ]
}
```

### Git-Based Policy Management Workflow

![Git-Based Policy Management](/images/policy-git-branching.svg)

Each pull request triggers:
1. Schema validation of policy JSON.
2. EPAC plan generation (what-if).
3. Plan posted as PR comment for review.
4. On merge, deployment pipeline runs automatically.

---

## 9.5 Policy Remediation at Scale

### Remediation Tasks

When policies use `DeployIfNotExists` or `Modify` effects, existing non-compliant resources are not automatically fixed. You must create **remediation tasks** to bring existing resources into compliance.

A remediation task:
1. Identifies all non-compliant resources for a given policy assignment.
2. Deploys the remediation template (for DeployIfNotExists) or applies modifications (for Modify) to each resource.
3. Reports progress and results.

```bash
# Create a remediation task via Azure CLI
az policy remediation create \
  --name "remediate-diagnostics-settings" \
  --policy-assignment "/subscriptions/{sub-id}/providers/Microsoft.Authorization/policyAssignments/deploy-diag-settings" \
  --resource-group "my-resource-group"
```

### DeployIfNotExists Remediation

The `DeployIfNotExists` effect is one of the most powerful tools for governance at scale. It allows Policy to automatically deploy companion resources — such as diagnostic settings, private endpoints, or Microsoft Defender for Cloud configurations.

Example: Automatically deploy diagnostic settings for Key Vaults:

```json
{
  "properties": {
    "displayName": "Deploy diagnostic settings for Key Vault",
    "policyRule": {
      "if": {
        "field": "type",
        "equals": "Microsoft.KeyVault/vaults"
      },
      "then": {
        "effect": "DeployIfNotExists",
        "details": {
          "type": "Microsoft.Insights/diagnosticSettings",
          "existenceCondition": {
            "field": "Microsoft.Insights/diagnosticSettings/workspaceId",
            "equals": "[parameters('logAnalyticsWorkspaceId')]"
          },
          "roleDefinitionIds": [
            "/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
          ],
          "deployment": {
            "properties": {
              "mode": "incremental",
              "template": {
                "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "parameters": {
                  "vaultName": { "type": "string" },
                  "logAnalyticsWorkspaceId": { "type": "string" }
                },
                "resources": [
                  {
                    "type": "Microsoft.KeyVault/vaults/providers/diagnosticSettings",
                    "apiVersion": "2021-05-01-preview",
                    "name": "[concat(parameters('vaultName'), '/Microsoft.Insights/setByPolicy')]",
                    "properties": {
                      "workspaceId": "[parameters('logAnalyticsWorkspaceId')]",
                      "logs": [
                        {
                          "categoryGroup": "allLogs",
                          "enabled": true
                        }
                      ],
                      "metrics": [
                        {
                          "category": "AllMetrics",
                          "enabled": true
                        }
                      ]
                    }
                  }
                ]
              },
              "parameters": {
                "vaultName": { "value": "[field('name')]" },
                "logAnalyticsWorkspaceId": { "value": "[parameters('logAnalyticsWorkspaceId')]" }
              }
            }
          }
        }
      }
    },
    "parameters": {
      "logAnalyticsWorkspaceId": {
        "type": "String",
        "metadata": {
          "displayName": "Log Analytics Workspace ID",
          "description": "The resource ID of the Log Analytics workspace."
        }
      }
    }
  }
}
```

### Large-Scale Compliance Remediation Strategies

When remediating thousands of resources:

1. **Prioritize by risk** — Remediate the most critical non-compliant resources first (e.g., public-facing storage accounts before internal dev resources).

2. **Batch remediation tasks** — Azure Policy processes up to 500 resources per remediation task. For larger estates, create multiple tasks or use EPAC to manage remediation systematically.

3. **Monitor remediation progress** — Use Azure Resource Graph to query remediation status:

```kusto
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| summarize count() by tostring(properties.policyDefinitionName)
| order by count_ desc
```

4. **Parallel remediation** — Run remediation tasks for different policy assignments in parallel. Avoid running multiple remediations on the same resources simultaneously.

5. **Handle failures gracefully** — Some remediations will fail due to resource locks, insufficient permissions, or resource-specific constraints. Review failed remediation operations and address blockers individually.

### Safe Deployment Practices for Policy Rollout

Rolling out policy changes at scale requires care:

1. **Use DoNotEnforce mode** — Test new assignments with enforcement disabled to see compliance impact without blocking deployments.

2. **Ring-based deployment** — Apply policies progressively:
   - Ring 0: Sandbox/Dev subscriptions.
   - Ring 1: Test/Staging subscriptions.
   - Ring 2: Production subscriptions (non-critical).
   - Ring 3: Production subscriptions (critical).

3. **Monitor compliance delta** — After each ring deployment, wait for a compliance scan and review the change in compliance percentage.

4. **Have a rollback plan** — Keep the previous policy state in source control so you can quickly revert if a policy causes issues.

5. **Communicate broadly** — Notify development and operations teams before enforcing new Deny policies, and provide remediation guidance.

---

## 9.6 Governance Starter Policies

Below is a curated set of 36 built-in Azure Policy definitions organized by category. These serve as a strong starting point for any organization establishing Azure governance.

> **Tip:** If you enable the Microsoft Defender for Cloud built-in initiative, check for overlapping policies. See the [Azure Policy built-in definitions for Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/policy-reference) for the full list.

---

### ☑️ Compute

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 1 | **Allowed virtual machine size SKUs** — Restricts which VM sizes can be deployed, controlling cost and standardizing environments. | Deny | `cccc23c7-8427-4f53-ad12-b6a63eb452b3` |
| 2 | **Virtual machines should use managed disks** — Audits VMs that do not use managed disks for improved reliability and security. | Audit | `06a78e20-9358-41c9-923c-fb736d382a4d` |
| 3 | **Require automatic OS image patching on Virtual Machine Scale Sets** — Ensures VMSS instances receive automatic OS patches. | Deny | `465f0161-0087-490a-9ad9-ad6217f4f43a` |
| 4 | **Azure Machine Configuration extension should be installed on machines** — Ensures the Machine Configuration extension is installed for in-guest policy evaluation. Maps to CIS and NIST baselines. | AuditIfNotExists | `ae89ebca-1c92-4898-ac2c-9f63decb045c` |

### ☑️ General

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 5 | **Allowed locations** — Restricts the locations where resources can be deployed. Enforces geo-compliance requirements. | Deny | `e56962a6-4747-49cd-b67b-bf8b01975c4c` |
| 6 | **Allowed locations for resource groups** — Restricts where resource groups can be created. | Deny | `e765b5de-1225-4ba3-bd56-1ac6695af988` |
| 7 | **Allowed resource types** — Specifies which resource types can be deployed. Only affects types supporting tags and locations. | Deny | `a08ec900-254a-4555-9bf5-e42af04b5c5c` |
| 8 | **Not allowed resource types** — Blocks specific resource types from being deployed. Reduces complexity and attack surface. | Deny | `6c112d4e-5bc7-47ae-a041-ea2d9dccd749` |
| 9 | **Audit resource location matches resource group location** — Audits that the resource location matches its parent resource group location. | Audit | `0a914e76-4921-4c19-b460-a2d36003525a` |

### ☑️ Security

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 10 | **A maximum of 3 owners should be designated for your subscription** — Limits subscription owners to reduce breach blast radius. Maps to NIST AC-6. | AuditIfNotExists | `4f11b553-d42e-4e3a-89be-32ca364cad4c` |
| 11 | **MFA should be enabled on accounts with owner permissions on your subscription** — Ensures MFA is enabled for owner accounts to prevent credential-based attacks. Maps to NIST IA-2, PCI-DSS 8.3. | AuditIfNotExists | `aa633080-8b72-40c4-a2d7-d00c03e80bed` |
| 12 | **Subscriptions should have a contact email address for security issues** — Ensures security contacts receive notifications from Microsoft Defender for Cloud. | AuditIfNotExists | `4f4f78b8-e367-4b10-a341-d9a4ad5cf1c7` |
| 13 | **There should be more than one owner assigned to your subscription** — Ensures administrator access redundancy for subscription management. | AuditIfNotExists | `09024ccc-0c5f-475e-9457-b7c0d9ed487b` |
| 14 | **Audit usage of custom RBAC rules** — Audits custom RBAC roles instead of built-in roles. Custom roles are error-prone and require rigorous threat modeling. | Audit | `a451c1ef-c6ca-483d-87ed-f49761e3ffb5` |
| 15 | **Custom subscription owner roles should not exist** — Ensures no custom roles replicate the Owner role at subscription scope. | Audit | `10ee2ea2-fb4d-45b8-a7e9-a2e770044cd9` |
| 16 | **Microsoft Defender for Cloud should be enabled on your subscription** — Ensures Defender for Cloud is enabled for continuous security assessment. | AuditIfNotExists | `ac076320-ddcf-4066-b451-6154267e8ad2` |
| 17 | **Azure DDoS Protection should be enabled** — Ensures DDoS Protection is enabled on virtual networks with public-facing resources. Maps to NIST SC-5. | AuditIfNotExists | `a7aca53f-2ed4-4466-a25e-0b45ade68efd` |

### ☑️ Tags

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 18 | **Require a tag on resource groups** — Enforces that resource groups must have a specified tag. | Deny | `96670d01-0a4d-4649-9c89-2d3abc0a5025` |
| 19 | **Inherit a tag from the resource group if missing** — Adds a specified tag with its value from the parent resource group when a resource is created or updated without it. | Modify | `ea3f2387-9b95-492a-a190-fcdc54f7b070` |
| 20 | **Require a tag and its value on resources** — Enforces that resources must have a specific tag with a specific value. | Deny | `1e30110a-5ceb-460c-a204-c1c3969c6d62` |
| 21 | **Add a tag to resource groups** — Adds the specified tag and value when any resource group is created or updated missing this tag. Existing resource groups can be remediated. | Modify | `49c88fc8-6fd1-46fd-a676-f12d1d3a4c71` |
| 22 | **Require a tag on resources** — Enforces existence of a tag on all resources. | Deny | `871b6d14-10aa-478d-b590-94f262ecfa99` |

### ☑️ Networking

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 23 | **Network interfaces should not have public IPs** — Prevents network interfaces from being configured with public IP addresses. Reduces attack surface. | Deny | `83a86a26-fd1f-447c-b59d-e51f44264114` |
| 24 | **Subnets should be associated with a Network Security Group** — Audits subnets that are not associated with an NSG to protect traffic with network-level access controls. Maps to CIS, NIST SC-7. | AuditIfNotExists | `e71308d3-144b-4262-b144-efdc3cc90517` |
| 25 | **Web Application Firewall (WAF) should be enabled for Application Gateway** — Ensures WAF is deployed in front of public-facing web applications. Maps to PCI-DSS 6.6. | Audit | `564feb30-bf6a-4854-b4bb-0d2d2d1e6c66` |
| 26 | **Network Watcher should be enabled** — Audits that Network Watcher is enabled in regions where virtual networks exist. | AuditIfNotExists | `b6e2945c-0b7b-40f5-9233-7a5323b5cdc6` |

### ☑️ Storage

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 27 | **Storage accounts should restrict network access** — Audits storage accounts that allow access from all networks. Use virtual network rules or IP-based firewall rules. Maps to CIS, NIST SC-7. | Audit | `34c877ad-507e-4c82-993e-3452a6e0ad3c` |
| 28 | **Secure transfer to storage accounts should be enabled** — Ensures storage accounts only accept requests over HTTPS. Maps to CIS, NIST SC-8. | Audit/Deny | `404c3081-a854-4457-ae30-26a93ef643f9` |
| 29 | **Storage accounts should use customer-managed key for encryption** — Audits storage accounts that do not use CMK for data-at-rest encryption. Maps to NIST SC-28. | Audit | `6fac406b-40ca-413b-bf8e-0bf964659c25` |
| 30 | **Storage accounts should prevent shared key access** — Requires Microsoft Entra ID authorization instead of shared key for storage account access. | Audit | `8c6a50c6-9ffd-4ae7-986f-5fa6111f9a54` |

### ☑️ Identity

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 31 | **External accounts with owner permissions should be removed from your subscription** — Removes external accounts with owner role to prevent unmonitored access. Maps to NIST AC-6. | AuditIfNotExists | `f8456c1c-aa66-4dfb-861a-25d127b775c9` |
| 32 | **Managed identity should be used in function apps** — Ensures function apps use managed identity for authentication instead of connection strings. | AuditIfNotExists | `0da106f2-4ca3-48e8-bc85-c638fe6aea8f` |
| 33 | **Service Fabric clusters should only use Microsoft Entra ID for client authentication** — Ensures Service Fabric clusters authenticate via Microsoft Entra ID rather than certificates alone. | Audit | `b54ed75b-3e1a-44ac-a333-05ba39b99ff0` |

### ☑️ Monitoring

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 34 | **Activity log should be retained for at least 365 days** — Ensures adequate retention of activity logs for security investigations. Maps to CIS, NIST AU-11. | AuditIfNotExists | `b02aacc0-b073-424e-8298-42b22829ee0a` |
| 35 | **Azure Monitor log profile should collect logs for categories 'write', 'delete', and 'action'** — Ensures the log profile collects administrative operation logs. | AuditIfNotExists | `1a4e592a-6a6e-44a5-9814-e36264ca96e7` |
| 36 | **An activity log alert should exist for specific Administrative operations** — Audits that alerts are configured for critical operations like policy assignments or network security group changes. | AuditIfNotExists | `b954148f-4c11-4c38-8221-be76711e194a` |

### ☑️ Kubernetes

| # | Policy Name | Effect | Built-in Definition ID |
|---|-------------|--------|----------------------|
| 37 | **Azure Kubernetes Service clusters should have Defender profile enabled** — Ensures Defender for Containers is enabled on AKS clusters for runtime threat protection. | Audit, Disabled | `a1840de2-8088-4ea8-b153-b4c723e9cb01` |
| 38 | **Kubernetes cluster should not allow privileged containers** — Prevents containers from running in privileged mode, which grants near-root access to the host. Maps to CIS Kubernetes Benchmark. | Deny/Audit | `95edb821-ddaf-4404-9732-666045e056b4` |
| 39 | **Kubernetes cluster containers should only use allowed images** — Restricts container images to a defined registry and repository pattern. Prevents deployment of untrusted images. | Deny/Audit | `febd0533-8e55-448f-b837-bd0e06f16469` |

---

### Bicep Example: Assigning a Policy Initiative

The following Bicep template assigns the "Allowed locations" policy at a resource group scope:

```bicep
@description('The list of allowed Azure regions.')
param allowedLocations array = [
  'eastus'
  'eastus2'
  'westus2'
  'westeurope'
  'northeurope'
]

@description('The policy definition ID for Allowed Locations.')
var policyDefinitionId = '/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c'

resource policyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'allowed-locations-assignment'
  properties: {
    displayName: 'Restrict resource deployment to approved regions'
    description: 'This policy restricts resource deployment to the specified Azure regions.'
    policyDefinitionId: policyDefinitionId
    enforcementMode: 'Default'
    nonComplianceMessages: [
      {
        message: 'This resource cannot be deployed in the selected region. Allowed regions: ${join(allowedLocations, ', ')}.'
      }
    ]
    parameters: {
      listOfAllowedLocations: {
        value: allowedLocations
      }
    }
  }
}

output assignmentId string = policyAssignment.id
```

### Bicep Example: Custom Policy Definition and Assignment

```bicep
targetScope = 'subscription'

@description('The effect of the policy.')
@allowed([
  'Audit'
  'Deny'
  'Disabled'
])
param effect string = 'Audit'

resource policyDef 'Microsoft.Authorization/policyDefinitions@2024-04-01' = {
  name: 'require-https-storage'
  properties: {
    displayName: 'Storage accounts must use HTTPS'
    description: 'Audits or denies storage accounts that do not enforce HTTPS-only traffic.'
    policyType: 'Custom'
    mode: 'Indexed'
    metadata: {
      category: 'Storage'
      version: '1.0.0'
    }
    parameters: {
      effect: {
        type: 'String'
        metadata: {
          displayName: 'Effect'
          description: 'The effect to apply when the policy rule is matched.'
        }
        allowedValues: [
          'Audit'
          'Deny'
          'Disabled'
        ]
        defaultValue: 'Audit'
      }
    }
    policyRule: {
      if: {
        allOf: [
          {
            field: 'type'
            equals: 'Microsoft.Storage/storageAccounts'
          }
          {
            field: 'Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly'
            notEquals: true
          }
        ]
      }
      then: {
        effect: '[parameters(\'effect\')]'
      }
    }
  }
}

resource policyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'require-https-storage-assignment'
  properties: {
    displayName: 'Require HTTPS on all storage accounts'
    policyDefinitionId: policyDef.id
    enforcementMode: 'Default'
    parameters: {
      effect: {
        value: effect
      }
    }
  }
}
```

---

## Best Practices

1. **Start with built-in policies** — Azure provides hundreds of built-in policies. Use them before writing custom definitions.

2. **Use initiatives, not individual assignments** — Group related policies into initiatives for easier management and compliance reporting.

3. **Parameterize effects** — Make the effect a parameter so you can switch between Audit and Deny without rewriting the policy.

4. **Assign at the management group level** — Apply policies at the highest appropriate scope to ensure consistent coverage.

5. **Use exemptions sparingly** — Every exemption should have a documented justification, an owner, and an expiration date.

6. **Adopt Policy as Code** — Manage all policies through source control with CI/CD pipelines for repeatable, auditable governance.

7. **Test in Audit mode first** — Never deploy a Deny policy directly to production. Always start with Audit to understand impact.

8. **Monitor compliance continuously** — Use the Azure Policy compliance dashboard and Azure Resource Graph to track compliance trends over time.

9. **Limit custom policies** — Custom policies require ongoing maintenance. Check if a built-in policy or a combination of built-in policies can meet your needs.

10. **Document non-compliance messages** — Use the `nonComplianceMessages` property in policy assignments to give developers clear, actionable feedback when their deployments are denied.

---

## Common Pitfalls

1. **Deploying Deny policies without testing** — Deploying a Deny policy without first running it in Audit mode can break CI/CD pipelines and block legitimate deployments across the organization.

2. **Overly broad scope** — Assigning a restrictive policy at the tenant root management group without exemptions for shared services or platform subscriptions.

3. **Forgetting managed identity for remediation** — `DeployIfNotExists` and `Modify` policies require a managed identity with appropriate RBAC roles. Without it, remediation tasks silently fail.

4. **Ignoring policy evaluation delays** — Policy compliance is not real-time. A full evaluation cycle can take up to 24 hours. New resources are evaluated on creation, but existing resources are evaluated on a schedule.

5. **Not tracking exemptions** — Exemptions without expiration dates or documentation become permanent gaps in your compliance posture.

6. **Conflicting policies** — Two policies with conflicting effects (e.g., one requires a tag and another appends a different value for the same tag) can cause unpredictable behavior.

7. **Azure Machine Configuration without the extension** — Assigning Machine Configuration policies to VMs that do not have the Machine Configuration extension installed results in "Not started" compliance state rather than actual evaluation.

8. **Exceeding policy limits** — Azure has limits on the number of policy definitions and assignments per scope. At enterprise scale, be mindful of these limits and use initiatives to stay within bounds.

---

## Code Samples

### Azure CLI: Create and Assign a Policy

```bash
# Create a custom policy definition
az policy definition create \
  --name "require-tag-environment" \
  --display-name "Require Environment tag on resources" \
  --description "Denies creation of resources without an Environment tag." \
  --rules '{
    "if": {
      "field": "[concat('"'"'tags['"'"', '"'"'Environment'"'"', '"'"']'"'"')]",
      "exists": "false"
    },
    "then": {
      "effect": "deny"
    }
  }' \
  --mode "Indexed"

# Assign the policy to a resource group
az policy assignment create \
  --name "require-tag-environment-rg" \
  --display-name "Require Environment tag" \
  --policy "require-tag-environment" \
  --scope "/subscriptions/{sub-id}/resourceGroups/my-rg" \
  --enforcement-mode "Default"
```

### Azure CLI: Trigger a Remediation Task

```bash
az policy remediation create \
  --name "remediate-missing-diagnostics" \
  --policy-assignment "deploy-diagnostics-keyvault" \
  --scope "/subscriptions/{sub-id}" \
  --resource-discovery-mode "ReEvaluateCompliance"
```

### Azure Resource Graph: Query Non-Compliant Resources

```kusto
PolicyResources
| where type == "microsoft.policyinsights/policystates"
| where properties.complianceState == "NonCompliant"
| project
    resourceId = properties.resourceId,
    policyName = properties.policyDefinitionName,
    policyAction = properties.policyDefinitionAction,
    resourceType = properties.resourceType
| summarize NonCompliantCount = count() by tostring(policyName)
| order by NonCompliantCount desc
| take 20
```

---

## References

- [Azure Policy overview](https://learn.microsoft.com/en-us/azure/governance/policy/overview)
- [Azure Policy definition structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure)
- [Azure Policy effects](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects)
- [Azure Policy initiative structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/initiative-definition-structure)
- [Azure Policy exemption structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/exemption-structure)
- [Azure Policy remediation](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources)
- [Azure Machine Configuration overview](https://learn.microsoft.com/en-us/azure/governance/machine-configuration/overview)
- [Enterprise Policy as Code (EPAC)](https://aka.ms/epac)
- [Azure Policy built-in definitions](https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-policies)
- [Azure Policy limits](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-policy-limits)
- [Microsoft Defender for Cloud policy reference](https://learn.microsoft.com/en-us/azure/defender-for-cloud/policy-reference)

---

Previous | Next
:--- | :---
[Chapter 6 — RBAC](/guide/part-2-identity-access/ch06-rbac.md) | [Chapter 10 — Regulatory Compliance](/guide/part-3-policy-compliance/ch10-regulatory-compliance.md)
