import type {VisualizerExportModule} from './VisualizerInterface'

// import each module in the current directory with a .ts file extension. if
// Frontscope is running in workbench mode, also load each module in the
// neighboring `visualizers-workbench` directory with a .ts extension
let vizFiles
if (import.meta.env.VITE_WORKBENCH === '1') {
    vizFiles = import.meta.glob(['./*.ts', '../visualizers-workbench/*.ts'], {
        eager: true,
    })
} else {
    vizFiles = import.meta.glob('./*.ts', {eager: true})
}

// object we will export
const vizMODULES: {[key: string]: VisualizerExportModule} = {}

// for each file in the list of visualizer files...
for (const file in vizFiles) {
    const mod = vizFiles[file] as {exportModule: VisualizerExportModule}
    // if it has an export module...
    if (mod.exportModule) {
        // add the export module to our object
        vizMODULES[file.replace(/(\.\/|\.ts)/g, '')] = mod.exportModule
    }
}

export default vizMODULES
