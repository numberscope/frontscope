import type {VisualizerExportModule} from './VisualizerInterface'

// import each module in the current directory with a .ts file extension
const vizFiles = import.meta.globEager('./*.ts')

// object we will export
const vizMODULES: {[key: string]: VisualizerExportModule} = {}

// for each file in the list of visualizer files...
for (const file in vizFiles) {
    // if it has an export module...
    if (vizFiles[file].exportModule) {
        // add the export module to our object
        vizMODULES[file.replace(/(\.\/|\.ts)/g, '')] =
            vizFiles[file].exportModule
    }
}

export default vizMODULES
