---
title: "AWS EBS Volumes"
date: 2021-11-30T10:40:00Z
draft: true
---

One of the things that Pulumi makes it really easy to do is to set up AWS EC2 instances. What sometimes comes up in issues or support requests is a question about why that instance keeps being refreshed and it's often down to the way AWS names the EBS devices. 

I'm going to talk about a couple of things here: 1) How to configure your root EBS volume in your EC2 instance and 2) How to add an extra volume whilst making sure that it's correctly named (all using Pulumi of course).

<!--more-->

## Configuring root EBS volumes with Pulumi

Most of the images you would use to bootstrap your EC2 instance nowadays come with an EBS volume attached as your root device. Back in the day, this was a rarity and you had to make do with "instance storage" which meant that if you terminated your instance, anything that was stored on this drive was lost. Then along came EBS volumes and the ability to maintain some form of persistant storage across EC2 instances. Nowadays, you can use AMIs that have multiple EBS volumes attached, but you'll always need one as the root volume to store the OS. 

