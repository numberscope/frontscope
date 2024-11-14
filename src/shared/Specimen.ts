import {math} from './math'
import {specimenQuery, parseSpecimenQuery} from './specimenEncoding'

import type {SequenceInterface} from '@/sequences/SequenceInterface'
import {produceSequence} from '@/sequences/sequences'
import {nullSize, sameSize} from '@/visualizers/VisualizerInterface'
import type {
    VisualizerInterface,
    ViewSize,
} from '@/visualizers/VisualizerInterface'
import vizMODULES from '@/visualizers/visualizers'

/**
 * This class represents a "specimen,"  which is a container for a sequence
 * and a visualizer that is viewing it, along with information about whether
 * and where the resulting visualization is being displayed and some other
 * setup data such as the random seed that was set when the specimen was
 * created. You can load a specification of a sequence and a visualizer into
 * the specimen, interact with and possibly modify the sequence and/or
 * visualizer, insert it into an HTML element for display (via the `setup()`
 * method), and obtain the string specifying the current sequence and
 * visualizer in the specimen.
 *
 * Currently, these specifications are in the form of reasonably
 * human-readable URL query strings (some special characters have to be
 * %-encoded).
 */
export class Specimen {
    name: string
    private randomSeed?: string | null
    private _visualizerKey = ''
    private _sequenceKey = ''
    private _visualizer?: VisualizerInterface
    private _sequence?: SequenceInterface
    private location?: HTMLElement
    private isSetup = false
    private size = nullSize

    /**
     * Constructs an empty specimen. If you supply both a seqKey
     * and a vizKey, it makes the specimen have those sorts of
     * sequence and visualizer, but it will still be a sort of
     * "dummy" specimen, not really able to operate, until
     * loadQuery() is called.
     */
    constructor(seqKey?: string, vizKey?: string) {
        this.name = '*Uninitialized Specimen*'
        if (seqKey && vizKey) {
            this._sequenceKey = seqKey
            this._sequence = Specimen.makeSequence(seqKey)
            this._visualizerKey = vizKey
            this._visualizer = new vizMODULES[vizKey].visualizer(
                this._sequence
            )
        }
    }

    /**
     * Loads new contents specified by a URL query string.
     * Gracefully wraps up any prior visualization in this specimen.
     * @param {string} query  query string encoding the visualizer
     * @return {Specimen} this specimen
     */
    async loadQuery(query: string) {
        // Do we need to destroy the current visualization and create anew?
        let reload = false

        // First deal with the random seed as that potentially affects
        // everything:
        const specs = parseSpecimenQuery(query)
        const newRandomSeed = specs.seed ?? null
        if (newRandomSeed != this.randomSeed) {
            this.randomSeed = newRandomSeed
            math.config({randomSeed: newRandomSeed})
            reload = true
        }

        // Check if the visualizer changed:
        if (
            specs.visualizerKind !== this._visualizerKey
            || specs.visualizerQuery !== this.visualizer?.query
        ) {
            reload = true
        }
        // If the visualizer kind and parameters match and we have not
        // changed the random seed, it should be OK to proceed with the
        // existing visualizer.

        // Load the specs into the specimen:
        this.name = specs.name

        let sequenceChanged = false
        if (
            specs.sequenceKind !== this._sequenceKey
            || specs.sequenceQuery !== this.sequence?.query
        ) {
            sequenceChanged = true
            this._sequenceKey = specs.sequenceKind
            this._sequence = Specimen.makeSequence(
                this._sequenceKey,
                specs.sequenceQuery
            )
        }

        if (reload) {
            const displayed = this.isSetup
            if (displayed) this.visualizer?.depart(this.location!)

            this._visualizerKey = specs.visualizerKind

            this._visualizer = new vizMODULES[this._visualizerKey].visualizer(
                this._sequence!
            )
            if (specs.visualizerQuery) {
                this._visualizer.loadQuery(specs.visualizerQuery)
            }
            await this._sequence?.fill() // maybe needed to get index range
            this._visualizer.validate()
            this._visualizer.stop(specs.frames)

            if (displayed) this.setup(this.location!)
        } else if (sequenceChanged) {
            this._visualizer?.view(this._sequence!)
        }
        return this
    }

    // Helper for loadQuery and for extracting sequence name
    static makeSequence(key: string, query?: string) {
        const sequence = produceSequence(key)
        if (query) sequence.loadQuery(query)
        sequence.validate()
        sequence.initialize()
        return sequence
    }

    /**
     * Displays a specimen within an HTML element
     * @param {HTMLElement} location  where in the DOM to insert the specimen
     */
    async setup(location: HTMLElement) {
        if (!this._sequence || !this._visualizer) {
            throw new Error('Attempt to display uninitialized Specimen.')
        }

        this.location = location
        this.isSetup = true
        this.reset()
    }

    /**
     * Hard resets the specimen
     */
    async reset() {
        if (!this.isSetup) return
        this.size = this.calculateSize(
            {
                width: this.location?.clientWidth ?? 0,
                height: this.location?.clientHeight ?? 0,
            },
            this._visualizer?.requestedAspectRatio()
        )
        await this._visualizer?.inhabit(this.location!, this.size)
        this._visualizer?.show()
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
            this._visualizer?.query,
            this._sequence?.query
        )
    }

    /**
     * Returns the specimen's visualizer key
     * @returns {string} what kind of visualizer the specimen uses
     */
    get visualizerKey() {
        return this._visualizerKey
    }

    /** Returns the specimen's sequence key
     * @returns {string} what kind of sequence the visualizer displays
     */
    get sequenceKey() {
        return this._sequenceKey
    }

    /**
     * Returns the specimen's visualizer
     * @returns {VisualizerInterface} the visualizer displaying this specimen
     */
    get visualizer(): VisualizerInterface {
        if (!this._visualizer) {
            throw new Error('Attempt to get visualizer of empty specimen')
        }
        return this._visualizer
    }
    /**
     * Returns the specimen's sequence
     * @returns {SequenceInterface} the sequence shown in this specimen
     */
    get sequence(): SequenceInterface {
        if (!this._sequence) {
            throw new Error('Attempt to get sequence of empty specimen')
        }
        return this._sequence
    }

    /**
     * Ensures that the visualizer is aware that the sequence has been
     * updated.
     */
    updateSequence() {
        return this._visualizer?.view(this._sequence!)
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
            this._visualizer?.requestedAspectRatio()
        )
        if (sameSize(this.size, newSize)) return
        this.size = newSize
        // Reset the visualizer if the resized function isn't implemented
        // or returns false, meaning it didn't handle the redisplay
        let handled = false
        if (this._visualizer?.resized) {
            handled = await this._visualizer.resized(this.size)
        }
        if (!handled) this.reset()
    }

    /**
     * Generates a specimen from a URL query string (as produced by the
     * query getter of a Specimen instance).
     * @param {string} query  the URL query string encoding of a specimen
     * @return {Specimen} the corresponding specimen
     */
    static async fromQuery(query: string) {
        const result = new Specimen()
        return result.loadQuery(query)
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
        return sequence.name
    }
}
