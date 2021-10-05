import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule } from './SequenceInterface';
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
    private offset = 1;

    /**
     *Creates an instance of SequenceNaturals
     * @param {*} ID the ID of the sequence
     */
    constructor (ID: number) {
        super(ID);
    }

    validate(){
        this.settings['name'] = 'Constant';
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

        if (this.settings['includeZero'] !== undefined) {
            this.isValid = true;
            this.name = "Positive Integers";
            if (this.settings['includeZero']) {
                this.offset = 0;
                this.name = "Nonnegative Integers";
            }
            return new ValidationStatus(true);
        }

        this.isValid = false;
        return new ValidationStatus(false, ["includeZero  param is missing"]);
    }

    calculate(n: number) {
        return n + this.offset;
    }

}

export const exportModule = new SequenceExportModule(
    SequenceNaturals,
    "Natural Numbers"
);
