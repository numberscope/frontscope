# Numberscope

### **The Integer Sequence Visualization Tool!**

Copyright 2020-2022 Regents of the University of Colorado.

This project is licensed under the
[MIT License](https://opensource.org/licenses/MIT). See the text of the MIT
License in LICENSE.md.

[<img src="src/assets/img/specimens/6.png" width="320" style="float: right;" />](./src/assets/img/specimens/6.png)

## What is Numberscope?

Numberscope is a tool for researchers, citizen-scientists, and artists.
Combine your favourite integer sequences with a suite of visualizers: online
tools that illustrate integer sequences and their properties. It is currently
in development.

## How do I use it?

The project will soon be extablishing a public Numberscope server that you can
visit and experiment with. In the meantime, see
[Running from source](doc/running_from_source.md).

There's also a [User Guide](doc/user_guide.md) with information about how to
explore sequences with Numberscope.

## More information

-   [Extending Numberscope](doc/extending.md)

    Have a great idea for a new way to illustrate the behavior of an integer
    sequence? Numberscope is designed to make it easy to add new visualizers,
    and this guide will show you how.

-   [Contributing](doc/contributing.md)

    More extensive information about all aspects of Numberscope's code, and
    how you can have your work become part of the project.

-   [About the Numberscope project](doc/about.md)

-   [Acknowledgments](doc/acknowledgments.md)

# Content that needs to be moved:

## What does the code in this repository do?

The code in this repository is responsible for defining and displaying the
visualizers, and for establishing how to specify the sequences the visualizers
act on. In general, it provides Numberscope's user interface.

If you're looking for the code responsible for retrieving integer sequences
from the [Online Encyclopedia of Integer Sequences (OEIS)](https://oeis.org/),
see [backscope](https://github.com/numberscope/backscope).

## Setting up to run from source

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
    create a `.env.local` file and populate it:
    ```sh
    echo "VITE_API_URL=127.0.0.1:5000" > .env.local
    ```
4.  Install dependencies:
    ```sh
    npm install
    ```
    (This command should also install Git hooks using
    [Husky](https://github.com/typicode/husky). If it doesn't, run
    `npm prepare`. For a comprehensive list of what commands are run when you
    `git commit` -- typically linting and testing -- see
    [this file](./.husky/pre-commit).)
5.  Compile and start a server running frontscope, with hot-reloading for
    development:
    ```sh
    npm run dev
    ```
    The output of this command will provide instructions for connecting to the
    new running instance of frontscope with your browser.

## Development

### Making a new visualizer

For info on how to make a visualizer, see
[this doc](./doc/making-a-visualizer.md).

### Additional `npm` scripts

This section documents all of the other facilities available via `npm` scripts
for working with the project's code.

#### Check and repair formatting

```sh
npm run lint
```

If you would like to format your code before you `git commit`, you can run
`npm run lint` at any time, which runs [Prettier](https://prettier.io/) and
then [ESLint](https://eslint.org/) with the `--fix` option on the project's
files. Note that this doesn't simply _check_ the formatting of your files, it
_formats_ them! (If possible -- there are some formatting/code errors that it
does not know how to fix, which will simpy be reported as errors; and if any
such are present when this command is run as part of a commit via the standard
git hooks this project sets up, the commit will not be accepted.)

```sh
npm run lint:check
```

Like `npm run lint` but only reports problems; does not modify any of your
source files. Note that this script might not report any errors but a
subsequent `npm run lint` might modify files, since `prettier` does not have a
"diagnostic" mode in which it reports discrepancies with its preferred
formatting, and some formatting not preferred by prettier is acceptable to
eslint.

```sh
npm run lint:list
```

Like `npm run lint` but only lists the files that would be changed; does not
modify any source files or report what the problems were or report any
unfixable problems.

```sh
npm run lint:staged
```

For internal purposes only, used in the pre-commit hook to reformat and stage
any resulting changes to the files being committed.

#### Type checking

```sh
npm run typecheck
```

This script uses a configuration file to check for TypeScript errors in your
`.ts` and `.vue` files.

#### Compile and "minify" for production

```sh
npm run build
```

#### Preview built version

```sh
npm run preview
```

This script serves the built files for you to preview. (This is different from
`npm run dev` in that there isn't any hot module replacement. It is generally
closer to what you'll run in production.)

#### Run unit tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Recommended editor or IDE setup

[VSCode](https://code.visualstudio.com/) +
[Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
(and disable Vetur) +
[TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

See [this doc](./doc/visual-studio-code-setup.md) for more info on setting up
your editor or IDE.

#### Type support for `.vue` imports in TypeScript

TypeScript cannot handle type information for `.vue` imports by default, so we
replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need
[TypeScript Vue Plugin(Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin)
to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has
also implemented a
[Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669)
that is more performant. You can enable it by the following steps:

1.  Disable the built-in TypeScript Extension
    1.  Run `Extensions: Show Built-in Extensions` from VSCode's command
        palette
    2.  Find `TypeScript and JavaScript Language Features`, right click and
        select `Disable (Workspace)`
2.  Reload the VSCode window by running `Developer: Reload Window` from the
    command palette.
