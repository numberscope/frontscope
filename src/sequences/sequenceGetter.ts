import { SequenceParamsSchema, GeneratorSettings, SequenceInterface } from './sequenceInterface'
import axios from 'axios'
/**
 *
 * @class SequenceGetter
 * a wrapper for getting sequences from the FlaskBackend
 * 
 */
export class SequenceGetter implements SequenceInterface{
    ID: number;
    cache: number[];
    finite: boolean;
    name = 'Getter';
    description = '';
    sequenceParams: SequenceParamsSchema[] = [new SequenceParamsSchema('name', '', '', false, '')];
    generatorSettings: GeneratorSettings = {};
    ready: boolean;

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

    /**
     * Sets the sequence parameters based on the user input, constrained by the 
     * paramSchema settings that were passed to the UI and returned.
     * Once this is completed, the sequence has enough information to begin generating sequence members.
     * @param paramsFromUser user settings for the sequence passed from the UI
     */
    initialize(paramsFromUser?: SequenceParamsSchema[]) {
        if(paramsFromUser){
            paramsFromUser.forEach(param => {
                this.generatorSettings[param.name] = param.value;
            });
        }
        axios.get('http://localhost:5000/seqnaturals')
            .then( resp => {
                console.log(resp)
                //self.cache = resp;
                this.ready = true;
                return;
            });
    }
    /** 
     * getElement is how sequences provide their callers with elements.
     */
    getElement(n: number) {
        return this.cache[n];
    }
}
