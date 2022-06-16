# frontscope

Copyright 2020-2022 Regents of the University of Colorado.

This project is licensed under the
[MIT License](https://opensource.org/licenses/MIT). See the text of the MIT
License in LICENSE.md.

## Recommended Editor or IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

See [this doc](./doc/visual-studio-code-setup.md) for more info on setting up
your editor or IDE.

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

Install dependencies:

```sh
npm install
```

Install Git hooks using [Husky](https://github.com/typicode/husky):

```sh
npm prepare
```

For a comprehensive list of what commands are run when you `git commit`, see
[this file](./.husky/pre-commit). As of this writing, `npm run check-format`
and `npm run test:unit` are run when you `git commit`.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Type-Check

```sh
npm run typecheck
```

This script uses a configuration file to check for TypeScript errors in your
`.ts` and `.vue` files.

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Making a Visualizer

For info on how to make a visualizer, see
[this doc](./doc/making-a-visualizer.md).
