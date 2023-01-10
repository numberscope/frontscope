import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'

const min = Math.min

/** md
# Difference Visualizer

(example image should go here)

This is a very simple visualizer that just prints a row of values from
the sequence, and below that, between each two terms, their difference.
It can continue this process, adding rows that indicate differences
between the terms in the row above, for as many rows as you like.

## Parameters
**/

class Differences extends VisualizerDefault {
    name = 'Differences'

    n = 20
    levels = 5

    params = {
        /** md
- n: The number of terms of the sequence to display in the top row.
         **/
        n: {
            value: this.n,
            forceType: 'integer',
            displayName: 'Elements in top row',
            required: true,
        },
        /** md
- levels: The number of rows to produce. Cannot be larger than n.
         **/
        levels: {
            value: this.levels,
            forceType: 'integer',
            displayName: 'Number of rows',
            required: false,
            description: 'If zero, defaults to the length of top row',
        },
    }
    first = 0

    checkParameters() {
        const status = super.checkParameters()

        if (this.params.n.value < this.params.levels.value) {
            status.isValid = false
            status.errors.push(
                'Number of rows cannot exceed length of first row'
            )
        }

        return status
    }

    initialize(sketch: p5, seq: SequenceInterface): void {
        super.initialize(sketch, seq)
        if (!this.levels) {
            this.levels = this.n
            this.refreshParams()
        }
        if (seq.last - seq.first + 1 < this.levels) {
            throw Error(
                `Sequence ${seq.name} has too few entries `
                    + `for ${this.levels} levels.`
            )
        }
    }

    drawDifferences(n: number, lvls: number, sequence: SequenceInterface) {
        //changed background color to grey since you can't see what's going on
        this.sketch.background('black')

        const fontSize = 20
        this.sketch.textFont('Arial')
        this.sketch.textSize(fontSize)
        this.sketch.textStyle(this.sketch.BOLD)
        const xDelta = 50
        const yDelta = 50
        let firstX = 30
        const firstY = 30
        this.sketch.colorMode(this.sketch.HSB, 255)
        let myColor = this.sketch.color(100, 255, 150)
        let hue

        const workingSequence = []
        const end = min(sequence.first + n - 1, sequence.last)
        const levels = min(lvls, end - this.first + 1)

        // workingSequence cannibalizes the first n elements
        for (let i = sequence.first; i <= end; i++) {
            workingSequence.push(sequence.getElement(i))
        }

        for (let i = 0; i < levels; i++) {
            hue = ((i * 255) / 6) % 255
            myColor = this.sketch.color(hue, 150, 200)
            this.sketch.fill(myColor)
            /* Draw the row, updating workingSequence: */
            for (let j = 0; j < workingSequence.length; j++) {
                this.sketch.text(
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
    }

    draw() {
        this.drawDifferences(this.n, this.levels, this.seq)
        this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Differences',
    Differences,
    'Produces a table of differences between consecutive terms, '
        + 'potentially iterated several times.'
)
