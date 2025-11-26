import {test, expect} from '@playwright/test'

import {getFeatured} from '../../src/shared/defineFeatured'
import {parseSpecimenQuery} from '../../src/shared/specimenEncoding'

const featured = getFeatured()
test.describe('Featured gallery images', () => {
    for (const feature of featured) {
        const featProps = parseSpecimenQuery(feature.query)
        const details = {}
        if (
            featProps.visualizerKind === 'FactorHistogram'
            || featProps.visualizerKind === 'Turtle'
            || featProps.visualizerKind === 'Chaos'
        ) {
            details.tag = '@webGL'
        }
        test(featProps.name, details, async ({page, browserName}) => {
            const short = encodeURIComponent(
                featProps.name.replaceAll(' ', '')
            )
            const testURL = `/?frames=64&randomSeed=${short}&${feature.query}`
            await page.goto(testURL)
            await expect(
                page.locator('#specimen-bar-desktop').getByText('play_arrow')
            ).toHaveId('pause-button', {
                timeout: featProps.visualizerKind === 'Chaos' ? 60000 : 30000,
            })
            const matchParams =
                browserName === 'firefox' && details.tag === '@webGL'
                    ? {maxDiffPixelRatio: 0.01}
                    : {}
            expect(
                await page.locator('#canvas-container').screenshot()
            ).toMatchSnapshot(`${short}.png`, matchParams)
        })
    }
})
