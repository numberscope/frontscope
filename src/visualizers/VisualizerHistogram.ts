import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'
import {natlog} from '../shared/math'

class HistogramVisualizer extends VisualizerDefault {
    name = 'Histogram'

    binSize = 1
    terms = 10
    firstIndex = 1
    linear = false

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

        if (this.params.binSize.value < 1) {
            status.isValid = false
            status.errors.push('Bin Size can not be less than 1')
        }

        if (this.params.firstIndex.value < 1) {
            status.isValid = false
            status.errors.push('First index can not be less than 1')
        }

        return status
    }

    //find the largest value of the sequence asked for
    largestValue(): bigint {
        let largest_value = 0n
        for (
            let i = Math.max(this.firstIndex, this.seq.first);
            i < Math.min(this.terms, this.seq.last);
            i++
        ) {
            const value = this.seq.getElement(i)
            if (i == 0) {
                largest_value = value
            } else if (value > largest_value) {
                largest_value = value
            }
        }
        return largest_value
    }

    //create an array for the height of each bin of the histogram
    binFactorArray(): number[] {
        //create an array with the number of factor of
        //each element at the corresponding index of the array
        const factorArray = []
        for (
            let i = Math.max(this.firstIndex, this.seq.first);
            i < Math.min(this.terms, this.seq.last);
            i++
        ) {
            let counter = 0n
            const factors = this.seq.getFactors(i)
            if (factors) {
                for (const [, power] of factors) {
                    counter += power
                }
            }

            factorArray[i] = counter
        }

        //create an array with the frequency of each number
        //of factors in the corresponding index
        const orderedFactorArray = []
        for (
            let i = 0;
            i < natlog(this.largestValue()) / natlog(2) + 1;
            i++
        ) {
            orderedFactorArray.push(0)
        }

        for (let i = 0; i < factorArray.length; i++) {
            orderedFactorArray[Number(factorArray[i])]++
        }

        //change the bin size of the
        //histogram to what the user asked for
        const binFactorArray = []
        for (
            let i = 0;
            i < Math.ceil(orderedFactorArray.length / this.binSize);
            i++
        ) {
            binFactorArray.push(0)
        }

        let index = 0
        for (let i = 0; i < binFactorArray.length; i++) {
            for (let j = 0; j < this.binSize; j++) {
                if (index + j < orderedFactorArray.length) {
                    binFactorArray[i] += orderedFactorArray[index + j]
                }
            }
            index += this.binSize
        }

        return binFactorArray
    }

    //create a number that represents how
    //many pixels wide each bin should be
    binWidth(): number {
        const binFactorArray = this.binFactorArray()
        let binWidth = 0
        for (let i = 0; i < binFactorArray.length; i++) {
            if (binFactorArray[i] != 0) {
                binWidth = i
            }
        }
        return 750 / (binWidth + 1)
    }

    //create a number that represents how many pixels high
    //each increase of one in the bin array should be
    height(): number {
        const binFactorArray = this.binFactorArray()
        let height = binFactorArray[0]
        for (let i = 0; i < binFactorArray.length; i++) {
            if (binFactorArray[i] > height) {
                height = binFactorArray[i]
            }
        }
        return 750 / height
    }

    draw() {
        this.sketch.background(176, 227, 255)
        const height = this.height()
        const binWidth = this.binWidth()
        const binFactorArray = this.binFactorArray()
        this.sketch.line(40, 10, 40, 800)
        this.sketch.line(0, 760, 790, 760)

        for (let i = 0; i < binFactorArray.length; i++) {
            this.sketch.rect(
                40 + binWidth * i,
                Number(760 - height * binFactorArray[i]),
                binWidth,
                height * binFactorArray[i]
            )
            if (this.binSize != 1) {
                this.sketch.text(
                    i
                        + this.binSize * i
                        - i
                        + ' - '
                        + (i + this.binSize * i - i + this.binSize - 1),
                    40 + (binWidth * (i + 1) - binWidth / 2),
                    785
                )
            } else {
                this.sketch.text(
                    i,
                    40 + (binWidth * (i + 1) - binWidth / 2),
                    785
                )
            }
        }

        this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Histogram',
    HistogramVisualizer,
    'Displays a Histogram of the number of prime factors of a sequence.'
)
