# Setting up to run from source

1.  Prerequisites: To install and run properly, `frontscope` needs
    [Git](https://git-scm.com/),
    [make](https://linuxhandbook.com/using-make/),
    [Node.js](https://nodejs.org/en/), and [Python](https://www.python.org/)
    (version 3.5 or later) with a working
    "[venv](https://docs.python.org/3/library/venv.html)" module. If any of
    these are not present on your system, install them. It's very likely you
    already have Python, but on Debian/Ubuntu systems, you may well have to
    install the venv module with a command like `apt install python3.11-venv`
    (you may have to replace the "3.11" with the version that is currently
    running in your installation).
2.  In addition, if you want to build the documentation website for the
    `frontscope` system, you will need the [d2](https://d2lang.com) diagram
    generation software installed on your system. This step is not necessary
    just to run `frontscope` itself using the `npm run dev` command shown
    below; but it is needed to build the production version of `frontscope`
    and/or to run the end-to-end [tests](code-tests.md) which are required
    before [contributing code](../CONTRIBUTING.md) to Numberscope.
3.  Clone frontscope to an appropriate location on your computer, and switch
    into the new repository's top-level directory:
    ```sh
    cd /where/you/keep/your/code/
    git clone https://github.com/numberscope/frontscope.git
    cd frontscope
    ```
4.  If you will be connecting to an instance of `backscope` (for obtaining
    information about OEIS sequences) running locally on your machine, then
    create a `.env.local` file to override the `.env` from the distribution:
    ```sh
    # Execute this in the top-level directory of the distribution!
    echo "VITE_BACKSCOPE_URL=http://127.0.0.1:5000" > .env.local
    ```
    (When you want to go back to connecting to the standard backend server,
    remember to delete your `.env.local` or move it out of the way.)
5.  Install dependencies:
    ```sh
    npm install
    ```
    (This command also installs Git hooks using
    [Husky](https://github.com/typicode/husky). For a comprehensive list of
    what commands are run when you `git commit` -- typically linting and
    testing -- see [Husky actions](husky-pre-commit.md).)
6.  Compile and start a server running frontscope, with hot-reloading for
    development:
    ```sh
    npm run dev
    ```
    The output of this command will provide instructions for connecting to the
    new running instance of frontscope with your browser.

There are a number of [other `npm` scripts](working-with-pm.md) that will let
you do things like generate the documentation pages or run tests on the code,
as well.

## Adding to and modifying code

To add to the code, you will need to use either what's called an "editor" or
an "integrated development environment" (IDE) to help you enter the commands,
find any problems, and get your idea working. There are many possibilities for
these tools. One option is an IDE called "VSCode" with some additional
features added by plugins (Volar and a TypeScript Vue module for it). The
details for this part of the setup are in
[a separate page](visual-studio-code-setup.md).
