## ARM Templates

![arm-template](../images/arm-template.png)

Azure Resource Manager Templates are JSON files used to automate the deployment of Azure environments using infrastructure as code. With the use of infrastructure as code, the code repository for your project's applications now also has the way to deploy all the infrastructure required by your application in a coded, repeatable and versioned manner in the same way as the applications themselves.

Through ARM Templates, you automate the entire deployment of your environment, from the creation of the network, storage, virtual machines, installation of dependencies to the deployment of the application itself in an orchestrated way.

If you are interested in knowing more about ARM Templates and how to use them, access the documentation available at [https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/overview](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/overview). We currently have about 1000 templates ready and available for use in Azure Quickstart Templates, check out [https://azure.microsoft.com/en-us/resources/templates/](https://azure.microsoft.com/en-us/resources/templates/) 

Recently we've introduced a new language for developing ARM templates. The language is named Bicep, and is currently in preview. Bicep and JSON templates offer the same capabilities. You can convert template between the two languages. Bicep provides a syntax that is easier to use for creating templates. For more information, see [What is Bicep (Preview)](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/bicep-overview)

In ither hand, if you are more familiar with opensource tools like Terraform to automte deployments on your IaC strategy, you can find a lot of useful resources here: [https://docs.microsoft.com/en-us/azure/developer/terraform/](https://docs.microsoft.com/en-us/azure/developer/terraform/)

### Pro tip!

✔️ [Deploy and manage resources in Azure by using ARM templates](https://docs.microsoft.com/en-us/learn/paths/deploy-manage-resource-manager-templates/)

---

Previous| Next | 
:----- |:-----
[Governance suggested policies](/guide/governance-policies.md)| [Azure Blueprints](/guide/blueprints.md)
