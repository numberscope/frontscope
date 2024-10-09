# Husky pre-commit actions

Assuming that the Git hooks specified by this repository have been
[installed](running-from-source.md), the
[Husky](https://github.com/typicode/husky) package will execute the following
actions prior to every call to `git commit`:

```sh
{! ../.husky/pre-commit extract: { start: husky } !}
```

See the page on [package manager scripts](working-with-pm.md) for the meanings
of most of these actions; the `cleancommit` action uses custom code in the
tools/ directory to verify that there are no unstaged changes or untracked
files, which would confuse the later steps (they would be analyzing the
working tree rather than the staged file, so we just enforce those are the
same).

<!-- CUT HERE -->

([Direct link](../.husky/pre-commit) to the Husky pre-commit script.)
