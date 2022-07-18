import type {VisualizerExportModule} from './VisualizerInterface'

// import each module in the current directory with a .ts file extension
const vizFiles = import.meta.glob('./*.ts', {eager: true})

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
