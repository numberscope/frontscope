import {
    specimenQuery,
    vizKey,
    seqKey,
    vizQueryKey,
    seqQueryKey,
} from './browserCaching'
import type {GenericParamDescription} from './Paramable'

import {SequenceExportKind} from '../sequences/SequenceInterface'
import type {
    SequenceConstructor,
    SequenceInterface,
} from '../sequences/SequenceInterface'
import seqMODULES from '../sequences/sequences'

import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
import vizMODULES from '../visualizers/visualizers'

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
    private size: {width: number; height: number}

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
        this.size = {width: 0, height: 0}
        if (vizQuery) this._visualizer.loadQuery(vizQuery)
    }

    // Helper for constructor and for extracting sequence name
    static makeSequence(sequenceKey: string, seqQuery?: string) {
        type SeqIntf = SequenceInterface<GenericParamDescription>
        if (seqMODULES[sequenceKey].kind === SequenceExportKind.FAMILY) {
            const sequence = new (seqMODULES[sequenceKey]
                .sequenceOrConstructor as SequenceConstructor)(0)
            if (seqQuery) sequence.loadQuery(seqQuery)
            return sequence
        }
        const sequence = seqMODULES[sequenceKey]
            .sequenceOrConstructor as SeqIntf
        if (seqQuery) sequence.loadQuery(seqQuery)
        return sequence
    }
    /**
     * Call this as soon after construction as possible once the HTML
     * element has been mounted
     * @param {HTMLElement} location  where in the DOM to insert the specimen
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

        if (this.isSetup) this.visualizer.depart(this.location)
        this.visualizer.inhabit(this.location, this.size)
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
        type SeqIntf = SequenceInterface<GenericParamDescription>
        if (seqMODULES[sequenceKey].kind === SequenceExportKind.FAMILY)
            this._sequence = new (seqMODULES[sequenceKey]
                .sequenceOrConstructor as SequenceConstructor)(0)
        else
            this._sequence = seqMODULES[sequenceKey]
                .sequenceOrConstructor as SeqIntf
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
     * @param {number} containerWidth  width of the container
     * @param {number} containerHeight  height of the container
     * @param {number?} aspectRatio  aspect ratio requested by visualizer
     * @returns {{width: number, height: number}} resulting size of visualizer
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
     * @param {number} width  New width of the visualizer container
     * @param {number} height  New height of the visualizer container
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
     * Generates a specimen from a URL query string (as produced by the
     * query getter of a Specimen instance).
     * @param {string} query  the URL query string encoding of a specimen
     * @return {Specimen} the corresponding specimen
     */
    static fromQuery(query: string): Specimen {
        const params = new URLSearchParams(query)
        const specimen = new Specimen(
            params.get('name') || 'Error: Unknown Name',
            params.get(vizKey) || 'Error: No visualizer kind specified',
            params.get(seqKey) || 'Error: No sequence kind specified',
            params.get(vizQueryKey) || undefined,
            params.get(seqQueryKey) || undefined
        )
        specimen.sequence.validate()
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
        const params = new URLSearchParams(query)
        if (!params.has(seqKey))
            return `Error: ${seqKey} not specified in query`
        const sequence = Specimen.makeSequence(
            params.get(seqKey) || 'This cannot actually happen',
            params.get(seqQueryKey) || undefined
        )
        sequence.validate()
        return sequence.name
    }
}
