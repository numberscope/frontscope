import { SequenceInterface } from "@/sequences/SequenceInterface";
import { VisualizerInterface, VisualizerParamsSchema, VisualizerSettings, VisualizerExportModule } from "@/visualizers/VisualizerInterface";
import { ParamType } from '@/shared/ParamType';
import { VisualizerDefault } from './VisualizerDefault';
import { ValidationStatus } from '@/shared/ValidationStatus';

class VizDifferences extends VisualizerDefault implements VisualizerInterface {
	name = "Differences";
	params: VisualizerParamsSchema[] = [];
	settings: VisualizerSettings = {};

	constructor() {
		super();
		const numberTermsTopParam = new VisualizerParamsSchema();
		numberTermsTopParam.name = "n";
		numberTermsTopParam.displayName = "Number of terms of top sequence";
		numberTermsTopParam.type = ParamType.number;
		numberTermsTopParam.value = 20;
		numberTermsTopParam.required = true;
		numberTermsTopParam.description = "The number of terms that appear in the top sequence. Must be bigger than the number of rows.";

		const levelsParam = new VisualizerParamsSchema();
		levelsParam.name = "levels";
		levelsParam.displayName = "Number of layers in the pyramid/trapezoid";
		levelsParam.value = 5;
		levelsParam.type = ParamType.number;
		levelsParam.description = "The number of rows to display.";

		this.params.push(numberTermsTopParam, levelsParam);
	}

	validate() {
		this.assignParams();
		if (this.settings.n <= this.settings.levels) return new ValidationStatus(false, ["n must be greater than levels"]);

		this.isValid = true;
		return new ValidationStatus(true);
	}

	drawDifferences(n: bigint, lvls: number, sequence: SequenceInterface) {

		//changed background color to grey since you can't see what's going on
		this.sketch.background('black');

		const levels = lvls < n - 1n ? lvls : n - 1n;

		const fontSize = 20;
		this.sketch.textFont("Arial");
		this.sketch.textSize(fontSize);
		this.sketch.textStyle(this.sketch.BOLD);
		const xDelta = 50;
		const yDelta = 50;
		let firstX = 30;
		const firstY = 30;
		this.sketch.colorMode(this.sketch.HSB, 255);
		let myColor = this.sketch.color(100, 255, 150);
		let hue;

		const workingSequence = [];

		const start = Number(this.settings.n) - Number(levels);
		const end = Number(this.settings.n);
		const count = ((start + end) * (end - start + 1)) / 2;

		for (let i = 0; i < count; i++) {
			workingSequence.push(sequence.getElement(i)); //workingSequence cannibalizes first n elements of sequence.
		}


		for (let i = 0; i < this.settings.levels; i++) {
			console.log(workingSequence);
			hue = (i * 255 / 6) % 255;
			myColor = this.sketch.color(hue, 150, 200);
			this.sketch.fill(myColor);
			for (let j = 0; j < workingSequence.length; j++) {
				this.sketch.text(workingSequence[j], firstX + j * xDelta, firstY + i * yDelta); //Draws and updates workingSequence simultaneously.
				if (j < workingSequence.length - 1) {
					workingSequence[j] = workingSequence[j + 1] - workingSequence[j];
				}
			}

			workingSequence.length = workingSequence.length - 1; //Removes last element.
			firstX = firstX + (1 / 2) * xDelta; //Moves line forward half for pyramid shape.

		}

	}
	setup() {
		console.log("Set up");
	}
	draw() {
		this.drawDifferences(BigInt(this.settings.n), Number(this.settings.levels), this.seq);
		this.sketch.noLoop();
	}
}

export const exportModule = new VisualizerExportModule(
	"Differences",
	VizDifferences,
	""
);
