import {test, expect} from '@playwright/test'
import {parseSpecimenQuery} from '../../src/shared/browserCaching'
import {getFeatured} from '../../src/shared/defineFeatured'

const featured = getFeatured()
test.describe('Featured gallery images', () => {
    for (const feature of featured) {
        const featProps = parseSpecimenQuery(feature.query)
        const details = {}
        if (featProps.visualizerKind === 'Histogram') {
            details.tag = '@webGL'
        }
        test(featProps.name, details, async ({page}) => {
            if (feature.query.includes('istogram')) {
                page.on('console', msg => console.log(msg))
            }
            const short = featProps.name.replaceAll(' ', '')
            const testURL = `/?frames=64&randomSeed=${short}&${feature.query}`
            await page.goto(testURL)
            await expect(
                page.locator('#specimen-bar-desktop').getByText('play_arrow')
            ).toHaveId('pause-button', {timeout: 30000})
            expect(
                await page.locator('#canvas-container').screenshot()
            ).toMatchSnapshot(`${short}.png`)
        })
    }
})
