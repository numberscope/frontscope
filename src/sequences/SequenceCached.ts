import { SequenceClassDefault } from './SequenceClassDefault';

const min = Math.min;
const max = Math.max;

/**
 *
 * @class SequenceCached
 * extends the sequenceClassDefault with a facility to cache pre-computed
 * entries in the sequence. Sequences may derive from it and override just
 * the (dummy) calculate() method supplied here, and the caching will
 * automatically occur.
 *
 * Note: to prevent bugs with sequences with non-deterministic formulae
 * (e.g. in SequenceRandom.ts), this class should guarantee that
 * calculate() will never be called on the same input more than once.
 *
 */
export class SequenceCached extends SequenceClassDefault {
    name = 'Cached Base';
    description = 'A base class for cached sequences';
    protected cache: bigint[] = [];
    protected lastCached: number;
    protected cachingTo: number;
    protected blocksize: number;

    /**
     *Creates an instance of SequenceCached.
     * @param {*} ID the ID of the sequence
     * @param {number} first specifies the smallest valid index of the series; defaults to 0
     * @param {number} last specifies the largest valid index of the series; defaults to Infinity.
     * @param {number} blocksize specifies how many values to put in cache at each additonal fill; defaults to 128.
     */
    constructor (ID: number,
                 first?: number, last?: number, blocksize?:number) {
        super(ID);
        this.first = first ?? 0;
        this.last = last ?? Infinity;
        this.blocksize = blocksize ?? 128;
        this.lastCached = this.first - 1;
        this.cachingTo = this.lastCached;
    }

    initialize(): void {
        if (this.ready) return;
        super.initialize();
        this.ready = false;
        this.cachingTo = min(this.lastCached + this.blocksize, this.last);
        this.fillCache();
        this.ready = true;
    }

    resizeCache(n: number): void {
        this.cachingTo = max(this.lastCached + this.blocksize,
                             2*this.lastCached, n+1)
        if (this.cachingTo > this.last) this.cachingTo = this.last;
    }

    fillCache(): void {
        for (let i: number = this.lastCached+1; i <= this.cachingTo; i++) {
            this.cache[i] = this.calculate(i);
            this.lastCached = i;
        }
    }

    getElement(n: number): bigint {
        if (n < this.first || n > this.last) {
            throw RangeError(
                `Cached: Index ${n} not in ${this.first}..${this.last}.`);
        }
        if (n <= this.lastCached) {
            return this.cache[n];
        }
        /* Check for a race condition: attempting to get a value while it's
           in the midst of being cached. It's also possible this could
           occur if a prior fillCache() threw an uncaught exception, for
           example.
         */
        if (this.lastCached != this.cachingTo) {
            throw Error(
                `Currently caching ${this.lastCached} to ${this.cachingTo}.`);
        }
        this.resizeCache(n);
        this.fillCache();
        return this.cache[n];
    }

    /**
     * calculate produces the proper value of the sequence for a given index
     * This should be overridden in any derived class.
     * @param {number} n the index of the entry to calculate
     */
    calculate(n: number): bigint {
        return BigInt(n);
    }
}
