/// <reference types="cypress" />

describe('scope page', () => {
    it('can be used to make a visualizer', () => {
        cy.visit('/scope')
        cy.contains('Natural Numbers').click()
        cy.contains('Save changes').click()
        cy.contains('Differences').click()
        cy.contains('Save changes').click()
        cy.contains('Create Bundle').click()

        // For some reason, there are two canvases being drawn.
        // We want defaultCanvas1 instead of defaultCanvas0.
        cy.get('[id=defaultCanvas1]').screenshot('scope-test-screenshot')
    })
})

// Suppress TS1208.
export {}
