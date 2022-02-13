import {SequenceInterface} from '@/sequences/SequenceInterface'
import {
    VisualizerInterface,
    VisualizerExportModule,
} from '@/visualizers/VisualizerInterface'
import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'

const min = Math.min

class VizDifferences
    extends VisualizerDefault
    implements VisualizerInterface
{
    name = 'Differences'
    n = {value: 20, displayName: 'Elements in top row', required: true}
    levels = {
        value: 5,
        displayName: 'Number of rows',
        required: false,
        description:
            'If blank, defaults to one fewer than the elements in the top row',
    }
    params = {n: this.n, levels: this.levels}
    first = 0

    checkParameters() {
        const status = super.checkParameters()

        if (this.n.value <= this.levels.value) {
            status.isValid = false
            status.errors.push(
                'Elements in top row must be greater than number of rows'
            )
        }

        return status
    }

    initialize(sketch: p5, seq: SequenceInterface): void {
        super.initialize(sketch, seq)
        if (!this.levels.value) {
            this.levels.value = this.n.value - 1
        }
        if (seq.last - seq.first < this.levels.value) {
            throw Error(
                `Sequence ${seq.name} has too few entries `
                    + `for ${this.levels.value} levels.`
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
        const levels = min(lvls, end - this.first)

        // workingSequence cannibalizes the first n elements
        for (let i = sequence.first; i <= end; i++) {
            workingSequence.push(sequence.getElement(i))
        }

        for (let i = 0; i < levels; i++) {
            console.log(workingSequence)
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
                    workingSequence[j]
                        = workingSequence[j + 1] - workingSequence[j]
                }
            }

            workingSequence.pop()
            // Move the next row forward half an entry, for a pyramid shape.
            firstX = firstX + (1 / 2) * xDelta
        }
    }
    setup() {
        console.log('Set up')
    }
    draw() {
        this.drawDifferences(
            Number(this.n.value),
            Number(this.levels.value),
            this.seq
        )
        this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Differences',
    VizDifferences,
    ''
)
