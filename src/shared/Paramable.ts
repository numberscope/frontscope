import {ValidationStatus} from './ValidationStatus'
export interface ParamInterface {
    /* value: any type. The UI will determine what sort of control to use
     * from the type of the value property of each param (a checkbox
     * for boolean, textbox for string, etc.) (Note the actual type
     * may be overriden by the forceType property below.)
     * Simultaneously the initial contents of the `value` property gives
     * the default for this parameter.
     */
    value: unknown
    forceType?: string // UI should treat as this type regardless of actual type
    from?: {[key: string]: number | string} // enum from which value comes
    displayName: string // the main label of the control for this param
    required: boolean // whether the parameter must be specified
    visibleDependency?: string // Only visible when this param has value:::
    // visibleValue: any
    description?: string // additional explanation text to display
    indent?: number // if specified as 1 or 2, indent this one that many em
}

export interface ParamableInterface {
    name: string
    description: string
    /**
     * params determines the parameters that will be settable via the
     * user interface. Each key should match a top-level property name of the
     * paramable object, and the values should be objects implementing the
     * the ParamInterface as described above.
     */
    params: {[key: string]: ParamInterface}

    /**
     * validate is called as soon as the user has set the values of the
     * parameters. It should check that all of the parameters are sensible
     * (properly formatted, in range, etc). When validation succeeds,
     * it's an appropriate opportunity to assignParameters()
     * @returns {ValidationStatus}
     *     whether the validation succeeded, along with any messages if not
     */
    validate(): ValidationStatus

    /**
     * assignParameters() should copy the value property of each item in
     * params to its proper place to be used in the implementing object.
     * (Typically, to top-level properties of the object.) The reason that
     * implementations should not used the values directly from the params
     * object is that they should only be used in a state when validate()
     * is succeeding.
     */
    assignParameters(): void

    /**
     * refreshParams() should copy the current working values of all of the
     * params back into the value properties in the params object, in case
     * they have changed. This way the true current values can be
     * represented in the UI presenting the params.
     */
    refreshParams(): void
}

/**
 * @class Paramable
 * a generic implementation of a class with parameters to be exposed in the UI
 * Designed to be used as a common base class for such classes.
 */
export class Paramable implements ParamableInterface {
    name = 'Paramable'
    description = 'A class which can have parameters set'
    params: {[key: string]: ParamInterface} = {}
    isValid: boolean

    constructor() {
        this.isValid = false
    }
    /**
     * All implementations based on this default delegate the checking of
     * parameters to the checkParameters() method.
     * That leaves the required validate() method to just call checkParameters
     * and set the isValid property based on the result. Also, if the
     * parameters are valid, it calls assignParameters to copy them into
     * top-level properties of the Sequence implementation. validate() should
     * generally not need to be overridden or extended; extend
     * checkParameters() instead.
     */
    validate(): ValidationStatus {
        const status = this.checkParameters()
        this.isValid = status.isValid
        if (this.isValid) {
            this.assignParameters()
        }
        return status
    }
    /**
     * checkParameters should check that all parameters are well-formed,
     * in-range, etc.
     * @returns {ValidationStatus}
     */
    checkParameters(): ValidationStatus {
        return new ValidationStatus(true)
    }
    /**
     * assignParameters() copies parameters into top-level properties. It
     * should not generally need to be overridden or extended, and it should
     * only be called when isValid is true.
     */
    assignParameters(): void {
        for (const prop in this.params) {
            if (!Object.prototype.hasOwnProperty.call(this, prop)) continue
            const param = this.params[prop].value
            const paramType = typeof param
            const me = this as Record<string, unknown>
            const myType = typeof me[prop]
            if (paramType === myType) {
                me[prop] = this.params[prop].value
            } else if (myType === 'number' && param === '') {
                me[prop] = 0
            } else {
                throw Error(
                    `figure out ${this.params[prop].value} (`
                        + `${typeof this.params[prop].value}) `
                        + `to ${typeof me[prop]}`
                )
            }
        }
    }
    /**
     * refreshParams() copies the current values of top-level properties into
     * the params object. It should not generally need to be overridden or
     * extended. However, it is (currently) never called automatically; it
     * should be called whenever implementation code changes the working values,
     * to keep the values reflected correctly in the UI.
     */
    refreshParams(): void {
        const me = this as Record<string, unknown>
        for (const prop in this.params) {
            if (!Object.prototype.hasOwnProperty.call(this, prop)) continue
            this.params[prop].value = me[prop]
        }
    }
}
