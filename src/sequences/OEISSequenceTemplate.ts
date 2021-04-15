import { SequenceParamsSchema, SequenceInterface } from './SequenceInterface'
import { ValidationStatus } from '@/shared/ValidationStatus';
import axios from 'axios'
/**
 *
 * @class SequenceGetter
 * a wrapper for getting sequences from the FlaskBackend
 * 
 */
export default class OEISSequenceTemplate implements SequenceInterface{
    ID: number;
    cache: number[];
    finite: boolean;
    name = 'Getter';
    description = '';
    oeisSeq = true;
    params: SequenceParamsSchema[] = [
        new SequenceParamsSchema('oeisId', 'text', 'OEIS ID', false, false),
        new SequenceParamsSchema('name', 'text', 'Name', false, false),
        new SequenceParamsSchema('numElements', 'number', 'Number of Elements (leave blank to fetch up to first 1000)', false, false)
    ];
    private settings: {[key: string]: number | string | boolean } = {};
    private ready: boolean;
    private isValid = false;

    /**
     * constructor
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    constructor(ID: number, finite?: boolean) {
        this.ID = ID;
        this.cache = [];
        this.finite = finite || true;
        this.ready = false;
    }

    populate() {
        console.log("populating");
        if(this.isValid){
            const elementsToFetch = this.settings.num_elements ? this.settings.num_elements : 1000;
            axios.get(`http://localhost:5000/api/get_oeis_sequence/${this.settings.oeisId}/${elementsToFetch}`)
                .then( resp => {
                    this.cache = resp.data.values;
                    this.ready = true;
                    return;
                });
        } else {
            throw "Sequence is not valid. Run validate and resolve any errors."
        }

    }
    initialize(){
        if(this.isValid){
            this.ready = true;
            return;
        } else {
            throw "Sequence is not valid. Run validate() and address any errors."
        }
    }

    validate() {
		this.params.forEach(param => {
            this.settings[param.name] = param.value;
		});

        if(this.settings['oeisId'] !== undefined) {
            this.isValid = true;
            return new ValidationStatus(true);
        } else {
            return new ValidationStatus(false, ["oeisID paramter is missing"]);
        }
    }
    /** 
     * getElement is how sequences provide their callers with elements.
     */
    getElement(n: number) {
        console.log('element requested')
        console.log('return el' + this.cache[n]);
        return this.cache[n];
    }
}
