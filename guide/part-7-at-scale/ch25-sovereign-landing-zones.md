# Chapter 25 — Sovereign Landing Zones

> Last verified: 2026-04-06

---

## Overview

**Sovereign Landing Zones (SLZ)** are specialized Azure Landing Zone architectures designed for organizations that must meet strict data residency, data sovereignty, and regulatory compliance requirements. They build on the standard Azure Landing Zone architecture and add controls that ensure data stays within specific geographic or political boundaries and that operations comply with national regulations.

Sovereign Landing Zones are relevant for:

- **Government agencies** subject to national data handling laws
- **Financial services** organizations with data localization requirements
- **Healthcare organizations** bound by regional patient data protection rules
- **Any organization** operating in jurisdictions with strict data sovereignty laws (GDPR, LGPD, PIPL, etc.)

---

## How It Works

### Sovereign Clouds vs. Public Cloud with Sovereignty Controls

Azure offers dedicated sovereign cloud environments as well as sovereignty controls within the public cloud:

| Environment | Description | Use Case |
|---|---|---|
| **Azure Public** (with sovereignty features) | Standard Azure regions with data residency guarantees, confidential computing, and customer-managed keys | Most regulated industries; GDPR compliance |
| **Azure Government** (US) | Physically isolated datacenters for US federal, state, and local government | US government workloads; FedRAMP High, DoD IL4/IL5 |
| **Azure China** (operated by 21Vianet) | Physically and logically isolated Azure operated by a Chinese entity | Workloads that must remain within China |

> **Note:** Azure Germany (operated by T-Systems) was retired. German data residency requirements are now met by Azure public regions in Germany (Germany West Central, Germany North).

### Data Residency Requirements

Data residency controls ensure that data is stored, processed, and — in some cases — never leaves a specific geographic region.

Azure provides several mechanisms for data residency:

1. **Azure region selection** — Most Azure services store data at rest within the selected region. Azure guarantees data residency for the majority of services.

2. **Allowed Locations policy** — Use Azure Policy to restrict which Azure regions resources can be deployed to:

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

3. **Customer-managed keys (CMK)** — Control encryption keys using Azure Key Vault or Azure Key Vault Managed HSM to ensure that only authorized parties can decrypt data.

4. **Azure Confidential Computing** — Use hardware-based Trusted Execution Environments (TEEs) to protect data in use, not just at rest and in transit.

5. **Azure Data Boundary** — The EU Data Boundary for the Microsoft Cloud ensures that customer data for EU-based customers is stored and processed within the EU.

### Sovereign Landing Zone Architecture Patterns

The Sovereign Landing Zone architecture extends the standard ALZ with additional controls:

```
Standard ALZ Architecture
    │
    ├── + Restricted region policies (Allowed Locations)
    ├── + Customer-managed key requirements
    ├── + Confidential computing policies
    ├── + Network isolation (no cross-border peering)
    ├── + Data classification and labeling requirements
    ├── + Audit logging with sovereign log retention
    └── + Operational access controls (Lockbox, sovereign operations)
```

**Key architectural additions:**

| Control | Purpose |
|---|---|
| **Allowed Locations** | Restrict resource deployment to sovereign-approved regions |
| **Customer Lockbox** | Require approval before Microsoft support accesses data |
| **Customer-managed keys** | Retain control over encryption keys |
| **Confidential Computing** | Protect data in use with hardware-based TEEs |
| **Private endpoints** | Prevent data from traversing the public internet |
| **Network peering restrictions** | Prevent cross-border network connectivity |
| **Diagnostic settings** | Route all logs to a sovereign-controlled Log Analytics workspace |
| **Azure Key Vault Managed HSM** | FIPS 140-2 Level 3 validated hardware security modules |

### Compliance Boundaries for Regulated Industries

Different industries have specific compliance requirements that the Sovereign Landing Zone addresses:

**Healthcare:**
- HIPAA (US), GDPR (EU), LGPD (Brazil)
- Patient data must be encrypted at rest and in transit
- Access to patient data must be audited
- Data residency requirements vary by jurisdiction

**Financial Services:**
- PCI-DSS for payment card data
- SOX for financial reporting systems
- National banking regulations (often require data residency)
- Strong encryption and key management requirements

**Government:**
- FedRAMP (US federal), IRAP (Australia), G-Cloud (UK)
- Data sovereignty is typically mandatory
- Clearance requirements for operations personnel
- Strict network isolation requirements

### Privacy and Data Protection Governance Controls

Sovereign Landing Zones implement privacy controls at multiple levels:

1. **Infrastructure level** — Encryption, network isolation, region restrictions
2. **Platform level** — Microsoft Purview for data classification, sensitivity labels
3. **Application level** — Microsoft Entra ID Conditional Access, data loss prevention
4. **Operational level** — Customer Lockbox, access reviews, audit logging

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

## Best Practices

1. **Understand your regulatory requirements first** — Sovereignty requirements vary dramatically by jurisdiction and industry. Engage legal and compliance teams before designing the architecture.

2. **Use the Sovereign Landing Zone reference implementation** — The [Azure Sovereign Landing Zone](https://github.com/Azure/sovereign-landing-zone) provides a starting point for sovereign deployments.

3. **Enforce region restrictions early** — Apply Allowed Locations policies at the highest management group level. It is much harder to relocate resources after deployment.

4. **Enable Customer Lockbox** — For truly sovereign workloads, Customer Lockbox ensures that Microsoft support cannot access your data without explicit approval.

5. **Use customer-managed keys for all data stores** — Even when service-managed keys are available, regulated workloads should use customer-managed keys for full control.

6. **Plan for key management** — Customer-managed keys require Key Vault or Managed HSM. Plan the key rotation, backup, and disaster recovery strategy.

7. **Consider confidential computing for highly sensitive workloads** — Azure Confidential VMs and confidential containers protect data even from the cloud operator.

8. **Document your compliance posture** — Use Microsoft Defender for Cloud regulatory compliance dashboards to continuously demonstrate compliance with applicable frameworks.

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---|---|---|
| Assuming Azure region selection alone ensures sovereignty | Some services replicate metadata globally | Review each service's data residency documentation |
| Not restricting paired regions | Geo-redundant storage may replicate to a region outside your boundary | Use zone-redundant storage (ZRS) instead of geo-redundant (GRS) |
| Forgetting about support data | Support tickets may contain customer data | Enable Customer Lockbox; review support data handling |
| Over-restricting regions | Reduced service availability and higher latency | Balance sovereignty requirements with operational needs |
| Ignoring operational access | Cloud operators may access infrastructure during incidents | Use Customer Lockbox and sovereign operations controls |

---

## References

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

| Previous | Next |
|:---|:---|
| [Azure Arc](ch24-azure-arc.md) | [Data Governance with Purview](ch26-data-governance-purview.md) |
