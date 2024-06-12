import {SequenceExportModule} from './SequenceInterface'
import {Cached} from './Cached'
import simpleFactor from './simpleFactor'
import {ParamType} from '../shared/ParamType'
import type {ParamValues} from '@/shared/Paramable'

const paramDesc = {
    min: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Minimum value attainable',
        required: true,
    },
    max: {
        default: 9,
        type: ParamType.INTEGER,
        displayName: 'Maximum value attainable',
        required: true,
    },
} as const

/**
 *
 * @class SequenceClassRandom
 * Creates a sequence of random integers in a specified range.
 * Starts at index 0 and has no limit.
 */
class Random extends Cached(paramDesc) {
    name = 'Random Integers in Range'
    description =
        'A sequence of integers chosen independently uniformly '
        + 'from n to m inclusive.'

    /**
     *Creates an instance of Random
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.max < params.min)
            status.addError('The max value cannot be less than the min.')

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

export const exportModule = SequenceExportModule.family(Random)
