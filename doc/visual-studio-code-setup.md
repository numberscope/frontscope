# IDEs and Editors

You will of course need an editor or integrated development environment (IDE)
to develop code contributions to Numberscope.

## VS Code

The recommended IDE consists of [VSCode](https://code.visualstudio.com/) +
[Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
(and disable Vetur) +
[TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

VS Code is pretty easy to set up for Numberscope development. Follow these
steps and you'll be underway quickly:

1. Install VS Code. How exactly you do this will depend on what operating
   system you use. Try the following link and follow the setup guide for your
   operating system:
    - https://code.visualstudio.com/docs/setup/setup-overview
2. Once you've installed VS Code, you'll want to install the following
   extensions (make sure you get the exact same ones as below):
    - Code Spell Checker
    - Prettier - Code formatter
    - TypeScript Vue Plugin (Volar)
    - Vue Language Features (Volar) For more info on extensions, see:
    - https://code.visualstudio.com/docs/editor/extension-marketplace.
3. Install any other extensions you might want. If you like Vim keybindings,
   try the Vim extension. There are also lots of Emacs extensions. There are a
   lot of color themes as well.

### Type support for `.vue` imports in TypeScript

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

## Alternatives

There are of course many other possible editors and IDEs. For example, one can
use the venerable Emacs editor, which has many packages for highlighting code
and autoformatting it. Support for the latter that respects Numberscope's
particular setup is supported by `tools/editor/autoformat.el` in this
repository. That Emacs package runs source files through the `prettier-eslint`
formatter (see the following page) every time they are saved in Emacs.
