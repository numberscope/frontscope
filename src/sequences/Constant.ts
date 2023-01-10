import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceDefault} from './SequenceDefault.js'

/**
 *
 * @class Constant
 * Extends the sequenceClassDefault, by changing the parameter schema
 * and reimplementing the getElement function.
 */
class Constant extends SequenceDefault {
    name = 'Constant Sequence'
    description = 'A sequence with the same value for all nonnegative indices'
    constant = 0n
    params = {
        constant: {
            value: this.constant,
            displayName: 'Constant Value',
            required: true,
        },
    }
    first = 0
    last = Infinity

    constructor(sequenceID: number) {
        super(sequenceID)
    }

    initialize() {
        super.initialize()
        this.name = `Constant = ${this.constant}`
    }

    getElement(n: number) {
        if (n < 0) {
            throw RangeError('Constant requires nonnegative index.')
        }
        return this.constant
    }
}

export const exportModule = new SequenceExportModule(
    Constant,
    'Constant Sequence',
    SequenceExportKind.FAMILY
)
