import {SequenceInterface} from "@/sequences/sequenceInterface";
import {VizualizerInterface, VizualizerParamsSchema, VizualizerSettings, VizualizerExportModule} from "@/vizualizers/vizualizerInterface";
import p5 from 'p5';
//An example module

class VizModFill implements VizualizerInterface {
	sketch: p5;
	seq: SequenceInterface;
	params: VizualizerParamsSchema[] = [];
	settings: VizualizerSettings = {};
	rectWidth = 0;
	rectHeight = 0;
	i = 0;
	ready = false;

	constructor(sketch: p5, seq: SequenceInterface) {
		const modDimensionScheme = new VizualizerParamsSchema();
				modDimensionScheme.name = "modDimension";
				modDimensionScheme.displayName = "Mod dimension";
				modDimensionScheme.type = "number";
				modDimensionScheme.description = "";
				modDimensionScheme.required = true;

		this.params.push(modDimensionScheme);
		this.sketch = sketch;
		this.seq = seq;
		this.i = 0;
	}

	initialize(config?: VizualizerParamsSchema[]) {
		config = config !== undefined ? config : this.params;

		config.forEach(param => {
			this.settings[param.name] = param.value;
		});

		this.ready = true;
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
		if (!this.ready) this.initialize(); // If the vizualizer hasn't been intialized, initialize using defaults

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

export const exportModule = new VizualizerExportModule(
	"Mod Fill",
	VizModFill,
	""
);