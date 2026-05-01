# Apêndice A — Glossário

> Last verified: 2026-04-06

---

Um glossário abrangente de termos de governança Azure utilizados ao longo deste livro.

---

**ABAC (Attribute-Based Access Control)**
Um sistema de autorização que concede acesso baseado em atributos (tags, propriedades de recursos, ambiente) em vez de atribuições fixas de roles. O Azure RBAC suporta condições ABAC para Azure Storage e outros serviços.

**Access Review**
Um processo agendado do Microsoft Entra ID onde revisores designados verificam se usuários, grupos ou service principals ainda precisam do acesso atribuído. Usado para aplicar o princípio de menor privilégio ao longo do tempo.

**ALZ (Azure Landing Zone)**
Um ambiente Azure pré-configurado que segue as melhores práticas do Cloud Adoption Framework para governança, segurança, rede e identidade. Fornece uma fundação escalável para implantação de workloads.

**Azure Arc**
Um serviço que estende a governança e o gerenciamento do Azure para recursos executando fora do Azure, incluindo servidores on-premises, clusters Kubernetes e recursos em outras clouds.

**Azure Firewall**
Um serviço gerenciado de segurança de rede baseado em cloud que protege recursos do Azure Virtual Network. Frequentemente implantado na VNet hub de uma topologia hub-and-spoke.

**Azure Machine Configuration**
Um recurso do Azure Policy (anteriormente Guest Configuration) que audita e aplica configurações dentro dos sistemas operacionais de máquinas virtuais. Funciona tanto com VMs Azure quanto com servidores Arc-enabled.

**Azure Monitor**
Uma plataforma abrangente de monitoramento que coleta, analisa e atua sobre dados de telemetria de recursos Azure e on-premises. Inclui Log Analytics, Metrics, Alerts e Workbooks.

**Azure Policy**
Um serviço para criar, atribuir e gerenciar políticas que aplicam regras e efeitos sobre recursos Azure. Políticas garantem que recursos permaneçam em conformidade com padrões organizacionais.

**Azure Resource Graph**
Um serviço que permite consultas eficientes de recursos Azure em escala usando Kusto Query Language (KQL). Usado para inventário, relatórios de conformidade e dashboards de governança.

**Bicep**
Uma linguagem de domínio específico (DSL) para implantar recursos Azure de forma declarativa. Bicep é a linguagem de Infrastructure as Code recomendada para deployments Azure-native.

**CAF (Cloud Adoption Framework)**
O framework abrangente de melhores práticas, documentação e ferramentas da Microsoft para ajudar organizações a adotar a cloud com sucesso. Inclui orientações para governança, segurança, gerenciamento e mais.

**Conditional Access**
Um recurso do Microsoft Entra ID que aplica controles de acesso baseados em condições como localização do usuário, conformidade do dispositivo, nível de risco e sensibilidade da aplicação.

**CSPM (Cloud Security Posture Management)**
Uma categoria de ferramentas de segurança que avaliam continuamente ambientes cloud para riscos e configurações incorretas de segurança. Microsoft Defender for Cloud fornece capacidades de CSPM.

**Deny Assignment**
Um mecanismo do Azure RBAC que bloqueia ações específicas para principals específicos, mesmo que uma atribuição de role conceda acesso. Usado internamente por Deployment Stacks.

**Deployment Stack**
Um recurso do Azure Resource Manager que gerencia um grupo de recursos implantados como uma única unidade. Suporta deny settings para prevenir alterações fora de banda e limpeza de recursos órfãos ao excluir.

**Diagnostic Settings**
Configuração que direciona logs e métricas de recursos Azure para destinos como workspaces do Log Analytics, Storage Accounts ou Event Hubs.

**Entitlement Management**
Um recurso do Microsoft Entra ID Identity Governance que automatiza workflows de solicitação de acesso, atribuições, revisões e expiração para grupos, aplicações e sites SharePoint.

**EPAC (Enterprise Policy as Code)**
Um framework open-source para gerenciar Azure Policy em escala enterprise usando repositórios Git e pipelines CI/CD. Mantido pela Microsoft.

**FinOps**
Uma disciplina de gerenciamento financeiro cloud que traz responsabilidade financeira para gastos em cloud através da colaboração entre equipes de engenharia, finanças e negócios.

**Identity Governance**
Uma capacidade do Microsoft Entra ID que inclui Access Reviews, Entitlement Management, PIM e workflows de ciclo de vida para gerenciar o ciclo de vida de identidades e acesso.

**Initiative (Policy Set)**
Uma coleção de definições de Azure Policy que são atribuídas juntas para simplificar o gerenciamento e monitoramento de conformidade. Também conhecida como Policy Set Definition.

**KQL (Kusto Query Language)**
A linguagem de consulta usada pelo Azure Resource Graph, Log Analytics e Azure Data Explorer. Essencial para relatórios de governança e diagnósticos.

**Landing Zone**
Veja ALZ (Azure Landing Zone).

**Management Group**
Um contêiner acima das subscriptions na hierarquia de recursos Azure. Fornece uma forma de aplicar condições de governança (políticas, RBAC, budgets) em múltiplas subscriptions.

**Managed Identity**
Uma identidade no Microsoft Entra ID que é automaticamente gerenciada pelo Azure. Elimina a necessidade de gerenciar credenciais. Disponível como system-assigned (vinculada a um recurso) ou user-assigned (independente).

**MCSB (Microsoft Cloud Security Benchmark)**
Um conjunto de melhores práticas e recomendações de segurança para Azure, alinhado com frameworks de conformidade comuns. A baseline de segurança padrão no Microsoft Defender for Cloud.

**Microsoft Defender for Cloud**
Uma plataforma de proteção de aplicações cloud-native (CNAPP) que fornece gerenciamento de postura de segurança, proteção de workloads e avaliações de conformidade para ambientes Azure, híbridos e multi-cloud.

**Microsoft Entra ID**
O serviço de gerenciamento de identidade e acesso baseado em cloud da Microsoft. Fornece autenticação, autorização, Conditional Access e governança de identidade.

**Microsoft Purview**
Uma plataforma unificada de governança de dados para descobrir, classificar e proteger dados em ambientes on-premises, multi-cloud e SaaS.

**PIM (Privileged Identity Management)**
Um serviço do Microsoft Entra ID que fornece acesso just-in-time, limitado no tempo e baseado em aprovação para roles privilegiados. Reduz o risco de acesso administrativo permanente.

**Policy as Code**
A prática de gerenciar definições, initiatives e atribuições de Azure Policy em um repositório Git e implantá-las através de pipelines CI/CD.

**Policy Effect**
A ação que o Azure Policy executa quando uma regra de política é correspondida. Efeitos incluem Audit, Deny, DeployIfNotExists, Modify, Append, Disabled e Manual.

**Policy Exemption**
Um mecanismo para excluir um recurso específico, resource group ou subscription de uma atribuição de política. Exemptions devem ser temporárias e documentadas.

**RBAC (Role-Based Access Control)**
Um sistema de autorização que fornece gerenciamento de acesso granular para recursos Azure. Usuários, grupos e service principals recebem roles em escopos específicos.

**Resource Group**
Um contêiner lógico para recursos Azure que compartilham o mesmo ciclo de vida. Recursos em um grupo são implantados, atualizados e excluídos juntos.

**Resource Lock**
Um mecanismo que previne exclusão acidental (CanNotDelete) ou modificação (ReadOnly) de recursos Azure. Aplicado no nível de recurso, resource group ou subscription.

**Scope**
O nível na hierarquia Azure no qual um controle de governança (política, RBAC, lock) é aplicado. Escopos incluem management group, subscription, resource group e recurso individual.

**Secure Score**
Uma representação numérica (0–100) da postura de segurança de uma organização no Microsoft Defender for Cloud. Scores mais altos indicam menos riscos de segurança.

**Sensitivity Label**
Um marcador de classificação do Microsoft Purview Information Protection que define a sensibilidade do conteúdo (ex.: Público, Confidencial, Altamente Confidencial) e aplica controles de proteção.

**Sovereign Cloud**
Um ambiente Azure física e/ou logicamente isolado, projetado para atender requisitos específicos de soberania de dados governamentais (ex.: Azure Government, Azure China).

**Subscription**
Um contêiner lógico para recursos Azure que serve como limite de cobrança, limite de controle de acesso e unidade de escala. Cada subscription é associada a um único tenant Microsoft Entra ID.

**Subscription Vending**
O processo automatizado de criar e configurar novas subscriptions Azure com controles de governança padronizados (políticas, RBAC, rede, tags).

**Tag**
Um par chave-valor aplicado a recursos Azure e resource groups para organização, monitoramento de custos e governança. Tags são metadados, não controles de acesso.

**Template Spec**
Um tipo de recurso para armazenar um template ARM ou Bicep no Azure para deployment posterior. Suporta versionamento e acesso controlado por RBAC.

**Tenant**
A entidade organizacional de nível superior no Microsoft Entra ID. Representa uma instância dedicada do Entra ID que uma organização recebe ao se inscrever em um serviço cloud da Microsoft.

**Terraform**
Uma ferramenta open-source de Infrastructure as Code da HashiCorp que suporta Azure (via provider AzureRM) e muitas outras plataformas cloud.

**Workload Identity Federation**
Um mecanismo que permite que provedores de identidade externos (GitHub Actions, Azure DevOps, Kubernetes) obtenham tokens do Microsoft Entra ID sem armazenar segredos. Elimina a necessidade de client secrets ou certificados.

---

| Anterior | Próximo |
|:---|:---|
| [FAQ](../part-8-synthesis/ch30-faq.md) | [Apêndice B — Árvores de Decisão](appendix-b-decision-trees.md) |
