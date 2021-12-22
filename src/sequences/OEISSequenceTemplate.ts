import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule,
         SequenceExportKind } from './SequenceInterface';
import { SequenceCached } from './SequenceCached';

import axios from 'axios'

/**
 *
 * @class OEISSequenceTemplate
 * An extension of SequenceCached for getting sequences from backscope,
 * the Flask backend.
 * 
 */
export default class OEISSequenceTemplate extends SequenceCached {
    name = 'OEIS Sequence Template';
    description = 'Factory for obtaining sequences from the OEIS';
    oeisSeq = true;
    modulo = 0n;
    cacheBlock = 1000;

    params: SequenceParamsSchema[] = [
        new SequenceParamsSchema('oeisId', 'text', 'OEIS ID', true, false),
        new SequenceParamsSchema('name', 'text', 'Name', false, false),
        new SequenceParamsSchema('numElements', 'number', 'Number of Elements (leave blank to fetch up to first 1000)', false, false),
        new SequenceParamsSchema('modulo', 'number', 'Modulo to apply to the sequence', false, false)
    ];

    constructor(sequenceID: number) {
        super(sequenceID); // Don't know the index range yet, will fill in later
    }

    async fillCache(): Promise<void> {
        const resp = await axios.get(
            `http://${process.env.VUE_APP_API_URL}/api/`
            + `get_oeis_values/${this.settings.oeisId}/${this.cacheBlock}`);
        this.first = Infinity;
        this.last = -Infinity;
        for (const k in resp.data.values) {
            const index = Number(k);
            if (index < this.first) this.first = index;
            if (index > this.last)  this.last  = index;
            this.cache[index] = BigInt(resp.data.values[k]);
            if (this.modulo) this.cache[index] %= this.modulo;
        }
        if (this.first === Infinity) {
            /* An empty sequence; perhaps a mistaken OEIS ID. Is there
               any other action we should take in this case?
            */
            this.first = 0;
            this.last = -1;
        }
        this.lastCached = this.last;
        this.cachingTo = this.last;
    }

    validate(): ValidationStatus {
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

        const messages: string[] = [];
        if (!this.settings['oeisId']) {
            messages.push('oeisID parameter is missing');
        }
        if (this.settings['numElements']) {
            this.cacheBlock = Number(this.settings['numElements']);
            if (!Number.isInteger(this.cacheBlock)) {
                messages.push(`Number "${this.settings['numElements']}" `
                              + ' of elements is not an integer.');
            }
        }
        if (this.settings['modulo']) {
            try {
                this.modulo = BigInt(this.settings['modulo']);
            } catch (syntaxError) { // is there any way to only catch those?
                messages.push('modulo must be an integer: '
                              + syntaxError.message);
            }
        }
        this.name = (this.settings['name'] as string);
        this.isValid = (messages.length === 0);
        return new ValidationStatus(this.isValid, messages);
    }
}

export const exportModule = new SequenceExportModule(
    OEISSequenceTemplate,
    "Add OEIS Sequence",
    SequenceExportKind.GETTER
);
