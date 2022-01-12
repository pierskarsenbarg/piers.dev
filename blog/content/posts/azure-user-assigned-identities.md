---
title: "Azure User Assigned Identities"
date: 2022-01-12T11:30:46Z
draft: true
tags:
    - azure
    - pulumi
    - typescript
---

Managed identities are commonly used to ensure that individuals don't need to manage secrets through their own account and therefore don't have to worry about people logging in and getting hold of them. For example, we might assign one to an AKS cluster so that it has access to other Azure services.:

```typescript
import * as resources from "@pulumi/azure-native/resources";
import * as containerservice from "@pulumi/azure-native/containerservice";
import * as managedidentity from "@pulumi/azure-native/managedidentity";

const resourceGroup = new resources.ResourceGroup("resourceGroup");

const clusterIdentity = new managedidentity.UserAssignedIdentity('identity', {
    resourceGroupName: resourceGroup.name
});
```


we'll need to use the `apply()` method (my colleague Lee Briggs has an excellent write up of these which you can read on [his website](https://www.leebriggs.co.uk/blog/2021/05/09/pulumi-apply.html)). 

The other interesting part that specifically applies to Azure in this case is that we need to pass in the ID of the identity as the name of the object rather than the value, which needs to be a string. 