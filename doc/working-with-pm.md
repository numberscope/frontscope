# Using package manager scripts

This repository sets up a number of utility "scripts" that you can run with
the package manager to manipulate and execute the project's code. This page
documents all of the available scripts. The commands shown below to run them
presume you are using the `npm` package manager; adjust them accordingly for
an alternate package manager.

{! ../package.json extract: {start: 'scripts', stop: '},', replace: [
['help:(\D*)".*".*echo (.*)"', '### npm run \1\n\2'], # one-liner like test
'"help:\D*:\d*"._echo (._)"', # a numbered continuation line of help
['"help:(\D*)":.*"', '### npm run \1\n'], # header of a block of help lines
'.' # ignore the actual scripts that don't start with help ]} !}
