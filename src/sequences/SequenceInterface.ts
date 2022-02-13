import {ValidationStatus} from '@/shared/ValidationStatus'
import {ParamInterface} from '@/shared/ParamType'
/**
 * Interface for Sequence classes.
 * Every sequence class must implement these properties and functions
 * to be compatible with Numberscope.
 */
export interface SequenceInterface {
    sequenceID: number
    name: string
    description: string
    /**
     * params determines the parameters that will be settable via the
     * user interface. The value of each key should be a property of the
     * sequence implementation. The value of each of these properties
     * should be an object (so that it can be passed by reference to the UI
     * for setting); the keys of each such object should be as described
     * in the ParamInterface source.
     */
    params: {[key: string]: ParamInterface}
    /**
     * first gives the lower limit for valid indices into the Sequence.
     * In other words, an integer number n is a valid index only if
     * first <= n. The typical value is 0, but any finite (positive or
     * negative) integer value is allowed.
     */
    readonly first: number
    /**
     * last is the counterpart to first, giving the upper limit for valid
     * indices into the Sequence. An integer number n is a valid index
     * if and only if first <= n <= last. Hence, if last is less than first,
     * the sequence is empty; if last is (the Javascript number) Infinity,
     * all indices not less than first are valid.
     */
    readonly last: number

    /**
     * validate is called as soon as the user has set the values of the
     * parameters. It should check that all of the parameters are sensible
     * (properly formatted, in range, etc)
     * @returns {ValidationStatus}
     *     whether the validation succeeded, along with any messages if not
     */
    validate(): ValidationStatus

    /**
     * Initialize is called after validation. It allows us to wait
     * until all the parameters are appropriate before we actually
     * set up the sequence for computation.
     */
    initialize(): void

    /**
     * getElement is what clients of SequenceInterface call to get
     * the actual entries in the sequence. It retrieves the nth element
     * of the sequence, so long as n is an integer between
     * the SequenceInterface.first and .last indices, inclusive.
     * @param {*} n the index of the element in the sequence we want
     * @returns a number
     * @memberof SequenceGenerator
     */
    getElement(n: number): bigint
}

export interface SequenceConstructor {
    new (sequenceID: number): SequenceInterface
}

/**
 *
 * @enum SequenceExportKind
 * A collection of constant values to select among different kinds of
 * buttons that can appear in the SequenceMenu. Each SequenceExportModule
 * corresponds to such a button and must have one of these kinds.
 *
 */
export enum SequenceExportKind {
    GETTER, // Produces new INSTANCES for the SequenceMenu; always
    // listed at the bottom of the SequenceMenu
    FAMILY, // A single entry in the SequenceMenu that needs parameters
    // whenever used
    INSTANCE, // A single sequence in the SequenceMenu, added by a FACTORY
}
/**
 *
 * @class SequenceExportModule
 * A lightweight container for an entry in the list of sequences in the
 * menu on the main tool. If the kind is GETTER or FAMILY it holds a
 * sequence constructor and if it is an INSTANCE then it holds one
 * specific sequence.
 *
 * The difference between a GETTER and a FAMILY is that the former creates
 * a new INSTANCE selector in the menu, whereas the former starts out in the
 * menu and you fill out the parameters each time you use it.
 *
 */
export class SequenceExportModule {
    constructorOrSequence: SequenceConstructor | SequenceInterface
    name: string
    kind: SequenceExportKind

    constructor(
        sequence: SequenceConstructor | SequenceInterface,
        name: string,
        kind: SequenceExportKind
    ) {
        this.constructorOrSequence = sequence
        this.name = name
        this.kind = kind
    }
}
