import type {Factorization, SequenceInterface} from './SequenceInterface'
import simpleFactor from './simpleFactor'

import {math} from '@/shared/math'
import type {ExtendedBigint} from '@/shared/math'
import {Paramable, paramClone} from '@/shared/Paramable'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

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

interface SequenceBounds {
    firstAvailable: ExtendedBigint
    lastAvailable: ExtendedBigint
}

const sequenceBounds = {
    firstAvailable: 0n,
    lastAvailable: 0n,
    validateBounds(n: ExtendedBigint, status: ValidationStatus) {
        // Will be called with the sequence as `this`:
        const {firstAvailable: first, lastAvailable: last} = this
        if (n < first) status.addError(`First index available is ${first}.`)
        if (n > last) status.addError(`Last index available is ${last}.`)
    },
    validateLength(len: ExtendedBigint, status: ValidationStatus) {
        let availLength = this.lastAvailable
        if (typeof availLength !== 'bigint') return
        if (typeof this.firstAvailable !== 'bigint') return
        availLength -= this.firstAvailable - 1n
        if (len > availLength) {
            status.addError(`There are only ${availLength} terms available.`)
        }
    },
}

// We document this using xmd tags, rather than md. That way, it does not
// generate its own documentation page, but instead can be extracted into
// all user-facing Sequence pages with the following markdown block:
// {! Cached.ts extract:
//    start: '^\s*[/]\*\*+\W?xmd\b' # Opening like /** xmd
//    stop: '^\s*(?:/\*\s*)?\*\*[/]\s*$' # closing comment with two *
// !}
const standardSequenceParameters = {
    /** xmd
-   **First index:** the first index of the sequence to use in visualization.
    Many sequences have a smallest available index; if so, that number will
    be the default value for thus parameter. Otherwise, the default will be
    zero.
    **/
    first: {
        default: 0n, // dummy value, will be replaced by firstAvailable
        type: ParamType.BIGINT,
        displayName: 'First index of sequence to use',
        required: false,
        validate: sequenceBounds.validateBounds,
    },
    /** xmd
-   **Last index:** the index of the last entry of the sequence to use in
    visualization. Similarly, many sequences have a largest available index,
    which will become the default value for this parameter. If not, the
    default is `Infinity`, which means that the visualizer may continue to
    request more and more terms indefinitely.
    **/
    last: {
        default: math.posInfinity as ExtendedBigint, // will be replaced
        // by lastAvailable if/when that is set
        type: ParamType.EXTENDED_BIGINT,
        displayName: 'Last index of sequence to use',
        required: false,
        validate: sequenceBounds.validateBounds,
    },
    /** xmd
-   **Number of terms:** the number of terms of the sequence to use in
    visualization. Of course, the number of terms must be the last index,
    minus the first index, plus one. So this parameter and the previous two
    can not actually be independently set. What will happen in practice is
    that changing any one of them will automatically change the value of
    one of the others to keep things consistent. The default value for
    this parameter is determined by the first and last index.
    **/
    length: {
        default: math.posInfinity as ExtendedBigint, // will be replaced
        // by lastAvailable - firstAvailable + 1 once those are known
        type: ParamType.EXTENDED_BIGINT,
        displayName: 'Number of terms of sequence to use',
        required: false,
        validate: sequenceBounds.validateLength,
    },
} satisfies GenericParamDescription

/**
 *
 * @class Cached
 * The concrete base class for all Sequence implementations, as the
 * infrastructure has come to rely on the caching mechanism and as it has
 * become the case that some sequences do not know their index bounds until
 * the first cache block fill.
 * This implementation provides a facility to cache pre-computed entries
 * in the sequence. As such, it handles the getElement() and getFactors()
 * methods of Sequence Interface, so that sequences classes that derive from
 * Cached can override just the (dummy) calculate() method supplied here,
 * and optionally the fallback factor() method, and the caching will
 * automatically occur. (Note that this default in-browser factorization is
 * only guaranteed to succeed up to absolute value 1,018,000.)
 *
 * To prevent bugs with sequences with non-deterministic formulae
 * (e.g. in Random.ts), Cached guarantees that calculate() will never be
 * called on the same input more than once, as certified by unit tests.
 *
 * Note that Cached is implemented as a class factory function, and generates
 * a specific Cached class from a parameter description. It adds standard
 * Sequence parameters first, last, and length to the supplied parameter
 * description, so that they will be handled uniformly across all Sequences.
 * Thus, derived classes should set the firstAvailable and lastAvailable
 * properties using the makeAvailable method, if they want different values from
 * the default (-Infinity, +Infinity).
 */
export function Cached<PD extends GenericParamDescription>(desc: PD) {
    const fullDesc = Object.assign(desc, standardSequenceParameters)
    const defaultObject = Object.fromEntries(
        Object.keys(fullDesc).map(param => [param, fullDesc[param].default])
    ) as ParamValues<typeof fullDesc>
    const Cached = class
        extends Paramable
        implements SequenceInterface, SequenceBounds
    {
        name = 'An uninitialized generic sequence'
        declare params: typeof fullDesc // Since Paramable is no longer ...
        // ... generic, we need to tell TypeScript what the (type of the)
        // params for this instantiation are.

        // Having to redeclare the following three common parameters is an
        // unfortunate side effect of removing the generic type parameter
        // to Paramable. But it only comes up here because this class
        // factory has standard parameters used by all derived implementations,
        // so it seemed like a small enough price to pay.
        first: bigint
        last: ExtendedBigint
        length: ExtendedBigint

        ready: boolean // protects against re-initialization
        // The cache should really be Record<bigint, bigint> but TypeScript
        // disallows that as of v. 5.4, even though JavaScript would have
        // no trouble with it. :-/
        cache: Record<string, bigint> = {}
        factorCache: Record<string, Factorization> = {}
        firstAvailable: ExtendedBigint = math.negInfinity
        lastAvailable: ExtendedBigint = math.posInfinity
        cacheBlock = 128n
        lastValueCached = -1024n // dummy value, must be replaced
        firstValueCached: ExtendedBigint = math.posInfinity
        lastFactorCached = -1024n // dummy value
        firstFactorCached: ExtendedBigint = math.posInfinity
        valueCachingPromise = Promise.resolve()
        factorCachingPromise = Promise.resolve()

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
        constructor() {
            super(paramClone(fullDesc)) // need to clone because
            // OEIS (at least) writes into its own param description
            this.ready = false
            // Even though TypeScript knows defaultObject has the following
            // three keys, the Object.assign below is not enough to avoid the
            // error that they must be assigned in the constructor #IhateTS
            this.first = defaultObject.first
            this.last = defaultObject.last
            this.length = defaultObject.length
            Object.assign(this, defaultObject)
        }

        initialize(): void {
            if (this.ready) return
            if (this.validationStatus.isValid()) {
                this.cache = {}
                this.factorCache = {}
                this.lastValueCached = this.first - 1n
                this.firstValueCached = math.posInfinity
                this.lastFactorCached = this.first - 1n
                this.firstFactorCached = math.posInfinity
                this.ready = true
                return
            }
            throw Error(
                'Sequence invalid. Run validate and address any errors.'
            )
        }

        makeAvailable(start: ExtendedBigint, end: ExtendedBigint): void {
            this.firstAvailable = start
            if (typeof start === 'bigint') {
                if (
                    this.first === this.params.first.default
                    || start > this.first
                ) {
                    this.first = start
                }
                this.params.first.default = start
                if (typeof end === 'bigint') {
                    this.params.length.default = end - start + 1n
                } else {
                    this.params.length.default = math.posInfinity
                }
            } else {
                if (typeof end === 'bigint') {
                    if (this.params.first.default > end) {
                        this.params.first.default = end - 1023n
                    }
                    this.params.length.default =
                        end - this.params.first.default
                } else this.params.length.default = math.posInfinity
            }
            this.lastAvailable = end
            this.params.last.default = end
            if (end < this.last) this.last = end
            if (typeof this.last === 'bigint') {
                this.length = math.bigmax(0n, this.last - this.first + 1n)
            } else this.length = math.posInfinity
            this.refreshParams()
        }

        async fill(
            n = this.lastValueCached + this.cacheBlock,
            what?: string
        ) {
            await this.cacheValues(n)
            if (what === 'factors') await this.cacheFactors(n)
        }

        newCacheSize(requestedIndex: bigint, lastCached: bigint): bigint {
            /* Returns the new limit for a cache size:
            We want to grab at least a whole cacheBlock, but we also want
            to grab more if we've already gotten a lot, and of course we
            need to grab enough to have the current requested index...
            */
            const currentCacheSize = lastCached - this.first + 1n
            let newLimit = math.bigmax(
                lastCached + this.cacheBlock,
                lastCached + currentCacheSize,
                requestedIndex + 1n
            )
            newLimit = math.bigmin(this.last, newLimit)
            return BigInt(newLimit)
        }

        async fillValueCache(n: bigint) {
            const start = this.lastValueCached + 1n
            for (let i = start; i <= n; i++) {
                const key = i.toString()
                // trust values we find; hopefully we have cleared when
                // needed, so that we can presume they are from some
                // earlier settings of the limits:
                if (!(key in this.cache)) {
                    this.cache[key] = this.calculate(i)
                }
                this.lastValueCached = i
            }
            if (start < this.firstValueCached) this.firstValueCached = start
        }

        async cacheValues(n: bigint) {
            // Let any existing value caching complete
            await this.valueCachingPromise
            if (n > this.lastValueCached) {
                this.valueCachingPromise = this.fillValueCache(n)
                await this.valueCachingPromise
            } else {
                this.valueCachingPromise = Promise.resolve()
            }
        }

        getElement(n: bigint): bigint {
            if (n < this.first || n > this.last) {
                throw RangeError(
                    `Cached: Index ${n} not in ${this.first}..${this.last}.`
                )
            }
            if (n <= this.lastValueCached) {
                return this.cache[n.toString()]
            }
            this.cacheValues(this.newCacheSize(n, this.lastValueCached))
            throw new CachingError(`Filling cache to get value at index ${n}`)
        }

        async fillFactorCache(n: bigint) {
            // Make sure we have all of the values we need:
            await this.cacheValues(n)
            const start = this.lastFactorCached + 1n
            for (let i = start; i <= n; ++i) {
                const key = i.toString()
                // trust values we find
                if (!(key in this.factorCache)) {
                    this.factorCache[key] = this.factor(i, this.getElement(i))
                }
                this.lastFactorCached = i
            }
            if (start < this.firstFactorCached) this.firstFactorCached = start
        }

        async cacheFactors(n: bigint) {
            // Let any existing factor caching complete
            await this.factorCachingPromise
            if (n <= this.last && n > this.lastFactorCached) {
                this.factorCachingPromise = this.fillFactorCache(n)
                await this.factorCachingPromise
            } else {
                this.factorCachingPromise = Promise.resolve()
            }
        }

        getFactors(n: bigint): Factorization {
            if (n < this.first || n > this.last) {
                throw RangeError(
                    `Cached: Index ${n} not in ${this.first}..${this.last}.`
                )
            }
            if (n <= this.lastFactorCached) {
                return this.factorCache[n.toString()]
            }
            this.cacheFactors(this.newCacheSize(n, this.lastFactorCached))
            throw new CachingError(`Factoring value at index ${n}.`)
        }

        /**
         * calculate produces the proper value of the sequence for a given index
         * This should be overridden in any derived class.
         * @param {number} n the index of the entry to calculate
         */
        calculate(n: bigint): bigint {
            return n
        }

        /**
         * factor produces the proper factorization of the sequence entry for
         * a given index. This default implementation uses trial division
         * in the browser and is only guaranteed to work up to 1009²-1. Note
         * it receives both the sequence index and the value of the entry.
         * @param {number} n  the index of the entry to factor
         * @param {bigint} value  the value of the entry to factor
         * @returns {Factorization} the factorization
         */
        factor(_n: bigint, v: bigint): Factorization {
            return simpleFactor(v)
        }

        /**
         * What happens on a parameter change depends on which parameter
         * changed. If it is one of the general subsequencing parameters,
         * change one of the other two to keep them consistent, and check
         * if the cache needs updating, but otherwise there's no need to
         * change the sequence.
         * On other parameter changes, we assume by default that the sequence
         * is now completely different. As a result, we want to reset the
         * cache and reinitialize the sequence so that every element is
         * recomputed when queried.
         */
        async parametersChanged(nameList: string[]) {
            await super.parametersChanged(nameList)
            let needsReset = false
            for (const name of nameList) {
                if (!(name in standardSequenceParameters)) {
                    needsReset = true
                    continue
                }
                if (name === 'first') {
                    // recompute last, leaving length
                    // unchanged if possible
                    if (typeof this.length === 'bigint') {
                        this.last = this.first + this.length - 1n
                        if (this.last > this.lastAvailable) {
                            this.last = BigInt(this.lastAvailable)
                            this.length = math.bigmax(
                                this.last - this.first + 1n,
                                0n
                            )
                        }
                    }
                    // See if we need to rebase the cache
                    // We have to assume that cache coverage may be
                    // patchy; all we can rely on is that the closed
                    // interval from the _previous_ value of `this.first`
                    // to `this.lastValueCached` is full.
                    if (
                        this.first < this.firstValueCached
                        || this.first > this.lastValueCached + 1n
                    ) {
                        await this.valueCachingPromise
                        this.firstValueCached = math.posInfinity
                        this.lastValueCached = this.first - 1n
                        // Get the new cache rolling:
                        this.cacheValues(this.first + this.cacheBlock)
                    }
                    // And then ditto for factoring. Here we will not
                    // kick off the factoring process because we don't
                    // even know if this sequence is being factored.
                    if (
                        this.first < this.firstFactorCached
                        || this.first > this.lastFactorCached + 1n
                    ) {
                        await this.factorCachingPromise
                        this.firstFactorCached = math.posInfinity
                        this.lastFactorCached = this.first - 1n
                    }
                } else if (name === 'last') {
                    // recompute length
                    if (typeof this.last === 'bigint') {
                        this.length = math.bigmax(
                            this.last - this.first + 1n,
                            0n
                        )
                    } else this.length = math.posInfinity
                } else if (name === 'length') {
                    // recompute last
                    if (typeof this.length === 'bigint') {
                        this.last = this.first + this.length - 1n
                        if (this.last > this.lastAvailable) {
                            this.last = this.lastAvailable
                            //TODO: we are not supposed to change length,
                            //but it is inconsistent. What should be do?
                        }
                    } else if (this.lastAvailable === math.posInfinity) {
                        this.last = math.posInfinity
                    } else {
                        this.last = this.lastAvailable
                        //TODO: similarly we should warn here or something
                    }
                }
                this.refreshParams()
            }
            if (needsReset) {
                this.ready = false
                await this.valueCachingPromise
                await this.factorCachingPromise
                this.initialize()
            }
        }
    }

    return Cached as unknown as new (
        first?: number,
        last?: number,
        cacheBlock?: number
    ) => InstanceType<typeof Cached> & ParamValues<typeof fullDesc>
}
