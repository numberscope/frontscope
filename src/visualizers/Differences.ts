import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {math} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Difference Visualizer

[<img
  src="../../assets/img/Differences/squares.png"
  width=696
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Differences/squares.png)

This visualizer prints a row of sequence entries, followed by a row of
differences between entries, followed by a row of differences between
differences, and so on, for as many rows as you like. The rows are shifted so
that each difference appears between and below the two numbers it's the
difference of.
**/

const paramDesc = {
    /** md
- **Number of rows:** How many rows to produce. _(Positive integer, no larger
than the number of elements in the sequence')_
     **/
    levels: {
        default: 12n,
        type: ParamType.BIGINT,
        displayName: 'Number of rows',
        required: false,
        validate: function (l: bigint, stat: ValidationStatus) {
            if (l < 1n) stat.addError('Need at least one row')
        },
    },
} satisfies GenericParamDescription

class Differences extends P5Visualizer(paramDesc) {
    static category = 'Differences'
    static description =
        'Produces a table of differences '
        + 'between consecutive entries, potentially iterated several times'

    useTerms = 40n // Typically more than enough to fill screen
    useLevels = 0n

    setup() {
        super.setup()
        if (this.seq.last < this.seq.first + this.useTerms - 1n) {
            this.useTerms = BigInt(this.seq.last) - this.seq.first + 1n
        }
        this.useLevels = this.levels
        if (this.useLevels > this.useTerms) {
            this.useLevels = this.useTerms
            // TODO: Should really warn about this situation
        }
    }

    draw() {
        const sketch = this.sketch
        const sequence = this.seq
        const fontSize = 20
        const xDelta = 50
        const yDelta = 50
        let firstX = 30
        const firstY = 30
        sketch
            .background('black')
            .textFont('Arial')
            .textSize(fontSize)
            .textStyle(sketch.BOLD)
            .colorMode(sketch.HSB, 255)
        let myColor = sketch.color(100, 255, 150)
        let hue = 0

        const end = BigInt(
            math.bigmin(sequence.first + this.useTerms - 1n, sequence.last)
        )
        const levels = math.bigmin(this.useLevels, end - sequence.first + 1n)

        // workingSequence cannibalizes the first n elements
        const workingSequence = []
        for (let i = sequence.first; i <= end; i++) {
            workingSequence.push(sequence.getElement(i))
        }

        for (let i = 0; i < levels; i++) {
            hue = ((i * 255) / 6) % 255
            myColor = sketch.color(hue, 150, 200)
            sketch.fill(myColor)
            /* Draw the row, updating workingSequence: */
            for (let j = 0; j < workingSequence.length; j++) {
                sketch.text(
                    workingSequence[j].toString(),
                    firstX + j * xDelta,
                    firstY + i * yDelta
                )
                if (j < workingSequence.length - 1) {
                    workingSequence[j] =
                        workingSequence[j + 1] - workingSequence[j]
                }
            }

            workingSequence.pop()
            // Move the next row forward half an entry, for a pyramid shape.
            firstX = firstX + (1 / 2) * xDelta
        }
        this.stop()
    }
}

export const exportModule = new VisualizerExportModule(Differences)
