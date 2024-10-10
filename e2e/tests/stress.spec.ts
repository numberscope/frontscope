import {test, expect} from '@playwright/test'

import {specimenQuery} from '../../src/shared/browserCaching'

// These are non-snapshot tests that we know to be somewhat or very
// challenging to Numberscope. Once sequences that are here pass, they
// might be candidates for adding to the transversal test.

// Each item is the argument list to specimenQuery
const testlist = {
    'Sequence with lots of data': ['T1', 'Histogram', 'OEIS A000521'],
    'Sequence with extremely large offset': [
        'T2',
        'Differences',
        'OEIS A241292',
    ],
}
test.describe('Stress-test Numberscope visualization', () => {
    for (const k in testlist) {
        // Right now these all fail. This skipping will have to be selective
        // as code improves and some switch to passing.
        test.skip(k, async ({page}) => {
            const query = specimenQuery(...testlist[k])
            const testURL = '/?frames=5&' + query
            await page.goto(testURL)
            await expect(
                page.locator('#specimen-bar-desktop').getByText('play_arrow')
            ).toHaveId('pause-button', {timeout: 15000})
            await expect(
                await page.locator('#sequenceTab .description').innerText()
            ).not.toMatch(/^Unknown OEIS sequence/)
        })
    }
})
