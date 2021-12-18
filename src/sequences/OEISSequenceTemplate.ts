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
    params: SequenceParamsSchema[] = [
        new SequenceParamsSchema('oeisId', 'text', 'OEIS ID', true, false),
        new SequenceParamsSchema('name', 'text', 'Name', false, false),
        new SequenceParamsSchema('numElements', 'number', 'Number of Elements (leave blank to fetch up to first 1000)', false, false),
        new SequenceParamsSchema('modulo', 'number', 'Modulo to apply to the sequence', false, false)
    ];

    constructor(sequenceID: number) {
        super(sequenceID); // Don't know the index range yet, will fill in later
    }

    fillCache(): void {
        axios.get(`http://${process.env.VUE_APP_API_URL}/api/get_oeis_sequence/${this.settings.oeisId}/${this.cacheBlock}`)
             .then( resp => {
                 if (this.settings.modulo) {
                     this.cache = resp.data.values.map((x: string) => BigInt(x) % BigInt(this.settings.modulo));
                 } else {
                     this.cache = resp.data.values.map((x: string) => BigInt(x));
                 }
                 while (this.last >= this.first
                        && this.cache[this.last] === undefined) {
                     --this.last;
                 }
                 this.lastCached = this.last;
                 this.cachingTo = this.last;
                 return;
             });
    }

    validate(): ValidationStatus {
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

        this.isValid = false;
        if (this.settings['oeisId'] === undefined) {
            return new ValidationStatus(false, ["oeisID parameter is missing"]);
        }

        this.isValid = true;
        if (this.settings['numElements']) {
            this.last = Number(this.settings['numElements']) - 1;
        } else {
            this.last = 999;
        }
        this.cacheBlock = this.last + 1; // get everything on the initial fill
        this.name = (this.settings['name'] as string);
        return new ValidationStatus(true);
    }

}

export const exportModule = new SequenceExportModule(
    OEISSequenceTemplate,
    "Add OEIS Sequence",
    SequenceExportKind.GETTER
);
