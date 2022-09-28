/*
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



class HistogramVisualizer extends VisualizerDefault {
    name = 'Histogram'

    binWidth = 30
    terms = 10
    
    params = 
    {
        binWidth:
        {
            value: this.binWidth,
            forceType: 'integer',
            displayName: 'Bin Width',
            required: true,
        },

        terms: 
        {
            value: this.terms,
            forceType: 'integer',
            displayName: 'How many terms of the series',
            required: true,
        },
    }
    
    checkParameters() {
        const status = super.checkParameters()

        if (this.params.binWidth.value < 1) 
        {
            status.isValid = false
            status.errors.push
            (
                'Bin Width can not be less than 1'
            )
        }

        return status
    }

    //creating the backdrop
    setup(): void {
        this.sketch.createCanvas(400, 400)
    }
    /*
    //drawing the picture
    draw(): void {
        this.sketch.line(20,10,20,400)       //axes
        this.sketch.line(0,380,390,380)
        let factorArray = Array<number> = [];
        for (let i = 0; i <= Math.log2(this.terms); i++)         //creating the array of values(index is x value, amount is y value)
        {
            factorArray.push(0)
        }
        for (let i = 0; i < this.terms; i++)
        {
            const sequenceElement = this.seq.getElement(i)
            console.log('sequenceElement = ${sequenceElement}')
            var numberFactors:number = getFactors(sequenceElement)
            factorArray[numberFactors] = factorArray[numberFactors] + 1
        }
        for (let i = 0; i < factorArray.length(); i++) 
        {
            this.sketch.fill(51)
            this.sketch.rect(20+this.binWidth*i,380 - (20 * factorArray[i]),this.binWidth,factorArray[i])
            this.sketch.text(i+1,(20+((this.binWidth/2)-4*((Math.ceil((Math.log10(i+2))))*0.85)))+(this.binWidth*i),395)
        } 

        // Tell P5 not to loop
        this.sketch.noLoop()
    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule(
    'Histogram',
    HistogramVisualizer,
    'Displays a Histogram of the number of prime factors of the elements of a sequence.'
)
*/