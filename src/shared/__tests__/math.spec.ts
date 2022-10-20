import * as math from '../math'
import {describe, it, expect} from 'vitest'

const large = 9007199254740993n

describe('safeNumber', () => {
    it('leaves small numbers alone', () => {
        expect(math.safeNumber(7)).toBe(7)
    })
    it('makes small bigints into numbers', () => {
        expect(math.safeNumber(-11n)).toBe(-11)
    })
    it('throws on numbers of great magnitude', () => {
        expect(() => math.safeNumber(10e40)).toThrowError('Attempt')
    })
    it('throws on bigints of great magnitude', () => {
        expect(() => math.safeNumber(-large)).toThrowError('Attempt')
    })
})

describe('floorSqrt', () => {
    it('does nothing on negative bigints', () => {
        expect(math.floorSqrt(-13n)).toBe(-13n)
    })
    it('makes negative numbers into bigints', () => {
        expect(math.floorSqrt(-15)).toBe(-15n)
    })
    it('finds the exact square root of a square number or bignumber', () => {
        expect(math.floorSqrt(large * large)).toBe(large)
        expect(math.floorSqrt(16)).toBe(4n)
    })
    it('finds the floor of the square root of a number or bignumber', () => {
        expect(math.floorSqrt(large * large + 10000n)).toBe(large)
        expect(math.floorSqrt(35)).toBe(5n)
    })
})

describe('modulo', () => {
    it('gives the bigint remainder upon division', () => {
        expect(math.modulo(7, 5)).toBe(2n)
        expect(math.modulo(large, 10)).toBe(3n)
        expect(math.modulo(12, 5n)).toBe(2n)
        expect(math.modulo(99999999999999999999999999n, 100n)).toBe(99n)
    })
    it('always provides a nonnegative residue', () => {
        expect(math.modulo(-7, 5)).toBe(3n)
        expect(math.modulo(-large, 100n)).toBe(7n)
        expect(math.modulo(25, 5n)).toBe(0n)
    })
    it('requires a positive modulus', () => {
        expect(() => math.modulo(77, -7)).toThrowError('Attempt')
        expect(() => math.modulo(-109n, -6n)).toThrowError('Attempt')
    })
})

describe('powmod', () => {
    it('computes n**exponent modulo the modulus', () => {
        expect(math.powmod(2, 3, 7)).toBe(1n)
        const largeCube = large * large * large
        expect(math.powmod(large, 3, 7n)).toBe(math.modulo(largeCube, 7))
        expect(math.powmod(6n, 2401n, 7)).toBe(6n)
        expect(math.powmod(-3n, 343n, 7n)).toBe(4n)
    })
    it('requires a positive modulus', () => {
        expect(() => math.powmod(77, 2n, -7)).toThrowError('must be')
        expect(() => math.powmod(-109n, 1000, -6n)).toThrowError('must be')
    })
    it('handles negative exponents', () => {
        expect(math.powmod(23, -2n, 18)).toBe(13n)
        expect(() => math.powmod(12n, -3, 18n)).toThrowError('MUST be')
    })
})
