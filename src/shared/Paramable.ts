import {ValidationStatus} from './ValidationStatus'
/**
 * The following collection of properties specifies how a given parameter
 * should be displayed in the user interface (UI), and provides a location
 * for communicating tentative values of the parameter back to the
 * implementation.
 */
export interface ParamInterface {
    /* The value property is the primary one, and may be of any type.
     * The UI will determine what sort of control to use
     * from the type of the value property of each param (a checkbox
     * for boolean, textbox for string, etc.)
     * Note that some specialized controls can be selected, or the
     * actual type may be overriden, by the forceType property below.
     * Simultaneously, the initial contents of the `value` property gives
     * the default for this parameter; and new tentative settings for this
     * parameter from the UI will initially be stored in `value` for
     * validation (before being copied into top-level properties of the
     * implementing class).
     */
    value: unknown
    /* An optional property adjusting or refining the type detected from the
     * initial setting of the `value` property. Typically, this is used to
     * select a more specialized interface for the parameter, from one of the
     * following conventional values of that `forceType` may be given:
     * -  color: Uses a color picker in the UI, and sets the `value` as
     *    the string `#RRGGBB` hexadecimal color specifier.
     * -  integer: Used for when the value is a `number` but the UI should
     *    enforce that only an integer be stored in it.
     * One other possible use of `forceType` is to initialize the input field
     * to a string that doesn't actually correspond to a valid value for that
     * type. For example, currently the only way to initialize a `number`
     * input field to be blank is to initially set the `value` property
     * to the empty string (marked as type `string | number`) and also
     * set `forceType` to `'number'`.
     */
    forceType?: string
    /* If the value is an element of an Enum, typescript/Vue unfortunately
     * cannot extract the list of all of the possible enumerated values
     * (so that the UI can create a dropdown select box). So in that case,
     * set the `from` property of this object to the Enum object from
     * which the `value` comes.
     */
    from?: {[key: string]: number | string}
    // The main label of the control for this param:
    displayName: string
    // whether the parameter must be specified
    required: boolean
    /* If you want the control for this parameter only to be visible when
     * some other parameter has a specific value (because it is otherwise
     * irrelevant), set this `visibleDependency` property to the name of
     * the other parameter, and the following `visibleValue` property
     * to the value that the `visibleDependency` parameter should have
     * in order for this parameter to be visible.
     * For example, if this parameter is 'backgroundColor' but it should
     * only be displayed if the 'mode' parameter has the value 'color'
     * (instead of, say, 'greyscale'), then on the 'backgroundColor' param,
     * set `visibleDependency` to 'mode' and `visibleValue` to 'color'.
     * If you want the control for this parameter only to be visible when
     * some condition is true and that condition relates to another
     * parameter's specific value (because it is otherwise irrelevant),
     * set this `visibleDependency` property to the name of
     * the other parameter, and the following `visiblePredicate` property
     * to a boolean expression related to the other parameter in order for
     * this parameter to be visible. For example, if this parameter is
     * 'backgroundColor' but it should only be displayed if the 'mode'
     * parameter doesn't has the value 'color'(instead of, say, 'greyscale'),
     * then on the 'backgroundColor' param, et `visibleDependency` to 'mode'
     * and `visiblePredicate` (dependentValue: mode) =>
                dependentValue !== 'color,
        },
        Note that parameters with a `visibleDependency` will be displayed
     *  with a distinctive appearance when they are visible.
     */
    visibleDependency?: string
    /* Note that the visibleValue property does not actually need to be
     * declared in TypeScript, as it is only accessed via plain JavaScript
     * in Vue.
     */
    // visibleValue: any
    // Since functions are contravariant in their argument types,
    // `never` below allows the predicate to take any argument type.
    visiblePredicate?: (dependency: never) => boolean

    // Additional explanation text to display:
    description?: string
}

export interface ParamableInterface {
    name: string
    description: string
    isValid: boolean
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
    isValid = false

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
