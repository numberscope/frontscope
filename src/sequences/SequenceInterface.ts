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
     * getElement is what the drawing tools will be calling. It retrieves
     * the nth element of the sequence; if there is no such element (i.e., the
     * sequence has no nth term), it returns "undefined." The latter value is
     * chosen because narrowing the type away from undefined is probably just
     * a bit easier in TypeScript.
     * @param {*} n the index of the element in the sequence we want
     * @returns a number
     * @memberof SequenceGenerator
     */
    getElement(n: number): bigint | undefined;

    validate(): ValidationStatus;
}

export interface SequenceConstructor {
    new (ID: number): SequenceInterface;
}

/**
 *
 * @enum SequenceExportKind
 * A collection of constant values to select among different kinds of
 * buttons that can appear in the SequenceMenu. Each SequenceExportModule
 * corresponds to such a button and must have one of these kinds.
 *
 */
export enum SequenceExportKind {
    GETTER,  // Produces new INSTANCES for the SequenceMenu; always
             // listed at the bottom of the SequenceMenu
    FAMILY,  // A single entry in the SequenceMenu that needs parameters
             // whenever used
    INSTANCE // A single sequence in the SequenceMenu, added by a FACTORY
}
/**
 *
 * @class SequenceExportModule
 * A lightweight container for an entry in the list of sequences in the
 * menu on the main tool. If the kind is GETTER or FAMILY it holds a
 * sequence constructor and if it is an INSTANCE then it holds one
 * specific sequence.
 *
 * The difference between a GETTER and a FAMILY is that the former creates
 * a new INSTANCE selector in the menu, whereas the former starts out in the
 * menu and you fill out the parameters each time you use it.
 *
 */
export class SequenceExportModule{
    constructorOrSequence: SequenceConstructor|SequenceInterface;
    name: string;
    kind: SequenceExportKind;

    constructor(sequence: SequenceConstructor|SequenceInterface,
                name: string,
                kind: SequenceExportKind) {
        this.constructorOrSequence = sequence;
        this.name = name;
        this.kind = kind;
    }
}
