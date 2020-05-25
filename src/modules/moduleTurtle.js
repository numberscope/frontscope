

// Turtle needs work
// Throwing the same error on previous numberscope website
class VisualizerTurtle {
	constructor(seq, sketch, config) {
		const domain = config.domain;
		const range = config.range;
		this.rotMap = {};
		for (let i = 0; i < domain.length; i++) {
			this.rotMap[domain[i]] = (Math.PI / 180) * range[i];
		}
		this.stepSize = config.stepSize;
		this.bgColor = config.bgColor;
		this.strokeColor = config.strokeColor;
		this.strokeWidth = config.strokeWeight;
		this.seq = seq;
		this.currentIndex = 0;
		this.orientation = 0;
		this.sketch = sketch;
		if (config.startingX != "") {
			this.X = config.startingX;
			this.Y = config.startingY;
		} else {
			this.X = null;
			this.Y = null;
		}
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
		this.X += this.stepSize * Math.cos(this.orientation);
		this.Y += this.stepSize * Math.sin(this.orientation);
		this.sketch.line(oldX, oldY, this.X, this.Y);
                return true;
	}

	setup() {
		this.X = this.sketch.width / 2;
		this.Y = this.sketch.height / 2;
		this.sketch.background(this.bgColor);
		this.sketch.stroke(this.strokeColor);
		this.sketch.strokeWeight(this.strokeWidth);
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


const schemaTurtle = {
	domain: {
		type: 'string',
		title: 'Sequence Domain',
		description: 'Comma seperated numbers',
		format: 'list',
		default: "0,1,2,3,4",
		required: true
	},
	range: {
		type: 'string',
		title: 'Angles',
		default: "30,45,60,90,120",
		format: 'list',
		description: 'Comma seperated numbers',
		required: true
	},
	stepSize: {
		type: 'number',
		title: 'Step Size',
		default: 20,
		required: true
	},
	strokeWeight: {
		type: 'number',
		title: 'Stroke Width',
		default: 5,
		required: true
	},
	startingX: {
		type: 'number',
		tite: 'X start'
	},
	startingY: {
		type: 'number',
		tite: 'Y start'
	},
	bgColor: {
		type: 'string',
		title: 'Background Color',
		format: 'color',
		default: "#666666",
		required: false
	},
	strokeColor: {
		type: 'string',
		title: 'Stroke Color',
		format: 'color',
		default: '#ff0000',
		required: false
	},
};

const moduleTurtle = {
	viz: VisualizerTurtle,
	name: "Turtle",
	description: "",
	configSchema: schemaTurtle
};


module.exports = moduleTurtle;
