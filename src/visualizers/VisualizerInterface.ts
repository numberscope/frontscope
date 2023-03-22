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
     * The maximum width the visualizer is allowed to occupy on the screen
     * in pixels(?).
     */
    maxWidth: number
    /**
     * The maximum height the visualizer is allowed to occupy on the screen
     * in pixels(?).
     */
    maxHeight: number
    /**
     * Initialize is simply applying the validated configuration params to the
     * visualizer to prepare it to draw.
     * @param canvasContainer The HTML element that the visualizer is
     *                        given to create a canvas in
     * @param seq The Sequence object supplying sequence values
     * @param maxWidth The maximum width for the visualizer in pixels(?)
     * @param maxHeight The maximum height for the visualizer in pixels(?)
     */
    initialize(
        canvasContainer: HTMLElement,
        seq: SequenceInterface,
        maxWidth: number,
        maxHeight: number
    ): void

    setup(): void

    draw(): void
}
