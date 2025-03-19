import {P5Visualizer} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '../visualizers/VisualizerInterface'

import {math} from '@/shared/math'

/** md
# Show Factors Visualizer

(example image should go here)

This is a very simple visualizer that just prints a row of values from
the sequence, and below each term, its prime factors.

## Parameters
**/

class ShowFactors extends P5Visualizer({}) {
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

        const last =
            typeof this.seq.last === 'bigint'
                ? this.seq.last
                : this.seq.first + 100n
        for (let i = this.seq.first; i <= last; i++) {
            const xCoord = firstX + Number(i - this.seq.first) * xDelta
            const hue = Number(math.modulo((i * 255n) / 6n, 255))
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
