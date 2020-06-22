import { VizualizerInterface, VizualizerParamsSchema, VizualizerSettings } from './vizualizerInterface';
//import p5 from '@/assets/p5.min.js';
import p5 from 'p5';
import { SequenceInterface } from '@/sequences/sequenceInterface';
import { SequenceClassDefault } from '@/sequences/sequenceClassDefault';

export class VizualizerDefault implements VizualizerInterface{
    params: VizualizerParamsSchema[] = [];
    settings: VizualizerSettings = {};
    ready = false;
    sketch: p5 = new p5(sketch => {return sketch});
    seq: SequenceInterface = new SequenceClassDefault(0, false);

	initialize(sketch: p5, seq: SequenceInterface, config?: VizualizerParamsSchema[]) {
		config = config !== undefined ? config : this.params;

		config.forEach(param => {
			this.settings[param.name] = param.value;
		});

		this.ready = true;
    }

    setup(){
        return;
    }

    draw() {
        return;
    }
}
