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
    private location: HTMLElement

    /**
     * Constructs a new specimen from a visualizer, a sequence, and an
     * HTML element to inhabit. It is not important that the visualizer
     * is constructed with the same sequence as the one passed to this
     * constructor, because the visualizer will be automatically set
     * to view the specimen's visualizer in this constructor.
     * @param visualizer the specimen's visualizer
     * @param sequence the specimen's sequence
     * @param location the HTML element to inhabit
     */
    constructor(
        visualizer: VisualizerInterface,
        sequence: SequenceInterface,
        location: HTMLElement
    ) {
        this.visualizer = visualizer
        this.sequence = sequence
        this.location = location

        this.visualizer.view(this.sequence)
        this.visualizer.inhabit(this.location)
        this.visualizer.reset()
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
        this.visualizer.view(this.sequence)
        this.visualizer.inhabit(this.location)
        this.visualizer.reset()
        this.visualizer.show()
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
            null as unknown as SequenceInterface,
            null as unknown as HTMLElement
        )
    }
}
