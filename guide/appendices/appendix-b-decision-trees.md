# Appendix B — Decision Trees

> Last verified: 2026-04-06

---

## Decision Tree 1: Which Governance Tool Should I Use?

Use this decision tree to choose the right Azure governance mechanism for your requirement.

```
START: What do you want to control?
│
├─► "What RESOURCES look like (configuration, properties)"
│   │
│   ├─► Should it prevent non-compliant resources from being created?
│   │   │
│   │   ├─► YES → Azure Policy (Deny effect)
│   │   │   Example: "Block storage accounts without HTTPS"
│   │   │
│   │   └─► NO → Do you want to auto-remediate?
│   │       │
│   │       ├─► YES → Azure Policy (DeployIfNotExists / Modify)
│   │       │   Example: "Auto-enable diagnostic settings"
│   │       │
│   │       └─► NO → Azure Policy (Audit effect)
│   │           Example: "Flag VMs without managed disks"
│   │
│   └─► Is it about OS-level configuration inside a VM?
│       │
│       └─► YES → Azure Machine Configuration (via Azure Policy)
│           Example: "Ensure password complexity on Windows servers"
│
├─► "What USERS can do (permissions, actions)"
│   │
│   ├─► Is it about permanent access?
│   │   │
│   │   └─► YES → Azure RBAC (role assignments)
│   │       Example: "Developers get Contributor on dev resource group"
│   │
│   ├─► Is it about temporary/privileged access?
│   │   │
│   │   └─► YES → PIM (Privileged Identity Management)
│   │       Example: "Admins activate Owner role for 4 hours"
│   │
│   └─► Is it about conditional access (location, device, risk)?
│       │
│       └─► YES → Microsoft Entra ID Conditional Access
│           Example: "Require MFA from untrusted networks"
│
├─► "Prevent accidental deletion or modification of resources"
│   │
│   ├─► Is it a single critical resource?
│   │   │
│   │   └─► YES → Resource Lock (CanNotDelete or ReadOnly)
│   │       Example: "Lock the production SQL database"
│   │
│   └─► Is it an entire deployment managed as code?
│       │
│       └─► YES → Deployment Stack (deny settings)
│           Example: "Prevent out-of-band changes to the networking stack"
│
└─► "Detect and respond to security threats"
    │
    └─► Microsoft Defender for Cloud
        ├─► Posture assessment → Defender CSPM
        ├─► Workload protection → Defender for Servers, Containers, etc.
        └─► Compliance tracking → Regulatory compliance dashboard
```

---

## Decision Tree 2: How Should I Structure My Management Groups?

Use this decision tree to determine the right management group design for your organization.

```
START: How many Azure subscriptions does your organization have (or plan to have)?
│
├─► 1–3 subscriptions
│   │
│   └─► Do you have regulatory requirements?
│       │
│       ├─► NO → Minimal structure:
│       │       Tenant Root Group
│       │       └── Your Organization
│       │           ├── Production (subscription)
│       │           ├── Non-Production (subscription)
│       │           └── Sandbox (subscription)
│       │
│       │   Assign policies at the "Your Organization" level.
│       │
│       └─► YES → Add a Regulated management group:
│               Tenant Root Group
│               └── Your Organization
│                   ├── Regulated (subscriptions with compliance needs)
│                   ├── General (other subscriptions)
│                   └── Sandbox
│
├─► 4–20 subscriptions
│   │
│   └─► Do you have centralized platform services (networking, logging)?
│       │
│       ├─► NO → Simple Landing Zone structure:
│       │       Tenant Root Group
│       │       └── Your Organization
│       │           ├── Production
│       │           ├── Non-Production
│       │           ├── Shared Services
│       │           └── Sandbox
│       │
│       └─► YES → CAF Landing Zone structure:
│               Tenant Root Group
│               └── Your Organization
│                   ├── Platform
│                   │   ├── Management
│                   │   ├── Connectivity
│                   │   └── Identity
│                   ├── Landing Zones
│                   │   ├── Corp
│                   │   └── Online
│                   └── Sandbox
│
└─► 20+ subscriptions
    │
    └─► Full ALZ structure (recommended):
            Tenant Root Group
            └── Your Organization
                ├── Platform
                │   ├── Management
                │   ├── Connectivity
                │   └── Identity
                ├── Landing Zones
                │   ├── Corp
                │   ├── Online
                │   └── Regulated (if needed)
                │       ├── HIPAA
                │       ├── PCI
                │       └── ...
                ├── Sandbox
                └── Decommissioned

        Consider adding regional or business-unit
        subdivisions under Landing Zones if you have
        multi-region or multi-BU requirements.
```

**Key principles regardless of size:**

- Never assign policies directly at the Tenant Root Group
- Keep depth to 3–4 levels (6 is the Azure maximum)
- Management groups represent governance boundaries, not org chart structure
- Plan for growth — it is easier to add management groups than to restructure

---

## Decision Tree 3: Which Policy Effect Should I Choose?

Use this decision tree to select the appropriate Azure Policy effect for your requirement.

```
START: What should happen when a resource matches the policy rule?
│
├─► "I want to BLOCK non-compliant resources from being created or modified"
│   │
│   └─► Use: Deny
│       │
│       ├─► CAUTION: Deny affects ALL users, including admins
│       ├─► TIP: Test with Audit first, then switch to Deny
│       └─► EXAMPLE: "Deny storage accounts without TLS 1.2"
│
├─► "I want to FLAG non-compliant resources but not block them"
│   │
│   └─► Use: Audit
│       │
│       ├─► Resources appear as "Non-compliant" in the compliance dashboard
│       ├─► No enforcement — resources are still created/modified normally
│       └─► EXAMPLE: "Audit VMs without managed disks"
│
├─► "I want to AUTOMATICALLY FIX non-compliant resources"
│   │
│   ├─► Does the fix involve deploying a RELATED resource?
│   │   │
│   │   └─► YES → Use: DeployIfNotExists (DINE)
│   │       │
│   │       ├─► Deploys a related resource if it does not exist
│   │       ├─► Requires a managed identity for remediation
│   │       ├─► Can run on existing resources via remediation tasks
│   │       └─► EXAMPLE: "Deploy diagnostic settings if not configured"
│   │
│   └─► Does the fix involve MODIFYING properties on the resource itself?
│       │
│       └─► YES → Use: Modify
│           │
│           ├─► Adds, updates, or removes properties (typically tags)
│           ├─► Requires a managed identity for remediation
│           └─► EXAMPLE: "Inherit the Environment tag from resource group"
│
├─► "I want to ADD data to a resource during creation"
│   │
│   └─► Use: Append
│       │
│       ├─► Adds properties to the resource during create/update
│       ├─► Limited use cases — Modify is generally preferred
│       └─► EXAMPLE: "Append IP restrictions to a web app"
│
├─► "I want the policy to EXIST but not evaluate"
│   │
│   └─► Use: Disabled
│       │
│       ├─► Policy is assigned but has no effect
│       ├─► Useful for testing or temporary deactivation
│       └─► Prefer policy exemptions over Disabled for specific scopes
│
└─► "I need MANUAL attestation for compliance"
    │
    └─► Use: Manual
        │
        ├─► Compliance is determined by manual attestation, not automation
        ├─► Used for controls that cannot be evaluated automatically
        └─► EXAMPLE: "Verify disaster recovery test was conducted"
```

**Quick reference table:**

| Effect | Blocks Creation? | Auto-Remediates? | Use Case |
|---|---|---|---|
| **Deny** | ✅ Yes | ❌ No | Hard enforcement — must comply |
| **Audit** | ❌ No | ❌ No | Visibility — understand compliance |
| **DeployIfNotExists** | ❌ No | ✅ Yes (related resource) | Auto-deploy missing configurations |
| **Modify** | ❌ No | ✅ Yes (same resource) | Auto-fix properties (tags, settings) |
| **Append** | ❌ No | ❌ No (at create/update only) | Add properties during deployment |
| **Disabled** | ❌ No | ❌ No | Temporarily turn off a policy |
| **Manual** | ❌ No | ❌ No | Human-attested compliance |

**Recommended adoption path:**

1. Start with **Audit** to understand your current compliance posture
2. Enable **DeployIfNotExists** / **Modify** for auto-remediation of common issues
3. Switch to **Deny** for critical controls once teams are aware and existing resources are compliant

---

| Previous | Next |
|:---|:---|
| [Appendix A — Glossary](appendix-a-glossary.md) | [Appendix C — Policy Starter Kit](appendix-c-policy-starter-kit.md) |
