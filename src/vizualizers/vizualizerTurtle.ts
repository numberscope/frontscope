import p5 from 'p5';
import { VizualizerDefault } from './vizualizerDefault';
import { VizualizerInterface, VizualizerParamsSchema, VizualizerExportModule } from './vizualizerInterface';
import { SequenceInterface } from '@/sequences/sequenceInterface';

const schemaTurtle = [
	new VizualizerParamsSchema(
		"domain",
		'text',
		'Sequence Domain',
		true,
		"0,1,2,3,4",
		'Comma seperated numbers',
	),
	new VizualizerParamsSchema(
		"range",
		'text',
		'Angles',
		true,
		"30,45,60,90,120",
		'Comma seperated numbers',
	),
	new VizualizerParamsSchema(
		"stepSize",
		'number',
		'Step Size',
		true,
		20,
	),
	new VizualizerParamsSchema(
		"strokeWeight",
		'number',
		'Stroke Width',
		true,
		5
	),
	new VizualizerParamsSchema(
		"startingX",
		'number',
		'X start',
		false,
		0,
		"Where to start drawing"
	),
	new VizualizerParamsSchema(
		"startingY",
		'number',
		'Y start',
		false,
		0,
		"Where to start drawing"
	),
	new VizualizerParamsSchema(
		'bgColor',
		'text',
		'Background Color',
		false,
		"#666666"
	),
	new VizualizerParamsSchema(
		'strokeColor',
		'text',
		'Stroke Color',
		false,
		'#ff0000'
	)
]

// Turtle needs work
// Throwing the same error on previous numberscope website
class VisualizerTurtle extends VizualizerDefault implements VizualizerInterface {

    name = "Turtle";
	rotMap: {[key: number]: number} = {};
	domain: number[] = [];
	range: number[] = [];
	currentIndex = 0;
	orientation = 0;
	X = 0;
	Y = 0;

	constructor() {
        super();
		this.params = schemaTurtle;
	}

	initialize(sketch: p5, seq: SequenceInterface, config?: VizualizerParamsSchema[]){
        this.sketch = sketch;
        this.seq = seq;

		config = config !== undefined ? config : this.params;

		config.forEach(param => {
			this.settings[param.name] = param.value;
		});

		const domain = String(this.settings.domain).split(',');
		const range = String(this.settings.domain).split(',');
		this.domain = domain.map( n => Number(n));
		this.range = range.map ( n => Number(n));

		for (let i = 0; i < this.domain.length; i++) {
			this.rotMap[this.domain[i]] = (Math.PI / 180) * this.range[i];
		}

		this.ready = true;
	}

	stepDraw() {
		const oldX = this.X;
		const oldY = this.Y;
		const currElement = this.seq.getElement(this.currentIndex++);
		const angle = this.rotMap[currElement];
		if (angle == undefined) {
			console.log(currElement)
            return false;
		}
		this.orientation = (this.orientation + angle);
		this.X += Number(this.settings.stepSize) * Math.cos(this.orientation);
		this.Y += Number(this.settings.stepSize) * Math.sin(this.orientation);
		this.sketch.line(oldX, oldY, this.X, this.Y);
                return true;
	}

	setup() {
		this.X = this.sketch.width / 2;
		this.Y = this.sketch.height / 2;
		this.sketch.background(String(this.settings.bgColor));
		this.sketch.stroke(String(this.settings.strokeColor));
		this.sketch.strokeWeight(Number(this.settings.strokeWidth));
                this.sketch.noLoop();
	}
	draw() {
                let stat = true;
		while(stat)
                {
                        stat = this.stepDraw();
                }
	}
}



export const exportModule = new VizualizerExportModule(
	"Turtle",
	VisualizerTurtle,
	""
);
