import { VisualizerInterface, VisualizerParamsSchema, VisualizerSettings } from './VisualizerInterface';
import { ValidationStatus } from '@/shared/ValidationStatus';
import { ParamType } from '@/shared/ParamType';
import p5 from 'p5';
import { SequenceInterface } from '@/sequences/SequenceInterface';
import { SequenceClassDefault } from '@/sequences/SequenceClassDefault';

export class VisualizerDefault implements VisualizerInterface {
    params: VisualizerParamsSchema[] = [];
    settings: VisualizerSettings = {};
    ready = false;
    sketch: p5 = new p5(sketch => {return sketch});
    seq: SequenceInterface = new SequenceClassDefault(0);
    public isValid = false;

    /***
      Sets the sketch and the sequence to draw with
      This is also where you would generate any settings or draw functions if needed
      */
	initialize(sketch: p5, seq: SequenceInterface): void {
        if(this.isValid){
            this.sketch = sketch;
            this.seq = seq;

            this.ready = true;
        } else {
            throw "The visualizer is not valid. Run validate and address any errors."
        }
    }

    /**
      This checks that the params provided are within the bounds you need.
      Simply assign params to settings (using the provided function) and validate them
      Returns a ValidationStatus object (see visualizerInterface.ts for details)
    
      The default validation is always false, since it is automatically used by its children
      so you are required to define a new validate function for every visualizer.
      */
    validate(): ValidationStatus {
        this.assignParams();
        this.isValid = false;
        return new ValidationStatus(false, ["This is the default validation function. Please define one for this visualizer"]);
    }

    assignParams(): void {
        this.params.forEach(param => {
            let paramValue = param.value;
            if(param.type == ParamType.number) paramValue = Number(paramValue);
            else if(param.type == ParamType.text) paramValue = String(paramValue);
            else if(param.type == ParamType.boolean) paramValue = Boolean(paramValue);
			this.settings[param.name] = paramValue;
        });
    }

    setup(): void {
        return;
    }

    draw(): void {
        return;
    }
}
