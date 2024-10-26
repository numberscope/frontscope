import {Cached} from './Cached'
import {SequenceExportModule} from './SequenceInterface'

import {math} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

const paramDesc = {
    formula: {
        default: 'n',
        type: ParamType.STRING,
        displayName: 'Formula',
        required: true,
        validate(f: string, status: ValidationStatus) {
            let parsetree = undefined
            try {
                parsetree = math.parse(f)
            } catch (err: unknown) {
                status.addError(
                    `Could not parse formula: ${f}`,
                    (err as Error).message
                )
                return
            }
            const othersymbs = parsetree.filter(
                (node, path, parent) =>
                    math.isSymbolNode(node)
                    && parent?.type !== 'FunctionNode'
                    && node.name !== 'n'
            )
            if (othersymbs.length > 0) {
                status.addError(
                    "Only 'n' may occur as a free variable in formula.",
                    `Please remove '${(othersymbs[0] as math.SymbolNode).name}'`
                )
            }
        },
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

    private evaluator: math.EvalFunction

    /**
     *Creates an instance of Formula
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor() {
        super()
        // It is mandatory to initialize the `evaluator` property here,
        // so just use a simple dummy formula until the user provides one.
        this.evaluator = math.compile(this.formula)
    }

    initialize(): void {
        super.initialize()
        this.name = 'Formula: ' + this.formula
        this.evaluator = math.compile(this.formula)
    }

    calculate(n: bigint) {
        const result = this.evaluator.evaluate({n: Number(n)})
        if (result === Infinity) return BigInt(Number.MAX_SAFE_INTEGER)
        else if (result === -Infinity) return BigInt(Number.MIN_SAFE_INTEGER)
        else if (Number.isNaN(result)) return BigInt(0)
        return BigInt(Math.floor(result))
    }
}

export const exportModule = SequenceExportModule.family(Formula)
