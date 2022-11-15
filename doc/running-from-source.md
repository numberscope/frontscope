# Setting up to run from source

1.  Prerequisites: To install and run properly, `frontscope` needs
    [Git](https://git-scm.com/), [Node.js](https://nodejs.org/en/), and
    [Python](https://www.python.org/) (version 3.5 or later) with a working
    "[venv](https://docs.python.org/3/library/venv.html)" module. If any of
    these are not present on your system, install them. It's very likely you
    already have Python, but on Debian/Ubuntu systems, you may well have to
    install the venv module with a command like `apt install python3.8-venv`
    (you may have to replace the "3.8" with the version that is currently
    running in your installation).
2.  Clone frontscope to an appropriate location on your computer, and switch
    into the new repository's top-level directory:
    ```sh
    cd /where/you/keep/your/code/
    git clone https://github.com/numberscope/frontscope.git
    cd frontscope
    ```
3.  If you will be connecting to an instance of `backscope` (for obtaining
    information about OEIS sequences) running locally on your machine, then
    create a `.env.local` file to override the `.env` from the distribution:
    ```sh
    # Execute this in the top-level directory of the distribution!
    echo "VITE_BACKSCOPE_URL=http://127.0.0.1:5000" > .env.local
    ```
    (When you want to go back to connecting to the standard backend server,
    remember to delete your `.env.local` or move it out of the way.)
4.  Install dependencies:
    ```sh
    npm install
    ```
    (This command also installs Git hooks using
    [Husky](https://github.com/typicode/husky). For a comprehensive list of
    what commands are run when you `git commit` -- typically linting and
    testing -- see
    <!-- repository -->
    [this file](../.husky/pre-commit).)
    <!-- docsite: [this file](../husky/pre-commit.txt).) -->
5.  Compile and start a server running frontscope, with hot-reloading for
    development:
    ```sh
    npm run dev
    ```
    The output of this command will provide instructions for connecting to the
    new running instance of frontscope with your browser.

## Adding to and modifying code

To add to the code, you need to use what's called an "editor" or an
"integrated development environment" (IDE) to help you enter the commands,
find any problems, and get your idea working. There are many possibilities for
these tools, but if you're just starting out, Numberscope recommends an IDE
called "VSCode" with some additional features added by plugins (Volar and a
TypeScript Vue module for it). The details for this part of the setup are in
the [Contributing](visual-studio-code-setup.md) section.
