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
    name = 'Base';
    description = 'A Base sequence class';
    params: SequenceParamsSchema[] = [new SequenceParamsSchema('name', '', 'displayName', false, '0')];
    ready: boolean;
    isValid: boolean;

    protected settings: { [key: string]: string|number|boolean} = {};

    constructor(ID: number) {
        this.ID = ID;
        this.ready = false;
        this.isValid = false;
    }

    /**
     * initialize() provides an opportunity to do pre-computation
     * before any elements are requested; for a generic sequence there
     * is not necessarily any way to do this.
     */
    initialize(): void {
        if (this.ready) return;
        if (this.isValid) {
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
    getElement(n: number): number {
        return n;
    }

    /**
     * Moves the parameter values to the sequence settings,
     * and checks that the resulting settings are acceptable.
     * Once this is completed, if it returns a true ValidationStatus,
     * the sequence has enough information to begin generating sequence members.
     */
    validate(): ValidationStatus {
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
