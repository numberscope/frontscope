import axios from 'axios'

import {Cached} from './Cached'
import type {Factorization} from './SequenceInterface'
import simpleFactor from './simpleFactor'

import {alertMessage} from '@/shared/alertMessage'
import {breakableString} from '@/shared/layoutUtilities'
import {math} from '@/shared/math'
import type {ExtendedBigint} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# OEIS sequence
[<img
  src="../../assets/img/OEIS/PrimeDiffs.png"
  style="float: right; margin-left: 1em; width: 250px"
/>](../assets/img/OEIS/PrimeDiffs.png)

This Sequence implementation allows access to any integer sequence in the
Online Encyclopedia of Integer Sequences ([OEIS](https://oeis.org)). Note
that the specific sequence in the Encyclopedia represented by this sequence
is determined at the time the sequence is created with the Sequence Switcher.
In other words, the sequence ID (A000040 in the example depicted above,
corresponding to the sequence of prime numbers) is not a parameter, and cannot
be changed once the sequence is created. To view a sequence in the OEIS,
open the Sequence Switcher (by clicking on the box where the sequence name
appears in the Sequence tab). It will show a list of possible sequences, with
previews of your current visualizer operating on them. Some of them will be
OEIS sequences. If you see the sequence you want, just click on it.

If not, enter any term related to the sequence (or just the ID of the sequence
itself if you know it), and a list of matching sequences will come up. Click
on the description of the sequence you want (clicking on its ID goes to the
corresponding page in the OEIS), and it will be added to the list of sequences
to preview, adding a thumbnail to the popup gallery. Now you can click on
that preview to start visualizing with your desired sequence.

One other note about OEIS sequences: your browser must download the entry
values from the web. So although much of Numberscope will operate offline
once you've fully loaded its page, if you want to visualize an OEIS sequence
you will need an active internet connection.

## Parameters
**/
const paramDesc = {
    /** md
-   **Modulus:** Since many visualizers work best when the input is in a
    restricted range, or just because you might be interested in examining
    a sequence with respect to modulo-m arithmetic for some m, you can specify
    this "modulus" parameter. If you do, each entry of the OEIS sequence
    will be divided by this modulus, and only the remainder from that division
    will be sent to the visualizer as the entry value. If you don't specify
    the modulus or set it to 0, the OEIS sequence values will be used
    unchanged.
    **/
    modulus: {
        default: 0n,
        type: ParamType.BIGINT,
        displayName: 'Modulus',
        required: false,
        description:
            'If nonzero, take the residue of each element to this modulus.',
        validate: function (n: bigint, status: ValidationStatus) {
            status.forbid(n < 0n, "can't be negative")
        },
    },
} satisfies GenericParamDescription

/** md

Plus the standard parameters for all formulas:
{! Cached.ts extract:
   start: '^\s*[/]\*\*+\W?xmd\b' # Opening like /** xmd
   stop: '^\s*(?:/\*\s*)?\*\*[/]\s*$' # closing comment with two *
!}
**/

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
        let desc = this.oeisName
        if (this.modulus) desc += ` (mod ${breakableString(this.modulus)})`
        return desc
    }

    /* We maintain a global cache for all OEIS sequences. These are grabbed
       in large pieces from the backend. We keep track of exactly what
       we have obtained, and just point into the communal cache; the modulus,
       if any, is applied on the fly with every element access.
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
            this.cache = data.values
            this.firstValueCached = data.first
            this.lastValueCached = data.last
        }
    }

    getElement(n: bigint): bigint {
        const raw = super.getElement(n)
        if (this.modulus) return math.modulo(raw, this.modulus)
        return raw
    }

    // We have global cache for factors as well; we have not yet
    // implemented random access for factors, so it's all-or-nothing.
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
