const MODULES = require('../modules/modules.js');
const SEQUENCES = require('../sequences/sequences.js');

const Scope = {
    modules: MODULES,
    sequences: SEQUENCES,
    state: {
        activeViz: 'turtle'
    }
}

module.exports = Scope;
