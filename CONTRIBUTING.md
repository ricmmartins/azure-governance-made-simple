# Contributing to Azure Governance Made Simple

Thank you for your interest in contributing to this project! This guide will help you get started.

## Content Rules

### Terminology Standards

| ❌ Do Not Use | ✅ Use Instead |
|--------------|---------------|
| Azure Active Directory / AAD | Microsoft Entra ID |
| Azure AD Connect | Microsoft Entra Connect / Microsoft Entra Cloud Sync |
| Azure Security Center | Microsoft Defender for Cloud |
| Azure Blueprints (without deprecation note) | Deployment Stacks |
| ARM Templates (as recommended approach) | Bicep (primary); ARM JSON (legacy reference only) |
| Guest Configuration / VM Guest Policy | Azure Machine Configuration |
| docs.microsoft.com | learn.microsoft.com |

### Authorship

- **NEVER add Copilot or any AI assistant as a co-author** in commit messages. All commits must attribute authorship exclusively to human contributors.

### Editorial Voice

- **Tone:** Authoritative but approachable — like a senior cloud architect mentoring a team.
- **Person:** Use "you" for instructions. Use "we recommend" for best practices.
- **Links:** Use descriptive link text (never "click here"). Always use the `learn.microsoft.com` domain for Microsoft documentation.

### Chapter Structure

Every chapter should follow this structure:

```
## [Chapter Title]

*Last verified: YYYY-MM-DD*

### Overview
### How It Works
### Best Practices
### Common Pitfalls
### Code Samples
### Hands-On Exercise (where applicable)
### References
```

### Code Samples

- Use fenced code blocks with language identifiers: `bicep`, `json`, `powershell`, `bash`, `kusto`
- Provide working, copy-pasteable examples
- Prefer Bicep over ARM JSON for new IaC content

## How to Contribute

1. **Fork** the repository
2. **Create a branch** for your changes (`git checkout -b improve/chapter-name`)
3. **Make your changes** following the content rules above
4. **Update the "Last verified" date** on any chapter you modify
5. **Add a changelog entry** in `guide/appendices/appendix-f-changelog.md`
6. **Submit a pull request** with a clear description of your changes

## Reporting Issues

If you find outdated content, broken links, or inaccuracies, please [open an issue](https://github.com/ricmmartins/azure-governance-made-simple/issues/new) with:

- The chapter and section affected
- What is incorrect
- What the correct information should be (with a reference link if possible)

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.
