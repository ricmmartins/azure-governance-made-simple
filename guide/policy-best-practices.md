## Azure Policy best practices

Ask yourself these 3 questions and work from them when defining your policies

* What drives your need for policy?
   * Regulatory Compliance
   * Controlling cost
   * Standards & Tagging
   * Maintain security and performance consistency
   * Enforce enterprise wide design principles

* Who owns the policy settings?
   * “Initiative" owners
   * Security Architect
   * Cloud Architect
   * Cloud Engineers


* What is involved in defining a new policy or refining an existing one?
   * Research or gather evidence on the impact of a particular configuration on a particular fundamental (like cost or security)
   * What-if analysis of enforcing configuration in a particular manner
   * Assess the current state of compliance to understand the impact of new policy and what exceptions are needed
   * Roll out new policy in phases
   * Understand the applications & teams who are non-compliant
   * Rollout remediation in stages via SafeDeploy practices

These questions need to be asked from time to time as compliance is an evolving thing. You need to adjust your policies according to your current priorities, not only for compliance, but also for different projects that might require more powerful resources deployed that are currently blocked by policy, for example.
