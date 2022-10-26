/** md
## Math utilities for numberscope

The primary resource for doing math inside the frontscope code is the
[mathjs](http://mathjs.org) package, which this repository depends on.
The `shared/math` module of Numberscope provides some additional utilities
aimed at making common mathematical operations more convenient, especially
when working with bigints.

Note that currently every one of these functions accepts either
`number` or `bigint` inputs for all arguments and simply converts them
to bigints.

### Example usage
```ts
import {
    safeNumber,
    floorSqrt,
    modulo,
    powmod,
    natlog
} from '../shared/math'
try {
  const myNumber = safeNumber(9007199254740992n)
} catch (err: unknown) {
  console.log('This will always be logged')
}
try {
  const myNumber = safeNumber(9007n)
} catch (err: unknown) {
  console.log('This will never be logged and myNumber will be 9007')
}

const five: bigint = floorSqrt(30n)
const negativeTwo: bigint = floorSqrt(-2n)

const three: bigint = modulo(-7n, 5)
const two: bigint = modulo(7, 5n)

const six: bigint = powmod(6, 2401n, 7n)
// n to the p is congruent to n mod a prime p,
// so a to any power of p is as well.

const fortysixish: number = natlog(100000000000000000000n)
```

### Detailed function reference
**/

import isqrt from 'bigint-isqrt'
import {modPow} from 'bigint-mod-arith'

const maxSafeNumber = BigInt(Number.MAX_SAFE_INTEGER)
const minSafeNumber = BigInt(Number.MIN_SAFE_INTEGER)

/** md
#### safeNumber(n: number | bigint): number

Returns the `number` mathematically equal to _n_ if there is one, or
throws an error otherwise.
**/
export function safeNumber(n: number | bigint): number {
    const bn = BigInt(n)
    if (bn < minSafeNumber || bn > maxSafeNumber) {
        throw new RangeError(`Attempt to use ${bn} as a number`)
    }
    return Number(bn)
}

/** md
#### floorSqrt(n: number | bigint): bigint

Returns the largest bigint _r_ such that the square of _r_ is less than or
equal to _n_, if there is one; otherwise returns the bigint mathematically
equal to _n_. (Thus, it leaves negative bigints unchanged.)
**/
export function floorSqrt(n: number | bigint): bigint {
    const bn = BigInt(n)
    return isqrt(bn)
}

/** md
#### modulo(n: number | bigint, modulus: number | bigint): bigint

Returns the smallest nonnegative bigint congruent to _n_ modulo
_modulus_; this is also the remainder upon dividing _n_ by _modulus_. Note
that this is the "mathematician's modulus" that never returns a negative
value, unlike the built-in JavaScript `%` operator.

Throws a RangeError if _modulus_ is nonpositive.
**/
export function modulo(n: number | bigint, modulus: number | bigint): bigint {
    const bn = BigInt(n)
    const bmodulus = BigInt(modulus)
    if (bmodulus <= 0n) {
        throw new RangeError(`Attempt to use nonpositive modulus ${bmodulus}`)
    }
    if (bn < 0n) {
        return (bn % bmodulus) + bmodulus
    }
    return bn % bmodulus
}

/** md
#### powmod(n, exponent, modulus): bigint

All parameters have type `number | bigint`. If _modulus_ is nonpositive,
throws a RangeError.

Otherwise, if _exponent_ is positive, returns the smallest nonnegative bigint
congruent to _n_ raised to the _exponent_ power modulo _modulus_ (but far more
efficiently than computing `modulo(n**exponent, modulus)`).

If _exponent_ is negative, first computes `i = powmod(n, -exponent, modulus)`.
If _i_ has a multiplicative inverse modulo _modulus_, returns that inverse,
otherwise throws a RangeError.
**/
export const powmod = modPow // just need to fix the name

const nlg16 = Math.log(16)

/** md
#### natlog(n: number | bigint): number

Returns the natural log of the input.
**/
export function natlog(n: number | bigint): number {
    if (typeof n === 'number') return Math.log(n)
    if (n < 0) return NaN

    const s = n.toString(16)
    const s15 = s.substring(0, 15)

    return nlg16 * (s.length - s15.length) + Math.log(Number('0x' + s15))
}
