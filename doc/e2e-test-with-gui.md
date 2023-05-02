# Run E2E tests with Cypress's GUI

During development, you might find it useful to run E2E tests or component
tests using Cypress in a graphical user interface. To do this, you invoke the
commands `npm run dev` and `cypress open`.

There are some discrepancies between `cypress open` and `cypress run`. When
you invoke `cypress run` the paths for expected and actual screenshots are
slightly different from when you invoke `cypress open`. Hence, some of the
tests that pass during `cypress run` will fail during `cypress open`.
