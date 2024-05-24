import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {ParamType} from '../shared/ParamType'
import {Cached} from './Cached'
import simpleFactor from './simpleFactor'
import * as math from 'mathjs'

/**
 *
 * @class Formula
 * extends Cached to use mathjs to compute an arbitrary formula in terms
 * of n. Currently all such formulas start at index 0 and have no limit, but
 * those are both arbitrary choices; we might at some point want to allow
 * either to be tailored.
 */
class Formula extends Cached {
    name = 'Formula: empty'
    description = 'A sequence defined by a formula in n'
    formula = 'n'
    params = {
        formula: {
            value: this.formula,
            type: ParamType.STRING,
            displayName: 'Formula',
            required: true,
        },
    }

    private evaluator: math.EvalFunction

    /**
     *Creates an instance of Formula
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
        // It is mandatory to initialize the `evaluator` property here,
        // so just use a simple dummy formula until the user provides one.
        this.evaluator = math.compile(this.formula)
    }

    checkParameters(params: {[key: string]: unknown}) {
        const status = super.checkParameters(params)

        let parsetree = undefined
        try {
            parsetree = math.parse(params.formula as string)
        } catch (err: unknown) {
            status.addError(
                ('Could not parse formula: ' + params.formula) as string,
                (err as Error).message
            )
            return status
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
        this.evaluator = parsetree.compile()
        return status
    }

    initialize(): void {
        super.initialize()
        this.name = 'Formula: ' + this.formula
    }

    calculate(n: number) {
        return BigInt(this.evaluator.evaluate({n: n}))
    }

    factor(_n: number, v: bigint) {
        return simpleFactor(v)
    }
}

export const exportModule = new SequenceExportModule(
    Formula,
    Formula.prototype.name,
    Formula.prototype.description,
    SequenceExportKind.FAMILY
)
