import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'

import {math, MathFormula} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Mod Fill Visualizer

[<img src="../../assets/img/ModFill/PrimeResidues.png" width="320"
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/ModFill/PrimeResidues.png)
[<img src="../../assets/img/ModFill/DanceNo73.png" width="320"
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/ModFill/DanceNo73.png)
[<img src="../../assets/img/ModFill/OEISA070826.png" width="320"
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/ModFill/OEISA070826.png)

The _m_-th column of this triangular diagram (reading left to right)
has _m_ cells (lowest is 0, highest is m-1), which are colored
each time the corresponding residue modulo _m_ occurs for
some entry of the sequence. The sequence terms _a_(_n_) are considered in
order, filling the corresponding cells in turn, so you can get an
idea of when various residues occur by watching the order
the cells are filled in as the diagram is drawn. You specify how to compute
the color used for filling each cell with the formula in the `Fill color`
option.

## Parameters
**/
const paramDesc = {
    /** md
- Highest modulus: The number of columns to display, which corresponds
to the largest modulus to consider.
     **/
    // note will be small enough to fit in a `number` when we need it to.
    modDimension: {
        default: 150n,
        type: ParamType.BIGINT,
        displayName: 'Highest modulus shown',
        required: true,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0) status.addError('Must be positive.')
        },
    },
    /** md
- Background color: The color of the background
     **/
    backgroundColor: {
        default: '#FFFFFFFF',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },
    /** md
- Fill color: A formula which computes the color used to fill each cell as it
is drawn. See the [Chroma](../shared/Chroma.md) documentation for ways to
specify colors in a formula. The formula may use any of the following variables,
the values of which will be predefined for you:
     - `a`, the current entry of the sequence,
     - `n`, the current index in the sequence,
     - `m`, the modulus represented by the current cell.

To recover the residue of the current cell being filled, use the expression
`a % m`.

     **/
    fillColor: {
        default: new MathFormula('black'),
        type: ParamType.FORMULA,
        symbols: ['n', 'a', 'm'],
        displayName: 'Fill color',
        description:
            'A formula to compute the color that each cell relating '
            + 'to a given sequence entry will be filled with. May use '
            + 'variables `a` for the current sequence entry, `n` for the '
            + 'sequence index, and/or `m` for the modulus.',
        required: false,
    },
    /** md
- Square canvas:  If true, force canvas to be aspect ratio 1 (square).
Defaults to false.
     **/
    aspectRatio: {
        default: 0,
        type: ParamType.BOOLEAN,
        displayName: 'Square canvas',
        required: false,
    },
    /** md
- Sunzi mode: Warning: can create a stroboscopic effect. If true, the
background is redrawn on every frame. If the background color is opaque or
nearly so, this mode creates a stroboscopic effect in which only the residues
of the current sequence element are visible in each frame. (It can help to
turn down the Frame rate if the visual effect is too jarring.) If the opacity
of the background is roughly 0.05, turning on the Sunzi mode has a
"history fading effect," in that the contribution of long past terms fades
into the background. This parameter is named for Sunzi's Theorem (also known
as the Chinese Remainder Theorem).
     **/
    sunzi: {
        default: 0,
        type: ParamType.BOOLEAN,
        displayName: 'Sunzi effect',
        description:
            'If true, the canvas background colour is re-painted between '
            + 'each term of the sequence.  Warning: a true setting can '
            + 'create a stroboscopic effect. With a nearly transparent '
            + 'background color, this creates an effect of fading the '
            + 'residues displayed by earlier sequence values over time.',
        required: false,
        validate: function (n: number, status: ValidationStatus) {
            if (n < 0 || n > 1) status.addError('Must be between 0 and 1.')
        },
    },
    /** md
- Frame rate: Entries displayed per second.  Can be useful in combination with
Sunzi mode. Only visible when Sunzi mode is true.
     **/
    frameRate: {
        default: 60,
        type: ParamType.NUMBER,
        displayName: 'Frame rate',
        required: false,
        visibleDependency: 'sunzi',
        visiblePredicate: s => s,
        validate: function (n: number, status: ValidationStatus) {
            if (n < 0 || n > 100)
                status.addError('Must be between 0 and 100.')
        },
    },
} satisfies GenericParamDescription

class ModFill extends P5Visualizer(paramDesc) {
    static category = 'Mod Fill'
    static description =
        'An array showing which residues occur, for each modulus'

    maxModulus = 0
    rectWidth = 0
    rectHeight = 0
    useMod = 0
    useBackColor = INVALID_COLOR
    i = 0n

    trySafeNumber(input: bigint) {
        let use = 0
        try {
            use = math.safeNumber(input)
        } catch {
            // should we notify the user that we are stopping?
            this.stop()
            return 0
        }
        return use
    }

    drawNew(num: bigint) {
        const sketch = this.sketch
        const value = this.seq.getElement(num)

        // determine color
        const vars = this.fillColor.freevars
        let useNum = 0
        let useValue = 0

        // because safeNumber can fail, we conly want to try it
        // if we need it in the formula
        if (vars.has('n')) useNum = this.trySafeNumber(num)
        if (vars.has('a')) useValue = this.trySafeNumber(value)
        let x = 0
        for (let mod = 1; mod <= this.useMod; mod++) {
            // needs to take BigInt when implemented
            const clr = this.fillColor.computeWithStatus(
                this.statusOf.fillColor,
                useNum,
                useValue,
                mod
            )
            if (this.statusOf.fillColor.invalid()) return
            // draw rectangle
            const sketchColor =
                typeof clr === 'string'
                    ? sketch.color(clr)
                    : math.isChroma(clr)
                      ? sketch.color(clr.hex())
                      : sketch.color('black')
            this.sketch.fill(sketchColor)
            const y =
                this.sketch.height
                - Number(math.modulo(value, mod) + 1n) * this.rectHeight
            this.sketch.rect(x, y, this.rectWidth, this.rectHeight)
            x += this.rectWidth
        }
    }

    requestedAspectRatio(): number | undefined {
        return this.aspectRatio == true ? 1 : undefined
    }

    setup() {
        super.setup()
        const minDimension = Math.min(this.size.width, this.size.height)
        // 16 was chosen in the following expression by doubling the
        // multiplier until the traces were almost too faint to see at all.
        this.maxModulus = 16 * minDimension
        const modDimWarning = 'Running with maximum modulus'

        // We need to check if the "mod dimension" fits on screen,
        // and adjust if not.

        // First, remove any prior modDimWarning that might be there
        // (so they don't accumulate from repeated parameter changes):
        const warnings = this.statusOf.modDimension.warnings
        const oldWarning = warnings.findIndex(warn =>
            warn.startsWith(modDimWarning)
        )
        if (oldWarning >= 0) warnings.splice(oldWarning, 1)

        // Now check the dimension and warn if need be:
        if (this.modDimension > this.maxModulus) {
            warnings.push(
                `${modDimWarning} ${this.maxModulus}, since `
                    + `${this.modDimension} will not fit on screen.`
            )
            this.useMod = this.maxModulus
        } else this.useMod = Number(this.modDimension)

        // Now we can calculate the cell size:
        this.rectWidth = this.sketch.width / this.useMod
        this.rectHeight = this.sketch.height / this.useMod

        // set color info
        this.useBackColor = this.sketch.color(this.backgroundColor)
        const opaqueBack = this.sketch.color(this.backgroundColor)
        opaqueBack.setAlpha(255)

        // Set up to draw:
        this.sketch
            .frameRate(this.frameRate)
            .noStroke()
            .background(opaqueBack)
        this.i = this.seq.first
    }

    draw() {
        if (this.i > this.seq.last) {
            this.stop()
            return
        }
        // sunzi effect
        if (this.sunzi) {
            this.sketch.fill(this.useBackColor)
            this.sketch.rect(0, 0, this.sketch.width, this.sketch.height)
        }

        // draw residues
        this.drawNew(this.i)
        // Important to increment _after_ drawNew completes, because it
        // won't complete on a cache miss, and in that case we don't want to
        // increment the index because we didn't actually draw anything.
        ++this.i
    }
}

export const exportModule = new VisualizerExportModule(ModFill)
