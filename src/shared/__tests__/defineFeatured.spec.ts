import {describe, it, expect} from 'vitest'

import {getFeatured} from '../defineFeatured'

describe('getFeatured', () => {
    it('returns an array of specimen-in-memory structures', () => {
        const featured = getFeatured()
        expect(featured[0]).toHaveProperty('query')
        expect(featured[0]).toHaveProperty('date')
        expect(featured[0]).toHaveProperty('canDelete')
    })
    it('that are not delete-able', () => {
        const featured = getFeatured()
        const last = featured.length - 1
        expect(featured[last].canDelete).toBeFalsy()
    })
    it('should generate at least three specimens', () => {
        const featured = getFeatured()
        expect(featured.length).toBeGreaterThan(2)
    })
})
