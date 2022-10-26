
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'

enum CurveMatch {
    None,
    Linear,
    Quadratic,
    Normal
}


class HistogramVisualizer extends VisualizerDefault {
    name = 'Histogram'

    binSize = 1
    terms = 10
    firstIndex = 1
    curveMatch = CurveMatch.None
    linear = false
    quadratic = false
    normal = false
    bezier = false
    
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
        },

        curveMatch: {
            value: this.curveMatch,
            from: CurveMatch,
            displayName: 'Match the Histogram to a Curve?',
            required: true,
        },

        linear: 
        {
            value: this.linear,
            displayName: 'Linear',
            required: false,
            visibleDependency: 'curveMatch',
            visibleValue: CurveMatch.Linear,
        },

        quadratic: 
        {
            value: this.quadratic,
            displayName: 'Quadratic',
            required: false,
            visibleDependency: 'curveMatch',
            visibleValue: CurveMatch.Quadratic,
        },

        normal: 
        {
            value: this.normal,
            displayName: 'Normal Curve',
            required: false,
            visibleDependency: 'curveMatch',
            visibleValue: CurveMatch.Normal,
        },

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

    largestValue(): number
    {
        let largest_value: number = 0;
        for(let i = 0; i < this.terms; i++)
        {
            const value = Number(this.seq.getElement(i))
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
            const element = Number(this.seq.getElement(i))
            let tempArray = this.seq.getFactors(element)!
            let counter = 0
            for(const [base, power] of tempArray)
            {
                counter += Number(power)
            }
            
            factorArray[i] = counter
        }

        let orderedFactorArray =[]
        for(let i = 0; i < Math.floor(Math.log2(this.largestValue())) + 1; i++)
        {
            orderedFactorArray.push(0)
        }

        for(let i = 0; i < factorArray.length; i++)
        {
            orderedFactorArray[factorArray[i]]++
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
    
        let height = this.height()
        let binWidth = this.binWidth()
        let binFactorArray = this.binFactorArray()
        this.sketch.line(40,10,40,800)       //axes
        this.sketch.line(0,760,790,760)
        this.sketch.rect(760, -1, 41, 41)
        
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