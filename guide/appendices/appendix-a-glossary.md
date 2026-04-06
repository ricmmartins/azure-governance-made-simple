# Appendix A — Glossary

> Last verified: 2026-04-06

---

A comprehensive glossary of Azure governance terms used throughout this book.

---

**ABAC (Attribute-Based Access Control)**
An authorization system that grants access based on attributes (tags, resource properties, environment) rather than fixed role assignments. Azure RBAC supports ABAC conditions for Azure Storage and other services.

**Access Review**
A scheduled Microsoft Entra ID process where designated reviewers verify that users, groups, or service principals still need their assigned access. Used to enforce the principle of least privilege over time.

**ALZ (Azure Landing Zone)**
A pre-configured Azure environment that follows the Cloud Adoption Framework best practices for governance, security, networking, and identity. Provides a scalable foundation for workload deployment.

**Azure Arc**
A service that extends Azure governance and management to resources running outside of Azure, including on-premises servers, Kubernetes clusters, and resources in other clouds.

**Azure Firewall**
A managed, cloud-based network security service that protects Azure Virtual Network resources. Often deployed in the hub VNet of a hub-and-spoke topology.

**Azure Machine Configuration**
An Azure Policy feature (formerly Guest Configuration) that audits and enforces settings inside virtual machine operating systems. Works with both Azure VMs and Arc-enabled servers.

**Azure Monitor**
A comprehensive monitoring platform that collects, analyzes, and acts on telemetry data from Azure and on-premises resources. Includes Log Analytics, Metrics, Alerts, and Workbooks.

**Azure Policy**
A service for creating, assigning, and managing policies that enforce rules and effects over Azure resources. Policies ensure resources stay compliant with organizational standards.

**Azure Resource Graph**
A service that enables efficient querying of Azure resources at scale using the Kusto Query Language (KQL). Used for inventory, compliance reporting, and governance dashboards.

**Bicep**
A domain-specific language (DSL) for deploying Azure resources declaratively. Bicep is the recommended Infrastructure as Code language for Azure-native deployments.

**CAF (Cloud Adoption Framework)**
Microsoft's comprehensive framework of best practices, documentation, and tools to help organizations adopt the cloud successfully. Includes guidance for governance, security, management, and more.

**Conditional Access**
A Microsoft Entra ID feature that enforces access controls based on conditions such as user location, device compliance, risk level, and application sensitivity.

**CSPM (Cloud Security Posture Management)**
A category of security tools that continuously assess cloud environments for security risks and misconfigurations. Microsoft Defender for Cloud provides CSPM capabilities.

**Deny Assignment**
An Azure RBAC mechanism that blocks specific actions for specific principals, even if a role assignment grants them access. Used internally by Deployment Stacks.

**Deployment Stack**
An Azure Resource Manager resource that manages a group of deployed resources as a single unit. Supports deny settings to prevent out-of-band changes and cleanup of orphaned resources on deletion.

**Diagnostic Settings**
Configuration that routes Azure resource logs and metrics to destinations such as Log Analytics workspaces, Storage Accounts, or Event Hubs.

**Entitlement Management**
A Microsoft Entra ID Identity Governance feature that automates access request workflows, access assignments, reviews, and expiration for groups, applications, and SharePoint sites.

**EPAC (Enterprise Policy as Code)**
An open-source framework for managing Azure Policy at enterprise scale using Git repositories and CI/CD pipelines. Maintained by Microsoft.

**FinOps**
A cloud financial management discipline that brings financial accountability to cloud spending through collaboration between engineering, finance, and business teams.

**Identity Governance**
A Microsoft Entra ID capability that includes Access Reviews, Entitlement Management, PIM, and lifecycle workflows to manage the identity lifecycle and access.

**Initiative (Policy Set)**
A collection of Azure Policy definitions that are assigned together to simplify management and compliance tracking. Also known as a Policy Set Definition.

**KQL (Kusto Query Language)**
The query language used by Azure Resource Graph, Log Analytics, and Azure Data Explorer. Essential for governance reporting and diagnostics.

**Landing Zone**
See ALZ (Azure Landing Zone).

**Management Group**
A container above subscriptions in the Azure resource hierarchy. Provides a way to apply governance conditions (policies, RBAC, budgets) across multiple subscriptions.

**Managed Identity**
An identity in Microsoft Entra ID that is automatically managed by Azure. Eliminates the need to manage credentials. Available as system-assigned (tied to a resource) or user-assigned (independent).

**MCSB (Microsoft Cloud Security Benchmark)**
A set of security best practices and recommendations for Azure, aligned with common compliance frameworks. The default security baseline in Microsoft Defender for Cloud.

**Microsoft Defender for Cloud**
A cloud-native application protection platform (CNAPP) that provides security posture management, workload protection, and compliance assessments for Azure, hybrid, and multi-cloud environments.

**Microsoft Entra ID**
Microsoft's cloud-based identity and access management service. Provides authentication, authorization, Conditional Access, and identity governance.

**Microsoft Purview**
A unified data governance platform for discovering, classifying, and protecting data across on-premises, multi-cloud, and SaaS environments.

**PIM (Privileged Identity Management)**
A Microsoft Entra ID service that provides just-in-time, time-limited, and approval-based access to privileged roles. Reduces the risk of standing administrative access.

**Policy as Code**
The practice of managing Azure Policy definitions, initiatives, and assignments in a Git repository and deploying them through CI/CD pipelines.

**Policy Effect**
The action Azure Policy takes when a policy rule is matched. Effects include Audit, Deny, DeployIfNotExists, Modify, Append, Disabled, and Manual.

**Policy Exemption**
A mechanism to exclude a specific resource, resource group, or subscription from a policy assignment. Exemptions should be temporary and documented.

**RBAC (Role-Based Access Control)**
An authorization system that provides fine-grained access management for Azure resources. Users, groups, and service principals are assigned roles at specific scopes.

**Resource Group**
A logical container for Azure resources that share the same lifecycle. Resources in a group are deployed, updated, and deleted together.

**Resource Lock**
A mechanism that prevents accidental deletion (CanNotDelete) or modification (ReadOnly) of Azure resources. Applied at the resource, resource group, or subscription level.

**Scope**
The level in the Azure hierarchy at which a governance control (policy, RBAC, lock) is applied. Scopes include management group, subscription, resource group, and individual resource.

**Secure Score**
A numerical representation (0–100) of an organization's security posture in Microsoft Defender for Cloud. Higher scores indicate fewer security risks.

**Sensitivity Label**
A classification marker from Microsoft Purview Information Protection that defines the sensitivity of content (e.g., Public, Confidential, Highly Confidential) and applies protection controls.

**Sovereign Cloud**
A physically and/or logically isolated Azure environment designed to meet specific government data sovereignty requirements (e.g., Azure Government, Azure China).

**Subscription**
A logical container for Azure resources that serves as a billing boundary, access control boundary, and scale unit. Each subscription is associated with a single Microsoft Entra ID tenant.

**Subscription Vending**
The automated process of creating and configuring new Azure subscriptions with standardized governance controls (policies, RBAC, networking, tags).

**Tag**
A key-value pair applied to Azure resources and resource groups for organization, cost tracking, and governance. Tags are metadata, not access controls.

**Template Spec**
A resource type for storing an ARM template or Bicep template in Azure for later deployment. Supports versioning and RBAC-controlled access.

**Tenant**
The top-level organizational entity in Microsoft Entra ID. Represents a dedicated instance of Entra ID that an organization receives when it signs up for a Microsoft cloud service.

**Terraform**
An open-source Infrastructure as Code tool by HashiCorp that supports Azure (via the AzureRM provider) and many other cloud platforms.

**Workload Identity Federation**
A mechanism that allows external identity providers (GitHub Actions, Azure DevOps, Kubernetes) to obtain tokens from Microsoft Entra ID without storing secrets. Eliminates the need for client secrets or certificates.

---

| Previous | Next |
|:---|:---|
| [FAQ](../part-8-synthesis/ch30-faq.md) | [Appendix B — Decision Trees](appendix-b-decision-trees.md) |
