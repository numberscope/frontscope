import {VisualizerInterface} from './VisualizerInterface'
import {Paramable} from '../shared/Paramable'
import {SequenceInterface} from '../sequences/SequenceInterface'
import {SequenceClassDefault} from '../sequences/SequenceClassDefault'
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
    seq: SequenceInterface = new SequenceClassDefault(0)
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
                // prettier-ignore
                'The visualizer is not valid. '
                + 'Run validate and address any errors.'
            )
        }
    }
    setup(): void {
        return
    }
    draw(): void {
        return
    }
}
