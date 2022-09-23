import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'

/** md
# Show Factors Visualizer

(example image should go here)

This is a very simple visualizer that just prints a row of values from
the sequence, and below each term, its prime factors.

## Parameters
**/

class VisualizerShowFactors extends VisualizerDefault {
    name = 'Show Factors'

    start = 1
    end = 20

    params = {
        /** md
- start: The index of the first entry to display
         **/
        start: {
            value: this.start,
            forceType: 'integer',
            displayName: 'First index to show',
            required: true,
        },
        /** md
- end: The index of the last entry to display
         **/
        end: {
            value: this.end,
            forceType: 'integer',
            displayName: 'Last index to show',
            required: true,
        },
    }
    first = 0

    draw() {
        this.sketch.background('black')
        const fontSize = 20
        this.sketch.textFont('Arial')
        this.sketch.textSize(fontSize)
        this.sketch.textStyle(this.sketch.BOLD)
        const xDelta = 50
        const yDelta = 50
        const firstX = 30
        const firstY = 30
        this.sketch.colorMode(this.sketch.HSB, 255)
        let myColor = this.sketch.color(100, 255, 150)
        let hue

        for (
            let i = Math.max(this.start, this.seq.first);
            i <= Math.min(this.end, this.seq.last);
            i++
        ) {
            const xCoord = firstX + (i - this.start) * xDelta
            hue = ((i * 255) / 6) % 255
            myColor = this.sketch.color(hue, 150, 200)
            this.sketch.fill(myColor)
            this.sketch.text(
                this.seq.getElement(i).toString(),
                xCoord,
                firstY
            )
            const factors = this.seq.getFactors(i)
            if (factors) {
                let j = 1
                for (const [base, power] of factors) {
                    this.sketch.text(
                        base.toString(),
                        xCoord,
                        firstY + j * yDelta
                    )
                    this.sketch.text(
                        power.toString(),
                        xCoord + xDelta / 3,
                        firstY + j * yDelta - yDelta / 4
                    )
                    j += 1
                }
            }
        }
        this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Show Factors',
    VisualizerShowFactors,
    'Produces a table of factors of a sequence.'
)
