## Management Groups

In terms of the best practices of setting up governance in your environment structuring your hierarchy and organizing your resources is the first critical step.

Everything you do, from setting RBAC rules to resources, to Azure Policy to Blueprint, all of these things hang on to the hierarchy and the first benefit of Management Group is inheritance. So whatever you apply at the top will be inherited down to the lowest level of your structure.

Let's say a SOC team applies a set of security controls at the top to protect the entire environment. The problem today is that subscription owners can remove any control at the subscription level, and you often make development teams owners of the subscription just because they need that flexibility. With Management Groups this problem does not occur, as owners will not be able to remove inherited permissions from the top level.

![management-group-1](../images/management-group-1.png)

![management-group-2](../images/management-group-2.png)



