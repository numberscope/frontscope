import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
import {SequenceExportKind} from '../sequences/SequenceInterface'
import type {
    SequenceConstructor,
    SequenceInterface,
} from '../sequences/SequenceInterface'
import type {GenericParamDescription} from './Paramable'
import seqMODULES from '../sequences/sequences'
import vizMODULES from '../visualizers/visualizers'

/**
 * This class represents a specimen, containing a visualizer,
 * a sequence, and the set of all parameters that make both of them up.
 * Specimens can be converted to and from URLs so that they can be saved.
 */
export class Specimen {
    private _name: string
    private _visualizerKey: string
    private _sequenceKey: string
    private _visualizer: VisualizerInterface<GenericParamDescription>
    private _sequence: SequenceInterface<GenericParamDescription>
    private location?: HTMLElement
    private isSetup: boolean = false

    /**
     * Constructs a new specimen from a visualizer and a sequence.
     * The string arguments passed in are expected to be keys
     * for the visualizer/sequences' export modules.
     * @param name the name of this specimen
     * @param visualizer the specimen's visualizer
     * @param sequence the specimen's sequence
     */
    constructor(name: string, visualizerKey: string, sequenceKey: string) {
        this._name = name
        this._visualizerKey = visualizerKey
        this._sequenceKey = sequenceKey
        type SeqIntf = SequenceInterface<GenericParamDescription>
        if (seqMODULES[sequenceKey].kind === SequenceExportKind.FAMILY)
            this._sequence = new (seqMODULES[sequenceKey]
                .sequenceOrConstructor as SequenceConstructor)(0)
        else
            this._sequence = seqMODULES[sequenceKey]
                .sequenceOrConstructor as SeqIntf
        this._visualizer = new vizMODULES[visualizerKey].visualizer(
            this._sequence
        )
    }
    /**
     * Call this as soon after construction as possible once the HTML
     * element has been mounted
     */
    setup(location: HTMLElement) {
        this.location = location
        this._visualizer.view(this._sequence)
        this._visualizer.inhabit(this.location)
        this._visualizer.show()
        this.isSetup = true
    }
    /**
     * Returns the name of this specimen
     */
    get name(): string {
        return this._name
    }
    /**
     * Returns the key of the specimen's visualizer
     */
    get visualizerKey(): string {
        return this._visualizerKey
    }
    /**
     * Returns the key of the specimen's sequence
     */
    get sequenceKey(): string {
        return this._sequenceKey
    }
    /**
     * Returns the specimen's visualizer
     */
    get visualizer(): VisualizerInterface<GenericParamDescription> {
        return this._visualizer
    }
    /**
     * Returns the specimen's sequence
     */
    get sequence(): SequenceInterface<GenericParamDescription> {
        return this._sequence
    }
    /**
     * Assigns a new name to this specimen
     */
    set name(name: string) {
        this._name = name
    }
    /**
     * Assigns a new visualizer to this specimen and updates its sequence
     * to match the specimen. It also ensures this visualizer inhabits
     * the correct HTML element and begins to render.
     * @param visualizerKey the key of the desired visualizer's export module
     */
    set visualizerKey(visualizerKey: string) {
        this._visualizerKey = visualizerKey
        this._visualizer = new vizMODULES[visualizerKey].visualizer(
            this._sequence
        )
        if (this.isSetup) this.setup(this.location!)
    }
    /**
     * Assigns a new sequence to this specimen and updates the visualizer
     * to reflect this change in the render.
     * @param specimenKey the key of the desired sequence's export module
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
     * Exists for redundancy, same as set visualizerKey()
     */
    set visualizer(visualizerKey: string) {
        this.visualizerKey = visualizerKey
    }
    /**
     * Exists for redundancy, same as set sequenceKey()
     */
    set sequence(sequenceKey: string) {
        this.sequenceKey = sequenceKey
    }
    /**
     * Ensures that the visualizer is aware that the sequence has been
     * updated.
     */
    updateSequence() {
        this.visualizer.view(this.sequence)
    }
    /**
     * Converts the specimen to a URL as a way of saving all information
     * about the specimen.
     * @return the specimen URL as a string
     */
    toURL(): string {
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
     * Reads a specimen URL previously generated by toURL() and parses
     * it back into a `Specimen` object.
     * @param _url the specimen URL to parse
     * @return the corresponding specimen object
     */
    static fromURL(url: string): Specimen {
        const data = JSON.parse(window.atob(url)) as {[key: string]: string}

        // Make sure URL is valid
        if (
            !Object.prototype.hasOwnProperty.call(data, 'name')
            || !Object.prototype.hasOwnProperty.call(data, 'sequence')
            || !Object.prototype.hasOwnProperty.call(data, 'sequenceParams')
            || !Object.prototype.hasOwnProperty.call(data, 'visualizer')
            || !Object.prototype.hasOwnProperty.call(data, 'visualizerParams')
        )
            throw new Error('Invalid URL')

        // Load visualizer and sequence from names
        const specimen = new Specimen(
            `${data['name']}`,
            `${data['visualizer']}`,
            `${data['sequence']}`
        )

        // Assign parameters to the visualizers and sequences
        specimen.sequence.loadFromBase64(`${data['sequenceParams']}`)
        specimen.visualizer.loadFromBase64(`${data['visualizerParams']}`)

        return specimen
    }
}
