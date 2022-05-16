import {SequenceExportModule} from './SequenceInterface'
const seqFiles = require.context('.', false, /\.ts$/)

const seqMODULES: {[key: string]: SequenceExportModule} = {}

const seqKeyArray: string[] = []
seqFiles.keys().forEach(key => {
    if (key === './index.js' || key === './modules.js') return
    const exprt = seqFiles(key)
    if (exprt.exportModule) {
        seqKeyArray.push(key)
        seqMODULES[key.replace(/(\.\/|\.ts)/g, '')] = exprt.exportModule
    }
})

export default seqMODULES
