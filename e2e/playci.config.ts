import {defineConfig} from '@playwright/test'

import {baseConfiguration} from './playwright.config.ts'

const dockerConfig = {
    ...baseConfiguration,
    grepInvert: /@webGL/,
    timeout: 30000,
    reporter: ['list'],
}

export default defineConfig(dockerConfig)
