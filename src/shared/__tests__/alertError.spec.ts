import {alertError} from '../alertError'
import {describe, it, expect} from 'vitest'

describe('alertError', () => {
    it('throws a type error when a non-string is supplied', () => {
        expect(() => {
            alertError({})
        }).toThrowError(TypeError)
    })
})
