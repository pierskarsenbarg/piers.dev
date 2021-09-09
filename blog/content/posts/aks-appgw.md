---
title: "Deploying AKS and App Gateway with Ingress to Azure"
date: 2021-09-08T15:37:53+01:00
draft: true
tags:
  - azure
  - appgateway
  - pulumi
---

I had a project at [work](https://pulumi.com) recently that required deploying and running Azure's Application Gateway as an ingress controller to an AKS cluster. There are quite a few different ways of doing this, and the documentation for most of these use a combination of Helm and Azure CLI. This means that it's a little difficult to automate, especially if you're using infrastructure as code as a rule, be it Terraform, ARM or Pulumi. Hopefully this will be useful for someone in the future.

<!--more-->

## Background

App Gateway is a relatively new resource within Azure ecosystem, giving the ability to add a web traffic load balancer to your environment. It seems a lot more complicated to set upt than, say, an Application Load Balancer on AWS.
