---
title: "AWS EBS Volumes"
date: 2021-11-30T10:40:00Z
tags: 
  - aws
  - ec2
  - pulumi
---

One of the things that Pulumi makes it really easy to do is to set up AWS EC2 instances. What sometimes comes up in issues or support requests is a question about why that instance keeps being refreshed and it's often down to the way AWS names the EBS devices. 

I'm going to talk about a couple of things here: 1) How to configure your root EBS volume in your EC2 instance and 2) How to add an extra volume whilst making sure that it's correctly named (all using Pulumi of course).

<!--more-->

Most of the images you would use to bootstrap your EC2 instance nowadays come with an EBS volume attached as your root device. Back in the day, this was a rarity and you had to make do with "instance storage" which meant that if you terminated your instance, anything that was stored on this drive was lost. Then along came EBS volumes and the ability to maintain some form of persistant storage across EC2 instances. Nowadays, you can use AMIs that have multiple EBS volumes attached, but you'll always need one as the root volume to store the OS plus other configuration.

One mistake that people make is adding an extra EBS volume but giving it the same name as the root volume. The main reason for this is that historically, the root volume device name was always the same: `/dev/sda1` and people will give the extra volumes the same name, like this:

```typescript
const ebsVolume = new aws.ebs.Volume("myvolume", {
    size: 40,
    availabilityZone: "eu-west-1"
});

const web = new aws.ec2.Instance("web", {
    ami: "ami-123456abcdef",
    availabilityZone: "eu-west-1",
    instanceType: "t2.micro",
    ebsBlockDevices: [{
        deviceName: "/dev/sda1",
        volumeSize: 40
    }]
});
```

Now in this case, the root device name `ami-123456abcdef` (not a real AMI id, probably) has the root device name set to `/dev/sda1`, so when you run `pulumi up` for the first time, AWS will set it to be something different. Which means that when you run `pulumi up` in the future, Pulumi will detect the change and suggest that you need to replace the entire instance. 

If you set the `deviceName` input to be something else such as `/dev/sda2` then you'll be fine. There's a page in the AWS docs that gives more information about [available device names](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/device_naming.html#available-ec2-device-names).

The other mistake people make is thinking that by naming the device `/dev/sda1`, you're telling AWS to set this EBS volume to be the root volume. This isn't the case. If you want to alter the size or some other configuration of the root volume, there's another input to do that:

```typescript
const web = new aws.ec2.Instance("web", {
    ami: "ami-123456abcdef",
    availabilityZone: "eu-west-1",
    instanceType: "t2.micro",
    rootBlockDevice: [{
        volumeSize: 40
    }]
});
```

In this case, we're using the `rootBlockDevice` input to set the volume size. You can check out the [Pulumi docs](https://www.pulumi.com/registry/packages/aws/api-docs/ec2/instance/#rootblockdevice_nodejs) to see the entire list of options that you can use to configure this.

So to summarise: make sure you know in advance what the default name of the root volume device is, and make sure you're configuring the root volume correctly rather than assuming that because you've given the EBS volume the same name as the root volume you're overwriting the config - you're probably not.
