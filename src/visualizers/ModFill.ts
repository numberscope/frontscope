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
- Opacity: The rate at which cells darken with repeated drawing.  This
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
        inputs: ['n', 'a', 'm'],
        displayName: 'Opacity',
        description:
            'The opacity of each new rectangle (rate at which cells'
            + ' darken with repeated drawing).  Between 0 '
            + '(transparent) and 1 (solid).  '
            + "Can be a function in 'n' (index), 'a' (value) "
            + "and 'm' (modulus).",
        visibleValue: true,
        required: false,
    },
    /** md
- Square canvas:  If true, force canvas to be aspect ratio 1 (square).
     **/
    aspectRatio: {
        default: 0,
        type: ParamType.BOOLEAN,
        displayName: 'Square canvas',
        required: false,
        visibleValue: true,
    },
    /** md
- Highlight formula: A formula whose output, modulo 2, determines whether
to apply the highlight color (residue 0) or fill color (residue 1).  Can be
involve variables 'n' (index), 'a' (value) and 'm' (modulus).  Default:
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
        inputs: ['n', 'a', 'm'],
        displayName: 'Highlighting',
        description:
            "A function in 'n' (index), 'a' (value) "
            + "and 'm' (modulus); "
            + 'when output is odd '
            + '(number) or true (boolean), draws residue of '
            + 'a(n) in the highlight color.  Examples: '
            + "'isPrime(n)' highlights terms of prime index; "
            + "'a' to highlight terms of odd value; 'm == 30' "
            + 'will highlight the modulus 30 column.',
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
        visibleDependency: 'highlightFormula',
        visiblePredicate: (dependentValue: MathFormula) =>
            dependentValue.source !== '',
    },
    /** md
- Highlight opacity: The rate at which cells darken with repeated
drawing.  This should be set between 0 (transparent) and 1 (opaque),
typically as a constant,
but can be set as a function of _m_, the modulus.
If the function evaluates below 0, it will behave as 0; if it
 evaluates above 1, it will behave as 1.  Default:
     **/
    alphaHigh: {
        // I don't know how to make this default to
        // what another parameter holds
        default: new MathFormula(
            /** md */
            `1`
            /* **/
        ),
        type: ParamType.FORMULA,
        inputs: ['n', 'a', 'm'],
        displayName: 'Highlight opacity',
        description:
            'The opacity of each new rectangle (rate at which cells'
            + ' darken with repeated drawing).  Between 0'
            + '(transparent) and 1 (opaque).  '
            + "Can be a function in 'n' (index), 'a' (value) "
            + "and 'm' (modulus).",
        required: false,
        visibleDependency: 'highlightFormula',
        visiblePredicate: (dependentValue: MathFormula) =>
            dependentValue.source !== '',
    },
    /** md
- Sunzi mode: Warning: can create a stroboscopic effect.
The canvas blanks between each term of the sequence, so
that you see only the residues of a single term in each frame
     **/
    sunzi: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Sunzi mode (warning: stroboscopic effect)',
        description:
            'The canvas blanks between each term of the'
            + 'sequence, so the residues of a single term are shown'
            + 'in each frame',
        required: true,
        visibleValue: true,
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
        let drawColor = this.useFillColor
        let alphaFormula = this.alpha
        const value = this.seq.getElement(num)

        // determine alpha
        const vars = this.highlightFormula.freevars
        let useNum = 0
        let useValue = 0

        // because safeNumber can fail, we conly want to try it
        // if we need it in the formula
        if (vars.includes('n')) useNum = this.trySafeNumber(num)
        if (vars.includes('a')) useValue = this.trySafeNumber(value)
        let x = 0
        for (let mod = 1; mod <= this.useMod; mod++) {
            // needs to take BigInt when implemented
            const high = this.highlightFormula.compute(useNum, useValue, mod)

            // set color
            if (Number(math.modulo(high, 2)) === 1) {
                drawColor = this.useHighColor
                alphaFormula = this.alphaHigh
                const varsAlpha = this.alphaHigh.freevars
                if (varsAlpha.includes('n')) useNum = this.trySafeNumber(num)
                if (varsAlpha.includes('a'))
                    useValue = this.trySafeNumber(value)
            } else {
                drawColor = this.useFillColor
                alphaFormula = this.alpha
                const varsAlpha = this.alpha.freevars
                if (varsAlpha.includes('n')) useNum = this.trySafeNumber(num)
                if (varsAlpha.includes('a'))
                    useValue = this.trySafeNumber(value)
            }
            drawColor.setAlpha(
                255 * alphaFormula.compute(useNum, useValue, mod)
            )

            // draw rectangle
            this.sketch.fill(drawColor)
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

        this.sketch.noStroke()
        this.sketch.background(this.backgroundColor)
        this.i = this.seq.first

        // set fill color info
        this.useFillColor = this.sketch.color(this.fillColor)
        this.useHighColor = this.sketch.color(this.highColor)

        if (this.sunzi) this.sketch.frameRate(3)
    }

    draw() {
        if (this.i > this.seq.last) {
            this.stop()
            return
        }
        if (this.sunzi) this.sketch.background(this.backgroundColor)
        this.drawNew(this.i)
        // Important to increment _after_ drawNew completes, because it
        // won't complete on a cache miss, and in that case we don't want to
        // increment the index because we didn't actually draw anything.
        ++this.i
    }
}

export const exportModule = new VisualizerExportModule(ModFill)
