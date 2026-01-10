import {test, expect} from '@playwright/test'

import {specimenQuery} from '../../src/shared/specimenEncoding'

// These are tests in the spirit of
// https://github.com/numberscope/frontscope/issues/113, i.e.
// "idiot-proofing" Numberscope

// Each item is the argument list to specimenQuery
const testlist = {
    'Way too big a number': [
        'A',
        'ModFill',
        'Formula',
        'modDimension=1111111111111111111111111111111111111111111',
        'formula=12',
    ],
    'Start deep in a sequence': [
        'B',
        'FactorStacks',
        'Formula',
        '',
        'first=1020000',
    ],
}
test.describe('Stress-test Numberscope usage', () => {
    for (const k in testlist) {
        test(k, async ({page}) => {
            const query = specimenQuery(...testlist[k])
            const testURL = '/?frames=5&' + query
            await page.goto(testURL)
            // Then wait for it to end
            await expect(
                page.locator('#specimen-bar-desktop').getByText('play_arrow')
            ).toHaveId('pause-button', {timeout: 15000})
            await expect(page).toHaveScreenshot() // capture error alert, if one
        })
    }
})
