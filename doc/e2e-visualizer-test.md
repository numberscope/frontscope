# How to write an E2E test for a visualizer using Cypress

To ensure our visualizers are being drawn correctly after we make changes to
the code base, we write end-to-end (E2E) tests using an E2E testing framework
called Cypress.

Cypress allows us to programmatically control a local instance of Numberscope.
We use Cypress to go to the `/scope` page, create a visualizer, and then save
a screenshot of the visualizer. We then use third-party NodeJS packages to
ensure the screenshot that was taken using Cypress is roughly the same as one
we had previously taken.

The steps for creating an E2E test for a visualizer are as follows:

1. In the `cypress/e2e/` directory, create a
   `{visualizer-name}-visualizer.spec.cy.ts` file.
2. In that file, you'll probably need to use `describe` and `it` (part of the
   global Cypress namespace) to write a test like the one below:

```
describe( 'foo visualizer', () => {
  it( 'can produce a visualization', () => {
    // Go to the scope page.
    // (The base URL is provided in the Cypress configuration file.)
    cy.visit( '/scope' )

    // Do whatever you need to do to get it to draw a visualization...
    // This usually involves identifying which elements need to be clicked
    // and clicking them.

    // Identify an element by its text and click it.
    cy.contains( 'foo text' ).click()

    // Read the Cypress docs for more info on how to get elements and what
    // actions you can perform on them.

    // Take a screenshot of the DOM element you're interested in.
    cy.get( '[id=foo]' ).screenshot( 'foo-screenshot' )
  } )
} )
```

3. Anytime a screenshot is taken, Cypress is configured (in the Cypress config
   file) to compare the screenshot to an expected screenshot. To get the
   initial expected screenshot, you'll need to set the boolean for cleaning up
   the screenshot directory to false (in the Cypress config file) so that you
   can copy a screenshot to the expected screenshots directory. You should
   name the screenshot `expected-{visualizer-name}-screenshot.png`.
