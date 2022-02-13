import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceClassDefault} from './SequenceClassDefault'

/**
 *
 * @class SequenceConstant
 * Extends the sequenceClassDefault, by changing the parameter schema
 * and reimplementing the getElement function.
 */
class SequenceConstant extends SequenceClassDefault {
    name = 'Constant Sequence'
    description = 'A sequence with the same value for all nonnegative indices'
    constant = {value: 0n, displayName: 'Constant Value', required: true}
    params = {constant: this.constant}
    first = 0
    last = Infinity

    constructor(sequenceID: number) {
        super(sequenceID)
    }

    initialize() {
        super.initialize()
        this.name = 'Constant = ' + this.constant.value.toString()
    }

    getElement(n: number) {
        if (n < 0) {
            throw RangeError('SequenceConstant requires nonnegative index.')
        }
        return this.constant.value
    }
}

export const exportModule = new SequenceExportModule(
    SequenceConstant,
    'Constant Sequence',
    SequenceExportKind.FAMILY
)
