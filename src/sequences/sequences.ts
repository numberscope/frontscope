import {SequenceExportModule} from './SequenceInterface'
import {OEIS} from './OEIS'

// import each module in the current directory with a .ts file extension
const seqFiles = import.meta.glob('./*.ts', {eager: true})

// object we will export
export const seqMODULES: {[key: string]: SequenceExportModule} = {}

// for each file in the list of visualizer files...
for (const file in seqFiles) {
    const mod = seqFiles[file] as {exportModule: SequenceExportModule}
    if (mod.exportModule) {
        // add the export module to our object
        seqMODULES[file.replace(/(\.\/|\.ts)/g, '')] = mod.exportModule
    }
}

async function patchOEISdescription(oeisKey: string) {
    const module = seqMODULES[oeisKey]
    const sequence = module.factory() as OEIS
    await sequence.cacheValues(0n)
    module.description = sequence.description
}

/**
 * Make the OEIS sequence with a given ID available
 * as a card in the Sequence Switcher, and as a valid
 * sequenceKey in a Specimen.
 * @param {string} id  The OEIS ID to enable
 */
export function enableOEIS(id: string) {
    const oeisKey = `OEIS ${id}`
    if (oeisKey in seqMODULES) return
    seqMODULES[oeisKey] = new SequenceExportModule(
        () => new OEIS(id),
        oeisKey,
        '...sequence loading...'
    )
    return patchOEISdescription(oeisKey)
}

export function produceSequence(key: string) {
    const checkOEIS = key.match(/^OEIS\s(A\d{6})/)
    if (checkOEIS) enableOEIS(checkOEIS[1])
    return seqMODULES[key].factory()
}
