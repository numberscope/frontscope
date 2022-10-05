# Contributing to Numberscope

## If you are new to software development, watch the video tutorials

Watch the video series on contributing to Numberscope
[here](https://www.youtube.com/playlist?list=PLA4KIQBQQRb5ccOdr9v0iLw_fKHup1PkU).
This video series will introduce you to Numberscope, GitHub, the software we
use in the Numberscope project, and the workflow for contributing to
Numberscope.

## If you have software dev experience, here's the TL;DR

1. Create a fork of the Numberscope repository you'd like to contribute to.
2. Create a branch within that repository.
3. Do your work on the branch you created. (Make sure your pre-commit hooks
   are working.)
4. When you think your code is in a good state, submit a pull request.

## Scenarios and what to do about them

Here are the different scenarios you could find yourself in and what to do
about them.

1. You don't have Numberscope code.

-   [Create a fork](#create-a-fork).
-   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).

2. You have Numberscope code.

-   1: You have a clone of a Numberscope repository.
    -   1.A: You haven't made changes.
        -   [Create a fork](#create-a-fork).
        -   [Clone your fork](#clone-a-repo).
        -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
    -   1.B: You have made changes.
        -   1.B.1: You are working on the main branch.
            -   1.B.1.A: You made commits.
                -   TODO
            -   1.B.1.B: You haven't made commits.
                -   [Stash your changes](#stash-your-changes).
                -   [Create a branch](#create-a-branch).
                -   [Create a fork](#create-a-fork).
                -   [Add the remote of your fork](#add-a-remote).
                -   [Push the branch to your fork](#push-a-branch).
                -   [Clone your fork](#clone-a-repo).
                -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
        -   1.B.2: You are working on a different branch.
            -   1.B.2.A: You have made commits.
                -   [Create a fork](#create-a-fork).
                -   [Add the remote of your fork](#add-a-remote).
                -   [Push the branch to your fork](#push-a-branch).
                -   [Clone your fork](#clone-a-repo).
                -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
            -   1.B.2.B: You haven't made commits.
                -   [Commit your changes](#commit-changes).
                -   [Create a fork](#create-a-fork).
                -   [Add the remote of your fork](#add-a-remote).
                -   [Push the branch to your fork](#push-a-branch).
                -   [Clone your fork](#clone-a-repo).
                -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
-   2: You have a fork of a Numberscope repository.
    -   2.A: You haven't made changes.
        -   [Clone your fork](#clone-a-repo) (if you don't have it on your
            computer yet).
        -   [Create a branch](#create-a-branch).
        -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
    -   2.B: You have made changes.
        -   2.B.1: You are working on the main branch.
            -   2.B.1.A: You made commits.
                -   TODO
            -   2.B.1.B: You haven't made commits.
                -   [Stash your changes](#stash-your-changes).
                -   [Clone your fork](#clone-a-repo).
                -   [Create a branch](#create-a-branch).
                -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
        -   2.B.2: You are working on a different branch.
            -   2.B.2.A: You have made commits.
                -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).
            -   2.B.2.B: You haven't made commits.
                -   [Commit your changes](#commit-changes).
                -   [Do your work on a branch in your fork](#do-your-work-on-a-branch-in-your-fork).

## Stash your changes

To "stash" your changes (i.e. squirrel them away for later use), issue the
following command:

```sh
git stash
```

## Create a branch

To create a branch and switch to it in one command, issue the following
command:

```sh
git checkout -b your_branch_name_here
```

At Numberscope we use `snake_case` for branch names.

## Push a branch

To create a branch in a remote Git repository and push your changes to that
branch, issue the following command:

```sh
git push -u name_of_remote name_of_branch
```

The name of the remote is most likely `origin` if you are pushing to a fork of
one of the Numberscope repositories.

## Create a fork

Note: This is a GitHub operation, not a Git operation.

1. Go to the page of the repository you want to clone. For instance, if you
   want to clone the numberscope/frontscope repository, go to
   https://github.com/numberscope/frontscope.
2. In the upper right corner of the page (as of this writing) there should be
   a button that says "Fork". Click that button.
3. Follow the instructions that GitHub provides. Make your GitHub account the
   owner of the fork.

## Clone a repo

To clone a Git repository to your computer, issue the following command:

```sh
git clone https://github.com/some_user_or_org/some_repo.git
```

GitHub allows you to clone the repo a few different ways:

1. via HTTPS (easiest method, doesn't require setup, has limited
   functionality)
2. [via SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
   (hardest method, requires setup, but ultimately very convenient)
3. [via the GitHub CLI](https://cli.github.com/) (medium difficulty, requires
   some setup)

## Add a remote

To add a remote version of your repository, issue the following command:

```sh
git remote add name_of_remote https://someurl.com/somerepo.git
```

## Do your work on a branch in your fork

When using Git, it can be helpful to think of it as photographer who stages
your work, takes a snapshot of it, and stores the photo somewhere safe (i.e.
GitHub).

### Add changes

To add or "stage" your work for a commit or "snapshot", issue the following
command:

```sh
git add /path/to/file/here
```

### Commit changes

To commit your work or take a "snapshot" of the work, issue the following
command:

```sh
git commit -m "put your commit message here"
```

It's best to write your commit message in the
[imperative](https://en.wikipedia.org/wiki/Imperative_mood) and keep it
shorter than 50 characters.

### Push changes

Before you are able to do this, you either need to install the
[GitHub command line interface (CLI)](https://cli.github.com/) and log in
using the GitHub CLI or
[install an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).

To push your changes to a remote version of your repository (i.e. to the
version on GitHub) or to "store" your photo, issue the following command:

```sh
git push
```
