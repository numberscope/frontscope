import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {Cached} from './Cached'
import simpleFactor from './simpleFactor'

/**
 *
 * @class SequenceClassRandom
 * Creates a sequence of random integers in a specified range.
 * Starts at index 0 and has no limit.
 */
class Random extends Cached {
    name = 'Random Integers in Range'
    description =
        'A sequence of integers chosen independently uniformly '
        + 'from n to m inclusive.'
    min = 0
    max = 9
    params = {
        min: {
            value: this.min,
            forceType: 'integer',
            displayName: 'Minimum value attainable',
            required: true,
        },
        max: {
            value: this.max,
            forceType: 'integer',
            displayName: 'Maximum value attainable',
            required: true,
        },
    }

    /**
     *Creates an instance of Random
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
    }

    checkParameters() {
        const status = super.checkParameters()

        if (this.params.max.value < this.params.min.value) {
            status.isValid = false
            status.errors.push('The max value cannot be less than the min.')
        }

        return status
    }

    initialize() {
        super.initialize()
        this.name = `Random integers ${this.min} to ${this.max}`
    }

    calculate(_n: number) {
        // create a random integer between min and max inclusive
        return BigInt(
            Math.floor(Math.random() * (this.max - this.min + 1) + this.min)
        )
    }

    factor(_n: number, v: bigint) {
        return simpleFactor(v)
    }
}

export const exportModule = new SequenceExportModule(
    Random,
    'Random Integers in Range',
    SequenceExportKind.FAMILY
)
