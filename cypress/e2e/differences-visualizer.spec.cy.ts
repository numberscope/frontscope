/// <reference types="cypress" />

/**
 * All this module really does is goes to the scope page, creates
 * a visualizer bundle, and takes a screenshot of the thumbnail
 * of the visualizer. After the screenshot is taken, a Cypress
 * hook runs that compares the actual screenshot to an expected
 * screenshot.
 *
 * It's somewhat brittle in the sense that it depends on the text
 * of the elements. If the text is changed, this test will need
 * to change. Alternatively, we could create unique IDs for the
 * various anchor tags and buttons that need to be clicked. The
 * advantage to using the text is that it's really obvious to the
 * reader of this file what's being clicked.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const TEXT_OF_BUTTONS_TO_CLICK = [
    'Natural Numbers',
    'Save changes',
    'Differences',
    'Save changes',
    'Create Bundle',
]

describe('differences visualizer', () => {
    it('can produce a visualization', () => {
        // Go to the scope page.
        // (The base URL is provided in the Cypress configuration file.)
        cy.visit('/scope')

        // Click the element that contains the provided text.
        for (const text of TEXT_OF_BUTTONS_TO_CLICK) {
            cy.contains(text).click()
        }

        // Get the canvas by ID.
        // For some reason, there are two canvases being drawn.
        // We want defaultCanvas1 instead of defaultCanvas0.
        // See https://github.com/numberscope/frontscope/issues/244.
        cy.get('[id=defaultCanvas1]').screenshot('differences-screenshot')
    })
})

// Suppress TS1208.
export {}
