import {SequenceExportModule} from './SequenceInterface'
import {Cached} from './Cached'

import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'

const paramDesc = {
    includeZero: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Include Zero',
        required: false,
    },
} satisfies GenericParamDescription

/**
 *
 * @class Naturals
 * extends Cached with a very simple calculate, mostly by way of an
 * example of using Cached.
 */
class Naturals extends Cached(paramDesc) {
    name = 'uninitialized natural number sequence'
    static category = 'Natural Numbers'
    static description = 'A sequence of the natural numbers'

    private begin = 1n

    initialize() {
        if (this.ready) return
        if (this.includeZero) {
            this.name = 'Nonnegative Integers'
            this.begin = 0n
        } else {
            this.name = 'Positive Integers'
        }
        super.initialize()
    }

    calculate(n: bigint) {
        return n + this.begin
    }
}

export const exportModule = SequenceExportModule.family(Naturals)
