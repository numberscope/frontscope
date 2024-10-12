# Working with Git and GitHub

Git and GitHub are separate tools: [Git](https://git-scm.com/) is a software
package for tracking versions of files, often used for source code management,
and [GitHub](https://github.com) is a commercial website that houses
"repositories" of versioned files relating to numerous different projects,
including Numberscope. Since there is some overlap when it comes to working
with them, though, we describe the Git and GitHub operations relevant to
Numberscope in this same document.

Contents

-   [Basic operations](#basic-operations)
    -   [Clone a repo](#clone-a-repo)
    -   [See what the current git situation is](#display-status)
    -   [Create a branch](#create-a-branch)
    -   [Add changes](#add-changes)
    -   [Commit changes](#commit-changes)
    -   [Create a fork](#create-a-fork)
    -   [Add a remote](#add-a-remote)
    -   [Push a branch](#push-a-branch)
    -   [Push changes](#push-changes)
    -   [Submit a pull request](#submit-a-pull-request)
-   [Advanced operations](#advanced-operations)
    -   [Stash your changes](#stash-your-changes)
    -   [Unstash your changes](#unstash-your-changes)
    -   [Check your remotes](#check-your-remotes)
    -   [Sync your local clone](#sync-a-local-clone)
    -   [Rebase your branch](#rebase-your-branch)

## Basic operations

When using Git, it can be helpful to think of it as a photographer who stages
your work ("adds" changes), takes a snapshot of it ("commits" changes), and
stores the photo somewhere safe ("pushes" changes to e.g. GitHub).

### Clone a repo

As described in the
[onboarding](onboarding.md/#setting-up-your-computer-for-development) page, to
run the frontscope user interface from its source code and/or to set up for
making and then submitting changes to the code, you need a copy of all the
code (and the previous snapshots of it as it developed) on your computer.
That's called "cloning" the repository.

To do this, make sure you are in a directory on your computer where you are
comfortable with new subdirectories being created for the project(s) you
clone. (Of course, you must also have the git software installed.) Then issue
a command that looks like this:

```sh
git clone [URI_of_repository]
```

Note that `[URI_of_repository]` is a placeholder for information that you need
to fill in, not something you type as is. In general, we will put placeholders
like this in brackets `[]` so you know what to fill in.

How do you find the URI of the repository you want? In the case it is hosted
on GitHub, as [frontscope](https://github.com/numberscope/frontscope) is, you
navigate to the repository page (the one just linked). In the center of the
page left-to-right and near the top of the page, you will see a bright green
"Code" button. Click on that button, and it will give you a choice of two
different URIs to clone the repository with:

1. via HTTPS: This is an unauthenticated connection to the GitHub server, so
   it is easiest to use for download. However, you cannot submit code changes
   via an HTTPS URI. That's not a problem for the standard repository for
   frontscope, because you never submit changes directly to the standard
   repository. Instead, you will create what's called a "fork" and submit your
   changes through the fork. So bottom line, we recommend you clone frontscope
   via its HTTPS URI, which is
   `https://github.com/numberscope/frontscope.git`.
2. via SSH: This method of connecting is authenticated and will allow you to
   upload changes to GitHub. It requires
   [some setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).
   If you have created a clone of frontscope for the purpose of submitting
   code, you will have to connect to it via an SSH URI, which has the format
   `git@github.com:[USER]/[REPO].git`.

The "Code" button will also show you a command you could use to clone the
repository via the "GitHub Command-Line Interface" (or "GitHub CLI"). That
method requires installing additional software. If you're comfortable with the
[GitHub CLI](https://cli.github.com/), you can use it for several of the tasks
on this page, but we won't be going into the details of it here.

To sum this all up for the case of frontscope, we recommend you clone it via
`git clone https://github.com/numberscope/frontscope.git`.

### Display status

One of the main uses of Git is to facilitate different people working together
by creating (as it were) different albums of photos of your work (called
"branches"). The "official" version of
[frontscope](https://github.com/numberscope/frontscope) (or
[backscope](https://github.com/numberscope/backscope)) is in the branch called
"main" in its standard repository (as just linked to). But as we will see, you
can create new branches for your personal project that involves modifying the
source code, to make sure that your work doesn't interfere with anyone else's.

But first, you will often need to see what the situation is with your copy of
frontscope. Let's assume from now on that you have cloned a repository and
your current directory is within the "working directory" of that clone. (In
other words, if you have just cloned frontscope, say, then you would need to

`cd frontscope`

before executing any of the commands in the rest of this page.)

OK, so if you are in the working directory of your clone and you want to see
what the situation is, execute

`git status`

This command will tell you what "branch" of the repository you are currently
working in, and it will let you know about any differences between the files
in that working directory and the last snapshot, i.e. "commit", of the
project.

For example, if you execute `git status` immediately after cloning the
frontscope repository, you will see:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

On the other hand, if you had switched to a different branch (more about how
to do that in a moment), modified one file and created one new one, you might
see something like this:

```text
On branch git_docs
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   doc/working-with-git-and-github.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	doc/example-documentation.md

no changes added to commit (use "git add" and/or "git commit -a")
```

Note that we have used a different branch in this example because you should
_never make changes directly to main_. Always create and work in a different
branch.

### Create a branch

To create a branch and switch to it in one command, first make sure (for
example, using `git status`) that you are "on" the branch that you want your
new branch based on. That's sort of the "parent" of the new branch -- in other
words, the baseline that your branch will represent changes to. Typically for
working on Numberscope, that will be the `main` branch, so make sure that's
checked out. Then issue the following command:

```sh
git checkout -b [your_new_branch_name]
```

(At Numberscope we use `snake_case` for branch names.) Once you've done this,
you have your own "little world" where you can make changes without affecting
anyone else. Go ahead and modify files or add new ones to get the
visualization you want!

### Add changes

At some point you will have something new and/or improved working, and you
will want to get ready to take a snapshot (i.e. make a "commit" to your
branch) to possibly share or submit to Numberscope, or just as a checkpoint of
what you have done so far.

For this, you must set the stage for this commit. To "add" one file you have
been working on to the commit that's about to be made, issue the following
command:

```sh
git add [path/to/file]
```

Note that the paths are _relative_ to the top-level directory of the working
tree, i.e. to the directory named `frontscope` in our case. For example, the
path of this documentation file is `doc/working-with-git-and-github.md`.

You need to do this for each file you want to stage for this commit; or, see
the next section for a faster option you can sometimes use.

### Commit changes

To take a snapshot of the changed files you have added (i.e, "commit" them),
issue the following command:

```sh
git commit -m "[put your commit message here]"
```

As a shortcut, you can add and commit all of the changed files in your working
tree with

```sh
git commit -a -m "[put your commit message here]"
```

Note that this latter command does **not** include any new ("untracked")
files. Those you must explicitly add with the `git add` command. That's to
make sure that you don't inadvertently put some temporary junk file you may
have made into the repository.

You should write your commit messages according to the "semantic commit
message"
[guidelines](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).

If your changes are more extensive than can be comfortably described in a
single sentence, leave off the `-m "[message]"` part of the command. Then an
editor will pop up where you can insert the description of your changes, Start
with one summary line in the semantic commit message format, then skip a line,
and go into more detail in paragraph(s) below. When you save the message file,
the commit will complete. In these descriptions, always describe the commit in
present tense: "This commit implements a frobozzinator", not "This commit
implemented a frobozzinator". Having them in a uniform format makes the
eventual git log of changes much easier to read.

Note that if you are working on frontscope and you have installed the standard
pre-commit actions (as will happen automatically if you execute the usual
`npm install` when you start working with your clone), then before the commit
actually occurs, git will run several
[code integrity checks](./husky-pre-commit.md).

### Create a fork

Now that you have a new snapshot of your work, you might like a safe place to
put it, and/or you may want to submit what you've done for consideration to be
incorporated into the official Numberscope (that's called "making a pull
request"). Either way, you'll need to create a "fork" of the frontscope
repository, since you are not allowed to submit directly to the official
repository.

Creating a fork of a repository is like creating your own personal copy of the
entire repository, including all present and past snapshots of the code. It's
actually essentially the same thing as cloning the repository, except that the
clone is housed on GitHub's servers rather than on your own local machine. It
also adds functionality that makes it easier to keep your fork synced with the
original and submit pull requests.

Note: This is a GitHub operation, not a Git operation. So the first thing you
will need is a [GitHub account](https://github.com/signup). Once you have that
and are logged in:

1. Go to the page of the repository you want to fork. For instance, here's a
   link to the
   [numberscope/frontscope repository](https://github.com/numberscope/frontscope).
2. In the upper right corner of the page (as of this writing) there should be
   a button that says "Fork". Click that button.
3. Follow the instructions that GitHub provides. Make your GitHub account the
   owner of the fork.

### Add a remote

Now back on your local machine, you'll want your clone to be able to
communicate not just with the standard Numberscope repository from which it
was cloned, but also with your new fork. That's called "adding a remote".
First, you'll need to grab the **SSH** URI for your fork from its page on
GitHub, see the [description of URIs](#clone-a-repo) in the section on cloning
a repository. Then execute the following command

```sh
git remote add [name_of_remote] [SSH URI for remote]
```

You can pick whatever name you want to use for this remote; we typically use
the name "fork" for the fork that we will primarily be submitting ("pushing")
commits to. So if your user name on GitHub is "somebody", your command might
look like

```sh
git remote add fork git@github.com:somebody/frontscope.git
```

### Push a branch

Now you're finally ready to upload your snapshot, or in git lingo, "push your
branch". Before you are able to do this, you either need to install the
[GitHub command line interface (CLI)](https://cli.github.com/) and log in
using the GitHub CLI or
[install an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account).

Presuming that you have not previously pushed anything from your current
branch to your fork, you will want to create a corresponding branch in that
remote git repository and set your local branch to "track" or correspond to
that remote branch. You do this with the following command, that also pushes
all of the changes on the current branch to the remote:

```sh
git push -u [name_of_remote] [name_of_branch]
```

So for example, when first pushing the branch with the changes to this guide,
the command used was `git push -u fork git_docs`.

### Push changes

If you have already pushed a given branch and set it track the remote branch
as in the last section, then when you have made further commit(s) that you
want to upload, just execute:

```sh
git push
```

Git remembers the remote and branch you want to push to (assuming you used the
`-u` option earlier) and also what commit(s) were uploaded before, and only
pushes the new ones.

### Submit a pull request

Once you have a branch in working order that implements one new feature or
fixes one bug or otherwise changes Numberscope in a coherent way, and that
branch is pushed to your fork in the state you want to propose for inclusion
in Numberscope, the first thing to do is to carefully go through the
[pull request checklist](pull-request-checklist.md). This is a GitHub
functionality, not one intrinsic to git.

Presuming that you have satisfied all of the guidelines in the checklist file,
it's time to submit a "pull request" (PR). To do so, go to your fork on the
GitHub website, and select your branch in the dropdown list on near the top
left. Then in the bar just below that dropdown list, you should see
information on how your branch compares with the current "main" branch of
Numberscope, in terms of the number of commits it is "ahead" of main (i.e.,
has added since the last common commit to main) and the number of commits
"behind" main (i.e., the number of commits added in main since the last common
commit). Ideally, your branch is not behind main at all; otherwise, maybe some
of those commits in main might affect the changes you were working on. So if
you see any commits behind main, you might want to go back to your working
copy and [sync your clone with the original](#sync-a-local-clone) and then
rebase your branch on the current version of main.

In any case, when you are satisfied your branch is ready to submit as a PR,
you will notice that report of the number of commits ahead or behind main is
actually a link. Click on that link, and you will reach a page that shows the
relevant commits and all of the changes that have been made in your branch.
Look these over one last time to make sure they are the changes you intend. If
not, go back to your branch and fix up whatever was awry and push it again.

When all of those changes look right, click the big green button at the top
right that says "Create Pull Request". This click will take you to the "Open a
Pull Request" form. (Note that the first time you push a branch to git, the
response message actually includes a quick direct link to this form; you can
save that link and use it later, instead of navigating through GitHub's web
interface.)

There are just two boxes you need to fill out on the form to open a pull
request. The first is the title. GitHub will have filled in something based on
the content of your branch. It should be in the "semantic commit message"
format linked in the [commit](#commit-changes) section, and it should
summarize the overall effect of your PR on the Numberscope system. So if you
don't like what GitHub filled in, improve it before you submit.

The other box is the commit description. It is prefilled with a statement you
need to agree to -- read it over carefully to make sure you agree before you
submit. It may also have some description extracted from your branch. If so,
and you like the looks of that, you can just delete the
`\<Please provide a high-level description of your PR.\>` placeholder and you
are good to go. If not, replace that placeholder with a more detailed but
still brief explanation of the reason, purpose, and content of your PR. If it
takes care of any of the outstanding issues concerning Numberscope listed on
the GitHub site for Numberscope, include at the bottom on a separate line the
statement `Resolves #[issue_number].`

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

You may be in the middle of working on a project, and decide that you need to
check out main again to see how something worked originally, or to start on a
new more urgent project, or something like that. But you may have changed some
of the files in the working tree, in a way that you want to save, but that is
not quite ready to turn into a bona fide commit.

In that situation, git has a facility to squirrel away the changes you have
made so far for later use -- it's called "stashing" the changes. Use the
command:

```sh
git stash
```

### Unstash your changes

To unstash your changes, issue the following command:

```sh
git stash apply
```

This command recreates the changes that were previously stashed in your
working tree, and it also keeps a record of those changes in the stash.

Alternatively, if you want to recreate the stashed changes but also
simultaneously discard them from your stack of stashed changes, issue the
following command:

```sh
git stash pop
```

Finally, if you just want to discard a set of stashed changes _without_
affecting your working tree, the command is:

```sh
git stash drop
```

Be careful -- the difference between "pop" and "drop" is a bit subtle. Both
get rid of the most recent set of changes in your stash, but "pop" affects
working tree whereas "drop" throws them away without affecting enything.

### Check your remotes

To check to see what your "remotes" (other Git repositories you are set up
communicate with via push/pull) are, issue the command below.

```sh
$ git remote -v
```

This will show a list that might look something like

```text
fork	git@github.com:somebody/frontscope.git (fetch)
fork	git@github.com:somebody/frontscope.git (push)
origin	https://github.com/numberscope/frontscope.git (fetch)
origin	https://github.com/numberscope/frontscope.git (push)
```

The repository you first cloned from will always be named `origin`; any other
remotes shown will have the names you assigned them when they were addes. The
name `fork` is just a typical choice for the remote you are generally going to
push to.

### Sync a local clone

Once you or other people have submitted changes and they have been accepted
and "merged" into the official `main` branch, the local clone you made on your
machine will become out of date in terms of its view of the code in the main
branch. (It won't change its concept of what code is in main until you
explicitly tell it to download or "pull" the latest commits in main.)

This can be a problem -- you may not want to base a new branch on out-of-date
code, or a PR you may have submitted may have ended up in a conflicted state
because it was based on an older version of `main`. Here's how you correct the
situation.

First, you need to get back onto the main branch in your local working tree.
If you have any uncommited changes (they would show via
[`git status`](#display-status)) that you want to save, you should first
[stash](#stash-your-changes) them. Then execute

```sh
git checkout main
git pull
```

This will download all of the changes to the standard `main` branch since you
created your clone or last pulled `main`, and leave your working tree on the
main branch with all of the new code. Now you if you want to return to the
branch you were on, you can execute

```sh
git checkout [branch-name]
```

And if you previously stashed any changes, you may want to
[unstash them](#unstash-your-changes).

### Rebase your branch

A branch works from a specific commit in its parent branch (usually `main`) --
its like a logbook of all of the changes you've made from that particular
snapshot of all of the code. Many times for a PR to succeed, the branch must
be based on the latest commit in `main`. So here's what you do if that
happens, but your branch is based on an earlier commit in `main` (likely the
one that was current when you started your work).

First, make sure you have synced your clone, as outlined in the previous
section. Then switch to your branch (with `git checkout [branch_name]`) if
necessary. Make sure that there are no uncommitted changes (by
[stashing them](#stash-your-changes) or waiting to
[unstash them](#unstash-your-changes) if you had previously stashed them).

Now you can instruct git to "replay" each of the changes you made in getting
your branch to where it was, creating new commits along the way. It's as if it
automatically re-edits each file in just the way you did when you were
creating your branch, except starting from the current versions of the file.
The command is:

```sh
git rebase main
```

This may go smoothly and simply report "Successfully rebased and updated
[branch_name]." Or it may hit a "conflict." This conflict can occur when you
changed a region of a file, and the same or very nearby region of the same
file has changed in the main branch between when you started and now. Under
these circumstances, git may not be able to reconstruct how to "re-do" the
edits you made, starting from the current version of the file. (For example,
maybe you edited the code for a function that has since been removed, renamed,
or relocated from the file where it was. Git can't necessarily figure out what
to do with your changes in that case.)

If git hits such a conflict, rebasing will stop with a report on which files
are in a conflicted state. If you now look at these files with a text editor,
you will see that they contain sections that look like:

```text
<<<<<<< HEAD
## This is how origin/main changed this file
=======
## And this is how your branch changed this file
>>>>>>> xxxxxxx (Updated doc/working-with-git-and-github.md)
```

(where xxxxxxx will be a seven-character hexadecimal "hash" identifying the
particular commit from your branch where these changes occurred).

You need to manually edit this block, removing the `<<<<<<<` line, the
`=======` line, and the `>>>>>>>` line, and putting the contents in between to
be the way they "should" be considering both the changes that were made in the
main branch and in your branch. Sometimes this is easy: maybe `main` fixed a
typo in a comment and your branch inserted code just before the comment, and
so you just do both. Other times it is moot: `main` removed a function
altogether and you changed it in some way that is now irrelevant because the
function is gone. And other times it is quite tricky: you fixed a bug in some
function, but main changed its algorithm slightly and now it's not clear if
the bug is still there or if it is, whether your fix will still work. So you
may need to consider carefully and do some investigation and testing of your
new combined code; but most of the time it is pretty straightforward. It's
just that there aren't any hard-and-fast rules for how to resolve these sorts
of "overlapping changes" conflicts. If there were, git would just take care of
them automatically for you.

Anyhow, when you've settled on the best way to resolve the conflict and have
edited all the conflicted files to have consistent code and have removed the
conflict markers, you can execute:

```sh
git rebase --continue
```

and the process will proceed further, either finishing up and reporting that
your branch is successfully rebased, or stopping again if further conflicts
are found.

When the process finishes, you now have locally a version of your changes to
main that is based on the latest commit from main. It is a sort of rewriting
of history. If you had already pushed this branch to a remote, your local
version of the branch is now very different from the remote copy, and you will
want to force them to be the same again. You can do this with

```sh
git push -f
```

(where the `-f` stands for "force"). Finally, your branch is all back in sync
with main, and, for example, the process of your pull request being reviewed
can continue.

Note that you will find many tutorials or references concerning Git that
recommend to use `git merge` to bring your branch up to date with additional
changes that have occurred in `main` since you branched. In our experience
working with Numberscope, that has led to more complicated PRs that are more
difficult to review. Hence, it is our recommendation that you use `git rebase`
instead of `git merge` for keeping your feature branch up-to-date.
