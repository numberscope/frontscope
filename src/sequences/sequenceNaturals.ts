import { SequenceClassDefault } from './sequenceClassDefault';
import { SequenceParamsSchema, SequenceExportModule} from './sequenceInterface';
/**
 *
 * @class SequenceClassNaturals
 * extends the sequenceClassDefault, by setting params and some custom implementation
 * for the generator and the fillCache function.
 */
class SequenceNaturals extends SequenceClassDefault{
    name = "Natural Numbers";
    description = "A sequence of the natural numbers";
    paramsSchema: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'includeZero',
        'boolean',
        'Include Zero',
        false,
        false 
    )];

    /**
     *Creates an instance of SequenceGenerator.
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    constructor (ID: number, finite?: boolean) {
        super(ID, finite);
    }

    initialize(paramsFromUser?: SequenceParamsSchema[]) {
        if(paramsFromUser){
            paramsFromUser.forEach(param => {
                this.generatorSettings[param.name] = param.value;
            });    
        }
        this.generator = function(n: number) {
            if (this.generatorSettings['includeZero']) return n+1 ;
            else return n ;
        }
        this.ready = true;
        this.newSize = 100;
        this.fillCache();
    }

    fillCache() {
        for (let i = this.cache.length; i < this.newSize; i++) {
            //the generator is given the cache since it would make computation more efficient sometimes
            //but the generator doesn't necessarily need to take more than one argument.
            this.cache[i] = this.generator(i);
        }
        console.log(this.cache);
    }
}

export const exportModule = new SequenceExportModule(
    SequenceNaturals,
    "Natural Numbers"
);
