const files = require.context('.', false, /\.ts$/)
const MODULES: { [key: string]: any } = {};
const keyArray: string[] = [];
files.keys().forEach((key) => {
     if (key === './index.js' || key === './modules.js') return
     keyArray.push
     MODULES[key.replace(/(\.\/|\.ts)/g, '')] = files(key)
})

module.exports = MODULES;
