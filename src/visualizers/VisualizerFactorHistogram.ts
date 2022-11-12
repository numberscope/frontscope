import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'

/** md
# Factor Histogram

""

This visualizer takes the prime factorization of each element in the sequence
and then creates a histogram of the number of elements of the sequence
with X prime factors. the number of elements with X prime factors is along
the x-axis. And the height is how many elements are in each bin of X.

## Parameters
**/

class FactorHistogramVisualizer extends VisualizerDefault {
    name = 'Factor Histogram'

    binSize = 1
    terms = 100
    firstIndex = NaN

    params = {
        /** md
- Bin Size: The size of each bin of the histogram.
         **/
        binSize: {
            value: this.binSize,
            forceType: 'integer',
            displayName: 'Bin Size',
            required: true,
        },

        /** md
- First Index: The first index to start getting the factors and forming the 
               histogram from. If the first index is before the first term
               of the series then the first term of the series will be used
         **/
        firstIndex: {
            value: '' as string | number,
            forceType: 'integer',
            displayName: 'First Index',
            required: false,
        },

        /** md
- Number of Terms: The number of terms in the series after the first term.
                   If this goes past the last term of the sequence it will
                   show all terms of the sequence after the first index.
         **/
        terms: {
            value: this.terms,
            forceType: 'integer',
            displayName: 'Number of Terms',
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

    // Create an array with the number of factor of
    // each element at the corresponding index of the array
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
    binFactorArray(): number[] {
        const binFactorArray = []
        const factorArray = this.factorArray()
        const largestValue = factorArray.reduce(
            (a, b) => Math.max(a, b),
            -Infinity
        )
        for (let i = 0; i < largestValue + 1; i++) {
            binFactorArray.push(0)
        }

        for (let i = 0; i < factorArray.length; i++) {
            binFactorArray[Math.trunc(factorArray[i] / this.binSize)]++
        }

        return binFactorArray
    }

    // Create a number that represents how
    // many pixels wide each bin should be
    binWidth(): number {
        return (0.95 * this.sketch.width) / this.binFactorArray().length
    }

    // Create a number that represents how many pixels high
    // each increase of one in the bin array should be
    height(): number {
        const binFactorArray = this.binFactorArray()
        const greatest_value = binFactorArray.reduce(
            (a, b) => Math.max(a, b),
            -Infinity
        )
        return (0.95 * this.sketch.width) / greatest_value
    }

    draw() {
        // These numbers provide the rgb values for the background color
        // This is light blue
        this.sketch.background(176, 227, 255)
        this.sketch.textSize(0.02 * this.sketch.height) //set the text to the correct size
        const height = this.height()
        const binWidth = this.binWidth()
        const binFactorArray = this.binFactorArray()
        this.sketch.line(
            // Draws the y-axis
            0.025 * this.sketch.width, // Creates a slight offset from the side of the canvas
            0,
            0.025 * this.sketch.width, // Creates a slight offset from the side of the canvas
            this.sketch.height
        )
        this.sketch.line(
            // Draws the x-axis
            0,
            0.975 * this.sketch.height, // Creates a slight offset from the side of the canvas
            this.sketch.width,
            0.975 * this.sketch.height // Creates a slight offset from the side of the canvas
        )

        for (let i = 0; i < binFactorArray.length; i++) {
            this.sketch.rect(
                // Draws the rectangles for the Histogram
                0.025 * this.sketch.width + binWidth * i,
                0.975 * this.sketch.height - height * binFactorArray[i],
                binWidth,
                height * binFactorArray[i]
            )
            if (this.binSize != 1) {
                // Draws text for if the bin size is not 1
                this.sketch.text(
                    this.binSize * i + ' - ' + (this.binSize * (i + 1) - 1),
                    0.025 + binWidth * (i + 1 / 2),
                    0.995 * this.sketch.width
                )
            } else {
                // Draws text for if the bin size is 1
                this.sketch.text(
                    i,
                    0.025 * this.sketch.width
                        + (binWidth * (i + 1) - binWidth / 2),
                    0.995 * this.sketch.width
                )
            }
        }

        this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Factor Histogram',
    FactorHistogramVisualizer,
    'Displays a Histogram of the number of prime factors of a sequence.'
)
