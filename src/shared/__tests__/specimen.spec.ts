import {Specimen} from '../Specimen'
import {describe, it, expect} from 'vitest'

describe('url', () => {
    it('remains the same when re-encoding', () => {
        const specimen1 = new Specimen('Hello', 'ModFill', 'Random')
        specimen1.visualizer.tentativeValues.modDimension = '50'
        const enc1 = specimen1.encode64()

        const specimen2 = Specimen.decode64(enc1)
        const enc2 = specimen2.encode64()

        expect(specimen2.name).toBe('Hello')
        expect(specimen2.visualizerKey).toBe('ModFill')
        expect(specimen2.sequenceKey).toBe('Random')
        expect(specimen2.visualizer.tentativeValues.modDimension).toBe('50')
        expect(enc1).toBe(enc2)
    })
    it('throws an error on a bad URL', () => {
        expect(() => Specimen.decode64('abcdefg')).toThrowError()
    })
})
