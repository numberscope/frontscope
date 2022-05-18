import seqMODULES from '../sequences'
import {describe, it, expect} from 'vitest'

describe('sequences', () => {
    it('should export a truthy', () => {
        expect(seqMODULES).toBeTruthy()
    })
    it('should export an object', () => {
        expect(typeof seqMODULES).toMatch('object')
    })
    it('should have a name and kind for each sequence', () => {
        for (const seq of Object.keys(seqMODULES)) {
            expect(seqMODULES[seq]).toHaveProperty('name')
            expect(seqMODULES[seq]).toHaveProperty('kind')
        }
    })
})
