const MODULES = require('@/modules/modules.js');
const SEQUENCES = require('@/sequences/sequences.js');

const Scope = {
    modules: MODULES,
    sequences: SEQUENCES,
    sequence: SEQUENCES['sequenceNaturals'],
    state: {
        // Javascript interprets these strings as objects
        activeViz: 'moduleTurtle',
        activeSeq: 'sequenceNaturals',
    }
}

module.exports = Scope;
