import {hasStringFields} from './fields'
import type {GenericParamDescription} from './Paramable'

import {SequenceExportKind} from '../sequences/SequenceInterface'
import type {
    SequenceConstructor,
    SequenceInterface,
} from '../sequences/SequenceInterface'
import seqMODULES from '../sequences/sequences'

import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
import vizMODULES from '../visualizers/visualizers'

// Convenience constant to provide fields and types needed to specify
// a Specimen
const dummySpecifier = {
    name: '',
    sequence: '',
    sequenceParams: '',
    visualizer: '',
    visualizerParams: '',
} as const
type SpecimenSpecifier = Record<keyof typeof dummySpecifier, string>

/**
 * This class represents a specimen, containing a visualizer,
 * a sequence, and the set of all parameters that make both of them up.
 * Specimens can be converted to and from base64 encodings so that they
 * can be saved.
 */
export class Specimen {
    private _name: string
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
     * Optionally the base64 encodings of the visualizer and sequence
     * parameters can be passed in as well.
     * @param {string} name
     * @param {string} visualizerKey  the specimen's variety of visualizer
     * @param {string} sequenceKey  the specimen's variety of sequence
     * @param {string?} vis64  base64 encoding of visualizer parameters
     * @param {string?} seq64  base64 encoding of sequence parameters
     */
    constructor(
        name: string,
        visualizerKey: string,
        sequenceKey: string,
        vis64?: string,
        seq64?: string
    ) {
        this._name = name
        this._visualizerKey = visualizerKey
        this._sequenceKey = sequenceKey
        this._sequence = Specimen.makeSequence(sequenceKey, seq64)

        this._visualizer = new vizMODULES[visualizerKey].visualizer(
            this._sequence
        )
        this.size = {width: 0, height: 0}
        if (vis64) this._visualizer.loadFromBase64(vis64)
    }

    // Helper for constructor and for extracting sequence name
    static makeSequence(sequenceKey: string, seq64?: string) {
        type SeqIntf = SequenceInterface<GenericParamDescription>
        if (seqMODULES[sequenceKey].kind === SequenceExportKind.FAMILY) {
            const sequence = new (seqMODULES[sequenceKey]
                .sequenceOrConstructor as SequenceConstructor)(0)
            if (seq64) sequence.loadFromBase64(seq64)
            return sequence
        }
        const sequence = seqMODULES[sequenceKey]
            .sequenceOrConstructor as SeqIntf
        if (seq64) sequence.loadFromBase64(seq64)
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
     * Returns the name of this specimen
     * @return {string} name of the specimen
     */
    get name(): string {
        return this._name
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
     * Assigns a new name to this specimen
     * @param {string} name  New name
     */
    set name(name: string) {
        this._name = name
    }
    /**
     * Assigns a new visualizer to this specimen and updates its sequence
     * to match the specimen. It also ensures this visualizer inhabits
     * the correct HTML element and begins to render.
     * @param {string} visualizerKey
     *     the key of the desired visualizer's export module
     */
    set visualizerKey(visualizerKey: string) {
        // TODO: Do we need to check if the previous visualizer is already
        // inhabiting an HTML element and .depart it if so, before it is
        // setup again? Or will garbage collection of the old visualizer take
        // care of that?
        this._visualizerKey = visualizerKey
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
     * Encodes the specimen to a base64 string, recording all information
     * about the specimen.
     * @return {string} A string encoding all information about the specimen
     */
    encode64(): string {
        const data = {
            name: this.name,
            sequence: this.sequenceKey,
            sequenceParams: this.sequence.toBase64(),
            visualizer: this.visualizerKey,
            visualizerParams: this.visualizer.toBase64(),
        }

        return window.btoa(JSON.stringify(data))
    }
    /**
     * Parses a base64 encoding of a specimen into a SpecimenSpecifier object
     * that has all of the string values needed to generate a Specimen. Throws
     * an error if the encoded string cannot be decoded appropriately.
     * @param {string} base64  the encoded string to parse
     * @return {SpecimenSpecifier} data specifying the specimen
     */
    private static parse64(base64: string): SpecimenSpecifier {
        const data = JSON.parse(window.atob(base64)) as {
            [key: string]: string
        }
        if (hasStringFields(data, dummySpecifier)) return data
        throw new Error('Invalid base64 encoding of a Specimen')
    }
    /**
     * Decodes a base 64 encoded string (as produced by encode64()) back
     * into a `Specimen` object. Validates and assigns the resulting
     * parameter values of the sequence and visualizer of the specimen.
     *
     * @param {string} base64  A string produced by encoding a specimen
     * @return {Specimen} the corresponding Specimen
     */
    static decode64(base64: string): Specimen {
        const data = this.parse64(base64)
        const specimen = new Specimen(
            data.name,
            data.visualizer,
            data.sequence,
            data.visualizerParams,
            data.sequenceParams
        )
        specimen.sequence.validate()
        specimen.visualizer.validate()
        return specimen
    }
    /**
     * Extracts the name of a specimen from its base64 string encoding
     * @param {string} base64  A string produced by encoding a specimen
     * @return {string} the name of the specimen
     */
    static getNameFrom64(base64: string): string {
        return this.parse64(base64)['name']
    }

    /**
     * Extracts the name of the variety of sequence a specimen is showing
     * from its base64 string encoding
     * @param {string} base64  A string produced by encoding a specimen
     * @return {string} the name of the sequence variety the specimen uses
     */
    static getSequenceNameFrom64(base64: string): string {
        const data = this.parse64(base64)
        const sequence = Specimen.makeSequence(
            data.sequence,
            data.sequenceParams
        )
        sequence.validate()
        return sequence.name
    }
}
