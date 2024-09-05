import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {math} from '@/shared/math'
import {ParamType} from '@/shared/ParamType'

/** md
# Show Factors Visualizer

(example image should go here)

This is a very simple visualizer that just prints a row of values from
the sequence, and below each term, its prime factors.

## Parameters
**/

const paramDesc = {
    /** md
- start: The index of the first entry to display
     **/
    start: {
        default: -Infinity,
        type: ParamType.INTEGER,
        displayName: 'First index to show',
        required: false,
    },
    /** md
- end: The index of the last entry to display
     **/
    end: {
        default: Infinity,
        type: ParamType.INTEGER,
        displayName: 'Last index to show',
        required: false,
    },
} as const

class ShowFactors extends P5Visualizer(paramDesc) {
    static category = 'Show Factors'
    static description = 'Produces a table of factors of a sequence'

    draw() {
        const sketch = this.sketch
        const fontSize = 20
        sketch
            .background('black')
            .textFont('Arial')
            .textSize(fontSize)
            .textStyle(sketch.BOLD)
            .colorMode(sketch.HSB, 255)
        const xDelta = 50
        const yDelta = 50
        const firstX = 30
        const firstY = 30

        const first = Math.max(this.start, this.seq.first)
        const last = Math.min(this.end, this.seq.last, first + 100)
        for (let i = first; i <= last; i++) {
            const xCoord = firstX + (i - first) * xDelta
            const hue = Number(math.modulo(Math.floor((i * 255) / 6), 255))
            const myColor = sketch.color(hue, 150, 200)
            sketch
                .fill(myColor)
                .text(this.seq.getElement(i).toString(), xCoord, firstY)
            const factors = this.seq.getFactors(i)
            if (factors) {
                let j = 1
                for (const [base, power] of factors) {
                    sketch.text(base.toString(), xCoord, firstY + j * yDelta)
                    sketch.text(
                        power.toString(),
                        xCoord + xDelta / 3,
                        firstY + j * yDelta - yDelta / 4
                    )
                    j += 1
                }
            }
        }
        this.stop()
    }
}

export const exportModule = new VisualizerExportModule(ShowFactors)
