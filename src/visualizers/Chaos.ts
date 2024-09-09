import p5 from 'p5'

import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {math} from '@/shared/math'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'

/** md
# Chaos Visualizer

This visualizer interprets the sequence entries as instructions for walkers
traversing the region bounded by the vertices of a regular _n_-gon, and displays
the locations that the walkers visit.

_This visualizer documentation page is a stub. You can improve Numberscope
by adding detail._
**/

// p5 Colour palette class
class Palette {
    colorList: p5.Color[] = []
    backgroundColor: p5.Color
    textColor: p5.Color

    constructor(
        sketch: p5 | undefined = undefined,
        hexList: string[] = [],
        hexBack = '#000000',
        hexText = '#FFFFFF'
    ) {
        if (sketch) {
            this.colorList = hexList.map(colorSpec => sketch.color(colorSpec))
            this.backgroundColor = sketch.color(hexBack)
            this.textColor = sketch.color(hexText)
        } else {
            this.backgroundColor = INVALID_COLOR
            this.textColor = INVALID_COLOR
        }
    }
}

enum ColorStyle {
    Walker,
    Destination,
    Index,
    Highlighting_one_walker,
}

const paramDesc = {
    corners: {
        default: 4,
        type: ParamType.INTEGER,
        displayName: 'Number of corners',
        required: true,
        description:
            'The number of vertices of the polygon; this value is also '
            + 'used as a modulus applied to the entries.',
    },
    frac: {
        default: 0.5,
        type: ParamType.NUMBER,
        displayName: 'Fraction to walk',
        required: false,
        description:
            'What fraction of the way each step takes you toward the '
            + 'vertex specified by the entry. It should be a '
            + 'value between 0 and 1 inclusive.',
    },
    walkers: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Number of walkers',
        required: false,
        description:
            'The number w of walkers. The sequence will be broken into '
            + 'subsequences based on the residue mod w '
            + 'of the index, each with a separate walker.',
    },
    colorStyle: {
        default: ColorStyle.Walker,
        type: ParamType.ENUM,
        from: ColorStyle,
        displayName: 'Color dots by',
        required: true,
        description: 'The way the dots should be colored',
    },
    gradientLength: {
        default: 10000,
        type: ParamType.INTEGER,
        displayName: 'Color cycling length',
        required: false,
        visibleDependency: 'colorStyle',
        visibleValue: ColorStyle.Index,
        description:
            'The number of entries before recycling the color sequence.',
    },
    highlightWalker: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Number of walker to highlight',
        required: false,
        visibleDependency: 'colorStyle',
        visibleValue: ColorStyle.Highlighting_one_walker,
    },
    dummyDotControl: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Show additional parameters for the dots ↴',
        required: false,
    },
    circSize: {
        default: 1,
        type: ParamType.NUMBER,
        displayName: 'Size (pixels)',
        required: false,
        visibleDependency: 'dummyDotControl',
        visibleValue: true,
    },
    alpha: {
        default: 0.9,
        type: ParamType.NUMBER,
        displayName: 'Alpha',
        required: false,
        description:
            'Alpha factor (from 0.0=transparent to 1.0=solid) of the dots.',
        visibleDependency: 'dummyDotControl',
        visibleValue: true,
    },
    pixelsPerFrame: {
        default: 400n,
        type: ParamType.BIGINT,
        displayName: 'Dots to draw per frame',
        required: false,
        description: '(more = faster).',
        visibleDependency: 'dummyDotControl',
        visibleValue: true,
    },
    showLabels: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Label corners of polygon?',
        required: false,
    },
    darkMode: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Use dark mode?',
        required: false,
        description: 'If checked, uses light colors on a dark background',
    },
} satisfies GenericParamDescription

// other ideas:  previous parts of the sequence fade over time,
// or shrink over time;
// circles fade to the outside

class Chaos extends P5Visualizer(paramDesc) {
    static category = 'Chaos'
    static description = 'Chaos game played using a sequence to select moves'

    // current state variables (used in setup and draw)
    private myIndex = 0n
    private cornersList: p5.Vector[] = []
    private walkerPositions: p5.Vector[] = []

    // colour palette
    private currentPalette = new Palette()

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.corners < 2) {
            status.addError('The number of corners must be an integer > 1.')
        }
        if (params.frac < 0 || params.frac > 1) {
            status.addError('The fraction must be between 0 and 1 inclusive.')
        }
        if (params.walkers < 1) {
            status.addError(
                'The number of walkers must be a positive integer.'
            )
        }
        if (params.gradientLength < 1) {
            status.addError(
                'The colour cycle length must be a positive integer.'
            )
        }
        if (
            params.highlightWalker < 0
            || params.highlightWalker >= params.walkers
        ) {
            status.addError(
                'The highlighted walker must be an integer '
                    + 'between 0 and one less than the number of walkers.'
            )
        }
        if (params.circSize < 0) {
            status.addError('The circle size must be positive.')
        }
        if (params.alpha < 0 || params.alpha > 1) {
            status.addError('The alpha must be between 0 and 1 inclusive.')
        }
        if (params.pixelsPerFrame < 1) {
            status.addError('The dots per frame must be a positive integer.')
        }

        return status
    }

    chaosWindow(center: p5.Vector, radius: number) {
        // creates corners of a polygon with given centre and radius
        const pts: p5.Vector[] = []
        for (let i = 0; i < this.corners; i++) {
            const angle = this.sketch.radians(45 + (360 * i) / this.corners)
            pts.push(p5.Vector.fromAngle(angle, radius).add(center))
        }
        return pts
    }

    setup() {
        super.setup()
        // decide which palette to set by default
        // we need a colourpicker in the params eventually
        // right now this is a little arbitrary
        const defaultColorList = [
            '#588dad', // blue greenish
            '#daa520', // orange
            '#008a2c', // green
            '#ff6361', // fuschia
            '#ffa600', // bright orange
            '#bc5090', // lerp toward purple
            '#655ca3', // purple
        ]
        const darkColor = '#262626'
        const lightColor = '#f5f5f5'
        if (this.darkMode) {
            this.currentPalette = new Palette(
                this.sketch,
                defaultColorList,
                darkColor,
                lightColor
            )
        } else {
            this.currentPalette = new Palette(
                this.sketch,
                defaultColorList,
                lightColor,
                darkColor
            )
        }
        if (
            (this.colorStyle === ColorStyle.Walker
                && this.walkers > defaultColorList.length)
            || (this.colorStyle === ColorStyle.Destination
                && this.corners > defaultColorList.length)
        ) {
            let paletteSize = 0
            if (this.colorStyle === ColorStyle.Walker) {
                paletteSize = this.walkers
            }
            if (this.colorStyle === ColorStyle.Destination) {
                paletteSize = this.corners
            }
            const colorList: string[] = []
            for (let c = 0; c < paletteSize; c++) {
                let hexString = ''
                for (let h = 0; h < 6; h++) {
                    hexString += math.randomInt(16).toString(16)
                }
                colorList.push('#' + hexString)
            }
            this.currentPalette = new Palette(
                this.sketch,
                colorList,
                this.darkMode ? darkColor : lightColor,
                this.darkMode ? lightColor : darkColor
            )
        }

        // set center coords and size
        const center = this.sketch.createVector(
            this.sketch.width * 0.5,
            this.sketch.height * 0.5
        )
        const radius = this.sketch.width * 0.4

        // text appearance control
        const labelOutset = 1.1
        const shrink = Math.log(this.corners)
        // Shrink the numbers appropriately (up to about 100 corners or so):
        const textSize = (this.sketch.width * 0.04) / shrink
        // No stroke right now, but could be added
        const textStroke = this.sketch.width * 0

        this.myIndex = this.seq.first

        // set up arrays of walkers
        this.walkerPositions = Array.from({length: this.walkers}, () =>
            center.copy()
        )

        // Set up the windows and return the coordinates of the corners
        this.cornersList = this.chaosWindow(center, radius)

        // Set frame rate
        this.sketch.frameRate(10)

        // canvas clear/background
        this.sketch.clear(0, 0, 0, 0)
        this.sketch.background(this.currentPalette.backgroundColor)

        // Draw corner labels if desired
        if (this.showLabels) {
            this.sketch
                .stroke(this.currentPalette.textColor)
                .fill(this.currentPalette.textColor)
                .strokeWeight(textStroke)
                .textSize(textSize)
                .textAlign(this.sketch.CENTER, this.sketch.CENTER)
            // Get appropriate locations for the labels
            const cornersLabels = this.chaosWindow(
                center,
                radius * labelOutset
            )
            for (let c = 0; c < this.corners; c++) {
                const label = cornersLabels[c]
                this.sketch.text(String(c), label.x, label.y)
            }
        }

        // no stroke (in particular, no outline on circles)
        this.sketch.strokeWeight(0)
    }

    draw() {
        const sketch = this.sketch
        // We attempt to draw pixelsPerFrame pixels each time through the
        // draw cycle; this "chunking" speeds things up -- that's essential,
        // because otherwise the overall patterns created by the chaos are
        // much too slow to show up, especially at small pixel sizes.
        // Note that we might end up drawing fewer pixels if, for example,
        // we hit a cache boundary during a frame (at which point getElement
        // will throw a CachingError, breaking out of draw() altogether). But
        // in the next frame, likely the caching is done (or at least has moved
        // to significantly higher indices), and drawing just picks up where
        // it left off.
        let pixelsLimit = this.myIndex + this.pixelsPerFrame
        if (pixelsLimit > this.seq.last) {
            pixelsLimit = BigInt(this.seq.last) + 1n
            // have to add one to make sure we eventually stop
        }
        for (; this.myIndex < pixelsLimit; this.myIndex++) {
            // get the term
            const myTerm = this.seq.getElement(this.myIndex)

            // check its modulus to see which corner to walk toward
            // (Safe to convert to number since this.corners is "small")
            const myCorner = Number(math.modulo(myTerm, this.corners))
            const myCornerPosition = this.cornersList[myCorner]

            // check the index modulus to see which walker is walking
            // (Ditto on safety.)
            const myWalker = Number(math.modulo(this.myIndex, this.walkers))

            // update the walker position
            this.walkerPositions[myWalker].lerp(myCornerPosition, this.frac)

            // choose colour to mark position
            let myColor = sketch.color(0)
            switch (this.colorStyle) {
                case ColorStyle.Walker:
                    myColor = this.currentPalette.colorList[myWalker]
                    break
                case ColorStyle.Destination:
                    myColor = this.currentPalette.colorList[myCorner]
                    break
                case ColorStyle.Index:
                    if (typeof this.seq.length === 'bigint') {
                        myColor = sketch.lerpColor(
                            this.currentPalette.colorList[0],
                            this.currentPalette.colorList[1],
                            Number(
                                (this.myIndex - this.seq.first)
                                    / this.seq.length
                            )
                        )
                    } else {
                        myColor = sketch.lerpColor(
                            this.currentPalette.colorList[0],
                            this.currentPalette.colorList[1],
                            Number(
                                // Safe since gradientLength is "small"
                                math.modulo(this.myIndex, this.gradientLength)
                            ) / this.gradientLength
                        )
                    }
                    break
                case ColorStyle.Highlighting_one_walker:
                    if (myWalker == this.highlightWalker) {
                        myColor = this.currentPalette.colorList[0]
                    } else {
                        myColor = this.currentPalette.colorList[1]
                    }
                    break
            }
            // The following "255" is needed when in RGB mode;
            // can change in other modes; see p5.js docs on setAlpha
            myColor.setAlpha(255 * this.alpha)

            // draw a circle
            sketch.fill(myColor)
            sketch.circle(
                this.walkerPositions[myWalker].x,
                this.walkerPositions[myWalker].y,
                this.circSize
            )
        }
        // stop drawing if we exceed available terms
        if (this.myIndex > this.seq.last) this.stop()
    }
}

export const exportModule = new VisualizerExportModule(Chaos)
