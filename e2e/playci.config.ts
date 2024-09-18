import {defineConfig} from '@playwright/test'

import {baseConfiguration} from './playwright.config.ts'

const dockerConfig = {
    ...baseConfiguration,
    grepInvert: /@webGL/,
    timeout: 30000,
    expect: {
        toHaveScreenshot: {maxDiffPixelRatio: 0.03},
    },
    reporter: [['list', {printSteps: true}]],
}

export default defineConfig(dockerConfig)
