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

Note that currently all of the numerical extension functions described below
accept either `number` or `bigint` inputs for all arguments and convert them
to bigints as needed.

In addition, math formulas may create and manipulate colors using
[Chroma](./Chroma.md) objects and functions. The formulas extend the hue
argument to of the `rainbow` function to any value that can be converted
into a bigint or number, and to complex numbers by taking their so-called
argument angle as the hue angle.

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

const fifteen: number = math.triangular(5)
const four: bigint = math.invTriangular(14n)

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

const orangey = math.evaluate('rainbow(1+i)')
// depends just on arg of a complex number input
```

### Detailed function reference
**/

import isqrt from 'bigint-isqrt'
import {modPow} from 'bigint-mod-arith'
import {all, create, factory} from 'mathjs'
import type {
    EvalFunction,
    Fraction,
    MathCollection,
    MathJsInstance,
    MathNode,
    MathType,
    MathScalarType,
    Matrix,
    Unit,
} from 'mathjs'
import temml from 'temml'

import type {ValidationStatus} from './ValidationStatus'
import {chroma, isChroma, dilute, overlay, rainbow} from './Chroma'
import type {Chroma} from './Chroma'

export type {MathType, MathNode, SymbolNode} from 'mathjs'
type Integer = number | bigint
type MathTypeTemp = MathType | bigint // REMOVE after mathjs update

/**
 *
 * @class CachingError
 * extends the built-in Error class to indicate that a cache is trying
 * to be accessed while it is being filled, or other caching impropriety.
 */
export class CachingError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CachingError' // (2)
    }
}

// eslint-disable-next-line no-loss-of-precision
export type TposInfinity = 1e999 // since that's above range for number,
// it becomes the type for IEEE Infinity ("official" hack to make this type,
// see https://github.com/microsoft/TypeScript/issues/31752)
// eslint-disable-next-line no-loss-of-precision
export type TnegInfinity = -1e999 // similarly
export type ExtendedBigint = bigint | TposInfinity | TnegInfinity
export type MathAnyScalar = MathScalarType | Chroma | Fraction | boolean
type Widen<T extends number | bigint> = T extends number
    ? number
    : T extends bigint
      ? bigint
      : number | bigint

type ExtendedMathJs = Omit<MathJsInstance, 'hasNumericValue' | 'add'> & {
    negInfinity: TnegInfinity
    posInfinity: TposInfinity
    safeNumber(n: MathTypeTemp): number
    floorSqrt(n: Integer): bigint
    modulo(n: Integer, modulus: Integer): bigint
    divides(a: Integer, b: Integer): boolean
    powmod(n: Integer, exponent: Integer, modulus: Integer): bigint
    natlog(n: Integer): number
    bigInt(a: Integer): bigint
    bigabs(a: Integer): bigint
    bigmax(...args: Integer[]): ExtendedBigint
    bigmin(...args: Integer[]): ExtendedBigint
    triangular<T extends Integer>(n: T): Widen<T>
    invTriangular<T extends Integer>(n: T): Widen<T>
    chroma: typeof chroma
    rainbow(a: Integer, opacity?: number): Chroma
    isChroma(a: unknown): a is Chroma
    add: ((c: Chroma, d: Chroma) => Chroma) &
        ((v: number[], a: number) => number[]) &
        ((v: number[], w: number[]) => number[]) &
        ((a: MathType, b: MathType) => MathType)
    and: MathJsInstance['and'] &
        ((a: boolean, b: boolean) => boolean) &
        ((a: MathAnyScalar, b: MathAnyScalar) => MathAnyScalar)
    or: MathJsInstance['or'] &
        ((a: boolean, b: boolean) => boolean) &
        ((a: MathAnyScalar, b: MathAnyScalar) => MathAnyScalar)
    hasNumericValue(x: unknown): x is MathScalarType
    multiply: MathJsInstance['multiply'] &
        ((s: number, c: Chroma) => Chroma) &
        ((c: Chroma, s: number) => Chroma)
    Unit: Unit & {BASE_UNITS: {ANGLE: Unit}; UNITS: Record<string, Unit>}
}

export const math = create(all, {matrix: 'Array'}) as ExtendedMathJs

/** Add colors to mathjs **/
// @ts-expect-error: not in mathjs type declarations
math.typed.addType({
    name: 'Chroma',
    test: isChroma,
})

const colorStuff: Record<string, unknown> = {
    chroma,
    rainbow: (h: MathScalarType | bigint, opacity = 1) => {
        if (math.isComplex(h)) h = (math.arg(h) * 180) / math.pi
        else if (typeof h !== 'number' && typeof h !== 'bigint') {
            h = math.number(h)
        }
        return rainbow(h, opacity)
    },
    add: math.typed('add', {'Chroma, Chroma': (c, d) => overlay(c, d)}),
    isChroma,
    multiply: math.typed('multiply', {
        'number, Chroma': (s, c) => dilute(c, s),
        'Chroma, number': dilute,
    }),
    typeOf: math.typed('typeOf', {Chroma: () => 'Chroma'}),
    boolean: math.typed('boolean', {
        Chroma: c => c.alpha() > 0,
        Complex: z => z.re !== 0 || z.im !== 0,
        Fraction: r => !r.equals(r.neg()),
        Unit: u => !!u.value,
    }),
}

// work around omission of `colors` property in @types/chroma-js
for (const name in (chroma as unknown as {colors: Record<string, string>})
    .colors) {
    colorStuff[name] = factory(name, [], () => chroma(name))
}
let palette: keyof typeof chroma.brewer = 'RdBu'
for (palette in chroma.brewer) {
    const clrs = chroma.brewer[palette].map(hx => chroma(hx))
    colorStuff[palette] = factory(palette, [], () => clrs)
}

/** Additional numerical functions for mathjs **/

/** md
#### triangular(n: number | bigint): typeof n

Returns the _n_-th triangular number, preserving the type of the input.

#### invTriangular(t: number | bigint): typeof t

Returns the index of the largest triangular number less than or equal to
_t_, again preserving the type of the input.

**/

function triangular(n: number): number
function triangular(n: bigint): bigint
function triangular(n: number | bigint) {
    let d = n as number // lie so typescript will compile
    const one = n ? d / d : ++d / d--
    return ((d * (d + one)) / (one + one)) as typeof n
}

const numberTheory: Record<string, unknown> = {
    triangular,
    invTriangular: math.typed('invTriangular', {
        number: t => Math.floor((Math.sqrt(1 + 8 * t) - 1) / 2),
        any: b => {
            // FIXME when mathjs has bigint support
            if (typeof b !== 'bigint') return 0n
            return (isqrt(1n + 8n * b) - 1n) / 2n
        },
    }),
}

math.import({...numberTheory, ...colorStuff})

/* Fix up and/or so they will work with any mathjs type */
function logicalFn(invert: boolean) {
    function logicalCombiner(...callArgs: unknown[]) {
        let input: MathNode[] = []
        let unevaluated = false
        let scope: unknown = undefined
        let last = callArgs.length
        /* First check if we are being called from the expression parser */
        if (
            last === 3
            && Array.isArray(callArgs[0])
            && math.isNode(callArgs[0][0])
        ) {
            input = callArgs[0]
            last = input.length
            unevaluated = true
            scope = callArgs[2]
        }
        let value: unknown = invert
        let collection = false
        let terminated = false
        for (let i = 0; i < last; ++i) {
            const arg = unevaluated ? input[i].evaluate(scope) : callArgs[i]
            const argColl = math.isCollection(arg)
            if (collection) {
                if (argColl) {
                    const newValue: unknown[] = []
                    const valueArray: unknown[] = Array.isArray(value)
                        ? value
                        : (value as Matrix).valueOf()
                    const argArray: unknown[] = Array.isArray(arg)
                        ? arg
                        : arg.valueOf()
                    for (let j = 0; j < valueArray.length; ++j) {
                        newValue.push(
                            logicalCombiner(valueArray[j], argArray[j])
                        )
                    }
                    value = newValue
                } else {
                    value = math.map(value as MathCollection, elt =>
                        logicalCombiner(elt, arg)
                    )
                }
            } else {
                if (argColl) {
                    value = math.map(arg, elt => logicalCombiner(value, elt))
                    collection = true
                } else {
                    // scalar-scalar case, in which we don't consider any
                    // more arguments once the truth value is determined,
                    // except that in the non-short-circuiting (direct
                    // JavaScript call) case, we continue in case we encounter
                    // a collection.
                    if (terminated) continue
                    let test = math.boolean(arg)
                    if (invert) test = !test
                    if (test) {
                        if (unevaluated) return arg
                        terminated = true
                    }
                    value = arg
                }
            }
        }
        return value
    }
    logicalCombiner.rawArgs = true
    return logicalCombiner
}

math.import({and: logicalFn(true), or: logicalFn(false)}, {override: true})

math.negInfinity = -Infinity as TnegInfinity
math.posInfinity = Infinity as TposInfinity

const maxSafeNumber = BigInt(Number.MAX_SAFE_INTEGER)
const minSafeNumber = BigInt(Number.MIN_SAFE_INTEGER)

/** md
#### safeNumber(n: MathType): number

Returns the `number` mathematically equal to _n_ if there is one, or
throws an error otherwise.
**/
math.safeNumber = (n: MathTypeTemp): number => {
    if (typeof n === 'bigint' || typeof n === 'number') {
        if (n < minSafeNumber || n > maxSafeNumber) {
            throw new RangeError(
                `Attempt to use ${typeof n} ${n} as a number`
            )
        }
        return Number(n)
    }
    if (math.isFraction(n) || math.isBigNumber(n)) {
        if (
            math.smaller(n, Number.MIN_SAFE_INTEGER)
            || math.larger(n, Number.MAX_SAFE_INTEGER)
        ) {
            throw new RangeError(
                `Attempt to use ${math.typeOf(n)} ${n} as a number`
            )
        }
    }
    if (math.isComplex(n)) {
        throw new RangeError(`Attempt to use Complex ${n} as a number`)
    }
    if (math.hasNumericValue(n)) return math.number(n)
    throw new RangeError(`Attempt to use non-numeric ${n} as a number`)
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
type ScopeValue = MathType | Record<string, number> | ((x: never) => MathType)
type ScopeType = Record<string, ScopeValue>
function scopeToString(scope: ScopeType) {
    return Object.entries(scope)
        .map(([variable, value]) => `${variable}=${math.format(value)}`)
        .join(', ')
}
const angleDimension = math.Unit.BASE_UNITS.ANGLE.dimensions.findIndex(d => d)
const angleUnits = new Set(
    Object.keys(math.Unit.UNITS).filter(
        u => math.Unit.UNITS[u].dimensions[angleDimension]
    )
)
const maxWarns = 3
const mathMark = 'mathjs: '
/**
 * Class to encapsulate a mathjs formula
 */
export class MathFormula {
    evaluator: EvalFunction
    symbols: readonly string[]
    source: string
    canonical: string
    latex: string
    mathml: string
    freevars = new Set<string>()
    freefuncs = new Set<string>()
    static preprocess(fmla: string) {
        // Interpret "bare" color constants #hhhhhh
        return fmla.replaceAll(
            /(?<!["'])(#[0123456789abcdefABCDEF]{3,8})/g,
            'chroma("$1")'
        )
    }
    constructor(fmla: string, symbols?: readonly string[]) {
        // Preprocess formula to interpret "bare" color constants #hhhhhh
        const prefmla = MathFormula.preprocess(fmla)
        const parsetree = math.parse(prefmla)
        parsetree.traverse((node, path) => {
            if (
                math.isSymbolNode(node)
                && !(node.name in math || angleUnits.has(node.name))
            ) {
                if (path === 'fn') this.freefuncs.add(node.name)
                else this.freevars.add(node.name)
            }
        })
        if (symbols) this.symbols = symbols
        else {
            // symbols default to all free variables
            this.symbols = Array.from(this.freevars)
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
     * the allowed symbols (if any) as additional arguments, or a single
     * plain object with keys the symbol names and values their values to
     * be used in computing the formula.
     * It checks for errors in the computation and if any occur, adds
     * warnings to the provided status object.
     * @param {ValidationStatus} status  The object to report warnings to
     * @param {object | MathType, MathType, ...}
     *     the symbol meanings for computing the formula
     * @returns {MathType} the result of evaluating the formula
     */
    computeWithStatus(
        status: ValidationStatus,
        a: number | ScopeType,
        ...rst: number[]
    ) {
        let scope: ScopeType = {}
        if (typeof a === 'object') {
            if (this.symbols.every(i => i in a)) scope = a
            else
                throw new TypeError(
                    `symbol definitions missing to compute '${this.source}'`
                )
        } else {
            scope = {[this.symbols[0]]: a}
            for (let ix = 0; ix < rst.length; ++ix) {
                scope[this.symbols[ix + 1]] = rst[ix]
            }
        }
        let result: MathType = 0
        try {
            result = this.evaluator.evaluate(scope)
        } catch (err: unknown) {
            // re-throw caching errors so the infrastructure can deal with
            // them
            if (err instanceof CachingError) throw err
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
        if (typeof a === 'object' && this.symbols.every(i => i in a)) {
            return this.evaluator.evaluate(a)
        }
        const scope = {[this.symbols[0]]: a}
        for (let ix = 0; ix < rst.length; ++ix) {
            scope[this.symbols[ix + 1]] = rst[ix]
        }
        return this.evaluator.evaluate(scope)
    }
}
