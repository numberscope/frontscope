export class ValidationStatus {
    public errors: string[]

    constructor(errors?: string[]) {
        this.errors = errors !== undefined ? errors : []
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
     * The nagation of .isValid()
     * @returns {boolean} true if the status is not valid
     */
    invalid(): boolean {
        return !this.isValid()
    }
    /**
     * Adds one or more error messages to this `ValidationStatus`. As
     * a result, this instance shifts from a valid state to an invalid
     * one if not already.
     * @param errors the error messages to add
     */
    addError(...errors: string[]) {
        this.errors.push(...errors)
    }
    /**
     * Returns a `ValidationStatus` in a valid state
     * @returns the resulting `ValidationStatus`
     */
    static ok(): ValidationStatus {
        return new ValidationStatus()
    }
    /**
     * Returns a `ValidationStatus` in an invalid state with an appropriate
     * error message.
     * @param error the error message(s)
     * @returns the resulting `ValidationStatus`
     */
    static error(...errors: string[]): ValidationStatus {
        return new ValidationStatus(errors)
    }
    /**
     * Returns a `ValidationStatus` which is valid if the given predicate
     * is false, but invalid with appropriate error messages if the given
     * predicate is true.
     * @param pred the predicate to check against
     * @param errors the error message(s) if the predicate succeedes
     * @return the resulting `ValidationStatus`
     */
    static errorIf(pred: boolean, ...errors: string[]): ValidationStatus {
        if (pred) return this.error(...errors)
        else return this.ok()
    }
}
