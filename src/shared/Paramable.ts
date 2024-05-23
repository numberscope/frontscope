import {ValidationStatus} from './ValidationStatus'
import typeFunctions, {ParamType} from './ParamType'

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
     * While any type can be inputted into this field as an initial value,
     * it will likely be converted into a string upon being edited by the UI
     * or validated by the Paramable API. This value represents what is
     * currently present in the UI input, and is not a realized value of
     * the parameter for the correct type.
     * Simultaneously, the initial contents of the `value` property gives
     * the default for this parameter; and new tentative settings for this
     * parameter from the UI will initially be stored in `value` for
     * validation (before being copied into top-level properties of the
     * implementing class).
     */
    value: unknown
    /* Previously an optional value, this field is now required for the sake
     * of being explicit and ensuring type consistency for Paramable objects.
     * Defines the type of this parameter as will be reflected by the type
     * of its realized value and the type of input field in the UI. Rather
     * than being a string, the value of this field is one of an enum of
     * supported types by the Paramable system and UI components.
     */
    type: ParamType
    /* If the value is an element of an Enum, typescript/Vue unfortunately
     * cannot extract the list of all of the possible enumerated values
     * (so that the UI can create a dropdown select box). So in that case,
     * set the `from` property of this object to the Enum object from
     * which the `value` comes.
     */
    from?: {[key: string]: number | string}
    // The main label of the control for this param; can depend on
    // visibleDependency:
    displayName: string | ((dependency: never) => string)
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
    /* The visible value property applies only if `visiblePredicate` is
     * undefined.
     */
    visibleValue?: unknown
    // Since functions are contravariant in their argument types,
    // `never` below allows the predicate to take any argument type.
    visiblePredicate?: (dependency: never) => boolean

    // Additional explanation text to display:
    description?: string

    // Option to hide the description in a tooltip:
    hideDescription?: boolean

    /* An independent validation function, which may validate the value of
     * this parameter irrespective of the values of other parameters. The
     * advantage of using this over the aggregate validation function within
     * `ParamableInterface` is that it runs only when this parameter is updated,
     * and provides more tailored error messages that appear at the site of
     * the parameter, rather than above/below the entire list of parameters.
     * It is also more flexible than the aggregate validation function, working
     * even when the values of other parameters are currently invalid.
     * It takes in a realized value of this parameter and returns a validation
     * status. If this function is not implemented, it assumes that the
     * parameter must always be valid.
     */
    validate?(value: unknown): ValidationStatus
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
     * An aggregate validation function for the `ParamableInterface`. This
     * function is expected to validate any interdependent constraints of
     * the parameters (independent parameter validations should occur in
     * their own validation functions). This function is less flexible than
     * the independent validation functions, as it can only be run when
     * all parameters are in an independently valid state.
     * @return the result of the validation
     */
    validate(): ValidationStatus
    /**
     * assignParameters() should copy the `value` property of each item in
     * `params` to the place where the implementing object will access it.
     * Typically, that means copying to top-level properties of the object. The
     * implementing object should only use parameter values supplied by
     * assignParameters(), because these have been vetted with a validate()
     * call. In contrast, values taken directly from `params` are unvalidated,
     * and they can change from valid to invalid at any time.
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
        const realParams: {[key: string]: unknown} = {}
        for (const prop in this.params) {
            if (!Object.prototype.hasOwnProperty.call(this.params, prop))
                continue
            const p = this.params[prop]
            if (typeof p.value !== 'string') p.value = `${p.value}`

            realParams[prop] = typeFunctions[p.type].realize(
                p.value as string
            )
        }
        return this.checkParameters(realParams)
    }
    /**
     * Performs the same purpose as `validate()`, but takes as a parameter
     * a list of realized values of the parameters, so that the function doesn't
     * have to do this itself. This function should always be the one overloaded
     * by classes which extend `Paramable`, and not `validate()`
     * @param _params the list of realized parameter values to be validated
     * @return the result of the validation
     */
    checkParameters(_params: {[key: string]: unknown}): ValidationStatus {
        return ValidationStatus.ok()
    }
    /**
     * assignParameters() copies parameters into top-level properties. It
     * should not generally need to be overridden or extended, and it should
     * only be called when isValid is true.
     */
    assignParameters(): void {
        for (const prop in this.params) {
            if (!Object.prototype.hasOwnProperty.call(this.params, prop))
                continue
            const param = this.params[prop]
            const me = this as Record<string, unknown>
            if (typeof param.value !== 'string')
                param.value = `${param.value}`

            me[prop] = typeFunctions[param.type].realize(
                param.value as string
            )
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
            const param = this.params[prop]
            param.value = typeFunctions[param.type].derealize(me[prop])
        }
    }
}
