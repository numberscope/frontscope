import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {P5Visualizer} from './P5Visualizer'
import {ParamType} from '../shared/ParamType'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import type {SequenceInterface} from '@/sequences/SequenceInterface'

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
        required: true,
    },
    /** md
- First Index: The first index included in the statistics.
    If the first index is before the first term
    of the series then the first term of the series will be used.
    **/
    firstIndex: {
        default: NaN,
        type: ParamType.INTEGER,
        displayName: 'First Index',
        required: false,
    },

    /** md
- Number of Terms: The number of terms included in the statistics.
        If this goes past the last term of the sequence it will
        show all terms of the sequence after the first index.
    **/
    terms: {
        default: 100,
        type: ParamType.INTEGER,
        displayName: 'Number of Terms',
        required: true,
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
} as const

class FactorHistogram extends P5Visualizer<typeof paramDesc> {
    name = 'Factor Histogram'
    description =
        'Displays a histogram of the '
        + 'number of prime factors of a sequence'

    binSize = 1
    terms = 100
    firstIndex = NaN
    mouseOver = true

    binFactorArray: number[] = []

    constructor(seq: SequenceInterface<GenericParamDescription>) {
        super(paramDesc, seq)
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.binSize < 1)
            status.addError('Bin Size can not be less than 1')

        return status
    }

    // Obtain the true first index
    startIndex(): number {
        if (
            Number.isNaN(this.firstIndex)
            || this.firstIndex < this.seq.first
        ) {
            return this.seq.first
        } else {
            return this.firstIndex
        }
    }

    // Obtain the true number of terms
    endIndex(): number {
        return Math.min(this.terms + this.startIndex(), this.seq.last)
    }

    // Obtain the binned difference of an input
    binOf(input: number): number {
        return Math.trunc(input / this.binSize)
    }

    // Create an array with the number of factors of
    // the element at the corresponding index of the array
    factorArray(): number[] {
        const factorArray = []
        for (let i = this.startIndex(); i < this.endIndex(); i++) {
            let counter = 0
            const factors = this.seq.getFactors(i)
            if (factors) {
                for (const [base, power] of factors) {
                    if (base > 0n) {
                        counter += Number(power)
                    } else if (base === 0n) {
                        counter = 0
                    }
                }
            }

            factorArray[i] = counter
        }
        return factorArray
    }

    // Create an array with the frequency of each number
    // of factors in the corresponding bins
    binFactorArraySetup() {
        const factorArray = this.factorArray()
        const largestValue = factorArray.reduce(
            (a: number, b: number) => Math.max(a, b),
            -Infinity
        )
        for (let i = 0; i < this.binOf(largestValue) + 1; i++) {
            this.binFactorArray.push(0)
        }

        for (let i = 0; i < factorArray.length; i++) {
            this.binFactorArray[this.binOf(factorArray[i])]++
        }
    }

    // Create a number that represents how
    // many pixels wide each bin should be
    binWidth(): number {
        const width = this.sketch.width
        // 0.95 Creates a small offset from the side of the screen
        if (this.binFactorArray.length <= 30) {
            return (0.95 * width) / this.binFactorArray.length - 1
        } else {
            return (0.95 * width) / 30 - 1
        }
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
        const y = this.sketch.mouseY
        // hard to mouseover tiny bars; min height to catch mouse
        return (
            y
                > Math.min(
                    xAxisHeight
                        - this.height() * this.binFactorArray[binIndex],
                    xAxisHeight - 10
                ) && y < xAxisHeight
        ) // and above axis
    }

    drawHoverBox(binIndex: number, offset: number) {
        const sketch = this.sketch
        const mouseX = sketch.mouseX
        const mouseY = sketch.mouseY
        const boxWidth = sketch.width * 0.15
        const textVerticalSpacing = sketch.textAscent()
        const boxHeight = textVerticalSpacing * 2.3
        // don't want box to wander past right edge of canvas
        const boxX = Math.min(mouseX, sketch.width - boxWidth)
        const boxY = mouseY - boxHeight
        const boxOffset = offset
        const boxRadius = Math.floor(boxOffset)

        // create the box itself
        sketch
            .fill('white')
            .rect(
                boxX,
                boxY,
                boxWidth,
                boxHeight,
                boxRadius,
                boxRadius,
                boxRadius,
                boxRadius
            )

        // Draws the text for the number of prime factors
        // that bin represents
        sketch
            .fill('black')
            .text('Factors:', boxX + boxOffset, boxY + textVerticalSpacing)
        let binText = ''
        if (this.binSize != 1) {
            binText = (
                this.binSize * binIndex
                + '-'
                + (this.binSize * (binIndex + 1) - 1)
            ).toString()
        } else {
            binText = binIndex.toString()
        }
        const binTextSize = sketch.textWidth(binText) + 3 * boxOffset
        sketch.text(
            binText,
            boxX + boxWidth - binTextSize,
            boxY + textVerticalSpacing
        )

        // Draws the text for the number of elements of the sequence
        // in the bin
        sketch.text(
            'Height:',
            boxX + boxOffset,
            boxY + textVerticalSpacing * 2
        )
        const heightText = this.binFactorArray[binIndex].toString()
        sketch.text(
            heightText,
            boxX + boxWidth - 3 * boxOffset - sketch.textWidth(heightText),
            boxY + textVerticalSpacing * 2
        )
    }

    draw() {
        const sketch = this.sketch
        if (this.binFactorArray.length == 0) {
            this.binFactorArraySetup()
        }
        sketch.background(176, 227, 255) // light blue
        sketch.textSize(0.02 * sketch.height)
        const height = this.height()
        const binWidth = this.binWidth()
        const largeOffsetScalar = 0.945 // padding between axes and edge
        const smallOffsetScalar = 0.996
        const largeOffsetNumber = (1 - largeOffsetScalar) * sketch.width
        const smallOffsetNumber = (1 - smallOffsetScalar) * sketch.width
        const binIndex = Math.floor(
            (sketch.mouseX - largeOffsetNumber) / binWidth
        )
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
                largeOffsetNumber + binWidth * i + 1,
                largeOffsetScalar * sketch.height
                    - height * this.binFactorArray[i],
                binWidth - 2,
                height * this.binFactorArray[i]
            )
            if (this.binFactorArray.length > 30) {
                sketch.text(
                    'Too many unique factors.',
                    sketch.width * 0.75,
                    sketch.height * 0.03
                )
                sketch.text(
                    'Displaying the first 30',
                    sketch.width * 0.75,
                    sketch.height * 0.05
                )
            }

            sketch.fill('black') // text must be filled
            if (this.binSize != 1) {
                // Draws text in the case the bin size is not 1
                const binText = (
                    this.binSize * i
                    + ' - '
                    + (this.binSize * (i + 1) - 1)
                ).toString()
                sketch.text(
                    binText,
                    1 - largeOffsetScalar + binWidth * (i + 1 / 2),
                    smallOffsetScalar * sketch.width
                )
            } else {
                // Draws text in the case the bin size is 1
                const binText = i.toString()
                sketch.text(
                    binText,
                    largeOffsetNumber + (binWidth * (i + 1) - binWidth / 2),
                    smallOffsetScalar * sketch.width
                )
            }
        }

        let tickHeight = Math.floor((0.95 * sketch.height) / (height * 5))

        // Sets the tickHeight to 1 if the calculated value is less than 1
        if (tickHeight === 0) {
            tickHeight = 1
        }
        // Draws the markings on the Y-axis
        for (let i = 0; i < 9; i++) {
            // Draws the tick marks
            sketch.line(
                (largeOffsetNumber * 3) / 4,
                sketch.height
                    - largeOffsetNumber
                    - tickHeight * height * (i + 1),
                (3 * largeOffsetNumber) / 2,
                sketch.height
                    - largeOffsetNumber
                    - tickHeight * height * (i + 1)
            )

            // Places the numbers on the right side of the axis if
            // they are 4 digits or more; left side otherwise
            let tickNudge = 0
            if (tickHeight > 999) {
                tickNudge = (3 * largeOffsetNumber) / 2
            }
            // Avoid placing text that will get cut off
            const tickYPosition =
                sketch.height
                - largeOffsetNumber
                - tickHeight * height * (i + 1)
                + (3 * smallOffsetNumber) / 2
            if (tickYPosition > sketch.textAscent()) {
                sketch.text(tickHeight * (i + 1), tickNudge, tickYPosition)
            }
        }

        // If mouse interaction, draw hover box
        if (this.mouseOver === true && inBin === true) {
            this.drawHoverBox(binIndex, smallOffsetNumber)
        }
        // If no mouse interaction, don't loop
        if (this.mouseOver === false) {
            sketch.noLoop()
        }
    }
}

/** md

_Originally contributed by Devlin Costello._
 **/

export const exportModule = new VisualizerExportModule(FactorHistogram)
