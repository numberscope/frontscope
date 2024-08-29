/** md
## Math utilities for numberscope

Generally speaking, you should obtain all of your functions for doing
math in frontscope code from this incorporated `shared/math` module. It is
based primarily on the [mathjs](http://mathjs.org) package.

Note in particular that you should only use the random number generators from
mathjs supplied by this module, namely
[`math.random()`](https://mathjs.org/docs/reference/functions/random.html),
[`math.randomInt()`](
https://mathjs.org/docs/reference/functions/randomInt.html),
and/or
[`math.pickRandom()`](https://mathjs.org/docs/reference/functions/random.html).
The testing framework used for frontscope will fail if the built-in JavaScript
`Math.random()` is used.

Other than that, only the Numberscope extensions to mathjs are documented
below; refer to the [mathjs documentation](http://mathjs.org/docs) to see all
of the other facilities available.

Note that currently every one of the extension functions described
below accepts either `number` or `bigint` inputs for all arguments and
simply converts them to bigints as needed.

### Example usage
```ts
import {math} from '@/shared/math'

// Example of a standard mathjs function: random integer
// from 1, 2, 3, 4, 5, 6 (note right endpoint is exclusive).
const myDie: number = math.randomInt(1, 7)

// Remaining examples are Numberscope extensions
try {
  const myNumber = math.safeNumber(9007199254740992n)
} catch (err: unknown) {
  console.log('This will always be logged')
}
try {
  const myNumber = math.safeNumber(9007n)
} catch (err: unknown) {
  console.log('This will never be logged and myNumber will be 9007')
}

const five: bigint = math.floorSqrt(30n)
const negativeTwo: bigint = math.floorSqrt(-2n)

const three: bigint = math.modulo(-7n, 5)
const two: bigint = math.modulo(7, 5n)

const isFactor: boolean = math.divides(6, 24n) // true
const isntFactor: boolean = math.divides(7n, 12) // false

const six: bigint = math.powmod(6, 2401n, 7n)
// n to the p is congruent to n mod a prime p,
// so a to any power of p is as well.

const fortysixish: number = math.natlog(100000000000000000000n)

const seven: bigint = math.bigabs(-7n)
```

### Detailed function reference
**/

import isqrt from 'bigint-isqrt'
import {modPow} from 'bigint-mod-arith'
import {create, all} from 'mathjs'
import type {MathJsInstance} from 'mathjs'

type Integer = number | bigint
type ExtendedMathJs = MathJsInstance & {
    safeNumber(n: Integer): number
    floorSqrt(n: Integer): bigint
    modulo(n: Integer, modulus: Integer): bigint
    divides(a: Integer, b: Integer): boolean
    powmod(n: Integer, exponent: Integer, modulus: Integer): bigint
    natlog(n: Integer): number
    bigabs(a: Integer): bigint
}

export const math = create(all) as ExtendedMathJs

const maxSafeNumber = BigInt(Number.MAX_SAFE_INTEGER)
const minSafeNumber = BigInt(Number.MIN_SAFE_INTEGER)

/** md
#### safeNumber(n: number | bigint): number

Returns the `number` mathematically equal to _n_ if there is one, or
throws an error otherwise.
**/
math.safeNumber = (n: Integer): number => {
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
export function floorSqrt(n: Integer): bigint {
    const bn = BigInt(n)
    return isqrt(bn)
}
math.floorSqrt = (n: Integer): bigint => isqrt(BigInt(n))

/** md
#### modulo(n: number | bigint, modulus: number | bigint): bigint

Returns the smallest nonnegative bigint congruent to _n_ modulo
_modulus_; this is also the remainder upon dividing _n_ by _modulus_. Note
that this is the "mathematician's modulus" that never returns a negative
value, unlike the built-in JavaScript `%` operator.

Throws a RangeError if _modulus_ is nonpositive.
**/
math.modulo = (n: Integer, modulus: Integer): bigint => {
    const bn = BigInt(n)
    const bmodulus = BigInt(modulus)
    if (bmodulus <= 0n) {
        throw new RangeError(`Attempt to use nonpositive modulus ${bmodulus}`)
    }
    const result = bn % bmodulus
    return result < 0n ? result + bmodulus : result
}

/** md
#### divides(a: number| bigint, b: number | bigint): boolean

Returns true if and only if the integer _a_ divides (evenly into) the integer
_b_.
**/
math.divides = (a: Integer, b: Integer): boolean => {
    let an = BigInt(a)
    if (an === 0n) return b >= 0 && b <= 0
    if (an < 0n) an = -an
    return math.modulo(b, a) === 0n
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
math.powmod = modPow

const nlg16 = Math.log(16)

/** md
#### natlog(n: number | bigint): number

Returns the natural log of the input.
**/
math.natlog = (n: Integer): number => {
    if (typeof n === 'number') return Math.log(n)
    if (n < 0) return NaN

    const s = n.toString(16)
    const s15 = s.substring(0, 15)

    return nlg16 * (s.length - s15.length) + Math.log(Number('0x' + s15))
}

/** md
#### bigabs(n: number | bigint): bigint

returns the absolute value of a bigint (or number)
**/
math.bigabs = (a: Integer): bigint => {
    const n = BigInt(a)
    if (n < 0n) return -n
    return n
}
