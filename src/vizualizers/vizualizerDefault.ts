import { VizualizerInterface, VizualizerParamsSchema, VizualizerSettings } from './vizualizerInterface';
import { ValidationStatus } from '@/shared/validationStatus';
import p5 from 'p5';
import { SequenceInterface } from '@/sequences/sequenceInterface';
import { SequenceClassDefault } from '@/sequences/sequenceClassDefault';

export class VizualizerDefault implements VizualizerInterface{
    params: VizualizerParamsSchema[] = [];
    settings: VizualizerSettings = {};
    ready = false;
    sketch: p5 = new p5(sketch => {return sketch});
    seq: SequenceInterface = new SequenceClassDefault(0, false);
    private isValid = false;

	initialize(sketch: p5, seq: SequenceInterface) {
        if(this.isValid){
            this.sketch = sketch;
            this.seq = seq;

            this.ready = true;
        } else {
            throw "The vizualizer is not valid. Run validate and address any errors."
        }
    }

    validate() {
		this.params.forEach(param => {
			this.settings[param.name] = param.value;
		});
        this.isValid = true;
        return new ValidationStatus(true);
    }

    setup(){
        return;
    }

    draw() {
        return;
    }
}
