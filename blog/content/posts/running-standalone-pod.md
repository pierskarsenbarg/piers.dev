---
title: "Running a Standalone Pod in Kubernetes"
date: 2021-09-10T11:16:46+01:00
draft: false
tags:
  - kubernetes
---

I've been investigating running ingress controllers on Kubernetes recently, especially ones on a private IP address so that I can set up a public load balancer in front and control access that way. Testing that the controller from the internet without any access into the network proved to be an interesting challenge.

<!--more-->

Obviously one way is to create a new deployment with some image that I could then run `kubectl exec` into and get access that way. What I didn't know, was that instead of actually creating a deployment that I would have to delete afterwards, I could use `kubectl run` instead, passing in similar arguments to when you want to shell into a docker container.

I found in my usual goto Kubernetes help doc, the [Kubernetes Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) (if you don't have this bookmarked you should) that using `kubectl run` you could start a container with the image of your choice and then run whatever commands you wanted to, then when you left it, the pod would be deleted. Like it was never there.

{{< figure src="https://media.giphy.com/media/3o84U6421OOWegpQhq/giphy.gif?cid=ecf05e47gnj3b3g0iqb3pr84ad7ww92fful8yg7via5aj2y8&rid=giphy.gif&ct=g" >}}

So what's this magic command?

```bash
kubectl run -it --rm {pod name} --image={image name} --namespace {namespace to run pod in}
```

So if you wanted to run a pod called `ingress-test` with an image called `debian` in a namespace called `ingress` you'd run the following command:

```bash
kubectl run -it --rm ingress-test --image=debian -n ingress
```

and then you have a Debian shell, in the appropriate namespace that will be deleted by the cluster when you're done.
