import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {Cached} from './Cached'
import simpleFactor from './simpleFactor'
import {ParamType} from '../shared/ParamType'

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
            type: ParamType.INTEGER,
            displayName: 'Minimum value attainable',
            required: true,
        },
        max: {
            value: this.max,
            type: ParamType.INTEGER,
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

    checkParameters(params: {[key: string]: unknown}) {
        const status = super.checkParameters(params)

        if ((params.max as number) < (params.min as number))
            status.addError('The max value cannot be less than the min.')

        return status
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
