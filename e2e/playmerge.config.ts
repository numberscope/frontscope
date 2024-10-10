import {defineConfig} from '@playwright/test'

import {baseConfiguration} from './playwright.config.ts'

export default defineConfig({
    testDir: baseConfiguration.testDir,
    reporter: [
        [
            'html',
            {
                open: 'never',
                outputFolder: './results/combined/playwright-report',
            },
        ],
    ],
})
