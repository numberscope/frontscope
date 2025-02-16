import p5 from 'p5'
import {markRaw} from 'vue'

import {INVALID_COLOR} from './P5Visualizer'
import {P5GLVisualizer} from './P5GLVisualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {math, MathFormula, CachingError} from '@/shared/math'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Chaos Visualizer

[<img
  src="../../assets/img/Turtle/turtle-waitforit.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Turtle/turtle-waitforit.png)

This visualizer interprets the sequence entries as instructions for walkers
traversing the region bounded by the vertices of a regular _n_-gon, and displays
the locations that the walkers visit.

More precisely, the walker begins in the centre of the polygon.  As it reads
each sequence entry a_k, it interprets that sequence entry as a polygon corner
(typically by taking it modulo n), and walks a proportion of the distance from
its current location to the corner (typically halfway).  Then it paits a dot
in its current location, and repeats.

When this process is performed with a random sequence, this is called the
`chaos game.'  The chaos game on a square produces a uniformly coloured
square, but on other shapes it produces fractal images.  For example, on
a triangle, one obtains the Sierpinsky gasket.

For non-random sequences, the distribution of dots picks up information
about local correlations and overall distribution.
**/

const formulaSymbols = [
    'n',
    'a',
    'A',
    's',
    'm',
    'M',
    'f',
    'c',
    'C',
    'w',
    'x',
    'y',
] as const

const paramDesc = {
    /** md
- **Corners**: the number of corners on the polygon
    **/
    corners: {
        default: 4,
        type: ParamType.INTEGER,
        displayName: 'Number of corners',
        required: true,
        description:
            'The number of vertices of the polygon; this value is also '
            + 'used as a modulus applied to the entries.',
        validate(c: number, status: ValidationStatus) {
            if (c < 2) status.addError('must be at least 2')
        },
    },
    /** md
- **Fraction**: the fraction of a step to take (default 1/2)
    **/
    frac: {
        default: 0.5,
        type: ParamType.NUMBER,
        displayName: 'Fraction to walk',
        required: false,
        description:
            'What fraction of the way each step takes you toward the '
            + 'vertex specified by the entry.',
        validate(f: number, status: ValidationStatus) {
            if (f < 0 || f > 1) {
                status.addError('must be between 0 and 1, inclusive')
            }
        },
    },
    /** md
- **Walkers**: the number of separate walkers
    **/
    walkers: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Number of walkers',
        required: false,
        description:
            'The number w of walkers. The sequence will be broken into '
            + 'subsequences based on the residue mod w '
            + 'of the index, each with a separate walker.',
        validate(w: number, status: ValidationStatus) {
            if (w < 1) status.addError('must be at least 1')
        },
    },
    /** md
- **Background color**: The color of the visualizer canvas.
     **/
    bgColor: {
        default: '#111111',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },
    /** md
- **Color formula**: an expression to compute the color of each dot

  `n` The index of the entry in the sequence being visualized.

  `a` The value of the entry.

  `s` The serial number of the step starting from one for the first dot.

  `m` The minimum index of the sequence being visualized. Note that the
  above definitions mean that `n`, `s`, and `m` are related by `n = m + s - 1`.

  `M` The Maximum index of the sequence being visualized. Note this value
  may be Infinity for sequences that are defined and can be calculated in
  principle for any index.

  `f` The frame number of this drawing pass. If you use this variable, the
  visualization will be redrawn from the beginning on every frame,
  animating the shape of the path.

  'c' The corner we just stepped toward.

  'C' The corner are about to step toward.

  'w' The walker.

  `x` The x-coordinate of the dot.

  `y` The y-coordinate of the dot.

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
    //    colorChooser: {
    //       default: '#00d0d0',
    //       type: ParamType.COLOR,
    //       displayName: 'Color chooser:',
    //       required: true,
    //       description:
    //           'Inserts choice into the Color formula, replacing current '
    //           + 'selection therein, if any.',
    //       updateAction: function (newColor: string) {
    //           const chaos = this instanceof Chaos ? this : null
    //           if (chaos === null) return
    //       const cfIn = document.querySelector('.param-field #colorFormula')
    //           if (!(cfIn instanceof HTMLInputElement)) return
    //           const cf = chaos.tentativeValues.colorFormula
    //           const start = cfIn.selectionStart ?? cf.length
    //           const end = cfIn.selectionEnd ?? start
    //           chaos.tentativeValues.colorFormula =
    //               cf.substr(0, start) + newColor + cf.substr(end)
    //       },
    //   },
    circSize: {
        default: 1,
        type: ParamType.NUMBER,
        displayName: 'Size (pixels)',
        required: false,
        validate(cs: number, status: ValidationStatus) {
            if (cs <= 0) status.addError('must be positive')
        },
    },
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
    showLabels: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Label corners of polygon?',
        required: false,
    },
} satisfies GenericParamDescription

// other ideas:  previous parts of the sequence fade over time,
// or shrink over time;
// circles fade to the outside

const formulaParamNames = ['colorFormula'] as const
const ruleParams = {
    strokeColor: 'colorFormula',
} as const

type FormulaParam = (typeof formulaParamNames)[number]
type RuleParam = keyof typeof ruleParams
function checkRule(r: string): r is RuleParam {
    return r in ruleParams
}
// the cast below is necessary b/c TypeScript doesn't type Object.fromEntries
// tightly (#?!@!)
const formulaRules = Object.fromEntries(
    formulaParamNames.map(
        (fmla: FormulaParam): [FormulaParam, RuleParam[]] => [fmla, []]
    )
) as Record<FormulaParam, RuleParam[]>
for (const [rule, fmla] of Object.entries(ruleParams)) {
    if (checkRule(rule)) formulaRules[fmla].push(rule)
}
// How many segments to gather into a reusable Geometry object
// Might need tuning
const CHUNK_SIZE = 1000

class Chaos extends P5GLVisualizer(paramDesc) {
    static category = 'Chaos'
    static description = 'Chaos game played using a sequence to select moves'

    // current state variables (used in setup and draw)
    private myIndex = 0n
    private cornersList: p5.Vector[] = []
    private walkerPositions: p5.Vector[] = [] // current positions
    private radius = 0
    private labelOutset = 1.1 // text offset outward

    // variables recording the path

    // this.vertices consists of walkers number of arrays, i.e.
    // it is an array of arrays
    // similar for the data (sizes, colors)
    private vertices = markRaw([[new p5.Vector()]]) as p5.Vector[][]
    private verticesSizes = markRaw([[1]]) as number[][]
    private verticesColors = markRaw([[INVALID_COLOR]]) as p5.Color[][]
    private chunks: p5.Geometry[] = markRaw([]) // "frozen" chunks of path
    private cursor = 0 // vertices up to this one have already been drawn

    private firstIndex = 0n // first term
    private maxLength = Number.MAX_SAFE_INTEGER // limit # of vertices
    private growth = 10 // new vertices per frame

    private pathFailure = false

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

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

        this.firstIndex = this.seq.first

        // reduce maxLength based on sequence
        if (this.seq.length < this.maxLength) {
            this.maxLength = Number(this.seq.length)
        }

        // size of polygon
        this.radius = math.min(this.sketch.height, this.sketch.width) * 0.4

        // text appearance control
        //        const shrink = Math.log(this.corners)
        // Shrink the numbers appropriately (up to about 100 corners or so):
        //        const textSize = (this.sketch.width * 0.04) / shrink

        this.myIndex = this.seq.first

        // Set up the windows and return the coordinates of the corners
        this.cornersList = this.chaosWindow(this.radius)

        // Set frame rate
        this.sketch.frameRate(10)

        // canvas clear/background
        this.sketch.clear(0, 0, 0, 0)
        this.sketch.background(this.bgColor)

        // Draw corner labels if desired
        if (this.showLabels) {
            this.drawLabels()
        }

        // no stroke (in particular, no outline on circles)
        this.sketch.strokeWeight(0)

        this.refresh()
    }

    refresh() {
        // reset the arrays.
        const firstSize = 1
        const firstColor = this.sketch.color(this.bgColor)
        this.vertices = markRaw([[new p5.Vector()]])
        this.verticesSizes = markRaw([[firstSize]])
        this.verticesColors = markRaw([[firstColor]])
        for (let currWalker = 1; currWalker < this.walkers; currWalker++) {
            this.vertices.push([new p5.Vector()])
            this.verticesSizes.push([this.circSize])
            this.verticesColors.push([this.sketch.color(this.bgColor)])
        }
        this.redraw()
    }

    redraw() {
        // blanks the screen and sets up to redraw the path
        this.cursor = 0
        // prepare sketch
        this.sketch.background(this.bgColor).noStroke().frameRate(30)
    }

    drawLabels() {
        // No stroke right now, but could be added
        const textStroke = this.sketch.width * 0

        this.sketch.stroke('white').fill('white').strokeWeight(textStroke)
        //.textSize(textSize)
        //.textAlign(this.sketch.CENTER, this.sketch.CENTER)
        // Get appropriate locations for the labels
        // const cornersLabels
        // = this.chaosWindow(this.radius * this.labelOutset)
        for (let c = 0; c < this.corners; c++) {
            //const label = cornersLabels[c]
            //this.sketch.text(String(c), label.x, label.y)
        }
    }

    // Draws the vertices between start and end INCLUSIVE
    drawVertices(start: number, end: number) {
        const sketch = this.sketch
        for (let currWalker = 0; currWalker < this.walkers; currWalker++) {
            let lastPos = this.vertices[currWalker][start]
            for (let i = start + 1; i <= end; ++i) {
                const pos = this.vertices[currWalker][i]
                if (pos.x !== lastPos.x || pos.y !== lastPos.y) {
                    sketch.fill(this.verticesColors[currWalker][i])
                    sketch.push()
                    sketch.translate(lastPos.x, lastPos.y)
                    sketch.circle(0, 0, this.verticesSizes[currWalker][i])
                    sketch.pop()
                }
                lastPos = pos
            }
        }
    }

    mouseWheel(event: WheelEvent) {
        super.mouseWheel(event)
        this.cursor = 0 // make sure we redraw
    }

    draw() {
        if (this.handleDrags()) this.cursor = 0
        const sketch = this.sketch
        if (this.cursor === 0) this.redraw()

        // compute more vertices (if needed):
        // the length of the arrays inside this.vertices should
        // always be in synch so we sample one
        let targetLength = Math.min(
            this.vertices[0].length - 1 + this.pixelsPerFrame,
            this.maxLength
        )
        if (targetLength - this.vertices[0].length <= this.walkers) {
            targetLength = this.vertices[0].length
        }

        // extend if needed
        if (targetLength > this.vertices[0].length) {
            this.extendVertices(sketch.frameCount, targetLength)
        }

        // draw vertices from cursor to end of this.vertices[walker]:
        const newCursor = this.vertices[0].length - 1
        // First see if we can use any chunks:
        const fullChunksIn = Math.floor(this.cursor / CHUNK_SIZE)
        let drewSome = false
        for (let chunk = fullChunksIn; chunk < this.chunks.length; ++chunk) {
            sketch.model(this.chunks[chunk])
            drewSome = true
        }
        if (drewSome) this.cursor = this.chunks.length * CHUNK_SIZE
        if (this.cursor < newCursor) {
            this.drawVertices(this.cursor, newCursor)
            this.cursor = newCursor
        }

        // See if we can create a new chunk:
        const fullChunks = Math.floor(this.cursor / CHUNK_SIZE)
        if (fullChunks > this.chunks.length) {
            // @ts-expect-error  The @types/p5 package omitted this function
            sketch.beginGeometry()
            this.drawVertices(
                (fullChunks - 1) * CHUNK_SIZE,
                fullChunks * CHUNK_SIZE
            )
            // @ts-expect-error  Ditto :-(
            this.chunks.push(sketch.endGeometry())
        }

        // stop drawing if done
        if (
            !sketch.mouseIsPressed
            && this.vertices[0].length
                > math.floor(this.maxLength / this.walkers)
            && !this.pathFailure
        ) {
            this.stop()
        }
    }

    // This should be run each time more vertices are needed.
    // Resulting list of vertices have targetLength vertices
    // meaning that vertices.length = that + 1
    extendVertices(currentFrames: number, targetLength: number) {
        // Now compute the new vertices:
        this.pathFailure = false

        // this should always be in synch
        const len = this.vertices[0].length - 1
        // start index is the current position
        const startIndex = this.firstIndex + BigInt(len)
        // can change if cache error
        // end index is how much more of the sequence to take
        // divided by walkers
        let endIndex = this.firstIndex + BigInt(targetLength)
        const remainder = math.modulo(endIndex - startIndex, this.walkers)
        endIndex = endIndex - remainder

        let currWalker = -1
        let currElement = 0n
        for (let i = startIndex; i < endIndex; i++) {
            // increment walker with each new index
            currWalker += 1
            if (currWalker >= this.walkers) currWalker = 0
            // get the current sequence element and infer
            // the rotation/step
            let lastElement = 0n
            if (i > startIndex) {
                lastElement = currElement
            }
            const currlen = this.vertices[currWalker].length - 1
            const position = this.vertices[currWalker][currlen].copy()
            try {
                currElement = this.seq.getElement(i)
            } catch (e) {
                this.pathFailure = true
                if (e instanceof CachingError) {
                    console.log('CACHE', e)
                    // didn't make it to next currWalker == 0
                    // so pop the partial work
                    for (let j = currWalker; j >= 0; j--) {
                        this.vertices[j].pop()
                        this.verticesSizes[j].pop()
                        this.verticesColors[j].pop()
                    }
                    return // need to wait for more elements
                } else {
                    // don't know what to do with this
                    console.log(e) //throw e
                }
            }
            const myCorner = Number(math.modulo(currElement, this.corners))
            const lastCorner = Number(math.modulo(lastElement, this.corners))

            const input = {
                n: Number(i),
                a: Number(currElement),
                s: Number(i - this.seq.first + 1n),
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                f: currentFrames,
                c: lastCorner,
                C: myCorner,
                w: currWalker,
                x: position.x,
                y: position.y,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
            }
            let clr: unknown = null

            // push vertex
            // check its modulus to see which corner to walk toward
            // (Safe to convert to number since this.corners is "small")
            const myCornerPosition = this.cornersList[myCorner]
            position.lerp(myCornerPosition, this.frac)
            this.vertices[currWalker].push(position.copy())

            // push size of the vertex
            this.verticesSizes[currWalker].push(
                math.safeNumber(this.circSize)
            )
            // determine color of dot
            clr =
                this.colorFormula.computeWithStatus(
                    this.statusOf.colorFormula,
                    input
                ) ?? 0
            if (this.statusOf.colorFormula.invalid()) return

            // push color of the vertex
            if (typeof clr === 'string') {
                this.verticesColors[currWalker].push(this.sketch.color(clr))
            } else if (math.isChroma(clr)) {
                this.verticesColors[currWalker].push(
                    this.sketch.color(clr.hex())
                )
            } else
                this.verticesColors[currWalker].push(
                    this.sketch.color('white')
                )
        }
    }
}

export const exportModule = new VisualizerExportModule(Chaos)
