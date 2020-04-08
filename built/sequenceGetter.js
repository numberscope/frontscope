import { SequenceParamsSchema, SequenceError } from './sequenceInterface';
import axios from 'axios';
/**
 *
 * @class SequenceGetter
 * a wrapper for getting sequences from the FlaskBackend
 *
 */
var SequenceGetter = /** @class */ (function () {
    /**
     * constructor
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @param {boolean} finite specifies if the sequence is finite or not. Defaults to true is not given.
     * @memberof SequenceGenerator
     */
    function SequenceGetter(ID, finite) {
        this.name = 'Getter';
        this.description = '';
        this.sequenceParams = [new SequenceParamsSchema()];
        this.generatorSettings = {};
        this.ID = ID;
        this.cache = [];
        this.finite = finite || true;
        this.ready = false;
    }
    /**
     * Sets the sequence parameters based on the user input, constrained by the
     * paramSchema settings that were passed to the UI and returned.
     * Once this is completed, the sequence has enough information to begin generating sequence members.
     * @param paramsFromUser user settings for the sequence passed from the UI
     */
    SequenceGetter.prototype.initialize = function (paramsFromUser) {
        var _this = this;
        var self = this;
        paramsFromUser.forEach(function (param) {
            _this.generatorSettings[param.name] = param.value;
        });
        axios.get('http://localhost:5000/seqnaturals')
            .then(function (resp) {
            console.log(resp);
            //self.cache = resp;
            self.ready = true;
            return;
        });
    };
    /**
     * getElement is how sequences provide their callers with elements.
     */
    SequenceGetter.prototype.getElement = function (n) {
        if (!this.ready)
            return new SequenceError('The sequence is not initialized. Please select all required settings and initialize the sequence.');
        return this.cache[n];
    };
    return SequenceGetter;
}());
export { SequenceGetter };
//# sourceMappingURL=sequenceGetter.js.map