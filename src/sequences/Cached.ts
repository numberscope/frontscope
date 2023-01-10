import type {Factorization} from './SequenceInterface'
import {SequenceDefault} from './SequenceDefault.js'

const min = Math.min
const max = Math.max

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
    protected lastCached: number
    protected cachingTo: number
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
        this.lastCached = this.first - 1
        this.cachingTo = this.lastCached
    }

    initialize(): void {
        if (this.ready) return
        super.initialize()
        this.ready = false
        this.cachingTo = min(this.lastCached + this.cacheBlock, this.last)
        this.fillCache()
        this.ready = true
    }

    resizeCache(n: number): void {
        /* We want to grab at least a whole cacheBlock, but we also want
           to grab more if we've already gotten a lot, and of course we
           need to grab enough to have the current requested index...
         */
        this.cachingTo = max(
            this.lastCached + this.cacheBlock,
            2 * this.lastCached,
            n + 1
        )
        /* ... except if that would put us past the last index: */
        this.cachingTo = min(this.last, this.cachingTo)
    }

    fillCache(): void {
        for (let i: number = this.lastCached + 1; i <= this.cachingTo; i++) {
            this.cache[i] = this.calculate(i)
            this.factorCache[i] = this.factor(i, this.cache[i])
            this.lastCached = i
        }
    }

    getElement(n: number): bigint {
        if (n < this.first || n > this.last) {
            throw RangeError(
                `Cached: Index ${n} not in ${this.first}..${this.last}.`
            )
        }
        if (n <= this.lastCached) {
            return this.cache[n]
        }
        /* Check for a race condition: attempting to get a value while it's
           in the midst of being cached. It's also possible this could
           occur if a prior fillCache() threw an uncaught exception, for
           example.
         */
        if (this.lastCached != this.cachingTo) {
            throw Error(
                `Currently caching ${this.lastCached} to ${this.cachingTo}.`
            )
        }
        this.resizeCache(n)
        this.fillCache()
        return this.cache[n]
    }

    getFactors(n: number): Factorization {
        this.getElement(n) // fill the cache
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
}
