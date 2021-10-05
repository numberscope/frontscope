import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema } from './SequenceInterface';
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
        new SequenceParamsSchema('oeisId', 'text', 'OEIS ID', false, false),
        new SequenceParamsSchema('name', 'text', 'Name', false, false),
        new SequenceParamsSchema('numElements', 'number', 'Number of Elements (leave blank to fetch up to first 1000)', false, false),
        new SequenceParamsSchema('modulo', 'number', 'Modulo to apply to the sequence', false, false)
    ];

    constructor(ID: number) {
       super(ID);
    }

    fillCache(): void {
        console.log("populating");
        axios.get(`http://${process.env.VUE_APP_API_URL}/api/get_oeis_sequence/${this.settings.oeisId}/${this.newSize}`)
             .then( resp => {
                 if (this.settings.modulo) {
                     this.cache = resp.data.values.map((x: string) => BigInt(x) % BigInt(this.settings.modulo));
                 } else {
                     this.cache = resp.data.values.map((x: string) => BigInt(x));
                 }
                 console.log(this.cache);
                 return;
             });
    }

    validate(): ValidationStatus {
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

        if (this.settings['oeisId'] !== undefined) {
            this.isValid = true;
            if (this.settings['numElements']) {
                this.entries = Number(this.settings['numElements']);
            }
            this.name = (this.settings['name'] as string);
            return new ValidationStatus(true);
        }

        this.isValid = false;
        return new ValidationStatus(false, ["oeisID paramter is missing"]);
    }

}
