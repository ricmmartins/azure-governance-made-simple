# Chapter 7 — Microsoft Entra ID Governance

> Last verified: 2026-04-06

---

## Overview

Granting access is easy. Governing it over time — that's the hard part.

**Microsoft Entra ID Governance** is a suite of capabilities that helps you balance *productivity* (people get the access they need, when they need it) with *security* (access is appropriate, reviewed, and revoked when no longer required). It sits on top of the Microsoft Entra ID identity platform and addresses the full lifecycle of identity governance:

| Capability | Purpose |
|-----------|---------|
| **Privileged Identity Management (PIM)** | Just-in-time, time-bound, approval-gated privileged access |
| **Access Reviews** | Periodic recertification of who has access to what |
| **Entitlement Management** | Self-service access packages with policies and expiration |
| **Lifecycle Workflows** | Automated onboarding, role changes, and offboarding |
| **AI Agent Identity Governance** | Governance controls for AI agent and workload identities |

Each of these works independently, but together they form a comprehensive governance strategy that keeps access right-sized and auditable.

---

## 7.1 Privileged Identity Management (PIM)

### What PIM Is and Why It Matters

Standing privileged access is one of the most common attack vectors in cloud environments. If a Global Administrator account is compromised, the blast radius is your entire tenant. **Privileged Identity Management (PIM)** eliminates standing privileges by converting permanent role assignments into *eligible* assignments that must be **activated** on demand.

Think of it this way: instead of giving someone a master key they carry around 24/7, you give them the ability to *request* the key for a limited window, with an approval workflow and an audit trail.

### How It Works

```
Eligible Assignment → Activation Request → (Optional) Approval → Time-Bound Active Assignment → Expiry
```

1. **Eligible assignment** — the user is *eligible* for a role but doesn't have it active. No permissions until they activate.
2. **Activation** — the user requests activation through the Azure portal, Microsoft Graph API, or PowerShell. They must satisfy any configured requirements (MFA, justification, approval).
3. **Time-bound access** — once activated, the role is active for a maximum duration (e.g., 8 hours) and then automatically deactivates.
4. **Audit trail** — every activation, approval, and expiry is logged and available in the Microsoft Entra audit log.

### PIM for Azure Resources vs. PIM for Microsoft Entra ID Roles

| Dimension | PIM for Azure Resources | PIM for Entra ID Roles |
|-----------|------------------------|----------------------|
| **Scope** | Management group, subscription, resource group, or resource | Tenant-wide Entra ID directory roles |
| **Roles** | Azure RBAC roles (Owner, Contributor, custom roles, etc.) | Entra ID roles (Global Administrator, User Administrator, etc.) |
| **Activation** | Per-scope activation | Tenant-level activation |
| **Use case** | Govern who can manage Azure infrastructure | Govern who can manage identity and tenant configuration |

> **Key point:** You should configure PIM for *both* Azure resources and Entra ID roles. A compromised Global Administrator can reset any password; a compromised subscription Owner can delete any resource.

### Best Practices

1. **Require MFA for every activation** — this is the single most effective control. Even if credentials are compromised, the attacker cannot activate the role without the second factor.

2. **Set maximum activation duration to the minimum practical window** — 8 hours is a common default, but many tasks require only 1–2 hours. Shorter windows reduce exposure.

3. **Configure approval workflows for high-impact roles** — roles like Owner, Global Administrator, and Security Administrator should require approval from a designated approver.

4. **Use eligible assignments, not permanent** — the only permanent assignments should be break-glass accounts (and those should be monitored with alerts).

5. **Enable PIM alerts** — configure notifications for activations and when eligible assignments are about to expire.

6. **Pair PIM with Access Reviews** — set up recurring reviews of who is *eligible* for privileged roles (see section 7.2).

---

## 7.2 Access Reviews

### What Access Reviews Are

Access reviews are a built-in mechanism for periodically verifying that users still need the access they've been granted. Without them, access accumulates over time — a phenomenon sometimes called *"privilege creep"* or *"access barnacles."*

Microsoft Entra access reviews can target:

- **Group memberships** — is each member still appropriate?
- **Application assignments** — should this user still have access to this SaaS app?
- **Azure role assignments** — does this person still need Contributor on this subscription?
- **Microsoft Entra ID role assignments** — should this user still be eligible for Global Reader?
- **Access package assignments** — has the user's project ended?

### How It Works

1. **Create a review** — an administrator defines the scope (which group, role, or package), the reviewers (self-review, manager, resource owner, or specific users), and the recurrence (one-time, weekly, monthly, quarterly).
2. **Review period opens** — reviewers receive an email and a link to the My Access portal where they approve or deny each user's continued access.
3. **Auto-remediation** — when the review period closes, denied users can be automatically removed. No manual clean-up required.
4. **Audit log** — all decisions are recorded and exportable.

### Best Practices

1. **Run quarterly reviews at minimum** — annual reviews let stale access persist too long. Quarterly strikes a good balance between security and reviewer fatigue.

2. **Enable auto-remove for denied access** — manual follow-up is unreliable. Let the system enforce the decision.

3. **Involve resource owners as reviewers** — managers may not know what a resource group contains. The team that owns the resource is better positioned to judge.

4. **Use multi-stage reviews for sensitive resources** — a first pass by the user's manager, followed by a second pass by the resource owner.

5. **Review PIM eligible assignments** — don't just review active access; review who is *eligible* to activate privileged roles.

---

## 7.3 Entitlement Management

### What Entitlement Management Is

Entitlement management lets you bundle related access rights — group memberships, application assignments, SharePoint sites, and Azure roles — into **access packages**. Users can then request these packages through a self-service portal, with policy-driven approval, expiration, and periodic review built in.

Think of an access package as a "project starter kit": when someone joins the Contoso Analytics project, they request the *Contoso Analytics* access package and automatically receive the security group memberships, the Power BI workspace access, and the Contributor role on the project's resource group.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Access Package** | A named bundle of resource access (groups, apps, roles, sites). |
| **Catalog** | A container for organizing access packages. Often aligned with business units or projects. |
| **Policy** | Rules governing who can request, who approves, how long access lasts, and whether reviews are required. |
| **Connected Organization** | An external organization whose users can request access packages — critical for B2B collaboration. |
| **Automatic Assignment Policy** | Rules that automatically assign or remove access packages based on user attributes (e.g., department = "Engineering"). |

### Best Practices

1. **Use access packages for project-based access** — when a project starts, create a package. When it ends, expire the package. No leftover permissions.

2. **Set expiration policies** — every assignment should have a maximum duration. Users can request renewal, which triggers a fresh approval cycle.

3. **Delegate catalog management to business owners** — IT shouldn't be the bottleneck for creating packages. Let department leads manage their own catalogs.

4. **Combine with access reviews** — access packages can require periodic access reviews, ensuring that long-lived assignments are still valid.

5. **Use automatic assignment policies** — for access that is universal within a department (e.g., all engineers need the CI/CD tool), use attribute-based automatic assignment rather than requiring individual requests.

---

## 7.4 Lifecycle Workflows

### What Lifecycle Workflows Are

Lifecycle Workflows automate identity-related tasks triggered by changes in a user's lifecycle — hiring, role changes, and departure. Instead of relying on IT tickets and manual checklists, you define **workflows** that execute automatically when specific conditions are met.

### Scenarios

| Scenario | Trigger | Example Tasks |
|----------|---------|---------------|
| **Pre-hire** | Before the employee's start date | Generate a temporary access pass, create the user account, send a welcome email |
| **Joiner** | Employee's first day (or hire date attribute) | Add to default groups, assign licenses, provision access packages |
| **Mover** | Department or job title changes | Update group memberships, revoke old access packages, assign new packages |
| **Leaver** | Last working day or termination date | Revoke all access, remove from groups, disable account, trigger data retention |

### Attribute-Based Triggers

Lifecycle Workflows are driven by **user attributes** in Microsoft Entra ID — primarily `employeeHireDate`, `employeeLeaveDateTime`, `department`, `jobTitle`, and `companyName`. Workflows evaluate these attributes on a schedule and fire when conditions are met.

As of 2026, Microsoft has expanded the set of supported trigger attributes, including custom security attributes and HR-provisioned extension attributes, giving you much finer control over when workflows fire (e.g., trigger on `costCenter` change or `employeeType` transition from contractor to full-time).

### Integration with HR Systems

Lifecycle Workflows are most powerful when combined with **inbound provisioning from HR systems** (Workday, SAP SuccessFactors, or custom HR via the inbound provisioning API). The HR system becomes the authoritative source of lifecycle events:

```
HR System → Inbound Provisioning → Microsoft Entra ID (attributes updated) → Lifecycle Workflow fires
```

### Best Practices

1. **Automate Day 1 provisioning** — new hires should have accounts, group memberships, and licenses before they walk through the door.

2. **Automate Day 0 offboarding** — the moment HR marks someone as terminated, disable the account and revoke access. Don't wait for a helpdesk ticket.

3. **Use the mover scenario** — it's the most overlooked. When someone transfers departments, their old access should be removed and new access granted automatically.

4. **Test workflows in a non-production tenant** — lifecycle workflows can have wide-reaching effects. Test thoroughly.

5. **Monitor workflow execution** — review the Lifecycle Workflows audit log regularly to catch failures.

---

## 7.5 AI Agent Identity Governance

### The Challenge: AI as a First-Class Identity

As organizations deploy AI agents — autonomous systems that call APIs, access data, and make decisions — a new governance challenge emerges. Traditional governance assumes a human is in the loop. AI agents operate autonomously, often at scale and speed that makes manual oversight impractical.

### Microsoft Entra Agent ID

Microsoft has introduced **Agent ID** as a first-class identity type within Microsoft Entra ID. An Agent ID represents an AI agent or autonomous workload and is distinct from service principals and managed identities:

- **Purpose-built for AI agents** — Agent IDs carry metadata about the agent's purpose, owning team, and operational constraints.
- **Governance-aware** — Agent IDs integrate with Conditional Access, PIM, and access reviews just like user and workload identities.
- **Auditable** — every action taken by an Agent ID is logged with the agent's identity, making it possible to trace autonomous decisions back to a specific agent and its configuration.

### Governance and Access Policies for AI Agents

The principles of governance apply to AI agents just as they do to human users — arguably more so, given their speed and autonomy:

| Principle | How It Applies to AI Agents |
|-----------|---------------------------|
| **Least privilege** | Grant agents only the data and API access they need. A summarization agent doesn't need write access to production databases. |
| **Time-bound access** | Use PIM-style eligible assignments so agents activate elevated permissions only when needed. |
| **Conditional Access** | Apply Conditional Access policies to Agent IDs — restrict by network location, require compliant device context for the orchestrator, and enforce token lifetime limits. |
| **Access reviews** | Include Agent IDs in periodic access reviews. When an agent is decommissioned or its scope changes, its access should be revoked. |
| **Risk evaluation** | Microsoft Entra ID Protection can evaluate sign-in risk for Agent IDs in real time, detecting anomalous patterns such as unusual API call volumes or access from unexpected locations. |

### Best Practices

1. **Treat every AI agent as a distinct identity** — don't share service principals across agents. Each agent should have its own Agent ID with clear ownership.

2. **Assign an owner to every Agent ID** — just like applications, agents need a human or team accountable for their access and behavior.

3. **Apply Conditional Access policies** — agents shouldn't be exempt from your security posture. Use workload identity Conditional Access.

4. **Include agents in access reviews** — quarterly reviews should cover Agent IDs alongside user and service principal access.

5. **Monitor with Microsoft Entra workload identity logs** — track token issuance, API calls, and anomalous activity for every Agent ID.

---

## Common Pitfalls

| Pitfall | Why It Hurts | Fix |
|---------|-------------|-----|
| Leaving permanent Global Admin assignments | If any of those accounts are compromised, the attacker has full tenant control. | Convert to PIM eligible assignments; keep at most two break-glass accounts as permanent. |
| Skipping access reviews because "we trust our people" | Access accumulates silently. After 18 months, half the assignments are stale. | Mandate quarterly reviews for all privileged roles and sensitive groups. |
| Using entitlement management without expiration | Access packages become just another way to grant permanent access. | Always set a maximum assignment duration. |
| Not automating offboarding | Former employees retain access for days or weeks after departure. | Implement lifecycle workflows connected to your HR system. |
| Ignoring AI agent governance | Agents accumulate permissions, act autonomously, and nobody reviews their access. | Register agents with Agent ID, apply Conditional Access, and include in access reviews. |

---

## References

- [What is Microsoft Entra ID Governance?](https://learn.microsoft.com/entra/id-governance/identity-governance-overview)
- [Privileged Identity Management documentation](https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure)
- [Access reviews overview](https://learn.microsoft.com/entra/id-governance/access-reviews-overview)
- [Entitlement management overview](https://learn.microsoft.com/entra/id-governance/entitlement-management-overview)
- [Lifecycle Workflows overview](https://learn.microsoft.com/entra/id-governance/what-are-lifecycle-workflows)
- [Workload identity federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [Microsoft Entra ID Protection for workload identities](https://learn.microsoft.com/entra/id-protection/concept-workload-identity-risk)
- [RBAC — Chapter 6](ch06-rbac.md)
- [Managed Identities — Chapter 8](ch08-managed-identities.md)

---

Previous | Next
:--- | :---
[Chapter 6 — RBAC](ch06-rbac.md) | [Chapter 8 — Managed Identities & Workload Identity](ch08-managed-identities.md)
