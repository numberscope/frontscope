# Working with Git and GitHub

Git and GitHub are separate tools, but since there is some overlap when it
comes to working with them, we describe the Git and GitHub operations relevant
to Numberscope in the same document.

Contents

-   [Basic operations](#basic-operations)
    -   [Add changes](#add-changes)
    -   [Commit changes](#commit-changes)
    -   [Push changes](#push-changes)
-   [Advanced operations](#advanced-operations)
    -   [Stash your changes](#stash-your-changes)
    -   [Unstash your changes](#unstash-your-changes)
    -   [Create a branch](#create-a-branch)
    -   [Push a branch](#push-a-branch)
    -   [Create a fork](#create-a-fork)
    -   [Clone a repo](#clone-a-repo)
    -   [Add a remote](#add-a-remote)
    -   [Sync local fork with remote original](#sync-local-fork-with-remote-original)

## Basic operations

When using Git, it can be helpful to think of it as photographer who stages
your work ("adds" changes), takes a snapshot of it ("commits" changes), and
stores the photo somewhere safe ("pushes" changes to e.g. GitHub).

### Add changes

To add or "stage" your work for a commit or "snapshot", issue the following
command:

```sh
git add /path/to/file/here
```

(You should do this command for each file you need to stage.)

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

## Advanced operations

### Stash your changes

To "stash" your changes (i.e. squirrel them away for later use), issue the
following command:

```sh
git stash
```

### Unstash your changes

To unstash your changes, issue the following command:

```sh
git stash apply
```

The above command keeps the changes in your stash.

Alternatively, if you wish to discard those changes from the stash, issue the
following command:

```sh
git stash pop
```

### Create a branch

To create a branch and switch to it in one command, issue the following
command:

```sh
git checkout -b your_branch_name_here
```

At Numberscope we use `snake_case` for branch names.

### Push a branch

To create a branch in a remote Git repository and push your changes to that
branch, issue the following command:

```sh
git push -u name_of_remote name_of_branch
```

The name of the remote is most likely `origin` if you are pushing to a fork of
one of the Numberscope repositories.

### Create a fork

Creating a fork of a repository is like creating your own personal copy of
that repository. It's basically the same thing as cloning the repository, but
it creates a GitHub repository associated with your account that mirrors the
original, at least until you start making changes to your fork. It also adds
some neat functionality that makes it easier to sync your fork with the
original and submit pull requests.

Note: This is a GitHub operation, not a Git operation.

1. Go to the page of the repository you want to fork. For instance, if you
   want to fork the numberscope/frontscope repository, go to
   https://github.com/numberscope/frontscope.
2. In the upper right corner of the page (as of this writing) there should be
   a button that says "Fork". Click that button.
3. Follow the instructions that GitHub provides. Make your GitHub account the
   owner of the fork.

### Clone a repo

To clone a Git repository to your computer, issue the following command:

```sh
git clone https://github.com/some_user_or_org/some_repo.git
```

GitHub allows you to clone the repo a few different ways:

1. via HTTPS (easiest method, doesn't require setup, has limited
   functionality, you'll eventually need the
   [GitHub CLI](https://cli.github.com/))
2. [via SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
   (hardest method, requires setup, but ultimately very convenient)

### Add a remote

When you use the operation `git push`, you are pushing your local commit(s) to
a remote version of your repository.

To add a remote version of your repository, issue the following command:

```sh
git remote add name_of_remote https://someurl.com/somerepo.git
```

### Sync local fork with remote original

See [this SO answer](https://stackoverflow.com/a/7244456).

First, check to see what your "remotes" (where you'll be pushing to) are:

(The items in <> brackets are placeholders. You shouldn't actually have the <>
brackets in the real thing.)

```sh
$ git remote -v
origin  git@github.com:<org-or-user-name>/<repo-name>.git (fetch)
origin  git@github.com:<org-or-user-name>/<repo-name>.git (push)
upstream        git@github.com:<org-or-user-name>/<repo-name>.git (fetch)
upstream        git@github.com:<org-or-user-name>/<repo-name>.git (push)
```

You should have something like the above. If not, set origin and/or upstream:

```sh
git remote add <remote-name> git@github.com:<org-or-user-name>/<repo-name>.git
```

Get the latest changes for upstream:

```sh
git fetch upstream
```

Go to your main branch:

```sh
git checkout main
```

Rewrite your main branch so that any commits of yours that aren't already in
upstream/main are replayed on top of upstream/main:

```sh
git rebase upstream/main
```
