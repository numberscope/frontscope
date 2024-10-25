import {test, expect} from '@playwright/test'

import {getFeatured} from '../../src/shared/defineFeatured'
import {parseSpecimenQuery} from '../../src/shared/specimenEncoding'

const featured = getFeatured()
test.describe('Featured gallery images', () => {
    for (const feature of featured) {
        const featProps = parseSpecimenQuery(feature.query)
        const details = {}
        if (
            featProps.visualizerKind === 'Histogram'
            || featProps.visualizerKind === 'Turtle'
        ) {
            details.tag = '@webGL'
        }
        test(featProps.name, details, async ({page, browserName}) => {
            const short = featProps.name.replaceAll(' ', '')
            const testURL = `/?frames=64&randomSeed=${short}&${feature.query}`
            await page.goto(testURL)
            await expect(
                page.locator('#specimen-bar-desktop').getByText('play_arrow')
            ).toHaveId('pause-button', {timeout: 30000})
            const matchParams =
                browserName === 'firefox' && details.tag === '@webGL'
                    ? {maxDiffPixelRatio: 0.02}
                    : {}
            expect(
                await page.locator('#canvas-container').screenshot()
            ).toMatchSnapshot(`${short}.png`, matchParams)
        })
    }
})
