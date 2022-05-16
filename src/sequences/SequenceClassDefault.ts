import {SequenceInterface} from './SequenceInterface'
import {Paramable} from '../shared/Paramable'

/**
 *
 * @class SequenceClassDefault
 * a minimium working example of a sequence class that implements the interface
 * Primarily intended to be used as a base class for your own sequences.
 *
 */
export class SequenceClassDefault
    extends Paramable
    implements SequenceInterface
{
    sequenceID: number
    name = 'Base'
    description = 'A Base sequence class'
    first = 0
    last = 0
    ready: boolean

    constructor(sequenceID: number) {
        super()
        this.sequenceID = sequenceID
        this.ready = false
        this.isValid = false
    }

    /**
     * initialize() provides an opportunity to do pre-computation
     * before any elements are requested; for a generic sequence there
     * is not necessarily any way to do this.
     */
    initialize(): void {
        if (this.ready) return
        if (
            // prettier-ignore
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
}

/* For a Sequence implementation to appear as an option in the main tool,
 * it needs a SequenceExportModule defined along with its class. Since
 * this default implementation is not intended for actual use, there is
 * not one here.
 */
