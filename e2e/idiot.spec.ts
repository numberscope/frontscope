import {test, expect} from '@playwright/test'

import {specimenQuery} from '../src/shared/browserCaching'

// These are tests in the spirit of
// https://github.com/numberscope/frontscope/issues/113, i.e.
// "idiot-proofing" Numberscope
test.describe('Stress-test Numberscope usage', () => {
    test('Way too big a number', async ({page}) => {
        const query = specimenQuery(
            'A',
            'ModFill',
            'Formula',
            'modDimension=1111111111111111111111111111111111111111111',
            'formula=12'
        )
        const testURL = '/?frames=5&' + query
        await page.goto(testURL)
        await expect(
            page.locator('#specimen-bar-desktop').getByText('play_arrow')
        ).toHaveId('pause-button', {timeout: 15000})
        await expect(page).toHaveScreenshot() // capture error alert, if one
    })
})
