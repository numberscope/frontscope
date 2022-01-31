# Formatting Code

As of this writing, there are NPM scripts in `package.json` that automatically
format your code for you using Prettier and ESLint. These scripts use
prettier-eslint, which is a package that "formats your code via `prettier`, and
then passes the result of that to `eslint --fix`." This way we get the benefits
of Prettier's superior formatting capabilities and the configuration
capabilities of ESLint.

The following are the NPM scripts:

```json
    "format-check-ts": "prettier-eslint \"src/**/*.ts\"",
    "format-write-ts": "prettier-eslint \"src/**/*.ts\" --write",
    "format-check-vue": "prettier-eslint \"src/**/*.vue\"",
    "format-write-vue": "prettier-eslint \"src/**/*.vue\" --write",
    "format-check": "npm run format-check-ts && npm run format-check-vue",
    "format-write": "npm run format-write-ts && npm run format-write-vue"
```

* `format-check-ts` runs `prettier-eslint` on all the TypeScript files it can
  find in the `src` directory. This outputs the changes `prettier-eslint` would
  make to standard output, i.e. when you enter the command at the command line,
  it will vomit out its proposed changes.
* `format-write-ts` runs `prettier-eslint --write` on all the TypeScript files
  it can find in the `src` directory. This writes `prettier-eslint`'s changes,
  i.e. files will be automatically formatted.
* `format-check-vue` runs `prettier-eslint` on all the Vue files it can find in
  the `src` directory. This outputs the changes `prettier-eslint` would make to
  standard output, i.e. when you enter the command at the command line, it will
  vomit out its proposed changes.
* `format-write-vue` runs `prettier-eslint --write` on all the Vue files it can
  find in the `src` directory. This writes `prettier-eslint`'s changes, i.e.
  files will be automatically formatted.
* `format-check` runs both `format-check-ts` and `format-check-vue`.
* `format-write` runs both `format-write-ts` and `format-write-vue`.

To run these scripts at the command line, you simply to enter:

```sh
npm run <script-name>
```

For example, if you want to run `format-write`, you would enter:

```sh
npm run format-write
```

## Text Editor / IDE Integration

How exactly you integrate these scripts into your text editor or IDE will depend
on the text editor or IDE you use. A cursory Google search for "how to run a
command on save in Vim" yields a few useful-looking results. I would imagine
there are ways to do this for most text editors and IDE's.
