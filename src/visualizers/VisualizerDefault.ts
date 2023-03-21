import type {VisualizerInterface} from './VisualizerInterface'
import {Paramable} from '../shared/Paramable'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {SequenceDefault} from '../sequences/SequenceDefault'
import p5 from 'p5'

export class VisualizerDefault
    extends Paramable
    implements VisualizerInterface
{
    name = 'Default Visualizer'
    description = 'Base class for implementing Visualizers'
    ready = false
    sketch: p5 = new p5(sketch => {
        return sketch
    })
    canvas: p5.Renderer | Record<string, never> = {}
    seq: SequenceInterface = new SequenceDefault(0)
    /***
      Sets the sketch and the sequence to draw with
      This is also where you would generate any settings or
      draw functions if needed
      */
    initialize(sketch: p5, seq: SequenceInterface): void {
        if (this.isValid) {
            this.sketch = sketch
            this.seq = seq

            this.ready = true
        } else {
            throw (
                'The visualizer is not valid. '
                + 'Run validate and address any errors.'
            )
        }
    }
    setup(): void {
        this.canvas = this.sketch.createCanvas(800, 800)
        this.sketch.background('white')
    }
    draw(): void {
        return
    }
}
