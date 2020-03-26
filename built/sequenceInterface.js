var SequenceParamsSchema = /** @class */ (function () {
    function SequenceParamsSchema(name, type, displayName, defaultValue, required) {
        this.name = name || '';
        this.type = type || '';
        this.displayName = displayName || '';
        this.required = required || false;
        this.value = defaultValue || '';
    }
    return SequenceParamsSchema;
}());
export { SequenceParamsSchema };
var SequenceError = /** @class */ (function () {
    function SequenceError(errorText) {
        this.errorText = errorText;
        this.errorText = errorText;
    }
    return SequenceError;
}());
export { SequenceError };
//# sourceMappingURL=sequenceInterface.js.map