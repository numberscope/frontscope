import { SequenceClassDefault } from './SequenceClassDefault';

/**
 *
 * @class SequenceCached
 * extends the sequenceClassDefault with a facility to cache pre-computed
 * entries in the sequence. Intended as a base class for sequence
 * implementations that want to cache their entries. Derived classes
 * just need to override the calculate() method.
 */
export class SequenceCached extends SequenceClassDefault {
    name = 'Cached Base';
    description = 'A base class for cached sequences';
    entries = 0;
    protected cache: bigint[];
    protected newSize = 1;

    /**
     *Creates an instance of SequenceCached.
     * @param {*} ID the ID of the sequence
     * @param {number} max_entries specifies the maximum number of entries. Defaults to 0, which means no maximum, if not given.
     */
    constructor (ID: number, max_entries?: number) {
        super(ID);
	if (max_entries !== undefined) {
            this.entries = max_entries;
	}
        this.cache = [];
    }

    initialize(): void {
        if (this.ready) return;
        if (this.isValid) {
            if (this.entries > 0) {
                this.newSize = this.entries;
		if (this.newSize > 100) this.newSize = 100;
            } else {
                this.newSize = 100;
            }
            this.fillCache();
            this.ready = true;
            return;
        }

        throw "Sequence is not valid. Run validate and address any errors."
    }

    resizeCache(n: number): void {
        this.newSize = this.cache.length * 2;
        if (this.newSize < 100) {
            this.newSize = 100;
        }
        if (n + 1 > this.newSize) {
            this.newSize = n + 1;
        }
	if (this.entries > 0 && this.newSize > this.entries) {
            this.newSize = this.entries;
        }
    }

    fillCache(): void {
        for (let i: number = this.cache.length; i < this.newSize; i++) {
            const val = this.calculate(i);
            /* Would be type error to store in cache if undefined */
            if (typeof val !== 'undefined') this.cache[i] = val;
        }
    }

    getElement(n: number): bigint | undefined {
        if (this.entries > 0 && n >= this.entries) {
            return;
        }
        if (n >= this.cache.length) {
            this.resizeCache(n);
            if (this.newSize > this.cache.length) {
                this.fillCache();
            }
	}
        return this.cache[n];
    }

    /**
     * calculate produces the proper value of the sequence for a given index
     * @param {number} n the index of the entry to calculate
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    calculate(n: number): bigint | undefined {
        return;
    }
}
