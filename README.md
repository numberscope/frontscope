# frontscope: Numberscope's Front End

Copyright 2020-2022 Regents of the University of Colorado.

This project is licensed under the
[MIT License](https://opensource.org/licenses/MIT). See the text of the MIT
License in LICENSE.md.

![Cool Visualizer](./src/assets/img/specimens/6.png)

## What is Numberscope?

Numberscope is a tool for researchers, citizen-scientists, and
artists. Combine your favourite integer sequences with a suite of visualizers:
online tools that illustrate integer sequences and their properties. It is
currently in development.

## What does the code in this repository do?

The code in this repository is responsible for defining and displaying the
visualizers, and for establishing how to specify the sequences the
visualizers act on. In general, it provides Numberscope's user interface.

If you're looking for the code responsible for retrieving integer sequences
from the [Online Encyclopedia of Integer Sequences (OEIS)](https://oeis.org/),
see [backscope](https://github.com/numberscope/backscope).

## Setting up to run from source

1. Install [Git](https://git-scm.com/) if you don't already have it on your
   system.
2. Clone frontscope to an appropriate location on your computer:
    ```sh
    cd /where/you/keep/your/code/
    git clone https://github.com/numberscope/frontscope.git
    ```
3. If you don't already have [Node.js](https://nodejs.org/en/), install it.
4. Install dependencies:
    ```sh
    cd frontscope
    npm install
    ```
    (This command should also install Git hooks using
    [Husky](https://github.com/typicode/husky). If it doesn't, run
    `npm prepare`. For a comprehensive list of what commands are run when
    you `git commit` -- typically linting and testing -- see
    [this file](./.husky/pre-commit).)
5. Compile and start server with hot-reloading for development:
    ```sh
    npm run dev
    ```

## Development

### Making a new visualizer

For info on how to make a visualizer, see
[this doc](./doc/making-a-visualizer.md).

### Additional `npm` scripts

This section documents all of the other facilities available via `npm` scripts
for working with the project's code.

#### Check formatting

```sh
npm run lint
```

If you would like to check the formatting of your code before you
`git commit`, you can run `npm run lint` at any time, which runs
[Prettier](https://prettier.io/) and then [ESLint](https://eslint.org/)
on the project's files.

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

### Customize Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Recommended Editor or IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

See [this doc](./doc/visual-studio-code-setup.md) for more info on setting up
your editor or IDE.

#### Type Support for `.vue` Imports in TypeScript

TypeScript cannot handle type information for `.vue` imports by default, so we
replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need
[TypeScript Vue Plugin(Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin)
to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has
also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669)
that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2. Find `TypeScript and JavaScript Language Features`, right click and
       select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the
   command palette.
