import {hasField, makeStringFields} from './fields'
import type {StringFields, GenericStringFields} from './fields'
import {typeFunctions, ParamType} from './ParamType'
import type {RealizedPropertyType} from './ParamType'
import {seqKey} from './specimenEncoding'
import {ValidationStatus} from './ValidationStatus'

/** md
# Describing user-settable parameters

Various entities in the frontscope system, particularly Sequences and
Visualizers, can employ user-settable parameters for which controls will
appear in the browser user interface (UI). The value selected for each
parameter will be reflected in a property of the object implementing the
entity. But many aspects of each parameter (what type of values it can have,
how it should appear in the UI, and so on) must be specified in the
TypeScript code by an object with a particular structure: an instance of the
`ParamInterface`, documented here. (Then the collection of all of these
specification objects for a given Visualizer, for example, is supplied to
its implementation as its "parameter description," as detailed in the
[visualizer building](../../doc/visualizer-basics.md#parameters-often-used)
documentation.)

All of the properties that can be specified for a parameter are enumerated
on this page. Most of them are data properties, and each of these is listed
with its data type. To understand these data types, it is important to know
that the `ParamInterface` is generic, depending on a `ParamType` from the
following table of possibilities. Most importantly, each ParamType is
associated with a TypeScript data type, which will be the type of the property
in the Sequence or Visualizer associated with the parameter. In the table,
the designation "input" in the "Rendering in UI" column means a standard
browser text input box.

<!-- Extract the table of ParamTypes from its source file -->
{! ParamType.ts extract:
    start: 'export enum ParamType'
    stop: '[}]'
    replace: [
        '^\s*([|].*[|])\s*(?:[*][/])?$',
        ['^\s*(.*), [/][/]\s*([|].*[|])$', '| \1 \2']
    ]
!}

In the following descriptions of the `ParamInterface` properties, the
ParamType specified for the instance is abbreviated as `PT`, and its
associated TypeScript type is written as `RealizedPropertyType[PT]`.  Also,
a question mark after the property name means that it is optional whether
or not to specify that property; all other properties are required.

**/
type ParamLevel = 0 | 1
export interface ParamInterface<PT extends ParamType> {
    /** md */
    default: RealizedPropertyType[PT]
    /* **/
    /** md
:   Specifies the default value that this parameter will have in the UI
    when the entity it belongs to is being displayed. If the user does not
    enter any other value, this default value will show up as the
    corresponding property of the entity.
<!-- -->
    **/
    /** md */
    type: PT
    /* **/
    /** md
:   The `ParamType` of the parameter, from the above list. Note that if you
    have imported `ParamType` into your code, this property must be specified
    with the `ParamType.` prefix, for example, as `ParamType.NUMBER_ARRAY`.
<!-- -->
    **/
    /** md */
    from?: {[key: string]: number | string}
    /* **/
    /** md
:   If the `type` property is `ParamType.ENUM`, this property should be
    set to the Enum object from which the parameter value will be selected.
<!-- -->
    **/
    /** md */
    displayName: string | ((dependency: never) => string)
    /* **/
    /** md
:   The text label in the UI for the control corresponding to this parameter.
    It may be specified as one specific string (and usually is), but if
    the `visibleDependency` property of the `ParamInterface` (see below)
    is set, it can also be specified by a function that takes the value
    of the visibleDependency parameter and returns a string for the label.
    That way, the displayed label can depend on the value of another
    parameter, which is occasionally useful.
<!-- -->
    **/
    /** md */
    required: boolean
    /* **/
    /** md
:   Specifies whether the parameter must be set. When this property is true,
    an empty input in the UI will cause an error, rather than using the value
    of the `default` property.
<!-- -->
    **/
    /** md */
    placeholder?: string
    /* **/
    /** md
:   The placeholder text that appears in the input box for the parameter
    when that box is empty. This property is really only useful on parameters
    for which the `required` property is false, because otherwise the input
    box is not allowed to be empty. If the `placeholder` property is not
    specified, the string representation of the `default` property is used
    instead.
<!-- -->
    **/
    /** md */
    description?: string
    /* **/
    /** md
:   Additional explanatory text about the parameter to display.
<!-- -->
    **/
    /** md */
    hideDescription?: boolean
    /* **/
    /** md
:   If this property is specified as true, the description will appear as
    a tooltip that pops up when the parameter's control in the UI is hovered.
    Otherwise, the description will be (always) shown adjacent to the the
    control.
<!-- -->
    **/
    /** md */
    visibleDependency?: string
    /* **/
    /** md
:   If this property is specified, the value of the parameter whose name
    is given by the `visibleDependency` property will determine whether or
    not the control for this parameter is visible in the UI. The idea is that
    the setting for one parameter may (or may not) make the value of another
    parameter irrelevant. If `visibleDependency` is set, then just one of the
    `visibleValue` or `visiblePredicate` properties must also be set to
    determine when this parameter will in fact be shown.

    For example, if this parameter is 'backgroundColor' but it should
    only be displayed in the UI if the 'mode' parameter has the value 'color'
    (instead of, say, 'greyscale'), then on this parameter set the
    `visibleDependency` property to 'mode' and the `visibleValue` property
    to 'color'. On the other hand, if 'backgroundColor' should only be
    displayed when 'mode' is not 'greyscale' (instead of, say, 'rainbow'
    or 'pastels'), then still set `visibleDependency` to 'mode' but set the
    `visiblePredicate` property to

    `(dependentValue: string) => dependentValue !== 'greyscale'`

    Note that parameters with a `visibleDepenency` setting will be displayed
    with a distinctive appearance, when they are visible.

    Another common use for the `visibleDependency` property is to make one
    or more parameters visible only if a checkbox corresponding to some
    other BOOLEAN parameter is checked. This feature allows you to show
    a core set of parameters at first, and allow the user to check a box
    to reveal additional, more detailed controls.
<!-- -->
    **/
    /** md */
    visibleValue?: unknown
    /* **/
    /** md
:   If the `visibleDependency` property is specified, gives the value for
    the parameter named by `visibleDependency` which will cause this parameter
    to be displayed. Note that `visibleValue` only matters if the
    `visiblePredicate` property is not specified.
<!-- -->
    **/
    /** md */
    visiblePredicate?: (dependency: never) => boolean
    /* **/
    /** md
:   If the `visibleDependency` property is specified, then this parameter
    will only be visible in the UI if the function given as the
    `visiblePredicate` property of this parameter returns true when called
    with the value of the parameter named by the `visibleDependency`
    property. Note that the `never` type above simply means that the argument
    to the `visiblePredicate` function may have any type.
<!-- -->
    **/
    /** md */
    level?: ParamLevel
    /* **/
    /** md
:   An integer giving the hierarchical level of the parameter; this value
    is used to determine aspects of the layout of the parameter entry area
    in the UI such as its indentation, spacing, and/or border. Currently
    only parameter levels 0 ("top-level") and 1 ("subordinate") are defined.
    If this property is not specified, a level of 1 is used if the parameter
    has a visibleDependency, and level 0 is used otherwise.
<!-- -->
    **/
    /** md */
    symbols?: readonly string[]
    /* **/
    /** md
:   If the `type` property is `ParamType.FORMULA`, this property gives the
    list of predefined symbols (variables and function symbols) that are
    allowed to occur in the formula. The entity using the resulting
    MathFormula will have to supply the values of those symbols when it
    calls `computeWithStatus()` on the MathFormula.
<!-- -->
    **/
    /** md */
    validate?(value: RealizedPropertyType[PT], status: ValidationStatus): void
    /* **/
    /** md
:   This method, if it is defined, acts as an additional validity check on
    input values of the parameter. It must take a possible _value_ of the
    parameter (that has been entered in the UI), and update the supplied
    _status_ with any errors or warnings based on that _value_ for the
    parameter. For example, if the `speed` parameter with `type` equal to
    `ParamType.NUMBER` must be positive and if the visualization may take
    too long to update if the `speed` is bigger than 16, then its `validate`
    method might look like

    ```typescript
        validate: function(value: number, status: ValidationStatus) {
            if (value <= 0) status.addError('must be positive')
            else if (value > 16) {
                status.addWarning('when larger than 16, display may lag')
            }
       }
    ```

    Note that if a required condition on a parameter can be captured in
    this sort of validation function, it is better to use this facility
    rather than check the condition later on in the associated entity's code.
    This way the error is caught earlier, with better feedback to the user,
    and can prevent your Sequence or Visualizer code from wasting time on
    useless inputs.

    As a technical note, `validate` methods should generally be regular
    JavaScript functions as opposed to "arrow functions," as they are called
    with the `this`-context set to the entity (usually Sequence or Visualizer)
    on which this parameter resides, so that the `validate` method may use
    other data (but **not** other parameter values) of the entity in its
    checks.
    **/
    /** md */
    updateAction?(newValue: string, oldValue: string): void
    /* **/
    /** md
:   This method, if it is defined, will be executed whenever the parameter
    takes on a new valid value, although it is called with the previous and
    newly-updated _string_ forms of the parameter, not the realized values,
    since this method is called before all of the parameters of the entity
    have been fully validated (although this one parameter is guaranteed to
    be valid. Like the `validate` method, is is called with
    its `this`-context set to the entity (usually Sequence or Visualizer)
    on which this parameter resides.
    **/
}

export type ParamTypeChoices = {[key: string]: ParamType}
export type ParamDescription<TC extends ParamTypeChoices> = {
    [K in keyof TC]: ParamInterface<TC[K]>
}
/* Represents a fully generic parameter description. Paramable interfaces
 * should contain such a parameter description.
 */
export type GenericParamDescription = ParamDescription<ParamTypeChoices>

/* Clone any ParamDescription: */
export function paramClone<PD extends GenericParamDescription>(pd: PD) {
    return Object.fromEntries(
        Object.keys(pd).map(k => [k, Object.assign({}, pd[k])])
    )
}

export type ExtractParamChoices<PD extends GenericParamDescription> = {
    [K in keyof PD]: PD[K]['type']
}

// Helper just to beat lint line-length restrictions
type OneParamType<
    PD extends GenericParamDescription,
    K extends keyof PD,
> = RealizedPropertyType[ExtractParamChoices<PD>[K]]

/* Represents a mapping of all realized values from a parameter description.
 * That is, contains the full set of parameters with their appropriate
 * types.
 */
export type ParamValues<PD extends GenericParamDescription> = {
    [K in keyof PD]: OneParamType<PD, K>
}

/********
 Important notes on TypeScript and typing of the hierarchy of Paramable
 classes (which include all sequences and visualizers):

 TL;DR: Typings are loose and provide little safety in the interior levels
 of the hierarchy and become specific (only) in the "leaf" classes that
 are directly used at runtime. The mechanism for the narrowing consists
 of several generic "class factory" functions that generate base classes
 for the final layer of derivation of end-implementation classes.

 Full discussion:

 All Paramable class instances have some collection of "parameters",
 which are values that will be controllable from the frontscope UI (and which
 will also display in the UI). Moreove, these values are reflected as top-level
 properties of the class instance.

 For a specific class, the list of these parameters and their types and
 characteristics will be controlled by a ParamDescription, a structure as
 defined above. We want TypeScript to select a narrow type for that
 ParamDescription, and thereby typecheck the use of the described top-level
 properties in the code for that class.

 We at first attempted to track that narrow type of the ParamDescription
 throughout the entire hierarchy, making everything generic on a type that
 extended GenericParamDescription (the widest possible ParamDescription type,
 that doesn't really constrain the top-level properties of the instanct at all).

 However, we found two things: (A) in the code at the higher levels of the
 hierarchy, "interior" to where a specific ParamDescription is actually being
 specified, we were unable to get TypeScript to track types in the way we
 had hoped and so we needed numerous typecasts to get the code to compile,
 which were basically throwing away any type safety we might have hoped
 to achieve in this internal code; and (B) in the code that was handling
 sequences and visualizers in general, there was no way to instantiate the
 generic interfaces with any narrow type (since the code would have to handle
 all visualizers), and so we were always using GenericParamDescription anyway
 rather than any specific ParamDescription type.

 Hence, we concluded that within code where the ParamDescription was not yet
 known, the TypeScript generic mechanisms were adding needless complexity
 without any tangible benefit. Therefore, we have now left typings loose --
 able to handle any ParamDescription with no information on the details
 thereof -- at the top levels of the hierarchy. Then at the points where
 we are getting to specific implementations and are ready to take a particular
 ParamDescription, we create "factory functions" that do still have generic
 parameters for narrow ParamDescription types. These factories then use the
 TypeScript generic mechanisms to return concrete classes that have specific
 constraints on the parameter values.

 For this to work, every one of the "leaf" implementations of a class
 ultimately derived from Paramable must come through one of these class
 factories. Some judgement is needed as to where in the hierarchy to put
 such factories. Essentially, they are at all the places that someone might
 derive from to produce a concrete class that will be used at runtime.
 So, for example, in the Sequence classes, we make the "Cached" base class,
 that would never be used standalone but from which all operational sequences
 like Formula derive directly, into a class factory that takes a parameter
 description argument of a narrow type and returns a Cached-family class
 with the specific properties determined by that parameter description. That
 class returned from the factory is still itself not ready to be useful on
 its own, but it is proper to derive from and will ensure that the
 resulting derived class has all of the top-level properties with specific
 types as listed in the parameter description (without having to reiterate them
 all in the derived class definition).

 The upshot is that in the end there doesn't seem to be a way (either with or
 without TypeScript's generic mechanisms) to make the internal code of the
 higher levels of the Paramable hierarchy as type-safe as one might like.
 Hence, we must consider that internal code to be "expert code" that we
 must check and test carefully. Fortunately, however, we still get all of
 the desired type checking in all of the final Sequences and Visualizers. You
 can demonstrate this by trying to assign a value of the wrong type to
 one of the properties described by the ParamDescription of a particular
 Visualizer, say -- it will generate the expected TypeScript error. Thus,
 TypeScript should still be helpful to the more "casual code" potentially
 submitted by a visualizer author.
 ********/

/* NOTE that the rest of the documentation in this file is set off by
   `xmd` comments, rather than `md`, because the remaining documentation
   is extracted by the VisualizerInterface page rather than being part of
   the `ParamInterface` page directly generated by this file
*/

/** xmd
## The parameterizable object interface

As mentioned above, any frontscope object that takes parameters, like a
visualizer or a sequence, has to implement the `ParamableInterface`. Although
the typical way to do this is to extend the base generic implementation
[`Paramable`](#the-paramable-base-class) documented below, we begin with
the details of the required interface itself. We use the same conventions
as above for data properties and methods of the interface.
**/
export interface ParamableInterface {
    /** xmd */
    name: string /* **/
    /** xmd
:   A per-instance identification of the paramable object. It is, however,
    not required to be unique among all paramable objects.
<!-- --> **/
    /** xmd */
    readonly htmlName: string /* **/
    /** xmd
:   Per-instance html code that should be used where possible in
    the user interface to display the name of the sequence. If you
    don't define this, the default implementation will simply reuse the name.
<!-- --> **/
    /** xmd */
    readonly description: string /* **/
    /** xmd
:   A description of the "category" of paramable objects to which this
    instance belongs. The value of this property should depend only on the
    _class_ of the instance, not vary from instance to instance of the same
    class.
<!-- --> **/
    /** xmd */
    params: GenericParamDescription /* **/
    /** xmd
:   A parameterizable object has to come with a collection of user-settable
    parameters — even if that collection is empty. The keys of this _params_
    property (which should be a plain object) comprise that collection. The
    _value_ for each key describes how that parameter should appear in the
    graphical user interface (UI), what kind of values it can take, whether
    it is required, and so on. It does so by providing the properties of the
    [`ParamInterface`](../shared/Paramable.md) interface. To summarize, the
    _params_ property should be an object mapping parameter names to
    instances of `ParamInterface`.
<!-- --> **/
    /** xmd */
    tentativeValues: GenericStringFields /* **/
    /** xmd
:   This property will hold the latest raw string value for each parameter
    that has been set in the UI (even if that string does not translate to
    a proper value for the parameter, hence the "tentative" moniker).
    Note the frontscope infrastructure will set this property for you.
    Specifically, its value will be a plain object, the keys of which
    are all of the parameter names, and all of the values of which are strings.
    Note that the `assignParameters()` method will convert these strings into
    actual properly-typed values and copy them into top-level properties of
    the `ParamableInterface` instance.
<!-- --> **/
    /** xmd */
    statusOf: Record<string, ValidationStatus> /* **/
    /** xmd
:   A plain object mapping each parameter name to the validation status of
    its current value in the `tentativeValues` object.
<!-- --> **/
    /** xmd */
    validateIndividual<P extends string>(
        param: P
    ): ParamValues<GenericParamDescription>[string] | undefined /* **/
    /** xmd
:   This method should check the validity of the `tentativeValue` of the
    single parameter named _param_ and update the status of that parameter
    in the statusOf property accordingly. This method should not perform
    interdependent validation checks that involve  multiple parameters, or
    assign any value to property named _param_ in this instance of the
    `ParamableInterface`. If the value of _param_ is valid, this method
    should return its "realized value" (i.e., `tentativeValue` converted to
    its intended type per this parameter's `ParamType`). The return value
    should be `undefined` otherwise.
<!-- --> **/
    /** xmd */
    validationStatus: ValidationStatus /* **/
    /** xmd
:   The latest overall status of this instance of the `ParamableInterface`
    based on all of the `tentativeValeues`. In other words, if all of the
    tentative parameter values were assigned to this object, would that
    produce a valid entity (typically Sequence or Visualizer)?
<!-- --> **/
    /** xmd */
    validate(): ValidationStatus /* **/
    /** xmd
:   This method should determine the overall validity of all of the
    `tentativeValues` of this instance of the `ParamableInterface`. It is
    expected to check the validity of each parameter individually, and
    perform any necessary cross-checks between different parameter values.
    This method should update the `validationStatus` property accordingly.
    Finally, if that outcome is indeed valid, this method must _assign_ the
    realized values of all tentative parameters to the correspondingly named
    top-level properties of this instance of the `ParamableInterface`
    (presumably by calling the `assignParameters()` method.
<!-- --> **/
    /** xmd */
    assignParameters(
        realized?: ParamValues<GenericParamDescription>
    ): void /* **/
    /** xmd
:   This method must copy the realized value of the proper type of the
    tentative value of each paramaeter to the location where this instance
    of the `ParamableInterface` will access it in its computations. That
    is to say, each value is assigned to a top-level instance property with
    the same name as the parameter (although a specific implementation could
    use a different convention).

    The instance should only use parameter values that have been supplied by
    assignParameters(), because these have been vetted with a validate()
    call. In contrast, values taken directly from the `tentativeValues`
    property are unvalidated, and can change from valid to invalid at any
    time unpredictably, as the UI is manipulated.

    This method may optionally be called with a pre-realized parameter
    values object, which it may then assume is correct, in order to avoid
    the computation of re-realizing the tentative values.
<!-- --> **/
    /** xmd */
    refreshParams(which?: Set<string>): void /* **/
    /** xmd
:   This method is the reverse of `assignParameters()`; it should copy the
    string representations of the current internal values of the parameters
    listed in _which_ back into the `tentativeValues` property. If _which_
    is not specified, it copies all parameters back. The idea is that
    in its operation, the instance may need to modify one or more of its
    parameter values. If so, it should call the `refreshParams()` method
    afterwards so that the new authoritative values of the parameters can
    have their representations in the UI updated accordingly. It will disrupt
    the user interface the least if _which_ is supplied to include only
    the parameters that were actually changed.
<!-- --> **/
    /** xmd */
    readonly query: string /* **/
    /** xmd
:   An instance of the `ParamableInterface` must be able to encode the
    state of its parameters in string form, called the `query` of the
    entity (because the representation should also be a valid URL query
    string). The value of this `query` property should be that encoding of
    the current parameter values.
<!-- --> **/
    /** xmd */
    loadQuery(query: string): ParamableInterface /* **/
    /** xmd
:   This method should decode the provided _query_ string and copy the
    values it encodes back into the `tentativeValues` property. It should
    return the `ParamableInterface` instance itself, for chaining purposes
    (typically you may want to call `validate()` immediately after
    `loadQuery()`).
<!-- --> **/
    /** xmd */
}

/* Helper functions to realize parameters given parameter description(s)
 * and (a list of) tentative string value(s)
 */
export function realizeOne<T extends ParamType>(
    spec: ParamInterface<T>,
    tentative: string
): RealizedPropertyType[T] {
    if (!spec.required && tentative === '') return spec.default
    return typeFunctions[spec.type].realize.call(spec, tentative)
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

/** xmd
## The Paramable base class

This is a default implementation of the `ParamInterface` described above. It
takes care of much of the parameter bookkeeping and transference between
tentative and realized values for you. In the guide below, you may presume
that any of the properties of the interface that are not mentioned are
implemented to fulfill the responsibilities outlined above, and will
generally not need to be overridden or extended. There are some methods and
data properties of this base class that are either not present or are likely
to need to be modified in derived classes, and those are listed in this
last section.
**/
export class Paramable implements ParamableInterface {
    /** xmd */
    name = 'A generic object with parameters' /* **/
    /** xmd
:   (Instances of) derived classes will surely want to override this
    placeholder value.
<!-- --> **/
    get htmlName() {
        return this.name
    }
    /** xmd */
    static description = 'An object with dynamically-specifiable parameters'
    /* **/
    /** xmd
:   Similarly, derived classes should override this placeholder value, but
    note that it should be made a _static_ property of the class, in line
    with the provision that `description` should depend only on the class
    of a `Paramable` object, not the individual instance.
`static category: string`
:   All derived classes should have a static `category` property, giving
    a class-level analogue of the `name` property, that will not vary from
    instance to instance of the same class.
<!-- --> **/
    params: GenericParamDescription
    tentativeValues: GenericStringFields
    statusOf: Record<string, ValidationStatus> = {}
    validationStatus: ValidationStatus
    parChangePromise: Promise<void> | undefined = undefined

    constructor(params: GenericParamDescription) {
        this.params = params

        // Hack: make sure Specimen URLs remain unambiguous
        if (seqKey in params)
            throw new Error(`Paramable objects may not use key '${seqKey}'`)

        // Start with empty string for every tentative value
        this.tentativeValues = makeStringFields(params)
        // Now fill in the string forms of all of the default values of
        // the parameters as the tentative values
        for (const prop in params) {
            // Be a little paranoid: only include "own" properties:
            if (!hasField(params, prop)) continue
            const param = params[prop]
            // We assume the initial state is valid
            this.statusOf[prop] = ValidationStatus.ok()
            if (param.required) this.resetParam(prop)
            // if not required, OK to leave this[prop] undefined initially
        }
        // We assume that the default values together make a valid object:
        this.validationStatus = ValidationStatus.ok()
    }

    // Set a parameter back to its default value
    resetParam(prop: string) {
        const param = this.params[prop]
        const me = this as Record<string, unknown>
        me[prop] = param.default
        // Because of how function types are unioned, we have to circumvent
        // typescript a little bit
        this.tentativeValues[prop] = typeFunctions[param.type].derealize.call(
            param,
            param.default as never
        )
        this.statusOf[prop].reset()
    }

    get description() {
        // Need to let Typescript know there is a static description property
        return (
            this.constructor as typeof this.constructor & {
                description: string
            }
        ).description
    }

    get category() {
        return (
            this.constructor as typeof this.constructor & {category: string}
        ).category
    }

    validate() {
        // first handle the individual validations
        const parmNames = Object.keys(this.params)
        const realized = Object.fromEntries(
            parmNames.map(p => [p, this.validateIndividual(p) ?? ''])
        )
        const invalidParms = parmNames.filter(parm =>
            this.statusOf[parm].invalid()
        )
        if (invalidParms.length) {
            this.validationStatus = ValidationStatus.error(
                `Invalid parameters: ${invalidParms.join(', ')}`
            )
            return this.validationStatus
        }
        this.validationStatus = this.checkParameters(realized)
        if (this.validationStatus.isValid()) {
            this.assignParameters(realized)
        }
        return this.validationStatus
    }

    validateIndividual<P extends string>(
        param: P
    ): ParamValues<GenericParamDescription>[string] | undefined {
        const paramSpec = this.params[param]
        const tentative = this.tentativeValues[param]
        if (param in this.statusOf) {
            this.statusOf[param].reset()
        } else this.statusOf[param] = ValidationStatus.ok()
        const status = this.statusOf[param]
        if (!paramSpec.required && tentative === '') {
            return paramSpec.default
        }
        typeFunctions[paramSpec.type].validate.call(
            paramSpec,
            tentative,
            status
        )
        if (status.invalid()) return undefined
        const realizer = typeFunctions[paramSpec.type].realize as (
            this: typeof paramSpec,
            t: string
        ) => RealizedPropertyType[typeof paramSpec.type]
        const realization = realizer.call(paramSpec, tentative)
        if (paramSpec.validate) {
            paramSpec.validate.call(this, realization, status)
        }
        if (status.invalid()) return undefined
        return realization
    }
    /** xmd */
    checkParameters(
        _params: ParamValues<GenericParamDescription>
    ): ValidationStatus /* **/ {
        return ValidationStatus.ok()
    }
    /** xmd
:   Given an object containing a potential realized value for each parameter
    of this `Paramable` object, this method should perform any dependency
    checks that involve multiple parameters or other state of the object,
    and return a ValidationStatus accordingly. (Checks that only involve
    a single parameter should be encoded in the `validate()` method of the
    [`ParamInterface` object](../shared/Paramable.md) describing that
    parameter.) This method is called from the base class implementation of
    `validate()`, and will copy the returned status of `checkParameters()`
    into the `validationStatus` property of the `Paramable` object. With this
    mechanism, you don't have to worry about realizing the parameters yourself,
    and you generally shouldn't need to override or extend the `validate()`
    method. Just implement `checkParameters()` if you have any interdependency
    checks among your parameters. Note that the base class implementation
    performs no checks and simply returns a good status. Hence, it is a good
    habit to start derived implementations with, e.g.,

    `const status = super().checkParamaters()`

    and then update `status` (with methods like `.addError()` and
    `.addWarning()` as you perform your checks, finally returning it at the
    end.

    Finally, one caveat: this method being called is no guarantee that the
    provided values _will_ be assigned into the internal properties of the
    `Paramable` object as the new "official" values, so don't presume the
    values in the `params` argument are necessarily the new correct ones
    and save them away or start computing with them, in this method. Wait
    until after `assignParameters()` has been called, and then use the
    properties that have been written into the object.
<!-- --> **/

    assignParameters(realized?: ParamValues<GenericParamDescription>) {
        if (!realized)
            realized = realizeAll(this.params, this.tentativeValues)

        const props: string[] = []
        const changed = new Set<string>()
        for (const prop in realized) {
            if (!hasField(realized, prop)) continue

            const me = this as Record<string, unknown>
            props.push(prop)
            if (realized[prop] !== me[prop]) {
                // Looks like we might need to change my value of the prop
                // However, we only want to do this if the two items
                // derealize into different strings:
                const param = this.params[prop]
                const derealizer = typeFunctions[param.type].derealize
                const myVersion = derealizer.call(param, me[prop] as never)
                const newVersion = derealizer.call(
                    param,
                    realized[prop] as never
                )
                if (newVersion !== myVersion) {
                    // OK, really have to change
                    me[prop] = realized[prop]
                    changed.add(prop)
                }
            }
        }
        if (changed.size > 0) {
            if (this.parChangePromise) {
                this.parChangePromise.then(() =>
                    this.parametersChanged(changed)
                )
            } else {
                this.parChangePromise = this.parametersChanged(changed)
            }
        }
    }

    refreshParams(which?: Set<string>): void {
        if (!which) which = new Set(Object.keys(this.params))
        const me = this as unknown as ParamValues<GenericParamDescription>
        for (const prop of which) {
            if (!hasField(this, prop)) continue
            const param = this.params[prop]

            const tentative = this.tentativeValues[prop]
            const status = ValidationStatus.ok()
            // No need to validate empty optional params
            if (tentative || param.required)
                typeFunctions[param.type].validate.call(
                    param,
                    tentative,
                    status
                )
            if (status.isValid()) {
                // Skip any parameters that already produce the current value
                if (me[prop] === realizeOne(param, tentative)) continue
            }

            // Can remove any optional values that are the default
            if (!param.required && me[prop] === param.default) {
                this.tentativeValues[prop] = ''
                continue
            }

            this.tentativeValues[prop] = typeFunctions[
                param.type
            ].derealize.call(
                param,
                me[prop] as never // looks odd, TypeScript hack
            )
        }
    }
    /** xmd */
    async parametersChanged(_name: Set<string>): Promise<void> /* **/ {
        return
    }
    /** xmd
:   This method will be called (by the base class implementation) whenever
    the values of one or more parameters have changed.  The _name_ argument
    is a Set of the names of parameters that have changed. Note there can
    be more than one, since sometimes multiple parameters change
    simultaneously, as in a call to `loadQuery()`. In the base class itself,
    this method does nothing, but it may be overridden in derived classes to
    perform any kind of update actions for the parameters listed in _name_.
<!-- --> **/

    get query(): string {
        const tv = this.tentativeValues // just because we use it so many times
        const saveParams: Record<string, string> = {}
        for (const key in tv) {
            // leave out blank/default parameters
            if (tv[key]) {
                const param = this.params[key]
                const defaultString = typeFunctions[
                    param.type
                ].derealize.call(param, param.default as never)
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

    loadQuery(query: string): ParamableInterface {
        const params = new URLSearchParams(query)
        for (const [key, value] of params) {
            if (key in this.tentativeValues) {
                const param = this.params[key]
                if (
                    param.type === ParamType.COLOR
                    && value.match(/^[0-9a-fA-F]{6}$/)
                )
                    this.tentativeValues[key] = '#' + value
                else this.tentativeValues[key] = value
            } else console.warn(`Invalid property ${key} for ${this.name}`)
        }
        return this
    }
}
