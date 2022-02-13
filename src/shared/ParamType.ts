export interface ParamInterface {
    /* value: any type. The UI will determine what sort of control to use
     * from the type of the value property of each param (a checkbox
     * for boolean, textbox for string, etc.) (Note the actual type
     * may be overriden by the forceType property below.)
     * Simultaneously the initial contents of the `value` property gives
     * the default for this parameter.
     */
    forceType?: string // UI should treat as this type regardless of actual type
    from?: {[key: string]: number} // obj-as-const enum from which value comes
    displayName: string // the main label of the control for this param
    required: boolean // whether the parameter must be specified
    visibleDependency?: string // Only visible when this param has value:::
    // visibleValue: any
    description?: string // additional explanation text to display
}

export enum ParamType {
    number = 'number',
    text = 'text',
    boolean = 'boolean',
}
