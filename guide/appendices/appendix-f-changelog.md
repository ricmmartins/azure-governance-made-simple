# Appendix F — Changelog

> Last verified: 2026-04-06

---

All notable changes to *Azure Governance Made Simple* are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/) for book editions.

---

## [2.0.0] — 2026-04-06

### Full Book Restructure and Content Revamp

Reorganized the entire book into 8 parts and 30 chapters. Updated all content for April 2026 accuracy.

#### Added

- **Part 7 — At Scale**
  - Chapter 23: Azure Landing Zones (major rewrite from subscription.md landing zone subsection)
  - Chapter 24: Azure Arc — hybrid and multi-cloud governance
  - Chapter 25: Sovereign Landing Zones — data residency and regulatory compliance
  - Chapter 26: Data Governance with Microsoft Purview — data catalog, classification, lineage
  - Chapter 27: AI Governance — Azure OpenAI controls, content safety, shadow AI detection

- **Part 8 — Synthesis**
  - Chapter 28: Governance Roadmap — phased implementation plan (replaces conclusion.md)
  - Chapter 29: Case Studies — three fictional scenarios at Crawl/Walk/Run maturity
  - Chapter 30: FAQ — 20 frequently asked questions about Azure governance

- **Appendices**
  - Appendix A: Glossary — 40+ Azure governance terms
  - Appendix B: Decision Trees — governance tool selection, management group design, policy effect selection
  - Appendix C: Policy Starter Kit — 30 recommended built-in policies with IDs
  - Appendix D: Resource Graph Queries — top 20 governance KQL queries
  - Appendix E: Learning Resources — certifications, Learn paths, community tools
  - Appendix F: Changelog (this file)

#### Changed

- All references to the former identity service name updated to "Microsoft Entra ID"
- All legacy identity abbreviations updated to "Microsoft Entra ID"
- All legacy documentation domain links updated to `learn.microsoft.com`
- Azure Blueprints references replaced with Deployment Stacks guidance
- "Enterprise-Scale" terminology updated to "Azure Landing Zone Accelerator"
- All content reviewed and updated for April 2026 accuracy

#### Deprecated

- Azure Blueprints content removed (service deprecated by Microsoft)
- References to classic identity terminology replaced

#### Removed

- Direct dependency on conclusion.md (replaced by Chapter 28)

---

## [1.0.0] — Original Release

### Initial Publication

- Original Azure governance guide covering:
  - Governance overview and architecture
  - Microsoft Entra ID (identity and access management)
  - RBAC and permissions
  - Subscriptions and landing zones introduction
  - Resource groups, naming, and tagging
  - Azure Policy and best practices
  - Resource locks
  - ARM templates
  - Azure Blueprints (now deprecated)
  - Resource Graph
  - Cost Management
  - Conclusion with tool recommendations

---

## How to Contribute

If you find inaccuracies, outdated information, or have suggestions for improvement:

1. Open an issue on the [GitHub repository](https://github.com/ricmmartins/azure-governance-made-simple)
2. Submit a pull request with your proposed changes
3. Reference the specific chapter and section in your contribution

All contributions are welcome and appreciated.

---

| Previous |
|:---|
| [Appendix E — Learning Resources](appendix-e-learning-resources.md) |
