import {specimenQuery, parseSpecimenQuery} from './browserCaching'
import type {GenericParamDescription} from './Paramable'

import {produceSequence} from '@/sequences/sequences'
import type {SequenceInterface} from '@/sequences/SequenceInterface'

import type {
    VisualizerInterface,
    ViewSize,
} from '@/visualizers/VisualizerInterface'
import {nullSize, sameSize} from '@/visualizers/VisualizerInterface'
import vizMODULES from '@/visualizers/visualizers'

/**
 * This class represents a specimen, containing a visualizer,
 * a sequence, and the set of all parameters that make both of them up.
 * Specimens can be converted to and from URL query string encodings so that
 * they can be saved.
 */
export class Specimen {
    name: string
    private _visualizerKey: string
    private _sequenceKey: string
    private _visualizer: VisualizerInterface<GenericParamDescription>
    private _sequence: SequenceInterface<GenericParamDescription>
    private location?: HTMLElement
    private isSetup: boolean = false
    private size = nullSize

    /**
     * Constructs a new specimen from a visualizer and a sequence.
     * The string arguments passed in are expected to be keys
     * for the visualizer/sequences' export modules.
     * Optionally the URL query string encodings of the visualizer and sequence
     * parameters can be passed in as well.
     * @param {string} name
     * @param {string} visualizerKey  the specimen's variety of visualizer
     * @param {string} sequenceKey  the specimen's variety of sequence
     * @param {string?} vizQuery  query string encoding visualizer parameters
     * @param {string?} seqQuery  query string encoding sequence parameters
     */
    constructor(
        name: string,
        visualizerKey: string,
        sequenceKey: string,
        vizQuery?: string,
        seqQuery?: string
    ) {
        this.name = name
        this._visualizerKey = visualizerKey
        this._sequenceKey = sequenceKey
        this._sequence = Specimen.makeSequence(sequenceKey, seqQuery)

        this._visualizer = new vizMODULES[visualizerKey].visualizer(
            this._sequence
        )
        if (vizQuery) this._visualizer.loadQuery(vizQuery)
    }

    // Helper for constructor and for extracting sequence name
    static makeSequence(key: string, query?: string) {
        const sequence = produceSequence(key)
        if (query) sequence.loadQuery(query)
        return sequence
    }
    /**
     * Call this as soon after construction as possible once the HTML
     * element has been mounted
     * @param {HTMLElement} location  where in the DOM to insert the specimen
     */
    async setup(location: HTMLElement) {
        this.location = location
        this.size = this.calculateSize(
            {width: location.clientWidth, height: location.clientHeight},
            this.visualizer.requestedAspectRatio()
        )

        this.sequence.initialize()
        await this.sequence.fill()
        this.visualizer.view(this.sequence)
        await this.visualizer.inhabit(this.location, this.size)
        this.visualizer.show()
        this.isSetup = true
    }
    /**
     * Hard resets the specimen
     */
    async reset() {
        if (!this.location) return
        this.size = this.calculateSize(
            {
                width: this.location.clientWidth,
                height: this.location.clientHeight,
            },
            this.visualizer.requestedAspectRatio()
        )

        await this.visualizer.inhabit(this.location, this.size)
        this.visualizer.show()
    }
    /**
     * Returns the key of the specimen's visualizer
     * @return {string} the variety of visualizer used in this specimen
     */
    get visualizerKey(): string {
        return this._visualizerKey
    }
    /**
     * Returns the key of the specimen's sequence
     * @return {string} the variety of sequence shown in this specimen
     */
    get sequenceKey(): string {
        return this._sequenceKey
    }
    /**
     * Returns the query-encoding of the specimen
     * @return {string} a URL query string that specifies this specimen
     */
    get query(): string {
        return specimenQuery(
            this.name,
            this._visualizerKey,
            this._sequenceKey,
            this._visualizer.query,
            this._sequence.query
        )
    }
    /**
     * Returns the specimen's visualizer
     * @returns {VisualizerInterface} the visualizer displaying this specimen
     */
    get visualizer(): VisualizerInterface<GenericParamDescription> {
        return this._visualizer
    }
    /**
     * Returns the specimen's sequence
     * @returns {SequenceInterface} the sequence shown in this specimen
     */
    get sequence(): SequenceInterface<GenericParamDescription> {
        return this._sequence
    }
    /**
     * Assigns a new visualizer to this specimen and updates its sequence
     * to match the specimen. It also ensures this visualizer inhabits
     * the correct HTML element and begins to render.
     * @param {string} visualizerKey
     *     the key of the desired visualizer's export module
     */
    set visualizerKey(visualizerKey: string) {
        this._visualizerKey = visualizerKey
        this._visualizer.depart(this.location!)
        this._visualizer = new vizMODULES[visualizerKey].visualizer(
            this._sequence
        )
        if (this.isSetup) this.setup(this.location!)
    }
    /**
     * Assigns a new sequence to this specimen and updates the visualizer
     * to reflect this change in the render.
     * @param {string} specimenKey  key of the desired sequence's export module
     */
    set sequenceKey(sequenceKey: string) {
        this._sequenceKey = sequenceKey
        this._sequence = Specimen.makeSequence(sequenceKey)
        this._sequence.initialize()
        this.visualizer.view(this.sequence)
    }
    /**
     * Ensures that the visualizer is aware that the sequence has been
     * updated.
     */
    updateSequence() {
        return this.visualizer.view(this.sequence)
    }

    /**
     * Calculates the size of the visualizer in its container.
     * @param {number} containerWidth  width of the container
     * @param {number} containerHeight  height of the container
     * @param {number?} aspectRatio  aspect ratio requested by visualizer
     * @returns {{width: number, height: number}} resulting size of visualizer
     */
    calculateSize(inSize: ViewSize, aspectRatio?: number): ViewSize {
        if (aspectRatio === undefined) return inSize
        const constraint = inSize.width / inSize.height < aspectRatio
        return {
            width: constraint ? inSize.width : inSize.height * aspectRatio,
            height: constraint ? inSize.width / aspectRatio : inSize.height,
        }
    }
    /**
     * This function should be called when the size of the visualizer container
     * has changed. It calculates the size of the contents according to the
     * aspect ratio requested and calls the resize function.
     * @param {ViewSize} toSize
     *     New width and height of the visualizer container
     */
    async resized(toSize: ViewSize): Promise<void> {
        const newSize = this.calculateSize(
            toSize,
            this.visualizer.requestedAspectRatio()
        )
        if (sameSize(this.size, newSize)) return
        this.size = newSize
        // Reset the visualizer if the resized function isn't implemented
        // or returns false, meaning it didn't handle the redisplay
        if (this.visualizer.resized) {
            const handled = await this.visualizer.resized(this.size)
            if (!handled) this.reset()
        }
    }
    /**
     * Generates a specimen from a URL query string (as produced by the
     * query getter of a Specimen instance).
     * @param {string} query  the URL query string encoding of a specimen
     * @return {Specimen} the corresponding specimen
     */
    static async fromQuery(query: string) {
        const specs = parseSpecimenQuery(query)
        const specimen = new Specimen(
            specs.name,
            specs.visualizerKind,
            specs.sequenceKind,
            specs.visualizerQuery,
            specs.sequenceQuery
        )
        specimen.sequence.validate()
        await specimen.sequence.fill() // may determine sequence limits
        specimen.visualizer.validate()
        return specimen
    }
    /**
     * Extracts the name of the variety of sequence a specimen is showing
     * from its query string encoding
     * @param {string} query  The URL query string encoding a specimen
     * @return {string} the name of the sequence variety the specimen uses
     */
    static getSequenceNameFromQuery(query: string): string {
        const specs = parseSpecimenQuery(query)
        const sequence = Specimen.makeSequence(
            specs.sequenceKind,
            specs.sequenceQuery
        )
        sequence.validate()
        return sequence.name
    }
}
