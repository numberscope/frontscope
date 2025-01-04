import {describe, it, expect} from 'vitest'

import {math} from '../math'

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
        expect(math.modulo(large, 1)).toBe(0n)
        expect(math.modulo(12, 5n)).toBe(2n)
        expect(math.modulo(99999999999999999999999999n, 100n)).toBe(99n)
    })
    it('always provides a nonnegative residue', () => {
        expect(math.modulo(-7, 5)).toBe(3n)
        expect(math.modulo(-large, 100n)).toBe(7n)
        expect(math.modulo(25, 5n)).toBe(0n)
        expect(math.modulo(0, 1n)).toBe(0n)
        expect(math.modulo(1, 1n)).toBe(0n)
        expect(math.modulo(1n, 1)).toBe(0n)
        expect(math.modulo(-1, 1n)).toBe(0n)
    })
    it('requires a positive modulus', () => {
        expect(() => math.modulo(77, 0)).toThrowError('Attempt')
        expect(() => math.modulo(large, 0n)).toThrowError('Attempt')
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

describe('natlog', () => {
    it('handles numbers', () => {
        expect(math.natlog(Math.E)).toBe(1)
    })
    it('handles bigints', () => {
        expect(math.natlog(-10n)).toBe(NaN)
        expect(math.natlog(10000n)).toBeCloseTo(9.210340371976184, 15)
        // Check log of 10^20:
        expect(math.natlog(100000000000000000000n)).toBeCloseTo(
            46.051701859880914,
            15
        )
        // Check log of 10^lot:
        expect(
            math.natlog(
                10000000000000000000000000000000000000000000n
                    * 10000000000000000000000000000000000000000000000n
            )
        ).toBeCloseTo(204.93007327647007, 15)
    })
})

describe('divides', () => {
    it('gives true when integers divide', () => {
        expect(math.divides(7, 5)).toBe(false)
        expect(math.divides(10, large)).toBe(false)
        expect(math.divides(10, large - 3n)).toBe(true)
        expect(math.divides(120, 5n)).toBe(false)
        expect(math.divides(9, 99999999999999999999999999n)).toBe(true)
    })
    it('handles zeroes and ones', () => {
        expect(math.divides(1, large)).toBe(true)
        expect(math.divides(1n, 1)).toBe(true)
        expect(math.divides(1, 0n)).toBe(true)
        expect(math.divides(0n, 0)).toBe(true)
        expect(math.divides(1n, 0)).toBe(true)
        expect(math.divides(0, 1n)).toBe(false)
        expect(math.divides(0, -1n)).toBe(false)
    })
})

const pow =
    89907201863535854420702290135762284537312963394702682637089810488324824507n
describe('valuation', () => {
    it('reports the correct valuation', () => {
        expect(math.valuation(pow, 3)).toBe(155)
        expect(math.valuation(20, 2n)).toBe(2)
        expect(math.valuation(300000000000000000000000000n, 3n)).toBe(1)
    })
    it('handles a == 0', () => {
        expect(math.valuation(0, 5)).toBe(+Infinity)
        expect(math.valuation(0n, 2)).toBe(+Infinity)
    })
    it('handles negative a', () => {
        expect(math.valuation(-7, 5)).toBe(0)
        expect(math.valuation(-large, 2)).toBe(0)
        expect(math.valuation(-25, 5n)).toBe(2)
    })
    it('requires a big enough divisor', () => {
        expect(() => math.valuation(77, 0)).toThrowError('Attempt')
        expect(() => math.valuation(large, 1n)).toThrowError('Attempt')
        expect(() => math.valuation(773, -7)).toThrowError('Attempt')
        expect(() => math.valuation(-109n, -6n)).toThrowError('Attempt')
    })
})

describe('biggcd', () => {
    it('gives correct gcd on numbers & bigints', () => {
        expect(math.biggcd(7, 28)).toBe(7n)
        expect(math.biggcd(large, 15)).toBe(3n)
        expect(math.biggcd(125, 15n)).toBe(5n)
        expect(math.biggcd(99999999999999999999999999n, 900n)).toBe(9n)
    })
    it('deals with minus signs correctly', () => {
        expect(math.biggcd(-25, 5)).toBe(5n)
        expect(math.biggcd(large, -15n)).toBe(3n)
        expect(math.biggcd(-25, -5n)).toBe(5n)
    })
    it('deals with zero correctly', () => {
        expect(math.biggcd(-25, 0)).toBe(25n)
        expect(math.biggcd(0, large)).toBe(large)
        expect(math.biggcd(0, 0)).toBe(0n)
        expect(math.biggcd(0, 0n)).toBe(0n)
    })
})
