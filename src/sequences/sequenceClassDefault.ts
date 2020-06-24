import { SequenceParamsSchema, SequenceInterface } from './sequenceInterface'
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
    private settings: { [key: string]: string|number|boolean} = {};
    ready: boolean;

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
    initialize(config: SequenceParamsSchema[]) {
		config = config !== undefined ? config : this.params;

		config.forEach(param => {
            this.settings[param.name] = param.value;
		});

        this.ready = true;
    }
            
    /** 
     * getElement is how sequences provide their callers with elements.
     */
    getElement(n: number) {
        return n * 0;
    }
}
