import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
import {SequenceExportKind} from '../sequences/SequenceInterface'
import {
    SequenceExportModule,
    type SequenceConstructor,
    type SequenceInterface,
} from '../sequences/SequenceInterface'
import type {GenericParamDescription} from './Paramable'
import {toBase64, loadFromBase64} from './Paramable'
import seqMODULES from '../sequences/sequences'
import vizMODULES from '../visualizers/visualizers'
import OEISSequence from '@/sequences/OEIS'

/**
 * Loads a sequence from a given export module key, accounting for its kind
 * and making sure to load it if it is an unloaded OEIS sequence
 */
function loadSequenceFromExportModule(sequenceKey: string) {
    type SeqIntf = SequenceInterface<GenericParamDescription>
    // Load OEIS sequence if it is not already
    // OEIS sequence keys start with '.'
    if (sequenceKey.startsWith('.') && !(sequenceKey in seqMODULES))
        seqMODULES[sequenceKey] = SequenceExportModule.instance(
            OEISSequence.fromSequenceExportKey(sequenceKey)
        )

    if (seqMODULES[sequenceKey].kind === SequenceExportKind.FAMILY)
        return new (seqMODULES[sequenceKey]
            .sequenceOrConstructor as SequenceConstructor)(0)
    else return seqMODULES[sequenceKey].sequenceOrConstructor as SeqIntf
}

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
    private size: {width: number; height: number}

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
        this._sequence = loadSequenceFromExportModule(sequenceKey)
        this._visualizer = new vizMODULES[visualizerKey].visualizer(
            this._sequence
        )
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

        this.sequence.initialize()
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
        this._visualizer.depart(this.location!)
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
        this._sequence = loadSequenceFromExportModule(sequenceKey)
        this._sequence.initialize()
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
        const data = {
            name: this.name,
            sequence: this.sequenceKey,
            sequenceParams: toBase64(this.sequence),
            visualizer: this.visualizerKey,
            visualizerParams: toBase64(this.visualizer),
        }

        return btoa(JSON.stringify(data))
    }
    /**
     * Parses a url into an object that a specimen can be built from
     * @param url the specimen URL to parse
     * @return an object for building a specimen
     */
    private static parseURL(url: string): {[key: string]: string} {
        const data = JSON.parse(atob(url)) as {[key: string]: string}

        // Make sure URL is valid
        if (
            !Object.prototype.hasOwnProperty.call(data, 'name')
            || !Object.prototype.hasOwnProperty.call(data, 'sequence')
            || !Object.prototype.hasOwnProperty.call(data, 'sequenceParams')
            || !Object.prototype.hasOwnProperty.call(data, 'visualizer')
            || !Object.prototype.hasOwnProperty.call(data, 'visualizerParams')
        )
            throw new Error('Invalid URL')
        return data
    }
    /**
     * Reads a specimen URL previously generated by toURL() and parses
     * it back into a Specimen object.
     * @param _url the specimen URL to parse
     * @return the corresponding specimen object
     */
    static fromURL(url: string): Specimen {
        const data = this.parseURL(url)

        // Load visualizer and sequence from names
        const specimen = new Specimen(
            `${data['name']}`,
            `${data['visualizer']}`,
            `${data['sequence']}`
        )

        // Assign parameters to the visualizers and sequences
        loadFromBase64(`${data['sequenceParams']}`, specimen.sequence)
        loadFromBase64(`${data['visualizerParams']}`, specimen.visualizer)

        return specimen
    }
    /**
     * Reads a specimen URL and returns the name of the specimen
     * @param url the specimen URL to parse
     * @return the name of the specimen
     */
    static getNameFromURL(url: string): string {
        return this.parseURL(url)['name']
    }

    /**
     * Reads a specimen URL and returns the sequence name
     * @param url the specimen URL to parse
     * @return the name of the sequence the specimen uses
     */
    static getSequenceNameFromURL(url: string): string {
        return seqMODULES[this.parseURL(url)['sequence']].name
    }
}
