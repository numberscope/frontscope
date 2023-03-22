import type {VisualizerInterface} from './VisualizerInterface'
import {Paramable} from '../shared/Paramable'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {SequenceDefault} from '../sequences/SequenceDefault'

export class VisualizerDefault
    extends Paramable
    implements VisualizerInterface
{
    name = 'Default Visualizer'
    description = 'Base class for implementing Visualizers'
    ready = false
    seq: SequenceInterface = new SequenceDefault(0)
    maxWidth = 0
    maxHeight = 0
    /***
      Sets the sketch and the sequence to draw with
      This is also where you would generate any settings or
      draw functions if needed
      */
    initialize(
        canvasContainer: HTMLElement,
        seq: SequenceInterface,
        maxWidth: number,
        maxHeight: number
    ): void {
        if (this.isValid) {
            this.maxWidth = maxWidth
            this.maxHeight = maxHeight
            this.seq = seq
            this.ready = true
        } else {
            throw (
                'The visualizer is not valid. '
                + 'Run validate and address any errors.'
            )
        }
    }

    setup() {
        return
    }

    draw() {
        return
    }
}
