import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'

/**
 *
 * @class SequenceClassNaturals
 * extends SequenceCached with a very simple calculate, mostly by way of an
 * example of using SequenceCached.
 */
class SequenceNaturals extends SequenceCached {
    name = 'Natural Numbers'
    description = 'A sequence of the natural numbers'
    includeZero = false
    params = {
        includeZero: {
            value: this.includeZero,
            displayName: 'Include Zero',
            required: false,
        },
    }
    private begin = 1

    /**
     *Creates an instance of SequenceNaturals
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
    }

    initialize() {
        if (this.ready) return
        if (this.includeZero) {
            this.name = 'Nonnegative Integers'
            this.begin = 0
        } else {
            this.name = 'Positive Integers'
        }
        super.initialize()
    }

    calculate(n: number) {
        return BigInt(n + this.begin)
    }
}

export const exportModule = new SequenceExportModule(
    SequenceNaturals,
    'Natural Numbers',
    SequenceExportKind.FAMILY
)
