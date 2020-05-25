import { SequenceParamsSchema, SequenceError, GeneratorSettings, SequenceInterface } from './sequenceInterface'
/**
 *
 * @class SequenceClassDefault
 * a minimium working example of a sequence class that implements the interface
 * Can be used as a base class for your own sequences.
 * 
 */
export class SequenceClassDefault implements SequenceInterface{
    ID: number;
    cache: number[];
    newSize: number;
    finite: boolean;
    name = 'Base';
    description = '';
    sequenceParams: SequenceParamsSchema[] = [new SequenceParamsSchema()];
    generatorSettings: GeneratorSettings = {};
    ready: boolean;
    generator: (() => number) | ((n: number) => number) = () => 0;

    /**
     *Creates an instance of SequenceGenerator.
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    constructor(ID: number, finite?: boolean) {
        this.ID = ID;
        this.cache = [];
        this.newSize = 1;
        this.finite = finite || true;
        this.ready = false;
    }

    /**
     * Sets the sequence parameters based on the user input, constrained by the 
     * paramSchema settings that were passed to the UI and returned.
     * Once this is completed, the sequence has enough information to begin generating sequence members.
     * @param paramsFromUser user settings for the sequence passed from the UI
     */
    initialize(paramsFromUser: SequenceParamsSchema[]) {
        paramsFromUser.forEach(param => {
            this.generatorSettings[param.name] = param.value;
        });
        this.generator = function() {return 0};
        this.ready = true;
    }
            
    resizeCache(n: number) {
        this.newSize = this.cache.length * 2;
        if (n + 1 > this.newSize) {
            this.newSize = n + 1;
        }
    }

    fillCache() {
        for (let i: number = this.cache.length; i < this.newSize; i++) {
            this.cache[i] = this.generator(i);
        }
    }
    /** 
     * getElement is how sequences provide their callers with elements.
     */
    getElement(n: number) {
        if(!this.ready) 
            return new SequenceError('The sequence is not initialized. Please select all required settings and initialize the sequence.');

        if (this.cache[n] != undefined || this.finite) {
            return this.cache[n];
        } else {
            this.resizeCache(n);
            this.fillCache();
            return this.cache[n];
        }
    }
}
