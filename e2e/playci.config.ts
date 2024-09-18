import {defineConfig} from '@playwright/test'

import {baseConfiguration} from './playwright.config.ts'

const dockerConfig = {
    ...baseConfiguration,
    grepInvert: /@webGL/,
    timeout: 30000,
    reporter: [['list', {printSteps: true}]],
}

export default defineConfig(dockerConfig)
