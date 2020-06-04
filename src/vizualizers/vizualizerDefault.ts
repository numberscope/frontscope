import { VizualizerInterface, VizualizerParamsSchema, VizualizerSettings } from './vizualizerInterface';
import p5 from 'p5';
import { SequenceInterface } from '@/sequences/sequenceInterface';

export class VizualizerDefault implements VizualizerInterface{
    params: VizualizerParamsSchema[] = [];
    settings: VizualizerSettings = {};
    ready = false;
    sketch: p5;
    seq: SequenceInterface;

    constructor(sketch: p5, seq: SequenceInterface){
        this.sketch = sketch;
        this.seq = seq;
    }

	initialize(config?: VizualizerParamsSchema[]) {
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