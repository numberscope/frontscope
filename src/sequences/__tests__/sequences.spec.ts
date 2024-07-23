import {seqMODULES} from '../sequences'
import {describe, it, expect} from 'vitest'
import {flushPromises} from '@vue/test-utils'

describe('sequences', () => {
    it('should export a truthy', async () => {
        await flushPromises()
        expect(seqMODULES).toBeTruthy()
    })
    it('should export an object', async () => {
        await flushPromises()
        expect(typeof seqMODULES).toMatch('object')
    })
    it('should have standard fields for each sequence', async () => {
        await flushPromises()
        for (const seq of Object.keys(seqMODULES)) {
            expect(seqMODULES[seq]).toHaveProperty('factory')
            expect(seqMODULES[seq]).toHaveProperty('category')
            expect(seqMODULES[seq]).toHaveProperty('description')
        }
    })
})
