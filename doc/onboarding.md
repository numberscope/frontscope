# Onboarding

This doc was originally meant for students, but it can also be used by
contributors.

## A note on commands

Unless otherwise specified, all commands we ask you to run are supposed to be
run in a Terminal emulator using a shell like Bash or Zsh (on Linux and macOS)
or in Git Bash (on Windows). Anything you have to fill in with the proper
information for your setup (as opposed to execute verbatim as shown) is
enclosed in brackets `[]`. MacOS specific instructions appear at the end of
steps where they apply, preceded by "_Mac_:"

## Accounts, etc.

(Steps 2 and 3 only apply to the members of the Numberscope project at the CU
Boulder Experimental Mathematics Lab.)

1. If you don't have an account, sign up for [GitHub](https://github.com).
2. Make sure you've been added to the Numberscope GitHub organization.

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
   Git to keep track of the different versions of our code. _Mac_: The easiest
   way to install git is to install the Mac "developer tools." You can do so
   by opening Settings > General > Software Update and then (in a terminal, as
   mentioned above) executing `xcode-select --install`. Then follow the
   prompts in the Software Update window; your computer may need to restart
   for the changes to take effect.
3. If you don't have [NodeJS](https://nodejs.org/en/) installed, install it.
   NodeJS allows you to run JavaScript outside of a web browser. We use it in
   our front end code base. _Mac_: You can obtain Node by first installing the
   "node version manager" via:

    ```
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
    ```

    [Note that you may need to change the `v0.40.2` portion of the above URL
    to the latest version of nvm; it was current at the time of this writing,
    but you can always find the latest release on its
    [GitHub page](https://github.com/nvm-sh/nvm/releases).] Now either log out
    and log back in for the nvm installation to take effect, or instead just
    execute `. ~/.nvm/nvm.sh`. Finally to install Node, choose the version of
    Node you want (latest was 23 at the time of this writing, but you can
    always look up the
    [available releases](https://nodejs.org/en/about/previous-releases). Then
    execute the command `nvm install [DESIRED_VERSION]`, e.g.,
    `nvm install 23`.

4. Make sure you have [Make](https://linuxhandbook.com/using-make/) installed.
   There's a guide for Linux on that page; or you can try this link for
   [Windows](https://stackoverflow.com/questions/32127524/how-to-install-and-use-make-in-windows).
   _Mac_: Unfortunately, the version of `make` that Apple includes with its
   developer tools is too outdated to work with frontscope. Therefore, you
   must compile and install a more recent version of `make`. One relatively
   simple way to do this is to install the "Homebrew" package management
   system for MacOS, via

    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

    (Note this command will require administrator access to execute.) When
    that completes, it will print out some commands that you should execute to
    finish providing access to Homebrew. Once those are done, you can install
    the current version of `make` with the command `brew install make`. When
    it's done, it will print a message about what you need to do to use it as
    "make"; you don't need to worry about this, as frontscope already uses it
    as "gmake".

5. _Mac_ (only): The version of the Gnu "bash" command interpreter installed
   in MacOS is also too outdated to work with frontscope. As a result, you
   must install a current version. If you installed Homebrew in the previous
   step, you can perform this installation with `brew install bash`.

6. If you don't have [Python 3](https://www.python.org/) installed, install
   it. We use Python in frontscope for our documentation site.

7. Make sure you have a `venv` module by running the following command:
   `python3 -m venv -h`. You should see help for the `venv` module. If you
   don't you might have to install the module separately. How you do this
   depends on your system and might require some web searching. We use `venv`
   for a "virtual environment". In this context, a virtual environment is an
   empty box, a clean slate, for all of our Python dependencies. It allows us
   to use the exact dependencies we list in `requirements.txt`. All of the
   dependencies in `requirements.txt` are installed into a subdirectory in the
   `.venv` directory. Once you activate a virtual environment, all of the
   Python commands you run use the dependencies in the virutal environment,
   and not the dependencies installed elsewhere on your computer.

8. Somewhere on your computer, make a directory where you can keep Numberscope
   code. I like to put a directory called `Code` in my home directory. You can
   call this whatever you want.

9. Clone the official github repository:

    ```sh
    cd [/path/to/your/code/directory]
    git clone https://github.com/numberscope/frontscope.git
    ```

    If you have trouble, read
    [this doc](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
    or ask someone for help.

10. If you plan to submit new code to become part of Numberscope at some time
    in the future, _you must_ also "fork" (make your own copy of) the
    repository:

    - Go to https://github.com/numberscope/frontscope.
    - Click the "Fork" button (in the upper right as of this writing) and then
      follow the instructions GitHub provides. You need to create the fork on
      your GitHub account.

11. If you are going to submit new code, you will also need to run the
    standard tests of the system with your changes in place, and likely add
    new tests for your changes. Running tests requires that you have
    [Docker](https://www.docker.com/) installed on your system. There are many
    tutorials for installing docker; here are example ones for
    [Windows](https://docs.docker.com/desktop/install/windows-install/),
    [Ubuntu Linux](https://linuxconfig.org/quick-docker-installation-on-ubuntu-24-04),
    and
    [Mac OS](https://thesecmaster.com/blog/installing-docker-desktop-on-macos).

12. Go to the newly cloned `frontscope` directory and install the
    dependencies:

    ```sh
    cd frontscope
    npm install
    ```

    You need NodeJS installed to do this.

13. Run the development server (this runs a local copy of Numberscope on your
    computer so you can interact with the webpage): `npm run dev`. This should
    print a link that you can open in the browser. Open it and see if
    Numberscope seems to be working.

14. If you plan on contributing code to Numberscope, _you must_ work in your
    fork on a dedicated feature branch. To learn how to create a branch, see
    [this doc](working-with-git-and-github.md#create-a-branch).

15. Finally, before you start changing code, please read
    [our docs on submitting a pull request](../CONTRIBUTING.md#submit-a-pull-request).

See [the doc on running from source](./running-from-source.md) for more
information.

## Making a visualizer

Now that you're set up, try [making a visualizer](visualizer-overview.md)!
