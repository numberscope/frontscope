import {SequenceInterface} from "@/sequences/sequenceInterface";
import {VizualizerInterface, VizualizerParamsSchema, VizualizerSettings, VizualizerExportModule} from "@/vizualizers/vizualizerInterface";
import p5 from 'p5';
import { VizualizerDefault } from './vizualizerDefault';
/*
    var list=[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223];

*/

class VizDifferences extends VizualizerDefault implements VizualizerInterface{
	params: VizualizerParamsSchema[] = [];
	settings: VizualizerSettings = {};

	constructor(seq: SequenceInterface, sketch: p5) {
		super(sketch, seq);
		const numberTermsTop = new VizualizerParamsSchema();
		numberTermsTop.name = "n";
		numberTermsTop.displayName = "Number of terms of top sequence";
		numberTermsTop.type = "Number";
		numberTermsTop.value = "1";
		numberTermsTop.required = true;

		const levelsParam = new VizualizerParamsSchema();
		levelsParam.name = "levels";
		levelsParam.displayName = "Number of layers in the pyramid/trapezoid";
		levelsParam.value = 2;
		levelsParam.type = "Number";
		this.params.push(numberTermsTop, levelsParam);
	}

	drawDifferences(n: number, levels: number, sequence: SequenceInterface) {

		//changed background color to grey since you can't see what's going on
		this.sketch.background('black');

		levels = Math.min(levels, n - 1);
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

		for (let i = 0; i < this.settings.n; i++) {
			workingSequence.push(sequence.getElement(i)); //workingSequence cannibalizes first n elements of sequence.
		}


		for (let i = 0; i < this.settings.levels; i++) {
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
		this.drawDifferences(Number(this.settings.n), Number(this.settings.levels), this.seq);
		this.sketch.noLoop();
	}
}

export const exportModule = new VizualizerExportModule(
	"Differences",
	VizDifferences,
	""
);