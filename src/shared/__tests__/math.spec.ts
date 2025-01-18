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

describe('colors', () => {
    const chroma = math.chroma
    it('constructs a color from a string', () => {
        expect(chroma('green').gl()).toStrictEqual([0, 128 / 255, 0, 1])
    })
    it('constructs a color from a string with alpha', () => {
        expect(chroma('blue', 0.6).gl()).toStrictEqual([0, 0, 1, 0.6])
    })
    it('constructs a color with no arguments', () => {
        expect(chroma().gl()).toStrictEqual([0, 0, 0, 1])
    })
    it('constructs a color from a quad', () => {
        const quad: [number, number, number, number] = [0.5, 0.2, 0.7, 0.8]
        expect(chroma(quad).gl()).toStrictEqual(quad)
    })
    it('constructs a color from a grey level', () => {
        expect(chroma(0.7).gl()).toStrictEqual([0.7, 0.7, 0.7, 1])
    })
    it('constructs a color from three numbers', () => {
        expect(chroma(0.5, 0.2, 0.7).gl()).toStrictEqual([0.5, 0.2, 0.7, 1])
    })
    it('constructs a color from four numbers', () => {
        expect(chroma(0.4, 0.8, 0.6, 0.9).gl()).toStrictEqual([
            0.4, 0.8, 0.6, 0.9,
        ])
    })
    it('allows chroma construction in expressions', () => {
        expect(math.evaluate('chroma("magenta")').gl()).toStrictEqual([
            1, 0, 1, 1,
        ])
    })
    it('adds colors as overlay', () => {
        expect(
            math.add(chroma('blue'), chroma('yellow', 0.5)).gl()
        ).toStrictEqual(chroma(0.5).gl())
    })
    it('adds colors in expressions', () => {
        expect(
            math.evaluate('chroma("blue") + chroma("yellow", 0.5)')
        ).toStrictEqual(chroma(0.5))
    })
    it('scalar multiplies a color via alpha', () => {
        const g = chroma('lime')
        expect(math.multiply(g, 0.5)).toStrictEqual(
            chroma(0, 1, 0, 0.5, 'gl')
        )
        // make sure g is not modified
        expect(g.gl()).toStrictEqual([0, 1, 0, 1])
    })
    it('takes linear combinations in expressions', () => {
        expect(
            math.evaluate('chroma("blue") + 0.5*chroma("yellow")')
        ).toStrictEqual(chroma(0.5))
        expect(
            math.evaluate('0.5*chroma("blue") + 0.5*chroma("yellow")').gl()
        ).toStrictEqual([0.5, 0.5, 0.25, 0.75])
    })
    it('allows direct use of color names in expressions', () => {
        expect(math.evaluate('0.5*blue + 0.5*yellow').gl()).toStrictEqual([
            0.5, 0.5, 0.25, 0.75,
        ])
    })
    it('allows chroma.js operations', () => {
        // examples from https://gka.github.io/chroma.js/
        expect(math.evaluate('hotpink.darken(2).hex()')).toBe('#930058')
        expect(math.evaluate('hotpink.brighten(2).hex()')).toBe('#ffd1ff')
        expect(math.evaluate('slategray.saturate(2).hex()')).toBe('#0087cd')
        expect(math.evaluate('hotpink.desaturate(2).hex()')).toBe('#cd8ca8')
        expect(math.evaluate('hotpink.shade(0.25).hex()')).toBe('#dd5b9c')
        expect(math.evaluate('hotpink.tint(0.25).hex()')).toBe('#ff9dc9')
        expect(math.evaluate('hotpink.mix(blue, 0.75, "lab").hex()')).toBe(
            '#811ced'
        )
        expect(math.evaluate('red.mix(blue, 0.5, "oklch").hex()')).toBe(
            '#ba00c2'
        )
    })
})
