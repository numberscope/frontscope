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

// ExtendedBigint is the type of bigints completed with ±infinity
const inf: ExtendedBigint = math.posInfinity
const neginf: ExtendedBigint = math.negInfinity

// Like Math.floor, but with BigInt result type:
const negTwo: bigint = math.bigInt(-1.5)

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

const twelve: ExtendedBigint = math.bigmax(5n, 12, -3)
const negthree: ExtendedBigint = math.bigmin(5n, 12, -3)
const anotherNegInf = math.bigmin(5n, math.negInfinity, -3)
```

### Detailed function reference
**/

import isqrt from 'bigint-isqrt'
import {modPow} from 'bigint-mod-arith'
import {create, all} from 'mathjs'
import type {MathJsInstance} from 'mathjs'

type Integer = number | bigint

// eslint-disable-next-line no-loss-of-precision
export type TposInfinity = 1e999 // since that's above range for number,
// it becomes the type for IEEE Infinity ("official" hack to make this type,
// see https://github.com/microsoft/TypeScript/issues/31752)
// eslint-disable-next-line no-loss-of-precision
export type TnegInfinity = -1e999 // similarly
export type ExtendedBigint = bigint | TposInfinity | TnegInfinity

type ExtendedMathJs = MathJsInstance & {
    negInfinity: TnegInfinity
    posInfinity: TposInfinity
    safeNumber(n: Integer): number
    bigadd(a: Integer, b: Integer): ExtendedBigint
    bigsub(a: Integer, b: Integer): ExtendedBigint
    bigmul(a: Integer, b: Integer): ExtendedBigint
    floorSqrt(n: Integer): bigint
    modulo(n: Integer, modulus: Integer): bigint
    bigIsFinite(n: Integer): boolean
    divides(a: Integer, b: Integer): boolean
    powmod(n: Integer, exponent: Integer, modulus: Integer): bigint
    natlog(n: Integer): number
    bigInt(a: Integer): bigint
    bigabs(a: Integer): bigint
    bigmax(...args: Integer[]): ExtendedBigint
    bigmin(...args: Integer[]): ExtendedBigint
}

export const math = create(all) as ExtendedMathJs

math.negInfinity = -Infinity as TnegInfinity
math.posInfinity = Infinity as TposInfinity

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
#### bigadd(a: number | bigint, b: number | bigint): number

Returns the `number` mathematically equal to the sum of _a_ and _b_.
**/

// Extend the math module to add arithmetic operations for ExtendedBigint
math.bigadd = (a: ExtendedBigint, b: ExtendedBigint): ExtendedBigint => {
    if (a === math.posInfinity || b === math.posInfinity)
        return math.posInfinity
    if (a === math.negInfinity || b === math.negInfinity)
        return math.negInfinity
    return BigInt(a) + BigInt(b)
}

/** md
#### bigsub(a: number | bigint, b: number | bigint): number

Returns the `number` mathematically equal to the difference of _a_ and _b_.
**/
math.bigsub = (a: ExtendedBigint, b: ExtendedBigint): ExtendedBigint => {
    if (a === math.posInfinity || b === math.negInfinity)
        return math.posInfinity
    if (a === math.negInfinity || b === math.posInfinity)
        return math.negInfinity
    return BigInt(a) - BigInt(b)
}

/** md
#### bigmul(a: number | bigint, b: number | bigint): number

Returns the `number` mathematically equal to the product of _a_ and _b_.
**/
math.bigmul = (a: ExtendedBigint, b: ExtendedBigint): ExtendedBigint => {
    if (a === 0n || b === 0n) return 0n
    if (a === math.posInfinity || b === math.posInfinity)
        return a === math.posInfinity && b === math.posInfinity
            ? math.posInfinity
            : BigInt(a) < 0n || BigInt(b) < 0n
              ? math.negInfinity
              : math.posInfinity
    if (a === math.negInfinity || b === math.negInfinity)
        return a === math.negInfinity && b === math.negInfinity
            ? math.posInfinity
            : BigInt(a) < 0n || BigInt(b) < 0n
              ? math.posInfinity
              : math.negInfinity
    return BigInt(a) * BigInt(b)
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
#### isFinite(n: number| bigint): boolean

Returns true if and only if the input is a finite number
**/
math.bigIsFinite = (n: Integer): boolean => {
    if (n === Infinity || n === -Infinity) return false
    return true
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
#### bigInt(n: number | bigint): bigint

Returns the floor of n as a bigint
**/
math.bigInt = (n: Integer): bigint => {
    if (typeof n === 'bigint') return n
    return BigInt(Math.floor(n))
}

/** md
#### bigabs(n: number | bigint): bigint

returns the absolute value of a bigint or an integer number
**/
math.bigabs = (a: Integer): bigint => {
    const n = BigInt(a)
    if (n < 0n) return -n
    return n
}

/** md
#### bigmax(...args: number | bigint): ExtendedBigint

returns the largest its arguments, which may be bigints and/or integer
numbers. Note the result has to be an extended bigint because one of the
numbers might be Infinity.
**/
math.bigmax = (...args: Integer[]): ExtendedBigint => {
    let ret: ExtendedBigint = math.negInfinity
    for (const a of args) {
        if (a > ret) {
            if (a === math.posInfinity) return math.posInfinity
            if (typeof a === 'number') ret = BigInt(a)
            else ret = a
        }
    }
    return ret
}

/** md
#### bigmin(...args: number | bigint): ExtendedBigint

returns the smallest of its arguments, with the same conditions as bigmax.
**/
math.bigmin = (...args: Integer[]): ExtendedBigint => {
    let ret: ExtendedBigint = math.posInfinity
    for (const a of args) {
        if (a < ret) {
            if (a === math.negInfinity) return math.negInfinity
            if (typeof a === 'number') ret = BigInt(a)
            else ret = a
        }
    }
    return ret
}
