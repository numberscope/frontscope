# Numberscope onboarding

## A note on commands

Unless otherwise specified, all commands we ask you to run are supposed to be
run in a Terminal emulator using a shell like Bash or Zsh (on Linux and macOS)
or in Git Bash (on Windows).

## Accounts, etc.

(Steps 2 and 3 only apply to the members of the Numberscope project at the CU
Boulder Experimental Mathematics Lab.)

1. If you don't have an account, sign up for [GitHub](https://github.com).
2. Make sure you've been added to the Numberscope GitHub organization.
3. Make sure you've been added to the chat app (Slack or Zulip).

## Setting up your computer for development

1. If you don't have one, install a good text editor. Use whatever you want!
   [Visual Studio Code](https://code.visualstudio.com/) is popular, and it
   works well with our code base. If you want to use Visual Studio Code,
   install the following extensions:

    - Code Spell Checker
    - TypeScript Vue Plugin (Volar)
    - Vue Language Features (Volar)

    For more info on extensions, see:
    https://code.visualstudio.com/docs/editor/extension-marketplace.

2. If you don't have [Git](https://git-scm.com/) installed, install it. We use
   Git to keep track of the different versions of our code.
3. If you don't have [NodeJS](https://nodejs.org/en/) installed, install it.
   NodeJS allows you to run JavaScript outside of a web browser. We use it in
   our front end code base.
4. If you don't have [Python 3](https://www.python.org/) installed, install
   it.
5. Make sure you have a `venv` module by running the following command:
    ```sh
    python3 -m venv -h
    ```
    You should see help for the `venv` module. If you don't you might have to
    install the module separately. How you do this depends on your system and
    might require some googling.
6. Somewhere on your computer, make a directory where you can keep Numberscope
   code. I like to put a directory called `Code` in my home directory. You can
   call this whatever you want.
7. If you plan to submit your changes, you can "fork" (make your own copy of)
   the repository:
    - Go to https://github.com/numberscope/frontscope.
    - Click the "Fork" button (in the upper right as of this writing) If you
      just want to run from source it's not strictly necessary, and you can
      fork later, it's just a little more complicated. If you want your own
      fork, use command A, otherwise use command B.
    ```sh
    cd /path/to/your/code/directory/
    # (A) run the following command if you are forking:
    git clone https://github.com/{your-github-username}/frontscope.git
    # (B) run the following command if you are cloning:
    git clone https://github.com/numberscope/frontscope.git
    ```
    If you have trouble, read
    [this doc](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
    or ping someone for help.
8. Go to the newly cloned `frontscope` directory and install the dependencies:
    ```sh
    cd frontscope
    npm install
    ```
    You need NodeJS installed to do this. This should install Git hooks using
    [Husky](https://github.com/typicode/husky), but if it doesn't, run
    `npm run prepare`.
9. Run the development server:
    ```sh
    npm run dev
    ```
    If this works, then congrats, you've got a working copy of the
    `frontscope` repository on your computer!
10. Finally, before you start changing code, please read the
    [doc on submitting pull requests](./submitting-pull-requests.md) (it
    outlines how to submit your code changes).

See [the doc on running from source](./running-from-source.md) for more
information.
