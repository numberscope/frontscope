import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'

import {math} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Mod Fill Visualizer

[image should go here]

The _n_-th row of this triangular diagram has _n_ cells which are turned on
or off according to whether the corresponding residue modulo _n_ occurs for
some entry of the sequence. The entries are considered in order, filling the
corresponding cells in turn, so you can get an idea of when various residues
occur by watching the order the cells are filled in as the diagram is drawn.

## Parameters
**/

const paramDesc = {
    /** md
- modDimension: The number of rows to display, which corresponds to the largest
modulus to consider.
     **/
    // note will be small enough to fit in a `number` when we need it to.
    modDimension: {
        default: 10n,
        type: ParamType.BIGINT,
        displayName: 'Mod dimension',
        required: true,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0) status.addError('Must be positive.')
        },
    },
} satisfies GenericParamDescription

class ModFill extends P5Visualizer(paramDesc) {
    static category = 'Mod Fill'
    static description =
        'A triangular grid showing which residues occur, to each modulus'

    maxModulus = 0
    rectWidth = 0
    rectHeight = 0
    useMod = 0
    i = 0n

    drawNew(num: bigint) {
        this.sketch.fill(0)
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
