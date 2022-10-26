
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'

const min = Math.min

/**  md
# Lines Visualizer

[Image should go Here]

This is a Visualizer that displays the first 5 terms
in a sequence as lines with a length equal to their 
value

## Parameters
**/
enum CurveMatch {
    None,
    Linear,
    Quadratic,
    Normal
}


class HistogramVisualizer extends VisualizerDefault {
    name = 'Histogram'

    binSize = 1
    terms = 100
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
    
    setup(): void {
        this.sketch.frameRate(1)
    }

    largestValue(): BigInt
    {
        let largest_value: BigInt = 0n;
        for(let i = 0; i < this.terms; i++)
        {
            const value = this.seq.getElement(i)
            if(i === 0)
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
            const element = this.seq.getElement(i)
            factorArray[i] = this.seq.getFactors(6)!.length
        }

        var binFactorArray = [];
        for(let i = 0n; i < this.largestValue().toString.length-1; i++)
        {
            binFactorArray.push(0)
        }

        let index = 0
        for(let i = 0; i < factorArray.length; i += this.binSize)
        {
            for(let j = 0; j < this.binSize; j++)
            {
                binFactorArray[index] += factorArray[i+j]
            }
            index++
        }

        return binFactorArray
    }

    binWidth(): number
    {
        var binWidth = Number(this.largestValue().toString.length-1)
        for(let i = Number(this.largestValue().toString.length-1); this.binFactorArray()[i] == 0; i--)
        {
            binWidth = 750/i
        }
        return binWidth
    }

    height(): number
    {
        var height = this.binFactorArray()[0]
        for(let i = 0; i < this.binFactorArray().length; i++)
        {
            if(this.binFactorArray()[i] > height)
            {
                height = this.binFactorArray()[i]
            }
        }
        return (700/height)
    }
    
    //drawing the picture
    draw() 
    {
        this.sketch.line(40,10,40,800)       //axes
        this.sketch.line(0,760,790,760)
        this.sketch.rect(760, -1, 41, 41)
                
        for (let i = 0; i < (this.binFactorArray().length); i++) 
        {
            this.sketch.rect((40+this.binWidth()*i),Number(760 - (this.height() * this.binFactorArray()[i])),this.binWidth(),Number(this.height() * this.binFactorArray()[i]))
            this.sketch.text(0,20,785)
            if(this.binSize != 1)
            {
                this.sketch.text((i + 1 + (this.binSize * (i)) - i) + " - "  + ((i + 1 + (this.binSize * (i)) - i) + this.binSize - 1),40 + (((this.binWidth()) * (i+1))-(this.binWidth()/2)),785)   //make based on the highest bin with factors
            }
            else
            {
                this.sketch.text((i + 1 + (this.binSize * (i)) - i),40 + (((this.binWidth()) * (i+1))-(this.binWidth()/2)),785)
            }
        }
        this.sketch.noLoop() 

    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule(
    'Histogram',
    HistogramVisualizer,
    'Displays a Histogram of the number of prime factors of the elements of a sequence.'
)