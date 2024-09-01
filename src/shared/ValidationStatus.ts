export class ValidationStatus {
    public errors: string[]
    public warnings: string[]

    constructor(errors?: string[], warnings?: string[]) {
        this.errors = errors ?? []
        this.warnings = warnings ?? []
    }
    /**
     * Decides whether or not this `ValidationStatus` represents a valid
     * or invalid state, returning `true` if valid, and `false` if invalid.
     * Internally, this decision is based on the presence of error messages.
     * @returns the validity state of this instance
     */
    isValid(): boolean {
        return this.errors.length === 0
    }
    /**
     * The negation of .isValid()
     * @returns {boolean} true if the status is not valid
     */
    invalid(): boolean {
        return !this.isValid()
    }
    /**
     * True if there are any warnings
     * @returns {boolean}
     */
    isWarned(): boolean {
        return !!this.warnings.length
    }
    /**
     * True if there are any errors or warnings
     * @returns {boolean}
     */
    defective(): boolean {
        return !!this.errors.length || !!this.warnings.length
    }
    /**
     * Adds one or more error messages to this `ValidationStatus`. As
     * a result, this instance shifts from a valid state to an invalid
     * one if not already.
     * @param {string, string, ...} error1, error2, ...
     *     the error messages to add
     */
    addError(...errors: string[]) {
        this.errors.push(...errors)
    }
    /**
     * Adds one or more warning messages to this `ValidationStatus`. Note
     * that this does not affect the validity state.
     * @param {string, string, ...} warn1, warn2, ...
     *     the error messages to add
     */
    addWarning(...warnings: string[]) {
        this.warnings.push(...warnings)
    }
    /**
     * Returns a `ValidationStatus` in a valid state, with no warnings
     * @returns the resulting `ValidationStatus`
     */
    static ok(): ValidationStatus {
        return new ValidationStatus()
    }
    /**
     * Returns a `ValidationStatus` in an invalid state with specified
     * error message(s).
     * @param {string, string, ...} error1, error2, ...
     *     the error message(s)
     * @returns {ValidationStatus}
     */
    static error(...errors: string[]): ValidationStatus {
        return new ValidationStatus(errors)
    }
    /**
     * Returns a `ValidationStatus` with no errors but the specified
     * warning(s).
     * @param {string, string, ...} warn1, warn2, ...
     *     the warning(s)
     * @returns {ValidationStatus}
     */
    static warn(...warnings: string[]): ValidationStatus {
        return new ValidationStatus(undefined, warnings)
    }
    /**
     * Returns a `ValidationStatus` which is valid if the given predicate
     * is false, but invalid with appropriate error messages if the given
     * predicate is true.
     * @param {boolean} pred  the predicate to check against
     * @param {string, string, ...} error1, error2, ...
     *     the error message(s) if the predicate succeeds
     * @returns {ValidationStatus}
     */
    static errorIf(pred: boolean, ...errors: string[]): ValidationStatus {
        if (pred) return this.error(...errors)
        else return this.ok()
    }
}
