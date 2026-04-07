# Chapter 8 — Managed Identities & Workload Identity

> Last verified: 2026-04-06

---

## Overview

Credentials are a liability. Every secret stored in code, configuration, or a key vault is a secret that can leak. **Managed identities** eliminate this risk for Azure workloads by providing an automatically managed identity in Microsoft Entra ID — no passwords, no certificates, no rotation headaches.

**Workload Identity Federation** extends this model beyond Azure, letting external workloads (GitHub Actions, Kubernetes clusters, other cloud providers) authenticate to Microsoft Entra ID without storing secrets, using federated credentials based on industry-standard OIDC tokens.

Together, these capabilities form the foundation of a **secretless** authentication strategy — and that's a governance win.

---

## How It Works

### Managed Identities — The Basics

A managed identity is a service principal in Microsoft Entra ID whose lifecycle is tied to an Azure resource. Azure handles credential creation, rotation, and deletion automatically.

![Managed Identity Flow](/images/managed-identity-flow.svg)

There is no password or certificate for you to manage — Azure rotates the underlying credentials automatically.

### System-Assigned vs. User-Assigned

| Dimension | System-Assigned | User-Assigned |
|-----------|----------------|---------------|
| **Lifecycle** | Tied to the Azure resource. Created when enabled, deleted when the resource is deleted. | Independent. You create it as a standalone resource and attach it to one or more Azure resources. |
| **Sharing** | One identity per resource. Cannot be shared. | Can be assigned to multiple resources. |
| **Use case** | Simple, single-resource scenarios. The identity doesn't outlive the resource. | Shared identity across multiple resources (e.g., several VMs accessing the same storage account), or when you need the identity to persist across resource re-creation. |
| **Governance** | Easy to audit — identity maps 1:1 to a resource. | Requires deliberate lifecycle management to avoid orphaned identities. |

### When to Use Each

- **System-assigned** — Use when the identity is exclusively for that one resource and should be automatically cleaned up with it. Example: a single Function App accessing a specific Key Vault.

- **User-assigned** — Use when multiple resources need the same identity, or when you need to pre-create the identity before the resource exists (common in infrastructure-as-code pipelines). Example: a pool of VMs behind a load balancer that all need access to a shared storage account.

> **Governance recommendation:** Default to **user-assigned** for production workloads. The slight additional management overhead is offset by better control over identity lifecycle, cleaner RBAC assignments, and easier migration when resources are recreated.

---

## Workload Identity Federation

### What It Is

Workload Identity Federation lets external identity providers (IdPs) issue tokens that Microsoft Entra ID trusts — without exchanging secrets. You configure a **federated credential** on an app registration or user-assigned managed identity that says, *"I trust tokens from this issuer, for this subject."*

### How It Works

![Workload Identity Federation Flow](/images/workload-identity-flow.svg)

No client secret. No certificate. The trust is based on the token's issuer (`iss`) and subject (`sub`) claims matching the federated credential configuration.

### Common Scenarios

| Scenario | Issuer | Subject Example |
|----------|--------|-----------------|
| **GitHub Actions** | `https://token.actions.githubusercontent.com` | `repo:contoso/app:ref:refs/heads/main` |
| **Kubernetes (AKS, EKS, GKE)** | The cluster's OIDC issuer URL | `system:serviceaccount:my-namespace:my-sa` |
| **Other clouds (AWS, GCP)** | The cloud provider's STS/OIDC endpoint | Provider-specific subject claims |
| **Terraform Cloud/Enterprise** | `https://app.terraform.io` | Organization and workspace identifier |

### Best Practices for Federation

1. **Scope the subject claim narrowly** — for GitHub Actions, restrict to a specific repo *and* branch (e.g., `repo:contoso/app:ref:refs/heads/main`). A wildcard subject claim is as dangerous as a leaked secret.

2. **Prefer managed identities over app registrations** — when using federation with Azure workloads, federate on a user-assigned managed identity rather than an app registration. Managed identities don't have client secrets that could be accidentally created later.

3. **Rotate federated credentials if the external IdP changes** — if you change your Kubernetes cluster's OIDC configuration or move repositories, update the federated credentials.

---

## Code Samples

### Bicep — Create a user-assigned managed identity and assign a role

```bicep
@description('The Azure region for the managed identity.')
param location string = resourceGroup().location

@description('The name of the user-assigned managed identity.')
param identityName string = 'mi-app-backend'

@description('The name of the storage account to grant access to.')
param storageAccountName string

// Built-in role: Storage Blob Data Reader
var storageBlobDataReaderRoleId = '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, managedIdentity.id, storageBlobDataReaderRoleId)
  scope: storageAccount
  properties: {
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      storageBlobDataReaderRoleId
    )
  }
}

output identityClientId string = managedIdentity.properties.clientId
output identityPrincipalId string = managedIdentity.properties.principalId
```

### Bicep — Assign a system-assigned managed identity to a Web App

```bicep
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-contoso-api'
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    // ... other properties
  }
}

output webAppPrincipalId string = webApp.identity.principalId
```

### Using DefaultAzureCredential in Application Code

The `DefaultAzureCredential` class from the Azure Identity SDK provides a seamless authentication experience that works across local development and production. It tries multiple credential sources in order — managed identity, environment variables, Azure CLI, and more — so the same code works everywhere.

**Python:**

```python
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

credential = DefaultAzureCredential()
blob_service = BlobServiceClient(
    account_url="https://stcontosodata.blob.core.windows.net",
    credential=credential
)

# List containers — no connection string, no key, no secret
for container in blob_service.list_containers():
    print(container.name)
```

**C#:**

```csharp
using Azure.Identity;
using Azure.Storage.Blobs;

var credential = new DefaultAzureCredential();
var blobServiceClient = new BlobServiceClient(
    new Uri("https://stcontosodata.blob.core.windows.net"),
    credential);

await foreach (var container in blobServiceClient.GetBlobContainersAsync())
{
    Console.WriteLine(container.Name);
}
```

**JavaScript/TypeScript:**

```typescript
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  "https://stcontosodata.blob.core.windows.net",
  credential
);

for await (const container of blobServiceClient.listContainers()) {
  console.log(container.name);
}
```

> **Tip:** In production, if you're using a user-assigned managed identity, pass the client ID to `DefaultAzureCredential` to avoid ambiguity when multiple identities are assigned to the same resource:
>
> ```python
> credential = DefaultAzureCredential(managed_identity_client_id="<client-id>")
> ```

---

## Governance of Identity Proliferation

Managed identities are easy to create — perhaps too easy. Without governance, you end up with hundreds of identities, many of them orphaned (the resource they were attached to is long gone, but the identity lingers in Entra ID).

### How to Track and Audit Managed Identities

1. **Use Azure Resource Graph** to inventory all managed identities across subscriptions:

    ```kusto
    resources
    | where type == "microsoft.managedidentity/userassignedidentities"
    | project name, resourceGroup, subscriptionId, location, tags
    | order by subscriptionId, resourceGroup
    ```

2. **Detect orphaned user-assigned identities** — when a resource is deleted, its system-assigned identity's service principal may linger briefly (Azure cleans it up, but there can be a delay). For user-assigned identities, orphans are your responsibility. The following query cross-references identity assignments across all resources to find identities that no resource references:

    ```kusto
    resources
    | where type =~ 'microsoft.managedidentity/userassignedidentities'
    | project identityId = tolower(id), name, resourceGroup, subscriptionId
    | join kind=leftanti (
        resources
        | mv-expand bagexpansion=array identity.userAssignedIdentities
        | extend uaiId = tolower(tostring(bag_keys(identity.userAssignedIdentities)[0]))
        | where isnotempty(uaiId)
        | project uaiId
        | distinct uaiId
    ) on $left.identityId == $right.uaiId
    ```

3. **Review RBAC assignments for managed identities** — combine identity inventory with role assignment data to find identities with excessive permissions:

    ```bash
    az role assignment list --all --query "[?principalType=='ServicePrincipal']" --output table
    ```

4. **Tag user-assigned managed identities** — apply tags like `owner`, `project`, and `environment` to every user-assigned managed identity. This makes it possible to identify ownership and clean up stale identities.

5. **Enforce naming conventions** — use a consistent prefix (e.g., `mi-<app>-<env>`) so managed identities are easily identifiable in Entra ID and Azure Resource Graph.

6. **Use Azure Policy** to enforce governance:
    - Require tags on `Microsoft.ManagedIdentity/userAssignedIdentities` resources.
    - Audit resources that use system-assigned identities when a user-assigned identity is preferred.

---

## Best Practices

1. **Prefer managed identities over service principals with secrets** — if your workload runs on Azure, there is almost never a reason to use client secrets or certificates.

2. **Default to user-assigned for production** — they survive resource re-creation, can be shared, and have clearer lifecycle management.

3. **Use Workload Identity Federation for external workloads** — GitHub Actions, Terraform Cloud, Kubernetes — all support OIDC federation. Stop storing secrets in CI/CD.

4. **Apply least privilege RBAC to managed identities** — a managed identity is still a security principal. Assign the narrowest role possible (see [Chapter 6 — RBAC](ch06-rbac.md)).

5. **Include managed identities in access reviews** — use Microsoft Entra access reviews to periodically verify that managed identities still need their role assignments (see [Chapter 7 — Entra ID Governance](ch07-entra-id-governance.md)).

6. **Clean up orphaned identities** — schedule periodic sweeps using Azure Resource Graph queries. An orphaned identity with standing permissions is a risk.

7. **Use DefaultAzureCredential in application code** — it provides a consistent, credential-free developer experience that automatically uses the right credential for the environment.

---

## Common Pitfalls

| Pitfall | Why It Hurts | Fix |
|---------|-------------|-----|
| Using client secrets "because it's simpler" | Secrets leak. They end up in logs, config files, and source control. | Use managed identities or workload identity federation. |
| Creating a system-assigned identity on every resource | Fine for simple cases, but leads to a proliferation of role assignments that are hard to audit. | Use user-assigned identities when multiple resources need the same access. |
| Orphaned user-assigned identities | They linger in Entra ID with active RBAC assignments, creating a risk surface. | Tag identities, query with Resource Graph, and schedule clean-up. |
| Using `DefaultAzureCredential` without specifying client ID in multi-identity scenarios | The SDK may pick the wrong identity, causing intermittent auth failures. | Pass the explicit `managed_identity_client_id`. |
| Wildcard subject claims in federated credentials | Any workflow in the repo (or org) can authenticate as the identity. | Scope to specific repo, branch, and environment. |

---

## References

- [Managed identities for Azure resources](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview)
- [User-assigned vs. system-assigned managed identities](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/managed-identity-best-practice-recommendations)
- [Workload Identity Federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [DefaultAzureCredential (Azure Identity SDK)](https://learn.microsoft.com/python/api/azure-identity/azure.identity.defaultazurecredential)
- [Azure Resource Graph queries for managed identities](https://learn.microsoft.com/azure/governance/resource-graph/samples/starter)
- [RBAC — Chapter 6](ch06-rbac.md)
- [Microsoft Entra ID Governance — Chapter 7](ch07-entra-id-governance.md)

---

Previous | Next
:--- | :---
[Chapter 7 — Microsoft Entra ID Governance](ch07-entra-id-governance.md) | [Part 3 — Policy & Compliance](../part-3-policy-compliance/ch09-azure-policy.md)
