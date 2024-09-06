import type {Factorization} from './SequenceInterface'
import {SequenceDefault} from './SequenceDefault'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'

const min = Math.min
const max = Math.max

/**
 *
 * @class CachingError
 * extends the built-in Error class to indicate that a cache is trying
 * to be accessed while it is being filled, or other caching impropriety.
 */
export class CachingError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CachingError' // (2)
    }
}

/**
 *
 * @class Cached
 * extends the SequenceDefault class with a facility to cache pre-computed
 * entries in the sequence. Sequences may derive from it and override just
 * the (dummy) calculate() method supplied here, and the caching will
 * automatically occur.
 *
 * Note: to prevent bugs with sequences with non-deterministic formulae
 * (e.g. in Random.ts), this class should guarantee that
 * calculate() will never be called on the same input more than once.
 *
 * Note that this is a class factory function, and generated a Cached class
 * from a parameter description.
 */
export function Cached<PD extends GenericParamDescription>(desc: PD) {
    const defaultObject = Object.fromEntries(
        Object.keys(desc).map(param => [param, desc[param].default])
    )
    const Cached = class extends SequenceDefault {
        name = 'A generic uninitialized sequence with value caching'
        cache: bigint[] = []
        factorCache: Factorization[] = []
        lastValueCached: number
        lastFactorCached: number
        valueCachingPromise = Promise.resolve()
        factorCachingPromise = Promise.resolve()
        cacheBlock: number

        /**
         * Creates an instance of Cached.
         * Defaults for the parameters, if any, are in parentheses at the
         * end of the description.
         * @param {*} sequenceID the sequence identifier of the sequence
         * @param {number} first
         *     specifies the smallest valid index of the series (0)
         * @param {number} last
         *     specifies the largest valid index of the series (Infinity)
         * @param {number} cacheBlock
         *     specifies how many values to put in cache at each fill (128)
         */
        constructor(first?: number, last?: number, cacheBlock?: number) {
            super(desc)
            this.first = first ?? 0
            this.last = last ?? Infinity
            this.cacheBlock = cacheBlock ?? 128
            this.lastValueCached = this.first - 1
            this.lastFactorCached = this.first - 1
            Object.assign(this, defaultObject)
        }

        async fill(
            n = isFinite(this.lastValueCached)
                ? this.lastValueCached + this.cacheBlock
                : 0,
            what?: string
        ) {
            await this.cacheValues(n)
            if (what === 'factors') await this.cacheFactors(n)
        }

        newCacheSize(n: number, lastCached: number): number {
            /* Returns the new limit for a cache size:
            We want to grab at least a whole cacheBlock, but we also want
            to grab more if we've already gotten a lot, and of course we
            need to grab enough to have the current requested index...
            */
            let newLimit = max(
                lastCached + this.cacheBlock,
                2 * lastCached,
                n + 1
            )
            newLimit = min(this.last, newLimit)
            return newLimit
        }

        async fillValueCache(n: number) {
            for (let i = this.lastValueCached + 1; i <= n; i++) {
                this.cache[i] = this.calculate(i)
                this.lastValueCached = i
            }
        }

        async cacheValues(n: number) {
            // Let any existing value caching complete
            await this.valueCachingPromise
            if (n > this.lastValueCached) {
                this.valueCachingPromise = this.fillValueCache(n)
                await this.valueCachingPromise
            } else {
                this.valueCachingPromise = Promise.resolve()
            }
        }

        getElement(n: number): bigint {
            if (n < this.first || n > this.last) {
                throw RangeError(
                    `Cached: Index ${n} not in ${this.first}..${this.last}.`
                )
            }
            if (n <= this.lastValueCached) {
                return this.cache[n]
            }
            this.cacheValues(this.newCacheSize(n, this.lastValueCached))
            throw new CachingError(`Filling cache to get value at index ${n}`)
        }

        async fillFactorCache(n: number) {
            // Make sure we have all of the values we need:
            await this.cacheValues(n)
            for (let i = this.lastFactorCached + 1; i <= n; ++i) {
                this.factorCache[i] = this.factor(i, this.getElement(i))
                this.lastFactorCached = i
            }
        }

        async cacheFactors(n: number) {
            // Let any existing factor caching complete
            await this.factorCachingPromise
            if (n <= this.last && n > this.lastFactorCached) {
                this.factorCachingPromise = this.fillFactorCache(n)
                await this.factorCachingPromise
            } else {
                this.factorCachingPromise = Promise.resolve()
            }
        }

        getFactors(n: number): Factorization {
            if (n < this.first || n > this.last) {
                throw RangeError(
                    `Cached: Index ${n} not in ${this.first}..${this.last}.`
                )
            }
            if (n <= this.lastFactorCached) {
                return this.factorCache[n]
            }
            this.cacheFactors(this.newCacheSize(n, this.lastFactorCached))
            throw new CachingError(`Factoring value at index ${n}.`)
        }

        /**
         * calculate produces the proper value of the sequence for a given index
         * This should be overridden in any derived class.
         * @param {number} n the index of the entry to calculate
         */
        calculate(n: number): bigint {
            return BigInt(n)
        }

        /**
         * factor produces the proper factorization of the sequence entry for
         * a given index. This should be overridden in any derived class. Note
         * it receives both the sequence index and the value of the entry.
         * @param {number} n  the index of the entry to factor
         * @param {bigint} value  the value of the entry to factor
         * @returns {Factorization} the factorization
         */
        factor(_n: number, _v: bigint): Factorization {
            return null
        }

        /**
         * On a parameter change, we assume the sequence is now completely
         * different. As a result, we want to reset the cache and reinitialize
         * the sequence so that every element is recomputed when queried.
         */
        async parameterChanged(_name: string) {
            await super.parameterChanged(_name)
            this.ready = false
            await this.valueCachingPromise
            await this.factorCachingPromise
            this.lastValueCached = this.first - 1
            this.lastFactorCached = this.first - 1
            this.initialize()
        }
    }

    return Cached as unknown as new (
        first?: number,
        last?: number,
        cacheBlock?: number
    ) => InstanceType<typeof Cached> & ParamValues<PD>
}
