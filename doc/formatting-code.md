# Formatting Code

As of this writing, there are NPM scripts in `package.json` that automatically
format your code for you using Prettier and ESLint. These scripts use
prettier-eslint, which is a package that "formats your code via `prettier`, and
then passes the result of that to `eslint --fix`." This way we get the benefits
of Prettier's superior formatting capabilities and the configuration
capabilities of ESLint.

-   `format-check-ts` runs `prettier-eslint` on all the TypeScript files it can
    find in the `src` directory. This outputs the changes `prettier-eslint` would
    make to standard output, i.e. when you enter the command at the command line,
    it will vomit out its proposed changes.
-   `format-write-ts` runs `prettier-eslint --write` on all the TypeScript files
    it can find in the `src` directory. This writes `prettier-eslint`'s changes,
    i.e. files will be automatically formatted.
-   `format-check-vue` runs `prettier-eslint` on all the Vue files it can find in
    the `src` directory. This outputs the changes `prettier-eslint` would make to
    standard output, i.e. when you enter the command at the command line, it will
    vomit out its proposed changes.
-   `format-write-vue` runs `prettier-eslint --write` on all the Vue files it can
    find in the `src` directory. This writes `prettier-eslint`'s changes, i.e.
    files will be automatically formatted.
-   `format-check` runs both `format-check-ts` and `format-check-vue`.
-   `format-write` runs both `format-write-ts` and `format-write-vue`.

To run these scripts at the command line, you enter:

```sh
npm run <script-name>
```

For example, if you want to run `format-write`, you enter:

```sh
npm run format-write
```

Note also that `npm run lint` runs `eslint` in a non-fixing mode, to check if
there are any violations of non-fixable rules and generate messages about them
if so.

## Text Editor / IDE Integration

How exactly you integrate these scripts into your text editor or IDE will depend
on the text editor or IDE you use. A cursory Google search for "how to run a
command on save in Vim" yields a few useful-looking results. There are
presumably ways to do this for most text editors and IDE's.

### Emacs

Sample configuration code for the (Gnu) Emacs editor which sets up
`prettier-eslint` to be run whenever a `.ts` or `.vue` file is saved is
included, with instructions for how to enable that code, in
`tools/editor/autoformat.el`.
