import p5 from 'p5'
import {markRaw} from 'vue'

import interFont from '@/assets/fonts/inter/Inter-VariableFont_slnt,wght.ttf'
import {INVALID_COLOR} from './P5Visualizer'
import {P5GLVisualizer} from './P5GLVisualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {math, MathFormula, CachingError} from '@/shared/math'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

//[<img
//  src="../../assets/img/Chaos/TODO.png"
//  width=500
//  style="margin-left: 1em; margin-right: 0.5em"
///>](../assets/img/Chaos/TODO.png)

/** md
# Chaos Visualizer

This visualizer interprets the sequence entries as instructions for walkers
traversing the region bounded by the vertices of a regular _n_-gon, and displays
the locations that the walkers visit.

More precisely, the walker begins in the centre of the polygon.  As it reads
each sequence entry a_k, it interprets that sequence entry as a polygon corner
(typically by taking it modulo n; but a customizable formula is optional),
and walks a proportion of the distance from its current location to the
corner (typically halfway).  Then it paits a dot in its current
location, and repeats using the next sequence term.

When this process is performed with a random sequence, this is called the
`chaos game.'  The chaos game on a square produces a uniformly coloured
square, but on other shapes it produces fractal images.  For example, on
a triangle, one obtains the Sierpinsky gasket in the limit.

For non-random sequences, the distribution of dots can pick up information
about local correlations and overall distribution.
**/

// the symbols available for the colour and step formulas
const formulaSymbols = [
    'n',
    'a',
    'A',
    's',
    'm',
    'M',
    'f',
    'c',
    'p',
    'C',
    'w',
    'W',
    'x',
    'y',
] as const

// the symbols available for the corner formula
// excludes C (corner walking too)
// since that would be circular
const formulaSymbolsCorner = [
    'n',
    'a',
    'A',
    's',
    'm',
    'M',
    'f',
    'c',
    'p',
    'w',
    'W',
    'x',
    'y',
] as const

// the symbols available for the walker formula
// excludes C,w,c,x,y
// since which walker you are choosing
// cannot depend on properties of the walker
// and this is determined before a corner
// is chosen
const formulaSymbolsWalker = [
    'n',
    'a',
    'A',
    's',
    'm',
    'M',
    'f',
    'p',
    'W',
] as const

const paramDesc = {
    /** md
- **Corners**: the number of corners on the polygon.
There must be at least two.
If there are n corners, then the corners are numbered 0, 1,
2, ..., n-1 (for use in the formulas via the `c' variable).
    **/
    corners: {
        default: 4,
        type: ParamType.INTEGER,
        displayName: 'Number of corners',
        required: true,
        description: 'The number of vertices of the polygon',
        validate(c: number, status: ValidationStatus) {
            if (c < 2) status.addError('must be at least 2')
        },
    },
    /** md
- **Walkers**: the number of separate walkers (each one having its
own independent state variables).
If there are n walkers, then the walkers are numbered 0, 1,
2, ..., n-1 (for use in formulas via the `w' variable).
    **/
    walkers: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Number of walkers',
        required: false,
        description:
            'The number w of walkers. The sequence will be broken into '
            + 'subsequences based on a formula,'
            + 'each with a separate independent walker.',
        validate(w: number, status: ValidationStatus) {
            if (w < 1) status.addError('must be at least 1')
        },
    },
    /** md
- **Background color**: The color of the visualizer canvas.
     **/
    bgColor: {
        default: '#000000FF',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },

    /** md
- **Walker Formula**:  The walker to move on the next term.
It can depend on:

  `n` The index of the entry in the sequence being visualized.

  `a` The value of the entry.

  `s` The serial number of the step starting from one for the first dot.

  `m` The minimum index of the sequence being visualized. Note that the
  above definitions mean that `n`, `s`, and `m` are related by `n = m + s - 1`.

  `M` The Maximum index of the sequence being visualized. Note this value
  may be Infinity for sequences that are defined and can be calculated in
  principle for any index.

  'p' The number of corners.

  `f` The frame number of this drawing pass. If you use this variable, the
  visualization will be redrawn from the beginning on every frame,
  animating the shape of the path.

  You may also use the symbol `A` as a function symbol in your code, and it
  will provide access to the value of the sequence being visualized for any
  index. For example, the formula `A(n+1) - A(n)` or equivalently `A(n+1) - a`
  would produce the so-called "first differences" of the sequence.

    **/
    walkerFormula: {
        default: new MathFormula('mod(a,W)'),
        type: ParamType.FORMULA,
        symbols: formulaSymbolsWalker,
        displayName: 'Walker formula',
        description: 'The walker to move.',
        required: false,
        level: 0,
    },

    /** md
- **Corner Formula**:  The corner heading of the next term.

Besides the previous variables, it can additionally depend on:

  'c' The corner we just stepped toward.

  'w' The walker.

  `x` The x-coordinate of the dot (before stepping).

  `y` The y-coordinate of the dot (before stepping).

    **/
    cornerFormula: {
        default: new MathFormula('mod(a,p)'),
        type: ParamType.FORMULA,
        symbols: formulaSymbolsCorner, // can't depend on corner
        displayName: 'Corner formula',
        description: 'Computes the corner dot walks toward',
        required: false,
        level: 0,
    },

    /** md
- **Size Formula**:  The size of each dot.

Besides the previous variables, it can additionally depend on:

  'C' The corner we are about to step toward.

    **/
    sizeFormula: {
        default: new MathFormula('1'),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Size formula',
        description: 'Computes the size of each dot',
        required: false,
        level: 0,
    },
    /** md
- **Step Formula**:  What fraction of distance to corner to walk.
Variables are as for the Size Formula.
    **/
    stepFormula: {
        default: new MathFormula('0.5'),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Step formula',
        description: 'Computes the fraction of distance to corner to walk',
        required: false,
        level: 0,
    },

    /** md
- **Color formula**: an expression to compute the color of each dot.
Variables are as for the Size Formula.
    **/
    colorFormula: {
        default: new MathFormula('#c98787'),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Color formula',
        description: 'Computes the color of each dot',
        required: false,
        level: 0,
    },
    /** md
- **Color chooser**: This color picker does not directly control the display.
  Instead, whenever you select a color with it, the corresponding color
  string is inserted in the **Color formula** box.
    **/
    colorChooser: {
        default: '#00d0d0',
        type: ParamType.COLOR,
        displayName: 'Color chooser:',
        required: true,
        description:
            'Inserts choice into the Color formula, replacing current '
            + 'selection therein, if any.',
        updateAction: function (newColor: string) {
            const chaos = this instanceof Chaos ? this : null
            if (chaos === null) return
            const cfIn = document.querySelector('.param-field #colorFormula')
            if (!(cfIn instanceof HTMLInputElement)) return
            const cf = chaos.tentativeValues.colorFormula
            const start = cfIn.selectionStart ?? cf.length
            const end = cfIn.selectionEnd ?? start
            chaos.tentativeValues.colorFormula =
                cf.substr(0, start) + newColor + cf.substr(end)
        },
    },

    /** md
- **Dots per frame**:  How fast the visualization fills in the dots.
    **/

    pixelsPerFrame: {
        default: 50,
        type: ParamType.NUMBER,
        displayName: 'Dots to draw per frame',
        required: false,
        description: '(more = faster).',
        validate(p: number, status: ValidationStatus) {
            if (p < 1) status.addError('must be at least 1')
        },
    },

    /** md
- **Show Labels**:  Labels the corners of the polygon.
    **/

    showLabels: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Label corners of polygon?',
        required: false,
    },
} satisfies GenericParamDescription

// TODO:  other ideas:  previous parts of the sequence fade over time,
// or shrink over time;
// circles fade to the outside

// How many dots to gather into a reusable Geometry object
// Might need tuning
const CHUNK_SIZE = 256

class Chaos extends P5GLVisualizer(paramDesc) {
    static category = 'Chaos'
    static description =
        'Terms of the sequence attract a walker to a corner of the polygon'

    // current state variables (used in setup and draw)
    private cornersList: p5.Vector[] = [] // locations of polygon corners
    private radius = 0 // of polygon
    private labelOutset = 1.1 // text offset outward
    private fontsLoaded = false

    // variables recording the drawing data (dots)
    // this.dots consists of this.walkers number of arrays, i.e.
    // it is an array of arrays
    // similar for the other data (sizes, colors)
    private dots = markRaw([[new p5.Vector()]]) as p5.Vector[][]
    private dotsIndices = markRaw([[1n]]) as bigint[][]
    private dotsSizes = markRaw([[1]]) as number[][]
    private dotsColors = markRaw([[INVALID_COLOR]]) as p5.Color[][]
    private dotsCorners = markRaw([[0]]) as number[][]
    private chunks: p5.Geometry[] = markRaw([]) // "frozen" chunks of data
    private cursor = 0 // where in data to start drawing
    private pathFailure = false // for cache errors

    // misc
    private firstIndex = 0n // first term
    private dotLimit = 100000 // limit # of dots (prevent lag)
    private maxLength = 0 // current dot limit (can change)

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // warn when not using entire sequence
        if (this.seq.length > this.dotLimit) {
            status.addWarning(
                `Using only the first ${this.dotLimit} terms `
                    + 'to prevent lag.'
            )
        }

        return status
    }

    chaosWindow(radius: number) {
        // creates corners of a polygon with given radius
        const pts: p5.Vector[] = []
        for (let i = 0; i < this.corners; i++) {
            const angle = this.sketch.radians(270 + (360 * i) / this.corners)
            pts.push(p5.Vector.fromAngle(angle, radius))
        }
        return pts
    }

    setup() {
        super.setup()

        this.fontsLoaded = false
        this.sketch.loadFont(interFont, font => {
            this.sketch.textFont(font)
            this.fontsLoaded = true
        })

        this.firstIndex = this.seq.first
        this.maxLength = math.min(Number(this.seq.length), this.dotLimit)

        // size of polygon
        this.radius = math.min(this.sketch.height, this.sketch.width) * 0.4

        // Set up the windows and return the coordinates of the corners
        this.cornersList = this.chaosWindow(this.radius)

        this.sketch.frameRate(60)

        this.sketch.clear(0, 0, 0, 0)

        // no stroke (in particular, no outline on circles)
        this.sketch.strokeWeight(0)

        // draw from beginning
        this.cursor = 0

        // set up the arrays
        this.refresh()
    }

    // reset the computed dots (arrays)
    // lose all the old data
    refresh() {
        console.log('refreshing')
        this.chunks = markRaw([])
        const firstSize = 1
        const firstColor = this.sketch.color(this.bgColor)
        // put the first walker dot into the arrays
        this.dots = markRaw([[new p5.Vector()]])
        this.dotsIndices = markRaw([[0n]])
        this.dotsSizes = markRaw([[firstSize]])
        this.dotsColors = markRaw([[firstColor]])
        this.dotsCorners = markRaw([[0]])
        // for every other walker, push another walker array
        // keep in mind the first entry in the arrays is a "dummy" indicating
        // that you start at the origin, but we don't draw that dot
        for (let currWalker = 0; currWalker < this.walkers; currWalker++) {
            this.dots.push([new p5.Vector()])
            this.dotsIndices.push([0n])
            this.dotsSizes.push([firstSize])
            this.dotsColors.push([firstColor])
            this.dotsCorners.push([0])
        }
        this.redraw()
    }

    // reset the drawing without resetting the computed dots
    // blanks the screen and sets up to redraw the dots
    redraw() {
        console.log('redrawing')
        this.cursor = 0
        // prepare canvas with polygon labels
        this.sketch.background(this.bgColor)
        this.drawLabels()
    }

    drawLabels() {
        if (!this.showLabels) return

        // text appearance control
        const shrink = Math.log(this.corners)
        // Shrink the numbers appropriately (up to about 100 corners or so)
        const textSize = (this.sketch.width * 0.04) / shrink

        // labels are currently white: TODO make contrast background
        this.sketch
            .stroke('white')
            .fill('white')
            .strokeWeight(0)
            .textSize(textSize)

        // Find locations for labels
        const cornersLabels = this.chaosWindow(this.radius * this.labelOutset)

        // Draw the labels
        for (let c = 0; c < this.corners; c++) {
            const label = cornersLabels[c]
            // WebGL is warning here, but we HAVE loaded a font back in setup??
            this.sketch.text(String(c), label.x, label.y)
        }
    }

    // Draws the dots between start and end INCLUSIVE
    drawVertices(start: number, end: number) {
        const sketch = this.sketch
        for (let currWalker = 0; currWalker < this.walkers; currWalker++) {
            // for each walker we look in dotsIndices
            // to check if we are between
            // start and end; this could be empty
            console.log('findIndex')
            const startArrayIndex = math.max(
                this.dotsIndices[currWalker].findIndex(
                    n => n >= BigInt(start)
                ),
                0
            )
            console.log('done findIndex')
            let lastPos = this.dots[currWalker][startArrayIndex]
            for (
                // avoid i=0, dummy position
                let i = math.max(1, startArrayIndex + 1);
                this.dotsIndices[currWalker][i] <= end;
                i++
            ) {
                const pos = this.dots[currWalker][i]
                if (pos.x !== lastPos.x || pos.y !== lastPos.y) {
                    sketch.fill(this.dotsColors[currWalker][i])
                    const size = this.dotsSizes[currWalker][i]
                    //sketch.push()
                    //sketch.translate(lastPos.x, lastPos.y)
                    //sketch.circle(pos.x, pos.y, this.dotsSizes[currWalker][i])
                    sketch.rect(pos.x, pos.y, size, size)
                    //sketch.pop()
                }
                lastPos = pos
            }
        }
    }

    mouseWheel(event: WheelEvent) {
        super.mouseWheel(event)
        this.cursor = 0 // make sure we redraw
    }

    // how many dots do we have stored?
    currentLength() {
        let currentLength = -this.walkers // ignore dummy dots
        for (let currWalker = 0; currWalker < this.walkers; currWalker++) {
            currentLength += this.dots[currWalker].length
        }
        return currentLength
    }

    draw() {
        // check if we are zoom/panning, redraw if so
        console.log('Starting')
        // p5 is doing something terrible right here
        // its terribleness is proportional to the
        // size of the stored dot data
        // sometimes image degrades during this pause
        console.log('Starting1.5')
        console.log('Starting1.7')
        if (this.handleDrags()) this.cursor = 0
        console.log('Starting2')
        const sketch = this.sketch
        console.log('Starting3')
        if (this.cursor === 0) this.redraw()
        console.log('Starting4')

        // how much data have we got?
        let currentLength = this.currentLength()
        console.log('currentLength', currentLength)

        // how far do we want to draw?
        let targetCursor = Math.min(
            this.cursor + this.pixelsPerFrame,
            this.maxLength
        )
        // if we are redrawing (e.g. drag),
        // then first frame should
        // advance all the way to where we have
        // computed
        if (this.cursor == 0) {
            targetCursor = Math.min(currentLength + this.pixelsPerFrame, this.maxLength)
        }

        // extend (compute dots) if needed
        if (targetCursor > currentLength) {
            console.log('computation')
            this.extendVertices(sketch.frameCount, targetCursor)
        }
        currentLength = this.currentLength()

        // Now draw dots from cursor to target

        // First see if we can use any chunks
        console.log('from to', this.cursor, targetCursor)
        // How many chunks in what's already drawn
        const fullChunksDrawn = Math.floor(this.cursor / CHUNK_SIZE)
        // How many chunks are stored between cursor and target
        const fullChunksExisting = math.min(
            this.chunks.length,
            Math.floor(targetCursor / CHUNK_SIZE)
        )
        let drewSome = false
        // draw available chunks not yet drawn
        for (
            let chunk = fullChunksDrawn;
            chunk < fullChunksExisting;
            ++chunk
        ) {
            sketch.model(this.chunks[chunk])
            drewSome = true
        }
        if (drewSome) this.cursor = fullChunksExisting * CHUNK_SIZE
        console.log('afterchunks', this.cursor)

        // draw remaining dots
        if (this.cursor < targetCursor) {
            this.drawVertices(this.cursor, targetCursor)
            this.cursor = targetCursor
        }

        // See if we can create a new chunk
        // how many chunks ought to be possible
        const fullChunks = Math.floor(this.cursor / CHUNK_SIZE)
        // if we don't have that many
        if (fullChunks > this.chunks.length) {
            for (
                let chunk = fullChunksExisting + 1;
                chunk < fullChunks;
                chunk++
            ) {
                // @ts-expect-error  The @types/p5 package omitted this function
                sketch.beginGeometry()
                console.log('making chunks')
                this.drawVertices(
                    (chunk - 1) * CHUNK_SIZE,
                    chunk * CHUNK_SIZE
                )
                // @ts-expect-error  Ditto :-(
                this.chunks.push(sketch.endGeometry())
            }
            this.cursor = 0
        }
        console.log('end drawing loop', this.cursor)

        // stop the draw() loop if there's nothing left to do
        if (
            !sketch.mouseIsPressed
            && currentLength >= this.maxLength // computed it all
            && this.cursor >= this.maxLength // drew it all
            && !this.pathFailure
        ) {
            //         console.log('Stopping')
            // we have drawn it all, now we can pan & zoom
            // without doing a slow redraw
            // so we increase pixelsPerFrame
            this.pixelsPerFrame = this.maxLength
            //           this.cursor = 0
            //            this.stop()
        }
    }

    // This should be run each time more dots are needed.
    extendVertices(currentFrames: number, targetLength: number) {
        this.pathFailure = false

        // infer the start index from what's stored / not
        // computes the total drawable dots stored in the arrays
        const len = this.currentLength()
        const startIndex = this.firstIndex + BigInt(len)
        // can change if cache error
        // end index is how much more of the sequence to compute
        const endIndex = this.firstIndex + BigInt(targetLength)

        let currElement = 0n
        for (let i = startIndex; i < endIndex; i++) {
            // try to get the new element and store its data
            try {
                currElement = this.seq.getElement(i)
            } catch (e) {
                this.pathFailure = true
                if (e instanceof CachingError) {
                    return // need to wait for more elements
                } else {
                    // don't know what to do with this
                    throw e
                }
            }

            // variables you can use in walker formula
            // excludes C,c,w,x,y
            const inputWalker = {
                n: Number(i),
                a: Number(currElement),
                s: Number(i - this.seq.first + 1n),
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                f: currentFrames,
                p: this.corners,
                W: this.walkers,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
            }

            // which walker do we move
            let currWalker = 0
            // gives bad data on bigints
            currWalker =
                math.safeNumber(
                    this.walkerFormula.computeWithStatus(
                        this.statusOf.walkerFormula,
                        inputWalker
                    )
                ) ?? 0
            if (this.statusOf.walkerFormula.invalid()) return
            if (currWalker < 0 || currWalker >= this.walkers) {
                throw 'walker formula out of bounds'
                currWalker = 0
            }

            // look up last position of this walker
            const currlen = this.dots[currWalker].length - 1
            const position = this.dots[currWalker][currlen].copy()
            const lastCorner = this.dotsCorners[currWalker][currlen]

            // variables you can use in corner formula (excludes C)
            const inputCorner = {
                n: Number(i),
                a: Number(currElement),
                s: Number(i - this.seq.first + 1n),
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                f: currentFrames,
                c: lastCorner,
                p: this.corners,
                w: currWalker,
                W: this.walkers,
                x: position.x,
                y: position.y,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
            }

            // what corner should I head for?
            let myCorner = 0
            myCorner =
                math.safeNumber(
                    this.cornerFormula.computeWithStatus(
                        this.statusOf.cornerFormula,
                        inputCorner
                    )
                ) ?? 1
            if (this.statusOf.cornerFormula.invalid()) return
            if (myCorner < 0 || myCorner >= this.corners) {
                throw 'corner formula out of bounds'
                myCorner = 0
            }

            const input = {
                n: Number(i),
                a: Number(currElement),
                s: Number(i - this.seq.first + 1n),
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                f: currentFrames,
                c: lastCorner,
                p: this.corners,
                C: myCorner,
                w: currWalker,
                W: this.walkers,
                x: position.x,
                y: position.y,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
            }

            // determine new color
            let clr: unknown = null
            clr =
                this.colorFormula.computeWithStatus(
                    this.statusOf.colorFormula,
                    input
                ) ?? 0
            if (this.statusOf.colorFormula.invalid()) return
            // determine new dot size
            let circSize = 0
            circSize =
                math.safeNumber(
                    this.sizeFormula.computeWithStatus(
                        this.statusOf.sizeFormula,
                        input
                    )
                ) ?? 1
            if (this.statusOf.sizeFormula.invalid()) return
            // determine new stepsize
            let step = 0
            step =
                math.safeNumber(
                    this.stepFormula.computeWithStatus(
                        this.statusOf.stepFormula,
                        input
                    )
                ) ?? 1
            if (this.statusOf.stepFormula.invalid()) return
            // determine new position
            const myCornerPosition = this.cornersList[myCorner]
            position.lerp(myCornerPosition, step)

            // push everything
            this.dots[currWalker].push(position.copy())
            this.dotsSizes[currWalker].push(math.safeNumber(circSize))
            this.dotsIndices[currWalker].push(i)
            this.dotsCorners[currWalker].push(myCorner)
            if (typeof clr === 'string') {
                this.dotsColors[currWalker].push(this.sketch.color(clr))
            } else if (math.isChroma(clr)) {
                this.dotsColors[currWalker].push(this.sketch.color(clr.hex()))
            } else
                this.dotsColors[currWalker].push(this.sketch.color('white'))
        }
    }
}

export const exportModule = new VisualizerExportModule(Chaos)
