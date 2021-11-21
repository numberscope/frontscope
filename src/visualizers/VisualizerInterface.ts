import { SequenceInterface } from '@/sequences/SequenceInterface';
import { ValidationStatus } from '@/shared/ValidationStatus';
import { ParamType } from '@/shared/ParamType';
import p5 from 'p5';

interface VisualizerConstructor {
  new (): VisualizerInterface;
}

export class VisualizerExportModule {
    name: string;
    description: string;
    visualizer: VisualizerConstructor;

    constructor(name: string, viz: VisualizerConstructor, description?: string,){
        this.name = name;
        this.visualizer = viz;
        this.description = description || '';
    }
}


export class VisualizerParamsSchema {
    name: string;
    type: ParamType;
    displayName: string;
    required: boolean;
    value: string | boolean | number;
	description?: string;

    constructor(
        name?: string, 
        type?: ParamType, 
        displayName?: string, 
        required?: boolean,
		defaultValue?: string | boolean | number,
		description?: string
        ) {
            this.name = name || '';
            this.type = type || ParamType.text;
            this.displayName = displayName || '';
            this.required = required || false;
			this.value = defaultValue || '';
			this.description = description || '';
    }
}


export interface VisualizerSettings {
	[key: string]: string | number | bigint | boolean;
}

export interface VisualizerInterface {

    isValid: boolean;
    /**
     * The parameters for the visualizer to initialize.
     * In addition to providing the information in the schema, 
     * these will be used as default params in the event the user does not specify any.
     */
    params: VisualizerParamsSchema[];
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
