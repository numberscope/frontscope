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

You should write your commit messages according to the "semantic commit
message"
[guidelines](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).

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

### Submit a pull request

Once you have a branch in working order that implements one new feature or
fixes one bug or otherwise changes Numberscope in a coherent way, and that
branch is pushed to your fork in the state you want to propose for inclusion
in Numberscope, it's time to submit a pull request (PR). To do so, go to your
fork on the GitHub website, and select your branch in the dropdown list on
near the top left. Then in the bar just below that dropdown list, you should
see information on how your branch compares with the current "main" branch of
Numberscope, in terms of the number of commits it is "ahead" of main (i.e.,
has added since the last common commit to main) and the number of commits
"behind" main (i.e., the number of commits added in main since the last common
commit). Ideally, your branch is not behind main at all; otherwise, maybe some
of those commits in main might affect the changes you were working on. So if
you see any commits behind main, you might want to go back to your working
copy and
[sync your local fork with remote original](#sync-local-fork-with-remote-original)
and rebase your branch on the current version of main.

In any case, when you are satisfied your branch is ready to submit as a PR,
you will notice that report of the number of commits ahead or behind main is
actually a link. Click on that link, and you will reach a page that shows the
relevant commits and all of the changes that have been made in your branch.
Look these over one last time to make sure they are the changes you intend. If
not, go back to your branch and fix up whatever was awry and push it again.

(Note that the first time you push a branch to git, the response message
actually includes a quick direct link to this comparison page; you can save
that away and use it later, instead of navigating through GitHub's web
interface.)

When all of those changes look right, click the big green button at the top
right that says "Create Pull Request". This click will take you to the "Open a
Pull Request" form. There are just two boxes you need to fill out here. The
first is the title. GitHub will have filled in something based on the content
of your branch. It should be in the "semantic commit message" format linked in
the [commit](#commit-changes) section, and it should summarize the overall
effect of your PR on the Numberscope system. So if you don't like what GitHub
filled in, improve it before you submit.

The other box is the commit description. It is prefilled with a statement you
need to agree to -- read it over carefully to make sure you agree before you
submit. It may also have some description extracted from your branch. If so,
and you like the looks of that, you can just delete the
`\<Please provide a high-level description of your PR.\>` placeholder and you
are good to go. If not, replace that placeholder with a more detailed but
still brief explanation of the reason, purpose, and content of your PR. If it
takes care of any of the outstanding issues concerning Numberscope listed on
the GitHub site for Numberscope, include at the bottom on a separate line the
statement `Resolves #999.` (with the actual issue number in place of 999).

When you are happy with the title, description, and changes made in your PR,
and you agree with the statement that was pre-filled in the description (which
you should leave in the description to record your agreement), you can click
the green "Create pull request" at the bottom right corner of the description
box. You _should_ leave the box labeled "Allow edits and access to secrets by
maintainers" checked. Don't worry, there aren't any secrets associated with
the Numberscope project, so you are not giving us your bank account numbers or
anything like that.

With this click, your pull request should actually truly be created, and show
up on the [pull request list](https://github.com/numberscope/frontscope/pulls)
in the main GitHub page for Numberscope. The maintainers of Numberscope will
automatically be notified of your proposed code and will get back to you about
your ideas. Thank you for submitting your work to Numberscope!

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

First, [check to see what remotes you have](#check-your-remotes).

To add a remote version of your repository, issue the following command:

```sh
git remote add name_of_remote https://someurl.com/somerepo.git
```

### Check your remotes

To check to see what your "remotes" (where you'll be pushing to) are, issue
the command below. (The items in <> brackets are placeholders. You shouldn't
actually have the <> brackets in the real thing.)

```sh
$ git remote -v
origin  git@github.com:<org-or-user-name>/<repo-name>.git (fetch)
origin  git@github.com:<org-or-user-name>/<repo-name>.git (push)
upstream        git@github.com:<org-or-user-name>/<repo-name>.git (fetch)
upstream        git@github.com:<org-or-user-name>/<repo-name>.git (push)
```

The names "origin" and "upstream" are arbitrary. That being said, they are the
traditional names. "origin" should be your fork, and "upstream" should be the
original repository.

### Sync local fork with remote original

See [this SO answer](https://stackoverflow.com/a/7244456).

First, [check your remotes](#check-your-remotes). You should have something
like what was described in the [check your remotes](#check-your-remotes)
section of this doc. If not, set origin and/or upstream:

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
