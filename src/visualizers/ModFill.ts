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
- modDimension: The number of rows to display, which corresponds to the largest
modulus to consider.
     **/
    // note will be small enough to fit in a `number` when we need it to.
    modDimension: {
        default: 150n,
        type: ParamType.BIGINT,
        displayName: 'Highest modulus',
        required: true,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0) status.addError('Must be positive.')
        },
    },
    /** md
- Alpha: The rate at which cells darken with repeated hits.  This
should be set between 1 (very transparent) and 255 (solid).
     **/
    alpha: {
        default: 10,
        type: ParamType.NUMBER,
        displayName: 'Transparency',
        description:
            'Transparency of each hit'
            + ' (1 = very transparent; 255 = solid)',
        required: true,
        visibleValue: true,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0 || n > 255)
                status.addError('Must be between 1 and 255.')
        },
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
- highlightFormula: A formula computed on the index, i.e. on n for term a(n)
whose output determines whether
to apply the highlight color (odd integer or true boolean)
or fill color (even integer or false boolean).  Default:
**/
    highlightFormula: {
        default: new MathFormula(
            // Note: the markdown comment closed with */ means to include code
            // into the docs, until mkdocs reaches a comment ending with **/
            /** md */
            `isPrime(n)`
            /* **/
        ),
        type: ParamType.FORMULA,
        inputs: ['n'],
        displayName: 'Highlight Formula',
        description:
            "A function in 'n' (index); when output is odd "
            + '(number) or true (boolean), draws residue of '
            + 'a(n) in the highlight color.',
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
} satisfies GenericParamDescription

class ModFill extends P5Visualizer(paramDesc) {
    static category = 'Mod Fill'
    static description =
        'A triangular grid showing which residues occur, for each modulus'

    maxModulus = 0
    rectWidth = 0
    rectHeight = 0
    useMod = 0
    useFillColor = INVALID_COLOR
    useHighColor = INVALID_COLOR
    i = 0n

    drawNew(num: bigint) {
        if (
            Number(
                math.modulo(this.highlightFormula.compute(Number(num)), 2)
            ) === 1
        ) {
            this.sketch.fill(this.useHighColor)
        } else {
            this.sketch.fill(this.useFillColor)
        }
        for (let mod = 1; mod <= this.useMod; mod++) {
            const s = this.seq.getElement(num)
            const x = (mod - 1) * this.rectWidth
            const y =
                this.sketch.height
                - Number(math.modulo(s, mod) + 1n) * this.rectHeight
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

        // Now we can calculate the cell size and set up to draw:
        this.rectWidth = this.sketch.width / this.useMod
        this.rectHeight = this.sketch.height / this.useMod
        this.sketch.noStroke()
        this.i = this.seq.first

        // set fill color info
        this.useFillColor = this.sketch.color(this.fillColor)
        this.useHighColor = this.sketch.color(this.highColor)
        this.useFillColor.setAlpha(this.alpha)
        this.useHighColor.setAlpha(this.alpha)
    }

    draw() {
        if (this.i > this.seq.last) {
            this.stop()
            return
        }
        this.drawNew(this.i++)
    }
}

export const exportModule = new VisualizerExportModule(ModFill)
