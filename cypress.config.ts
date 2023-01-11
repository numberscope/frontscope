/* eslint-disable */

import {defineConfig} from 'cypress'
import afterScreenshot from './cypress/afterScreenshot'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on) {
            on('after:screenshot', () => {
                afterScreenshot({
                    actualPath:
                        './cypress/screenshots/differences-screenshot.png',
                    expectedPath:
                        './cypress/expected-screenshots/expected-differences-screenshot.png',
                })
            })
        },
    },
})
