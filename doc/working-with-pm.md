# Using package manager scripts

This repository is designed to work with the [pnpm](https://pnpm.io/) package
manager, and precludes installation of packages with other package managers.
It also sets up a number of utility "scripts" that you can run via the package
manager to manipulate and execute the project's code. This page documents all
of the available scripts.

<!-- prettier-ignore -->
{! ../package.json5 extract: {start: 'scripts', stop: '},', replace: [
    ['help:(\D*)".*".*echo (.*)"', '### npm run \1\n\2'], # one-liner like test
    '"help:\D*:\d*".*echo (.*)"', # a numbered continuation line of help
    ['"help:(\D*)":.*"', '### npm run \1\n'], # header of a block of help lines
    '.' # ignore the actual scripts that don't start with help
]} !}
