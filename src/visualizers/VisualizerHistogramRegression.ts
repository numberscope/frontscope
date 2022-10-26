
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


class HistogramRegressionVisualizer extends VisualizerDefault {
    name = 'HistogramRegressionVisualizer'

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
    
    //drawing the picture
    draw() {
        this.sketch.line(40,10,40,800)       //axes
        this.sketch.line(0,760,790,760)
        this.sketch.rect(760, -1, 41, 41)
        var factorArray = []
        var binFactorArray = []
        
        var largestValue = 0
        for (let i = 0; i <= this.terms; i++)
        {
            const value = Number(this.seq.getElement(i + this.firstIndex - 1))
            if(i === 0)
            {
                largestValue = Math.abs(value)
            }

            else
            {
                if(Math.abs(value) > largestValue)
                {
                    largestValue = Math.abs(value)
                }
            }
        }
        
        for (let i = 0; i <= Math.log2(largestValue); i++)         //creating the array of values(index is x value, amount is y value)
        {
            factorArray.push(0)
            binFactorArray.push(0)
        }

        var undefined = 0
        for(let i = 0; i < this.terms; i++)
        {   
            var sequenceElement =  Number(this.seq.getElement(i + this.firstIndex - 1))
            let index = 0
            if((sequenceElement === 0) || (sequenceElement === 1))
            {
                undefined++
            }
            else
            {
                const factors = []
                let divisor = 2
                
                while (sequenceElement >= 2) 
                {
                    if (sequenceElement % divisor == 0) 
                    {
                        index += 1
                        sequenceElement = (sequenceElement / divisor)
                    } 
                    
                    else
                    {
                    divisor++
                    }
                }
                factorArray[index-1] += 1
            }
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

        var binWidth = Math.floor(Math.log2(largestValue))
        for(let i = Math.floor(Math.log2(largestValue)); binFactorArray[i] == 0; i--)
        {
            binWidth = 750/i
        }

        var height = binFactorArray[0]
        for(let i = 0; i < binFactorArray.length; i++)
        {
            if(binFactorArray[i] > height)
            {
                height = binFactorArray[i]
            }
        }
        height = 700/height

        var lr = [0,0,0];
        var n = binFactorArray.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        for (var i = 0; i < n; i++) {

            sum_x += (i+1);
            sum_y += binFactorArray[i];
            sum_xy += ((i+1)*binFactorArray[i]);
            sum_xx += ((i+1)*(i+1));
            sum_yy += (binFactorArray[i]*binFactorArray[i]);
        } 

        lr[0] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);      //slope
        lr[1] = (sum_y - lr[0] * sum_x)/n;      //y int
        lr[2] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);      //r^2
        
        var y_int = (lr[1] * height) - 760
        var x_end = 40 + (((binWidth) * (binFactorArray.length))-(binWidth/2))
        var y_end = (((lr[0]*binFactorArray.length) + lr[1]) * height) + 760
        var r2 = lr[2].toPrecision(2)   


        for (let i = 0; i < (binFactorArray.length); i++) 
        {
            this.sketch.rect((40+binWidth*i),760 - (height * binFactorArray[i]),binWidth,(height * binFactorArray[i]))
            this.sketch.rect(10 ,760 - (height * undefined),30,height * undefined)
            this.sketch.text(0,20,785)
            if(this.linear == true)
            {
                this.sketch.line(40, y_int, x_end, y_end)
                this.sketch.text(r2, 767, 25)
            }
            if(this.binSize != 1)
            {
                this.sketch.text((i + 1 + (this.binSize * (i)) - i) + " - "  + ((i + 1 + (this.binSize * (i)) - i) + this.binSize - 1),40 + (((binWidth) * (i+1))-(binWidth/2)),785)   //make based on the highest bin with factors
            }
            else
            {
                this.sketch.text((i + 1),40 + (((binWidth) * (i+1))-(binWidth/2)),785)
            }
        }

    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule(
    'Histogram Regression',
    HistogramRegressionVisualizer,
    'Displays a Histogram of the number of prime factors of the elements of a sequence.'
)
