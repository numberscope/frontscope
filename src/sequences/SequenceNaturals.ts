import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule,
         SequenceExportKind } from './SequenceInterface';
import { SequenceCached } from './SequenceCached';

/**
 *
 * @class SequenceClassNaturals
 * extends SequenceCached with a very simple calculate, mostly by way of an
 * example of using SequenceCached.
 */
class SequenceNaturals extends SequenceCached {
    name = "Natural Numbers";
    description = "A sequence of the natural numbers";
    params: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'includeZero',
        'boolean',
        'Include Zero',
        false,
        false
    )];
    private begin = 1;

    /**
     *Creates an instance of SequenceNaturals
     * @param {*} sequenceID the sequence identifier of the sequence
     */
    constructor (sequenceID: number) {
        super(sequenceID);
    }

    validate(){
        this.settings['name'] = 'Initializing Naturals...';
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

        if (this.settings['includeZero'] !== undefined) {
            this.isValid = true;
            this.name = "Positive Integers";
            if (this.settings['includeZero']) {
                this.begin = 0;
                this.name = "Nonnegative Integers";
            }
            return new ValidationStatus(true);
        }

        this.isValid = false;
        return new ValidationStatus(false, ["includeZero  param is missing"]);
    }

    calculate(n: number) {
        return BigInt(n + this.begin);
    }

}

export const exportModule = new SequenceExportModule(
    SequenceNaturals,
    "Natural Numbers",
    SequenceExportKind.FAMILY
);
