import {Cached} from './Cached'
import {SequenceExportModule} from './SequenceInterface'

import {MathFormula} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'

const paramDesc = {
    formula: {
        default: new MathFormula('n'),
        type: ParamType.FORMULA,
        displayName: 'Formula',
        required: true,
    },
} satisfies GenericParamDescription

/**
 *
 * @class Formula
 * extends Cached to use mathjs to compute an arbitrary formula in terms
 * of n. Currently all such formulas start at index 0 and have no limit, but
 * those are both arbitrary choices; we might at some point want to allow
 * either to be tailored.
 */
class Formula extends Cached(paramDesc) {
    static category = 'Formula'
    name = `${Formula.category}: ${paramDesc.formula.default}`
    static description = 'A sequence defined by a formula in n'

    initialize(): void {
        super.initialize()
        this.name = 'Formula: ' + this.formula.source
    }

    calculate(n: bigint) {
        const result = this.formula.compute(Number(n))
        if (result === Infinity) return BigInt(Number.MAX_SAFE_INTEGER)
        else if (result === -Infinity) return BigInt(Number.MIN_SAFE_INTEGER)
        else if (Number.isNaN(result)) return BigInt(0)
        return BigInt(Math.floor(result))
    }
}

export const exportModule = SequenceExportModule.family(Formula)
