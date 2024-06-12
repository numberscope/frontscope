import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'

/**
 * This class represents a specimen, containing a visualizer,
 * a sequence, and the set of all parameters that make both of them up.
 * Specimens can be converted to and from URLs so that they can be saved.
 */
export class Specimen {
    private visualizer: VisualizerInterface
    private sequence: SequenceInterface
    private location?: HTMLElement
    private isSetup: boolean = false
    private size: {width: number; height: number}

    /**
     * Constructs a new specimen from a visualizer, and a sequence
     * It is not important that the visualizer
     * is constructed with the same sequence as the one passed to this
     * constructor, because the visualizer will be automatically set
     * to view the specimen's visualizer in this constructor.
     * @param visualizer the specimen's visualizer
     * @param sequence the specimen's sequence
     */
    constructor(
        visualizer: VisualizerInterface,
        sequence: SequenceInterface
    ) {
        this.visualizer = visualizer
        this.sequence = sequence
        this.size = {width: 0, height: 0}
    }
    /**
     * Call this as soon after construction as possible once the HTML
     * element has been mounted
     */
    setup(location: HTMLElement) {
        this.location = location
        this.size = this.calculateSize(
            this.location.clientWidth,
            this.location.clientHeight,
            this.visualizer.requestedAspectRatio()
        )

        this.visualizer.view(this.sequence)
        this.visualizer.inhabit(this.location, this.size)
        this.visualizer.show()
        this.isSetup = true
    }

    /**
     * Hard resets the specimen
     */
    reset() {
        if (!this.location) return
        this.size = this.calculateSize(
            this.location.clientWidth,
            this.location.clientHeight,
            this.visualizer.requestedAspectRatio()
        )

        this.visualizer.depart(this.location)
        this.visualizer.inhabit(this.location, this.size)
        this.visualizer.show()
    }
    /**
     * Returns the specimen's visualizer
     */
    getVisualizer(): VisualizerInterface {
        return this.visualizer
    }
    /**
     * Returns the specimen's sequence
     */
    getSequence(): SequenceInterface {
        return this.sequence
    }
    /**
     * Assigns a new visualizer to this specimen and updates its sequence
     * to match the specimen. It also ensures this visualizer inhabits
     * the correct HTML element and begins to render.
     */
    setVisualizer(visualizer: VisualizerInterface) {
        this.visualizer = visualizer
        if (this.isSetup) this.setup(this.location!)
    }
    /**
     * Assigns a new sequence to this specimen and updates the visualizer
     * to reflect this change in the render.
     */
    setSequence(sequence: SequenceInterface) {
        this.sequence = sequence
        this.visualizer.view(this.sequence)
    }
    /**
     * Ensures that the visualizer is aware that the sequence has been
     * updated.
     */
    updateSequence() {
        this.visualizer.view(this.sequence)
    }

    /**
     * Calculates the size of the visualizer in its container.
     * @param containerWidth width of the container
     * @param containerHeight height of the container
     * @param aspectRatio aspect ratio requested by visualizer
     * @returns the size of the visualizer
     */
    calculateSize(
        containerWidth: number,
        containerHeight: number,
        aspectRatio: number | undefined
    ): {width: number; height: number} {
        if (aspectRatio === undefined)
            return {
                width: containerWidth,
                height: containerHeight,
            }
        const constraint = containerWidth / containerHeight < aspectRatio
        return {
            width: constraint
                ? containerWidth
                : containerHeight * aspectRatio,
            height: constraint
                ? containerWidth / aspectRatio
                : containerHeight,
        }
    }
    /**
     * This function should be called when the size of the visualizer container
     * has changed. It calculates the size of the contents according to the
     * aspect ratio requested and calls the resize function.
     * @param width New width of the visualizer container
     * @param height New height of the visualizer container
     */
    resized(width: number, height: number): void {
        const newSize = this.calculateSize(
            width,
            height,
            this.visualizer.requestedAspectRatio()
        )

        if (
            this.size.width === newSize.width
            && this.size.height === newSize.height
        )
            return

        this.size = newSize

        if (!this.visualizer.resized?.(this.size.width, this.size.height)) {
            // Reset the visualizer if the resized function isn't implemented
            this.reset()
        }
    }
    /**
     * Converts the specimen to a URL as a way of saving all information
     * about the specimen.
     * @return the specimen URL as a string
     */
    toURL(): string {
        // TODO
        return ''
    }
    /**
     * Reads a specimen URL previously generated by toURL() and parses
     * it back into a `Specimen` object.
     * @param _url the specimen URL to parse
     * @return the corresponding specimen object
     */
    static fromURL(_url: string): Specimen {
        // TODO
        return new Specimen(
            null as unknown as VisualizerInterface,
            null as unknown as SequenceInterface
        )
    }
}
