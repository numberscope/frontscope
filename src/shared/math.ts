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
of the other facilities available. We also have some additional tips for
[working with bigint numbers](../../doc/working-with-bigints.md) in
Numberscope.

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
import {all, create, factory} from 'mathjs'
import type {EvalFunction, MathJsInstance, MathType, SymbolNode} from 'mathjs'
import temml from 'temml'

import type {ValidationStatus} from './ValidationStatus'
import {chroma, overlay} from './Chroma'
import type {Chroma} from './Chroma'

export type {MathNode, SymbolNode} from 'mathjs'
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
    floorSqrt(n: Integer): bigint
    modulo(n: Integer, modulus: Integer): bigint
    divides(a: Integer, b: Integer): boolean
    powmod(n: Integer, exponent: Integer, modulus: Integer): bigint
    natlog(n: Integer): number
    bigInt(a: Integer): bigint
    bigabs(a: Integer): bigint
    bigmax(...args: Integer[]): ExtendedBigint
    bigmin(...args: Integer[]): ExtendedBigint
    chroma: typeof chroma
    add: MathJsInstance['add'] & ((c: Chroma, d: Chroma) => Chroma)
    multiply: MathJsInstance['multiply'] &
        ((s: number, c: Chroma) => Chroma) &
        ((c: Chroma, s: number) => Chroma)
}

export const math = create(all) as ExtendedMathJs

/** Add colors to mathjs **/
// @ts-expect-error: not in mathjs type declarations
math.typed.addType({
    name: 'Chroma',
    test: (c: unknown) =>
        typeof c === 'object' && c && c.constructor.name === 'Color',
})

const colorStuff: Record<string, unknown> = {
    chroma,
    add: math.typed('add', {'Chroma, Chroma': (c, d) => overlay(c, d)}),
    multiply: math.typed('multiply', {
        'number, Chroma': (s, c) => chroma(c).alpha(s * c.alpha()),
        'Chroma, number': (c, s) => chroma(c).alpha(s * c.alpha()),
    }),
}
// work around omission of `colors` property in @types/chroma-js
for (const name in (chroma as unknown as {colors: Record<string, string>})
    .colors) {
    colorStuff[name] = factory(name, [], () => chroma(name))
}

math.import(colorStuff)

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

/* Helper for outputting scopes: */
type ScopeType = Record<string, MathType | Record<string, number>>
function scopeToString(scope: ScopeType) {
    return Object.entries(scope)
        .map(([variable, value]) => `${variable}=${math.format(value)}`)
        .join(', ')
}
const maxWarns = 3
const mathMark = 'mathjs: '
/**
 * Class to encapsulate a mathjs formula
 */
export class MathFormula {
    evaluator: EvalFunction
    inputs: string[]
    source: string
    canonical: string
    latex: string
    mathml: string
    freevars: string[]
    constructor(fmla: string, inputs?: string[]) {
        // Preprocess formula to interpret "bare" color constants #hhhhhh
        const prepfmla = fmla.replaceAll(
            /(?<!["'])(#[0-9a-fA-f]{3,8})/g,
            'chroma("\\1")'
        )
        if (prepfmla !== fmla) console.log('PREPPED', fmla, prepfmla)
        const parsetree = math.parse(fmla)
        this.freevars = parsetree
            .filter((node, path) => math.isSymbolNode(node) && path !== 'fn')
            .map(node => (node as SymbolNode).name)
        if (inputs) {
            this.inputs = inputs
        } else {
            // inputs default to all free variables
            this.inputs = this.freevars
        }
        this.source = fmla
        this.canonical = parsetree.toString({parenthesis: 'auto'})
        this.latex = 'a_n = ' + parsetree.toTex({parenthesis: 'auto'})
        this.mathml = temml.renderToString(this.latex, {wrap: 'tex'})
        this.evaluator = parsetree.compile()
    }
    /**
     * The recommended way to obtain the value of a mathjs formula object:
     * Call it with a ValidationStatus object, and either the values for
     * the input variables (if any) as additional arguments, or a single
     * plain object with keys the input variable names and values their
     * values to be used in computing the formula.
     * It checks for errors in the computation and if any occur, adds
     * warnings to the provided status object.
     * @param {ValidationStatus} status  The object to report warnings to
     * @param {object | MathType, MathType, ...} the inputs to the formula
     * @returns {MathType} the result of evaluating the formula
     */
    computeWithStatus(
        status: ValidationStatus,
        a: number | Record<string, number>,
        ...rst: number[]
    ) {
        let scope: ScopeType = {}
        if (typeof a === 'object' && this.inputs.every(i => i in a)) {
            scope = a
        } else {
            scope = {[this.inputs[0]]: a}
            for (let ix = 0; ix < rst.length; ++ix) {
                scope[this.inputs[ix + 1]] = rst[ix]
            }
        }
        let result: MathType = 0
        try {
            result = this.evaluator.evaluate(scope)
        } catch (err: unknown) {
            let nWarns = status.warnings.reduce(
                (k, warning) => k + (warning.startsWith(mathMark) ? 1 : 0),
                0
            )
            nWarns++ // We're about to add one
            if (nWarns < maxWarns) {
                status.addWarning(
                    `${mathMark}value for ${scopeToString(scope)} set to `
                        + `${result} because of `
                        + (err instanceof Error
                            ? err.message
                            : 'of unknown error.')
                )
            } else if (nWarns === maxWarns) {
                status.addWarning(`${mathMark}1 additional warning discarded`)
            } else {
                // replace discarded message
                const warnIndex = status.warnings.findIndex(
                    element =>
                        element.startsWith(mathMark)
                        && element.endsWith('discarded')
                )
                if (warnIndex >= 0) {
                    const oldWarn = status.warnings[warnIndex]
                    status.warnings.splice(warnIndex, 1)
                    nWarns = parseInt(oldWarn.substr(mathMark.length)) + 1
                }
                status.addWarning(
                    `${mathMark}${nWarns} additional warnings discarded`
                )
            }
        }
        return result
    }

    /**
     * The non-recommended way to compute with a mathjs formula object;
     * operates just like computeWithStatus except takes no status
     * argument and does no error checking.
     */
    compute(a: number | Record<string, number>, ...rst: number[]) {
        if (typeof a === 'object' && this.inputs.every(i => i in a)) {
            return this.evaluator.evaluate(a)
        }
        const scope = {[this.inputs[0]]: a}
        for (let ix = 0; ix < rst.length; ++ix) {
            scope[this.inputs[ix + 1]] = rst[ix]
        }
        return this.evaluator.evaluate(scope)
    }
}
