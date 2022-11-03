import type {ValidationStatus} from '../shared/ValidationStatus'
import {modulo} from '../shared/math'
import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'
import {alertError} from '../shared/alertError.js'

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
    modulus = 0n
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
        modulus: {
            value: this.modulus,
            displayName: 'Modulus',
            required: false,
            description:
                'If nonzero, take the residue of each element to this modulus.',
        },
    }

    constructor(sequenceID: number) {
        super(sequenceID) // Don't know the index range yet, will fill in later
    }

    async fillCache(): Promise<void> {
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
            }
            if (this.first === Infinity) {
                /* An empty sequence; perhaps a mistaken OEIS ID. Is there
               any other action we should take in this case?
            */
                this.first = 0
                this.last = -1
            } else {
                // OK, now get the factors
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
            alertError(e)
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
