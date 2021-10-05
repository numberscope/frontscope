import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule } from './SequenceInterface';
import { SequenceClassDefault } from './SequenceClassDefault';

/**
 *
 * @class SequenceConstant
 * Extends the sequenceClassDefault, by changing the parameter schema
 * and reimplementing the getElement function.
 */
class SequenceConstant extends SequenceClassDefault {
    name = "Constant Sequence";
    description = "A sequence that is constant";
    params = [new SequenceParamsSchema(
        'constantValue',
        'number',
        'Constant Value',
        false,
        '0'
    )];
    value = -1;

    constructor(ID: number) {
        super(ID);
    }

    validate(): ValidationStatus {
        this.settings['name'] = 'Constant';
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

        if (this.settings['constantValue'] !== undefined) {
            this.isValid = true;
            this.value = Number(this.settings['constantValue']);
            this.name = 'Constant = ' + this.settings['constantValue'];
            return new ValidationStatus(true);
        }

        this.isValid = false;
        return new ValidationStatus(false, ["No constant value was provided."]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getElement(n: number) {
        return this.value;
    }
}

export const exportModule = new SequenceExportModule(
    SequenceConstant,
    "Constant Sequence"
);
