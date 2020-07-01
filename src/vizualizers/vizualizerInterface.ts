import { SequenceInterface } from '@/sequences/sequenceInterface';
import { ValidationStatus } from '@/shared/validationStatus';
import p5 from 'p5';

export class VizualizerExportModule {
    name: string;
    description: string;
    vizualizer: Function;

    constructor(name: string, viz: Function, description?: string,){
        this.name = name;
        this.vizualizer = viz;
        this.description = description || '';
    }
}

export class VizualizerParamsSchema {
    name: string;
    type: string;
    displayName: string;
    required: boolean;
    value: string | boolean | number;
	description?: string;

    constructor(
        name?: string, 
        type?: string, 
        displayName?: string, 
        required?: boolean,
		defaultValue?: string | boolean | number,
		description?: string
        ) {
            this.name = name || '';
            this.type = type || '';
            this.displayName = displayName || '';
            this.required = required || false;
			this.value = defaultValue || '';
			this.description = description || '';
    }
}

export interface VizualizerSettings {
	[key: string]: string | number | boolean;
}

export interface VizualizerInterface {
    isValid: boolean;
    /**
     * The parameters for the vizualizer to initialize.
     * In addition to providing the information in the schema, 
     * these will be used as default params in the event the user does not specify any.
     */
    params: VizualizerParamsSchema[];
    /**
     * A sequence instance that fulfills the sequence interface.
     */
    seq: SequenceInterface;
    /**
     * A p5 sketch instance.
     */
    sketch: p5;
    /**
     * Intialize is simply applying the configuration params to the vizualizer to prepare it to draw. 
     * @param config User set configuration settings. Generally if none are provided, the Vizualizer should use its own default
     */
    initialize(sketch: p5, seq: SequenceInterface): void;
    /**
     * Validates the cinfiguration
     */
    validate(): ValidationStatus;
    /**
     * Sets up the p5 canvas.
     */
    setup(): void;
    /**
     * Draws the sequence through the vizualizer into the p5 canvas.
     */
    draw(): void;
}
