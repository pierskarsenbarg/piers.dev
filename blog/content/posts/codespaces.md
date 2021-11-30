---
title: "Codespaces"
date: 2021-05-29T16:42:21Z
tags: 
  - github
  - codespaces
---

One thing I wanted to do when I restarted this blog was to set up [Codespaces](https://github.com/features/codespaces) so that I could write posts from my iPad as well as from my laptop. It was pretty easy to do. Admittedly my container is pretty simple, just installing hugo and git (I've got my theme in a submodule so I need git to checkout that) and my devcontainer.json is pretty empty as well. Annoyingly it's not easy to type on here with the on-screen keyboard, plus I can't type a backtick so I can't do code syntax either. I'll probably update this post later with the code from the container I'm running with the devcontainer.json.

All in all, not a bad experiment though. I'm hoping I can use it as a way to write Pulumi programs and run them from here. I'll write a further post on that at some point.

### Update

Here are my minimal devcontainer.json:

```json
{
  "name": "piers.dev blog",
  "build": {
    "dockerfile": "Dockerfile",
    "args": { "VARIANT": "3.13" }
  },

  "settings": {
    "terminal.integrated.shell.linux": "/bin/ash"
  },

  "extensions": [
    "github.vscode-pull-request-github",
    "eamodio.gitlens",
    "golang.go",
    "eg2.vscode-npm-script",
    "esbenp.prettier-vscode",
    "visualstudioexptteam.vscodeintellicode",
    "redhat.vscode-yaml"
  ],
  "forwardPorts": [1313],

  "postCreateCommand": "git submodule update --init --recursive",

  "remoteUser": "vscode"
}
```

Worth noting in this is the use of `postCreateCommand` - I've not copied and pasted the theme files into my code base. I've added it as a submodule (because I like to live dangerously - YMMV) and Codespaces doesn't handle that properly during the checkout part.

And here's my Dockerfile:

```dockerfile
ARG VARIANT="3.13"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-alpine-${VARIANT}

RUN apk add --no-cache git hugo
```

Only installing what I need: git because of the submodule I commented on earlier and hugo because that's how I'm building this site.
