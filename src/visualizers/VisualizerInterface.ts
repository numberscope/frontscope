import type {SequenceInterface} from '../sequences/SequenceInterface'
import type {ParamableInterface} from '../shared/Paramable'

interface VisualizerConstructor {
    /**
     * Constructs a visualizer
     * @param seq SequenceInterface The initial sequence to visualize
     */
    new (seq: SequenceInterface): VisualizerInterface
    visualizationName: string
}

export class VisualizerExportModule {
    name: string
    description: string
    visualizer: VisualizerConstructor

    constructor(viz: VisualizerConstructor, description: string) {
        this.name = viz.visualizationName
        this.visualizer = viz
        this.description = description
    }
}

export interface VisualizerInterface extends ParamableInterface {
    /* Returns a string identifying what sort of Visualizer this is
     * (typically would depend only on the class of the Visualizer)
     */
    visualization(): string
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
    /**
     * Resets the internal state of the visualizer interface. This should ensure
     * that when the visualizer continues to draw, it does so from the
     * beginning.
     */
    reset(): void

    /**
     * Provides a way for visualizers to request a specific aspect ratio for
     * its canvas. This aspect ratio is specified as a positive n > 0 where:
     *  0 < n < 1:  The canvas is taller than it is wide
     *  n = 1:      The canvas is a square
     *  n > 1:      The canvas is wider than it is tall
     * If the visualizer does not wish to request a specific aspect ratio and
     * will instead work with whatever is given, this function may return
     * `undefined` instead.
     * @return the aspect ratio requested by the visualizer, or undefined if any
     */
    requestedAspectRatio(): number | undefined
}
