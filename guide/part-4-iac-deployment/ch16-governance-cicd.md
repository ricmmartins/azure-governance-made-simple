# Chapter 16 — Governance CI/CD

> Last verified: 2026-04-06

---

## Overview

Governance that exists only as documentation or portal configurations is fragile. It drifts, it's inconsistent, and it doesn't scale. **Governance CI/CD** applies software engineering practices — version control, automated testing, peer review, and continuous deployment — to governance artifacts like Bicep templates, policy definitions, and RBAC assignments.

Why governance needs CI/CD:

- **Consistency** — every environment receives the same governance baseline
- **Auditability** — all changes are tracked in source control with approvals
- **Speed** — new subscriptions can be governed in minutes, not days
- **Safety** — What-If previews and approval gates prevent accidental damage
- **Drift prevention** — scheduled pipeline runs detect and correct configuration drift

---

## How It Works

### IaC Deployment Pipelines with Approval Gates

A governance deployment pipeline typically follows this flow:

![CI/CD Governance Pipeline](/images/cicd-governance-pipeline.svg)

**Stage 1: Lint & Test**
- Bicep linter validates templates
- Unit tests check parameter constraints and resource configurations
- Schema validation ensures required tags and naming conventions

**Stage 2: What-If Preview**
- `az deployment sub what-if` previews all changes
- The output is posted as a pull request comment for human review

**Stage 3: Approval Gate**
- Required reviewers approve or reject the deployment
- GitHub Environments with protection rules enforce this

**Stage 4: Deploy**
- `az deployment sub create` or `az stack sub create` applies the changes
- Post-deployment validation confirms resources are in the expected state

### Policy as Code with EPAC

The **Enterprise Policy as Code (EPAC)** framework automates the lifecycle of Azure Policy definitions, assignments, and exemptions through CI/CD. EPAC uses a declarative JSON/CSV-based configuration stored in source control.

EPAC workflow:

1. **Define** — policy definitions, initiatives, and assignments are declared in JSON files
2. **Plan** — EPAC computes the desired state vs. current state and generates a deployment plan
3. **Deploy** — the plan is applied, creating, updating, or deleting policy resources
4. **Exempt** — policy exemptions are managed as code alongside definitions

Key EPAC concepts:

- **Global settings** — define management group hierarchy, default locations, and scope
- **Policy definitions** — custom policy rules stored as JSON
- **Policy set definitions (initiatives)** — groups of policies assigned together
- **Policy assignments** — bind definitions/initiatives to scopes with parameters
- **Exemptions** — time-bound exceptions tracked in source control

See: [EPAC on GitHub](https://github.com/Azure/enterprise-azure-policy-as-code)

### Drift Detection and Remediation

Governance drift occurs when the actual state of resources diverges from the desired state. Common causes:

- Manual portal changes
- Emergency fixes that bypass pipelines
- RBAC changes made outside of IaC

**Detection strategies:**

| Strategy | Tool | Frequency |
|----------|------|-----------|
| Scheduled What-If | Azure CLI in CI/CD | Daily or weekly |
| Policy compliance scan | Azure Policy | Continuous (built-in) |
| Resource Graph queries | Azure Resource Graph | On-demand or scheduled |
| Deployment Stack drift | `az stack sub show` | On-demand |

**Remediation approaches:**

- **Automatic remediation** — re-run the deployment pipeline to overwrite manual changes
- **Policy remediation tasks** — Azure Policy can auto-remediate non-compliant resources via `deployIfNotExists` and `modify` effects
- **Alert-based remediation** — Activity Log alerts trigger Logic Apps or Azure Functions to correct drift

### Environment Promotion

Governance configurations should follow the same promotion path as application code:

![Environment Promotion Flow](/images/env-promotion-flow.svg)

| Stage | Purpose | Approval |
|-------|---------|----------|
| **dev** | Validate templates compile and lint | Automatic |
| **staging** | What-If against a staging subscription; integration testing | Team lead approval |
| **production** | Deploy to production management group/subscriptions | Governance board approval |

Use separate parameter files for each environment:

![Bicep Parameter Structure](/images/bicep-param-structure.svg)

---

## Best Practices

1. **Store all governance artifacts in source control** — policies, RBAC, Bicep templates, and parameter files
2. **Require pull request reviews for governance changes** — enforce branch protection rules
3. **Use What-If in every pipeline** — never deploy governance changes without previewing them
4. **Separate concerns** — use different pipelines for infrastructure, policy, and RBAC
5. **Use GitHub Environments** — configure protection rules, required reviewers, and deployment secrets per environment
6. **Schedule drift detection** — run What-If on a cron schedule to detect manual changes
7. **Use workload identity federation** — authenticate pipelines to Azure using OIDC, not client secrets
8. **Implement least privilege for pipeline identities** — the service principal should only have the permissions needed for governance deployment
9. **Tag deployments** — include pipeline run ID, commit SHA, and deployer in resource tags for traceability
10. **Monitor pipeline health** — alert on pipeline failures to prevent governance gaps

---

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|------------|
| Using long-lived client secrets | Security risk if secrets are compromised | Use workload identity federation (OIDC) |
| No approval gates on production | Accidental production changes | Configure required reviewers on GitHub Environments |
| Skipping What-If | Unexpected resource deletions | Make What-If a mandatory pipeline step |
| Monolithic pipeline | Slow, fragile, hard to debug | Separate infrastructure, policy, and RBAC pipelines |
| Not handling pipeline failures | Governance drift accumulates | Alert on failures; auto-retry transient errors |
| Manual drift fixes | Fixes not captured in code | Always fix drift by updating IaC, not the portal |

---

## Code Samples

### GitHub Actions Workflow: Bicep Deployment with What-If

This workflow deploys a governance baseline using Bicep, with linting, What-If preview, manual approval, and deployment stages.

```yaml
# .github/workflows/governance-deploy.yml
name: Governance Baseline Deployment

on:
  push:
    branches: [main]
    paths:
      - 'infra/**'
  pull_request:
    branches: [main]
    paths:
      - 'infra/**'
  workflow_dispatch:

permissions:
  id-token: write   # Required for OIDC authentication
  contents: read
  pull-requests: write  # Required for posting What-If comments

env:
  AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  LOCATION: eastus

jobs:
  lint:
    name: Lint Bicep Templates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Bicep CLI
        run: az bicep install

      - name: Lint Bicep files
        run: az bicep build --file infra/main.bicep --stdout > /dev/null

  what-if:
    name: What-If Preview
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ env.AZURE_SUBSCRIPTION_ID }}

      - name: Run What-If
        id: whatif
        run: |
          result=$(az deployment sub what-if \
            --location ${{ env.LOCATION }} \
            --template-file infra/main.bicep \
            --parameters infra/parameters/production.bicepparam \
            --no-pretty-print 2>&1)
          echo "## What-If Results" > whatif-output.md
          echo '```' >> whatif-output.md
          echo "$result" >> whatif-output.md
          echo '```' >> whatif-output.md

      - name: Post What-If as PR Comment
        if: github.event_name == 'pull_request'
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          path: whatif-output.md

  deploy:
    name: Deploy Governance Baseline
    needs: what-if
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ env.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy as Deployment Stack
        run: |
          az stack sub create \
            --name 'governance-baseline' \
            --location ${{ env.LOCATION }} \
            --template-file infra/main.bicep \
            --parameters infra/parameters/production.bicepparam \
            --deny-settings-mode DenyWriteAndDelete \
            --deny-settings-excluded-principals '${{ secrets.BREAK_GLASS_OBJECT_ID }}' \
            --action-on-unmanage deleteResources \
            --yes

      - name: Verify Deployment
        run: |
          az stack sub show \
            --name 'governance-baseline' \
            --query '{Status: provisioningState, Resources: length(resources)}' \
            --output table
```

### GitHub Actions Workflow: Scheduled Drift Detection

```yaml
# .github/workflows/drift-detection.yml
name: Governance Drift Detection

on:
  schedule:
    - cron: '0 6 * * 1-5'  # Weekdays at 6:00 UTC
  workflow_dispatch:

permissions:
  id-token: write
  contents: read
  issues: write

jobs:
  detect-drift:
    name: Check for Governance Drift
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login (OIDC)
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Run What-If for Drift Detection
        id: drift
        run: |
          result=$(az deployment sub what-if \
            --location eastus \
            --template-file infra/main.bicep \
            --parameters infra/parameters/production.bicepparam \
            --no-pretty-print 2>&1)

          if echo "$result" | grep -q "Modify\|Delete\|Create"; then
            echo "drift_detected=true" >> "$GITHUB_OUTPUT"
            echo "$result" > drift-report.txt
          else
            echo "drift_detected=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Create Issue for Drift
        if: steps.drift.outputs.drift_detected == 'true'
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: '⚠️ Governance Drift Detected'
          content-filepath: drift-report.txt
          labels: governance,drift
```

---

## References

- [Bicep CI/CD with GitHub Actions](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-github-actions)
- [Azure deployment What-If operation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if)
- [GitHub Actions for Azure](https://learn.microsoft.com/en-us/azure/developer/github/github-actions)
- [Workload identity federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
- [GitHub Environments and protection rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Enterprise Policy as Code (EPAC)](https://github.com/Azure/enterprise-azure-policy-as-code)
- [Azure Policy as Code workflow](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/policy-as-code)
- [Deployment Stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks)

---

| Previous | Next |
|:---------|:-----|
| [Template Specs](ch15-template-specs.md) | [Cost Management](../part-5-cost-finops/ch17-cost-management.md) |
