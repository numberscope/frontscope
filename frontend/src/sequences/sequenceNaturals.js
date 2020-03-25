"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var sequenceClassDefault_1 = require("./sequenceClassDefault");
var sequenceInterface_1 = require("./sequenceInterface");
/**
 *
 * @class SequenceClassNaturals
 * extends the sequenceClassDefault, by setting params and some custom implementation
 * for the generator and the fillCache function.
 */
var SequenceNaturals = /** @class */ (function (_super) {
    __extends(SequenceNaturals, _super);
    /**
     *Creates an instance of SequenceGenerator.
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    function SequenceNaturals(ID, finite) {
        var _this = _super.call(this, ID, finite) || this;
        _this.name = "Naturals";
        _this.description = "A sequence of the natural numbers";
        _this.paramsSchema = new sequenceInterface_1.SequenceParamsSchema('includeZero', 'boolean', 'Include Zero', 'false', false);
        return _this;
    }
    SequenceNaturals.prototype.initialize = function (paramsFromUser) {
        var _this = this;
        if (paramsFromUser) {
            paramsFromUser.forEach(function (param) {
                _this.generatorSettings[param.name] = param.value;
            });
        }
        this.generator = function (n) {
            if (this.generatorSettings['includeZero'])
                return n + 1;
            else
                return n;
        };
        this.ready = true;
        this.newSize = 100;
        this.fillCache();
    };
    SequenceNaturals.prototype.fillCache = function () {
        for (var i = this.cache.length; i < this.newSize; i++) {
            //the generator is given the cache since it would make computation more efficient sometimes
            //but the generator doesn't necessarily need to take more than one argument.
            this.cache[i] = this.generator(i);
        }
    };
    return SequenceNaturals;
}(sequenceClassDefault_1.SequenceClassDefault));
exports.SequenceNaturals = SequenceNaturals;
