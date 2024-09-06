import type {SequenceInterface} from '../sequences/SequenceInterface'
import type {ParamableInterface} from '../shared/Paramable'

interface VisualizerConstructor {
    /**
     * Constructs a visualizer
     * @param seq SequenceInterface The initial sequence to visualize
     */
    new (seq: SequenceInterface): VisualizerInterface
    // Enforce that all visualizers have standard static properties
    category: string
    description: string
}

export class VisualizerExportModule {
    visualizer: VisualizerConstructor
    category: string
    description: string

    constructor(
        viz: VisualizerConstructor,
        category?: string,
        description?: string
    ) {
        this.visualizer = viz
        this.category = category || viz.category
        this.description = description || viz.description
    }
}

export interface ViewSize {
    width: number
    height: number
}
export const nullSize = {width: 0, height: 0}
export function sameSize(size1: ViewSize, size2: ViewSize) {
    return size1.width === size2.width && size1.height === size2.height
}

// A visualizer may be either unmounted, drawing, or stopped:
export const DrawingUnmounted = 0
export const Drawing = 1
export const DrawingStopped = 2
export type DrawingState =
    | typeof DrawingUnmounted
    | typeof Drawing
    | typeof DrawingStopped

export interface VisualizerInterface extends ParamableInterface {
    /**
     * Change the sequence the visualizer is showing.
     */
    view(seq: SequenceInterface): Promise<void>
    /**
     * Cause the visualizer to realize itself within a DOM element.
     * The visualizer should remove itself from any other location it might
     * have been displaying, and prepare to draw within the provided element.
     * It is safe to call this with the same element in which the visualizer
     * is already displaying (and the removal and preparation should still
     * happen).
     * The size provided to the visualizer is the size the visualizer should
     * assume, respecting its aspect ratio preferences. If needed, the
     * visualizer can also query the size of the element for the full container
     * size.
     * @param {HTMLElement} element  The DOM node where the visualizer should
     *     insert itself.
     * @param {ViewSize} size  The width and height the visualizer should occupy
     */
    inhabit(element: HTMLElement, size: ViewSize): Promise<void>
    /**
     * Show the sequence according to this visualizer, i.e. start drawing
     */
    show(): void
    /**
     * Is the visualizer currently drawing?
     */
    drawingState: number
    /**
     * Stop drawing the visualization after at most max more frames. If
     * max <= 0 or not specified, stops immediately. If max = Infinity,
     * this call has no effect. The only way to clear a previously
     * set maximum is to call the `continue()` method.
     * @param {number|undefined} max  Maximum number of frames to draw
     */
    stop(max?: number): void
    /**
     * Continue drawing the visualization
     */
    continue(): void
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
     * This is called when the size of the visualizer should change, either
     * because the window is resized, or the docking configuration has changed.
     * Visualizer writers should take care to resize their canvas and to make
     * sure that any html elements aren't wider than the requested width.
     * The new size is the full available size cut down to fit in the requested
     * aspect ratio.
     *
     * Not implementing this function will mean that the visualizer is reset
     * on resize. If it is implemented, returning true means the
     * visualizer will **not** be reset, and resolving to false means that
     * it will be reset.
     * @param {ViewSize} size
     *     The new width and height of the visualizer (in pixels)
     */
    resized?(size: ViewSize): Promise<boolean>
    /**
     * Provides a way for visualizers to request a specific aspect ratio for
     * its canvas. This aspect ratio is specified as a positive n > 0 where
     * n = width/height, meaning:
     *  0 < n < 1:  The canvas is taller than it is wide
     *  n = 1:      The canvas is a square
     *  n > 1:      The canvas is wider than it is tall
     * If the visualizer does not wish to request a specific aspect ratio and
     * will instead work with whatever is given, this function may return
     * `undefined` instead.
     * @return the aspect ratio (width/height) requested by the visualizer,
     * or undefined if no requested ratio
     */
    requestedAspectRatio(): number | undefined
}
