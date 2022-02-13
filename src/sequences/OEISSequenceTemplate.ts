import {ValidationStatus} from '@/shared/ValidationStatus'
import {SequenceExportModule, SequenceExportKind} from './SequenceInterface'
import {SequenceCached} from './SequenceCached'

import axios from 'axios'

/**
 *
 * @class OEISSequenceTemplate
 * An extension of SequenceCached for getting sequences from backscope,
 * the Flask backend.
 *
 */
export default class OEISSequenceTemplate extends SequenceCached {
    name = 'OEIS Sequence Template'
    description = 'Factory for obtaining sequences from the OEIS'
    oeisSeq = true
    cacheBlock = 1000
    oeisId = {value: '', displayName: 'OEIS ID', required: true}
    userName = {value: '', displayName: 'Name', required: false}
    numElements = {
        value: BigInt(this.cacheBlock),
        displayName: 'Number of Elements',
        required: false,
        description: 'How many elements to try to fetch from the database.',
    }
    modulo = {
        value: 0n,
        displayName: 'Modulo',
        required: false,
        description:
            'If nonzero, take the residue of each element to this modulus.',
    }
    params = {
        oeisId: this.oeisId,
        userName: this.userName,
        numElements: this.numElements,
        modulo: this.modulo,
    }

    constructor(sequenceID: number) {
        super(sequenceID) // Don't know the index range yet, will fill in later
    }

    async fillCache(): Promise<void> {
        const backendUrl
            = `http://${process.env.VUE_APP_API_URL}/api/`
            + `get_oeis_values/${this.oeisId.value}/${this.cacheBlock}`
        console.log('Fetching', backendUrl)
        const resp = await axios.get(backendUrl)
        this.first = Infinity
        this.last = -Infinity
        for (const k in resp.data.values) {
            const index = Number(k)
            if (index < this.first) this.first = index
            if (index > this.last) this.last = index
            this.cache[index] = BigInt(resp.data.values[k])
            if (this.modulo.value) this.cache[index] %= this.modulo.value
        }
        if (this.first === Infinity) {
            /* An empty sequence; perhaps a mistaken OEIS ID. Is there
               any other action we should take in this case?
            */
            this.first = 0
            this.last = -1
        }
        this.lastCached = this.last
        this.cachingTo = this.last
    }

    checkParameters(): ValidationStatus {
        const status = super.checkParameters()

        if (
            this.oeisId.value.length !== 7
            || (this.oeisId.value[0] !== 'A' && this.oeisId.value[0] !== 'a')
        ) {
            status.isValid = false
            status.errors.push('OEIS IDs are of form Annnnnn')
        }

        return status
    }

    initialize(): void {
        this.name = this.userName.value || this.oeisId.value
        if (this.numElements.value) {
            this.cacheBlock = Number(this.numElements.value)
        }
        console.log('Producing', this.numElements.value, this.cacheBlock)
        super.initialize()
    }
}

export const exportModule = new SequenceExportModule(
    OEISSequenceTemplate,
    'Add OEIS Sequence',
    SequenceExportKind.GETTER
)
