const vizFiles = require.context('.', false, /\.ts$/)
const vizMODULES: { [key: string]: Function } = {};
const vizKeyArray: string[] = [];
vizFiles.keys().forEach((key) => {
     if (key === './index.js' || key === './modules.js') return
     vizKeyArray.push(key)
     vizMODULES[key.replace(/(\.\/|\.ts)/g, '')] = vizFiles(key)
})

module.exports = vizMODULES;
