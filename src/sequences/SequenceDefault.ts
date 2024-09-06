import type {Factorization, SequenceInterface} from './SequenceInterface'
import {Paramable, type GenericParamDescription} from '../shared/Paramable'

/**
 *
 * @class SequenceDefault
 * a minimium working example of a sequence class that implements the interface
 * Primarily intended to be used as a base class for your own sequences.
 *
 */
export class SequenceDefault extends Paramable implements SequenceInterface {
    name = 'An uninitialized generic sequence'
    first = 0
    last = 0
    ready: boolean

    constructor(params: GenericParamDescription) {
        super(params)
        this.ready = false
        this.isValid = false
    }

    /**
     * initialize() provides an opportunity to do quick pre-computation
     * before any elements are requested; for a generic sequence there
     * is not necessarily any way to do this.
     */
    initialize(): void {
        if (this.ready) return
        if (
            this.first < Number.MIN_SAFE_INTEGER
            || this.first > Number.MAX_SAFE_INTEGER
        ) {
            throw Error('Sequence first index must be a safe integer')
        }
        if (this.isValid) {
            this.ready = true
            return
        }
        throw Error('Sequence invalid. Run validate and address any errors.')
    }

    /**
     * fill() provides an opportunity to do lengthier asynchronous
     * pre-computation before any elements are requested; it should not
     * be necessary to call this to get correct values from the sequence,
     * but calling it should ensure future requests for elements/factors
     * return rapidly.
     * @param {number?} n  what index to fill up to, defaults to one cache block
     * @param {string?} what
     *     specifies what data to to fill; currently values are always filled,
     *     and one may also get factors by specifying 'factors'
     */
    async fill(_n?: number, _what?: string) {
        return
    }

    /**
     * getElement is how sequences provide their callers with elements.
     * This default implementation produces the not-very-useful sequence with
     * one element, 0, at index 0.
     * @param n the sequence number to get
     */
    getElement(n: number): bigint {
        if (n !== 0) {
            throw RangeError(`SequenceClassDefault: Index ${n} != 0 invalid`)
        }
        return 0n
    }

    /**
     * getFactors is how sequences provide their callers with the
     * factorizations of elements. This default implementation declines to
     * factor anything.
     * @param {number} n the index of the entry to get the factors of
     */
    getFactors(_n: number): Factorization {
        return null
    }
}

/* For a Sequence implementation to appear as an option in the main tool,
 * it needs a SequenceExportModule defined along with its class. Since
 * this default implementation is not intended for actual use, there is
 * not one here.
 */
