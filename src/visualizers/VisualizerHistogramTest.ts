
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'

const min = Math.min


class HistogramTestVisualizer extends VisualizerDefault {
    name = 'Histogram Test'

    binSize = 1
    terms = 100
    firstIndex = 1
    animationCounter = 0
    undefined = 0
    
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

        return status
    }
    
    pg: any
    setup(): void {
        this.sketch.frameRate(1)
        this.sketch.createCanvas(800,800)
        this.pg = this.sketch.createGraphics(800,800)
    }

    largestValue(): number 
    {
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

        return largestValue
    }
    
    factorization(): number[]
    {
        var factorArray = []
        var binFactorArray = []
        const largestValue = this.largestValue()

        for (let i = 0; i <= Math.log2(largestValue); i++)         //creating the array of values(index is x value, amount is y value)
        {
            factorArray.push(0)
            binFactorArray.push(0)
        }

        for(let i = 0; i < this.terms; i++)
        {   
            var sequenceElement =  Number(this.seq.getElement(i + this.firstIndex - 1))
            let factorIndex = 0
            const factors = []
            let divisor = 2
                
            while (sequenceElement >= 2) 
            {
                if (sequenceElement % divisor == 0) 
                {
                    factorIndex += 1
                    sequenceElement = (sequenceElement / divisor)
                } 
                
                else
                {
                divisor++
                }
            factorArray[factorIndex-1] += 1
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

        return binFactorArray
    }

    binWidth(): number
    {
        const binFactorArray = this.factorization()
        const largestValue = this.largestValue()
        var binWidth = Math.floor(Math.log2(largestValue))
        for(let i = Math.floor(Math.log2(largestValue)); binFactorArray[i] == 0; i--)
        {
            binWidth = 750/i
        }

        return binWidth
    }

    height(): number
    {
        const binFactorArray = this.factorization()
        var height = binFactorArray[0]
        for(let i = 0; i < binFactorArray.length; i++)
        {
            if(binFactorArray[i] > height)
            {
                height = binFactorArray[i]
            }
        }
        height = 700/height

        return height
    }


    //drawing the picture
    draw() {    
        this.sketch.line(40,10,40,800)       //axes
        this.sketch.line(0,760,790,760)
        this.sketch.rect(760, -1, 41, 41)
        this.pg.text(this.animationCounter, 765, 35)
        var binWidth = this.binWidth()
        var height = this.height()
        var undefined = this.undefined
        this.sketch.image(this.pg, 0, 0)
        
        var factorArray = []
        var animationFactorArray = []
        const largestValue = this.largestValue()

        for (let i = 0; i <= Math.log2(largestValue); i++)         //creating the array of values(index is x value, amount is y value)
        {
            factorArray.push(0)
            animationFactorArray.push(0)
        }
        var sequenceElement =  Number(this.seq.getElement(this.animationCounter + this.firstIndex - 1))
        let factorIndex = 0
        if((sequenceElement === 0) || (sequenceElement === 1))
        {
            this.undefined++
        }
        else
        {
            const factors = []
            let divisor = 2
            
            while (sequenceElement >= 2) 
            {
                if (sequenceElement % divisor == 0) 
                {
                    factorIndex += 1
                    sequenceElement = (sequenceElement / divisor)
                } 
                    
                else
                {
                    divisor++
                }
            }
            factorArray[factorIndex-1] += 1
        }
        
        /*  
        let binIndex = 0
        for(let j = 0; j < this.binSize; j++)
            {
                animationFactorArray[binIndex] += factorArray[this.animationCounter+j]
            }
        binIndex++ */

        this.pg.rect((40+binWidth*this.animationCounter),760 - (height * animationFactorArray[this.animationCounter]),binWidth,(height * animationFactorArray[this.animationCounter]))
        this.pg.rect(10 ,760 - (height * undefined),30,height * undefined)
        this.pg.text(0,20,785)
        if(this.binSize != 1)
        {
            this.pg.text((this.animationCounter + 1 + (this.binSize * (this.animationCounter)) - this.animationCounter) + " - "  + ((this.animationCounter + 1 + (this.binSize * (this.animationCounter)) - this.animationCounter) + this.binSize - 1),40 + (((binWidth) * (this.animationCounter+1))-(binWidth/2)),785)   //make based on the highest bin with factors
        }
        else
        {
            this.pg.text((this.animationCounter + 1 + (this.binSize * (this.animationCounter)) - this.animationCounter),40 + (((binWidth) * (this.animationCounter+1))-(binWidth/2)),785)
        }

        if(this.animationCounter < (animationFactorArray.length))
        {
            this.animationCounter++
        }
    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule(
    'Histogram Test',
    HistogramTestVisualizer,
    'Displays a Histogram of the number of prime factors of the elements of a sequence.'
)
