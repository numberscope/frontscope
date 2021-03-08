import { SequenceInterface } from '@/sequences/sequenceInterface';
import { ValidationStatus } from '@/shared/validationStatus';
import p5 from 'p5';

export class visualizerExportModule {
    name: string;
    description: string;
    visualizer: Function;

    constructor(name: string, viz: Function, description?: string,){
        this.name = name;
        this.visualizer = viz;
        this.description = description || '';
    }
}

export class visualizerParamsSchema {
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

export interface visualizerSettings {
	[key: string]: string | number | boolean;
}

export interface visualizerInterface {
    isValid: boolean;
    /**
     * The parameters for the visualizer to initialize.
     * In addition to providing the information in the schema, 
     * these will be used as default params in the event the user does not specify any.
     */
    params: visualizerParamsSchema[];
    /**
     * A sequence instance that fulfills the sequence interface.
     */
    seq: SequenceInterface;
    /**
     * A p5 sketch instance.
     */
    sketch: p5;
    /**
     * Intialize is simply applying the configuration params to the visualizer to prepare it to draw. 
     * @param config User set configuration settings. Generally if none are provided, the visualizer should use its own default
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
     * Draws the sequence through the visualizer into the p5 canvas.
     */
    draw(): void;
}
