import type {SequenceInterface} from '../sequences/SequenceInterface'
import type {ParamableInterface} from '../shared/Paramable'

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
     * Initialize is simply applying the validated configuration params to the
     * visualizer to prepare it to draw.
     * @param canvasContainer The HTML element that the visualizer is
     *                        given to create a canvas in
     * @param seq The Sequence object supplying sequence values
     */
    initialize(canvasContainer: HTMLElement, seq: SequenceInterface): void

    setup(): void

    draw(): void
}
