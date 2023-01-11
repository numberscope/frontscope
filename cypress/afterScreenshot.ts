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
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const screenshotsAreClose = (actualPath: string, expectedPath: string) => {
    const actualContents = readFileSync(resolve(process.cwd(), actualPath))
    const expectedContents = readFileSync(
        resolve(process.cwd(), expectedPath)
    )
    const actualScreenshot = PNG.sync.read(actualContents)
    const expectedScreenshot = PNG.sync.read(expectedContents)
    const {width, height} = actualScreenshot
    const diff = new PNG({width, height})
    const numDiffPixels = pixelmatch(
        actualScreenshot.data,
        expectedScreenshot.data,
        diff.data,
        width,
        height,
        {threshold: 0.5}
    )

    // For some reason, Cypress doesn't always take the screenshot the same
    // way. Sometimes it gets some white background, sometimes it's just the
    // thumbnail. I don't know why. I think having some tolerance here is
    // necessary for the time being.
    return numDiffPixels < 5000
}

const cleanupScreenshotDir = () => {
    console.log('cleanup')
}

const afterScreenshot = (options: {
    actualPath: string
    expectedPath: string
}) => {
    if (!screenshotsAreClose(options.actualPath, options.expectedPath)) {
        throw new Error('screenshots are too different')
    }
    cleanupScreenshotDir()
}

export default afterScreenshot
