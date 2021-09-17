import { SequenceParamsSchema, SequenceInterface } from './SequenceInterface'
import { ValidationStatus } from '@/shared/ValidationStatus';
/**
 *
 * @class SequenceClassDefault
 * a minimium working example of a sequence class that implements the interface
 * Can be used as a base class for your own sequences.
 * 
 */
export class SequenceClassDefault implements SequenceInterface {
    ID: number;
    cache: number[];
    finite: boolean;
    name = 'Base';
    description = 'A Base sequence class';
    params: SequenceParamsSchema[] = [new SequenceParamsSchema('name', '', 'displayName', false, '0')];
    ready: boolean;
    isValid: boolean;

    private settings: { [key: string]: string|number|boolean} = {};

    constructor(ID: number, finite?: boolean) {
        this.ID = ID;
        this.cache = [];
        this.finite = finite || true;
        this.ready = false;
        this.isValid = false;
    }

    /**
     * Sets the sequence parameters based on the user input, constrained by the 
     * paramSchema settings that were passed to the UI and returned.
     * Once this is completed, the sequence has enough information to begin generating sequence members.
     * @param paramsFromUser user settings for the sequence passed from the UI
     */
    initialize(){
        if(this.isValid) {
            this.ready = true;
            return
        } else {
            throw "Sequence is not valid. Run validate() and address any errors."
        }
    }
            
    /** 
     * getElement is how sequences provide their callers with elements.
     * @param n the sequence number to get
     */
    getElement(n: number) {
        return n * 0;
    }

    validate() {
		this.params.forEach(param => {
            this.settings[param.name] = param.value;
		});

        if(this.settings['name'] !== undefined) {
            this.isValid = true;
            return new ValidationStatus(true);
        }
        
        return new ValidationStatus(true, ["name param is undefined."]);
    }
}