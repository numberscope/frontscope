import { ValidationStatus } from '@/shared/validationStatus';
import { SequenceInterface, SequenceParamsSchema, SequenceExportModule } from './sequenceInterface';
/**
 *
 * @class SequenceConstant
 * extends the sequenceClassDefault, by setting params and some custom implementation
 * for the generator and the fillCache function.
 */
class SequenceConstant implements SequenceInterface{
    ID: number;
    name = "Constant Sequence";
    description = "A sequence that is constant";
    params: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'constantValue',
        'number',
        'Constant Value',
        false,
        '0'
    )];
    private settings: { [key: string]: string|number|boolean} = {};
    private requested = 0;
    private ready = false;
    private finite = false;
    private isValid = false;

    constructor(ID: number, finite?: boolean) {
        this.ID = ID;
        this.finite = finite || true;
        this.ready = false;
    }

    initialize(){
        if(this.isValid){
            this.ready = true;
            return;
        } else {
            throw "Sequence is not valid. Run validate() and address any errors."
        }
    }

    validate(): ValidationStatus{
		this.params.forEach(param => {
            this.settings[param.name] = param.value;
		});

        if(this.settings['constantValue'] !== undefined) {
            return new ValidationStatus(true);
        } else {
            return new ValidationStatus(false, ["No constant value was provided."]);
        }
    }

    getElement(n: number) {
        this.requested = n;
        return Number(this.settings.constantValue);
    }
}

export const exportModule = new SequenceExportModule(
    SequenceConstant,
    "Constant Sequence"
);
