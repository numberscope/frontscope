import type {SequenceInterface} from '../sequences/SequenceInterface'
import type {ParamableInterface} from '../shared/Paramable'

interface VisualizerConstructor {
    /**
     * Constructs a visualizer
     * @param seq SequenceInterface The initial sequence to visualize
     */
    new (seq: SequenceInterface): VisualizerInterface
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
     * Change the sequence the visualizer is showing.
     */
    view(seq: SequenceInterface): void
    /**
     * Provide the element that the visualizer will now realize itself
     * within. The visualizer should stop any prior visualizations,
     * and prepare to draw within the provided element.
     * @param element HTMLElement The DOM node where the visualizer should
     *     insert itself.
     */
    inhabit(element: HTMLElement): void
    /**
     * Show the sequence according to this visualizer.
     */
    show(): void
    /**
     * Stop drawing the visualization
     */
    stop(): void
    /**
     * Throw out the visualization, release its resources, etc.
     * Note that after this call, it is ok to call inhabit() again,
     * possibly with a different div, to reinitialize it.
     */
    dispose(): void
}
