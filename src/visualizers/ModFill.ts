import {modulo} from '../shared/math'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {P5Visualizer} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'

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

class VizModFill extends P5Visualizer {
    name = 'Mod Fill'
    modDimension = 10n
    params = {
        /** md
- modDimension: The number of rows to display, which corresponds to the largest
    modulus to consider.
         **/
        // note will be small enough to fit in a `number` when we need it to.
        modDimension: {
            value: this.modDimension,
            displayName: 'Mod dimension',
            required: true,
        },
    }

    rectWidth = 0
    rectHeight = 0
    i = 0

    checkParameters() {
        const status = super.checkParameters()

        if (this.params.modDimension.value <= 0n) {
            status.isValid = false
            status.errors.push('Mod dimension must be positive')
        }

        return status
    }

    drawNew(sketch: p5, num: number, seq: SequenceInterface) {
        sketch.fill(0)
        for (let mod = 1n; mod <= this.modDimension; mod++) {
            const s = seq.getElement(num)
            const x = Number(mod - 1n) * this.rectWidth
            const y =
                sketch.height - Number(modulo(s, mod) + 1n) * this.rectHeight
            sketch.rect(x, y, this.rectWidth, this.rectHeight)
        }
    }

    setup() {
        super.setup()
        if (!this.sketch) {
            throw 'Attempt to show ModFill before injecting into element'
        }
        this.rectWidth = this.sketch.width / Number(this.modDimension)
        this.rectHeight = this.sketch.height / Number(this.modDimension)
        this.sketch.noStroke()
        this.i = this.seq.first
    }

    draw() {
        super.draw()
        this.drawNew(this.sketch, this.i, this.seq)
        this.i++
        if (this.i == 1000 || this.i > this.seq.last) {
            this.sketch.noLoop()
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Mod Fill',
    VizModFill,
    ''
)
