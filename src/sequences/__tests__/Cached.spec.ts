import {describe, it, expect} from 'vitest'
import {flushPromises} from '@vue/test-utils'

import {FragileRandom} from './FragileRandom'

import {math} from '@/shared/math'

const range = 1000000 // span of indices we might try
const tries = 10000 // how many indices to try; this ...
// ... value must be well above the "birthday problem" threshold for
// the specified range r, i.e., roughly √(2r)

describe('Cached', () => {
    it('should never calculate the same index twice', async () => {
        await flushPromises()
        const rand = new FragileRandom()
        rand.validate()
        rand.initialize()
        await rand.fill()
        let times = tries
        // access a bunch of random elements
        while (times--) {
            const what = math.randomInt(rand.first, rand.first + range)
            await rand.fill(what)
            rand.getElement(what)
        }
        // get a bunch at the beginning
        for (let i = rand.first; i < rand.first + tries; ++i) {
            rand.getElement(i)
        }
        // get a bunch at the end
        const mylast = Math.min(rand.last, range)
        await rand.fill(mylast)
        for (let i = mylast; i > mylast - tries; --i) rand.getElement(i)
        // make sure that the middle element is in range
        const middle = Math.floor((rand.first + mylast) / 2)
        const r = rand.getElement(middle)
        expect(r).toBeGreaterThanOrEqual(rand.min)
        expect(r).toBeLessThanOrEqual(rand.max)
    })
})
