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


class LineVisualizer extends VisualizerDefault {
    name = 'Lines'

    params = {}

    //creating the backdrop
    setup(): void {
        this.sketch.createCanvas(400, 400)
    }

    //drawing the picture
    draw(): void {
        for (let i = 0; i < 5; i++) {
            const sequenceElement = this.seq.getElement(i)
            console.log('sequenceElement = ${sequenceElement}')
            this.sketch.line(20 + 20*i + Number(sequenceElement), 380, 20 + 20*i + Number(sequenceElement), 380-(20 * Number(sequenceElement)))
        }

        // Tell P5 not to loop
        this.sketch.noLoop()
    }
}

//exporting the visualizer
export const exportModule = new VisualizerExportModule(
    'Lines',
    LineVisualizer,
    'Displays lines to the Viewer'
)