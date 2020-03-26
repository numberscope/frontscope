"use strict";
exports.__esModule = true;
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
exports.SequenceParamsSchema = SequenceParamsSchema;
var SequenceError = /** @class */ (function () {
    function SequenceError(errorText) {
        this.errorText = errorText;
        this.errorText = errorText;
    }
    return SequenceError;
}());
exports.SequenceError = SequenceError;
