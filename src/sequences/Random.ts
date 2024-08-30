import {SequenceExportModule} from './SequenceInterface'
import {Cached} from './Cached'
import simpleFactor from './simpleFactor'

import {math} from '@/shared/math'
import {ParamType} from '@/shared/ParamType'
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
 * @class Random
 * Creates a sequence of random integers in a specified range.
 * Starts at index 0 and has no limit.
 *
 * Note that unlike most sequence classes, this one is also exported
 * directly, not just through the exportModule. That is for purposes
 * of testing the caching infrastructure, see ./__tests__/Cached.spec.ts.
 */
export class Random extends Cached(paramDesc) {
    name = 'uninitialized random integers'
    static category = 'Random Integers'
    static description =
        'A sequence of integers chosen independently and '
        + 'uniformly from a finite interval'

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
        return BigInt(math.randomInt(this.min, this.max + 1))
    }

    factor(_n: number, v: bigint) {
        return simpleFactor(v)
    }
}

export const exportModule = SequenceExportModule.family(Random)
