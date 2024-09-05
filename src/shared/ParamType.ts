import p5 from 'p5'

import {ValidationStatus} from './ValidationStatus'

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
     * An array of numbers realized as a `number[]`. It is rendered as a
     * standard input field, but is expected to take the form of a list
     * of floating point numbers separated by whitespace or commas.
     */
    NUMBER_ARRAY,
    /**
     * An array of integers realized as a `bigint[]`. It is rendered
     * as a standard input field, but is expected to take the form
     * of a list of integers spearated by whitespace or commas.
     */
    BIGINT_ARRAY,
    /**
     * A two-element vector, realized as `p5.Vector`. It is rendered
     * as a standard input field, but is expected to take the form of
     * two floating point numbers separated by whitespace or a comma.
     */
    VECTOR,
}
/**
 * A mapping of the parameter types to their realized TypeScript types
 */
export type RealizedParamType = {
    [ParamType.BOOLEAN]: boolean
    [ParamType.COLOR]: string
    [ParamType.NUMBER]: number
    [ParamType.INTEGER]: number
    [ParamType.BIGINT]: bigint
    [ParamType.ENUM]: number
    [ParamType.STRING]: string
    [ParamType.NUMBER_ARRAY]: number[]
    [ParamType.BIGINT_ARRAY]: bigint[]
    [ParamType.VECTOR]: p5.Vector
}
/**
 * `ParamTypeFunctions` contains information about validation and to/from
 * string conversion for supported parameter types
 */
export interface ParamTypeFunctions<T> {
    /**
     * Validates a particular input string for a given parameter type,
     * updating the given validation status accordingly.
     * @param {string} value  the input value to be validated
     * @param {ValidationStatus} status  the validation status to update
     */
    validate(value: string, status: ValidationStatus): void
    /**
     * Converts a particular input string for a given parameter type
     * into a corresponding instance of that parameter type. For example:
     * NUMBER: "32" -> 32
     * VECTOR: "5, 6" -> new p5.Vector(5, 6)
     * @param value the string input value to be converted
     * @return the realized input value
     */
    realize(value: string): T
    /**
     * Performs the inverse of `realize(...)`, converting the parameter
     * value back into a string to be placed into an input field.
     * @param value the parameter value to be converted back into a string
     * @return the derealized parameter value
     */
    derealize(value: T): string
}

// Helper function for arrays:
const validateNumbers = (
    value: string,
    status: ValidationStatus,
    nParts?: number
) => {
    const parts = value.trim().split(/\s*[\s,]\s*/)
    let bad = parts.some(part => isNaN(Number(part)))
    let many = ' '
    if (nParts && nParts > 1 && parts.length !== nParts) {
        bad = true
        many = `${nParts} `
    }
    if (bad)
        status.addError(
            `Input must be a list of ${many}`
                + 'numbers separated by whitespace or commas'
        )
}

const typeFunctions: {
    [K in ParamType]: ParamTypeFunctions<RealizedParamType[K]>
} = {
    [ParamType.BOOLEAN]: {
        validate: (value, status) => {
            if (value.trim().match(/^true|false$/) === null)
                status.addError('Input must be a boolean')
        },
        realize: value => value === 'true',
        derealize: value => `${value}`,
    },
    [ParamType.COLOR]: {
        validate: (value, status) => {
            if (
                value
                    .trim()
                    .match(/^(#[0-9A-Fa-f]{3})|(#[0-9A-Fa-f]{6})$/) === null
            )
                status.addError('Input must be a valid color specification')
        },
        realize: value => value,
        derealize: value => `${value}`,
    },
    [ParamType.NUMBER]: {
        validate: (value, status) => {
            if (
                value.trim().match(/^-?((\d+\.\d*|\.?\d+)|Infinity)$/)
                === null
            )
                status.addError('Input must be a number')
        },
        realize: value => parseFloat(value),
        derealize: value => (Number.isNaN(value) ? '' : `${value}`),
    },
    [ParamType.INTEGER]: {
        validate: (value, status) => {
            if (value.trim().match(/^-?Infinity$/)) return
            if (value.trim().match(/^-?\d+$/) === null)
                status.addError('Input must be an integer')
        },
        realize: value => parseInt(value),
        derealize: value => (Number.isNaN(value) ? '' : `${value}`),
    },
    [ParamType.BIGINT]: {
        validate: (value, status) => {
            if (value.trim().match(/^-?\d+$/) === null)
                status.addError('Input must be an integer')
        },
        realize: value => BigInt(value),
        derealize: value => `${value}`,
    },
    [ParamType.ENUM]: {
        validate: (value, status) => {
            if (value.trim().match(/^-?\d+$/) === null)
                status.addError('Input must be an integer')
        },
        realize: value => parseInt(value),
        derealize: value => `${value as number}`,
    },
    [ParamType.STRING]: {
        // Strings are always valid so there is nothing to do.
        // ESlint hates us for that :-)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        validate: (_value, _status) => {},
        realize: value => value,
        derealize: value => `${value}`,
    },
    [ParamType.NUMBER_ARRAY]: {
        validate: validateNumbers,
        realize: value =>
            value
                .trim()
                .split(/\s*[\s,]\s*/)
                .map(part => parseFloat(part)),
        derealize: value => (value as number[]).join(' '),
    },
    [ParamType.BIGINT_ARRAY]: {
        validate: (value, status) => {
            if (value.trim().match(/^(-?\d+(\s*[\s,]\s*-?\d+)*)?$/) === null)
                status.addError(
                    'Input must be a list of integers '
                        + 'separated by whitespace or commas'
                )
        },
        realize: value =>
            value
                .trim()
                .split(/\s*[\s,]\s*/)
                .map(part => BigInt(part)),
        derealize: value => (value as bigint[]).join(' '),
    },
    [ParamType.VECTOR]: {
        validate: (value, status) => validateNumbers(value, status, 2),
        realize: value => {
            const coords = value.split(/\s*[\s,]\s*/)
            return new p5.Vector(parseFloat(coords[0]), parseFloat(coords[1]))
        },
        derealize: value =>
            `${(value as p5.Vector).x} ${(value as p5.Vector).y}`,
    },
}

export default typeFunctions
