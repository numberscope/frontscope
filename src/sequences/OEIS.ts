import axios from 'axios'

import {Cached} from './Cached'
import type {Factorization} from './SequenceInterface'
import simpleFactor from './simpleFactor'

import {alertMessage} from '@/shared/alertMessage'
import {math} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'

const paramDesc = {
    modulus: {
        default: 0n,
        type: ParamType.BIGINT,
        displayName: 'Modulus',
        required: false,
        description:
            'If nonzero, take the residue of each element to this modulus.',
    },
} satisfies GenericParamDescription

// Type of data we expect concerning an OEIS sequence
type OEISdata = {
    name: string
    first: number
    last: number
    values: bigint[]
}

/**
 *
 * @class OEIS
 * An extension of Cached for getting sequences from backscope,
 * the Flask backend.
 *
 */
export class OEIS extends Cached(paramDesc) {
    oeisID: string
    oeisName = '...sequence loading...'
    static category = 'OEIS Sequence Template'
    static description = 'Factory for obtaining sequences from the OEIS'
    // import.meta.env is basically your configuration.
    // It's set up by Vite automatically
    // See https://vitejs.dev/guide/env-and-mode.html.
    static urlPrefix = `${import.meta.env.VITE_BACKSCOPE_URL}/api/`

    constructor(id: string) {
        super()
        this.oeisID = id
        this.name = `OEIS ${id}`
        // Don't know the index range yet, will fill in later
        // But initialize to an impossible state as a flag
        this.last = Infinity
        this.lastValueCached = -Infinity
        this.lastFactorCached = -Infinity
    }

    get description() {
        // Unusual: override the per-instance description
        return this.oeisName
    }

    /* Unlike the base Cached sequence class, we grab the entire sequence
       at once. Not only that, but we maintain a global cache for all OEIS
       sequences.
    */
    static vCache: Record<string, OEISdata> = {}
    async fillValueCache(_n?: number) {
        // If the cache is already full, nothing to do:
        if (this.lastValueCached >= this.last) return
        let known = this.oeisID in OEIS.vCache
        if (!known) {
            // Catch HTTP errors. (This function has multiple HTTP requests.)
            try {
                const backendUrl =
                    OEIS.urlPrefix + `get_oeis_name_and_values/${this.oeisID}`
                const response = await axios.get(backendUrl)
                let name = response.data.name
                if (this.oeisID == 'A000045') name = 'Virahāṅka-' + name
                let first = Infinity
                let last = -Infinity
                const values: bigint[] = []
                for (const k in response.data.values) {
                    const index = Number(k)
                    if (index < first) first = index
                    if (index > last) last = index
                    values[index] = BigInt(response.data.values[k])
                }
                if (isFinite(first)) {
                    // Never cache with infinite indices
                    OEIS.vCache[this.oeisID] = {name, first, last, values}
                }
            } catch (e) {
                window.alert(alertMessage(e))
            }
        }
        known = this.oeisID in OEIS.vCache
        if (!known) {
            this.oeisName = `Unknown OEIS sequence ${this.oeisID}`
            this.first = 0
            this.last = -1
            this.cacheBlock = 0
            // Anything else we should do? Throw an error?
        } else {
            const data = OEIS.vCache[this.oeisID]
            this.oeisName = data.name
            this.first = data.first
            this.last = data.last
            for (let index = data.first; index <= data.last; ++index) {
                if (this.modulus)
                    this.cache[index] = math.modulo(
                        data.values[index],
                        this.modulus
                    )
                else this.cache[index] = data.values[index]
            }
        }
        this.lastValueCached = this.last
    }

    // We have global cache for factors as well
    static fCache: Record<string, Factorization[]> = {}
    async fillFactorCache(_n: number): Promise<void> {
        // Short-circuit if sequence is empty
        if (this.cacheBlock < 1) return
        // If the cache is already full, nothing to do:
        if (this.lastFactorCached >= this.last) return

        if (this.modulus) await this.fillValueCache(0)
        let known = this.oeisID in OEIS.fCache
        if (!known) {
            const facList: Factorization[] = []
            try {
                const factorUrl =
                    OEIS.urlPrefix
                    + `get_oeis_factors/${this.oeisID}/`
                    + (this.last - this.first + 1).toString()
                const factorResponse = await axios.get(factorUrl)
                for (const k in factorResponse.data.factors) {
                    const index = Number(k)
                    if (index < this.first || index > this.last) continue
                    const factors = factorResponse.data.factors[k]
                    if (factors.startsWith('no_fac')) {
                        facList[index] = null
                    } else {
                        // Sadly, we have to parse the factors as a _string_
                        // ourselves:
                        if (factors === '[]') {
                            facList[index] = []
                        } else {
                            // Lop off the initial '[' and final ']'
                            const internals = factors.slice(1, -1)
                            // The pairs are separated by ;
                            const entries = internals.split(';')
                            facList[index] = entries.map((pair: string) => {
                                // And each pair is comma-separated
                                const [base, power] = pair.split(',', 2)
                                return [BigInt(base), BigInt(power)]
                            })
                        }
                    }
                }
            } catch (e) {
                window.alert(alertMessage(e))
            }
            OEIS.fCache[this.oeisID] = facList
        }
        known = this.oeisID in OEIS.fCache
        if (!known || this.modulus) {
            for (let index = this.first; index <= this.last; ++index)
                this.factorCache[index] = simpleFactor(this.getElement(index))
            this.lastFactorCached = this.last
        } else {
            this.factorCache = OEIS.fCache[this.oeisID]
            this.lastFactorCached = this.factorCache.length - 1
        }
    }
}

// OEIS has no export module because it must be constructed with an id, so
// it is handled specially in sequences.ts
