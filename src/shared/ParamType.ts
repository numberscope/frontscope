import p5 from 'p5'

import {math, MathFormula} from './math'
import type {ExtendedBigint, MathNode, SymbolNode} from './math'
import type {ParamInterface} from './Paramable'
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
     * Either a bigint or the specific numbers -Infinity or Infinity, to
     * "complete" the integers in both directions. Rendered as a standard
     * input field in the parameter UI.
     */
    EXTENDED_BIGINT,
    /**
     * A mathjs formula (entered as a string in a standard input field)
     * with single free variable `n` for the input. Delivered to the
     * Paramable object as a Formula interface from `./math.ts` that
     * allows you to compute with the formula (by passing in a value for
     * n) and access the original string form of the formula.
     */
    FORMULA,
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
    [ParamType.EXTENDED_BIGINT]: ExtendedBigint
    [ParamType.FORMULA]: MathFormula
    [ParamType.ENUM]: number
    [ParamType.STRING]: string
    [ParamType.NUMBER_ARRAY]: number[]
    [ParamType.BIGINT_ARRAY]: bigint[]
    [ParamType.VECTOR]: p5.Vector
}

type PIObj = ParamInterface<ParamType>

/**
 * `ParamTypeFunctions` contains information about validation and to/from
 * string conversion for supported parameter types. Note that each of these is
 * called with the parameter description as the value of `this`, so that
 * they can if need be refer to the other fields of the description.
 */
export interface ParamTypeFunctions<T> {
    /**
     * Validates a particular input string for a given parameter type,
     * updating the given validation status accordingly.
     * @param {string} value  the input value to be validated
     * @param {ValidationStatus} status  the validation status to update
     */
    validate(this: PIObj, value: string, status: ValidationStatus): void
    /**
     * Converts a particular input string for a given parameter type
     * into a corresponding instance of that parameter type. For example:
     * NUMBER: "32" -> 32
     * VECTOR: "5, 6" -> new p5.Vector(5, 6)
     * @param value the string input value to be converted
     * @return the realized input value
     */
    realize(this: PIObj, value: string): T
    /**
     * Performs the inverse of `realize(...)`, converting the parameter
     * value back into a string to be placed into an input field.
     * @param value the parameter value to be converted back into a string
     * @return the derealized parameter value
     */
    derealize(this: PIObj, value: T): string
}

// Helper function for arrays:
function validateNumbers(
    value: string,
    status: ValidationStatus,
    nParts?: number
) {
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

// Helper function for number types:
function validateExtInt(value: string, status: ValidationStatus) {
    if (value.trim().match(/^-?Infinity$/)) return
    if (value.trim().match(/^-?\d+$/) === null)
        status.addError('Input must be an integer or ±Infinity')
}

const typeFunctions: {
    [K in ParamType]: ParamTypeFunctions<RealizedParamType[K]>
} = {
    [ParamType.BOOLEAN]: {
        validate: function (value, status) {
            if (value.trim().match(/^true|false$/) === null)
                status.addError('Input must be a boolean')
        },
        realize: function (value) {
            return value === 'true'
        },
        derealize: function (value) {
            return `${value}`
        },
    },
    [ParamType.COLOR]: {
        validate: function (value, status) {
            if (
                value
                    .trim()
                    .match(/^(#[0-9A-Fa-f]{3})|(#[0-9A-Fa-f]{6})$/) === null
            )
                status.addError('Input must be a valid color specification')
        },
        realize: function (value) {
            return value
        },
        derealize: function (value) {
            return `${value}`
        },
    },
    [ParamType.NUMBER]: {
        validate: function (value, status) {
            if (
                value.trim().match(/^-?((\d+\.\d*|\.?\d+)|Infinity)$/)
                === null
            )
                status.addError('Input must be a number')
        },
        realize: function (value) {
            return parseFloat(value)
        },
        derealize: function (value) {
            return Number.isNaN(value) ? '' : `${value}`
        },
    },
    [ParamType.INTEGER]: {
        validate: validateExtInt,
        realize: function (value) {
            return parseInt(value)
        },
        derealize: function (value) {
            return Number.isNaN(value) ? '' : `${value}`
        },
    },
    [ParamType.BIGINT]: {
        validate: function (value, status) {
            if (value.trim().match(/^-?\d+$/) === null)
                status.addError('Input must be an integer')
        },
        realize: function (value) {
            return BigInt(value)
        },
        derealize: function (value) {
            return `${value}`
        },
    },
    [ParamType.EXTENDED_BIGINT]: {
        validate: validateExtInt,
        realize: function (value) {
            value = value.trim()
            if (value.endsWith('Infinity')) {
                if (value.startsWith('-')) return math.negInfinity
                else return math.posInfinity
            }
            return BigInt(value)
        },
        derealize: function (value) {
            return `${value}`
        },
    },
    [ParamType.FORMULA]: {
        validate: function (value, status) {
            if (value.length === 0) {
                status.addError(`empty formula not allowed`)
                return
            }
            let parsetree: MathNode | undefined = undefined
            try {
                parsetree = math.parse(value)
            } catch (err: unknown) {
                status.addError(
                    `could not parse formula: ${value}`,
                    (err as Error).message
                )
                return
            }

            const inputSymbols = this.inputs || ['n']
            const othersymbs = parsetree.filter(
                (node, path) =>
                    math.isSymbolNode(node)
                    && path !== 'fn'
                    && !inputSymbols.includes(node.name)
            )
            if (othersymbs.length > 0) {
                status.addError(
                    `free variables limited to ${inputSymbols}; `,
                    `please remove '${(othersymbs[0] as SymbolNode).name}'`
                )
            }
        },
        realize: function (value) {
            return new MathFormula(value, this.inputs || ['n'])
        },
        derealize: function (value) {
            return value.source
        },
    },
    [ParamType.ENUM]: {
        validate: function (value, status) {
            if (value.trim().match(/^-?\d+$/) === null)
                status.addError('Input must be an integer')
        },
        realize: function (value) {
            return parseInt(value)
        },
        derealize: function (value) {
            return `${value as number}`
        },
    },
    [ParamType.STRING]: {
        // Strings are always valid so there is nothing to do.
        // ESlint hates us for that :-)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        validate: function (_value, _status) {},
        realize: function (value) {
            return value
        },
        derealize: function (value) {
            return value
        },
    },
    [ParamType.NUMBER_ARRAY]: {
        validate: validateNumbers,
        realize: function (value) {
            return value
                .trim()
                .split(/\s*[\s,]\s*/)
                .map(part => parseFloat(part))
        },
        derealize: function (value) {
            return value.join(' ')
        },
    },
    [ParamType.BIGINT_ARRAY]: {
        validate: function (value, status) {
            if (value.trim().match(/^(-?\d+(\s*[\s,]\s*-?\d+)*)?$/) === null)
                status.addError(
                    'Input must be a list of integers '
                        + 'separated by whitespace or commas'
                )
        },
        realize: function (value) {
            return value
                .trim()
                .split(/\s*[\s,]\s*/)
                .map(part => BigInt(part))
        },
        derealize: function (value) {
            return value.join(' ')
        },
    },
    [ParamType.VECTOR]: {
        validate: function (value, status) {
            validateNumbers(value, status, 2)
        },
        realize: function (value) {
            const coords = value.split(/\s*[\s,]\s*/)
            return new p5.Vector(parseFloat(coords[0]), parseFloat(coords[1]))
        },
        derealize: function (value) {
            return `${value.x} ${value.y}`
        },
    },
}

export default typeFunctions
