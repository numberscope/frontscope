/** md
## Color computations for numberscope

To facilitate color manipulations in visualizers or in formula
parameters to visualizers, the frontscope provides a Chroma class
based on the npm package [chroma-js](https://www.npmjs.com/package/chroma-js).
You can use this class for color mixing and creating palettes and
so on, and then convert the resulting color objects (for example) to
hex strings to use as arguments to the p5 sketch `color` method.

The Chroma color class supports all of the methods documented for
the [chroma-js api](https://www.vis4.net/chromajs/). Additional functions
and facilities for manipulating Chroma colors are documented below.

All of the chroma-js api and operations documented here are also available
in [mathjs formulas](math.md). For example, you can darken a color `x` an
amount controlled by a number `x` by writing `c.darken(x)`, or desaturate it
by writing `c.desaturate(x)`, etc.

In addition, all of the named colors (like
`red` or `chartreuse`, including all CSS (Cascading Style Sheets) named colors)
are available as pre-defined constant symbols, as are the color brewer
palettes, like `RdBu` or `Set1`. Note the palettes are arrays of colors,
so to get a specific color from them in a formula you need to index them
with a 1-based index, e.g., `Set1[5]`.
**/
import type {Color as Chroma} from 'chroma-js'
import chromaRaw from 'chroma-js'
export type {Color as Chroma} from 'chroma-js'

type Quad = [number, number, number, number]
/** md
#### chroma(...)

Rather than directly using a Chroma constructor, the recommended basic way
to create a new Chroma object is via the `chroma()` function, which can
understand a wide assortment of different argument types for flexible
creation of colors. In addition to the possibilities detailed in the
[chroma-js api](https://www.vis4.net/chromajs/), the numberscope `chroma()`
also supports:

- `chroma()` returns opaque black
- `chroma([r: number, g: number, b: number, a: number])` gives a color
  with the four channels specified as numbers between 0 and 1 inclusive.
- `chroma(l: number)` when `l` is between 0 and 1 produces an opaque greyscale
  color from black to white, respectively. (Note when `l` is an integer
  larger than one, this reverts to the usual chroma-js api meaning, in
  which the number is converted to a hex string and then interpreted as
  a color code.)
- `chroma(name: string, a: number)` produces the same color as `chroma(name)`
  but with its alpha channel set to _a_.
- If all of the arguments to the usual
  `chroma(r: number, g: number, b: number, a?:number)` signature are numbers
  between 0 and 1, they are interpreted on that scale, rather than the
  default [0...255] scale.

All of the other functions below also return Chroma objects unless otherwise
noted.
**/
export const chroma = function (...args: unknown[]) {
    if (args.length === 0) return chromaRaw('black')
    if (args.length === 1) {
        const arg = args[0]
        if (arg instanceof Array && arg.length === 4) {
            return chromaRaw(...(arg as Quad), 'gl')
        }
        if (typeof arg === 'number') {
            // Can't think of any natural meaning for negative numbers,
            // so just ignore sign
            const n: number = Math.abs(arg)
            if (n <= 1.0) {
                return chromaRaw(n, n, n, 1, 'gl')
            }
            if (n > 0xffffff) {
                // largest number chroma interprets
                if (n < 0xffffffff) {
                    // interpret last two digits as alpha
                    const alpha = n % 0x100
                    const rest = Math.floor(n / 0x100)
                    return chromaRaw(rest).alpha(alpha / 0xff)
                } else {
                    // what color should huge numbers be?
                    return chromaRaw('white')
                }
            }
            return chromaRaw(n)
        }
    }
    if (
        args.length === 2
        && typeof args[0] === 'string'
        && typeof args[1] === 'number'
    ) {
        return chromaRaw(args[0]).alpha(args[1])
    }
    if (
        args.length >= 3
        && typeof args[0] === 'number'
        && typeof args[1] === 'number'
        && typeof args[2] === 'number'
        && args[0] <= 1.0
        && args[1] <= 1.0
        && args[2] <= 1.0
    ) {
        if (args.length === 3) {
            return chromaRaw(args[0], args[1], args[2], 1, 'gl')
        }
        if (
            args.length === 4
            && typeof args[3] === 'number'
            && args[3] <= 1.0
        ) {
            args.push('gl')
        }
    }
    return chromaRaw(...(args as Parameters<typeof chromaRaw>))
} as typeof chromaRaw &
    ((col: string, alpha: number) => Chroma) &
    ((quad: Quad) => Chroma) &
    (() => Chroma)

Object.assign(chroma, chromaRaw)
const dummy = chroma('white')
const chromaConstructor = dummy.constructor

/** md
#### rainbow(hue: bigint | number)

This function conveniently allows creation of an opaque color from just
a "hue angle" in color space, periodically interpreted with the main period
from 0 to 360. It uses the "oklch" color space provided by chromajs to ensure
that all of the colors it returns will have approximately the same apparent
lightness and hue saturation (and hopefully these levels have been selected
to produce attractive colors).
**/
export function rainbow(hue: bigint | number): Chroma {
    if (typeof hue === 'bigint') hue = Number(hue % 360n)
    return chroma.oklch(0.6, 0.25, hue % 360)
}

/** md
#### isChroma(x: unknown): x is Chroma

A TypeScript type guard to discern Chroma objects.
**/
export function isChroma(c: unknown): c is Chroma {
    return (
        typeof c === 'object'
        && c != null
        && c.constructor === chromaConstructor
    )
}

const ALPHA = 3
/** md
#### overlay(bottom: Chroma, top: Chroma)

Returns the result of alpha-compositing _top_ on top of _bottom_. For example,
if _top_ is opaque (has alpha channel equal to one), this will just give
_top_ back. This operation is available in mathjs formulas using the ordinary
addition operator `+`, but note that it is _not_ commutative.
**/
export function overlay(bot: Chroma, top: Chroma): Chroma {
    const retgl = top.gl()
    if (retgl.length < 4 || isNaN(retgl[ALPHA]) || retgl[ALPHA] >= 1.0) {
        return chromaRaw(top)
    }
    const topa = retgl[ALPHA]
    const botgl = bot.gl()
    const bota = botgl[ALPHA] ?? 1.0
    for (let c = 0; c <= ALPHA; ++c) {
        let botval = botgl[c]
        if (c < ALPHA) {
            retgl[c] *= topa
            botval *= bota
        }
        retgl[c] += botval * (1 - topa)
    }
    return chromaRaw(...retgl, 'gl')
}

/** md
#### dilute(color: Chroma, factor: number)

Returns a newly-created Chroma object the same as _color_ except that
its alpha value has been multiplied by _factor_. This operation is available
in mathjs formulas using the ordinary multiplication operator `*`, and in
such formulas, the color and factor may appear in either order.

Combining the previous two operations in a linear combination in a
mathjs formula such as `red + x*blue` provides one reasonable way to morph
smoothly from `red` to `blue` as `x` goes from 0 to 1, but note that when
the colors used as endpoints are on opposite sides of the color wheel, the
colors in the middle of this trajectory will be rather greyish/muddy. See the
[chroma-js api](https://www.vis4.net/chromajs/) for other ways of creating
color scales if direct alpha-compositing produces undesirable results.
**/
export function dilute(color: Chroma, factor: number) {
    return chroma(color).alpha(factor * color.alpha())
}
