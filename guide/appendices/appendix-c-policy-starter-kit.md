# Appendix C — Policy Starter Kit

> Last verified: 2026-04-06

---

A curated list of 30 recommended Azure Policy definitions to establish a governance baseline. All policies listed are built-in unless noted otherwise. Assign these at the appropriate management group level using Audit mode first, then switch to Deny or DeployIfNotExists as your organization matures.

> **Tip:** Policy IDs are stable across all Azure tenants. Use them to reference policies programmatically in Bicep, Terraform, or EPAC configurations.

---

## General

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 1 | Allowed locations | `e56962a6-4747-49cd-b67b-bf8b01975c4c` | Deny | Restricts the Azure regions where resources can be deployed |
| 2 | Allowed locations for resource groups | `e765b5de-1225-4ba3-bd56-1ac6695af988` | Deny | Restricts the Azure regions where resource groups can be created |
| 3 | Not allowed resource types | `6c112d4e-5bc7-47ae-a041-ea2d9dccd749` | Deny | Blocks deployment of specific resource types (e.g., classic resources) |
| 4 | Allowed resource types | `a08ec900-254a-4555-9bf5-e42af04b5c5c` | Deny | Allows only approved resource types to be deployed |

---

## Tags

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 5 | Require a tag on resource groups | `96670d01-0a4d-4649-9c89-2d3abc0a5025` | Deny | Resource groups must have a specified tag |
| 6 | Require a tag on resources | `871b6d14-10aa-478d-b590-94f262ecfa99` | Deny | Resources must have a specified tag |
| 7 | Inherit a tag from the resource group | `cd3aa116-8754-49c9-a813-ad46512ece54` | Modify | Resources inherit a specified tag from their resource group |
| 8 | Inherit a tag from the subscription | `b27a0cbd-a167-4571-a2ac-1f2bef19b462` | Modify | Resources inherit a specified tag from their subscription |

---

## Compute

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 9 | Audit VMs that do not use managed disks | `06a78e20-9358-41c9-923c-fb736d382a4d` | Audit | Identifies VMs still using unmanaged (classic) disks |
| 10 | Allowed virtual machine size SKUs | `cccc23c7-8427-4f53-ad12-b6a63eb452b3` | Deny | Restricts VM sizes to control costs and prevent oversized deployments |
| 11 | Azure Backup should be enabled for Virtual Machines | `013e242c-8828-4970-87b3-ab247555486d` | Audit | Ensures VMs have Azure Backup configured |
| 12 | Virtual machines should have the Guest Configuration extension | `ae89ebca-1c92-4898-ac2c-9f63decb045c` | Audit | Required for Azure Machine Configuration policies to function |

---

## Networking

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 13 | Network interfaces should not have public IPs | `83a86a26-fd1f-447c-b59d-e51f44264114` | Deny | Prevents NICs from having directly attached public IP addresses |
| 14 | Subnets should have a Network Security Group | `e71308d3-144b-4262-b144-efdc3cc90517` | Audit | Ensures all subnets have NSGs for traffic filtering |
| 15 | Network Watcher should be enabled | `b6e2945c-0b7b-40f5-9233-7a5323b5cdc6` | Audit | Ensures Network Watcher is deployed in each region |
| 16 | Web Application Firewall should be enabled for Application Gateway | `564feb30-bf6a-4854-b4bb-0d2d2d1e6c66` | Audit | Ensures WAF is enabled on Application Gateways |

---

## Storage

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 17 | Secure transfer to storage accounts should be enabled | `404c3081-a854-4457-ae30-26a93ef643f9` | Audit / Deny | Requires HTTPS for all storage account traffic |
| 18 | Storage accounts should restrict network access | `34c877ad-507e-4c82-993e-3452a6e0ad3c` | Audit | Ensures storage accounts do not allow unrestricted public network access |
| 19 | Storage accounts should use customer-managed key for encryption | `6fac406b-40ca-413b-bf8e-0bf964659c25` | Audit | Audits storage accounts not using customer-managed encryption keys |
| 20 | Storage account public access should be disallowed | `4fa4b6c0-31ca-4c0d-b10d-24b96f62a751` | Deny | Prevents public blob access on storage accounts |

---

## Security

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 21 | Microsoft Defender for Cloud should be enabled | `ac076320-ddcf-4066-b451-6154267e8ad2` | Audit | Ensures Defender for Cloud is enabled on subscriptions |
| 22 | Azure Key Vault should use RBAC authorization | `12451c01-ab15-41e8-9d64-9a636b34f218` | Audit | Ensures Key Vaults use RBAC instead of access policies |
| 23 | Key vaults should have soft delete enabled | `1e66c121-a66a-4b1f-9b83-0fd5c6a02e3f` | Audit / Deny | Prevents permanent deletion of Key Vault secrets and keys |
| 24 | SQL databases should have Transparent Data Encryption enabled | `86a912f6-9a06-4e26-b447-11b16ba8659f` | Audit | Ensures SQL databases encrypt data at rest with TDE |

---

## Identity

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 25 | MFA should be enabled on accounts with owner permissions | `e3e008c3-56b9-4133-8fd7-d3347377893a` | Audit | Identifies subscription owners without MFA enabled |
| 26 | There should be more than one owner assigned to a subscription | `09024ccc-0c5f-474e-9509-f8a3847b8e28` | Audit | Ensures redundancy for subscription ownership |
| 27 | External accounts with owner permissions should be removed | `f8456c1c-aa66-4dfb-861a-25d127b775c9` | Audit | Identifies external (guest) accounts with owner access |
| 28 | Managed identity should be used in function apps | `0da106f2-4ca3-48e8-bc85-c638fe6aea8f` | Audit | Ensures Azure Functions use managed identity instead of connection strings |

---

## Monitoring

| # | Policy Name | Policy ID | Effect | Description |
|---|---|---|---|---|
| 29 | Azure Monitor Agent should be installed on virtual machines | `845857af-0333-4c5d-bbbc-6076697da122` | Audit | Ensures the Azure Monitor Agent is deployed for log collection |
| 30 | Activity log should be retained for at least 365 days | `b02aacc0-b073-424e-8298-42b22829ee0a` | Audit | Ensures activity logs are retained for compliance purposes |

---

## How to Assign These Policies

### Using Azure CLI

```bash
# Assign a single policy at a management group scope
az policy assignment create \
  --name "require-environment-tag" \
  --display-name "Require Environment tag on resource groups" \
  --policy "96670d01-0a4d-4649-9c89-2d3abc0a5025" \
  --scope "/providers/Microsoft.Management/managementGroups/YOUR_MG_NAME" \
  --params '{"tagName": {"value": "Environment"}}' \
  --enforcement-mode "DoNotEnforce"  # Audit mode — use "Default" for enforcement
```

### Using Bicep

```bicep
targetScope = 'managementGroup'

resource policyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'require-environment-tag'
  properties: {
    displayName: 'Require Environment tag on resource groups'
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/96670d01-0a4d-4649-9c89-2d3abc0a5025'
    parameters: {
      tagName: {
        value: 'Environment'
      }
    }
    enforcementMode: 'DoNotEnforce' // Audit mode
  }
}
```

### Using Enterprise Policy as Code (EPAC)

For managing all 30+ policies at scale, see the [EPAC documentation](https://github.com/Azure/enterprise-azure-policy-as-code) and the Policy as Code chapter (Chapter 9, Section 9.4).

---

## Recommended Assignment Strategy

| Phase | Policies | Effect | Scope |
|---|---|---|---|
| **Phase 1 (Month 1)** | #1, #5, #6, #17, #21 | Audit | Top-level management group |
| **Phase 2 (Month 2)** | #7, #9, #13, #25, #29 | Audit / Modify | Top-level management group |
| **Phase 3 (Month 3)** | Switch Phase 1 to Deny/DINE | Deny / DINE | Top-level management group |
| **Phase 4 (Month 4+)** | #3, #10, #14, #18, #20 | Deny | Specific management groups |
| **Ongoing** | All remaining policies | Audit → Deny | As needed |

---

| Previous | Next |
|:---|:---|
| [Appendix B — Decision Trees](appendix-b-decision-trees.md) | [Appendix D — Resource Graph Queries](appendix-d-resource-graph-queries.md) |
