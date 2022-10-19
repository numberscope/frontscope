# Code principles

There are two acronyms that can help you write better code.

## DRY (Don't Repeat Yourself)

Practically speaking, this means:

-   create function or use a loop instead of copying and pasting blocks of
    code
-   use a variable instead of typing the same value multiple times
-   use your libraries instead of writing something from scratch
-   use pre-existing solutions instead of writing something from scratch
-   use a loop instead of writing long conditional (`if`/`elif`/`else`) blocks
    or switch statements

## What is KISS (Keep It Short (and) Simple)

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
