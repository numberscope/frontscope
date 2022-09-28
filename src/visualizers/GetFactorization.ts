import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import { string } from 'mathjs'


const min = Math.min

/**  md
# Lines Visualizer

[Image should go Here]



## Parameters
**/


class FactorVisualizer extends VisualizerDefault {
    name = 'Factorization'

    params = {}

    //creating the backdrop
    setup(): void {
        this.sketch.createCanvas(400, 400)
    }


    //drawing the picture
    draw(): void {
        for (let i = 0; i < 5; i++) {
            const sequenceElement = this.seq.getElement(i)
            this.sketch.textSize(32)
            console.log(typeof Number(sequenceElement))
            const myFactors =  this.seq.getFactors(Number(sequenceElement))
            console.log(myFactors)
            //this.sketch.text(myFactors,20,20 + 50*i)  
        }

        // Tell P5 not to loop
        this.sketch.noLoop()
    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule(
    'Factors',
    FactorVisualizer,
    'Displays Factors to the Viewer'
)