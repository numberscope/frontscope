import {ValidationStatus} from './ValidationStatus'
import p5 from 'p5'
/**
 * `ParamType` is the enum of all supported parameter types for visualizers
 * and sequences. These types are supported by the interface and internal
 * type checker
 */
export enum ParamType {
    /**
     * A true or false value, realized as a `boolean`, and rendered as a
     * checkbox in the parameter UI.
     */
    BOOLEAN,
    /**
     * A color value, realized as a hex code string, and rendered as a
     * color picker in the parameter UI.
     */
    COLOR,
    /**
     * A floating point numerical value, realized as a `number`, and
     * rendered as a standard input field in the parameter UI.
     */
    NUMBER,
    /**
     * An integer numerical value, realized as a `number`, and rendered
     * as a standard input field in the parameter UI.
     */
    INTEGER,
    /**
     * An integer numerical value, realized as a `bigint`, and rendered
     * as a standard input field in the parameter UI.
     */
    BIGINT,
    /**
     * An enum value, i.e. one of a list of options. Realized as a
     * number, and rendered as a drop down menu in the parameter UI.
     */
    ENUM,
    /**
     * A regular string value. Realized as `string` and rendered as
     * a standard input field in the parameter UI.
     */
    STRING,
    /**
     * An array of numbers realized as a `number[]`. It is rendered
     * as a standard input field, but is expected to take the form
     * of a comma separated list of floating point numbers.
     */
    NUMBER_ARRAY,
    /**
     * An array of integers realized as a `bigint[]`. It is rendered
     * as a standard input field, but is expected to take the form
     * of a comma separated list of integers.
     */
    BIGINT_ARRAY,
    /**
     * A two-element vector, realized as `p5.Vector`. It is rendered
     * as a standard input field, but is expected to take the form
     * of two floating point numbers separated by a comma.
     */
    VECTOR,
}
/**
 * `ParamTypeFunctions` contains information about validation and to/from
 * string conversion for supported parameter types
 */
export interface ParamTypeFunctions {
    /**
     * Validates a particular input string for a given parameter type,
     * returning a `ValidationStatus` as a result
     * @param value the string input value to be validated
     * @return the resultant validation status
     */
    validate(value: string): ValidationStatus
    /**
     * Converts a particular input string for a given parameter type
     * into a corresponding instance of that parameter type. For example:
     * NUMBER: "32" -> 32
     * VECTOR: "5, 6" -> new p5.Vector(5, 6)
     * @param value the string input value to be converted
     * @return the realized input value
     */
    realize(value: string): unknown
    /**
     * Performs the inverse of `realize(...)`, converting the parameter
     * value back into a string to be placed into an input field.
     * @param value the parameter value to be converted back into a string
     * @return the derealized parameter value
     */
    derealize(value: unknown): string
}

const typeFunctions: {[key in ParamType]: ParamTypeFunctions} = {
    [ParamType.BOOLEAN]: {
        validate: value =>
            ValidationStatus.errorIf(
                value.trim().match(/^true|false$/) === null,
                'Input must be a boolean'
            ),
        realize: value => value === 'true',
        derealize: value => `${value}`,
    },
    [ParamType.COLOR]: {
        validate: value =>
            ValidationStatus.errorIf(
                value
                    .trim()
                    .match(/^(#[0-9A-Fa-f]{3})|(#[0-9A-Fa-f]{6})$/) === null,
                'Input must be a number'
            ),
        realize: value => value,
        derealize: value => `${value}`,
    },
    [ParamType.NUMBER]: {
        validate: value =>
            ValidationStatus.errorIf(
                value.trim().match(/^-?(\d+\.\d*|\.?\d+)$/) === null,
                'Input must be a number'
            ),
        realize: value => parseFloat(value),
        derealize: value => `${value}`,
    },
    [ParamType.INTEGER]: {
        validate: value =>
            ValidationStatus.errorIf(
                value.trim().match(/^-?\d+$/) === null,
                'Input must be an integer'
            ),
        realize: value => parseInt(value),
        derealize: value => `${value}`,
    },
    [ParamType.BIGINT]: {
        validate: value =>
            ValidationStatus.errorIf(
                value.trim().match(/^-?\d+$/) === null,
                'Input must be an integer'
            ),
        realize: value => BigInt(value),
        derealize: value => `${value}`,
    },
    [ParamType.ENUM]: {
        validate: value =>
            ValidationStatus.errorIf(
                value.trim().match(/^-?\d+$/) === null,
                'Input must be an integer'
            ),
        realize: value => parseInt(value),
        derealize: value => `${value as number}`,
    },
    [ParamType.STRING]: {
        validate: _value => ValidationStatus.ok(),
        realize: value => value,
        derealize: value => `${value}`,
    },
    [ParamType.NUMBER_ARRAY]: {
        validate: value =>
            ValidationStatus.errorIf(
                value
                    .trim()
                    .match(
                        /^(-?(\d+\.\d*|\.?\d+)(\s,\s-?(\d+\.\d*|\.?\d+))*)?$/
                    ) === null,
                'Input must be a comma-separated list of numbers'
            ),
        realize: value => {
            const numbers = value.split(',')
            const array = []
            for (const number in numbers)
                array.push(parseFloat(number.trim()))
            return array
        },
        derealize: value => (value as number[]).join(', '),
    },
    [ParamType.BIGINT_ARRAY]: {
        validate: value =>
            ValidationStatus.errorIf(
                value.trim().match(/^(-?\d+(\s,\s-?\d+)*)?$/) === null,
                'Input must be a comma-separated list of integers'
            ),
        realize: value => {
            const numbers = value.split(',')
            const array = []
            for (const number in numbers) array.push(BigInt(number.trim()))
            return array
        },
        derealize: value => (value as bigint[]).join(', '),
    },
    [ParamType.VECTOR]: {
        validate: value =>
            ValidationStatus.errorIf(
                value
                    .trim()
                    .match(
                        /^-?(\d+\.\d*|\.?\d+)\s,\s-?(\d+\.\d*|\.?\d+)$/
                    ) === null,
                'Input must be two comma-separated numbers'
            ),
        realize: value => {
            const numbers = value.split(',')
            return new p5.Vector(
                parseFloat(numbers[0].trim()),
                parseFloat(numbers[1].trim())
            )
        },
        derealize: value =>
            `${(value as p5.Vector).x}, ${(value as p5.Vector).y}`,
    },
}

export default typeFunctions
