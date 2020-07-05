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
    public isValid = false;

    /***
      Sets the sketch and the sequence to draw with
      This is also where you would generate any settings or draw functions if needed
      */
	initialize(sketch: p5, seq: SequenceInterface) {
        if(this.isValid){
            this.sketch = sketch;
            this.seq = seq;

            this.ready = true;
        } else {
            throw "The vizualizer is not valid. Run validate and address any errors."
        }
    }

    /**
      This checks that the params provided are within the bounds you need.
      Simply assign params to settings (using the provided function) and validate them
      Returns a ValidationStatus object (see VizualizerInterface.ts for details)
    
      The default validation is always false, since it is automatically used by its children
      so you are required to define a new validate function for every vizualizer.
      */
    validate() {
        this.assignParams();
        this.isValid = false;
        return new ValidationStatus(false, ["This is the default validation function. Please define one for this vizualizer"]);
    }

    assignParams(){
		this.params.forEach(param => {
			this.settings[param.name] = param.value;
		});
    }

    setup(){
        return;
    }

    draw() {
        return;
    }
}
