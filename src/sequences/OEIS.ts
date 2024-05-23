import type {ValidationStatus} from '../shared/ValidationStatus'
import {modulo} from '../shared/math'
import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {Cached} from './Cached'
import {alertMessage} from '../shared/alertMessage'

import axios from 'axios'
import {ParamType} from '../shared/ParamType'

/**
 *
 * @class OEIS
 * An extension of Cached for getting sequences from backscope,
 * the Flask backend.
 *
 */
export default class OEIS extends Cached {
    name = 'OEIS Sequence Template'
    description = 'Factory for obtaining sequences from the OEIS'
    oeisSeq = true
    cacheBlock = 1000
    oeisId = ''
    givenName = ''
    modulus = 0n
    params = {
        oeisId: {
            value: '',
            type: ParamType.STRING,
            displayName: 'OEIS ID',
            required: true,
        },
        givenName: {
            value: '',
            type: ParamType.STRING,
            displayName: 'Name',
            required: false,
        },
        cacheBlock: {
            value: this.cacheBlock,
            type: ParamType.INTEGER,
            displayName: 'Number of Elements',
            required: false,
            description:
                'How many elements to try to fetch from the database.',
        },
        modulus: {
            value: this.modulus,
            type: ParamType.BIGINT,
            displayName: 'Modulus',
            required: false,
            description:
                'If nonzero, take the residue of each element to this modulus.',
        },
    }

    constructor(sequenceID: number) {
        super(sequenceID) // Don't know the index range yet, will fill in later
    }

    /* Unlike the base Cached sequence class, we grab the entire sequence
       at once.
    */
    async fillValueCache(): Promise<void> {
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
                this.cacheBlock = 0
            }
            this.lastValueCached = this.last
            this.cachingValuesTo = this.last
        } catch (e) {
            window.alert(alertMessage(e))
        }
    }

    async fillFactorCache(): Promise<void> {
        // Short-circuit if sequence is empty
        if (this.cacheBlock < 1) return
        try {
            const urlPrefix = `${import.meta.env.VITE_BACKSCOPE_URL}/api/`
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
            this.lastFactorCached = this.last
            this.cachingFactorsTo = this.last
        } catch (e) {
            window.alert(alertMessage(e))
        }
    }

    checkParameters(params: {[key: string]: unknown}): ValidationStatus {
        const status = super.checkParameters(params)

        if (
            (params.oeisId as string).length !== 7
            || ((params.oeisId as string)[0] !== 'A'
                && (params.oeisId as string)[0] !== 'a')
        ) {
            status.addError('OEIS IDs are of form Annnnnn')
        }
        if (typeof params.cacheBlock === 'number') {
            if (
                params.cacheBlock < 0
                || !Number.isInteger(this.params.cacheBlock.value)
            ) {
                status.addError(
                    'Number of elements must be a positive integer.'
                )
            }
        }

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
    OEIS,
    'Add OEIS Sequence',
    SequenceExportKind.GETTER
)
