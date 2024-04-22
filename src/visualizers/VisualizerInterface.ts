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
     * Cause the visualizer to realize itself within a DOM element.
     * The visualizer should remove itself from any other location it might
     * have been displaying, and prepare to draw within the provided element.
     * It is safe to call this with the same element in which
     * the visualizer is already displaying.
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
     * Remove the visualization from a DOM element, release its resources, etc.
     * It is an error to call this if the visualization is not currently
     * inhabit()ing any element. If the visualization is currently
     * inhabit()ing a different element, it is presumed that the realization
     * in that element was already cleaned up, and this is a no-op.
     * Note that after this call, it is ok to call inhabit() again,
     * possibly with a different div, to reinitialize it.
     * @param element HTMLElement The DOM node the visualizer was inhabit()ing
     */
    depart(element: HTMLElement): void
}
