# Gitting it right

If you find yourself with a Git setup that isn't what Numberscope requires
(i.e. do your work in your own fork on a feature branch), you might be able to
use this guide to fix your setup.

Here are the different scenarios you could find yourself in and what to do
about them.

-   1: You have a clone of the official Numberscope repository.
    -   1.A: You haven't made changes.
        -   [Create a fork](./working-with-git-and-github.md#create-a-fork).
        -   [Add your fork as a remote](./working-with-git-and-github.md#add-a-remote).
        -   [Create a branch](./working-with-git-and-github.md#create-a-branch).
        -   [Push a branch](./working-with-git-and-github.md#push-a-branch).
        -   Now you are working in your own fork on a dedicated feature
            branch, congrats! Read about about basic Git operations below and
            get to work making a cool visualizer!
        -   [Read about basic Git operations](./working-with-git-and-github.md#basic-operations).
    -   1.B: You have made changes.
        -   1.B.1: You are working on the main branch.
            -   1.B.1.A: You made commits.
                -   Ask someone at Numberscope for help
            -   1.B.1.B: You haven't made commits.
            -   [Stash your changes](./working-with-git-and-github.md#stash-your-changes).
            -   [Create a branch](./working-with-git-and-github.md#create-a-branch).
            -   [Create a fork](./working-with-git-and-github.md#create-a-fork).
            -   [Add the remote of your fork](./working-with-git-and-github.md#add-a-remote).
            -   [Push the branch to your fork](./working-with-git-and-github.md#push-a-branch).
            -   Now you are working in your own fork on a dedicated feature
                branch, congrats! Read about about basic Git operations below
                and get to work making a cool visualizer!
            -   [Read about basic Git operations](./working-with-git-and-github.md#basic-operations).
        -   1.B.2: You are working on a different branch.
            -   1.B.2.A: You have made commits.
                -   [Create a fork](./working-with-git-and-github.md#create-a-fork).
                -   [Add the remote of your fork](./working-with-git-and-github.md#add-a-remote).
                -   [Push the branch to your fork](./working-with-git-and-github.md#push-a-branch).
                -   Now you are working in your own fork on a dedicated
                    feature branch, congrats! Read about about basic Git
                    operations below and get to work making a cool visualizer!
                -   [Read about basic Git operations](./working-with-git-and-github.md#basic-operations).
            -   1.B.2.B: You haven't made commits.
                -   [Commit your changes](./working-with-git-and-github.md#commit-changes).
                -   [Create a fork](./working-with-git-and-github.md#create-a-fork).
                -   [Add the remote of your fork](./working-with-git-and-github.md#add-a-remote).
                -   [Push the branch to your fork](./working-with-git-and-github.md#push-a-branch).
                -   Now you are working in your own fork on a dedicated
                    feature branch, congrats! Read about about basic Git
                    operations below and get to work making a cool visualizer!
                -   [Read about basic Git operations](./working-with-git-and-github.md#basic-operations).
-   2: You have a fork of a Numberscope repository.
    -   2.A: You haven't cloned anything.
        -   [Clone the official Numberscope repository](./working-with-git-and-github.md#clone-a-repo)
        -   Proceed with 1.A above, except you won't need to create a fork.
    -   2.B: You cloned the official Numberscope repository.
        -   Proceed with 1. above, except you won't need to create a fork on
            any step where it says you should.
    -   2.C: You cloned your fork.
        -   Here you have a choice. You can either keep working this way, and
            add the official Numberscope repository
            [as a remote](./working-with-git-and-github.md#add-a-remote)
            (usually named `upstream`). Then in all other tutorials in our
            documentation where it says `origin` you would use `upstream` and
            where it says `fork` you would use origin.
        -   Or, if that is too confusing, you could reconfigure to the
            recommended situation in which you clone the official repository
            and then add your fork as a remote. If you haven't made any
            changes, you can just delete your clone, and start again with 2.A.
            above.
        -   If you have made changes, you will have to rearrange your remotes.
            [Check your remotes](./working-with-git-and-github.md#check-your-remotes).
            If you have a remote named `fork` that does not point to your fork
            (unlikely, but check just in case), remove that remote with
            `git remote remove fork`. Then add your fork
            [as a remote](./working-with-git-and-github.md#add-a-remote) named
            `fork`, even if it is already present as origin. Then execute
            `git remote remove origin`. Finally, add the standard Numberscope
            repository as a remote named `origin`. Then, you can proceed with
            1.B. above, except skip any steps that instruct you to create a
            fork or add a remote.
