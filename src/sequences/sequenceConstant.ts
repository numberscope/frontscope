import { SequenceClassDefault } from './sequenceClassDefault';
import { SequenceParamsSchema, SequenceExportModule} from './sequenceInterface';
/**
 *
 * @class SequenceConstant
 * extends the sequenceClassDefault, by setting params and some custom implementation
 * for the generator and the fillCache function.
 */
class SequenceConstant extends SequenceClassDefault{
    name = "Constant Sequence";
    description = "A sequence that is constant";
    paramsSchema: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'constantValue',
        'number',
        'Constant Value',
        false,
        '0'
    )];
    private params: { [key: string]: string|number|boolean} = {};
    private requested = 0;

    constructor (ID: number, finite?: boolean) {
        super(ID, finite);
        console.log(this.sequenceParams);
    }

    initialize(paramsFromUser?: SequenceParamsSchema[]) {
        if(paramsFromUser){
            console.log(paramsFromUser);
            paramsFromUser.forEach(param => {
                this.params[param.name] = param.value;
            });    
        }
        this.ready = true;
    }

    getElement(n: number) {
        this.requested = n;
        return Number(this.params.constantValue);
    }
}

export const exportModule = new SequenceExportModule(
    SequenceConstant,
    "Constant Sequence"
);
