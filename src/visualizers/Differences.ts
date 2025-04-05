import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {math} from '@/shared/math'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
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

## Parameters
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
    /** md
- **Digits displayed:** The maximum number of digits to display for each
  sequence entry and difference displayed. If a number to be shown has more
  digits, only the most significant ones will be shown, with an ellipsis,
  and mousing over the number will show the full number in a popup.
     **/
    digits: {
        default: 4,
        type: ParamType.INTEGER,
        displayName: 'Digits displayed',
        required: true,
        description:
            'Maximum digits of each entry to display; excess will be '
            + 'replaced with an ellipsis.',
        hideDescription: true,
        validate: function (n: number, stat: ValidationStatus) {
            stat.forbid(
                n < 2,
                'Room for at least 2 digits per entry required'
            )
        },
    },
} satisfies GenericParamDescription

class Differences extends P5Visualizer(paramDesc) {
    static category = 'Differences'
    static description =
        'Produces a table of differences '
        + 'between consecutive entries, potentially iterated several times'

    // Some fixed configuration values:
    fontSize = 20
    firstY = 30
    yDelta = 50
    leftMargin = 10

    // Dummy values, actually computed in setup() / draw()
    useTerms = -1n
    useLevels = -1n
    xDelta = -1
    entries = [['0']]

    calcLevelsTerms(inLevels: bigint): [bigint, bigint] {
        let useTerms = inLevels + 40n
        if (this.seq.last < this.seq.first + useTerms - 1n) {
            useTerms = BigInt(this.seq.last) - this.seq.first + 1n
        }
        const useLevels = inLevels < useTerms ? inLevels : useTerms
        return [useLevels, useTerms]
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        const [useLevels] = this.calcLevelsTerms(params.levels)
        this.statusOf.levels.warnings.length = 0
        if (params.levels > useLevels) {
            this.statusOf.levels.addWarning(
                `too few sequence entries for ${params.levels} rows; `
                    + `using ${useLevels}`
            )
        }
        return status
    }

    setup() {
        super.setup()
        ;[this.useLevels, this.useTerms] = this.calcLevelsTerms(this.levels)
        this.sketch
            .background('black')
            .textAlign(this.sketch.CENTER)
            .textFont('Arial')
            .textSize(this.fontSize)
            .textStyle(this.sketch.BOLD)
            .colorMode(this.sketch.HSB, 255)
        const demoString = '˗' + '0'.repeat(this.digits) + ' '
        this.xDelta = this.sketch.textWidth(demoString)
        this.entries = []
        for (let i = 0; i < this.useLevels; ++i) this.entries.push([])
    }

    draw() {
        const sketch = this.sketch
        const sequence = this.seq
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
            let curX = ((i + 1) * this.xDelta) / 2 + this.leftMargin

            /* Draw the row, updating workingSequence: */
            for (let j = 0; j < workingSequence.length; j++) {
                const num = workingSequence[j]
                const abs = num < 0 ? -num : num
                let newEntry = num.toString()
                let s = abs.toString()
                if (s.length > this.digits) {
                    const lessDigits = Math.max(1, this.digits - 2)
                    const suffix = this.digits === 2 ? '..' : '…'
                    s = s.substr(0, lessDigits) + suffix
                } else newEntry = ''
                this.entries[i].push(newEntry)
                if (num < 0) s = '˗' + s
                sketch.text(s, curX, this.firstY + i * this.yDelta)
                curX += this.xDelta
                if (j < workingSequence.length - 1) {
                    workingSequence[j] =
                        workingSequence[j + 1] - workingSequence[j]
                }
            }

            workingSequence.pop()
        }
        this.stop()
    }

    mouseMoved(_event: MouseEvent) {
        this.simplePopup()
        const sk = this.sketch
        const adjY = sk.mouseY + this.yDelta - this.firstY
        const row = Math.floor(adjY / this.yDelta)
        const posInRow = adjY % this.yDelta
        if (posInRow < this.yDelta - this.fontSize) return

        const adjX = sk.mouseX - (row * this.xDelta) / 2 - this.leftMargin
        const col = Math.floor(adjX / this.xDelta)
        this.simplePopup(this.entries[row][col], [sk.mouseX, sk.mouseY])
    }
}

export const exportModule = new VisualizerExportModule(Differences)
