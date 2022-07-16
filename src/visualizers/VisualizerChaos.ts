import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import {VisualizerExportModule} from './VisualizerInterface'

/** md
# Chaos Visualizer

This visualizer interprets the sequence entries as instructions for walkers
traversing the region bounded by the vertices of a regular $n$-gon, and displays
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
        sketch: p5,
        hexList: string[] = [],
        hexBack = '#000000',
        hexText = '#FFFFFF'
    ) {
        this.colorList = hexList.map(colorSpec => sketch.color(colorSpec))
        this.backgroundColor = sketch.color(hexBack)
        this.textColor = sketch.color(hexText)
    }
}

enum ColorStyle {
    Walker,
    Destination,
    Index,
    Highlighting_one_walker,
}

// other ideas:  previous parts of the sequence fade over time,
// or shrink over time;
// circles fade to the outside

class VisualizerChaos extends VisualizerDefault {
    name = 'Chaos'
    corners = 4
    frac = 0.5
    walkers = 1
    colorStyle = ColorStyle.Walker
    gradientLength = 10000
    highlightWalker = 0
    first = NaN
    last = NaN
    circSize = 1
    alpha = 0.9
    pixelsPerFrame = 400
    showLabels = false
    darkMode = false

    params = {
        corners: {
            value: this.corners,
            forceType: 'integer',
            displayName: 'Number of corners',
            required: true,
            description:
                'The number of vertices of the polygon; this value is also '
                + 'used as a modulus applied to the entries.',
        },
        frac: {
            value: this.frac,
            displayName: 'Fraction to walk',
            required: true,
            description:
                'What fraction of the way each step takes you toward the '
                + 'vertex specified by the entry. It should be a '
                + 'value between 0 and 1 inclusive.',
        },
        walkers: {
            value: this.walkers,
            forceType: 'integer',
            displayName: 'Number of walkers',
            required: true,
            description:
                'The number w of walkers. The sequence will be broken into '
                + 'subsequences based on the residue mod w '
                + 'of the index, each with a separate walker.',
        },
        colorStyle: {
            value: this.colorStyle,
            from: ColorStyle,
            displayName: 'Color dots by',
            required: true,
        },
        gradientLength: {
            value: this.gradientLength,
            forceType: 'integer',
            displayName: 'Color cycling length',
            required: false,
            visibleDependency: 'colorStyle',
            visibleValue: ColorStyle.Index,
            description:
                'The number of entries before recycling the color sequence.',
        },
        highlightWalker: {
            value: this.highlightWalker,
            forceType: 'integer',
            displayName: 'Number of walker to highlight',
            required: false,
            visibleDependency: 'colorStyle',
            visibleValue: ColorStyle.Highlighting_one_walker,
        },
        first: {
            value: '' as string | number,
            forceType: 'integer',
            displayName: 'Starting index',
            required: false,
            description:
                'Index of the first entry to use. If this is blank or less '
                + 'than the first valid index, visualization will start '
                + 'at the first valid index.',
        },
        last: {
            value: '' as string | number,
            forceType: 'integer',
            displayName: 'Ending index',
            required: false,
            description:
                'Index of the last entry to use. If this is blank or greater '
                + 'than the last valid index, visualization will end at the '
                + 'last valid index.',
        },
        dummyDotControl: {
            value: false,
            displayName: 'Show additional parameters for the dots ↴',
            required: false,
        },
        circSize: {
            value: this.circSize,
            displayName: 'Size (pixels)',
            required: true,
            visibleDependency: 'dummyDotControl',
            visibleValue: true,
        },
        alpha: {
            value: this.alpha,
            displayName: 'Alpha',
            required: true,
            description:
                'Alpha factor (from 0.0=transparent to 1.0=solid) of the dots.',
            visibleDependency: 'dummyDotControl',
            visibleValue: true,
        },
        pixelsPerFrame: {
            value: this.pixelsPerFrame,
            forceType: 'integer',
            displayName: 'Dots to draw per frame',
            required: true,
            description: '(more = faster).',
            visibleDependency: 'dummyDotControl',
            visibleValue: true,
        },
        showLabels: {
            value: this.showLabels,
            displayName: 'Label corners of polygon?',
            required: false,
        },
        darkMode: {
            value: this.darkMode,
            displayName: 'Use dark mode?',
            required: false,
            description: 'If checked, uses light colors on a dark background',
        },
    }

    // current state variables (used in setup and draw)
    private seqLength = 0
    private myIndex = 0
    private cornersList: p5.Vector[] = []
    private walkerPositions: p5.Vector[] = []

    // colour palette
    private currentPalette = new Palette(this.sketch)

    checkParameters() {
        const status = super.checkParameters()

        const p = this.params
        if (p.corners.value < 2) {
            status.errors.push(
                'The number of corners must be an integer > 1.'
            )
        }
        if (p.frac.value < 0 || p.frac.value > 1) {
            status.errors.push(
                'The fraction must be between 0 and 1 inclusive.'
            )
        }
        if (p.walkers.value < 1) {
            status.errors.push(
                'The number of walkers must be a positive integer.'
            )
        }
        if (p.gradientLength.value < 1) {
            status.errors.push(
                'The colour cycle length must be a positive integer.'
            )
        }
        if (
            p.highlightWalker.value < 0
            || p.highlightWalker.value >= p.walkers.value
        ) {
            status.errors.push(
                'The highlighted walker must be an integer '
                    + 'between 0 and one less than the number of walkers.'
            )
        }
        if (p.circSize.value < 0) {
            status.errors.push('The circle size must be positive.')
        }
        if (p.alpha.value < 0 || p.alpha.value > 1) {
            status.errors.push('The alpha must be between 0 and 1 inclusive.')
        }
        if (p.pixelsPerFrame.value < 1) {
            status.errors.push(
                'The dots per frame must be a positive integer.'
            )
        }

        if (status.errors.length > 0) status.isValid = false
        return status
    }

    numModulus(a: number | bigint, b: number) {
        // This should be replaced with the modulus function in our own library,
        // once that exists
        if (b <= 0) {
            throw new Error('negative modulus error')
        }
        const A = BigInt(a)
        const B = BigInt(b)
        // The return value will be a valid number, because b was a number:
        if (A < 0n) {
            return Number((A % B) + B)
        } else {
            return Number(A % B)
        }
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
                    hexString += Math.floor(Math.random() * 16).toString(16)
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

        // Adjust the starting and ending points if need be
        let adjusted = false
        if (
            typeof this.params.first.value === 'string'
            || this.first < this.seq.first
        ) {
            this.first = this.seq.first
            adjusted = true
        }
        if (
            typeof this.params.last.value === 'string'
            || this.last > this.seq.last
        ) {
            this.last = this.seq.last
            adjusted = true
        }
        if (adjusted) this.refreshParams()
        this.seqLength = this.last - this.first
        this.myIndex = this.first

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
            this.sketch.stroke(this.currentPalette.textColor)
            this.sketch.fill(this.currentPalette.textColor)
            this.sketch.strokeWeight(textStroke)
            this.sketch.textSize(textSize)
            this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER)
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
        super.draw()

        // we do pixelsPerFrame pixels each time through the draw cycle;
        // this speeds things up essentially
        const pixelsLimit =
            this.myIndex
            + Math.min(this.last - this.myIndex + 1, this.pixelsPerFrame)

        for (; this.myIndex < pixelsLimit; this.myIndex++) {
            // get the term
            const myTerm = this.seq.getElement(this.myIndex)

            // check its modulus to see which corner to walk toward
            const myCorner = this.numModulus(myTerm, this.corners)
            const myCornerPosition = this.cornersList[myCorner]

            // check the index modulus to see which walker is walking
            const myWalker = this.numModulus(this.myIndex, this.walkers)

            // update the walker position
            this.walkerPositions[myWalker].lerp(myCornerPosition, this.frac)

            // choose colour to mark position
            let myColor = this.sketch.color(0)
            switch (this.colorStyle) {
                case ColorStyle.Walker:
                    myColor = this.currentPalette.colorList[myWalker]
                    break
                case ColorStyle.Destination:
                    myColor = this.currentPalette.colorList[myCorner]
                    break
                case ColorStyle.Index:
                    if (this.seqLength < +Infinity) {
                        myColor = this.sketch.lerpColor(
                            this.currentPalette.colorList[0],
                            this.currentPalette.colorList[1],
                            this.myIndex / this.seqLength
                        )
                    } else {
                        myColor = this.sketch.lerpColor(
                            this.currentPalette.colorList[0],
                            this.currentPalette.colorList[1],
                            this.numModulus(
                                this.myIndex,
                                this.gradientLength
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
            this.sketch.fill(myColor)
            this.sketch.circle(
                this.walkerPositions[myWalker].x,
                this.walkerPositions[myWalker].y,
                this.circSize
            )
        }
        // stop drawing if we exceed decreed terms
        if (this.myIndex > this.last) this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Chaos',
    VisualizerChaos,
    'Chaos game played on a sequence.'
)
