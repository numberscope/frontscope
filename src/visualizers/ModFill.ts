import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'

import {math, MathFormula} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/* Helper for parameter specifications: */
function nontrivialFormula(fmla: string) {
    return fmla !== '' && fmla !== '0' && fmla !== 'false'
}

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
the cells are filled in as the diagram is drawn.  There are options
to control color and transparency of the fill.

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
        default: '#FFFFFF',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },
    /** md
- Fill color: The color used to fill each cell by default.
     **/
    fillColor: {
        default: '#000000',
        type: ParamType.COLOR,
        displayName: 'Fill color',
        required: true,
    },
    /** md
- Opacity: The rate at which cells darken with repeated drawing.  This
should be set between 0 (transparent) and 1 (solid), typically as a constant,
but can be set as a function of _n_, the sequence index, _a_, the sequence
entry, and/or _m_, the modulus.
If the function evaluates to a number less than 0, it will behave as 0; if it
 evaluates to more than 1, it will behave as 1.  Default:
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
            + "Can be a function in 'n' (index), 'a' (entry) "
            + "and 'm' (modulus).",
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
- Highlight formula: A formula whose output, modulo 2, determines whether
to apply the highlight color (residue 0) or fill color (residue 1).
Note that a boolean `true` value counts as 1 and `false` as 0. As with
Opacity, the formula can involve variables _n_ (index), _a_ (entry) and/or
_m_ (modulus).  Default:
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
            "A function in 'n' (index), 'a' (entry) "
            + "and 'm' (modulus); "
            + 'when output is odd '
            + '(number) or true (boolean), draws residue of '
            + 'a(n) in the highlight color.'
            /** md
{! ModFill.ts extract:
    start: '[*] EXAMPLES [*]'
    stop: 'required[:]'
    replace: [['^\s*[+]\s"(.*)"[\s,]*$', '       \1']]
!}
        **/
            /* EXAMPLES */
            + 'Examples: `isPrime(n)` highlights entries with prime index; '
            + '`a` highlights entries with odd value; and `m == 30` '
            + 'highlights the modulus 30 column.',
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
            nontrivialFormula(dependentValue.source),
    },
    /** md
- Highlight opacity: The rate at which cells darken with repeated
highlighting.  This should be set between 0 (transparent) and 1 (opaque),
and has the analogous meaning and may use the same variables as Opacity.
Default: if this parameter is not specified, the same value/formula for
Opacity as described above will be used.
     **/
    alphaHigh: {
        default: new MathFormula(''),
        type: ParamType.FORMULA,
        inputs: ['n', 'a', 'm'],
        displayName: 'Highlight opacity',
        description:
            'The opacity of each new rectangle (rate at which cells'
            + ' darken with repeated drawing).  Between 0'
            + '(transparent) and 1 (opaque).  '
            + "Can be a function in 'n' (index), 'a' (value) "
            + "and 'm' (modulus).",
        placeholder: '[same as Opacity]',
        required: false,
        visibleDependency: 'highlightFormula',
        visiblePredicate: (dependentValue: MathFormula) =>
            nontrivialFormula(dependentValue.source),
    },
    /** md
- Sunzi mode: Warning: can create a stroboscopic effect.
This sets the opacity of the background color
overlay added at each step.  If 0, there is no effect.
If 1, then the canvas completely blanks between terms,
allowing you to see each term of the sequence individually.
In that case, it helps to turn down the Frame rate (it
can create quite a stroboscopic effect).  If
set in the region of 0.05, it has a "history fading effect"
in that the contribution of long past terms fades into the background.
This parameter is named for Sunzi's Theorem (also known as the
Chinese Remainder Theorem).
     **/
    sunzi: {
        default: 0,
        type: ParamType.NUMBER,
        displayName: 'Sunzi effect',
        description:
            'The canvas background colour is painted at this '
            + 'opacity between '
            + 'each term of the '
            + 'sequence.  '
            + 'If 0, no effect.  If 1, canvas completely '
            + 'blanks between terms (warning! can be '
            + 'stroboscopic), so the residues of only a '
            + 'single term are shown '
            + 'in each frame.  '
            + 'Otherwise a history fading effect (try 0.05).',
        required: false,
        validate: function (n: number, status: ValidationStatus) {
            if (n < 0 || n > 1) status.addError('Must be between 0 and 1.')
        },
    },
    /** md
- Frame rate: Entries displayed per second.  Can be useful in combination with
Sunzi mode. Only visible when Sunzi mode is nonzero.
     **/
    frameRate: {
        default: 60,
        type: ParamType.NUMBER,
        displayName: 'Frame rate',
        required: false,
        visibleDependency: 'sunzi',
        visiblePredicate: s => s !== 0,
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
    useFillColor = INVALID_COLOR
    useHighColor = INVALID_COLOR
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
        let drawColor = this.useFillColor
        let alphaFormula = this.alpha
        let alphaStatus = this.statusOf.alpha
        let alphaVars = this.alpha.freevars
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
            const highValue = this.highlightFormula.computeWithStatus(
                this.statusOf.highlightFormula,
                useNum,
                useValue,
                mod
            )
            let high = false
            if (typeof highValue === 'boolean') high = highValue
            else if (
                typeof highValue === 'number'
                || typeof highValue === 'bigint'
            ) {
                high = math.modulo(highValue, 2) === 1n
            }
            // set color
            if (high) {
                drawColor = this.useHighColor
                if (this.alphaHigh.source !== '') {
                    alphaFormula = this.alphaHigh
                    alphaStatus = this.statusOf.alphaHigh
                    alphaVars = this.alphaHigh.freevars
                }
            }
            if (alphaVars.includes('n')) useNum = this.trySafeNumber(num)
            if (alphaVars.includes('a')) useValue = this.trySafeNumber(value)
            const alphaValue = alphaFormula.computeWithStatus(
                alphaStatus,
                useNum,
                useValue,
                mod
            )
            if (typeof alphaValue === 'number') {
                drawColor.setAlpha(255 * alphaValue)
            }

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

        // Now we can calculate the cell size:
        this.rectWidth = this.sketch.width / this.useMod
        this.rectHeight = this.sketch.height / this.useMod

        // set color info
        this.useBackColor = this.sketch.color(this.backgroundColor)
        this.useFillColor = this.sketch.color(this.fillColor)
        this.useHighColor = this.sketch.color(this.highColor)

        // Set up to draw:
        this.sketch
            .frameRate(this.frameRate)
            .noStroke()
            .background(this.useBackColor)
        this.i = this.seq.first
        this.useBackColor.setAlpha(255 * this.sunzi)
    }

    draw() {
        if (this.i > this.seq.last) {
            this.stop()
            return
        }
        // sunzi effect
        this.sketch.fill(this.useBackColor)
        this.sketch.rect(0, 0, this.sketch.width, this.sketch.height)

        // draw residues
        this.drawNew(this.i)
        // Important to increment _after_ drawNew completes, because it
        // won't complete on a cache miss, and in that case we don't want to
        // increment the index because we didn't actually draw anything.
        ++this.i
    }
}

export const exportModule = new VisualizerExportModule(ModFill)
