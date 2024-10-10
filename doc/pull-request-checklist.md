# Pull request checklist

## For PR submitters

The PR submitter should:

-   Please use a `snake_case` name for the branch in the PR.
-   Please limit the PR's focus to one thing.
-   Ideally, submit a small PR with limited functionality that can be built
    upon instead of submitting one huge, monolithic PR. Typically, the smaller
    the PR, the better, with the obvious caveat that the code in the PR needs
    to work and actually do something. A small PR for a visualizer might be in
    the ballpark of 200 lines of code.
-   Write or supplement test(s) for the file(s) affected by the PR. In
    particular, if it is a bug fix PR, there **must** be a new test that would
    fail with the prior code, but passes in the PR. The new tests may be
    either unit (vitest) or end-to-end (Playwright) tests or both, as
    appropriate.
-   Update all documentation to reflect the changes in the PR.
-   Make sure Numberscope runs properly, including former supposedly
    unmodified behaviors and newly implemented ones. In particular, run it via
    'npm run dev' and with the browser console open and make sure there are no
    log messages from Numberscope code, warnings, or errors.
-   Read over the reviewer checklist and try to make sure in advance that your
    code is going to proceed as smoothly through the review as possible.

## For PR reviewers

-   All new or changed features are appropriately documented.
-   Tests are appropriately modified for all new or changed features. If it is
    a bugfix PR there must be at least one new test. Most other PRs should
    have new or changed tests as well. So if you do not see any changed files
    in the `e2e/tests` directory or in any `__tests__` directory, that is at
    least an "orange" flag.
-   The PR is passing lint by running `npm run lint`. There should be no
    changed files and no warnings/errors.
-   The PR passes all tests. Note that you must run the end-to-end tests
    yourself with `npm run test:e2e`. You can't rely solely on the GitHub CI
    test results; for example, as of this writing, they are unable to run any
    WebGL tests. In other words, consider passing the GitHub CI tests as a
    necessary but not sufficient condition for considering a PR to be "passing
    all tests".
-   The PR builds by running `npm run build`. (This also checks type
    correctness.) There should be no errors, and for now the only allowed
    warning is the one about some assets being too big.
-   The built system runs with `npm run preview`.
-   When run that way, Numberscope operates properly. The end-to-end tests
    take the pressure to try a variety of random behaviors off of the
    reviewer, but a number of possible actions that seem related to the
    changes in the PR must definitely be tried in this fashion before
    approving for merge.
-   At the end of the review process, before merging, add a commit to update
    the
    ["Contributors" section of the "About" document](about.md#contributors) to
    include the submitter's name, if it is not already present.
