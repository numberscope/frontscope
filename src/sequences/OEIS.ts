import axios from 'axios'

import {Cached} from './Cached'
import type {Factorization} from './SequenceInterface'
import simpleFactor from './simpleFactor'

import {alertMessage} from '@/shared/alertMessage'
import {math} from '@/shared/math'
import type {ExtendedBigint} from '@/shared/math'
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
    first: bigint
    last: bigint
    values: Record<string, bigint>
}

type OEISfactors = {
    first: bigint
    last: bigint
    factors: Record<string, Factorization>
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
    static inCaching: Record<string, Promise<void>> = {}
    async fillValueCache(_n?: bigint) {
        // If the cache is already full, nothing to do:
        if (this.lastValueCached >= this.last) return
        let known = this.oeisID in OEIS.vCache
        if (!known) {
            if (this.oeisID in OEIS.inCaching) {
                await OEIS.inCaching[this.oeisID]
            } else {
                let resolve = Function() // gives a close enough type
                OEIS.inCaching[this.oeisID] = new Promise(res => {
                    resolve = res
                })
                // Catch HTTP errors in the backend request.
                try {
                    const backendUrl =
                        OEIS.urlPrefix
                        + `get_oeis_name_and_values/${this.oeisID}`
                    const response = await axios.get(backendUrl)
                    let name = response.data.name
                    if (this.oeisID == 'A000045') name = 'Virahāṅka-' + name
                    let first: ExtendedBigint = math.posInfinity
                    let last: ExtendedBigint = math.negInfinity
                    const values: Record<string, bigint> = {}
                    for (const k in response.data.values) {
                        const index = BigInt(k)
                        if (index < first) first = index
                        if (index > last) last = index
                        values[index.toString()] = BigInt(
                            response.data.values[k]
                        )
                    }
                    if (
                        typeof first === 'bigint'
                        && typeof last === 'bigint'
                    ) {
                        // Never cache with infinite indices
                        OEIS.vCache[this.oeisID] = {name, first, last, values}
                    }
                } catch (e) {
                    if (window.alert) {
                        window.alert(alertMessage(e))
                    } else {
                        console.warn(alertMessage(e))
                    }
                }
                resolve()
                delete OEIS.inCaching[this.oeisID]
            }
        }
        known = this.oeisID in OEIS.vCache
        if (!known) {
            this.oeisName = `Unknown OEIS sequence ${this.oeisID}`
            this.first = 0n
            this.last = -1n
            this.cacheBlock = 0n
            this.lastValueCached = -1n
            // Anything else we should do? Throw an error?
        } else {
            const data = OEIS.vCache[this.oeisID]
            this.oeisName = data.name
            this.makeAvailable(data.first, data.last)
            for (let index = data.first; index <= data.last; ++index) {
                if (this.modulus)
                    this.cache[index.toString()] = math.modulo(
                        data.values[index.toString()],
                        this.modulus
                    )
                else
                    this.cache[index.toString()] =
                        data.values[index.toString()]
            }
            this.firstValueCached = data.first
            this.lastValueCached = data.last
        }
    }

    // We have global cache for factors as well
    static fCache: Record<string, OEISfactors> = {}
    async fillFactorCache(_n: bigint): Promise<void> {
        // Short-circuit if sequence is empty
        if (this.cacheBlock < 1) return
        // If the cache is already full, nothing to do:
        if (this.lastFactorCached >= this.last) return

        if (this.modulus) await this.cacheValues(0n)
        let known = this.oeisID in OEIS.fCache
        if (typeof this.lastAvailable !== 'bigint') {
            throw new RangeError('Infinite OEIS sequence?')
        }
        const end: bigint = this.lastAvailable
        const start = BigInt(this.firstAvailable)
        if (!known) {
            const facList: Record<string, Factorization> = {}
            let firstFactor = end + 1n
            let lastFactor = start - 1n
            try {
                const factorUrl =
                    OEIS.urlPrefix
                    + `get_oeis_factors/${this.oeisID}/`
                    + (end - start + 1n).toString()
                const factorResponse = await axios.get(factorUrl)
                for (const k in factorResponse.data.factors) {
                    const index = BigInt(k)
                    if (index < start || index > end) continue
                    if (index < firstFactor) firstFactor = index
                    if (index > lastFactor) lastFactor = index
                    const factors = factorResponse.data.factors[k]
                    if (factors.startsWith('no_fac')) {
                        facList[index.toString()] = null
                    } else {
                        // Sadly, we have to parse the factors as a _string_
                        // ourselves:
                        if (factors === '[]') {
                            facList[index.toString()] = []
                        } else {
                            // Lop off the initial '[' and final ']'
                            const internals = factors.slice(1, -1)
                            // The pairs are separated by ;
                            const entries = internals.split(';')
                            facList[index.toString()] = entries.map(
                                (pair: string) => {
                                    // And each pair is comma-separated
                                    const [base, power] = pair.split(',', 2)
                                    return [BigInt(base), BigInt(power)]
                                }
                            )
                        }
                    }
                }
            } catch (e) {
                window.alert(alertMessage(e))
            }
            OEIS.fCache[this.oeisID] = {
                first: firstFactor,
                last: lastFactor,
                factors: facList,
            }
        }
        known = this.oeisID in OEIS.fCache
        if (!known || this.modulus) {
            for (let index = this.first; index <= this.last; ++index)
                this.factorCache[index.toString()] = simpleFactor(
                    this.getElement(index)
                )
            this.lastFactorCached = BigInt(this.last)
        } else {
            this.factorCache = OEIS.fCache[this.oeisID].factors
            this.lastFactorCached = OEIS.fCache[this.oeisID].last
        }
    }
}

// OEIS has no export module because it must be constructed with an id, so
// it is handled specially in sequences.ts
