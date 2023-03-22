import {VisualizerDefault} from './VisualizerDefault'
import p5 from 'p5'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {dummySketch} from '../shared/dummyp5'

export class VisualizerP5 extends VisualizerDefault {
    name = 'p5 Visualizer'
    description = 'Base class for implementing p5 visualizers'
    sketch: p5 = dummySketch
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
