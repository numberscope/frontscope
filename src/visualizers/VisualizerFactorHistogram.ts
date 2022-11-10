import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'
import {natlog} from '../shared/math'

/** md
# Factor Histogram

(example image should go here)

This visualizer takes the prime factorization of each element in the sequence
and then creates a histogram of the number of elements of the sequence
with X prime factors. the number of elements with X prime factors is along
the x-axis. And the height is how many elements are in each bin of X.

## Parameters
**/

class FactorHistogramVisualizer extends VisualizerDefault {
    name = 'Histogram'

    binSize = 1
    terms = 100
    firstIndex = this.seq.first

    params = {
        binSize: {
            value: this.binSize,
            forceType: 'integer',
            displayName: 'Bin Size',
            required: true,
        },

        firstIndex: {
            value: this.firstIndex,
            forceType: 'integer',
            displayName: 'First Index',
            required: true,
        },

        terms: {
            value: this.terms,
            forceType: 'integer',
            displayName: 'How many terms of the series',
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
        return Math.max(this.firstIndex, this.seq.first)
    }

    // Obtain the true number of terms
    numTerms(): number {
        return Math.min(this.terms + this.startIndex(), this.seq.last)
    }

    // Find the largest value of the sequence asked for
    largestValue(): bigint {
        let largest_value = this.seq.getElement(this.startIndex())
        for (let i = this.startIndex(); i < this.numTerms(); i++) {
            const value = this.seq.getElement(i)
            if (value > largest_value) {
                largest_value = value
            }
        }
        return largest_value
    }

    // Create an array with the number of factor of
    // each element at the corresponding index of the array
    factorArray(): number[] {
        const factorArray = []
        for (let i = this.startIndex(); i < this.numTerms(); i++) {
            let counter = 0
            const factors = this.seq.getFactors(i)
            if (factors) {
                for (const [base, power] of factors) {
                    if (base > 0) {
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
        for (
            let i = 0;
            i < natlog(this.largestValue()) / natlog(2) + 1;
            i++
        ) {
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
        const binFactorArray = this.binFactorArray()
        let array_length = 0
        for (let i = 0; i < binFactorArray.length; i++) {
            if (binFactorArray[i] != 0) {
                array_length = i
            }
        }
        return (0.95 * this.sketch.width) / (array_length + 1)
    }

    // Create a number that represents how many pixels high
    // each increase of one in the bin array should be
    height(): number {
        const binFactorArray = this.binFactorArray()
        let greatest_value = binFactorArray[0]
        for (let i = 0; i < binFactorArray.length; i++) {
            if (binFactorArray[i] > greatest_value) {
                greatest_value = binFactorArray[i]
            }
        }
        return (0.95 * this.sketch.width) / greatest_value
    }

    draw() {
        //these numbers provide the rgb values for the background color
        this.sketch.background(176, 227, 255)
        const height = this.height()
        const binWidth = this.binWidth()
        const binFactorArray = this.binFactorArray()
        this.sketch.line(
            0.025 * this.sketch.width,
            10,
            0.025 * this.sketch.width,
            this.sketch.height
        )
        this.sketch.line(
            0,
            0.975 * this.sketch.height,
            this.sketch.width,
            0.975 * this.sketch.height
        )

        for (let i = 0; i < binFactorArray.length; i++) {
            this.sketch.rect(
                0.025 * this.sketch.width + binWidth * i,
                0.975 * this.sketch.height - height * binFactorArray[i],
                binWidth,
                height * binFactorArray[i]
            )
            if (this.binSize != 1) {
                this.sketch.text(
                    this.binSize * i
                        + ' - '
                        + (i + this.binSize * i - i + this.binSize - 1),
                    20 + (binWidth * (i + 1) - binWidth / 2),
                    795
                )
            } else {
                this.sketch.text(
                    i,
                    20 + (binWidth * (i + 1) - binWidth / 2),
                    795
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
