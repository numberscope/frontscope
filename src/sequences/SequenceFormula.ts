import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'
import simpleFactor from './SimpleFactor'
import * as math from 'mathjs'

/**
 *
 * @class SequenceFormula
 * extends SequenceCached to use mathjs to compute an arbitrary formula in terms
 * of n. Currently all such formulas start at index 0 and have no limit, but
 * those are both arbitrary choices; we might at some point want to allow
 * either to be tailored.
 */
class SequenceFormula extends SequenceCached {
    name = 'Formula: empty'
    description = 'A sequence defined by a formula in n'
    formula = 'n'
    params = {
        formula: {
            value: this.formula,
            displayName: 'Formula',
            required: true,
        },
    }

    private evaluator: math.EvalFunction

    /**
     *Creates an instance of SequenceFormula
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor(sequenceID: number) {
        super(sequenceID)
        // It is mandatory to initialize the `evaluator` property here,
        // so just use a simple dummy formula until the user provides one.
        this.evaluator = math.compile(this.formula)
    }

    checkParameters() {
        const status = super.checkParameters()

        let parsetree = undefined
        try {
            parsetree = math.parse(this.params.formula.value)
        } catch (err: unknown) {
            status.isValid = false
            status.errors.push(
                'Could not parse formula: ' + this.params.formula.value
            )
            status.errors.push((err as Error).message)
            return status
        }
        const othersymbs = parsetree.filter(
            (node, path, parent) =>
                node.type === 'SymbolNode'
                && parent?.type !== 'FunctionNode'
                && node.name !== 'n'
        )
        if (othersymbs.length > 0) {
            status.isValid = false
            status.errors.push(
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
    SequenceFormula,
    'Sequence by Formula',
    SequenceExportKind.FAMILY
)
