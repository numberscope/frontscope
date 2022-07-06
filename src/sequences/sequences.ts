import type {SequenceExportModule} from './SequenceInterface'

// import each module in the current directory with a .ts file extension
const seqFiles = import.meta.globEager('./*.ts')

// object we will export
const seqMODULES: {[key: string]: SequenceExportModule} = {}

// for each file in the list of visualizer files...
for (const file in seqFiles) {
    if (seqFiles[file].exportModule) {
        // add the export module to our object
        seqMODULES[file.replace(/(\.\/|\.ts)/g, '')] =
            seqFiles[file].exportModule
    }
}

export default seqMODULES
