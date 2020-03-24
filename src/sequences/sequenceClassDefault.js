"use strict";
exports.__esModule = true;
var sequenceInterface_1 = require("./sequenceInterface");
/**
 *
 * @class SequenceClassDefault
 * a minimium working example of a sequence class that implements the interface
 * Can be used as a base class for your own sequences.
 *
 */
var SequenceClassDefault = /** @class */ (function () {
    /**
     *Creates an instance of SequenceGenerator.
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    function SequenceClassDefault(ID, finite) {
        this.name = 'Base';
        this.description = '';
        this.sequenceParams = [new sequenceInterface_1.SequenceParamsSchema()];
        this.generatorSettings = {};
        this.generator = function () { return 0; };
        this.ID = ID;
        this.cache = [];
        this.newSize = 1;
        this.finite = finite || true;
        this.ready = false;
    }
    /**
     * Sets the sequence parameters based on the user input, constrained by the
     * paramSchema settings that were passed to the UI and returned.
     * Once this is completed, the sequence has enough information to begin generating sequence members.
     * @param paramsFromUser user settings for the sequence passed from the UI
     */
    SequenceClassDefault.prototype.initialize = function (paramsFromUser) {
        var _this = this;
        paramsFromUser.forEach(function (param) {
            _this.generatorSettings[param.name] = param.value;
        });
        this.generator = function () { return 0; };
        this.ready = true;
    };
    SequenceClassDefault.prototype.resizeCache = function (n) {
        this.newSize = this.cache.length * 2;
        if (n + 1 > this.newSize) {
            this.newSize = n + 1;
        }
    };
    SequenceClassDefault.prototype.fillCache = function () {
        for (var i = this.cache.length; i < this.newSize; i++) {
            this.cache[i] = this.generator(i);
        }
    };
    /**
     * getElement is how sequences provide their callers with elements.
     */
    SequenceClassDefault.prototype.getElement = function (n) {
        if (!this.ready)
            return new sequenceInterface_1.SequenceError('The sequence is not initialized. Please select all required settings and initialize the sequence.');
        if (this.cache[n] != undefined || this.finite) {
            return this.cache[n];
        }
        else {
            this.resizeCache(n);
            this.fillCache();
            return this.cache[n];
        }
    };
    return SequenceClassDefault;
}());
exports.SequenceClassDefault = SequenceClassDefault;
