import {describe, it, expect} from 'vitest'

import simpleFactor from '../simpleFactor'

describe('simpleFactor', () => {
    it('should factor the product of two 3-digit primes', () => {
        expect(simpleFactor(991n * 997n)).toEqual([
            [991n, 1n],
            [997n, 1n],
        ])
    })

    it.todo('should factor the product of two 4-digit primes', () => {
        expect(simpleFactor(1009n * 1013n)).toEqual([
            [1009n, 1n],
            [1013n, 1n],
        ])
    })

    it('should not report that 2^54 - 1 is even', () => {
        const bit54 = BigInt(2 ** 54 - 1)
        const factorization = simpleFactor(bit54)
        if (factorization !== null) {
            expect(factorization[0][0]).not.toEqual(2n)
        }
    })
})
