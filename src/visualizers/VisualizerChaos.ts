import p5 from "p5";
import { VisualizerDefault } from './VisualizerDefault';
import { VisualizerInterface, VisualizerParamsSchema, VisualizerExportModule } from './VisualizerInterface';
import { ParamType } from '@/shared/ParamType';
import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceInterface } from '@/sequences/SequenceInterface';

// p5 Colour palette type
interface palette {
	colorList: p5.Color[];
	backgroundColor: p5.Color;
	textColor: p5.Color;
}
// positions for the chaos walkers
interface position {
	x: number;
	y: number;
}

const schemaChaos = [
	new VisualizerParamsSchema(
		"num",
		ParamType.number,
		"Number of terms",
		true,
		10000,
		"The number of terms to stop drawing at (a value of 0 will draw forever/until it runs out)."
	),
	new VisualizerParamsSchema(
		"corners",
		ParamType.number,
		"Number of corners",
		true,
		4,
		"The number of corners on the polygon, also the modulus we apply to the terms of the sequence."
	),
	new VisualizerParamsSchema(
		"walkers",
		ParamType.number,
		"Number of walkers",
		true,
		1,
		"The number w of walkers; break into subsequences based on residue mod w of the index, each with a separate walker."
	),
	new VisualizerParamsSchema(
		"style",
		ParamType.number,
		"Color scheme",
		true,
		1,
		"0 = colour by walker; 1 = colour by destination; 2 = colour by index; 3 = colour one walker."
	),
	new VisualizerParamsSchema(
		"highlightWalker",
		ParamType.number,
		"Highlighted walker",
		false,
		0,
		"The walker to highlight in colour scheme 3."
	),
	new VisualizerParamsSchema(
		"circSize",
		ParamType.number,
		"Circle size",
		true,
		1,
		"Size of the dots."
	),
	new VisualizerParamsSchema(
		"alpha",
		ParamType.number,
		"Circle alpha",
		true,
		1,
		"Alpha factor (transparency, 0=transparent, 1=solid) of the dots."
	),
	new VisualizerParamsSchema(
		"frac",
		ParamType.number,
		"Fraction to walk",
		true,
		0.5,
		"How far each step takes you toward the corner (value between 0 and 1 inclusive)."
	),
	new VisualizerParamsSchema(
		"pixelsPerFrame",
		ParamType.number,
		"Dots per frame",
		true,
		400,
		"How many dots to draw per frame (more = faster)."
	),
	new VisualizerParamsSchema(
		"showLabels",
		ParamType.boolean,
		"Show corner labels?",
		true,
		false,
		"Whether to label corners of polygon."
	),
	new VisualizerParamsSchema(
		"darkMode",
		ParamType.boolean,
		"Use dark mode?",
		true,
		false,
		"Whether to make a dark background."
	)
	];
	// other ideas:  previous parts of the sequence fade over time, or shrink over time
	// circles fade to the outside


class VisualizerChaos extends VisualizerDefault implements VisualizerInterface {
    
	name = "Chaos";

	private img: p5.Image = new p5.Image();

	// current state variables
	private myIndex = 0;
	private myTerm = 0;
	private myCorner = 0;
	private myCornerPosition: position = { x:0, y:0 };
	private myWalker = 0;
	// p5 colours can't be initialized outside draw() or setup()
	private myColor: any; // eslint-disable-line @typescript-eslint/no-explicit-any 
	private pixelCount = 0;

	// private properly typed versions of the parameters
	private num = 0;
	private corners = 0;
	private walkers = 0;
	private style = 0;
	private circSize = 0;
	private alpha = 1;
	private frac = 0;
	private pixelsPerFrame = 0;
	private showLabels = false;
	private darkMode = false;

	// variables for the polygon size/layout/walkers
	private ctrX = 0;
	private ctrY = 0;
	private radius = 0;
	private cornersList: position[] = [];
	private cornersLabels: position[] = [];
	private walkerPositions: position[] = [];
	private highlightWalker = 0;

	// text control (these values are overwritten in setup)
	private labelOutset = 1.1;
	private textSize = 15;
	private textStroke = 1; 

	// list of colour palettes
	private palettes: palette[] = [];
	private currentPalette: palette = { colorList: [], backgroundColor: this.sketch.color(255), textColor: this.sketch.color(20) };
	private colorList: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any 
	private backgroundColor: any; // eslint-disable-line @typescript-eslint/no-explicit-any 
	private textColor: any; // eslint-disable-line @typescript-eslint/no-explicit-any 
	private basicAlpha = 0.5;

	constructor() {
		super();
		this.params = schemaChaos;
	}

	initialize(sketch: p5, seq: SequenceInterface){
		this.sketch = sketch;
		this.seq = seq;
	}

	validate() {
		this.assignParams();
		this.isValid = false;

		// properly typed private versions of parameters
		this.corners = Number(this.settings.corners);
		this.num = Number(this.settings.num);
		this.walkers = Number(this.settings.walkers);
		this.style = Number(this.settings.style);
		this.highlightWalker = Number(this.settings.highlightWalker);
		this.circSize = Number(this.settings.circSize);
		this.alpha = Number(this.settings.alpha);
		this.frac = Number(this.settings.frac);
		this.pixelsPerFrame = Number(this.settings.pixelsPerFrame);
		this.showLabels = Boolean(this.settings.showLabels);
		this.darkMode = Boolean(this.settings.darkMode);
	
		if (this.corners < 2) return new ValidationStatus(false, ["The number of corners must be at least 2."]);
		if ( !Number.isInteger( this.corners ) ) return new ValidationStatus(false, ["The number of corners must be an integer."]);
		if (this.num < 0) return new ValidationStatus(false, ["The number of terms must be at least 0."]);
		if ( !Number.isInteger( this.num ) ) return new ValidationStatus(false, ["The number of terms must be an integer."]);
		if (this.walkers < 1) return new ValidationStatus(false, ["The number of walkers must be at least 1."]);
		if ( !Number.isInteger( this.walkers ) ) return new ValidationStatus(false, ["The number of walkers must be an integer."]);
		if (this.style < 0 || this.style > 3) return new ValidationStatus(false, ["The style must be an integer between 0 and 3 inclusive."]);
		if ( !Number.isInteger( this.style ) ) return new ValidationStatus(false, ["The style must be an integer between 0 and 3 inclusive."]);
		if (this.highlightWalker < 0 || this.highlightWalker >= this.walkers) return new ValidationStatus(false, ["The highlighted walker must be between 0 and the number of walkers minus 1."]);
		if ( !Number.isInteger( this.highlightWalker ) ) return new ValidationStatus(false, ["The highlighted walker must be an integer."]);
		if (this.circSize < 0) return new ValidationStatus(false, ["The circle size must be positive."]);
		if (this.alpha < 0) return new ValidationStatus(false, ["The alpha must be between 0 and 1 inclusive."]);
		if (this.alpha > 1) return new ValidationStatus(false, ["The alpha must be between 0 and 1 inclusive."]);
		if (this.frac < 0) return new ValidationStatus(false, ["The fraction must be between 0 and 1 inclusive."]);
		if (this.frac > 1) return new ValidationStatus(false, ["The fraction must be between 0 and 1 inclusive."]);
		if (this.pixelsPerFrame < 0 ) return new ValidationStatus(false, ["The dots per frame must be positive."]);
		if ( !Number.isInteger( this.pixelsPerFrame ) ) return new ValidationStatus(false, ["The dots per frame must be an integer."]);

		this.isValid = true;
		return new ValidationStatus(true);
	}

	numModulus(a: number, b: number) {
		// This should be replaced with the modulus function in our own library, once that exists
		if (b <= 0) { 
			throw new Error("modulus error");
		}
		if (a < 0 ){
			return a % b + b;
		} else {
			return a % b;
		}
	}

	chaosWindow(ctrX: number, ctrY: number, radius: number) {
		// creates corners of a polygon with centre (ctrX,ctrY) and radius radius
		const pts: position[] = [];
		let angle = 0;
		let newpt: position = { x: 0, y: 0 };
		for( let i = 0; i < this.corners; i++ ){
			angle = this.sketch.radians( 45+360*i/this.corners );
			newpt = { 
				x: ctrX + radius*this.sketch.cos(angle),
				y: ctrY + radius*this.sketch.sin(angle)
			};
			pts.push(newpt);
		}
		return pts;
	}

	setup() {

		this.img = this.sketch.createImage(this.sketch.width, this.sketch.height);
	
		// the first palette random with enough colours for the number of corners or walkers
		let paletteSize = 0;
		if( this.style === 0 ){ paletteSize = this.walkers; } 
		if( this.style === 1 ){ paletteSize = this.corners; } 
		if( this.style === 2 || this.style === 3 ){ paletteSize = 10 }
		const randomPalette: p5.Color[] = [];
		for ( let c = 0 ; c < paletteSize; c++ ){
			const R = Math.floor(Math.random()*256);
			const G = Math.floor(Math.random()*256);
			const B = Math.floor(Math.random()*256);
			const myCol = this.sketch.color(R,G,B);
			randomPalette.push( myCol );
		}
		this.palettes.push({
			colorList: randomPalette,
			backgroundColor: (this.darkMode ? this.sketch.color(20) : this.sketch.color(255) ),
			textColor: (this.darkMode ? this.sketch.color(255) : this.sketch.color(20) )
		});

		// the second and third palette are curated
		this.palettes.push({ 
			colorList: [
				this.sketch.color('#48458b'),
				this.sketch.color('#daa520'),
				this.sketch.color('#003f5c'),
				this.sketch.color('#ff6361'),
				this.sketch.color('#ffa600'),
				this.sketch.color('#bc5090'),
				this.sketch.color('#58508d')
			], 
			backgroundColor: this.sketch.color(255),
			textColor: this.sketch.color(20) 
		});
		this.palettes.push({ 
			colorList: [
				this.sketch.color('#48458b'),
				this.sketch.color('#daa520'),
				this.sketch.color('#003f5c'),
				this.sketch.color('#ff6361'),
				this.sketch.color('#ffa600'),
				this.sketch.color('#bc5090'),
				this.sketch.color('#58508d')
			], 
			backgroundColor: this.sketch.color(20),
			textColor: this.sketch.color(255) 
		});

		// decide which palette to set by default
		// we need a colourpicker in the params eventually
		// right now this is a little arbitrary
		let paletteIndex = 1;
		if( this.darkMode ){ paletteIndex = 2; }
		if( this.style === 0 && this.walkers > 7 ){ paletteIndex = 0; } 
		if( this.style === 1 && this.corners > 7 ){ paletteIndex = 0; } 

		// set the palette up
		this.currentPalette = this.palettes[paletteIndex];
		this.colorList = this.currentPalette.colorList;
		this.backgroundColor = this.currentPalette.backgroundColor;
		this.textColor = this.currentPalette.textColor;

		// set initial values
		this.myIndex = 0;
		this.myCorner = 0;
		this.myWalker = 0;
		this.pixelCount = 0;
		this.myColor = this.sketch.color('#003f5c');

		// set center coords and size
		this.ctrX = this.sketch.width / 2;
		this.ctrY = this.sketch.height / 2;
		this.radius = this.sketch.width / 3;

		// text control
		this.labelOutset = 1.1;
		this.textSize = this.sketch.width * 0.1;
		this.textStroke = this.sketch.width * 0.01;

		// set counters
		this.pixelCount = 0;
		this.myIndex = 0;

		// set up arrays of walkers
		this.walkerPositions.splice(0, this.walkerPositions.length) // clean the array out (fixes bug with redraws)
		for( let w = 0; w < this.walkers; w++ ){
			this.walkerPositions.push({ x: this.ctrX, y: this.ctrY }); // all walkers start at origin
		}

		// Set up the windows and return the coordinates of the corners
		this.cornersList = this.chaosWindow(this.ctrX,this.ctrY,this.radius); // locations of the corners

		// Set frame rate
		this.sketch.frameRate(10);

		// canvas clear/background
		this.sketch.clear();
		this.sketch.background(this.backgroundColor);

		// Draw corner labels if desired
		if ( this.showLabels ) {
			this.sketch.stroke(this.textColor);
			this.sketch.fill(this.textColor);
			this.sketch.strokeWeight(0);
			this.sketch.textSize(15);
			this.sketch.textAlign(this.sketch.CENTER,this.sketch.CENTER);
			this.cornersLabels = this.chaosWindow(this.ctrX,this.ctrY,(this.radius)*(this.labelOutset)); // locations of the labels
			for ( let c = 0 ; c < this.corners ; c++ ) {
				const label = this.cornersLabels[c];
				this.sketch.text(String(c),label.x,label.y);
			}
		}

		// no stroke (in particular, no outline on circles)
		this.sketch.strokeWeight(0);
	}

	draw() {

		// we do pixelsPerFrame pixels each time through the draw cycle; this speeds things up essentially
		for( let px = 0; px < this.pixelsPerFrame; px++ ){

			if( this.num === 0 || this.pixelCount < this.num ){

				// myIndex tells which term we are drawing
				this.myIndex += 1;

				// get the term
				this.myTerm = this.seq.getElement(this.myIndex);

				// check its modulus to see which corner to walk toward
				this.myCorner = this.numModulus(this.myTerm, this.corners);
				this.myCornerPosition = this.cornersList[this.myCorner];

				// check the index modulus to see which walker is walking
				this.myWalker = this.numModulus(this.myIndex,this.walkers);

				// update the walker position
				this.walkerPositions[this.myWalker].x = (1-this.frac)*this.walkerPositions[this.myWalker].x + this.frac*this.myCornerPosition.x;
				this.walkerPositions[this.myWalker].y = (1-this.frac)*this.walkerPositions[this.myWalker].y + this.frac*this.myCornerPosition.y;
			
				// choose colour to mark position
				if( this.style == 0 ){ // colour by walker
					this.myColor = this.colorList[this.myWalker];
				}
				if( this.style == 1 ){ // colour by destination
					this.myColor = this.colorList[this.myCorner];
				}
				if( this.style == 2 ){ // colour by index
					if ( this.num ) {
						this.myColor = this.sketch.lerpColor(this.colorList[0], this.colorList[1], this.myIndex/this.num );
					} else {
						this.myColor = this.sketch.lerpColor(this.colorList[0], this.colorList[1], this.numModulus(this.myIndex,10000)/10000 );
					}
				}
				if( this.style == 3 ){ // colour one walker
					if( this.myWalker == this.highlightWalker ){
						this.myColor = this.colorList[0];
					} else {
						this.myColor = this.colorList[1];
					}
				}
				this.myColor.setAlpha(255*this.alpha); // the 255 is needed when in RGB mode; can change in other modes; see p5.js docs on setAlpha

				// draw a circle
				this.sketch.fill(this.myColor);
				this.sketch.circle( this.walkerPositions[this.myWalker].x, this.walkerPositions[this.myWalker].y, this.circSize );

				this.pixelCount += 1;
			}
		}

		// stop drawing if we exceed decreed terms
		if ( this.num != 0 && this.pixelCount > this.num ){
			this.sketch.noLoop();
		}

	}
	
}

export const exportModule = new VisualizerExportModule(
	"Chaos",
	VisualizerChaos,
	""
);
