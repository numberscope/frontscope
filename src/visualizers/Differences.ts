import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

const min = Math.min

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
- **Entries in top row:** How many sequence entries to display in the top
row. _(Positive integer or zero. Zero means all available entries.)_
     **/
    n: {
        default: 20,
        type: ParamType.INTEGER,
        displayName: 'Entries in top row',
        required: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 0,
                "Number of entries in top row can't be negative"
            ),
    },
    /** md
- **Number of rows:** How many rows to produce. _(Positive integer, no larger
than 'Entries in top row.')_
     **/
    levels: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Number of rows',
        required: false,
        placeholder: '[length of top row]',
    },
} satisfies GenericParamDescription

class Differences extends P5Visualizer(paramDesc) {
    static category = 'Differences'
    static description =
        'Produces a table of differences '
        + 'between consecutive entries, potentially iterated several times'

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.n < params.levels)
            status.addError("Number of rows can't exceed length of first row")

        return status
    }

    setup() {
        super.setup()
        if (this.seq.last - this.seq.first + 1 < this.levels) {
            throw Error(
                `Sequence ${this.seq.name} has too few entries `
                    + `for ${this.levels} levels.`
            )
        }
    }

    draw() {
        const sketch = this.sketch
        const sequence = this.seq
        const tryLevels = this.levels > 0 ? this.levels : this.n
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

        const workingSequence = []
        const end = min(sequence.first + this.n - 1, sequence.last)
        const levels = min(tryLevels, end - sequence.first + 1)

        // workingSequence cannibalizes the first n elements
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
