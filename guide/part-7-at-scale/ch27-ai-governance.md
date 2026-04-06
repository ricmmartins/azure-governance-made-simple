# Chapter 27 — AI Governance

> Last verified: 2026-04-06

---

## Overview

As organizations adopt AI services — particularly generative AI and large language models (LLMs) — a new governance discipline is required. AI workloads introduce unique risks: uncontrolled data exposure, biased or harmful outputs, runaway costs from token consumption, and regulatory non-compliance. **AI governance** is the set of policies, controls, and processes that ensure AI workloads are used responsibly, securely, and in compliance with organizational and regulatory requirements.

This chapter focuses on governing AI workloads within Azure, particularly Azure OpenAI Service, and the broader challenge of ensuring that AI adoption does not undermine your existing governance posture.

---

## How It Works

### Azure OpenAI Service Access Controls and Policies

Azure OpenAI Service provides enterprise-grade access to models like GPT-4, GPT-4o, and others. Governing access to these models requires controls at multiple levels:

**Model access and deployment:**

| Control | Description |
|---|---|
| **Subscription-level access** | Azure OpenAI requires an approved subscription; not all subscriptions have access by default |
| **Resource-level RBAC** | Assign `Cognitive Services OpenAI User` for inference, `Cognitive Services OpenAI Contributor` for deployment management |
| **Model deployment policies** | Control which models can be deployed and in which regions using Azure Policy |
| **API key vs. Microsoft Entra ID auth** | Prefer Microsoft Entra ID authentication over API keys for production workloads |
| **Private endpoints** | Restrict network access to Azure OpenAI resources |

```bicep
// RBAC: Grant a managed identity the OpenAI User role
resource openAiRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(openAiAccount.id, appIdentity.id, 'CognitiveServicesOpenAIUser')
  scope: openAiAccount
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd' // Cognitive Services OpenAI User
    )
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}
```

### Content Safety Filters and Configuration

Azure OpenAI includes built-in content safety filters that screen both prompts (inputs) and completions (outputs):

**Default content filter categories:**

| Category | Description |
|---|---|
| Hate | Content that attacks or discriminates against groups |
| Sexual | Sexually explicit content |
| Violence | Descriptions of physical harm |
| Self-harm | Content about self-injury |
| Jailbreak detection | Attempts to bypass safety filters |
| Protected material | Copyrighted text or code |

**Governance considerations:**

- Content filters are **enabled by default** at medium severity — do not disable them without a documented business justification and compliance review
- Custom content filters can be configured to be more or less restrictive based on use case
- **Blocklists** allow you to prevent specific terms or phrases from appearing in inputs or outputs
- Filter results are logged and can be monitored via Azure Monitor

```json
// Example: Custom content filter configuration
{
  "name": "strict-filter",
  "properties": {
    "basePolicyName": "Microsoft.DefaultV2",
    "contentFilters": [
      { "name": "hate", "severityThreshold": "Low", "blocking": true },
      { "name": "sexual", "severityThreshold": "Low", "blocking": true },
      { "name": "violence", "severityThreshold": "Low", "blocking": true },
      { "name": "selfharm", "severityThreshold": "Low", "blocking": true }
    ],
    "jailbreakDetection": { "blocking": true },
    "protectedMaterialDetection": { "blocking": true }
  }
}
```

### Microsoft Entra ID for AI Agent Identities

As AI agents become more autonomous — making API calls, accessing data, and performing actions on behalf of users — they need proper identities. In 2026, Microsoft introduced **Agent ID** capabilities within Microsoft Entra ID:

- **Workload identity for AI agents** — Assign managed identities to AI agents, enabling fine-grained RBAC for what data and services each agent can access
- **Agent authorization boundaries** — Define what actions an AI agent can perform, with Conditional Access policies that apply to agent identities
- **Audit trail** — All agent actions are logged under the agent's identity, providing a clear audit trail separate from human user activity
- **Token scoping** — Limit the permissions granted to agent tokens, applying the principle of least privilege to AI workloads

### Responsible AI Principles as Governance Mandates

Microsoft's Responsible AI principles provide a framework for governing AI workloads:

| Principle | Governance Implementation |
|---|---|
| **Fairness** | Test models for bias; monitor outputs for discriminatory patterns |
| **Reliability & Safety** | Implement content filters, rate limits, and human-in-the-loop for critical decisions |
| **Privacy & Security** | Use private endpoints, customer-managed keys, and data loss prevention |
| **Inclusiveness** | Ensure AI services are accessible and serve diverse populations |
| **Transparency** | Log all AI interactions; provide explanations for AI-driven decisions |
| **Accountability** | Assign owners to AI workloads; implement access reviews for AI resource access |

### Azure AI Governance Tooling

Azure provides several tools for governing AI workloads:

**Rate limits and quotas:**

- Azure OpenAI enforces **Tokens Per Minute (TPM)** and **Requests Per Minute (RPM)** limits
- Allocate quota across deployments to prevent a single application from consuming all capacity
- Monitor usage against limits to prevent throttling

**Model access policies:**

- Use Azure Policy to restrict which Azure OpenAI models can be deployed
- Enforce that only approved model versions are used in production
- Require specific content filter configurations on all deployments

**Azure API Management as an AI Gateway:**

- Place Azure API Management in front of Azure OpenAI to add centralized governance
- Implement token counting, rate limiting, and cost tracking at the gateway level
- Enable semantic caching to reduce costs and latency
- Log all requests and responses for audit purposes

### Shadow AI Detection

**Shadow AI** refers to the use of unauthorized AI services by employees — using personal ChatGPT accounts, third-party AI tools, or unapproved APIs to process corporate data.

Microsoft Entra ID now provides capabilities to detect and govern shadow AI:

- **App discovery** — Identify when users access unauthorized AI services through Conditional Access and Microsoft Defender for Cloud Apps
- **Data exfiltration detection** — Monitor for sensitive data being sent to external AI services
- **Approved AI catalog** — Publish a catalog of approved AI services and require users to go through sanctioned channels
- **Conditional Access for AI services** — Block or warn when users attempt to access unapproved AI services

---

## Best Practices

1. **Use Microsoft Entra ID authentication, not API keys** — API keys are shared secrets that are easily leaked. Use managed identities for service-to-service and Microsoft Entra ID tokens for user-facing applications.

2. **Never disable content filters without governance approval** — Content filters exist to prevent harmful outputs. Any modification should go through a formal review process.

3. **Implement rate limits before they become a problem** — AI services can generate significant costs. Set TPM/RPM limits at the deployment level and monitor usage.

4. **Treat AI agents as first-class identities** — Give AI agents their own managed identities with least-privilege RBAC. Never run agents under a human user's identity.

5. **Log everything** — AI interactions should be logged for audit, compliance, and debugging. Use diagnostic settings to send Azure OpenAI logs to Log Analytics.

6. **Use Azure API Management as an AI gateway** — Centralize access to AI models through APIM for consistent policy enforcement, logging, and cost tracking.

7. **Address shadow AI proactively** — Publish an approved AI catalog, educate employees, and use Defender for Cloud Apps to detect unauthorized AI usage.

8. **Establish an AI governance board** — Create a cross-functional team (IT, legal, compliance, business) to review AI use cases and approve deployments.

9. **Monitor for model drift and bias** — Regularly evaluate AI outputs for quality, bias, and accuracy. Governance does not stop at deployment.

10. **Plan for regulatory changes** — AI regulations (EU AI Act, NIST AI RMF, and others) are evolving rapidly. Build governance processes that can adapt to new requirements.

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---|---|---|
| Using API keys in source code | Key leakage leads to unauthorized access and cost exposure | Use managed identities and Microsoft Entra ID auth |
| No rate limits on AI deployments | A single runaway application exhausts quota and budget | Set TPM/RPM limits per deployment; implement budgets and alerts |
| Disabling content filters for "flexibility" | Harmful or inappropriate content in production outputs | Keep filters enabled; use custom configurations for specific use cases |
| Ignoring shadow AI | Sensitive corporate data sent to unauthorized AI services | Deploy Defender for Cloud Apps; create an approved AI catalog |
| No audit logging for AI interactions | Cannot demonstrate compliance or investigate incidents | Enable diagnostic settings on all Azure OpenAI resources |
| Treating AI governance as an IT-only concern | Business and legal risks are not addressed | Establish a cross-functional AI governance board |

---

## Code Samples

### Azure Policy — Require Private Endpoints for Azure OpenAI

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.CognitiveServices/accounts"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/kind",
          "equals": "OpenAI"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/publicNetworkAccess",
          "notEquals": "Disabled"
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

### Azure Policy — Restrict Azure OpenAI to Specific Regions

```json
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.CognitiveServices/accounts"
        },
        {
          "field": "Microsoft.CognitiveServices/accounts/kind",
          "equals": "OpenAI"
        },
        {
          "not": {
            "field": "location",
            "in": ["eastus", "eastus2", "westeurope"]
          }
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

### Monitor Azure OpenAI Usage with Log Analytics

```kusto
// Azure OpenAI request volume and token consumption
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.COGNITIVESERVICES"
| where Category == "RequestResponse"
| extend model = tostring(parse_json(properties_s).modelName)
| summarize
    RequestCount = count(),
    TotalTokens = sum(toint(parse_json(properties_s).totalTokens)),
    AvgLatencyMs = avg(DurationMs)
    by bin(TimeGenerated, 1h), model
| order by TimeGenerated desc
```

---

## References

- [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/overview)
- [Azure OpenAI RBAC Roles](https://learn.microsoft.com/azure/ai-services/openai/how-to/role-based-access-control)
- [Content Filtering in Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/concepts/content-filter)
- [Azure API Management as an AI Gateway](https://learn.microsoft.com/azure/api-management/api-management-ai-gateway)
- [Microsoft Responsible AI Principles](https://www.microsoft.com/ai/responsible-ai)
- [Microsoft Entra Workload ID](https://learn.microsoft.com/entra/workload-id/workload-identities-overview)
- [Microsoft Defender for Cloud Apps](https://learn.microsoft.com/defender-cloud-apps/what-is-defender-for-cloud-apps)
- [EU AI Act — Implications for Azure](https://learn.microsoft.com/azure/ai-services/openai/concepts/eu-ai-act)
- [Azure OpenAI Quotas and Limits](https://learn.microsoft.com/azure/ai-services/openai/quotas-limits)

---

| Previous | Next |
|:---|:---|
| [Data Governance with Purview](ch26-data-governance-purview.md) | [Governance Roadmap](../part-8-synthesis/ch28-governance-roadmap.md) |
