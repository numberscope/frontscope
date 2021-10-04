import {ValidationStatus} from '@/shared/ValidationStatus';

export class SequenceParamsSchema {
    name: string;
    type: string;
    displayName: string;
    required: boolean;
    value: string | boolean | number;

    constructor(
        name: string, 
        type: string, 
        displayName: string, 
        required: boolean,
        defaultValue?: string | boolean | number
        ) {
            this.name = name || '';
            this.type = type || '';
            this.displayName = displayName || '';
            this.required = required || false;
            this.value = defaultValue || '';
    }
}

/**
 * Interface for Sequence classes.
 * Every sequence class must implement these properties and functions to be compatible
 * with Numberscope.
 */
export interface SequenceInterface {
    ID: number;
    name: string;
    description: string;
    params: SequenceParamsSchema[];

    /**
     * Initialize is called after params are set. It allows us to wait until all the settings
     * are selected by the user before we actually build the cache.
     * Generally this is where you will set the generator function, since it relies on the initialization of the 
     * generator settings from sequenceParams.
     * @param {SequenceParamsSchema} params the parameters schema settings selected by the user
     */
    initialize(): void;

    /**
     * Get element is what the drawing tools will be calling, it retrieves
     * the nth element of the sequence by either getting it from the cache
     * or if isn't present, by building the cache and then getting it
     * @param {*} n the index of the element in the sequence we want
     * @returns a number
     * @memberof SequenceGenerator
     */
    getElement(n: number): number;

    validate(): ValidationStatus;
}

interface SequenceConstructor {
    new (ID: number): SequenceInterface;
}

export class SequenceExportModule{
    sequence: SequenceConstructor
    name: string;
    isOeis = false;

    constructor(sequence: SequenceConstructor,
                name: string,
                isOeis = false) {
        this.sequence = sequence;
        this.name = name;
        this.isOeis = isOeis;
    }
}
