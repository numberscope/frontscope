/**
 * This is a hook that runs after a screenshot is taken using Cypress.
 * We use this hook to do a couple of tasks.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

// This needs a CommonJS require because it's a CommonJS module.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pixelmatch = require('pixelmatch')
import {PNG} from 'pngjs'
import {readFileSync, readdirSync, rmSync} from 'node:fs'
import {resolve} from 'node:path'

const SCREENSHOT_DIR = resolve(process.cwd(), 'cypress', 'screenshots')

/**
 * Verifies that two screenshots are close.
 */
const screenshotsAreClose = (options: {
    actualPath: string
    expectedPath: string
    screenshotClosenessPercent: number
    pixelmatchThreshold: number
}) => {
    const actualContents = readFileSync(
        resolve(process.cwd(), options.actualPath)
    )
    const expectedContents = readFileSync(
        resolve(process.cwd(), options.expectedPath)
    )
    const actualScreenshot = PNG.sync.read(actualContents)
    const expectedScreenshot = PNG.sync.read(expectedContents)
    const {width, height} = expectedScreenshot
    const diff = new PNG({width, height})
    const numDiffPixels = pixelmatch(
        actualScreenshot.data,
        expectedScreenshot.data,
        diff.data,
        width,
        height,
        {threshold: options.pixelmatchThreshold}
    )

    // For some reason, Cypress doesn't always take the screenshot the same
    // way. Sometimes it gets some white background, sometimes it's just the
    // thumbnail. I don't know why. I think having some tolerance here is
    // necessary for the time being.
    const percentDiff = (numDiffPixels / (width * height)) * 100
    return percentDiff < options.screenshotClosenessPercent
}

/**
 * After we're done taking screenshots, remove everything in the screenshots
 * directory. (We don't want it to balloon up with tons of random screenshots.)
 */
const cleanupScreenshotDir = () => {
    const screenshots = readdirSync(SCREENSHOT_DIR)
    for (const screenshot of screenshots) {
        rmSync(resolve(SCREENSHOT_DIR, screenshot), {
            force: true,
            recursive: true,
        })
    }
}

/**
 * The hook that runs after screenshots are taken. It verifies that
 * screenshots are close, and it optionally cleans up the screenshots
 * directory.
 */
const afterScreenshot = (options: {
    actualPath: string // The path to the "actual" screenshot.
    expectedPath: string // The path to the "expected" screenshot.
    shouldCleanup: boolean // Whether we should clean up the screenshots dir.
    screenshotClosenessPercent: number // Percent difference allowed.
    pixelmatchThreshold: number // Sensitivity of lib. 0 to 1. 0 more sensitive.
}) => {
    if (!screenshotsAreClose(options)) {
        throw new Error('screenshots are too different')
    }
    if (options.shouldCleanup) {
        cleanupScreenshotDir()
    }
}

export default afterScreenshot
