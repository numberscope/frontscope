# Pull request checklist

## For PR submitters

The PR submitter should:

-   Please use a `snake_case` name for the branch in the PR.
-   Please limit your PR's focus to one thing.
-   Ideally, submit a small PR with limited functionality that can be built
    upon instead of submitting one huge, monolithic PR. Typically, the smaller
    the PR, the better, with the obvious caveat that the code in your PR needs
    to work and actually do something. A small PR for a visualizer might be in
    the ballpark of 200 lines of code.
-   Write or supplement test(s) for the file(s) you touch in your PR.
-   Make sure Numberscope runs properly, including former supposedly
    unmodified behaviors and newly implemented ones. In particular, run it via
    'npm run dev' and with the browser console open and make sure there are no
    log messages from Numberscope code, warnings, or errors.
-   Read over the reviewer checklist and try to make sure in advance that your
    code is going to proceed as smoothly through the review as possible.
-   Optinally, update the
    ["Contributors" section of the "About" document](../about.md#contributors)
    to include your name if your PR is going to be merged.

## For PR reviewers

-   All new or changed features are appropriately documented.
-   Tests are appropriately modified for all new or changed features.
-   The PR is passing lint by running `npm run lint`. There should be no
    changed files and no warnings/errors.
-   The PR builds by running `npm run build`. (This also checks type
    correctness.) There should be no errors, and for now the only allowed
    warning is the one about some assets being too big.
-   The PR passes all tests. Right now (Oct. 2022), just by running
    `npm run test:unit`.
-   Numberscope runs properly -- basically the same check as on the submitter
    list, but be sure to exercise as many randomly selected behaviors as you
    have time for, definitely including but not limited to the ones nominally
    affected by the PR. This should be done in `npm run preview` mode after a
    successful build.
-   Remind the submitter that they can update the
    ["Contributors" section of the "About" document](../about.md#contributors)
    to include their name if the PR is going to be merged.
