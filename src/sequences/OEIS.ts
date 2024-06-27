import {modulo} from '../shared/math'
import {Cached} from './Cached'
import {alertMessage} from '../shared/alertMessage'

import axios from 'axios'

const paramDesc = {} as const

/**
 *
 * @class OEIS
 * An extension of Cached for getting sequences from backscope,
 * the Flask backend.
 *
 */
export default class OEISSequence extends Cached(paramDesc) {
    description = 'An imported OEIS sequence'

    oeisId: string
    modulus: bigint
    private initialized = false

    constructor(
        sequenceID: number,
        name: string,
        oeisId: string,
        cacheBlock: number,
        modulus: bigint
    ) {
        super(sequenceID, 0, Infinity, cacheBlock)
        this.name = name
        this.oeisId = oeisId
        this.modulus = modulus
        // Don't know the index range yet, will fill in later
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

    async initialize(): Promise<void> {
        // We only want to initialize OEIS sequences once, as they're expensive
        // to pull from backscope and they are immutable
        if (this.initialized) return
        this.initialized = true
        this.name = this.name || this.oeisId
        if (this.cacheBlock < 1) {
            this.cacheBlock = 1000
            this.refreshParams()
        }
        await super.initialize()
    }

    /**
     * Gets the standard sequence export key for this OEIS sequence. This is for
     * consistency so that OEIS sequences with the same name, OEIS ID, cache
     * block, and modulus aren't loaded duplicately and have the same key in
     * the list of sequence export modules
     */
    toSequenceExportKey(): string {
        return (
            '.'
            + this.oeisId
            + '#'
            + this.cacheBlock
            + '#'
            + this.modulus
            + '#'
            + this.name
        )
    }

    /**
     * Given a standard sequence export key generated from
     * `toSequenceExportKey()`, reconstructs an `OEISSequence` from it.
     * This is useful when loading saved specimens after restarting the
     * webpage. If the used OEIS sequence key is not present in the list
     * of sequence export modules, this function is called to generate it
     *
     * This function throws an error if it is not a valid sequence export key
     */
    static fromSequenceExportKey(key: string): OEISSequence {
        if (!key.startsWith('.'))
            throw new Error("Sequence export key should start with '.'")

        const components = key.substring(1).split('#')
        if (components.length < 4)
            throw new Error('Sequence export key is missing components')

        return new OEISSequence(
            0,
            components.slice(3).join('#'),
            components[0],
            Number.parseInt(components[1]),
            BigInt(Number.parseInt(components[2]))
        )
    }
}

// OEIS does not have an export module as it is not itself a selectable
// sequence, but is constructed as an instance when OEIS sequences are
// imported
