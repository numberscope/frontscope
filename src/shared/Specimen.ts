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

/* Convenience constant to provide fields and types of a decoded URL */
const dummyURLstructure = {
    name: '',
    sequence: '',
    sequenceParams: '',
    visualizer: '',
    visualizerParams: '',
} as const

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
     * @param visualizerKey the specimen's variety of visualizer
     * @param sequenceKey the specimen's variety of sequence
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

        if (hasStringFields(data, dummyURLstructure)) {
            const specimen = new Specimen(
                data.name,
                data.visualizer,
                data.sequence
            )
            // Assign parameters to the visualizers and sequences
            specimen.sequence.loadFromBase64(data.sequenceParams)
            specimen.visualizer.loadFromBase64(data.visualizerParams)

            return specimen
        }
        throw new Error('Invalid URL')
    }
}
