import {VisualizerExportModule} from './VisualizerInterface'
import {P5GLVisualizer} from './P5GLVisualizer'

import interFont from '@/assets/fonts/inter/Inter-VariableFont_slnt,wght.ttf'
import {math} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Factor Histogram

[<img src="../../assets/img/FactorHistogram/ExampleImage.png"
width="320" style="float: right; margin-left: 1em;" />](
../assets/img/FactorHistogram/ExampleImage.png)

This visualizer counts the number of prime factors (with multiplicity)
of each entry in the sequence and creates a histogram of the results.

The number of prime factors with multiplicity is a function commonly
called
[Omega](https://oeis.org/wiki/
Omega(n),_number_of_prime_factors_of_n_(with_multiplicity)).

The horizontal axis represents values of Omega.  Each
bar corresponds to a range of possible Omega values (a bin).
The height of each bar shows how many entries in the sequence
have a corresponding value of Omega.


## Parameters
**/

const paramDesc = {
    /** md
- Bin Size: The size (number of Omega values) for each bin
of the histogram.
    **/
    binSize: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Bin Size',
        required: false,
        validate(s: number, status: ValidationStatus) {
            if (s < 1) status.addError('cannot be less than 1')
        },
    },
    /** md
- Mouse Over:   This turns on a mouse over feature that shows you the height
        of the bin that you are currently hovering over, as well as
the bin label (i.e., which Omega values are included).
    **/
    mouseOver: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Mouse Over',
        required: true,
    },
} satisfies GenericParamDescription

class FactorHistogram extends P5GLVisualizer(paramDesc) {
    static category = 'Factor Histogram'
    static description =
        'Displays a histogram of the number of prime factors of a sequence'

    factoring = true
    binFactorArray: number[] = []
    numUnknown = 0
    fontsLoaded = false

    // Obtain the binned difference of an input
    binOf(input: number): number {
        return Math.trunc(input / this.binSize)
    }

    endIndex(): bigint {
        // TODO: Should post warning about artificial limitation here
        // (when it takes effect)
        return typeof this.seq.last === 'bigint'
            ? this.seq.last
            : this.seq.first + 9999n
    }

    // Create an array with the value at n being the number of entries
    // of the sequence having n factors. Entries with unknown factorization
    // are put into -1
    factorCounts(): number[] {
        const factorCount = []
        for (let i = this.seq.first; i <= this.endIndex(); i++) {
            let counter = 0
            const factors = this.seq.getFactors(i)
            if (factors) {
                for (const [base, power] of factors) {
                    if (base === 0n) {
                        counter = 0
                        break
                    }
                    counter += math.safeNumber(power)
                }
            }
            if (counter === 0 && math.bigabs(this.seq.getElement(i)) > 1) {
                counter = -1
            }
            if (counter in factorCount) factorCount[counter]++
            else factorCount[counter] = 1
        }
        return factorCount
    }

    // Create an array with the frequency of each number
    // of factors in the corresponding bins
    async binFactorArraySetup() {
        await this.seq.fill(this.endIndex(), 'factors')
        const factorCount = this.factorCounts()
        let largestValue = factorCount.length - 1
        if (largestValue < 0) largestValue = 0
        this.binFactorArray = new Array(this.binOf(largestValue) + 1).fill(0)
        factorCount.forEach(
            (count, ix) => (this.binFactorArray[this.binOf(ix)] += count)
        )
        if ((-1) in factorCount) {
            this.numUnknown = factorCount[-1]
            this.binFactorArray[0] += this.numUnknown
        } else this.numUnknown = 0
        this.factoring = false
    }

    // Create a number that represents how
    // many pixels wide each bin should be
    binWidth(): number {
        const width = this.sketch.width
        let nBars = this.binFactorArray.length
        if (nBars > 30) nBars = 30
        // 0.95 Creates a small offset from the side of the screen
        return (0.95 * width) / nBars - 1
    }

    // Create a number that represents how many pixels high
    // each increase of one in the bin array should be
    height(): number {
        const height = this.sketch.height
        const greatestValue = this.binFactorArray.reduce(
            (a: number, b: number) => Math.max(a, b),
            -Infinity
        )
        // magic number creates a small offset from the top of the screen
        return (0.9 * height) / greatestValue
    }

    // check if mouse is in the given bin
    mouseOverInBin(xAxisHeight: number, binIndex: number): boolean {
        const {pY} = this.mouseToPlot()
        // hard to mouseover tiny bars; min height to catch mouse
        return (
            pY
                > Math.min(
                    xAxisHeight
                        - this.height() * this.binFactorArray[binIndex],
                    xAxisHeight - 10
                ) && pY < xAxisHeight
        ) // and above axis
    }

    setup() {
        super.setup()
        this.fontsLoaded = false
        this.sketch.loadFont(interFont, font => {
            this.sketch.textFont(font)
            this.fontsLoaded = true
        })
        this.factoring = true
        this.binFactorArraySetup()
    }

    barLabel(binIndex: number) {
        if (this.binSize === 1) return binIndex.toString()
        const binStart = this.binSize * binIndex
        return `${binStart}-${binStart + this.binSize - 1}`
    }

    write(txt: string, x: number, y: number) {
        if (this.fontsLoaded) this.sketch.text(txt, x, y)
    }

    drawHoverBox(binIndex: number, offset: number) {
        const sketch = this.sketch
        const {pX, pY, scale} = this.mouseToPlot()
        const showUnknown = binIndex === 0 && this.numUnknown > 0
        let textVerticalSpacing = sketch.textAscent() + 1
        // Literally no idea why we only have to scale when scale > 1 :-/
        // but there's no arguing with it looking right
        if (scale > 1) textVerticalSpacing *= scale
        let boxHeight = textVerticalSpacing * 2.4
        if (showUnknown) boxHeight += textVerticalSpacing
        const margin = offset
        const boxRadius = Math.floor(margin)

        // Set up the texts to display:
        const captions = ['Factors: ', 'Height: ']
        const values = [
            this.barLabel(binIndex),
            this.binFactorArray[binIndex].toString(),
        ]
        if (showUnknown) {
            captions.push('Unknown: ')
            values.push(this.numUnknown.toString())
        }
        let captionWidth = 0
        let totalWidth = 0
        for (let i = 0; i < captions.length; ++i) {
            let width = sketch.textWidth(captions[i])
            if (width > captionWidth) captionWidth = width
            width += sketch.textWidth(values[i])
            if (width > totalWidth) totalWidth = width
        }
        totalWidth += 2 * margin

        // don't want box to wander past right edge of canvas
        const boxX = Math.min(pX, sketch.width - totalWidth)
        const boxY = pY - boxHeight

        // create the box itself
        sketch.push()
        sketch.translate(0, 0, 2)
        sketch.fill('white')
        sketch.rect(boxX, boxY, totalWidth, boxHeight, boxRadius)

        // Draws the text for the number of prime factors
        // that bin represents
        sketch.fill('black')

        for (let i = 0; i < captions.length; ++i) {
            this.write(
                captions[i] + values[i],
                boxX + margin,
                boxY + (i + 1) * textVerticalSpacing
            )
        }
        sketch.pop()
    }

    draw() {
        this.handleDrags()
        const sketch = this.sketch
        sketch.background(176, 227, 255) // light blue
        // Convert back to the ordinary p5 coordinates as this was
        // originally written with:
        sketch.translate(-this.size.width / 2, -this.size.height / 2)
        const {pX, scale} = this.mouseToPlot()
        sketch.textSize(Math.max(0.02 * sketch.height * scale, 10))
        const height = this.height() // "unit" height
        const textHeight = sketch.textAscent() * scale
        const largeOffsetScalar = 0.945 // padding between axes and edge
        const smallOffsetScalar = 0.996
        const largeOffsetNumber = (1 - largeOffsetScalar) * sketch.width
        const smallOffsetNumber = (1 - smallOffsetScalar) * sketch.width

        if (this.factoring) {
            sketch.fill('red')
            this.write('Factoring ...', largeOffsetNumber, textHeight * 2)
            this.continue()
            this.stop(3)
        }

        const binWidth = this.binWidth()
        const binIndex = Math.floor((pX - largeOffsetNumber) / binWidth)
        const xAxisHeight = largeOffsetScalar * sketch.height

        // Checks to see whether the mouse is in the bin drawn on the screen
        let inBin = false
        if (this.mouseOver) {
            inBin = this.mouseOverInBin(xAxisHeight, binIndex)
        }

        // Draw the axes
        const yAxisPosition = largeOffsetNumber
        // Draw the y-axis
        sketch.line(yAxisPosition, 0, yAxisPosition, sketch.height)
        // Draw the x-axis
        sketch.line(0, xAxisHeight, sketch.width, xAxisHeight)

        for (let i = 0; i < 30; i++) {
            if (this.mouseOver && inBin && i == binIndex) {
                sketch.fill(200, 200, 200)
            } else {
                sketch.fill('white')
            }
            // Draw the rectangles for the Histogram
            sketch.rect(
                yAxisPosition + binWidth * i + 1,
                xAxisHeight - height * this.binFactorArray[i],
                binWidth - 2,
                height * this.binFactorArray[i]
            )
            sketch.fill('black') // text must be filled
            const barLabel = this.barLabel(i)
            const labelWidth = sketch.textWidth(barLabel)
            this.write(
                barLabel,
                yAxisPosition + binWidth * (i + 0.5) - labelWidth / 2,
                xAxisHeight + 1.3 * textHeight
            )
        }

        let nTicks = 5
        let tickHeight = Math.floor(
            (0.95 * sketch.height) / (height * nTicks)
        )

        // Sets the tickHeight to 1 if the calculated value is less than 1
        if (tickHeight === 0) {
            tickHeight = 1
        }
        // Make tickHeight a round number:
        let roundHeight = 1
        let bigCandidate = 1
        const multipliers = [2, 2.5, 2]
        while (bigCandidate < tickHeight) {
            for (const mult of multipliers) {
                bigCandidate *= mult
                if (bigCandidate <= tickHeight) roundHeight = bigCandidate
                else break
            }
        }
        tickHeight = roundHeight
        nTicks = Math.floor(sketch.height / (height * tickHeight))
        const bigTick = nTicks * tickHeight
        const bigTickWidth = sketch.textWidth(bigTick.toString())
        // Draws the markings on the Y-axis
        const tickLeft = yAxisPosition - largeOffsetNumber / 5
        const tickRight = yAxisPosition + largeOffsetNumber / 5
        const rightJustify = bigTickWidth < tickLeft - 2 * smallOffsetNumber
        for (let i = 1; i <= nTicks; i++) {
            // Draws the tick marks
            let tickY = xAxisHeight - tickHeight * height * i
            sketch.line(tickLeft, tickY, tickRight, tickY)

            const label = (tickHeight * i).toString()
            let tickPos = tickRight + smallOffsetNumber
            if (rightJustify) {
                const labelWidth = sketch.textWidth(label)
                tickPos = tickLeft - labelWidth - smallOffsetNumber
            }

            // Avoid placing text that will get cut off
            tickY += textHeight / 2.5
            if (tickY > sketch.textAscent()) {
                this.write(label, tickPos, tickY)
            }
        }

        // Possible bug workaround (see drawHoverBox):
        this.write(' ', 0, 0)

        // hatch the unknown factors
        if (this.numUnknown > 0) {
            sketch.fill('white')
            this.hatchRect(
                largeOffsetNumber + 1,
                largeOffsetScalar * sketch.height
                    - height * this.binFactorArray[0],
                binWidth - 2,
                height * this.numUnknown
            )
        }
        if (this.binFactorArray.length > 30) {
            sketch.fill('chocolate')
            const {pX, pY} = this.canvasToPlot(
                0.75 * sketch.width,
                0.1 * sketch.height
            )
            this.write(
                `Too many bins (${this.binFactorArray.length}),`,
                pX,
                pY - textHeight * 3
            )
            this.write('Displaying the first 30.', pX, pY - textHeight * 1.3)
        }
        // If mouse interaction, draw hover box
        if (this.mouseOver && inBin) {
            this.drawHoverBox(binIndex, smallOffsetNumber)
        }
        // Once everything is loaded, no need to redraw until mouse moves
        if (!this.fontsLoaded || this.factoring || sketch.mouseIsPressed) {
            this.continue()
            this.stop(3)
        }
    }

    mouseMoved() {
        if (this.mouseOver || this.sketch.mouseIsPressed) {
            this.continue()
            this.stop(3)
        }
    }

    mousePressed() {
        super.mousePressed()
        this.stop(3)
    }
}

/** md

_Originally contributed by Devlin Costello._
 **/

export const exportModule = new VisualizerExportModule(FactorHistogram)
