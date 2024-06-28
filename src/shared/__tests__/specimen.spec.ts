import {Specimen} from '../Specimen'
import {describe, it, expect} from 'vitest'

describe('url', () => {
    it('remains the same when re-encoding', () => {
        const specimen1 = new Specimen('Hello', 'ModFill', 'Random')
        specimen1.visualizer.tentativeValues.modDimension = '50'
        const url1 = specimen1.toURL()

        const specimen2 = Specimen.fromURL(url1)
        const url2 = specimen2.toURL()

        expect(specimen2.name).toBe('Hello')
        expect(specimen2.visualizerKey).toBe('ModFill')
        expect(specimen2.sequenceKey).toBe('Random')
        expect(specimen2.visualizer.tentativeValues.modDimension).toBe('50')
        expect(url1).toBe(url2)
    })
    it('throws an error on a bad URL', () => {
        expect(() => Specimen.fromURL('abcdefg')).toThrowError()
    })
})
