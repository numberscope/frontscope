import {VisualizerDefault} from './VisualizerDefault'
import p5 from 'p5'
import type {SequenceInterface} from '../sequences/SequenceInterface'

export class VisualizerP5 extends VisualizerDefault {
    name = 'p5 Visualizer'
    description = 'Base class for implementing p5 visualizers'

    // We initialize the sketch variable to be a dummy p5 object because
    // we want it to have the correct type, and we don't want to guard
    // against it being undefined.
    sketch: p5 = new p5(sketch => sketch)
    canvas: p5.Renderer | Record<string, never> = {}
    initialize(
        canvasContainer: HTMLElement,
        seq: SequenceInterface,
        maxWidth: number,
        maxHeight: number
    ) {
        super.initialize(canvasContainer, seq, maxWidth, maxHeight)
        this.sketch = new p5(sketch => sketch, canvasContainer)
    }
    setup() {
        this.canvas = this.sketch.createCanvas(this.maxWidth, this.maxHeight)
        this.sketch.background('white')
    }
    draw() {
        return
    }
}
