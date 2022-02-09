import {ValidationStatus} from '@/shared/ValidationStatus'
import {
    SequenceParamsSchema,
    SequenceExportModule,
    SequenceExportKind,
} from './SequenceInterface'
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
    params = [
        new SequenceParamsSchema(
            'constantValue',
            'number',
            'Constant Value',
            true,
            '0'
        ),
    ]
    first = 0
    last = Infinity
    value = -1n

    constructor(sequenceID: number) {
        super(sequenceID)
    }

    validate(): ValidationStatus {
        this.settings['name'] = 'Constant'
        const superStatus = super.validate()
        if (!superStatus.isValid) {
            return superStatus
        }

        if (this.settings['constantValue'] !== undefined) {
            this.isValid = true
            this.value = BigInt(this.settings['constantValue'])
            this.name = 'Constant = ' + this.settings['constantValue']
            return new ValidationStatus(true)
        }

        this.isValid = false
        return new ValidationStatus(false, [
            'No constant value was provided.',
        ])
    }

    getElement(n: number) {
        if (n < 0) {
            throw RangeError('SequenceConstant requires nonnegative index.')
        }
        return this.value
    }
}

export const exportModule = new SequenceExportModule(
    SequenceConstant,
    'Constant Sequence',
    SequenceExportKind.FAMILY
)
