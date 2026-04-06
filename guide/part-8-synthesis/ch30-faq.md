# Chapter 30 — Frequently Asked Questions

> Last verified: 2026-04-06

---

## 1. Do I need all of this for a small Azure deployment?

**No.** Governance should be proportional to your environment's size, risk, and regulatory requirements. A startup with one subscription and a small team needs foundational governance — MFA, a naming convention, a few core policies, and budgets. That is enough to start.

The Crawl-Walk-Run maturity model (see Chapter 28 and Case Study 1) shows that you can implement meaningful governance in a single week. You do not need management groups, Policy as Code, or Azure Landing Zones on day one. Start with the basics and add complexity only when your environment demands it.

**Minimum viable governance:**
- Enforce MFA for all users
- Define a naming convention
- Assign 3–5 core policies (Audit mode)
- Set a budget with alerts
- Enable Microsoft Defender for Cloud (free tier)

---

## 2. What's the difference between governance, management, and compliance?

These terms are related but distinct:

| Term | Definition | Example |
|---|---|---|
| **Governance** | The rules, policies, and processes that define *how* cloud resources should be used | "All resources must have an `Owner` tag" |
| **Management** | The day-to-day operations of monitoring, maintaining, and optimizing resources | "Review Azure Monitor alerts daily" |
| **Compliance** | Demonstrating that your environment meets specific regulatory or organizational standards | "All storage accounts encrypt data at rest (SOC 2 requirement)" |

Governance sets the rules. Management enforces and operates within those rules. Compliance proves the rules are being followed.

---

## 3. Should I use Azure Policy or RBAC to restrict actions?

**Use both — they serve different purposes.**

| Mechanism | What It Controls | Example |
|---|---|---|
| **Azure Policy** | What *resources* can look like (properties, configurations) | "Storage accounts must use TLS 1.2" |
| **RBAC** | What *users* can do (actions, operations) | "Developers can deploy to dev, but not production" |

**Rule of thumb:**
- Use **Azure Policy** when the restriction is about *resource configuration* — regardless of who deploys it
- Use **RBAC** when the restriction is about *who can perform an action*

For example, "no public IP addresses" is a Policy concern. "Only platform admins can modify networking resources" is an RBAC concern.

---

## 4. How do I start with governance if I already have resources deployed?

This is the most common scenario. Most organizations adopt governance *after* resources are already in Azure.

**Recommended approach:**

1. **Assess** — Use Azure Resource Graph to inventory all resources, tags, and configurations. Run Microsoft Defender for Cloud to get a Secure Score.
2. **Assign policies in Audit mode** — Do not start with Deny. Audit mode shows you what *would* be non-compliant without blocking anything.
3. **Remediate** — Address the most impactful non-compliant resources first (untagged resources, public endpoints, missing encryption).
4. **Enforce** — Once compliance is above 80%, switch critical policies to Deny or DeployIfNotExists.
5. **Iterate** — Governance is continuous. Add new policies as your needs evolve.

> **Important:** Never switch a policy from Audit to Deny without first notifying all affected teams and remediating existing violations.

---

## 5. What happened to Azure Blueprints?

**Azure Blueprints has been deprecated.** Microsoft announced the deprecation in 2024 and recommends migrating to **Deployment Stacks** for most Blueprint use cases.

| Blueprints Capability | Replacement |
|---|---|
| Package ARM templates + policies + RBAC | **Deployment Stacks** — deploy Bicep/ARM templates with deny settings and cleanup on delete |
| Versioned environment definitions | **Template Specs** or **Bicep modules** in a registry |
| Policy assignment in a package | **Policy as Code** (EPAC or CI/CD pipelines) |
| RBAC assignment in a package | **Bicep/Terraform** RBAC modules |

If you currently use Blueprints, plan your migration to Deployment Stacks. See Chapter 14 (Deployment Stacks) for details.

---

## 6. Should I use Bicep or Terraform?

**Both are excellent choices.** The decision depends on your team's skills, multi-cloud requirements, and ecosystem preferences.

| Factor | Bicep | Terraform |
|---|---|---|
| Azure-native | ✅ First-party, tightly integrated | Third-party (AzureRM provider) |
| Multi-cloud | Azure only | AWS, GCP, Azure, and more |
| State management | No state file (uses ARM deployment history) | Requires state file (local, Azure Storage, Terraform Cloud) |
| Learning curve | Lower for Azure-focused teams | Moderate; HCL syntax is different from ARM/Bicep |
| Community modules | Azure Verified Modules (AVM) | Terraform Registry (massive ecosystem) |
| Policy as Code | EPAC (PowerShell-based) | Native Terraform + Sentinel |

**Recommendation:** If your organization is Azure-only, Bicep is the simpler choice. If you operate in a multi-cloud environment or your team already knows Terraform, Terraform is the pragmatic choice. Avoid using both in the same organization unless you have a clear reason to.

---

## 7. How many management group levels should I have?

**No more than six levels** (Azure enforces this limit). Most organizations need only **three to four levels**:

```
Tenant Root Group
└── Organization (Level 1)
    ├── Platform (Level 2)
    │   ├── Management (Level 3)
    │   ├── Connectivity (Level 3)
    │   └── Identity (Level 3)
    └── Landing Zones (Level 2)
        ├── Corp (Level 3)
        └── Online (Level 3)
```

**Common mistake:** Creating management groups that mirror the org chart (one per department, one per team). This leads to excessive depth and policy complexity. Management groups should represent *governance boundaries*, not organizational hierarchy.

---

## 8. What's the minimum set of policies I should deploy?

Start with these high-impact, low-risk policies in **Audit mode**:

1. **Require a tag on resource groups** — `Environment` tag at minimum
2. **Allowed locations** — Restrict to your approved Azure regions
3. **Audit VMs without managed disks** — Security and manageability baseline
4. **Audit storage accounts allowing public access** — Data protection
5. **Audit resources without resource locks** — Protection for critical resources

Once you are comfortable, add enforcement policies:

6. **Deny public IP addresses** (on the Corp management group)
7. **DeployIfNotExists: Enable Azure Monitor Agent** — Ensure monitoring
8. **Deny storage accounts without HTTPS** — Encryption in transit
9. **Require specific tag values** (e.g., `Environment` must be `prod`, `dev`, `staging`)
10. **Deny unencrypted SQL databases** — Data at rest encryption

See Appendix C for a full starter kit of 30 recommended policies.

---

## 9. How do I govern AI workloads?

AI governance requires controls at multiple levels:

1. **Access control** — Use Microsoft Entra ID authentication (not API keys) for Azure OpenAI Service. Assign the `Cognitive Services OpenAI User` role via RBAC.
2. **Content safety** — Keep default content filters enabled. Create custom filter configurations only with governance board approval.
3. **Rate limiting** — Set Tokens Per Minute (TPM) quotas per deployment to prevent runaway costs.
4. **Network isolation** — Require private endpoints for Azure OpenAI resources.
5. **Audit logging** — Enable diagnostic settings to log all API calls.
6. **Shadow AI detection** — Use Microsoft Defender for Cloud Apps to detect unauthorized AI service usage.

See Chapter 27 (AI Governance) for a comprehensive guide.

---

## 10. What's the difference between Resource Locks and Deployment Stack deny settings?

Both prevent unwanted changes, but they work differently:

| Feature | Resource Locks | Deployment Stack Deny Settings |
|---|---|---|
| Scope | Individual resource or resource group | All resources managed by the stack |
| Lock types | CanNotDelete, ReadOnly | DenyDelete, DenyWriteAndDelete |
| Override | Users with `Microsoft.Authorization/locks/write` permission | Users in the excludePrincipals list |
| Lifecycle | Independent of deployment | Tied to the Deployment Stack lifecycle |
| Orphan protection | No | Yes — deleting the stack can clean up resources |
| Best for | Protecting individual critical resources | Protecting entire deployments from drift |

**Use Resource Locks** for one-off protection of critical resources (e.g., a production database). **Use Deployment Stack deny settings** when you manage infrastructure as code and want to prevent out-of-band changes to the entire deployment.

---

## 11. How often should I run access reviews?

| Role Type | Recommended Frequency |
|---|---|
| Global Administrator, Subscription Owner | Monthly |
| Privileged roles (Contributor, Security Admin) | Quarterly |
| Application access (reader roles, service principals) | Semi-annually |
| Guest user access | Quarterly |

Access Reviews in Microsoft Entra ID can be automated with auto-apply, so reviewers only need to confirm or deny continued access. Set up reminders and escalation for non-responsive reviewers.

---

## 12. Should I use system-assigned or user-assigned managed identities?

| Criteria | System-Assigned | User-Assigned |
|---|---|---|
| Lifecycle | Tied to the resource — deleted when the resource is deleted | Independent — exists until you delete it |
| Sharing | One identity per resource | One identity can be assigned to multiple resources |
| Management | Simpler to manage for single-resource scenarios | More flexible for shared access patterns |
| Best for | Single VM or App Service accessing Key Vault | Multiple VMs or apps sharing the same database access |

**Recommendation:** Use **system-assigned** for simple, single-resource scenarios. Use **user-assigned** when multiple resources need the same permissions, or when you need the identity to persist independently of any single resource.

---

## 13. How do I enforce tagging across my organization?

A multi-layered approach works best:

1. **Azure Policy — Require tags on resource groups:**
   - Effect: `Deny` — Resource groups cannot be created without the required tags

2. **Azure Policy — Inherit tags from resource group:**
   - Effect: `Modify` — Resources automatically inherit tags from their resource group

3. **Azure Policy — Require tags on resources:**
   - Effect: `Audit` or `Deny` — Flag or block resources missing required tags

4. **CI/CD pipeline validation:**
   - Check for required tags in Bicep/Terraform templates before deployment

5. **Regular remediation:**
   - Run remediation tasks to apply `Modify` policies to existing resources

**Recommended mandatory tags:** `Environment`, `Owner`, `CostCenter`, `Application`

---

## 14. What compliance frameworks does Azure support out of the box?

Microsoft Defender for Cloud provides built-in regulatory compliance assessments for many frameworks:

| Framework | Region/Industry |
|---|---|
| Microsoft Cloud Security Benchmark (MCSB) | Global |
| SOC 2 Type 2 | Global |
| ISO 27001:2022 | Global |
| PCI-DSS v4.0 | Payment card industry |
| HIPAA / HITRUST | US healthcare |
| FedRAMP High | US federal government |
| NIST SP 800-53 Rev. 5 | US government |
| CIS Azure Benchmark | Global |
| GDPR | European Union |
| Australia IRAP | Australia |
| Canada PBMM | Canada |
| UK OFFICIAL / NHS | United Kingdom |
| NIS2 | European Union |

You can also add custom compliance standards by creating custom policy initiatives that map controls to your organization's specific requirements.

---

## 15. How do I track governance progress over time?

Use a combination of tools and metrics:

1. **Secure Score trend** — Track Microsoft Defender for Cloud Secure Score weekly. It should trend upward.

2. **Policy compliance percentage** — Monitor the overall compliance rate in the Azure Policy dashboard. Target: >90%.

3. **AzGovViz reports** — Run AzGovViz weekly or daily to generate comprehensive governance reports showing policy assignments, RBAC, and management group structure.

4. **Azure Resource Graph queries** — Write queries to track specific metrics (untagged resources, public endpoints, missing locks). See Appendix D for starter queries.

5. **Cost trends** — Track month-over-month cost changes. Governance should stabilize or reduce costs over time.

6. **Audit findings** — Track the number of governance-related audit findings. This should decrease over time.

7. **Governance dashboard** — Build an Azure Monitor workbook or Power BI dashboard that aggregates all governance metrics in one place.

---

## 16. Can I use Azure Policy to enforce configurations inside virtual machines?

**Yes** — via **Azure Machine Configuration** (formerly Guest Configuration). Machine Configuration uses Azure Policy to audit and enforce settings inside the guest operating system:

- Password complexity requirements
- Installed software inventory
- Windows Registry settings
- Linux file permissions
- Service status (running/stopped)
- CIS benchmark compliance

Machine Configuration works on Azure VMs and Azure Arc-enabled servers, providing consistent OS-level governance across hybrid environments.

---

## 17. How do I handle exceptions to governance policies?

Use **Azure Policy exemptions** with these guidelines:

1. **Always set an expiration date** — Exemptions should be temporary. Set a maximum exemption period (e.g., 90 days).
2. **Document the justification** — Every exemption must have a clear reason and an approval record.
3. **Use the `Waiver` category** — For intentional deviations. Use `Mitigated` only when an alternative control exists.
4. **Review regularly** — Include exemption reviews in your monthly governance cadence.
5. **Track in a central register** — Use Azure Resource Graph to query all active exemptions:

```kusto
policyresources
| where type == "microsoft.authorization/policyexemptions"
| extend expiresOn = properties.expiresOn,
         category = properties.exemptionCategory,
         displayName = properties.displayName
| project name, displayName, category, expiresOn, resourceGroup
| order by expiresOn asc
```

---

## 18. What's the difference between a Policy Initiative and a single Policy?

A **Policy Definition** is a single rule (e.g., "Storage accounts must use HTTPS"). A **Policy Initiative** (also called a Policy Set) is a group of related policy definitions assigned together.

**When to use initiatives:**
- When you want to track compliance against a framework (e.g., MCSB, PCI-DSS)
- When multiple policies are always assigned together
- When you want a single compliance score for a group of controls

**Example:** The "Microsoft Cloud Security Benchmark" is an initiative containing 200+ individual policy definitions across multiple security domains.

---

## 19. Should I assign policies at the management group or subscription level?

**Prefer management group level.** Assigning policies at the management group level ensures consistent enforcement across all child subscriptions — including any subscriptions created in the future.

| Assignment Level | Use When |
|---|---|
| Management group | Default for all broad governance policies |
| Subscription | Exception-based or subscription-specific policies |
| Resource group | Rarely; only for highly specific controls |

Assign broad policies (tags, allowed regions, security baselines) at the highest applicable management group. Assign workload-specific policies at the landing zone management group level. Avoid assigning at the resource group level — it does not scale.

---

## 20. How do I get started with governance today?

1. **Read Chapters 1–3** — Understand what governance is and why it matters
2. **Run Microsoft Defender for Cloud** — Get your Secure Score as a baseline
3. **Run Azure Resource Graph queries** — Inventory your resources (see Appendix D)
4. **Implement the Phase 1 roadmap** — Follow Chapter 28's Month 1–3 plan
5. **Pick three policies** — Start with Audit mode (see FAQ #8 for recommendations)
6. **Set a budget** — Even one budget with one alert is better than none
7. **Enable MFA** — The single highest-impact security control
8. **Schedule 30 minutes weekly** — Review governance metrics and address issues

You do not need to do everything at once. Start today, iterate weekly, and your governance posture will steadily improve.

---

| Previous | Next |
|:---|:---|
| [Case Studies](ch29-case-studies.md) | [Appendix A — Glossary](../appendices/appendix-a-glossary.md) |
