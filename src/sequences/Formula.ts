import {Cached} from './Cached'
import {SequenceExportModule} from './SequenceInterface'

import {math, MathFormula} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'

/** md
# Formula sequence
[<img
  src="../../assets/img/Formula/Beatty.png"
  style="float: right; margin-left: 1em; width: 250px"
/>](../assets/img/Formula/Beatty.png)

The entries of this sequence are given by a mathematical formula that you
enter in its parameters tab; for example `(n+1)n/2` would generate the
triangular numbers. The formula (unless you want it to be a constant, i.e.,
have all of its entries be the same) should mention the variable `n`. To
generate the entry of this sequence at index 15 (say), Numberscope will
substitute the value 15 in for `n` in the formula, and then evaluate the
resulting expression. So to continue the above example, the entry at index
15 of the Formula sequence given by `(n+1)n/2` will be `16*15/2`, or 120.

All familiar arithmetic operations may be used in the formula:

`+, -, *, /`
:   addition, subtraction, multiplication, division. Note that as in typical
    mathematical notation, the `*` for multiplication may be omitted when
    the terms being multiplied can clearly be detected by the formula parser.
    So `2n` is the same as `2*n`, but you can't write `ncos(n)` for `n*cos(n)`
    because the parser doesn't know whether you perhaps meant the function
    name to be `ncos`.

`^`
:   exponentiation, e.g. `2^3` will produce 8

`%`
:   remainder, e.g. `18 % 5` will produce 3 because that's the remainder
    when dividing 18 by 5. Note that this is the so-called "mathematician's
    modulo": it is always a positive number, so `-18 % 5` produces 2, not
    -3 as in JavaScript.

`!`
:   factorial, e.g. `4!` will produce `4*3*2*1` = 24

In addition, there are numerous functions available that you can use, including:

`sqrt()`
:   square root, e.g. `sqrt(25)` will produce 5.

`floor(), round(), ceil()`
:   round to the next lowest, nearest, or next highest whole number,
    respectively. For example, `floor(sqrt(35))` will also produce 5, because
    √35 is between 5 and 6. Note that since Numberscope specifically deals
    with _integer_ sequences, `floor()` is automatically applied to the results
    of your formula if the result is not a whole number. For example, the
    entries of the Formula sequence `n/3` starting at index 0 will be 0, 0, 0,
    1, 1, 1, 2, 2, 2, 3, ...

`exp(), log()`
:   Exponential and logarithm to base _e_.

`sin(), cos(), tan(), sec(), csc(), cot()`
:   Trigonometric functions. To get the inverse of these functions, prepend
    `a` to the name, i.e., `atan(3)` computes the arctangent or inverse
    tangent of 3.

`combinations(n, k)`
:   The (n,k)-th binomial coefficient, or the number of k-element subsets of
    an n-element set.

There are many more; for a full list, see the
[mathjs function reference](https://mathjs.org/docs/reference/functions.html).
(Note that inside a Numberscope formula, you do not need to use the `math.`
prefix shown for every entry in this reference.)

## Parameters
**/
const paramDesc = {
    /** md
-   **Formula:** The mathematical expression that defines the sequence, in
    [mathjs](https://mathjs.org) formula notation. Generally, it should refer
    to the variable `n`, which will be set to the index of an entry in order
    to compute the value of that entry. _(Specified as a string in valid mathjs
    syntax; defaults to `n`, which produces the sequence of natural numbers.)_
    **/
    formula: {
        default: new MathFormula('n'),
        type: ParamType.FORMULA,
        displayName: 'Formula',
        required: true,
    },
} satisfies GenericParamDescription

/** md

Plus the standard parameters for all formulas:
{! Cached.ts extract:
   start: '^\s*[/]\*\*+\W?xmd\b' # Opening like /** xmd
   stop: '^\s*(?:/\*\s*)?\*\*[/]\s*$' # closing comment with two *
!}
**/

const maxWarns = 3
const formulaMark = 'Formula: '

class Formula extends Cached(paramDesc) {
    static category = 'Formula'
    name = `${Formula.category}: ${paramDesc.formula.default}`
    static description = 'A sequence defined by a formula in n'

    initialize(): void {
        super.initialize()
        this.name = formulaMark + this.formula.source
    }

    calculate(n: bigint) {
        let result = 0
        let resultType = ''
        try {
            const rawResult = this.formula.compute(Number(n))
            resultType = typeof rawResult
            result = math.floor(rawResult)
            if (isNaN(result)) {
                result = 0
                throw new Error(
                    `result '${rawResult}' of calculation is `
                        + `not a number.`
                )
            }
        } catch (err: unknown) {
            let nWarns = this.statusOf.formula.warnings.reduce(
                (k, warning) => k + (warning.startsWith(formulaMark) ? 1 : 0),
                0
            )
            nWarns++ // We're about to add one
            if (nWarns < maxWarns) {
                let message =
                    err instanceof Error ? err.message : 'of unkown error.'
                if (resultType && message.includes('convert')) {
                    message = message.replace(
                        'convert',
                        `convert ${resultType} value`
                    )
                }
                this.statusOf.formula.addWarning(
                    `${formulaMark}value for n=${n} set to ${result} `
                        + `because ${message}`
                )
            } else if (nWarns === maxWarns) {
                this.statusOf.formula.addWarning(
                    `${formulaMark}1 additional warning discarded`
                )
            } else {
                // replace discarded message
                const ensure = this.statusOf.formula.warnings.pop() || ''
                console.assert(
                    ensure
                        && ensure.startsWith(formulaMark)
                        && ensure.endsWith('discarded')
                )
                nWarns = parseInt(ensure.substr(formulaMark.length)) + 1
                this.statusOf.formula.addWarning(
                    `${formulaMark}${nWarns} additional warnings discarded`
                )
            }
            return BigInt(result)
        }
        if (result === Infinity) return BigInt(Number.MAX_SAFE_INTEGER)
        else if (result === -Infinity) return BigInt(Number.MIN_SAFE_INTEGER)
        return BigInt(result)
    }
}

export const exportModule = SequenceExportModule.family(Formula)
