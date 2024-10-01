# Code tests

For its front end, Numberscope uses [`vitest`](https://vitest.dev/) for unit
tests and low-level integration tests that run without a browser, and
[`Playwright`](https://playwright.dev/) for higher-level integration and
end-to-end integration tests that run in a browser

### Running tests

The package manager is set up with scripts that make basic running of all
tests very convenient. To run all unit (vitest) tests, execute
`npm run test:unit`. To run all end-to-end (Playwright) tests, use
`npm run test:e2e`.

A couple of additional points about the end-to-end tests:

-   They result in accessing a considerable amount of (sequence) data over the
    internet. Therefore, if you run them when your internet connection is poor
    or inactive, some of the tests will fail.

-   By default, they mostly run in a [Docker](https://www.docker.com/)
    container, which we have found maximizes the reproducibility of the tests.
    So as explained in some more detail in the [onboarding](./onboarding.md)
    page, you will need to install Docker on your system and make sure the
    Docker daemon is running in order to run the tests.

    You can also run them directly in your ambient system with
    `npm run build && npm run test:e2e:cmd` or just `npm run test:e2e:ui` for
    the graphical front end to Playwright, but note that some tests,
    especially image comparison tests, may fail when in fact they would
    succeed when run in the standard way.

#### Customizing vitest runs

If some situation in the code has led to one of the unit tests failing, you
may find yourself in a situation in which you need to run that test
repeatedly, and would rather not run all of the other tests. Fortunately, the
tests are organized by source directory. Hence, if the failure is occurring in
a test associated with the `src/shared` directory (say), then you can run just
the tests associated with that directory via `npm run test:unit src/shared`.
For a brief overview of other options you might use with running unit tests,
try `npm run test:unit -- --help`. (Note the extra `--` stuck in there, which
is needed because the test option you want to use here itself begins with
`--`.)

#### Customizing Playwright runs

You may find yourself in a similar situation with end-to-end testing. In this
case, all of the tests are specified in the top-level `e2e` directory.
However, they are organized into thematic files, which you can see via
`ls e2e`, for example. You can run just one of these collections of tests, say
the ones for the Gallery view in `e2e/gallery.spec.ts`, by executing
`npm run test:e2e gallery`. And similarly to unit tests, you can obtain an
overview of other possibilities via `npm run test:e2e -- --help`.

## Creating tests

If you are considering contributing code to Numberscope, you will very likely
need to create tests. The [pull request checklist](pull-request-checklist.md)
notes that any new feature (including a new visualizer) requires some test
that exercises it; and any bug fix should include a test that would have
failed with the buggy code but which now succeeds on the improved code. There
are somewhat different processes for adding each of the two kinds of tests.

### Adding a unit test

As mentioned above, these tests are organized per source directory, in
subdirectories named `__tests__`. More than likely such a directory will
already exist alongside the source file you want to test, but if not, simply
create one -- vitest will find it automatically. Within the **tests**
directory, the tests are organized by source file, and named accordingly, with
file extension `.spec.ts`. Again, if you are adding tests related to a file
that already has associated tests, you can just insert new tests in an
existing file. If there are no tests yet for the file you are concerned with,
you can just create the `.spec.ts` file and the framework will automatically
execute it.

Let's go through the latter case. At the time of this writing, there was no
test specification for the `src/shared/defineFeatured.ts` file that provides
the specimens for the Featured Gallery. So, we simply created
`src/shared/__tests__/defineFeatured.spec.ts`. At the top of the file you need
to import the test facilities from `vitest`, and typically all of the exported
entities from the module being tested, like so:

```
{! ../src/shared/__tests__/defineFeatured.spec.ts extract: { stop: ibe..g } !}
```

In this case, there is only one export, `getFeatured`, so the test
specification is pretty brief. Here it is in full:

```
{! ../src/shared/__tests__/defineFeatured.spec.ts extract: { start: tured } !}
```

As you can see, tests are arranged in groups, each consisting of a call to
`describe`. The first argument is a string saying what is being tested in that
group, typically one of the exports. The second argument is a function that
executes the test.

Within that function, each test is specified by a call to `it`. The first
argument is again descriptive, giving the property that is being tested. And
the second argument is again a function that runs the test. The body of this
function performs some trial computation using the item being tested,
typically followed by one or more assertions about the outcome of that
computation. The vitest framework provides a
[mini-language](https://vitest.dev/api/expect.html) for specifying assertions,
each triggered by a call to the `expect` function. You can see a few examples
in the code above (admittedly some a bit contrived for the sake of this
exposition).

And that's all there is to it. With this spec file newly in place,
`npm run test:unit` reports three more passed tests than before. It's ready to
be committed and made part of a pull request.

### Adding an end-to-end test

The Playwright framework for end-to-end testing is broadly similar. In this
case, the spec files are all in the `e2e` directory, and again, they will
automatically be discovered and run when placed there. The file extension is
the same, and the main names are essentially arbitrary but should give an idea
of what's being tested.

Let's take a look at one test in `e2e/gallery.spec.ts` that tests proper
operation of the page reached by clicking on the "Gallery" item in
Numberscope's navigation bar. As with vitest, there's a preamble importing the
test framework:

```
{! ../e2e/tests/gallery.spec.ts extract: { stop: before } !}
```

but this time there's not necessarily a need to explicitly import any of the
Numberscope code. That's because Playwright builds the entire system and opens
up its root URL in a browser running in "headless" mode -- that is to say, it
simulates rendering the resulting pages, and needs no attached display. The
Playwright tests manipulate that browser and verify it operates as expected.

Next, we see a new test framework feature: the ability to run code before
every one of the tests in this file:

```
{! ../e2e/tests/gallery.spec.ts extract: { start: play, stop: describe} !}
```

You'll notice that this code takes a `page` argument. That's common to all
Playwright actions: page represents the browser tab that you are (virtually)
working with in your tests. In this case, we direct the tab to visit the
gallery URL, and we clear out its (simulated) browser-local storage to provide
a clean environment for testing.

Note that vitest has a [similar ability](https://vitest.dev/api/#beforeeach)
to call a block of code before each test, if needed.

Finally, let's look at the second test in this suite:

```
{! ../e2e/tests/gallery.spec.ts extract:
    start: '(.*describe.*)'
    stop: title
!}
...
{! ../e2e/tests/gallery.spec.ts extract:
  start: '(.*minim.*)'
  stop: clicking
!}
...
```

As with vitest, tests are arranged in groups, and here `test.describe` is the
direct analogue of `describe` in vitest, with `test` the analogue of `it`. The
second call to `test` in the "Gallery" group is shown above. Also like vitest,
it consists of a sequence of assertions, with reminiscent syntax. In this
case, most of the assertions have to be `await`ed, because they necessitate
various actions being performed in the browser, which may take some time to go
into effect.

For example, the third item in the test is the direction to click on the first
element in the page with id `featured-arrow`. Whatever that does (it's
supposed to collapse the first group of images in the Gallery), it may take a
little while to occur and have its effects (who knows, it might load some
external webpage, which could take time). Hence the await. The test goes on to
check that the resulting page has the expected organization (correct elements
in the DOM tree), and then clicks again to see that the display goes back to
the way it was.

Hopefully this example demystifies the process of creating a test for
Numberscope. You can also find
[more details](https://playwright.dev/docs/test-assertions) on the actions and
assertions you can put in a Playwright test.
