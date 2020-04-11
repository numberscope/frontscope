const files = require.context('.', false, /\.js$/)
const MODULES = {};
files.keys().forEach((key) => {
     if (key === './index.js' || key === './modules.js') return
     MODULES[key.replace(/(\.\/|\.js)/g, '')] = files(key)
})

module.exports = MODULES;
