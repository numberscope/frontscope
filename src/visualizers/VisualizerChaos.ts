import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import {VisualizerExportModule} from './VisualizerInterface'

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

const ColorStyle = {
    Walker: 0,
    Destination: 1,
    Index: 2,
    Highlighting_one_walker: 3,
} as const

// other ideas:  previous parts of the sequence fade over time,
// or shrink over time;
// circles fade to the outside

class VisualizerChaos extends VisualizerDefault {
    name = 'Chaos'

    // private properly typed versions of the user parameters
    corners = {
        value: 4,
        displayName: 'Number of corners',
        required: true,
        description:
            'The number of vertices of the polygon; this value is also used '
            + 'as a modulus applied to the entries.',
    }
    frac = {
        value: 0.5,
        displayName: 'Fraction to walk',
        required: true,
        description:
            'What fraction of the way each step takes you toward the '
            + 'vertex specified by the entry. It should be a '
            + 'value between 0 and 1 inclusive.',
    }
    walkers = {
        value: 1,
        displayName: 'Number of walkers',
        required: true,
        description:
            'The number w of walkers. The visualizer will break the sequence '
            + 'into subsequences based on the residue mod w of the index, '
            + 'each with a separate walker.',
    }
    colorStyle = {
        value: ColorStyle.Walker as number,
        from: ColorStyle,
        displayName: 'Color dots by',
        required: true,
    }
    gradientLength = {
        value: 10000,
        displayName: 'Color cycling length',
        required: false,
        visibleDependency: 'colorStyle',
        visibleValue: ColorStyle.Index,
        description:
            'The number of entries before recycling the color sequence.',
    }
    highlightWalker = {
        value: 0,
        displayName: 'Number of walker to highlight',
        required: false,
        visibleDependency: 'colorStyle',
        visibleValue: ColorStyle.Highlighting_one_walker,
    }
    first = {
        value: '' as string | number,
        forceType: 'number',
        displayName: 'Starting index',
        required: false,
        description:
            'Index of the first entry to use. If this is blank or less than '
            + 'the first valid index, visualization will start at the '
            + 'first valid index.',
    }
    last = {
        value: '' as string | number,
        forceType: 'number',
        displayName: 'Ending index',
        required: false,
        description:
            'Index of the last entry to use. If this is blank or greater than '
            + 'the last valid index, visualization will end at the '
            + 'last valid index.',
    }
    circSize = {
        value: 1,
        displayName: 'Circle size',
        required: true,
        description: 'Size of the dots.',
    }
    alpha = {
        value: 1,
        displayName: 'Circle alpha',
        required: true,
        description:
            'Alpha factor (from 0.0=transparent to 1.0=solid) of the dots.',
    }
    pixelsPerFrame = {
        value: 400,
        displayName: 'Dots per frame',
        required: true,
        description: 'How many dots to draw per frame (more = faster).',
    }
    showLabels = {
        value: false,
        displayName: 'Show corner labels?',
        required: false,
        description: 'Whether to label corners of polygon.',
    }
    darkMode = {
        value: false,
        displayName: 'Use dark mode?',
        required: false,
        description: 'Whether to make a dark background',
    }

    params = {
        corners: this.corners,
        frac: this.frac,
        walkers: this.walkers,
        colorStyle: this.colorStyle,
        gradientLength: this.gradientLength,
        highlightWalker: this.highlightWalker,
        first: this.first,
        last: this.last,
        circSize: this.circSize,
        alpha: this.alpha,
        pixelsPerFrame: this.pixelsPerFrame,
        showLabels: this.showLabels,
        darkMode: this.darkMode,
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

        // validation checks
        if (!Number.isInteger(this.corners.value) || this.corners.value < 2) {
            status.errors.push(
                'The number of corners must be an integer > 1.'
            )
        }
        if (this.frac.value < 0 || this.frac.value > 1) {
            status.errors.push(
                'The fraction must be between 0 and 1 inclusive.'
            )
        }
        if (!Number.isInteger(this.walkers.value) || this.walkers.value < 1) {
            status.errors.push(
                'The number of walkers must be an integer > 0.'
            )
        }
        if (
            !Number.isInteger(this.gradientLength.value)
            || this.gradientLength.value <= 0
        ) {
            status.errors.push(
                'The colour cycle length must be a positive integer.'
            )
        }
        if (
            !Number.isInteger(this.highlightWalker.value)
            || this.highlightWalker.value < 0
            || this.highlightWalker.value >= this.walkers.value
        ) {
            status.errors.push(
                'The highlighted walker must be an integer '
                    + 'between 0 and one less than the number of walkers.'
            )
        }
        if (
            typeof this.first.value == 'number'
            && !Number.isInteger(this.first.value)
        ) {
            status.errors.push(
                'The starting index must be an integer (or blank).'
            )
        }
        if (
            typeof this.last.value == 'number'
            && !Number.isInteger(this.last.value)
        ) {
            status.errors.push(
                'The ending index must be an integer (or blank).'
            )
        }
        if (this.circSize.value < 0) {
            status.errors.push('The circle size must be positive.')
        }
        if (this.alpha.value < 0 || this.alpha.value > 1) {
            status.errors.push('The alpha must be between 0 and 1 inclusive.')
        }
        if (
            !Number.isInteger(this.pixelsPerFrame.value)
            || this.pixelsPerFrame.value < 0
        ) {
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
        for (let i = 0; i < this.corners.value; i++) {
            const angle = this.sketch.radians(
                45 + (360 * i) / this.corners.value
            )
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
        if (this.darkMode.value) {
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
            (this.colorStyle.value === ColorStyle.Walker
                && this.walkers.value > 7)
            || (this.colorStyle.value === ColorStyle.Destination
                && this.corners.value > 7)
        ) {
            let paletteSize = 0
            if (this.colorStyle.value === ColorStyle.Walker)
                paletteSize = this.walkers.value
            if (this.colorStyle.value === ColorStyle.Destination)
                paletteSize = this.corners.value
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
                this.darkMode.value ? darkColor : lightColor,
                this.darkMode.value ? lightColor : darkColor
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
        const shrink = Math.log(this.corners.value)
        // Shrink the numbers appropriately (up to about 100 corners or so):
        const textSize = (this.sketch.width * 0.04) / shrink
        // No stroke right now, but could be added
        const textStroke = this.sketch.width * 0

        // Adjust the starting and ending points if need be
        if (
            typeof this.first.value === 'string'
            || this.first.value < this.seq.first
        ) {
            this.first.value = this.seq.first
        }
        if (
            typeof this.last.value === 'string'
            || this.last.value > this.seq.last
        ) {
            this.last.value = this.seq.last
        }
        console.log('Finally,', this.first.value, this.last.value)
        this.seqLength = this.last.value - this.first.value
        this.myIndex = this.first.value

        // set up arrays of walkers
        this.walkerPositions = Array.from({length: this.walkers.value}, () =>
            center.copy()
        )

        // Set up the windows and return the coordinates of the corners
        this.cornersList = this.chaosWindow(center, radius)

        // Set frame rate
        this.sketch.frameRate(10)

        // canvas clear/background
        this.sketch.clear()
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
            for (let c = 0; c < this.corners.value; c++) {
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
        const pixelsLimit
            = this.myIndex
            + Math.min(
                (this.last.value as number) - this.myIndex + 1,
                this.pixelsPerFrame.value
            )
        // stop drawing if we exceed decreed terms
        if (pixelsLimit <= this.myIndex) {
            this.sketch.noLoop()
            return
        }

        for (; this.myIndex < pixelsLimit; this.myIndex++) {
            // get the term
            const myTerm = this.seq.getElement(this.myIndex)

            // check its modulus to see which corner to walk toward
            const myCorner = this.numModulus(myTerm, this.corners.value)
            const myCornerPosition = this.cornersList[myCorner]

            // check the index modulus to see which walker is walking
            const myWalker = this.numModulus(this.myIndex, this.walkers.value)

            // update the walker position
            this.walkerPositions[myWalker].lerp(
                myCornerPosition,
                this.frac.value
            )

            // choose colour to mark position
            let myColor = this.sketch.color(0)
            switch (this.colorStyle.value) {
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
                                this.gradientLength.value
                            ) / this.gradientLength.value
                        )
                    }
                    break
                case ColorStyle.Highlighting_one_walker:
                    if (myWalker == this.highlightWalker.value) {
                        myColor = this.currentPalette.colorList[0]
                    } else {
                        myColor = this.currentPalette.colorList[1]
                    }
                    break
            }
            // The following "255" is needed when in RGB mode;
            // can change in other modes; see p5.js docs on setAlpha
            myColor.setAlpha(255 * this.alpha.value)

            // draw a circle
            this.sketch.fill(myColor)
            this.sketch.circle(
                this.walkerPositions[myWalker].x,
                this.walkerPositions[myWalker].y,
                this.circSize.value
            )
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Chaos',
    VisualizerChaos,
    'Chaos game played on a sequence.'
)
