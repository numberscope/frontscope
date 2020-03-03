const MODULES = require('../modules/modules.js');

const Scope = {
    modules: MODULES,
    state: {
        activeViz: 'turtle'
    }
}

module.exports = Scope;