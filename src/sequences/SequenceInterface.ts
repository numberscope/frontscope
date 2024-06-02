import type {ParamableInterface} from '../shared/Paramable'
/**
 * Interface for Sequence classes.
 * Every sequence class must implement these properties and functions
 * to be compatible with Numberscope.
 */
export type Factorization = [bigint, bigint][] | null

export interface SequenceInterface extends ParamableInterface {
    sequenceID: number

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

    /**
     * getFactors is what clients of SequenceInterface call to get the factors
     * of an entry in the sequence. It retrieves the factors of the nth element
     * of the sequence, so long as n is an integer between the
     * SequenceInterface.first and .last indices, inclusive.
     * Note that the return is either null (which means that the implementation
     * was unable to factor the entry) or an array of pairs of BigInts
     * (prime, power), with the following special cases:
     *   * If the entry is negative, (-1, 1) is included among the factors.
     *   * If the entry is one, the array of factors is empty.
     *   * If the entry is zero, the array of factors is [(0,1)]
     * @param {number} n the index of the element in the sequence we want
     * @returns {Array<[bigint, bigint]>? factorization
     */
    getFactors(n: number): Factorization
}

export interface SequenceConstructor {
    /**
     * Constructs a sequence.
     * @param sequenceID the ID of the sequence
     */
    new (sequenceID: number): SequenceInterface
    /**
     * The prototype of the sequence, used to extract name and description
     * fields.
     */
    prototype: SequenceInterface
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
    FAMILY, // A single entry in the SequenceMenu that needs parameters
    // whenever used
    INSTANCE, // A single sequence in the SequenceMenu, generally imported
    // by OEIS
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
    sequenceOrConstructor: SequenceConstructor | SequenceInterface
    name: string
    description: string
    kind: SequenceExportKind

    private constructor(
        sequenceOrConstructor: SequenceConstructor | SequenceInterface,
        name: string,
        description: string,
        kind: SequenceExportKind
    ) {
        this.sequenceOrConstructor = sequenceOrConstructor
        this.name = name
        this.description = description
        this.kind = kind
    }

    /**
     * Constructs a `SequenceExportModule` representing a family of sequences
     * constructed and tweaked using parameters.
     * @param constructor the constructor for the family of sequences
     * @return an appropriate sequence export module
     */
    static family(constructor: SequenceConstructor): SequenceExportModule {
        return new SequenceExportModule(
            constructor,
            constructor.prototype.name,
            constructor.prototype.description,
            SequenceExportKind.FAMILY
        )
    }

    /**
     * Constructs a `SequenceExportModule` representing a specific live
     * sequence.
     * @param sequence the live sequence
     * @return an appropriate sequence export module
     */
    static instance(sequence: SequenceInterface): SequenceExportModule {
        return new SequenceExportModule(
            sequence,
            sequence.name,
            sequence.description,
            SequenceExportKind.INSTANCE
        )
    }
}
