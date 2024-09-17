import {defineConfig, devices} from '@playwright/test'
import * as process from 'process'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

// Export the configuration object so we can derive from it in other tests
export const baseConfiguration = {
    testDir: './tests',
    outputDir: './results/manual/output',
    /* Run tests in files in parallel */
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', {open: 'never', outputFolder: './results/manual/report'}],
    ],
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:5050',
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },

        {
            name: 'firefox',
            use: {...devices['Desktop Firefox']},
        },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run preview:cmd',
        url: 'http://localhost:5050',
        reuseExistingServer: !process.env.CI,
    },
}

/* Export the configuration for Playwright to use: */
export default defineConfig(baseConfiguration)
