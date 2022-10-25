This PR:

-   does thing A
-   does thing B
-   does thing C

I have verified the following:

### `npm run lint`

(Ultimately, this is something that will be done automatically using GitHub
Actions.)

-   [ ] This PR passes automatic code check

### `npm run test:unit`

(Eventually, there will also be end-to-end tests. Ultimately, testing is
something that will be done automatically using GitHub Actions. Checking to
ensure touched code is tested is probably something we will have to do
manually.)

-   [ ] Code touched in this PR has tests.
-   [ ] This PR passes all tests.

### Documentation

-   [ ] Code touched in this PR has sufficient documentation.
    -   [ ] Sufficiently large changes have markdown documents in the `doc`
            directory.
    -   [ ] Functions have mkdocs-semiliterate documentation.
    -   [ ] Small changes have comments where appropriate.

### `npm run dev`

-   [ ] no errors at command line
-   [ ] no warnings at command line
-   [ ] no errors in browser console console,
-   [ ] parts of frontscope that were changed or affected by the changes are
        working as expected
-   [ ] parts of frontscope that weren't changed or affected by the changes
        are working as expected

### `npm run build`

(This also checks for type correctness. Ultimately, this is something that
will be done automatically using GitHub Actions.)

-   [ ] no errors at command line
-   [ ] no warnings at command line

### `npm run preview`

-   [ ] no errors at command line
-   [ ] no warnings at command line
-   [ ] docs work as expected
-   [ ] docs look good

<hr/>

**PR Reviewers**

1. Pull the PR onto your machine.
2. Run `npm install` to get the dependencies for this PR.
3. Review each of the changed files and submit your feedback.
4. Copy and paste the above review template into a review comment and check
   each item (or comment why it isn't applicable) before you finish your
   review.
