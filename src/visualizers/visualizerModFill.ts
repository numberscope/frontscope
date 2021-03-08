import {SequenceInterface} from "@/sequences/sequenceInterface";
import {visualizerDefault} from "@/visualizers/visualizerDefault";
import {visualizerInterface, visualizerParamsSchema, visualizerSettings, visualizerExportModule} from "@/visualizers/visualizerInterface";
import p5 from 'p5';
import { ValidationStatus } from '@/shared/validationStatus';
//An example module

class VizModFill extends visualizerDefault implements visualizerInterface {
	name = "Mod Fill";
	settings: visualizerSettings = {};
	rectWidth = 0;
	rectHeight = 0;
	i = 0;
	ready = false;

	constructor() {
        super();
		const modDimensionScheme = new visualizerParamsSchema();
				modDimensionScheme.name = "modDimension";
				modDimensionScheme.displayName = "Mod dimension";
				modDimensionScheme.type = "number";
				modDimensionScheme.description = "";
				modDimensionScheme.required = true;

		this.params.push(modDimensionScheme);
		this.i = 0;
	}

	initialize(sketch: p5, seq: SequenceInterface){
		this.sketch = sketch;
		this.seq = seq;


		this.ready = true;
	}

	validate(){
		this.assignParams();
		if(this.settings.modDimension > 0) return new ValidationStatus(true);
		else if(this.settings.modDimension <= 0) return new ValidationStatus(false, ["Mod dimension must be positive"]);
		else return new ValidationStatus(false, ["Please set a mod dimension"]);

	}

	drawNew(num: number, seq: SequenceInterface) {
		const black = this.sketch.color(0);
		this.sketch.fill(black);
		let i: number;
		let j;
		for (let mod = 1; mod <= this.settings.modDimension; mod++) {
			i = seq.getElement(num) % mod;
			j = mod - 1;
			this.sketch.rect(j * this.rectWidth, this.sketch.height - (i + 1) * this.rectHeight, this.rectWidth, this.rectHeight);
		}

	}

	setup() {
		const modDimension = Number(this.settings.modDimension);
		this.rectWidth = this.sketch.width / modDimension;
		this.rectHeight = this.sketch.height / modDimension;
		this.sketch.noStroke();
	}

	draw() {
		this.drawNew(this.i, this.seq);
		this.i++;
		if (this.i == 1000) {
			this.sketch.noLoop();
		}
	}

}

export const exportModule = new visualizerExportModule(
	"Mod Fill",
	VizModFill,
	""
);
