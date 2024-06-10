import type {SequenceExportModule} from './SequenceInterface'

// import each module in the current directory with a .ts file extension
const seqFiles = import.meta.glob('./*.ts', {eager: true})

// object we will export
const seqMODULES: {[key: string]: SequenceExportModule} = {}

// for each file in the list of visualizer files...
for (const file in seqFiles) {
    const mod = seqFiles[file] as {exportModule: SequenceExportModule}
    if (mod.exportModule) {
        // add the export module to our object
        seqMODULES[file.replace(/(\.\/|\.ts)/g, '')] = mod.exportModule
    }
}

export default seqMODULES
