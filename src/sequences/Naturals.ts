import {SequenceExportModule} from './SequenceInterface'
import {Cached} from './Cached'
import {ParamType} from '../shared/ParamType'

const paramDesc = {
    includeZero: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Include Zero',
        required: false,
    },
} as const

/**
 *
 * @class Naturals
 * extends Cached with a very simple calculate, mostly by way of an
 * example of using Cached.
 */
class Naturals extends Cached(paramDesc) {
    name = 'Natural Numbers'
    description = 'A sequence of the natural numbers'
    private begin = 1

    /**
     *Creates an instance of Naturals
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
    }

    initialize() {
        if (this.ready) return
        if (this.includeZero) {
            this.name = 'Nonnegative Integers'
            this.begin = 0
        } else {
            this.name = 'Positive Integers'
        }
        super.initialize()
    }

    calculate(n: number) {
        return BigInt(n + this.begin)
    }
}

export const exportModule = SequenceExportModule.family(Naturals)
