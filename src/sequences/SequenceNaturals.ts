import { SequenceParamsSchema, SequenceExportModule, SequenceInterface } from './SequenceInterface';
import {ValidationStatus} from '@/shared/ValidationStatus';

/**
 *
 * @class SequenceClassNaturals
 * extends the sequenceClassDefault, by setting params and some custom implementation
 * for the generator and the fillCache function.
 */
class SequenceNaturals implements SequenceInterface{
    ID: number;
    name = "Natural Numbers";
    description = "A sequence of the natural numbers";
    params: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'includeZero',
        'boolean',
        'Include Zero',
        false,
        false
    )];
    finite: boolean|undefined = false;
    private ready = false;
    private settings: { [key: string]: string|number|boolean} = {};
    private generator: ((n: number) => number);
    private cache: number[];
    private newSize = 1;
    private isValid = false;

    /**
     *Creates an instance of SequenceGenerator.
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    constructor (ID: number, finite?: boolean) {
        this.ID = ID;
        this.finite = finite;
        this.cache = [];
        this.generator = function(n: number) {
            if (this.settings['includeZero']) return n+1 ;
            else return n ;
        }
    }

    initialize() {
        if(this.isValid){
            this.newSize = 100;
            this.fillCache();
            this.ready = true;
            return;
        }

        throw "Sequence is not valid. Run validate and address any errors."
    }

    validate(){
		this.params.forEach(param => {
            this.settings[param.name] = param.value;
		});

        if(this.settings['includeZero'] !== undefined) {
            this.isValid = true;
            return new ValidationStatus(true);
        } else {
            return new ValidationStatus(false, ["includeZero  param is missing"]);
        }
        
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
    getElement(n: number){
        if (this.cache[n] != undefined || this.finite) {
            return this.cache[n];
        } else {
            this.resizeCache(n);
            this.fillCache();
            return this.cache[n];
        }
    }

}

export const exportModule = new SequenceExportModule(
    SequenceNaturals,
    "Natural Numbers"
);