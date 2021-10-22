import { VisualizerExportModule } from './VisualizerInterface'
const vizFiles = require.context('.', false, /\.ts$/)

const vizMODULES: { [key: string]: VisualizerExportModule } = {};

const vizKeyArray: string[] = [];
vizFiles.keys().forEach((key) => {
    if (key === './index.js' || key === './modules.js') return
    const exprt = vizFiles(key)
    if (exprt.exportModule) {
        vizKeyArray.push(key)
        vizMODULES[key.replace(/(\.\/|\.ts)/g, '')] = exprt.exportModule
    }
})

export default vizMODULES;
