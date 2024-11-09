import {SequenceExportModule} from './SequenceInterface'
import {Cached} from './Cached'

import {math} from '@/shared/math'
import {ParamType} from '@/shared/ParamType'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'

/** md
# Random sequence
[<img
  src="../../assets/img/Random/LittleBoxes.png"
  style="margin-left: 1em; margin-right: 0.5em; max-width: 696px"
/>](../assets/img/Random/LittleBoxes.png)

The entries of this sequence are computer-generated pseudo-random integers
in a specified range. Each integer in the range is equally likely. There
is not intended to be any correlation between successive entries of the
sequence, but pseudo-random generators vary in quality and the authors of
Numberscope have not tested the one used here for its serial independence
or other measures of quality of randomness.

Note that the particular entries of an instance of this sequence remain fixed
as you change the parameters of the visualizer, or use the "restart" button
in the [Numberscope title bar](../../doc/user_guide.md). They also remain
fixed if you change the first index, last index, or number of terms to use.

They are re-sampled (and so any or all of the entries may change) if you
reload the web page (with your browser's reload button, or by re-opening
the same URL) or if you change the upper or lower limits that may be selected.

If you want a (pseudo)random sequence that will be the same every time you
load the page (maybe you want to send your visualization to a friend and make
sure that they see _exactly_ the same thing that you do), you can insert the
setting `randomSeed=XXXXX&` just after the `?` in the URL (note the
`XXXXX` can be any characters you like -- you can try different possibilities
until you get results that you're comfortable with). You just type this
additional setting directly into the URL bar of your browser; there's
currently nowhere to specify the randomSeed in the Numberscope user interface.

## Parameters
**/

const paramDesc = {
    /** md
-   **Minimum value:** The smallest integer that may occur as an entry of
    this random sequence. Note this value will possibly occur; one less
    than it will never occur.
    **/
    min: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Minimum value attainable',
        required: true,
    },
    /** md
-   **Maximum value:** The largest integer that may occur as an entry of
    this random sequence. Note this value will possibly occur; one more
    than it will never occur.
    **/
    max: {
        default: 9,
        type: ParamType.INTEGER,
        displayName: 'Maximum value attainable',
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

/**
 * Note that unlike most sequence classes, this one is also exported
 * directly, not just through the exportModule. That is for purposes
 * of testing the caching infrastructure, see ./__tests__/Cached.spec.ts.
 */
export class Random extends Cached(paramDesc) {
    name = 'uninitialized random integers'
    static category = 'Random Integers'
    static description =
        'A sequence of integers chosen independently and '
        + 'uniformly from a finite interval'

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.max < params.min)
            status.addError('The max value cannot be less than the min.')

        return status
    }

    initialize() {
        super.initialize()
        this.name = `Random integers ${this.min} to ${this.max}`
    }

    calculate(_n: bigint) {
        // create a random integer between min and max inclusive
        return BigInt(math.randomInt(this.min, this.max + 1))
    }
}

export const exportModule = SequenceExportModule.family(Random)
