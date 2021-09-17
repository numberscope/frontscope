const seqFiles = require.context('.', false, /\.ts$/)
const seqMODULES: { [key: string]: Function } = {};
const seqKeyArray: string[] = [];
seqFiles.keys().forEach((key) => {
     if (key === './index.js' || key === './modules.js') return
     seqKeyArray.push(key)
     seqMODULES[key.replace(/(\.\/|\.ts)/g, '')] = seqFiles(key)
})

module.exports = seqMODULES;