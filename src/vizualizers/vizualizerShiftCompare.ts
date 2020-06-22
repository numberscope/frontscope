import p5 from "p5";
import { SequenceInterface } from '@/sequences/sequenceInterface';
import { VizualizerDefault } from './vizualizerDefault';
import { VizualizerInterface, VizualizerExportModule } from './vizualizerInterface';

class VizShiftCompare extends VizualizerDefault implements VizualizerInterface {
	MOD= 2;
	img: p5.Image;

	constructor(sketch: p5, seq: SequenceInterface) {
		super();
		this.img = this.sketch.createImage(this.sketch.width, this.sketch.height);
		this.img.loadPixels(); // Enables pixel-level editing.
	}

	setup() {
		console.log(this.sketch.height, this.sketch.width);
	}

	clip(a: number, min: number, max: number) {
		if (a < min) {
			return min;
		} else if (a > max) {
			return max;
		}
		return a;
	}


	draw() { //This will be called everytime to draw
		// Ensure mouse coordinates are sane.
		// Mouse coordinates look they're floats by default.

		const d = this.sketch.pixelDensity();
		const mx = this.clip(Math.round(this.sketch.mouseX), 0, this.sketch.width);
		const my = this.clip(Math.round(this.sketch.mouseY), 0, this.sketch.height);
		if (this.sketch.key == 'ArrowUp') {
			this.MOD += 1;
			this.sketch.key = '';
			console.log("UP PRESSED, NEW MOD: " + this.MOD);
		} else if (this.sketch.key == 'ArrowDown') {
			this.MOD -= 1;
			this.sketch.key = '';
			console.log("DOWN PRESSED, NEW MOD: " + this.MOD);
		} else if (this.sketch.key == 'ArrowRight') {
			console.log(console.log("MX: " + mx + " MY: " + my));
		}
		// Write to image, then to screen for speed.
		for (let x = 0; x < this.sketch.width; x++) {
			for (let y = 0; y < this.sketch.height; y++) {
				for (let i = 0; i < d; i++) {
					for (let j = 0; j < d; j++) {
						const index = 4 * ((y * d + j) * this.sketch.width * d + (x * d + i));
						if (this.seq.getElement(x) % (this.MOD) == this.seq.getElement(y) % (this.MOD)) {
							this.img.pixels[index] = 255;
							this.img.pixels[index + 1] = 255;
							this.img.pixels[index + 2] = 255;
							this.img.pixels[index + 3] = 255;
						} else {
							this.img.pixels[index] = 0;
							this.img.pixels[index + 1] = 0;
							this.img.pixels[index + 2] = 0;
							this.img.pixels[index + 3] = 255;
						}
					}
				}
			}
		}

		this.img.updatePixels(); // Copies our edited pixels to the image.

		this.sketch.image(this.img, 0, 0); // Display image to screen.this.sketch.line(50,50,100,100);
	}
}


export const exportModule = new VizualizerExportModule(
	"Shift Compare",
	VizShiftCompare,
	""
);
