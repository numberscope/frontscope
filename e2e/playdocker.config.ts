import {defineConfig} from '@playwright/test'
import * as process from 'process'

import {baseConfiguration} from './playwright.config.ts'

const chromiumProject = baseConfiguration.projects.find(
    proj => proj.name === 'chromium'
)
const firefoxProject = baseConfiguration.projects.find(
    proj => proj.name === 'firefox'
)

if (
    !chromiumProject
    || !firefoxProject
    || baseConfiguration.projects.length !== 2
) {
    console.error(
        'Base playwright configuration has changed, please update'
            + 'e2e/playdocker.config.ts'
    )
    process.exit(1)
}

const dockerConfig = {
    ...baseConfiguration,
    outputDir: './results/docker/output',
    timeout: 45000,
    projects: [chromiumProject, {...firefoxProject, grepInvert: /@webGL/}],
    reporter: [['blob', {outputFile: './results/docker/report.zip'}]],
}

export default defineConfig(dockerConfig)
