# frontscope: Numberscope's Front End

Copyright 2020-2022 Regents of the University of Colorado.

This project is licensed under the
[MIT License](https://opensource.org/licenses/MIT). See the text of the MIT
License in LICENSE.md.

![Cool Visualizer](./src/assets/img/specimens/6.png)

## What is Numberscope?

Numberscope will be a free web tool for researchers, citizen-scientists, and
artists. Combine your favourite integer sequences with a suite of visualizers:
online tools that illustrate integer sequences and their properties. It is
currently in development.

## What does the code in this repository do?

The code in this repository is responsible for creating and displaying the
aforementioned visualizers. It's also responsible for Numberscope's user
interface.

If you're looking for the code responsible for retrieving integer sequences from
the [Online Encyclopedia of Integer Sequences (OEIS)](https://oeis.org/), see
[backscope](https://github.com/numberscope/backscope).

## Development

### Setting Up the Project to Work From the Source Code

#### Getting the Code

1. Install [Git](https://git-scm.com/) if you don't already have it on your
   system.
2. Clone frontscope to an appropriate location on your computer:
    ```sh
    cd /where/you/keep/your/code/
    git clone https://github.com/numberscope/frontscope.git
    ```

#### Project Setup

If you don't already have [Node.js](https://nodejs.org/en/) installed on your
system, go ahead an install it.

Install dependencies. (This should also install Git hooks using
[Husky](https://github.com/typicode/husky). If it doesn't, run `npm prepare`).

```sh
npm install
```

For a comprehensive list of what commands are run when you `git commit`, see
[this file](./.husky/pre-commit). As of this writing, `npm run check-format`
and `npm run test:unit` are run when you `git commit`.

##### Compile and Hot-Reload for Development

```sh
npm run dev
```

##### Check Formatting

```sh
npm run check-format
```

If you would like to check the formatting of your code before you `git commit`,
you can run `npm run check-format` at any time. As of this writing, this script
runs `prettier` on the project's files and then runs `eslint` on the project's
files.

##### Type-Check

```sh
npm run typecheck
```

This script uses a configuration file to check for TypeScript errors in your
`.ts` and `.vue` files.

##### Compile and Minify for Production

```sh
npm run build
```

##### Preview Built Version

```sh
npm run preview
```

This script serves the built files for you to preview. (This is different from
`npm run dev` in that there isn't any hot module replacement. It is generally
closer to what you'll run in production.)

##### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

##### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Making a Visualizer

For info on how to make a visualizer, see
[this doc](./doc/making-a-visualizer.md).

### Recommended Editor or IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

See [this doc](./doc/visual-studio-code-setup.md) for more info on setting up
your editor or IDE.

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Customize Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).
