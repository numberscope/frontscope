# Onboarding

This doc was originally meant for students, but it can also be used by
contributors.

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
   works well with Vue, our front-end framework. However, there isn't a
   specific text editor or IDE we recommend. If you want to use Visual Studio
   Code, install the following extensions:

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
4. You need to make sure that you have the [pnpm](https://pnpm.io/) package
   manager installed and that it is at least version 7.17.1. Try executing the
   command `pnpm --version` in your shell. If it tells you that pnpm is not
   found, you need to [install it](https://pnpm.io/installation). If it finds
   the command and reports a version earlier than 7.17.1, you need to update
   it. (How you do this depends on how you installed pnpm. See the
   [installation page](https://pnpm.io/installation) for guidance. If you used
   `corepack` to install pnpm, there are explicit update instructions on that
   page. If you installed via the `curl` command listed there, you can simply
   reinstall the same way. If you installed pnpm by some other means, you will
   need to find the proper way to update your installation.)
5. If you don't have [Python 3](https://www.python.org/) installed, install
   it. We use Python in frontscope for our documentation site.
6. Make sure you have a `venv` module by running the following command:
    ```sh
    python3 -m venv -h
    ```
    You should see help for the `venv` module. If you don't you might have to
    install the module separately. How you do this depends on your system and
    might require some googling. We use `venv` for a "virtual environment". In
    this context, a virtual environment is an empty box, a clean slate, for
    all of our Python dependencies. It makes it so that we can use the exact
    dependencies we list in `requirements.txt`. All of the dependencies in
    `requirements.txt` are installed into a subdirectory in the `.venv`
    directory. Once you activate a virtual environment, all of the Python
    commands you run are run using the dependencies in the virutal
    environment, and not the dependencies you installed elsewhere on your
    computer.
7. Somewhere on your computer, make a directory where you can keep Numberscope
   code. I like to put a directory called `Code` in my home directory. You can
   call this whatever you want.
8. If you plan to submit new code to become part of Numberscope at some time
   in the future, _you must_ "fork" (make your own copy of) the repository:
    - Go to https://github.com/numberscope/frontscope.
    - Click the "Fork" button (in the upper right as of this writing) and then
      follow the instructions GitHub provides. You need to create the fork on
      your GitHub account. If you just want to run from source it's not
      strictly necessary, and you can fork later, it's just a little more
      complicated. If you want your own fork:
    ```sh
    cd /path/to/your/code/directory/
    git clone https://github.com/{your-github-username}/frontscope.git
    ```
    Otherwise, if you don't want to fork right now:
    ```sh
    cd /path/to/your/code/directory/
    git clone https://github.com/numberscope/frontscope.git
    ```
    If you have trouble, read
    [this doc](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
    or ping someone for help.
9. Go to the newly cloned `frontscope` directory and install the dependencies:
    ```sh
    cd frontscope
    pnpm install
    ```
    You need NodeJS installed to do this.
10. Run the development server (this runs a local copy of Numberscope on your
    computer so you can interact with the webpage):
    ```sh
    pnpm dev
    ```
    This should print a link that you can open in the browser. Open it and see
    if Numberscope seems to be working.
11. If you plan on contributing code to Numberscope, _you must_ work in your
    fork on a dedicated feature branch. To learn how to create a branch, see
    [this doc](./working-with-git-and-github.md#create-a-branch).
12. Finally, before you start changing code, please read
    [our docs on submitting a pull request](../CONTRIBUTING.md#submit-a-pull-request).

See [the doc on running from source](./running-from-source.md) for more
information.
