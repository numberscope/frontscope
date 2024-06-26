import {SequenceExportModule} from './SequenceInterface'
import {SequenceDefault} from './SequenceDefault'
import {ParamType} from '../shared/ParamType'

const paramDesc = {
    constant: {
        default: 0n,
        type: ParamType.BIGINT,
        displayName: 'Constant Value',
        required: true,
    },
} as const

/**
 *
 * @class Constant
 * Extends the sequenceClassDefault, by changing the parameter schema
 * and reimplementing the getElement function.
 */
class Constant extends SequenceDefault<typeof paramDesc> {
    name = 'Constant Sequence'
    description = 'A sequence with the same value for all nonnegative indices'
    constant = paramDesc.constant.default
    first = 0
    last = Infinity

    constructor(sequenceID: number) {
        super(paramDesc, sequenceID)
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

export const exportModule = SequenceExportModule.family(Constant)
