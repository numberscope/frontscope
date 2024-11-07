# Contributing to Numberscope

## If you are new to software development...

Read our [onboarding doc](./doc/onboarding.md).

## If you are experienced, follow these steps...

(This assumes you're working on the numberscope/frontscope repository, but it
applies to other repos as well. If you are unfamiliear with basic git
operations or would like a refresher, we
[have a guide](doc/working-with-git-and-github.md#basic-operations).)

1. [Clone the numberscope/frontscope repository](doc/working-with-git-and-github.md#clone-a-repo).
2. [Create a branch for your contribution](doc/working-with-git-and-github.md#create-a-branch).
3. [Read Numberscope's coding principles guide](doc/code-principles.md).
4. Familiarize yourself with frontscope's
   [code organization](doc/code-organization.md) and internal APIs. Some
   information on the latter topic may only be found in comments in the
   relevant sources files, as the documentation project is ongoing. However,
   all such formal documentation currently being generated is gathered in the
   "Internal code and APIs" section of the navigation bar in the
   [online docs](https://numberscope.colorado.edu/doc).
5. If you are working on a visualizer, read the documentation section on
   [making a visualizer](doc/visualizer-overview.md).
6. Implement your changes.
7. [Create a fork of the numberscope/frontscope repo](doc/working-with-git-and-github.md#create-a-fork).
8. [Add your fork as a remote](doc/working-with-git-and-github.md#add-a-remote).
9. [Push your branch to GitHub](doc/working-with-git-and-github.md#push-a-branch).
10. [Work through Numberscope's pull request checklist](doc/pull-request-checklist.md).
11. [Submit a pull request](doc/working-with-git-and-github.md#submit-a-pull-request).

## If you need help with Git and contributing...

If you have a Git setup that isn't what Numberscope requires (i.e. do your
work in your own fork on a feature branch) check out our doc on
[Gitting it right](doc/gitting-it-right.md).

## A note on code organization

The Numberscope system actually comprises two code repositories. This
documentation is generated from the one called `frontscope`
([GitHub](https://github.com/numberscope/frontscope)), and is primarily
concerned with the operation and development of that portion of the system.

The code in this `frontscope` repository is responsible for defining and
displaying the visualizers, and for establishing how to specify the sequences
the visualizers act on. In general, it provides Numberscope's user interface.

If you need to deal with the code responsible for retrieving integer sequences
from the [Online Encyclopedia of Integer Sequences (OEIS)](https://oeis.org/),
or for performing the computations involved in generating sequence entries and
their factorizations, see `backscope`
([GitHub](https://github.com/numberscope/backscope)).

## Submit a pull request

(This assumes you're working on the numberscope/frontscope repository, but it
applies to other repos as well.)

If you've read the
[Numberscope code principles guide](./doc/code-principles.md) and have adhered
to the [code organization](./doc/code-organization.md), and you think your
code is ready to be reviewed by someone at Numberscope, follow these steps:

1. Work through
   [Numberscope's pull request checklist](./doc/pull-request-checklist.md).
2. Make sure your branch is based on the latest version of the `main` branch
   from the official repository. The simplest way to do this is to
   [sync your local clone](doc/working-with-git-and-github.md#sync-a-local-clone)
   and if your copy of `main` pulled additional new commits in that process
   (as opposed to being reported as "already up to date"), then go ahead and
   [rebase your branch](doc/working-with-git-and-github.md#rebase-your-branch).
3. Navigate to the numberscope/frontscope repository. If your fork is synced
   up with the main numberscope/frontscope repository correctly, you should
   see a button (see the image below) that says "Compare & pull request".
   ![A screenshot of the Compare & pull request
button](doc/img/compare-and-pull-request.png)
   Click that button, write up some notes for your pull request, and click the
   "Create pull request button". Our
   [Working with Git guide](doc/working-with-git-and-github.md) has more
   details about
   [submitting a pull request](doc/working-with-git-and-github.md#submit-a-pull-request).
