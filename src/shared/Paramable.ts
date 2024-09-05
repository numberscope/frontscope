import {seqKey} from './browserCaching'
import {hasField, makeStringFields} from './fields'
import type {StringFields} from './fields'
import typeFunctions, {ParamType} from './ParamType'
import type {RealizedParamType} from './ParamType'
import {ValidationStatus} from './ValidationStatus'

/**
 * The following collection of properties specifies how a given parameter
 * should be displayed in the user interface (UI), and provides a location
 * for communicating tentative values of the parameter back to the
 * implementation.
 */
export interface ParamInterface<T extends ParamType> {
    /* The default property specifies the default value that this parameter
     * will take in the UI when the paramable is loaded into the UI. This
     * value is not updated as the user changes the value of the parameter,
     * as the intermediate values are stored as strings in `Paramable`, and
     * the realized values are stored as top level properties.
     */
    default: RealizedParamType[T]
    /* This field is required for the sake of being explicit and ensuring type
     * consistency for Paramable objects. Defines the type of this parameter as
     * will be reflected by the type of its realized value and the type of input
     * field in the UI. This field is specified as a `ParamType`, which is an
     * enum of all supported parameter types by the parameter UI.
     */
    type: T
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
    // Whether the parameter must be specified. When this is set to false,
    // a blank input in the UI will use the `default` property instead of
    // displaying an error to the user.
    required: boolean
    // The placeholder text that appears in the entry box for the parameter
    // when that box is empty. This is really only applicable to non-required
    // parameters, because for required ones, that box is not allowed to be
    // empty. The placeholder defaults to the string representation of the
    // default value for the parameter.
    placeholder?: string
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
    validate?(value: RealizedParamType[T]): ValidationStatus
}

export type ParamTypeChoices = {[key: string]: ParamType}
export type ParamDescription<TC extends ParamTypeChoices> = {
    [K in keyof TC]: ParamInterface<TC[K]>
}
/* Represents a fully generic parameter description. Paramable interfaces
 * should contain such a parameter description.
 */
export type GenericParamDescription = ParamDescription<ParamTypeChoices>

export type ExtractParamChoices<PD extends GenericParamDescription> = {
    [K in keyof PD]: PD[K]['type']
}

// Helper just to beat lint line-length restrictions
type OneParamType<
    PD extends GenericParamDescription,
    K extends keyof PD,
> = RealizedParamType[ExtractParamChoices<PD>[K]]

/* Represents a mapping of all realized values from a parameter description.
 * That is, contains the full set of parameters with their appropriate
 * types.
 */
export type ParamValues<PD extends GenericParamDescription> = {
    -readonly [K in keyof PD]: OneParamType<PD, K>
}

export interface ParamableInterface<PD extends GenericParamDescription> {
    // A per-instance identification of the paramable object. Note that
    // all derived classes of the "Paramable" implementation of this
    // interface will also have a _static_ `category` property identifying
    // that particular kind of Paramable object.
    name: string
    // Make the per-class description of the category of paramable objects
    // available via instances; note that by convention it should only
    // depend on the class.
    readonly description: string
    // Was the last check of tentative values successful?:
    isValid: boolean
    /**
     * params determines the parameters that will be settable via the
     * user interface. Each key should match a top-level property name of the
     * paramable object, and the values should be objects implementing the
     * the ParamInterface as described above.
     */
    params: PD
    /**
     * A set of tentative (unrealized) values of the parameters. These values
     * are always strings, and reflect what the user has currently entered into
     * the input fields. `assignParameters()` will realize these values and copy
     * them into top-level properties.
     */
    tentativeValues: StringFields<PD>
    /**
     * A validation function for the `ParamableInterface`. This function
     * is expected to check that all tentative values of parameters are
     * valid when considered in isolation, or if the param argument is
     * supplied, check just that one. Then it must check that all parameters
     * considered together are valid. It must set the isValid property of
     * this paramable object. Finally, it must assign the valid
     * realized values to the internal properties of the paramable object.
     *
     * @param {string?} param  Optional, specific parameter needing validation
     * @return the result of the validation
     */
    validate(param?: string): Promise<ValidationStatus>
    /**
     * Validates one individual parameter, specified by name, updating the
     * status argument. Does not perform interdependent validation checks
     * or assign any parameters, but does return the realized value if it
     * is valid, or returns undefined otherwise.
     *
     * @param {string} param  param name
     * @param {ValidationStatus} status  status object to update
     * @return {param type} realized value of parameter
     */
    validateIndividual<P extends string>(
        param: P,
        status: ValidationStatus
    ): ParamValues<GenericParamDescription>[string] | undefined
    /**
     * assignParameters() should copy the realized value of each tentative
     * value of each of the params to the place where the implementing object
     * will access it.
     * Typically, that means copying to top-level properties of the object.
     * The implementing object should only use parameter values supplied by
     * assignParameters(), because these have been vetted with a validate()
     * call. In contrast, values taken directly from the tentativeValues
     * are unvalidated, and they can change from valid to invalid at any time.
     *
     * It can optionally take a pre-realized parameter values object, to save
     * the trouble of re-realizing the tentative values.
     */
    assignParameters(realized?: ParamValues<PD>): Promise<void>
    /**
     * refreshParams() should copy the current working values of all of the
     * params back into the tentativeValues, in case they have changed.
     * This way the true current values can be represented in the user
     * interface presenting the params.
     */
    refreshParams(): void
    /**
     * The query property should have the value of the tentative parameters in
     * URL query string format
     */
    readonly query: string
    /**
     * loadQuery() should restore the state of the tentative parameters
     * to those specified in the query. Returns the paramable object itself
     * for chaining purposes.
     */
    loadQuery(query: string): Paramable<PD>
}

/* Helper functions to realize parameters given parameter description(s)
 * and (a list of) tentative string value(s)
 */
function realizeOne<T extends ParamType>(
    spec: ParamInterface<T>,
    tentative: string
): RealizedParamType[T] {
    if (!spec.required && tentative === '') return spec.default
    return typeFunctions[spec.type].realize(tentative)
}

function realizeAll<PD extends GenericParamDescription>(
    desc: PD,
    tentative: StringFields<PD>
): ParamValues<PD> {
    const params: (keyof PD)[] = Object.keys(desc)
    return Object.fromEntries(
        params.map(p => [p, realizeOne(desc[p], tentative[p])])
    ) as ParamValues<PD>
}

/**
 * @class Paramable
 * a generic implementation of a class with parameters to be exposed in the UI
 * Designed to be used as a common base class for such classes.
 */
export class Paramable<PD extends GenericParamDescription>
    implements ParamableInterface<PD>
{
    name = 'A generic object with parameters'
    static description = 'An object with dynamically-specifiable parameters'
    params: PD
    tentativeValues: StringFields<PD>
    isValid = false

    constructor(params: PD) {
        // Hack: make sure Specimen URLs remain unambiguous
        if (seqKey in params)
            throw new Error(`Paramable objects may not use key '${seqKey}'`)

        this.params = params
        // Start with empty string for every tentative value
        this.tentativeValues = makeStringFields(params)
        // Now fill in the string forms of all of the default values of
        // the parameters as the tentative values
        for (const prop in params) {
            // Be a little paranoid: only include "own" properties:
            if (!hasField(params, prop)) continue
            const param = params[prop]
            // Because of how function types are unioned, we have to circumvent
            // typescript a little bit
            if (param.required)
                this.tentativeValues[prop] = typeFunctions[
                    param.type
                ].derealize(param.default as never)
        }
    }

    /* All leaf derived classes of Paramable should have a static
       property called 'description' to fulfill the ParamableInterface
    */
    get description() {
        // Need to let Typescript know there is a static description property
        // and then need to suppress eslint's dislike of Function
        // eslint-disable-next-line @typescript-eslint/ban-types
        return (this.constructor as Function & {description: string})
            .description
    }
    /* All leaf derived classes of Paramable should have a static
       property called 'category' that gives the name of that particular
       class of Paramable object
    */
    get category() {
        // See comments in description getter
        // eslint-disable-next-line @typescript-eslint/ban-types
        return (this.constructor as Function & {category: string}).category
    }
    /**
     * All implementations based on this default delegate the aggregate
     * checking of parameters to the checkParameters() method.
     * That leaves the required validate() method to first validate the
     * individual parameters (or just the one requested), then call
     * checkParameters and set the isValid property based on the result.
     * Also, if the parameters are valid, it calls assignParameters to copy
     * the realized values into the working locations in the paramable object.
     * This validate() should generally not need to be overridden or extended;
     * extend checkParameters() instead.
     */
    async validate(param?: string) {
        // Presumption of guilt:
        this.isValid = false
        // first handle the individual validations
        let status = ValidationStatus.ok()
        const parmNames = Object.keys(this.params)
        const realized = Object.fromEntries(
            parmNames.map(p => [
                p,
                !param || p === param
                    ? this.validateIndividual(p, status)
                    : realizeOne(this.params[p], this.tentativeValues[p]),
            ])
        ) as ParamValues<PD>
        if (status.invalid()) return status
        status = this.checkParameters(realized)
        if (status.invalid()) return status
        this.isValid = true
        await this.assignParameters(realized)
        return status
    }
    /**
     * Validate one individual parameter, specified by name, updating the
     * status argument. Does not perform interdependent validation checks
     * or assign any parameters, but does return the realized value if it
     * is valid or undefined otherwise.
     *
     * @param {string} param  param name
     * @param {ValidationStatus} status  status object to update
     * @return {param type} realized value of parameter
     */
    validateIndividual<P extends string>(
        param: P,
        status: ValidationStatus
    ): ParamValues<GenericParamDescription>[string] | undefined {
        const paramSpec = this.params[param]
        const tentative = this.tentativeValues[param]
        if (!paramSpec.required && tentative === '') {
            return paramSpec.default as OneParamType<PD, P>
        }
        typeFunctions[paramSpec.type].validate(tentative, status)
        if (status.invalid()) return undefined
        const realization = typeFunctions[paramSpec.type].realize(tentative)
        if (paramSpec.validate)
            status.addError(...paramSpec.validate(realization).errors)
        if (status.invalid()) return undefined
        return realization as OneParamType<PD, P>
    }
    /**
     * Performs the same purpose as `validate()`, but takes as a parameter
     * a list of realized values of the parameters, so that the function doesn't
     * have to do this itself. Except in an extraordinary case in which a
     * derived-class Paramable object needed to do some cross-parameter
     * check based on the input strings as opposed to realized values, derived
     * classes should essenitally always override this checkParameters() method,
     * rather than `validate()`.
     * @param {ParamValues} params
     *     the collection of realized parameter values to be validated
     * @return {ValidationStatus} the result of the validation
     */
    checkParameters(_params: ParamValues<PD>): ValidationStatus {
        return ValidationStatus.ok()
    }
    /**
     * assignParameters() copies parameters into top-level properties. It
     * should not generally need to be overridden or extended, and it should
     * only be called when isValid is true.
     * @param {ParamValues?} realized  Optionally supply pre-realized parameters
     */
    async assignParameters(realized?: ParamValues<PD>) {
        if (!realized)
            realized = realizeAll(this.params, this.tentativeValues)

        const props: string[] = []
        const changed: string[] = []
        for (const prop in realized) {
            if (!hasField(realized, prop)) continue

            const me = this as Record<string, unknown>
            props.push(prop)
            if (realized[prop] !== me[prop]) {
                me[prop] = realized[prop]
                changed.push(prop)
            }
        }
        if (changed.length < props.length)
            for (const prop of changed) await this.parameterChanged(prop)
        else await this.parameterChanged('#all')
    }
    /**
     * refreshParams() copies the current values of top-level properties into
     * the params object. It should not generally need to be overridden or
     * extended. However, it is (currently) never called automatically; it
     * should be called whenever implementation code changes the working values,
     * to keep the values reflected correctly in the UI.
     */
    refreshParams(): void {
        const me = this as unknown as ParamValues<PD>
        for (const prop in this.params) {
            if (!hasField(this, prop)) continue
            const param = this.params[prop]

            const tentative = this.tentativeValues[prop]
            const status = ValidationStatus.ok()
            // No need to validate empty optional params
            if (tentative || param.required)
                typeFunctions[param.type].validate(tentative, status)
            if (status.isValid()) {
                // Skip any parameters that already produce the current value
                if (me[prop] === realizeOne(param, tentative)) continue
            }

            // Circumventing typescript a bit as we do above
            this.tentativeValues[prop] = typeFunctions[param.type].derealize(
                me[prop] as never
            )
        }
    }

    /**
     * parameterChanged() is called whenever the value of a particular parameter
     * is changed. By default, this does nothing, but may be overriden to
     * perform any kind of update action for that given parameter.
     *
     * Note that if all parameters have changed at once, this function will only
     * be called a single time with the name value '#all'
     * @param {string} name  the name of the parameter which has been changed
     */
    async parameterChanged(_name: string) {
        return
    }

    /**
     * Provides the tentative parameter values in URL query string format
     */
    get query(): string {
        const tv = this.tentativeValues // just because we use it so many times
        const saveParams: Record<string, string> = {}
        for (const key in tv) {
            // leave out blank/default parameters
            if (tv[key]) {
                const param = this.params[key]
                const defaultString = typeFunctions[param.type].derealize(
                    param.default as never
                )
                if (tv[key] !== defaultString) {
                    // Avoid percent-encoding for colors
                    let qv = tv[key]
                    if (param.type === ParamType.COLOR && qv[0] === '#') {
                        qv = qv.substring(1)
                    }
                    saveParams[key] = qv
                }
            }
        }
        const urlParams = new URLSearchParams(saveParams)
        return urlParams.toString()
    }
    /**
     * Updates the tentative values of the parameter to those specified in
     * the given URL query string. Note that the values are not validated or
     * assigned in this process.
     * @param {string} query  the URL query string containing parameters
     * @return {ParamableInterface}  the updated paramable itself
     */
    loadQuery(query: string): Paramable<PD> {
        const params = new URLSearchParams(query)
        for (const [key, value] of params) {
            if (key in this.tentativeValues) {
                const param = this.params[key]
                const pdKey = key as keyof PD
                if (
                    param.type === ParamType.COLOR
                    && value.match(/^[0-9a-fA-F]{6}$/)
                )
                    this.tentativeValues[pdKey] = '#' + value
                else this.tentativeValues[pdKey] = value
            } else console.warn(`Invalid property ${key} for ${this.name}`)
        }
        return this
    }
}
