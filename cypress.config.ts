import {defineConfig} from 'cypress'
import afterScreenshot from './cypress/afterScreenshot'
import {resolve} from 'node:path'
import {existsSync} from 'node:fs'

export default defineConfig({
    // If we don't set video to false, it will record a video
    // every time Cypress runs.
    video: false,

    // If we don't set this to false, a screenshot will be taken on
    // an E2E test failure, which will trigger the after screenshot
    // hook, and the code in that hook expects to test a visualizer
    // rather than a screenshot of a failing test.
    screenshotOnRunFailure: false,
    e2e: {
        // All URLs you type in Cypress are now relative to:
        baseUrl: 'http://localhost:5173',

        // Set up a hook to run after a screenshot is taken using Cypress.
        setupNodeEvents(on) {
            on('after:screenshot', details => {
                // There should be a corresponding expected screenshot.
                const expectedScreenshot = resolve(
                    details.path,
                    '..',
                    '..',
                    '..',
                    'expected-screenshots',
                    `expected-${details.name}.png`
                )

                if (existsSync(expectedScreenshot)) {
                    afterScreenshot({
                        actualPath: details.path,
                        expectedPath: expectedScreenshot,
                        shouldCleanup: true,
                        screenshotClosenessPercent: 5,
                        pixelmatchThreshold: 0.5,
                    })
                } else {
                    throw new Error('no corresponding expected screenshot')
                }
            })
        },
    },
})
