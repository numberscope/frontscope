import {VisualizerExportModule} from '../visualizers/VisualizerInterface'
import {P5Visualizer} from './P5Visualizer'
import {ParamType} from '../shared/ParamType'

/** md
# Show Factors Visualizer

(example image should go here)

This is a very simple visualizer that just prints a row of values from
the sequence, and below each term, its prime factors.

## Parameters
**/

class ShowFactors extends P5Visualizer {
    name = 'Show Factors'
    description = 'Produces a table of factors of a sequence'

    start = 1
    end = 20

    params = {
        /** md
- start: The index of the first entry to display
         **/
        start: {
            value: this.start,
            type: ParamType.INTEGER,
            displayName: 'First index to show',
            required: true,
        },
        /** md
- end: The index of the last entry to display
         **/
        end: {
            value: this.end,
            type: ParamType.INTEGER,
            displayName: 'Last index to show',
            required: true,
        },
    }
    first = 0

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
        let myColor = sketch.color(100, 255, 150)
        let hue

        for (
            let i = Math.max(this.start, this.seq.first);
            i <= Math.min(this.end, this.seq.last);
            i++
        ) {
            const xCoord = firstX + (i - this.start) * xDelta
            hue = ((i * 255) / 6) % 255
            myColor = sketch.color(hue, 150, 200)
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
        sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    ShowFactors,
    ShowFactors.prototype.name,
    ShowFactors.prototype.description
)
