import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'
import * as math from 'mathjs'

// Make sure we can factor every number up to a million
const smallPrimes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
    71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149,
    151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
    233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313,
    317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409,
    419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499,
    503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601,
    607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691,
    701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809,
    811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907,
    911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997,
]

const sureFactorLimit = 1009n * 1009n // smallest number we can't factor

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

    factor(n: number, v: bigint): [bigint, bigint][] | null {
        // Special cases:
        if (v === 0n) return [[0n, 1n]]
        if (v === -1n) return [[-1n, 1n]]
        if (v === 1n) return []
        const factors: [bigint, bigint][] = []
        if (v < 0) {
            v = -v
            factors.push([-1n, 1n])
        }
        for (const np of smallPrimes) {
            const p = BigInt(np)
            let power = 0n
            while (v % p === 0n) {
                power += 1n
                v /= p
            }
            if (power > 0n) {
                factors.push([p, power])
            }
            if (v === 1n) break
        }
        if (v === 1n) return factors
        if (v < sureFactorLimit) {
            // residual must be prime
            factors.push([v, 1n])
            return factors
        }
        return null // couldn't factor
    }
}

export const exportModule = new SequenceExportModule(
    SequenceFormula,
    'Sequence by Formula',
    SequenceExportKind.FAMILY
)
