import type {ValidationStatus} from '../shared/ValidationStatus'
import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'
<<<<<<< HEAD
import {alertMessage} from '../shared/alertMessage'
=======
import simpleFactor from './simpleFactor'
import * as math from 'mathjs'
>>>>>>> d898427 (refactor: Move transforming sequences to Sequence hierarchy)

import axios from 'axios'

/**
 *
 * @class OEISSequenceTemplate
 * An extension of SequenceCached for getting sequences from backscope,
 * the Flask backend.
 *
 */
export default class OEISSequenceTemplate extends SequenceCached {
    name = 'OEIS Sequence Template'
    description = 'Factory for obtaining sequences from the OEIS'
    oeisSeq = true
    cacheBlock = 1000
    oeisId = ''
    givenName = ''
    transform = ''
    params = {
        oeisId: {value: '', displayName: 'OEIS ID', required: true},
        givenName: {value: '', displayName: 'Name', required: false},
        cacheBlock: {
            value: this.cacheBlock,
            displayName: 'Number of Elements',
            required: false,
            description:
                'How many elements to try to fetch from the database.',
        },
        transform: {
            value: this.transform,
            displayName: 'Transform Values by',
            required: false,
            description:
                'If specified, substitutes OEIS entry values for n in this '
                + 'formula to obtain the final sequence values. For example, '
                + 'entering `n^2` will square every entry in the sequence.',
        },
    }

    private evaluator: math.EvalFunction

    constructor(sequenceID: number) {
        super(sequenceID) // Don't know the index range yet, will fill in later
        // It is mandatory to initialize the `evaluator` property here,
        // so just use a simple dummy formula until the user potentially
        // provides one.
        this.evaluator = math.compile('n')
    }

    async fillCache(): Promise<void> {
<<<<<<< HEAD
        // Catch HTTP errors. (This function has multiple HTTP requests.)
        try {
            // import.meta.env is basically your configuration.
            // It's set up by Vite automatically
            // See https://vitejs.dev/guide/env-and-mode.html.
            const urlPrefix = `${import.meta.env.VITE_BACKSCOPE_URL}/api/`
            const backendUrl =
                urlPrefix
                + `get_oeis_values/${this.oeisId}/${this.cacheBlock}`
            const response = await axios.get(backendUrl)
            this.first = Infinity
            this.last = -Infinity
            for (const k in response.data.values) {
                const index = Number(k)
                if (index < this.first) this.first = index
                if (index > this.last) this.last = index
                this.cache[index] = BigInt(response.data.values[k])
                if (this.modulus) {
                    this.cache[index] = modulo(
                        this.cache[index],
                        this.modulus
                    )
                }
=======
        // import.meta.env is basically your configuration.
        // It's set up by Vite automatically
        // See https://vitejs.dev/guide/env-and-mode.html.
        const urlPrefix = `${import.meta.env.VITE_BACKSCOPE_URL}/api/`
        const backendUrl =
            urlPrefix + `get_oeis_values/${this.oeisId}/${this.cacheBlock}`
        const response = await axios.get(backendUrl)
        this.first = Infinity
        this.last = -Infinity
        for (const k in response.data.values) {
            const index = Number(k)
            if (index < this.first) this.first = index
            if (index > this.last) this.last = index
            this.cache[index] = BigInt(response.data.values[k])
            if (this.transform) {
                this.cache[index] = BigInt(
                    this.evaluator.evaluate({n: Number(this.cache[index])})
                )
>>>>>>> d898427 (refactor: Move transforming sequences to Sequence hierarchy)
            }
            if (this.first === Infinity) {
                /* An empty sequence; perhaps a mistaken OEIS ID. Is there
               any other action we should take in this case?
            */
<<<<<<< HEAD
                this.first = 0
                this.last = -1
            } else {
                // OK, now get the factors
=======
            this.first = 0
            this.last = -1
        } else {
            // OK, now get the factors
            if (this.transform) {
                // We have modified the values, so need to factor ourselves
                for (let n = this.first; n <= this.last; ++n) {
                    this.factorCache[n] = simpleFactor(this.cache[n])
                }
            } else {
                // Get the factors from the database
>>>>>>> d898427 (refactor: Move transforming sequences to Sequence hierarchy)
                const factorUrl =
                    urlPrefix
                    + `get_oeis_factors/${this.oeisId}/${this.cacheBlock}`
                const factorResponse = await axios.get(factorUrl)
                for (const k in factorResponse.data.factors) {
                    const index = Number(k)
                    if (index < this.first || index > this.last) continue
                    const factors = factorResponse.data.factors[k]
                    if (factors === 'no_fac') {
                        this.factorCache[index] = null
                    } else {
                        // Sadly, we have to parse the factors as a _string_
                        // ourselves:
                        if (factors === '[]') {
                            this.factorCache[index] = []
                        } else {
                            // Lop off the initial '[[' and final ']]'
                            const internals = factors.slice(2, -2)
                            // That leaves '],[' separating the pairs
                            const entries = internals.split('],[')
                            this.factorCache[index] = entries.map(
                                (pair: string) => {
                                    // And each pair is comma-separated
                                    const [base, power] = pair.split(',', 2)
                                    return [BigInt(base), BigInt(power)]
                                }
                            )
                        }
                    }
                }
            }
            this.lastCached = this.last
            this.cachingTo = this.last
        } catch (e) {
            window.alert(alertMessage(e))
        }
    }

    checkParameters(): ValidationStatus {
        const status = super.checkParameters()

        if (
            this.params.oeisId.value.length !== 7
            || (this.params.oeisId.value[0] !== 'A'
                && this.params.oeisId.value[0] !== 'a')
        ) {
            status.errors.push('OEIS IDs are of form Annnnnn')
        }
        if (typeof this.params.cacheBlock.value === 'number') {
            if (
                this.params.cacheBlock.value < 0
                || !Number.isInteger(this.params.cacheBlock.value)
            ) {
                status.errors.push(
                    'Number of elements must be a positive integer.'
                )
            }
        }

        if (this.params.transform.value) {
            let parsetree = undefined
            let formulaOK = true
            try {
                parsetree = math.parse(this.params.transform.value)
            } catch (err: unknown) {
                status.errors.push(
                    'Could not parse formula: ' + this.params.transform.value
                )
                status.errors.push((err as Error).message)
                formulaOK = false
            }
            if (formulaOK && parsetree) {
                this.evaluator = parsetree.compile()
            }
        }

        if (status.errors.length > 0) status.isValid = false

        return status
    }

    initialize(): void {
        this.name = this.givenName || this.oeisId
        if (this.cacheBlock < 1) {
            this.cacheBlock = 1000
            this.refreshParams()
        }
        super.initialize()
    }
}

export const exportModule = new SequenceExportModule(
    OEISSequenceTemplate,
    'Add OEIS Sequence',
    SequenceExportKind.GETTER
)
