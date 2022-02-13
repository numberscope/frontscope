import {SequenceInterface} from '@/sequences/SequenceInterface'
import {ValidationStatus} from '@/shared/ValidationStatus'
import {ParamInterface, ParamType} from '@/shared/ParamType'
import p5 from 'p5'

interface VisualizerConstructor {
    new (): VisualizerInterface
}

export class VisualizerExportModule {
    name: string
    description: string
    visualizer: VisualizerConstructor

    constructor(
        name: string,
        viz: VisualizerConstructor,
        description?: string
    ) {
        this.name = name
        this.visualizer = viz
        this.description = description || ''
    }
}

export class VisualizerParamsSchema {
    name: string
    type: ParamType
    displayName: string
    required: boolean
    value: string | boolean | number
    description?: string

    constructor(
        name?: string,
        type?: ParamType,
        displayName?: string,
        required?: boolean,
        defaultValue?: string | boolean | number,
        description?: string
    ) {
        this.name = name || ''
        this.type = type || ParamType.text
        this.displayName = displayName || ''
        this.required = required || false
        this.value = defaultValue || ''
        this.description = description || ''
    }
}

export interface VisualizerSettings {
    [key: string]: string | number | boolean
}

export interface VisualizerInterface {
    isValid: boolean
    /**
     * params determines the parameters that will be settable via the
     * user interface. The value of each key should be a property of the
     * visualizer implementation. The value of each of these properties
     * should be an object (so that it can be passed by reference to the UI
     * for setting); the keys of each such object should be as described
     * in the ParamInterface source.
     */
    params: {[key: string]: ParamInterface}
    /**
     * A sequence instance that fulfills the sequence interface.
     */
    seq: SequenceInterface
    /**
     * A p5 sketch instance.
     */
    sketch: p5
    /**
     * Validates the configuration
     * @returns {ValidationStatus}
     *     whether the validation succeeded, along with any messages if not
     */
    validate(): ValidationStatus
    /**
     * Initialize is simply applying the validated configuration params to the
     * visualizer to prepare it to draw.
     * @param sketch The p5 instance the visualizer will draw on
     * @param seq The Sequence object supplying sequence values
     */
    initialize(sketch: p5, seq: SequenceInterface): void
    /**
     * Sets up the p5 canvas.
     */
    setup(): void
    /**
     * Draws the sequence through the visualizer into the p5 canvas.
     */
    draw(): void
}
