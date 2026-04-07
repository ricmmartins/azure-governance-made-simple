import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Azure Governance Made Simple',
  description: 'The comprehensive, open-source reference guide to Azure Governance — from foundations to enterprise scale.',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/azure_governance.png' }]
  ],

  themeConfig: {
    logo: '/images/azure_governance.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start Reading', link: '/guide/part-1-foundations/ch01-why-governance-matters' },
      {
        text: 'Quick Links',
        items: [
          { text: 'Policy Starter Kit', link: '/guide/appendices/appendix-c-policy-starter-kit' },
          { text: 'Resource Graph Queries', link: '/guide/appendices/appendix-d-resource-graph-queries' },
          { text: 'Decision Trees', link: '/guide/appendices/appendix-b-decision-trees' },
          { text: 'Glossary', link: '/guide/appendices/appendix-a-glossary' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Part I — Foundations',
        collapsed: false,
        items: [
          { text: '1. Why Cloud Governance Matters', link: '/guide/part-1-foundations/ch01-why-governance-matters' },
          { text: '2. Governance at a Glance', link: '/guide/part-1-foundations/ch02-governance-at-a-glance' },
          { text: '3. Governance Maturity Model', link: '/guide/part-1-foundations/ch03-governance-maturity-model' },
          { text: '4. The Azure Resource Hierarchy', link: '/guide/part-1-foundations/ch04-resource-hierarchy' },
          { text: '5. Naming & Tagging Strategy', link: '/guide/part-1-foundations/ch05-naming-tagging-strategy' }
        ]
      },
      {
        text: 'Part II — Identity & Access',
        collapsed: false,
        items: [
          { text: '6. Role-Based Access Control', link: '/guide/part-2-identity-access/ch06-rbac' },
          { text: '7. Microsoft Entra ID Governance', link: '/guide/part-2-identity-access/ch07-entra-id-governance' },
          { text: '8. Managed Identities & Workload Identity', link: '/guide/part-2-identity-access/ch08-managed-identities' }
        ]
      },
      {
        text: 'Part III — Policy & Compliance',
        collapsed: false,
        items: [
          { text: '9. Azure Policy', link: '/guide/part-3-policy-compliance/ch09-azure-policy' },
          { text: '10. Regulatory Compliance & MCSB', link: '/guide/part-3-policy-compliance/ch10-regulatory-compliance' },
          { text: '11. Microsoft Defender for Cloud', link: '/guide/part-3-policy-compliance/ch11-defender-for-cloud' },
          { text: '12. Resource Locks', link: '/guide/part-3-policy-compliance/ch12-resource-locks' }
        ]
      },
      {
        text: 'Part IV — IaC & Deployment',
        collapsed: false,
        items: [
          { text: '13. Bicep & Azure Verified Modules', link: '/guide/part-4-iac-deployment/ch13-bicep-avm' },
          { text: '14. Deployment Stacks', link: '/guide/part-4-iac-deployment/ch14-deployment-stacks' },
          { text: '15. Template Specs', link: '/guide/part-4-iac-deployment/ch15-template-specs' },
          { text: '16. Governance CI/CD', link: '/guide/part-4-iac-deployment/ch16-governance-cicd' }
        ]
      },
      {
        text: 'Part V — Cost & FinOps',
        collapsed: false,
        items: [
          { text: '17. Cost Management', link: '/guide/part-5-cost-finops/ch17-cost-management' },
          { text: '18. FinOps', link: '/guide/part-5-cost-finops/ch18-finops' },
          { text: '19. Cost Automation', link: '/guide/part-5-cost-finops/ch19-cost-automation' }
        ]
      },
      {
        text: 'Part VI — Observability',
        collapsed: false,
        items: [
          { text: '20. Azure Monitor for Governance', link: '/guide/part-6-observability/ch20-azure-monitor' },
          { text: '21. Azure Resource Graph', link: '/guide/part-6-observability/ch21-resource-graph' },
          { text: '22. AzGovViz', link: '/guide/part-6-observability/ch22-azgovviz' }
        ]
      },
      {
        text: 'Part VII — At Scale',
        collapsed: false,
        items: [
          { text: '23. Azure Landing Zones', link: '/guide/part-7-at-scale/ch23-azure-landing-zones' },
          { text: '24. Azure Arc', link: '/guide/part-7-at-scale/ch24-azure-arc' },
          { text: '25. Sovereign Landing Zones', link: '/guide/part-7-at-scale/ch25-sovereign-landing-zones' },
          { text: '26. Data Governance with Purview', link: '/guide/part-7-at-scale/ch26-data-governance-purview' },
          { text: '27. AI Governance', link: '/guide/part-7-at-scale/ch27-ai-governance' }
        ]
      },
      {
        text: 'Part VIII — Synthesis',
        collapsed: false,
        items: [
          { text: '28. Governance Roadmap', link: '/guide/part-8-synthesis/ch28-governance-roadmap' },
          { text: '29. Case Studies', link: '/guide/part-8-synthesis/ch29-case-studies' },
          { text: '30. FAQ', link: '/guide/part-8-synthesis/ch30-faq' }
        ]
      },
      {
        text: 'Appendices',
        collapsed: true,
        items: [
          { text: 'A — Glossary', link: '/guide/appendices/appendix-a-glossary' },
          { text: 'B — Decision Trees', link: '/guide/appendices/appendix-b-decision-trees' },
          { text: 'C — Policy Starter Kit', link: '/guide/appendices/appendix-c-policy-starter-kit' },
          { text: 'D — Resource Graph Queries', link: '/guide/appendices/appendix-d-resource-graph-queries' },
          { text: 'E — Learning Resources', link: '/guide/appendices/appendix-e-learning-resources' },
          { text: 'F — Changelog', link: '/guide/appendices/appendix-f-changelog' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ricmmartins/azure-governance-made-simple' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ricmmartins/azure-governance-made-simple/edit/main/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the GPL-3.0 License.',
      copyright: '© Ricardo Martins'
    },

    outline: {
      level: [2, 3]
    }
  }
})
