
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import { setBlockTracking } from 'vue'
import {natlog} from 'c:/Users/devli/Desktop/Numberscope/frontscope/src/shared/math'

class HistogramVisualizer extends VisualizerDefault {
    name = 'Histogram'

    binSize = 1
    terms = 10
    firstIndex = 1
    linear = false
    
    params = 
    {
        binSize:
        {
            value: this.binSize,
            forceType: 'integer',
            displayName: 'Bin Size',
            required: true,
        },

        firstIndex:
        {
            value: this.firstIndex,
            forceType: 'integer',
            displayName: 'First Index',
            required: true,
        },

        terms: 
        {
            value: this.terms,
            forceType: 'integer',
            displayName: 'How many terms of the series',
            required: true,
        }

    }
    
    checkParameters() {
        const status = super.checkParameters()

        if (this.params.binSize.value < 1) 
        {
            status.isValid = false
            status.errors.push
            (
                'Bin Size can not be less than 1'
            )
        }

        if (this.params.binSize.value < 1) 
        {
            status.isValid = false
            status.errors.push
            (
                'Bin Size can not be less than 1'
            )
        }

        if (this.params.firstIndex.value < 1) 
        {
            status.isValid = false
            status.errors.push
            (
                'First index can not be less than 1'
            )
        }

        return status
    }

    largestValue(): bigint
    {
        let largest_value: bigint = 0n;
        for(let i = 0; i < this.terms; i++)
        {
            const value = this.seq.getElement(i)
            if(i == 0)
            {
                largest_value = value
            }
            else if( value > largest_value)
            {
                largest_value = value
            }
        }
        return largest_value
    }

    binFactorArray(): number[]
    {
        var factorArray = []
        for(let i = 0; i < this.terms; i++)
        {
            let counter = 0n
            for(const [base, power] of this.seq.getFactors(i)!)
            {
                counter += power
                //this.sketch.text(Number(power), 500, 300 + 25 *i)
            }

            factorArray[i] = counter
        }

        let orderedFactorArray =[]
        for(let i = 0; i < (natlog(this.largestValue())/natlog(2)) + 1; i++)
        {
            orderedFactorArray.push(0)
        }

        for(let i = 0; i < factorArray.length; i++)
        {
            orderedFactorArray[Number(factorArray[i])]++
        }

        var binFactorArray = [];
        for(let i = 0; i < Math.ceil(orderedFactorArray.length/this.binSize); i++)
        {
            binFactorArray.push(0)
        }

        let index = 0
        for(let i = 0; i < binFactorArray.length; i++)
        {
            for(let j = 0; j < this.binSize; j++)
            {
                if((index + j) < orderedFactorArray.length)
                {
                    binFactorArray[i] += orderedFactorArray[index + j]
                }
            }
            index += this.binSize
        }

        return binFactorArray
    }

    binWidth(): number
    {
        let binFactorArray = this.binFactorArray()
        var binWidth = 0
        for(let i = 0; i < binFactorArray.length; i++)
        {
            if(binFactorArray[i] != 0)
            {
                binWidth = i
            }
        }
        return 750/(binWidth + 1)
    }

    height(): number
    {
        let binFactorArray = this.binFactorArray()
        var height = binFactorArray[0]
        for(let i = 0; i < binFactorArray.length; i++)
        {
            if(binFactorArray[i] > height)
            {
                height = binFactorArray[i]
            }
        }
        return 750/height
    }

    //drawing the picture
    draw() 
    {
        this.sketch.background(176,227,255)
        let height = this.height()
        let binWidth = this.binWidth()
        let binFactorArray = this.binFactorArray()
        this.sketch.line(40,10,40,800)       //axes
        this.sketch.line(0,760,790,760)
        
        for (let i = 0; i < (binFactorArray.length); i++) 
        {
            this.sketch.rect((40+binWidth*i),Number(760 - (height * binFactorArray[i])),binWidth,height * binFactorArray[i])
            if(this.binSize != 1)
            {
                this.sketch.text((i + (this.binSize * (i)) - i) + " - "  + ((i + (this.binSize * (i)) - i) + this.binSize - 1),40 + (((binWidth) * (i+1))-(binWidth/2)),785)   //make based on the highest bin with factors
            }
            else
            {
                this.sketch.text(i,40 + ((binWidth * (i+1))-(binWidth/2)),785)
            }
        }
        
        this.sketch.noLoop()

    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule
(
    'Histogram',
    HistogramVisualizer,
    'Displays a Histogram of the number of prime factors of the elements of a sequence.'
)