import {describe, it, expect} from 'vitest'

import {Specimen} from '../Specimen'
import {specimenQuery} from '../specimenEncoding'

describe('url', () => {
    it('remains the same when re-encoding', async () => {
        const specimen1 = new Specimen()
        specimen1.loadQuery(specimenQuery('Hello', 'ModFill', 'Random'))
        specimen1.visualizer.tentativeValues.modDimension = '50'
        const enc1 = specimen1.query

        const specimen2 = await Specimen.fromQuery(enc1)
        const enc2 = specimen2.query

        expect(specimen2.name).toBe('Hello')
        expect(specimen2.visualizerKey).toBe('ModFill')
        expect(specimen2.sequenceKey).toBe('Random')
        expect(specimen2.visualizer.tentativeValues.modDimension).toBe('50')
        expect(enc1).toBe(enc2)
    })
})
