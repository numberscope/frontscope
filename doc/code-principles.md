# Code principles

There are two acronyms that can help you write better code.

## DRY (Don't Repeat Yourself)

Practically speaking, this means:

-   create function or use a loop instead of copying and pasting blocks of
    code
-   use a variable instead of typing the same value multiple times
-   use your libraries instead of writing something from scratch
-   use pre-existing solutions instead of writing something from scratch
-   use a loop or index into an array instead of writing long conditional
    (`if`/`elif`/`else`) blocks or switch statements

## KISS (Keep It Short (and) Simple)

Practically speaking this means:

-   name your functions so that we know what they do
-   name your variables so that we know what they are
-   write your functions so that they only have one responsibility
-   write your functions so that they don't have too many side effects
-   write short functions (you should be able to read the function without
    having to scroll your screen)
-   write comments that help the reader understand your code instead of
    comments that merely repeat what the code already says
-   only have code that actually does something -- don't include any commented
    out code or code that can't be reached or run
-   minimize the number of return statements in a function
    -   if there are conditions under which you can bail out easily, it's OK
        to check for them near the top of the function and return from there
    -   otherwise, strive to have all returns at or near the end of the
        function

## Code style/formatting

We rely on automated tools (ESLint and Prettier as of this writing) to keep
the layout/style of our code uniform for readability. Any new code will be
required to conform in the commit/PR process. In fact, often the tools will be
able to adjust the layout of the code for you: if a commit is rejected because
of formatting non-compliance, try `npm run lint` -- just be aware that it will
modify your source files. If you just want to see the issues without touching
any of your files, use `npm run lint:check`. See
[working with the package manager](working-with-pm.md) for details on these
and other scripts you can run.
