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
some entry of the sequence. The sequence terms a(n) are considered in
order, filling the corresponding cells in turn, so you can get an
idea of when various residues occur by watching the order
the cells are filled in as the diagram is drawn.  There are options
to control color and transparency of the fill.

## Parameters
**/

const paramDesc = {
    /** md
- Highest modulus: The number of rows to display, which corresponds
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
        default: '#FFFFFF',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
        visibleValue: true,
    },
    /** md
- Fill color: The color used to fill each cell by default.
     **/
    fillColor: {
        default: '#000000',
        type: ParamType.COLOR,
        displayName: 'Fill color',
        required: true,
        visibleValue: true,
    },
    /** md
- Transparency: The rate at which cells darken with repeated drawing.  This
should be set between 0 (transparent) and 1 (solid), typically as a constant,
but can be set as a function of _m_, the modulus.
If the function evaluates below 0, it will behave as 0; if it
 evaluates above 1, it will behave as 1.  Default:
     **/
    alpha: {
        default: new MathFormula(
            /** md */
            `1`
            /* **/
        ),
        type: ParamType.FORMULA,
        inputs: ['m'],
        displayName: 'Transparency',
        description:
            'The transparency of each new rectangle (rate at which cells'
            + ' darken with repeated drawing).  Between 0'
            + '(transparent) and 1 (solid).  '
            + "Can be a function in 'm' (modulus).",
        visibleValue: true,
        required: false,
    },
    /** md
- Aspect ratio: If 0, use full canvas; otherwise this represents width/height.
     **/
    aspectRatio: {
        default: 0,
        type: ParamType.NUMBER,
        displayName: 'Aspect ratio',
        description:
            'If 0, use full canvas.  Otherwise, this sets width/height.',
        required: false,
        visibleValue: true,
        validate: function (n: number, status: ValidationStatus) {
            if (n < 0) status.addError('Must be non-negative.')
        },
    },

    /** md
- Highlight formula: A formula whose output, modulo 2, determines whether
to apply the highlight color (residue 0) or fill color (residue 1).  Default:
**/
    highlightFormula: {
        default: new MathFormula(
            // Note: he markdown comment closed with */ means to include code
            // into the docs, until mkdocs reaches a comment ending with **/
            /** md */
            `false`
            /* **/
        ),
        type: ParamType.FORMULA,
        inputs: ['n', 'a'],
        displayName: 'Indices to highlight',
        description:
            "A function in 'n' (index) and 'a' (value); "
            + 'when output is odd '
            + '(number) or true (boolean), draws residue of '
            + 'a(n) in the highlight color.  For example, try '
            + 'isPrime(n) to highlight terms of prime index, or '
            + 'a to highlight terms of odd value.',
        visibleValue: true,
        required: false,
    },
    /** md
- Highlight color: The color used for highlighting.
     **/
    highColor: {
        default: '#c98787',
        type: ParamType.COLOR,
        displayName: 'Highlight color',
        required: true,
        visibleValue: true,
    },
    /** md
- Highlight transparency: The rate at which cells darken with repeated
drawing.  This should be set between 0 (transparent) and 1 (solid),
typically as a constant,
but can be set as a function of _m_, the modulus.
If the function evaluates below 0, it will behave as 0; if it
 evaluates above 1, it will behave as 1.  Default:
     **/
    alphaHigh: {
        default: new MathFormula(
            /** md */
            `1`
            /* **/
        ),
        type: ParamType.FORMULA,
        inputs: ['m'],
        displayName: 'Highlight transparency',
        description:
            'The transparency of each new rectangle (rate at which cells'
            + ' darken with repeated drawing).  Between 0'
            + '(transparent) and 1 (solid).  '
            + "Can be a function in 'm' (modulus).",
        visibleValue: true,
        required: false,
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
    useFillColor = INVALID_COLOR
    useHighColor = INVALID_COLOR
    i = 0n
    offsetX = 0
    offsetY = 0

    drawNew(num: bigint) {
        let drawColor = this.useFillColor
        let alphaFormula = this.alpha

        for (let mod = 1; mod <= this.useMod; mod++) {
            // determine alpha
            const value = this.seq.getElement(num)
            const vars = this.highlightFormula.freevars
            let useNum = 0
            let useValue = 0
            // because safeNumber can fail, we conly want to try it
            // if we need it in the formula
            if (vars.includes('n')) {
                useNum = math.safeNumber(num)
            }
            if (vars.includes('a')) {
                useValue = math.safeNumber(value)
            }
            // needs to take BigInt when implemented
            const high = this.highlightFormula.compute(useNum, useValue)
            if (Number(math.modulo(high, 2)) === 1) {
                drawColor = this.useHighColor
                alphaFormula = this.alphaHigh
            }
            drawColor.setAlpha(255 * alphaFormula.compute(mod))

            // draw rectangle
            this.sketch.fill(drawColor)
            const x = (mod - 1) * this.rectWidth + this.offsetX
            const y =
                -this.offsetY
                + this.sketch.height
                - Number(math.modulo(value, mod) + 1n) * this.rectHeight
            this.sketch.rect(x, y, this.rectWidth, this.rectHeight)
        }
    }

    async presketch(size: ViewSize) {
        await super.presketch(size)
        const minDimension = Math.min(size.width, size.height)
        // 16 was chosen in the following expression by doubling the
        // multiplier until the traces were almost too faint to see at all.
        this.maxModulus = 16 * minDimension
    }

    setup() {
        super.setup()
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

        // Now we can calculate the cell size and offset:
        this.rectWidth = this.sketch.width / this.useMod
        this.rectHeight = this.sketch.height / this.useMod
        if (this.aspectRatio != 0) {
            const currentRatio = this.sketch.width / this.sketch.height
            const ratioRatio = currentRatio / this.aspectRatio
            if (ratioRatio > 1) {
                this.rectWidth = this.rectWidth / ratioRatio
                const shortfall =
                    (this.sketch.width - this.rectWidth * this.useMod)
                    / this.rectWidth
                this.offsetX = math.ceil(shortfall / 2) * this.rectWidth
            } else {
                this.rectHeight = this.rectHeight * ratioRatio
                const shortfall =
                    (this.sketch.height - this.rectHeight * this.useMod)
                    / this.rectHeight
                this.offsetY = math.ceil(shortfall / 2) * this.rectHeight
            }
        }
        this.sketch.noStroke()
        this.sketch.background(this.backgroundColor)
        this.i = this.seq.first

        // set fill color info
        this.useFillColor = this.sketch.color(this.fillColor)
        this.useHighColor = this.sketch.color(this.highColor)
    }

    draw() {
        if (this.i > this.seq.last) {
            this.stop()
            return
        }
        this.drawNew(this.i)
        this.i++
    }
}

export const exportModule = new VisualizerExportModule(ModFill)
