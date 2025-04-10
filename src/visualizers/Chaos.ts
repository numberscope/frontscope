import p5 from 'p5'
import {markRaw} from 'vue'

import interFont from '@/assets/fonts/inter/Inter-VariableFont_slnt,wght.ttf'
import {INVALID_COLOR} from './P5Visualizer'
import {P5GLVisualizer} from './P5GLVisualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {chroma} from '@/shared/Chroma'
import {math, MathFormula, CachingError} from '@/shared/math'
import type {ScopeValue} from '@/shared/math'
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

This visualizer interprets the sequence entries as instructions for
a "herd" of _h_ ≥ 1 walkers traversing the vicinity of the vertices
of a regular _p_-gon, and displays the locations that the walkers visit.

More precisely, each walker begins in the centre of the polygon.  As it
receives each sequence entry _a_ ₙ, it interprets that entry as a polygon
corner (typically by taking it modulo _p_, but a customizable formula may
optionally be specified). It then walks a configurable proportion of the
distance from its current location to that corner (typically halfway).
It paints a dot in its new location, and repeats using the next sequence
entry, etc.

When this process is performed with a random sequence, this is called the
'chaos game.'  The chaos game on a square produces a uniformly coloured
square, but on other shapes it produces fractal images.  For example, on
a triangle, one obtains the Sierpiński gasket in the limit.

For non-random sequences, the distribution of dots can reveal information
about local correlations and overall distribution of the sequence values.

## Parameters
 **/

const formulaSymbolsWalker = [
    'n', // The index of the entry in the sequence being visualized.
    'a', // The value of the entry.
    'k', // The serial number of the step, starting from one for the first dot.
    'm', // The minimum index of the sequence being visualized.
    'M', // The Maximum index of the sequence being visualized.
    'p', // The number of corners.
    'w', // The number of the prior walker to take a step.
    'h', // The number of walkers.
    'f', // The frame number of the drawing pass in which this step occurs.
    'A', // (function symbol for the sequence)
] as const

// Corner formula adds more symbols
const formulaSymbolsCorner = (
    formulaSymbolsWalker as readonly string[]
).concat([
    'W', // The number of the current walker.
    'c', // The corner that walker `W` stepped toward on its last step.
    'x', // The x-coordinate of the prior dot (before stepping).
    'y', // The y-coordinate of the prior dot (before stepping).
])

// Step formula can use another symbols
const formulaSymbolsStep = formulaSymbolsCorner.concat([
    'C', // The corner we are about to step toward
])

// Remaining formulas have two more
const formulaSymbols = formulaSymbolsStep.concat([
    'X', // The x-coordinate of the new dot (after stepping).
    'Y', // The y-coordinate of the new dot (after stepping).
])

const paramDesc = {
    /** md

- **Number of corners**: (of the polygon). There must be at least two.
If there are _p_ corners, then they are numbered 0, 1,
2, ..., _p_ - 1.  These numberings are used in the `c` and `C`
variables when referencing a corner.
     **/
    corners: {
        default: 4,
        type: ParamType.INTEGER,
        displayName: 'Number of corners',
        required: true,
        description: 'The number of vertices of the polygon',
        validate(c: number, status: ValidationStatus) {
            if (c < 2) status.addError('must be at least 2')
            if (c > 100)
                status.addWarning('a large number may affect performance')
        },
    },
    /** md

- **Number of walkers**: Each walker has its own independent location
and heading. If there are _h_ walkers, then they are numbered 0, 1,
2, ..., _h_ - 1.  These numberings are used in the `w` and `W` variables
when referencing a walker.
     **/
    walkers: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Number of walkers',
        required: false,
        description:
            'The number h of walkers. The sequence will be broken into '
            + 'subsequences based on a formula,'
            + 'each with a separate independent walker.',
        validate(h: number, status: ValidationStatus) {
            status.forbid(h < 1, 'must be at least 1')
            if (h > 100) {
                status.addWarning('a large number may affect performance')
            }
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
- **Walker formula**:  An expression that determines which walker to move
for the current entry of the sequence being visualized. Non-integer values
are reduced to the nearest smaller integer. The result is interpreted as
the number of a walker, and no walker is moved at all if there is no such
walker. For example, a formula value of 5.7 will move the walker numbered 5,
and if there are fewer than 6 walkers, none will move.

The formula can use the following pre-defined variables:

{! Chaos.ts extract:
    start: 'const formulaSymbolsWalker'
    stop: "'A',"
    replace: [['(\w).,\s//(.*)', '`\1` \2\n\n']]
!}

Note that the above definitions mean that `n`, `k`, and `m` are related by
`n = m + k - 1`. The maximum index `M` value may be Infinity for sequences
that are defined and can be calculated (in principle) for any index. The
frame variable `f` can be used to colour dots differently as time progresses.

You may also use the symbol `A` as a function symbol in this formula, and it
will provide access to the value of the sequence being visualized for any
index. For example, the formula `A(n+1) - A(n)` or equivalently `A(n+1) - a`
would produce the so-called "first differences" of the sequence.

     **/
    walkerFormula: {
        default: new MathFormula('mod(n, h)'),
        type: ParamType.FORMULA,
        symbols: formulaSymbolsWalker,
        displayName: 'Walker formula',
        description: 'The walker to move.',
        required: false,
        level: 0,
    },

    /** md
- **Corner formula**:  An expression that determines which corner the
current walker should step toward. (Non-integer values are handled as
with the Walker formula, and again, if there is no such corner, the
walker does not move at all.)

Besides the previous variables, the corner heading can additionally depend on:

{! Chaos.ts extract:
    start: 'const formulaSymbolsCorner'
    stop: ']'
    replace: [['(\w).,\s//(.*)', '`\1` \2\n\n']]
!}

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
- **Step formula**:  An expression that specifies what fraction of
the distance toward the chosen corner the chosen walker will walk.

Besides the previous variables, this formula may also use:

{! Chaos.ts extract:
    start: 'const formulaSymbolsStep'
    stop: ']'
    replace: [['(\w).,\s//(.*)', '`\1` \2\n\n']]
!}

     **/
    stepFormula: {
        default: new MathFormula('0.5'),
        type: ParamType.FORMULA,
        symbols: formulaSymbolsStep,
        displayName: 'Step formula',
        description:
            'Computes the fraction of distance to corner'
            + ' to walk (can exceed 1 or be negative)',
        required: false,
        level: 0,
    },

    /** md
- **Size formula**:  An expression that specifies the radius of the
dot that will be drawn at the new location of the walker (after
executing the current step). The sign of the radius is ignored, but
a zero radius will result in no dot being drawn.

Besides the previous variables, this formula can additionally depend on:

{! Chaos.ts extract:
    start: 'const formulaSymbols ='
    stop: ']'
    replace: [['(\w).,\s//(.*)', '`\1` \2\n\n']]
!}

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
- **Color formula**: An expression that determines the color of the
dot that will be drawn at the new location of the current walker, after
it takes its step. Variables are as for the Size Formula. For details on
how formulas may create and manipulate colors, see the
[Chroma documentation](../shared/Chroma.md).
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
    // Currently broken here and in Turtle
    colorChooser: {
        default: '#c98787',
        type: ParamType.COLOR,
        displayName: 'Color chooser:',
        required: true,
        description: 'Inserts choice into the Color formula.',
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
- **Dots to draw per frame**:  How fast the visualization fills in the dots.
     **/

    pixelsPerFrame: {
        default: 30,
        type: ParamType.NUMBER,
        displayName: 'Dots to draw per frame',
        required: false,
        description: '(more = faster).',
        validate(p: number, status: ValidationStatus) {
            if (p < 1) status.addError('must be at least 1')
            if (p > 1000)
                status.addWarning('a large number may affect performance')
        },
    },

    /** md
- **Fade rate**:  How fast old dots fade away, as a number between
0 and 1, with 0 corresponding to no fade and 1 to all older dots
disappearing every frame. This effect is reset whenever you move or
zoom the canvas. Warning: a large value can create a stroboscopic effect.
     **/

    fadeEffect: {
        default: 0,
        type: ParamType.NUMBER,
        displayName: 'Fade rate',
        required: false,
        description:
            'A number between 0 and 1; larger -> faster fade. Warning: '
            + 'a large value can create a stroboscopic effect.',
        validate(p: number, status: ValidationStatus) {
            if (p < 0) status.addError('must be at least 0')
            if (p > 1) status.addError('must be at most 1')
        },
    },

    /** md
- **Show corner labels**:  If checked, labels the corners of the polygon.
     **/

    showLabels: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Show corner labels?',
        required: false,
    },
} satisfies GenericParamDescription

/** md

## Controls

You may click and drag to pan the view, and use the scroll wheel to zoom
in and out.
 **/

// How many dots to gather into a reusable Geometry object
// Might need tuning
const CHUNK_SIZE = 256

class Chaos extends P5GLVisualizer(paramDesc) {
    static category = 'Chaos'
    static description =
        'Terms of the sequence attract a walker to a corner of the polygon'

    // sides of "circle" to draw for the dot
    // more = laggier but prettier
    private sides: number = 6
    // current state variables (used in setup and draw)
    private cornersList: p5.Vector[] = [] // locations of polygon corners
    private radius = 0 // of polygon
    private labelOutset = 1.1 // text offset outward
    private fontsLoaded = false
    private labelsDrawn = false

    private whichWalker = markRaw([0])
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
            // clockwise starting from noon
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
        // should then redraw, i.e. background
        this.refresh()
    }

    // reset the computed dots (arrays)
    // lose all the old data
    refresh() {
        this.chunks = markRaw([])
        const firstSize = 1
        const firstColor = this.sketch.color(this.bgColor)
        this.whichWalker = markRaw([this.walkers])
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
        this.cursor = 0
        // prepare canvas with polygon labels
        this.sketch.background(this.bgColor)
        this.labelsDrawn = false
    }

    drawLabels() {
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

        this.labelsDrawn = true
    }

    // Draws the dots between start and end INCLUSIVE
    drawVertices(start: number, end: number) {
        const sketch = this.sketch
        const bigStart = BigInt(start)

        for (let currWalker = 0; currWalker < this.walkers; currWalker++) {
            const indices = this.dotsIndices[currWalker]
            // for each walker we look in dotsIndices
            // to check if we are between
            // start and end; this could be empty
            const startArrayIndex = indices.findIndex(n => n >= bigStart)
            if (startArrayIndex < 0) continue // walker still since start

            for (
                // avoid i=0, dummy position
                let i = math.max(1, startArrayIndex);
                i < indices.length && indices[i] <= end;
                i++
            ) {
                const pos = this.dots[currWalker][i]
                sketch.fill(this.dotsColors[currWalker][i])
                const size = this.dotsSizes[currWalker][i]
                this.polygon(pos.x, pos.y, size)
            }
        }
    }
    // from p5.js docs examples
    polygon(x: number, y: number, radius: number) {
        if (Math.abs(radius) < 0.001) return
        const angle = this.sketch.TWO_PI / this.sides
        this.sketch.beginShape()
        for (let a = 0; a < this.sketch.TWO_PI; a += angle) {
            const sx = x + this.sketch.cos(a) * radius
            const sy = y + this.sketch.sin(a) * radius
            this.sketch.vertex(sx, sy)
        }
        this.sketch.endShape(this.sketch.CLOSE)
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
        // p5 is doing something terrible right here
        // its terribleness is proportional to the
        // size of the stored dot data
        // sometimes image degrades during this pause
        if (this.handleDrags()) this.cursor = 0
        const sketch = this.sketch
        if (this.cursor === 0) this.redraw()

        // fade if desired
        if (this.fadeEffect > 0) {
            const bg = sketch.color(this.bgColor)
            bg.setAlpha(255 * this.fadeEffect)
            const {width, height} = sketch
            sketch.fill(bg).rect(-width / 2, -height / 2, width, height)
            this.labelsDrawn = false
        }

        if (this.showLabels && !this.labelsDrawn && this.fontsLoaded) {
            this.drawLabels()
        }

        // how much data have we got?
        let currentLength = this.currentLength()

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
            targetCursor = Math.min(
                currentLength + this.pixelsPerFrame,
                this.maxLength
            )
        }

        // extend (compute dots) if needed
        if (targetCursor > currentLength) {
            this.extendVertices(sketch.frameCount, targetCursor)
        }
        currentLength = this.currentLength()

        // Now draw dots from cursor to target

        // First see if we can use any chunks
        // How many chunks in what's already drawn
        const fullChunksDrawn = Math.floor(this.cursor / CHUNK_SIZE)
        // How many chunks are stored between cursor and target
        const chunkLimit = math.min(
            this.chunks.length,
            Math.floor(targetCursor / CHUNK_SIZE)
        )
        let drewSome = false
        // draw available chunks not yet drawn
        for (let chunk = fullChunksDrawn; chunk < chunkLimit; ++chunk) {
            sketch.model(this.chunks[chunk])
            drewSome = true
        }
        if (drewSome) this.cursor = chunkLimit * CHUNK_SIZE

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
                let chunk = this.chunks.length;
                chunk < fullChunks;
                chunk++
            ) {
                // @ts-expect-error  The @types/p5 package omitted this function
                sketch.beginGeometry()
                this.drawVertices(
                    chunk * CHUNK_SIZE,
                    (chunk + 1) * CHUNK_SIZE
                )
                // @ts-expect-error  Ditto :-(
                this.chunks.push(sketch.endGeometry())
            }
            this.cursor = 0
        }

        // stop the draw() loop if there's nothing left to do
        if (
            !sketch.mouseIsPressed
            && currentLength >= this.maxLength // computed it all
            && targetCursor >= this.maxLength // drew it all
            && !this.pathFailure
        ) {
            // we have drawn it all, now we can pan & zoom
            // without doing a slow redraw
            // so we increase pixelsPerFrame
            this.pixelsPerFrame = this.maxLength
            //           this.cursor = 0
            this.stop()
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
            const stepSerial = Number(i - this.seq.first + 1n)
            const lastWalker = this.whichWalker[stepSerial - 1]

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
            const inputWalker: Record<
                (typeof formulaSymbolsWalker)[number],
                ScopeValue
            > = {
                n: Number(i),
                a: Number(currElement),
                k: stepSerial,
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                p: this.corners,
                w: lastWalker,
                h: this.walkers,
                f: currentFrames,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
            }

            // which walker do we move
            let currWalker = 0
            // gives bad data on bigints
            currWalker = math.floor(
                math.safeNumber(
                    this.walkerFormula.computeWithStatus(
                        this.statusOf.walkerFormula,
                        inputWalker
                    )
                ) ?? -1 // invalid
            )
            this.whichWalker[stepSerial] = currWalker
            if (this.statusOf.walkerFormula.invalid()) return
            if (currWalker < 0 || currWalker >= this.walkers) {
                this.statusOf.walkerFormula.warnings.length = 0
                this.statusOf.walkerFormula.addWarning(
                    'some walkerFormula values not in walker range'
                )
                currWalker = -1 // invalid
            }
            if (currWalker == -1) {
                continue
            }

            // look up last position of this walker
            const currlen = this.dots[currWalker].length - 1
            const position = this.dots[currWalker][currlen].copy()
            const lastCorner = this.dotsCorners[currWalker][currlen]

            // variables you can use in corner formula
            const inputCorner = {
                ...inputWalker,
                W: currWalker,
                c: lastCorner,
                x: position.x,
                y: position.y,
            }

            // what corner should I head for?
            let myCorner = 0
            myCorner =
                math.safeNumber(
                    this.cornerFormula.computeWithStatus(
                        this.statusOf.cornerFormula,
                        inputCorner
                    )
                ) ?? -1 // invalid
            if (this.statusOf.cornerFormula.invalid()) return
            if (myCorner < 0 || myCorner >= this.corners) {
                this.statusOf.cornerFormula.warnings.length = 0
                this.statusOf.cornerFormula.addWarning(
                    'some cornerFormula values not in corner range'
                )
                myCorner = -1 // invalid
            }
            if (myCorner == -1) {
                continue
            }

            // variables you can use in step formula
            const inputStep = {
                ...inputCorner,
                C: myCorner,
            }
            // determine new stepsize
            let step = 0
            step =
                math.safeNumber(
                    this.stepFormula.computeWithStatus(
                        this.statusOf.stepFormula,
                        inputStep
                    )
                ) ?? 0
            if (this.statusOf.stepFormula.invalid()) return
            // determine new position
            const myCornerPosition = this.cornersList[myCorner]
            position.lerp(myCornerPosition, step)

            const input = {
                ...inputStep,
                X: position.x,
                Y: position.y,
            }

            // determine new color
            const clr =
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

            // push everything if valid
            this.dots[currWalker].push(position.copy())
            this.dotsSizes[currWalker].push(math.safeNumber(circSize))
            this.dotsIndices[currWalker].push(i)
            this.dotsCorners[currWalker].push(myCorner)
            this.dotsColors[currWalker].push(
                this.sketch.color(chroma(clr.toString()).hex())
            )
        }
    }
}

export const exportModule = new VisualizerExportModule(Chaos)
