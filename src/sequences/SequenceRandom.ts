import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'

/**
 *
 * @class SequenceClassRandom
 * Creates a sequence of random integers in a specified range.
 * Starts at index 0 and has no limit.
 */
class SequenceRandom extends SequenceCached {
    name = 'Random Integers in Range'
    description =
        'A sequence of integers chosen indepenently uniformly '
        + 'from n to m inclusive.'
    min = 0
    max = 9
    params = {
        min: {
            value: this.min,
            displayName: 'Minimum value attainable',
            required: true,
        },
        max: {
            value: this.max,
            displayName: 'Maximum value attainable',
            required: true,
        },
    }

    /**
     *Creates an instance of SequenceRandom
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
    }

    checkParameters() {
        const status = super.checkParameters()

        if (!Number.isInteger(this.params.min.value)) {
            status.errors.push('The min value must be an integer.')
        }
        if (!Number.isInteger(this.params.max.value)) {
            status.errors.push('The max value must be an integer.')
        }
        if (this.params.max.value < this.params.min.value) {
            status.errors.push('The max value cannot be less than the min.')
        }

        if (status.errors.length > 0) status.isValid = false
        return status
    }

    initialize() {
        super.initialize()
        this.name = `Random integers ${this.min} to ${this.max}`
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    calculate(n: number) {
        // create a random integer between min and max inclusive
        return BigInt(
            Math.floor(Math.random() * (this.max - this.min + 1) + this.min)
        )
    }
}

export const exportModule = new SequenceExportModule(
    SequenceRandom,
    'Random Integers in Range',
    SequenceExportKind.FAMILY
)
