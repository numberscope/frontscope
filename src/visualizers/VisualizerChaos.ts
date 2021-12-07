import p5 from "p5";
import { VisualizerDefault } from './VisualizerDefault';
import { VisualizerParamsSchema, VisualizerExportModule } from './VisualizerInterface';
import { ParamType } from '@/shared/ParamType';
import { ValidationStatus } from '@/shared/ValidationStatus';

// p5 Colour palette class
class Palette {
	colorList: p5.Color[] = [];
	backgroundColor: p5.Color;
	textColor: p5.Color;

	constructor( sketch: p5, hexList?: string[], hexBack?: string, hexText?: string ) {
		let myHexList: string[] = [];
		let myHexBack = '#000000';
		let myHexText = '#000000';
		if ( hexList !== undefined ) { myHexList = hexList; }
		if ( hexBack !== undefined ) { myHexBack = hexBack; }
		if ( hexText !== undefined ) { myHexText = hexText; }
		for( let h = 0 ; h < myHexList.length; h++ ){
			this.colorList.push( sketch.color(myHexList[h]) );
		}
		this.backgroundColor = sketch.color(myHexBack);
		this.textColor = sketch.color(myHexText);
	}
}

enum ColorStyle { Walker, Corner, Index, Highlight }

// params schema
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
	// it would be nice to change this to an enum, if the params schema allowed
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


class VisualizerChaos extends VisualizerDefault {
    
	name = "Chaos";

	private img: p5.Image = new p5.Image();

	// private properly typed versions of the user parameters
	private num = 0;
	private corners = 0;
	private walkers = 0;
	private style = 0;
	private colorStyle = ColorStyle.Walker;
	private highlightWalker = 0;
	private circSize = 0;
	private alpha = 1;
	private frac = 0;
	private pixelsPerFrame = 0;
	private showLabels = false;
	private darkMode = false;
	
	// current state variables (used in setup and draw)
	private myIndex = 0;
	private pixelCount = 0;
	private cornersList: p5.Vector[] = [];
	private walkerPositions: p5.Vector[] = [];

	// list of colour palettes
	private darkPalette = new Palette(this.sketch);
	private lightPalette = new Palette(this.sketch);
	private randomPalette = new Palette(this.sketch);
	private currentPalette = new Palette(this.sketch);

	constructor() {
		super();
		this.params = schemaChaos;
	}

	validate() {
		this.assignParams();
		this.isValid = false;

		// properly typed private versions of parameters
		this.num = Number(this.settings.num);
		this.corners = Number(this.settings.corners);
		this.walkers = Number(this.settings.walkers);
		this.style = Number(this.settings.style);
		this.highlightWalker = Number(this.settings.highlightWalker);
		this.circSize = Number(this.settings.circSize);
		this.alpha = Number(this.settings.alpha);
		this.frac = Number(this.settings.frac);
		this.pixelsPerFrame = Number(this.settings.pixelsPerFrame);
		this.showLabels = Boolean(this.settings.showLabels);
		this.darkMode = Boolean(this.settings.darkMode);
	
		if (this.num < 0) return new ValidationStatus(false, ["The number of terms must be at least 0."]);
		if ( !Number.isInteger( this.num ) ) return new ValidationStatus(false, ["The number of terms must be an integer."]);
		if (this.corners < 2) return new ValidationStatus(false, ["The number of corners must be at least 2."]);
		if ( !Number.isInteger( this.corners ) ) return new ValidationStatus(false, ["The number of corners must be an integer."]);
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

	numModulus(a: ( number | bigint ), b: number) {
		// This should be replaced with the modulus function in our own library, once that exists
		if (b <= 0) { 
			throw new Error("negative modulus error");
		}
		const A = BigInt(a);
		const B = BigInt(b); 
		// the return value will always be a valid number, because b was a number
		if (A < 0n ){
			return Number( A % B + B );
		} else {
			return Number( A % B );
		}
	}

	chaosWindow(ctrX: number, ctrY: number, radius: number) {
		// creates corners of a polygon with centre (ctrX,ctrY) and radius radius
		const pts: p5.Vector[] = [];
		let angle = 0;
		let newpt = this.sketch.createVector(0,0);
		for( let i = 0; i < this.corners; i++ ){
			angle = this.sketch.radians( 45+360*i/this.corners );
			newpt = this.sketch.createVector( 
				ctrX + radius*this.sketch.cos(angle),
				ctrY + radius*this.sketch.sin(angle)
			);
			pts.push(newpt);
		}
		return pts;
	}

	setup() {

		super.setup();

		this.img = this.sketch.createImage(this.sketch.width, this.sketch.height);
	
		// the first palette random with enough colours for the number of corners or walkers
		let paletteSize = 10;
		if( this.style === 0 ){ this.colorStyle = ColorStyle.Walker; paletteSize = this.walkers; } 
		if( this.style === 1 ){ this.colorStyle = ColorStyle.Corner; paletteSize = this.corners; } 
		if( this.style === 2 ){ this.colorStyle = ColorStyle.Index; } 
		if( this.style === 3 ){ this.colorStyle = ColorStyle.Highlight; } 
		const colorList: string[] = [];
		for ( let c = 0 ; c < paletteSize; c++ ){
			let hexString = '';
			for ( let h = 0 ; h < 6 ; h++ ){
				hexString += (Math.floor(Math.random()*16)).toString();
			}
			colorList.push( hexString ); 
		}
		this.randomPalette = new Palette(this.sketch, colorList, this.darkMode ? '#262626' : '#f5f5f5', this.darkMode ? '#f5f5f5' : '#262626' );

		// the second and third palette are curated
		this.darkPalette = new Palette(this.sketch,['#48458b','#daa520','#003f5c','#ff6361','#ffa600','#bc5090','#58508d'],'#262626','#f5f5f5');
		this.lightPalette = new Palette(this.sketch,['#48458b','#daa520','#003f5c','#ff6361','#ffa600','#bc5090','#58508d'],'#f5f5f5','#262626');
		
		// decide which palette to set by default
		// we need a colourpicker in the params eventually
		// right now this is a little arbitrary
		if( this.darkMode ){ 
			this.currentPalette = this.darkPalette;
		} else {
			this.currentPalette = this.lightPalette;
		}
		if( 
			(this.colorStyle === ColorStyle.Walker && this.walkers > 7) 
			|| ( this.colorStyle === ColorStyle.Corner && this.corners > 7 ) 
		){ this.currentPalette = this.randomPalette; } 
		
		// set center coords and size
		const ctrX = this.sketch.width / 2;
		const ctrY = this.sketch.height / 2;
		const radius = this.sketch.width * 0.4;

		// text appearance control
		const labelOutset = 1.1;
		const shrink = Math.log(this.corners);
		const textSize = this.sketch.width * 0.04 / shrink; // shrinks the numbers appropriately up to about 100 corners or so
		const textStroke = this.sketch.width * 0; // no stroke right now, but could be added

		// set counters
		this.pixelCount = 0;
		this.myIndex = 0;

		// set up arrays of walkers
		this.walkerPositions.splice(0, this.walkerPositions.length) // clean the array out (fixes bug with redraws)
		for( let w = 0; w < this.walkers; w++ ){
			this.walkerPositions.push(this.sketch.createVector(ctrX,ctrY)); // all walkers start at origin
		}

		// Set up the windows and return the coordinates of the corners
		this.cornersList = this.chaosWindow(ctrX, ctrY, radius); // locations of the corners

		// Set frame rate
		this.sketch.frameRate(10);

		// canvas clear/background
		this.sketch.clear();
		this.sketch.background(this.currentPalette.backgroundColor);

		// Draw corner labels if desired
		if ( this.showLabels ) {
			this.sketch.stroke(this.currentPalette.textColor);
			this.sketch.fill(this.currentPalette.textColor);
			this.sketch.strokeWeight(textStroke);
			this.sketch.textSize(textSize);
			this.sketch.textAlign(this.sketch.CENTER,this.sketch.CENTER);
			const cornersLabels = this.chaosWindow(ctrX, ctrY,(radius)*(labelOutset)); // locations of the labels
			for ( let c = 0 ; c < this.corners ; c++ ) {
				const label = cornersLabels[c];
				this.sketch.text(String(c),label.x,label.y);
			}
		}

		// no stroke (in particular, no outline on circles)
		this.sketch.strokeWeight(0);
	}

	draw() {

		super.draw();

		// we do pixelsPerFrame pixels each time through the draw cycle; this speeds things up essentially
		for( let px = 0; px < this.pixelsPerFrame; px++ ){
			
			// myIndex tells which term we are drawing
			this.myIndex += 1;

			// get the term
			const myTerm = this.seq.getElement(this.myIndex);

			if( !(myTerm === undefined) && (this.num === 0 || this.pixelCount < this.num) ){

				// check its modulus to see which corner to walk toward
				const myCorner = this.numModulus(myTerm, this.corners);
				const myCornerPosition = this.cornersList[myCorner];

				// check the index modulus to see which walker is walking
				const myWalker = this.numModulus(this.myIndex, this.walkers);

				// update the walker position
				this.walkerPositions[myWalker].x = (1-this.frac)*this.walkerPositions[myWalker].x + this.frac*myCornerPosition.x;
				this.walkerPositions[myWalker].y = (1-this.frac)*this.walkerPositions[myWalker].y + this.frac*myCornerPosition.y;
			
				// choose colour to mark position
				let myColor = this.sketch.color(0);
				if( this.colorStyle == ColorStyle.Walker ){
					myColor = this.currentPalette.colorList[myWalker];
				}
				if( this.colorStyle == ColorStyle.Corner ){
					myColor = this.currentPalette.colorList[myCorner];
				}
				if( this.colorStyle == ColorStyle.Index ){
					if ( this.num ) {
						myColor = this.sketch.lerpColor(this.currentPalette.colorList[0], this.currentPalette.colorList[1], this.myIndex/this.num );
					} else {
						myColor = this.sketch.lerpColor(this.currentPalette.colorList[0], this.currentPalette.colorList[1], this.numModulus(this.myIndex,10000)/10000 );
					}
				}
				if( this.colorStyle == ColorStyle.Highlight ){
					if( myWalker == this.highlightWalker ){
						myColor = this.currentPalette.colorList[0];
					} else {
						myColor = this.currentPalette.colorList[1];
					}
				}
				myColor.setAlpha(255*this.alpha); // the 255 is needed when in RGB mode; can change in other modes; see p5.js docs on setAlpha

				// draw a circle
				this.sketch.fill(myColor);
				this.sketch.circle( this.walkerPositions[myWalker].x, this.walkerPositions[myWalker].y, this.circSize );

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
