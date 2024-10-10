import type {ExtendedBigint} from '@/shared/math'
import type {ParamableInterface} from '@/shared/Paramable'
/**
 * Interface for Sequence classes.
 * Every sequence class must implement these properties and functions
 * to be compatible with Numberscope.
 */
export type Factorization = [bigint, bigint][] | null

export interface SequenceInterface extends ParamableInterface {
    /**
     * first gives the lower limit for valid indices into the Sequence.
     * In other words, bigint n is a valid index only if
     * first <= n. The typical value is 0, but any positive or negative
     * value is allowed as well.
     */
    readonly first: bigint

    /**
     * last is the counterpart to first, giving the upper limit for valid
     * indices into the Sequence. A bigint n is a valid index
     * if and only if first <= n <= last. Hence, if last is less than first,
     * the sequence is empty; if last is (the Javascript number) Infinity,
     * all indices not less than first are valid.
     */
    readonly last: ExtendedBigint

    /**
     * length is the number of terms in the sequence, or Infinity if the
     * sequence is open-ended. This value can be computed from first and last,
     * but it is needed so often that it is provided for convenience.
     */
    readonly length: ExtendedBigint

    /**
     * Initialize is called after validation. It allows us to wait
     * until all the parameters are appropriate before we actually
     * set up the sequence for computation.
     */
    initialize(): void

    /**
     * Fill provides an opportunity for sequences that need significant
     * time to prepare to return values to perform that preparation
     * asynchronously. It should not be necessary to call, but calling
     * it should ensure that future getElement and getFactors calls
     * return promptly.
     */
    fill(n?: bigint, what?: string): Promise<void>

    /**
     * getElement is what clients of SequenceInterface call to get
     * the actual entries in the sequence. It retrieves the nth element
     * of the sequence, so long as n is an integer between
     * the SequenceInterface.first and .last indices, inclusive.
     * @param {*} n the index of the element in the sequence we want
     * @returns a number
     * @memberof SequenceGenerator
     */
    getElement(n: bigint): bigint

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
    getFactors(n: bigint): Factorization
}

interface SequenceConstructor {
    new (): SequenceInterface
    category: string
    description: string
}

type SequenceFactory = () => SequenceInterface
/**
 *
 * @class SequenceExportModule
 * A lightweight container for an entry in the list of sequences in the
 * menu on the main tool. Records a factory for producing corresponding
 * Sequence objects on demand.
 *
 */
export class SequenceExportModule {
    factory: SequenceFactory
    category: string
    description: string

    constructor(
        factory: SequenceFactory,
        category: string,
        description: string
    ) {
        this.factory = factory
        this.category = category
        this.description = description
    }

    /**
     * Constructs a `SequenceExportModule` representing a family of sequences
     * constructed and tweaked using parameters.
     * @param constructor the constructor for the family of sequences
     * @param name the name of the family of sequences
     * @param description a description of the family of sequences
     * @return an appropriate sequence export module
     */
    static family(
        ctor: SequenceConstructor,
        category?: string,
        description?: string
    ): SequenceExportModule {
        return new SequenceExportModule(
            () => new ctor(),
            category || ctor.category,
            description || ctor.description
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
            () => sequence,
            sequence.name,
            sequence.description
        )
    }
}
