import type {Factorization} from './SequenceInterface'
import {SequenceDefault} from './SequenceDefault'

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
 */
export class Cached extends SequenceDefault {
    name = 'Cached Base'
    description = 'A base class for cached sequences'
    protected cache: bigint[] = []
    protected factorCache: Factorization[] = []
    protected lastValueCached: number
    protected lastFactorCached: number
    protected cachingValuesTo: number
    protected cachingFactorsTo: number
    protected cacheBlock: number

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
    constructor(
        sequenceID: number,
        first?: number,
        last?: number,
        cacheBlock?: number
    ) {
        super(sequenceID)
        this.first = first ?? 0
        this.last = last ?? Infinity
        this.cacheBlock = cacheBlock ?? 128
        this.lastValueCached = this.first - 1
        this.lastFactorCached = this.first - 1
        this.cachingValuesTo = this.lastValueCached
        this.cachingFactorsTo = this.lastFactorCached
    }

    initialize(): void {
        if (this.ready) return
        super.initialize()
        this.ready = false
        this.cachingValuesTo = min(
            this.lastValueCached + this.cacheBlock,
            this.last
        )
        this.fillValueCache()
        this.ready = true
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

    fillValueCache(): void {
        for (
            let i: number = this.lastValueCached + 1;
            i <= this.cachingValuesTo;
            i++
        ) {
            this.cache[i] = this.calculate(i)
            this.lastValueCached = i
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
        /* Check for a race condition: attempting to get a value while it's
           in the midst of being cached. It's also possible this could
           occur if a prior fillCache() threw an uncaught exception, for
           example.
         */
        if (this.lastValueCached != this.cachingValuesTo) {
            throw new CachingError(
                `Currently caching ${this.lastValueCached} to `
                    + `${this.cachingValuesTo}.`
            )
        }
        this.cachingValuesTo = this.newCacheSize(n, this.lastValueCached)
        this.fillValueCache()
        return this.cache[n]
    }

    fillFactorCache(): void {
        for (
            let i: number = this.lastFactorCached + 1;
            i <= this.cachingFactorsTo;
            i++
        ) {
            this.factorCache[i] = this.factor(i, this.getElement(i))
            this.lastFactorCached = i
        }
    }

    getFactors(n: number): Factorization {
        if (n <= this.lastFactorCached) {
            return this.factorCache[n]
        }
        if (this.lastFactorCached != this.cachingFactorsTo) {
            throw new CachingError(
                `Currently factoring ${this.lastFactorCached} to `
                    + `${this.cachingFactorsTo}.`
            )
        }
        this.cachingFactorsTo = this.newCacheSize(n, this.lastFactorCached)
        this.fillFactorCache()
        return this.factorCache[n]
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
     * a given index. This should be overridden in any derived class. Note it
     * receives both the sequence index and the value of the entry.
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
    parameterChanged(_name: string): void {
        this.ready = false
        this.lastValueCached = this.first - 1
        this.lastFactorCached = this.first - 1
        this.cachingValuesTo = this.lastValueCached
        this.cachingFactorsTo = this.lastFactorCached
        this.initialize()
    }
}
