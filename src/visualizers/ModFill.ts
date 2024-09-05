import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

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
        validate: (n: number) =>
            ValidationStatus.errorIf(n <= 0, 'Must be positive.'),
    },
} satisfies GenericParamDescription

class ModFill extends P5Visualizer(paramDesc) {
    static category = 'Mod Fill'
    static description =
        'A triangular grid showing which residues occur, to each modulus'

    rectWidth = 0
    rectHeight = 0
    useMod = 0
    i = 0

    drawNew(num: number) {
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

    setup() {
        super.setup()
        const minDimension = Math.min(this.sketch.width, this.sketch.height)
        // 16 was chosen in the following expression by doubling the
        // multiplier until the traces were almost too faint to see at all.
        const maxMod = 16 * minDimension
        if (this.modDimension > maxMod) {
            // TODO: Need to allow status updates after checkParameters!
            // status.addWarning(
            //    `Running with maximum modulus ${this.maxMod}; `
            //        + `${params.modDimension} will not fit on screen.`
            // )
            this.useMod = maxMod
        } else this.useMod = Number(this.modDimension)
        this.rectWidth = this.sketch.width / this.useMod
        this.rectHeight = this.sketch.height / this.useMod
        this.sketch.noStroke()
        this.i = this.seq.first
    }

    draw() {
        this.drawNew(this.i)
        this.i++
        if (this.i == 1000 || this.i > this.seq.last) {
            this.stop()
        }
    }
}

export const exportModule = new VisualizerExportModule(ModFill)
