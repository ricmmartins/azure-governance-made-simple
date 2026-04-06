# Chapter 10 — Regulatory Compliance & Microsoft Cloud Security Benchmark

> Last verified: 2026-04-06

Meeting regulatory compliance requirements is a fundamental driver of cloud governance. Azure provides built-in tools to map your cloud environment against industry standards and regulatory frameworks, track compliance posture over time, and report on gaps. This chapter covers how regulatory compliance works in Azure, the Microsoft Cloud Security Benchmark, and how to operationalize compliance using Azure Policy and Microsoft Defender for Cloud.

---

## Overview

Regulatory compliance in Azure refers to the process of ensuring that your cloud resources and configurations meet the requirements of industry standards, government regulations, and organizational policies. Azure does not make you compliant — **you** are responsible for compliance — but Azure provides the tooling and controls to help you get there.

Key Azure services involved in regulatory compliance:

| Service | Role |
|---------|------|
| **Azure Policy** | Defines and enforces configuration standards. Compliance initiatives map to regulatory frameworks. |
| **Microsoft Defender for Cloud** | Provides a compliance dashboard, secure score, and security recommendations aligned to regulatory standards. |
| **Microsoft Purview** | Data governance, classification, and compliance for data workloads. |
| **Azure Audit Logs** | Activity and diagnostic logs for audit trails. |
| **Microsoft Entra ID** | Identity governance, access reviews, and conditional access for identity-related compliance controls. |

### Shared Responsibility Model

Compliance in the cloud follows the shared responsibility model:

- **Microsoft** is responsible for the compliance of the cloud infrastructure (physical security, host OS, hypervisor).
- **You** are responsible for compliance of what you deploy in the cloud (data, applications, identity, network configuration, OS patching for IaaS).

The degree of responsibility shifts depending on the service model:

| Control | IaaS | PaaS | SaaS |
|---------|------|------|------|
| Data classification | Customer | Customer | Customer |
| Identity & access | Customer | Customer | Shared |
| Application | Customer | Shared | Microsoft |
| Network controls | Customer | Shared | Microsoft |
| OS patching | Customer | Microsoft | Microsoft |
| Physical security | Microsoft | Microsoft | Microsoft |

---

## How It Works

### Microsoft Cloud Security Benchmark (MCSB)

The **Microsoft Cloud Security Benchmark (MCSB)** is a set of security and compliance best practices authored by Microsoft. It provides a unified framework of security controls that maps to multiple industry standards. MCSB is the default security initiative assigned to every Azure subscription through Microsoft Defender for Cloud.

MCSB is organized into **control domains**:

| Control Domain | Description |
|---------------|-------------|
| Network Security (NS) | Securing virtual networks, private endpoints, firewalls, DNS |
| Identity Management (IM) | Authentication, authorization, managed identities, conditional access |
| Privileged Access (PA) | Protecting administrative accounts and JIT access |
| Data Protection (DP) | Encryption at rest, in transit, key management |
| Asset Management (AM) | Inventory, discovery, resource governance |
| Logging and Threat Detection (LT) | Diagnostic settings, audit logs, threat detection |
| Incident Response (IR) | Preparation, detection, containment, post-incident |
| Posture and Vulnerability Management (PV) | Vulnerability scanning, secure configurations |
| Endpoint Security (ES) | EDR, anti-malware, host security |
| Backup and Recovery (BR) | Backup policies, recovery testing |
| DevOps Security (DS) | Secure pipelines, code scanning, supply chain |
| Governance and Strategy (GS) | Organizational alignment, policy, and risk management |

### How MCSB Maps to Industry Standards

MCSB provides direct mappings to the following regulatory frameworks:

| Framework | Description | Mapping |
|-----------|-------------|---------|
| **CIS Benchmarks** | Center for Internet Security configuration baselines for Azure | MCSB controls map to specific CIS recommendations |
| **NIST SP 800-53 Rev. 5** | U.S. federal security and privacy controls | Each MCSB control references applicable NIST control families |
| **PCI-DSS v4.0** | Payment Card Industry Data Security Standard | MCSB maps relevant controls for payment processing environments |
| **ISO 27001:2022** | International information security management standard | MCSB controls align with ISO 27001 Annex A controls |

This means that by implementing MCSB controls, you are simultaneously addressing requirements from multiple frameworks. The Defender for Cloud compliance dashboard shows this mapping visually.

### Built-in Regulatory Compliance Initiatives in Azure Policy

Azure Policy provides **built-in compliance initiatives** that map directly to regulatory standards. These initiatives are collections of policy definitions grouped by control area. When assigned, they evaluate your resources and report compliance status per control.

Major built-in initiatives include:

| Initiative | Policy Definition Set ID |
|-----------|------------------------|
| Microsoft Cloud Security Benchmark | `1f3afdf9-d0c9-4c3d-847f-89da613e70a8` |
| NIST SP 800-53 Rev. 5 | `179d1daa-458f-4e47-8086-2a68d0d6c38f` |
| CIS Microsoft Azure Foundations Benchmark v2.0.0 | `06f19060-9e68-4070-92ca-f15cc126059e` |
| PCI DSS v4.0 | `c676748e-3af9-4e22-bc28-50fed0f511a8` |
| ISO 27001:2022 | `89c6cddc-1c73-4ac1-b19c-54d1a15a42f2` |
| FedRAMP High | `d5264498-16f4-418a-b659-fa7ef418175f` |
| HIPAA / HITRUST | `a169a624-5599-4385-a696-c8d643089fab` |
| SOC 2 Type 2 | `4054785f-702b-4a98-9215-009571ba8f21` |
| Canada Federal PBMM | `4c4a5f27-de81-430b-b4e5-9cbd50595a87` |

To assign a compliance initiative:

```bash
# Assign the NIST SP 800-53 Rev. 5 initiative to a subscription
az policy assignment create \
  --name "nist-800-53-assignment" \
  --display-name "NIST SP 800-53 Rev. 5 Compliance" \
  --policy-set-definition "179d1daa-458f-4e47-8086-2a68d0d6c38f" \
  --scope "/subscriptions/{subscription-id}" \
  --enforcement-mode "Default"
```

### Compliance Dashboard in Microsoft Defender for Cloud

Microsoft Defender for Cloud provides a **Regulatory Compliance** dashboard that gives a real-time view of your compliance posture against assigned initiatives.

The dashboard shows:

1. **Overall compliance percentage** per assigned standard.
2. **Control-level breakdown** — which controls are passing, failing, or not assessed.
3. **Recommendation-level detail** — specific resources that are non-compliant and remediation guidance.
4. **Downloadable compliance reports** — PDF and CSV exports for auditors and stakeholders.

To access the dashboard:

1. Navigate to **Microsoft Defender for Cloud** in the Azure portal.
2. Select **Regulatory compliance** from the left menu.
3. Select the standard you want to review (e.g., NIST SP 800-53 Rev. 5).
4. Drill into individual controls and recommendations.

> **Note:** The compliance dashboard requires at least one regulatory compliance initiative to be assigned to your subscription. The MCSB initiative is assigned by default.

### Custom Compliance Standards

While built-in initiatives cover major frameworks, organizations often have additional internal requirements. You can create **custom compliance initiatives** that:

- Include a mix of built-in and custom policy definitions.
- Map to your organization's control framework.
- Appear in the Defender for Cloud compliance dashboard alongside built-in standards.

Steps to create a custom compliance standard:

1. **Define your control framework** — Document your organization's security controls.
2. **Map controls to policies** — For each control, identify Azure Policy definitions (built-in or custom) that evaluate compliance.
3. **Create a policy initiative** — Group the mapped policies into an initiative.
4. **Assign the initiative** — Assign it at the management group or subscription level.
5. **Register as a compliance standard** — Use the Defender for Cloud API to register your custom initiative as a regulatory standard so it appears in the compliance dashboard.

Example custom initiative structure:

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

## Best Practices

1. **Use built-in initiatives as your baseline** — Start with MCSB and layer additional framework-specific initiatives as needed. Do not duplicate controls that MCSB already covers.

2. **Create custom initiatives for organization-specific requirements** — Map your internal security policies to Azure Policy definitions and register them as compliance standards in Defender for Cloud.

3. **Assign compliance initiatives at the management group level** — This ensures consistent coverage across all subscriptions and avoids per-subscription management overhead.

4. **Separate enforcement from compliance reporting** — Use compliance initiatives in Audit mode for visibility and reporting. Use separate Deny/Modify policy assignments for enforcement. This keeps compliance reporting clean and avoids double-counting.

5. **Automate compliance reporting** — Export compliance data using the Azure Policy Compliance REST API or Azure Resource Graph queries. Integrate with your GRC (Governance, Risk, and Compliance) tooling.

6. **Review compliance posture regularly** — Schedule weekly or monthly compliance reviews using the Defender for Cloud dashboard. Track trends over time.

7. **Use exemptions for accepted risk** — When a resource legitimately cannot comply with a control, create a policy exemption with documented justification rather than ignoring the non-compliance.

8. **Map to multiple frameworks simultaneously** — MCSB's cross-framework mappings let you demonstrate compliance to multiple standards with a single set of controls. Use this to reduce audit burden.

9. **Prepare for audits proactively** — Keep compliance reports current, document all exemptions, and maintain evidence of remediation actions. Auditors will ask for point-in-time compliance snapshots.

10. **Integrate compliance into CI/CD** — Use Azure Policy's compliance check APIs in your deployment pipelines to catch non-compliant deployments before they reach production.

---

## Common Pitfalls

1. **Confusing Azure compliance with organizational compliance** — Azure provides tools and controls, but compliance is ultimately your responsibility. Assigning a NIST initiative does not make you NIST-compliant — you must also address controls outside Azure's scope (people, processes, physical security).

2. **Assigning too many overlapping initiatives** — Multiple compliance initiatives often include the same underlying policies. This creates duplicate findings in the compliance dashboard and inflates the remediation workload. Rationalize your initiative assignments.

3. **Ignoring "Not Applicable" controls** — Some controls in a framework may not apply to your environment. Document why they are not applicable rather than leaving them unaddressed.

4. **Not tracking compliance over time** — A point-in-time compliance snapshot has limited value. Track compliance trends to identify regression and measure improvement.

5. **Treating compliance as a one-time project** — Regulatory compliance is an ongoing process. Resources are constantly being deployed and modified. Without continuous monitoring, compliance drift is inevitable.

6. **Not involving compliance teams early** — Technical teams may implement controls that do not satisfy the specific evidence requirements that auditors need. Involve compliance and legal teams when defining control implementations.

---

## Code Samples

### Azure Resource Graph: Query Compliance State

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

### Azure CLI: List Compliance States for an Initiative Assignment

```bash
# Get compliance summary for a specific policy assignment
az policy state summarize \
  --policy-assignment "nist-800-53-assignment" \
  --top 10
```

### Bicep: Assign a Regulatory Compliance Initiative

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

## References

- [Microsoft Cloud Security Benchmark overview](https://learn.microsoft.com/en-us/security/benchmark/azure/overview)
- [MCSB control domains](https://learn.microsoft.com/en-us/security/benchmark/azure/mcsb-overview)
- [Regulatory compliance in Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard)
- [Azure Policy regulatory compliance built-in initiatives](https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-initiatives#regulatory-compliance)
- [Azure compliance documentation](https://learn.microsoft.com/en-us/azure/compliance/)
- [Microsoft Trust Center](https://www.microsoft.com/en-us/trust-center)
- [Custom compliance standards in Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/custom-security-policies)
- [Shared responsibility in the cloud](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)
- [Azure Policy compliance states](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/get-compliance-data)
- [NIST SP 800-53 Rev. 5 initiative](https://learn.microsoft.com/en-us/azure/governance/policy/samples/nist-sp-800-53-r5)

---

Previous | Next
:--- | :---
[Chapter 9 — Azure Policy](/guide/part-3-policy-compliance/ch09-azure-policy.md) | [Chapter 11 — Microsoft Defender for Cloud](/guide/part-3-policy-compliance/ch11-defender-for-cloud.md)
