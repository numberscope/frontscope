const files = require.context('.', false, /\.js/)
const MODULES = {};
files.keys().forEach((key) => {
     if (key === './index.js') return
     MODULES[key.replace(/(\.\/|\.vue)/g, '')] = files(key)
})

//Add new modules to this constant.
console.log(MODULES);

module.exports = MODULES;

/*jshint ignore:start */
/*
MODULES["Turtle"] = require('./moduleTurtle.js');
MODULES["ShiftCompare"] = require('./moduleShiftCompare.js');
MODULES["Differences"] = require('./moduleDifferences.js');
MODULES["ModFill"] = require('./moduleModFill.js');
*/
