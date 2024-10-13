import fs from 'fs'
import {test, expect} from '@playwright/test'

import {math} from '../../src/shared/math'
import {specimenQuery} from '../../src/shared/specimenEncoding'

// The idea here is to take a collection of challenging sequences, and
// make sure that we try each sequence with at least two visualizers, and
// run each visualizer with at least two sequences. We do this by choosing
// two visualizers at random for each sequence, and then if any visualizer
// has not been chosen twice, we choose (an)other sequence(s) for it. We
// seed the random number generator so that the assignments will be
// reproducible.

const seed = 'KILROY' // only change this in standalone PR
const challenges = [
    'A114592', // Only -1,0,1, for 359 terms, then some bigger values
    'A007235', // short sequence but grows fast
    'A001220', // very few terms
    // 'A000521', // long seq with -1 offset, grows fast; temp too much data
    'A228060', // offset -85, many small terms
    'A086677', // offset 2
    'A241298', // very large positive offset
    // 'A241292', // too large a positive offset (for now)
    'A134028', // mix of negative and positive terms
    'A002819', // nonpositive sequence
    'A001489', // all non-positive integers
    'A202319', // semiprimes
] // feel free to add more

const vizFiles = fs
    .readdirSync('./src/visualizers', {withFileTypes: true})
    .filter(item => !item.isDirectory())
    .map(item => item.name)
const vizKeys: string[] = []
for (const vf of vizFiles) {
    if (vf.includes('isualizer')) continue // infrastructure
    if (vf.endsWith('.d.ts')) continue // infrastructure
    if (vf.includes('ShiftCompare')) continue // freezes way too long
    if (vf.includes('Turtle')) continue // Does nothing on most sequences
    if (!vf.endsWith('.ts')) continue
    vizKeys.push(vf.slice(0, -3))
}
const vizSeqs = Object.fromEntries(vizKeys.map(k => [k, [] as string[]]))

math.config({randomSeed: seed})

for (const seq of challenges) {
    let count = 2
    while (count--) {
        let viz = math.pickRandom(vizKeys)
        while (vizSeqs[viz].includes(seq)) viz = math.pickRandom(vizKeys)
        vizSeqs[viz].push(seq)
    }
}
// Now make sure every visualizer got at least two sequences
for (const viz of vizKeys) {
    let left = 2 - vizSeqs[viz].length
    while (left-- > 0) {
        // Find a sequence not used with this visualizers
        let seq = math.pickRandom(challenges)
        while (vizSeqs[viz].includes(seq)) seq = math.pickRandom(challenges)
        vizSeqs[viz].push(seq)
    }
}

// now run all the combos
test.describe('Visualizer-sequence challenges', () => {
    for (const viz of vizKeys) {
        const vizPar = viz === 'Chaos' ? 'circSize=5' : '' // ow tough to see
        const details = {}
        if (viz === 'Histogram') {
            details.tag = '@webGL'
        }
        for (const seq of vizSeqs[viz]) {
            const query = specimenQuery(viz + seq, viz, 'OEIS ' + seq, vizPar)
            test(`${seq} ${viz}`, details, async ({page, browserName}) => {
                await page.goto(`/?frames=32&${query}`)
                await expect(
                    page
                        .locator('#specimen-bar-desktop')
                        .getByText('play_arrow')
                ).toHaveId('pause-button', {timeout: 20000})
                const matchParams =
                    browserName === 'firefox' && details.tag === '@webGL'
                        ? {maxDiffPixelRatio: 0.02}
                        : {}
                expect(
                    await page.locator('#canvas-container').screenshot()
                ).toMatchSnapshot(`${viz + seq}.png`, matchParams)
            })
        }
    }
})
