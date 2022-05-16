import {SequenceInterface} from '../sequences/SequenceInterface'
import {ParamableInterface} from '../shared/Paramable'
import p5 from 'p5'

interface VisualizerConstructor {
    new (): VisualizerInterface
}

export class VisualizerExportModule {
    name: string
    description: string
    visualizer: VisualizerConstructor

    constructor(
        name: string,
        viz: VisualizerConstructor,
        description?: string
    ) {
        this.name = name
        this.visualizer = viz
        this.description = description || ''
    }
}

export interface VisualizerInterface extends ParamableInterface {
    /**
     * A sequence instance that fulfills the sequence interface.
     */
    seq: SequenceInterface
    /**
     * A p5 sketch instance.
     */
    sketch: p5
    /**
     * Initialize is simply applying the validated configuration params to the
     * visualizer to prepare it to draw.
     * @param sketch The p5 instance the visualizer will draw on
     * @param seq The Sequence object supplying sequence values
     */
    initialize(sketch: p5, seq: SequenceInterface): void
    /**
     * Sets up the p5 canvas.
     */
    setup(): void
    /**
     * Draws the sequence through the visualizer into the p5 canvas.
     */
    draw(): void
}
