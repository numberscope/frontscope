import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'

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

class FactorHistogramVisualizer extends VisualizerDefault {
    name = 'Factor Histogram'

    binSize = 1
    terms = 100
    firstIndex = NaN
    mouseOver = true

    binFactorArray: number[] = []

    params = {
        /** md
- Bin Size: The size (number of Omega values) for each bin
  of the histogram.
         **/
        binSize: {
            value: this.binSize,
            forceType: 'integer',
            displayName: 'Bin Size',
            required: true,
        },
        /** md
- First Index: The first index included in the statistics.
               If the first index is before the first term
               of the series then the first term of the series will be used.
         **/
        firstIndex: {
            value: '' as string | number,
            forceType: 'integer',
            displayName: 'First Index',
            required: false,
        },

        /** md
- Number of Terms: The number of terms included in the statistics.
                   If this goes past the last term of the sequence it will
                   show all terms of the sequence after the first index.
         **/
        terms: {
            value: this.terms,
            forceType: 'integer',
            displayName: 'Number of Terms',
            required: true,
        },

        /** md
- Mouse Over:   This turns on a mouse over feature that shows you the height
                of the bin that you are currently hovering over, as well as
		the bin label (i.e., which Omega values are included).
         **/
        mouseOver: {
            value: this.mouseOver,
            forceType: 'boolean',
            displayName: 'Mouse Over',
            required: true,
        },
    }

    checkParameters() {
        const status = super.checkParameters()

        if (this.params.binSize.value < 1) {
            status.isValid = false
            status.errors.push('Bin Size can not be less than 1')
        }

        return status
    }

    // Obtain the true first index
    startIndex(): number {
        if (
            typeof this.params.firstIndex.value === 'string'
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
        // 0.95 Creates a small offset from the side of the screen
        if (this.binFactorArray.length <= 30) {
            return (0.95 * this.sketch.width) / this.binFactorArray.length - 1
        } else {
            return (0.95 * this.sketch.width) / 30 - 1
        }
    }

    // Create a number that represents how many pixels high
    // each increase of one in the bin array should be
    height(): number {
        const greatestValue = this.binFactorArray.reduce(
            (a: number, b: number) => Math.max(a, b),
            -Infinity
        )
        // magic number creates a small offset from the top of the screen
        return (0.9 * this.sketch.height) / greatestValue
    }

    draw() {
        if (this.binFactorArray.length == 0) {
            this.binFactorArraySetup()
        }
        // This is light blue
        this.sketch.background(176, 227, 255)
        this.sketch.textSize(0.02 * this.sketch.height)
        const height = this.height()
        const binWidth = this.binWidth()
        const largeOffsetScalar = 0.945 // padding between axes and edge
        const smallOffsetScalar = 0.996
        const largeOffsetNumber = (1 - largeOffsetScalar) * this.sketch.width
        const smallOffsetNumber = (1 - smallOffsetScalar) * this.sketch.width
        let binText = ''
        let binTextSize = 0

        // Checks to see whether the mouse is in the bin drawn on the screen
        const mouseX = this.sketch.mouseX
        const mouseY = this.sketch.mouseY
        const binIndex = Math.floor((mouseX - largeOffsetNumber) / binWidth)
        const xAxisHeight = largeOffsetScalar * this.sketch.height
        let inBin = false
        if (this.mouseOver) {
            if (
                mouseY
                    // hard to mouseover tiny bars; min height to catch mouse
                    > Math.min(
                        largeOffsetScalar * this.sketch.height
                            - height * this.binFactorArray[binIndex],
                        xAxisHeight - 10
                    )
                // and above axis
                && mouseY < largeOffsetScalar * this.sketch.height
            ) {
                inBin = true
            }
        }

        // Draw the axes
        const yAxisPosition = largeOffsetNumber
        this.sketch.line(
            // Draws the y-axis
            yAxisPosition,
            0,
            yAxisPosition,
            this.sketch.height
        )
        this.sketch.line(
            // Draws the x-axis
            0,
            xAxisHeight,
            this.sketch.width,
            xAxisHeight
        )

        for (let i = 0; i < 30; i++) {
            if (this.mouseOver && inBin && i == binIndex) {
                this.sketch.fill(200, 200, 200)
            } else {
                this.sketch.fill('white')
            }
            this.sketch.rect(
                // Draws the rectangles for the Histogram
                largeOffsetNumber + binWidth * i + 1,
                largeOffsetScalar * this.sketch.height
                    - height * this.binFactorArray[i],
                binWidth - 2,
                height * this.binFactorArray[i]
            )
            if (this.binFactorArray.length > 30) {
                this.sketch.text(
                    'Too many unique factors.',
                    this.sketch.width * 0.75,
                    this.sketch.height * 0.03
                )
                this.sketch.text(
                    'Displaying the first 30',
                    this.sketch.width * 0.75,
                    this.sketch.height * 0.05
                )
            }

            this.sketch.fill('black') // text must be filled
            if (this.binSize != 1) {
                // Draws text in the case the bin size is not 1
                binText = (
                    this.binSize * i
                    + ' - '
                    + (this.binSize * (i + 1) - 1)
                ).toString()
                this.sketch.text(
                    binText,
                    1 - largeOffsetScalar + binWidth * (i + 1 / 2),
                    smallOffsetScalar * this.sketch.width
                )
            } else {
                // Draws text in the case the bin size is 1
                binText = i.toString()
                this.sketch.text(
                    binText,
                    largeOffsetNumber + (binWidth * (i + 1) - binWidth / 2),
                    smallOffsetScalar * this.sketch.width
                )
            }
        }

        let tickHeight = Math.floor(
            (0.95 * this.sketch.height) / (height * 5)
        )

        // Sets the tickHeight to 1 if the calculated value is less than 1
        if (tickHeight === 0) {
            tickHeight = 1
        }
        // Draws the markings on the Y-axis
        for (let i = 0; i < 9; i++) {
            // Draws the tick marks
            this.sketch.line(
                (largeOffsetNumber * 3) / 4,
                this.sketch.height
                    - largeOffsetNumber
                    - tickHeight * height * (i + 1),
                (3 * largeOffsetNumber) / 2,
                this.sketch.height
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
                this.sketch.height
                - largeOffsetNumber
                - tickHeight * height * (i + 1)
                + (3 * smallOffsetNumber) / 2
            if (tickYPosition > this.sketch.textAscent()) {
                this.sketch.text(
                    tickHeight * (i + 1),
                    tickNudge,
                    tickYPosition
                )
            }
        }

        // Draws the box and the text inside the box
        if (this.mouseOver === true && inBin === true) {
            const boxWidth = this.sketch.width * 0.15
            const textVerticalSpacing = this.sketch.textAscent()
            const boxHeight = textVerticalSpacing * 2.3
            // don't want box to wander past right edge of canvas
            const boxX = Math.min(mouseX, this.sketch.width - boxWidth)
            const boxY = mouseY - boxHeight
            const boxRadius = Math.floor(smallOffsetNumber)
            const boxOffset = smallOffsetNumber
            this.sketch.fill('white')
            this.sketch.rect(
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
            this.sketch.fill('black')
            this.sketch.text(
                'Factors:',
                boxX + boxOffset,
                boxY + textVerticalSpacing
            )
            if (this.binSize != 1) {
                binText = (
                    this.binSize * binIndex
                    + '-'
                    + (this.binSize * (binIndex + 1) - 1)
                ).toString()
            } else {
                binText = binIndex.toString()
            }
            binTextSize = this.sketch.textWidth(binText) + 3 * boxOffset
            this.sketch.text(
                binText,
                boxX + boxWidth - binTextSize,
                boxY + textVerticalSpacing
            )

            // Draws the text for the number of elements of the sequence
            // in the bin
            this.sketch.text(
                'Height:',
                boxX + boxOffset,
                boxY + textVerticalSpacing * 2
            )
            const heightText = this.binFactorArray[binIndex].toString()
            this.sketch.text(
                heightText,
                boxX
                    + boxWidth
                    - 3 * boxOffset
                    - this.sketch.textWidth(heightText),
                boxY + textVerticalSpacing * 2
            )
        }
        if (this.mouseOver === false) {
            this.sketch.noLoop()
        }
    }
}

/** md

_Originally contributed by Devlin Costello._
 **/

export const exportModule = new VisualizerExportModule(
    'Factor Histogram',
    FactorHistogramVisualizer,
    'Displays a Histogram of the number of prime factors of a sequence.'
)
