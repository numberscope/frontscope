import p5 from 'p5'
import {markRaw} from 'vue'

import {INVALID_COLOR} from './P5Visualizer'
import {P5GLVisualizer} from './P5GLVisualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'

import {CachingError} from '@/sequences/Cached'
import {MathFormula} from '@/shared/math'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Turtle Visualizer

[<img
  src="../../assets/img/Turtle/turtle-waitforit.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Turtle/turtle-waitforit.png)

This visualizer interprets a sequence as instructions for a drawing machine,
often known as a "turtle" after a simple drawing robot built in the 1960s.
For some domain of possible values, each entry in the sequence determines
a turn angle and step length.  The visualizer displays the resulting polygonal
path.

There are two ways to animate the resulting path:

1.  By setting the speed parameter to be positive, you can watch the path
being drawn some number of steps per frame, as long as more terms of the
sequence are available.

2.  By setting non-zero values for the fold and stretch parameters in the
animation section, the user can set the turn angles and/or step lengths to
gradually increase or decrease over time, resulting in a visual effect
reminiscent of protein folding. In this mode, the same fixed number of steps
of the path are re-drawn in every frame.

## Parameters
**/

enum RuleMode {
    List,
    Formula,
}

const paramDesc = {
    /** md
- Domain: a list of numbers.  These are the values that
that the turtle should pay attention to when appearing as
entries of the sequence.  Values of the sequence
not occurring in this list will be skipped.
(One way to ensure a small number of possible values is to use a
sequence that has been reduced with respect to some small modulus. But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: [0n, 1n, 2n],
        type: ParamType.BIGINT_ARRAY,
        displayName: 'Domain',
        required: true,
        description:
            'Sequence values to interpret as rules; entries not '
            + 'matching any value here are skipped.',
        hideDescription: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
        validate: function (dom: bigint[], status: ValidationStatus) {
            const seen = new Set()
            for (const element of dom) {
                if (seen.has(element)) {
                    status.addError(
                        `elements may only occur once (${element} `
                            + 'is repeated.'
                    )
                    return
                }
                seen.add(element)
            }
        },
    },
    /** md

The following set of parameters give the instructions for the turtle's path
(and how it changes from frame to frame). Each one can be a single number, in
which case it is used for every element of the domain. Or it can be a list of
numbers the same length as the domain, in which case the numbers correspond in
order: the first number is used when an entry is equal to the first value in
the domain, the second number is used for entries equal to the second value,
and so on. For example, if the "Step length(s)" parameter below is "10",
then a segment 10 pixels long will be drawn for every sequence entry in the
domain, whereas if the domain is "0 1 2" and "Step length(s)" is "20 10 0",
then the turtle will move 20 pixels each time it sees a sequence entry of 0,
10 pixels for each 1, and it won't draw anything when an entry is equal to 2
(but it might turn).

- Turn angle(s): Specifies (in degrees) how much the turtle should turn for
each sequence entry in the domain. Positive values turn counterclockwise,
and negative values clockwise.
     **/
    turns: {
        default: [30, 45, 60],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Turn angle(s)',
        required: true,
        description:
            'An angle (in degrees) or a list of angles, in order '
            + 'corresponding to the sequence values listed in Domain.',
        hideDescription: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
    },
    /** md
- Step length(s): Specifies (in pixels) how far the turtle should move (and
draw a line segment as it goes) for each sequence entry in the domain. Note
negative values (for moving backward) are allowed.
     **/
    steps: {
        default: [20],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Step length(s)',
        required: true,
        description:
            'A length (in pixels), or a list of lengths, in order '
            + 'corresponding to the sequence values listed in Domain.',
        hideDescription: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
    },
    /**
- animationControls: boolean. If true, show folding controls
    **/
    animationControls: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Animation ↴',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
    },
    /** md
- Fold rate(s): Specifies (in units of 0.00001 degree) how each turn angle
changes from one frame to the next. For example, if there is just one entry
of "5" here, then in each frame of the animation, the turn angle for every
element of the domain will increase by 0.00005 degree. Similarly, if the
domain is "0 1" and this list is "200 -100" then in each frame the turn angle
for 0 entries will increase by 0.002 degrees, and the turn angle for 1 entries
will decrease by 0.001 degree. These increments might seem small, but with
so many turns in a turtle path, a little goes a long way.
     **/
    folds: {
        default: [0],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Folding rate(s)',
        required: false,
        description:
            'An angle increment (in units of 0.00001 degree), or list of '
            + 'angle increments in order corresponding to the sequence '
            + 'values listed in Domain. If any are nonzero, the path will '
            + 'animate, adding the increment(s) to the turn angle(s) before '
            + 'each frame; these additions accumulate from frame to frame. '
            + 'Produces a visual effect akin to protein folding.',
        hideDescription: false,
        visibleDependency: 'animationControls',
        visibleValue: true,
    },
    /** md
- Stretch rate(s): Specifies (in units of 0.01 pixel) how each step length
changes from one frame to the next.
     **/
    stretches: {
        default: [0],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Stretch rate(s)',
        required: false,
        description:
            'A length increment (in units of 0.01 pixel), or list of length '
            + 'increments in order corresponding to the sequence values '
            + 'listed in Domain. Similarly to Fold rate, these increment(s) '
            + 'are added to the step length(s) each frame.',
        hideDescription: false,
        visibleDependency: 'animationControls',
        visibleValue: true,
    },
    /** md
- Stroke width(s): Gives the width of the segment drawn for each entry,
  in pixels.
    **/
    widths: {
        default: [1],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Stroke width(s)',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        validate: function (widths: number[], status: ValidationStatus) {
            if (widths.some(n => n <= 0)) status.addError('must be positive')
        },
        level: 0,
    },
    /** md
- Stroke color(s): One or more strings specifying colors, separated by
  spaces or commas. These colors correspond to the elements in the domain
  just as all of the above parameters do. Each one may either be a CSS color
  name (e.g., 'teal' or 'khaki'), or a standard hex color string (e.g.
  '#88aa3c').
    **/
    strokeColor: {
        default: '#c98787',
        type: ParamType.STRING,
        displayName: 'Stroke color(s)',
        required: true,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
    },
    /** md

(Note that as an advanced convenience feature, useful mainly when the domain is
large, you may specify fewer entries in any of the above lists than there are
elements in the domain, and the last one will be re-used as many times as
necessary. Using this feature will display a warning, in case you inadvertently
left out a value.)

- Color chooser: This color picker does not directly control the display.
  Instead, whenever you select a color with it, the corresponding color
  string is inserted in the Stroke color parameter box.
    **/
    colorChooser: {
        default: '#00d0d0',
        type: ParamType.COLOR,
        displayName: 'Color chooser:',
        required: true,
        description: 'Inserts choice into the stroke color.',
    },
    /** md
- Background color: The color of the visualizer canvas.
     **/
    bgColor: {
        default: '#6b1a1a',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },
    /** md
- Turtle speed: a number.  If zero (or if any of the fold or stretch rates
are nonzero), the full path is drawn all at once. Otherwise, the path drawing
will be animated, and the Turtle speed specifies the number of steps of the
path to draw per frame. The drawing continues as long as there are additional
entries of the sequence to display. The Turtle visualizer has a brake on it
to prevent lag: this speed cannot exceed 1000 steps per frame.
     **/
    speed: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Turtle speed',
        required: false,
        description: 'Steps added per frame.',
        hideDescription: false,
        validate: function (n: number, status: ValidationStatus) {
            if (n < 0) status.addError('must non-negative')
            if (n > 1000) status.addError('the speed is capped at 1000')
        },
    },
    /** md
- Rule mode: You may select "List" or "Formula". Generally speaking, the
  parameters above are used to control the Turtle visualization when this
  Rule mode parameter has its default value of "List". The parameters below
  are used when the Rule mode is "Formula". (Note that Background color
  and Turtle speed are used in either case.) Broadly, in Formula mode,
  you can enter expressions that calculate the different aspects of each
  segment of the turtle's path (turn angle, length, color, etc.) directly
  from the sequence entries. In each of these formulas, you may use the
  following variables, the values of which will be filled in for you:

  `n` The index of the entry in the sequence being visualized.

  `a` The value of the entry.

  `f` The frame number of this drawing pass. If you use this variable, the
  visualization will be redrawn from the beginning on every frame,
  animating the shape of the path.

  `h` The current heading of the turtle, in degrees counterclockwise from its
  initial heading.

  `x` The current x-coordinate of the turtle.

  `y` The current y-coordinate of the turtle.
     **/
    ruleMode: {
        default: RuleMode.List,
        type: ParamType.ENUM,
        from: RuleMode,
        displayName: 'Rule mode',
        required: true,
    },
    /** md
- Turn formula: an expression to compute the turn angle in degrees for a
  given step of the turtle's path.
    **/
    turnFormula: {
        default: new MathFormula('30+15a', ['n', 'a']),
        type: ParamType.FORMULA,
        inputs: ['n', 'a', 'f', 'h', 'x', 'y'],
        displayName: 'Turn formula',
        description:
            'Computes how many degrees to turn counterclockwise '
            + 'before each turtle step.',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
    /** md
- Step formula: an expression to compute the pixel length of each step of the
  turtle's path.
    **/
    stepFormula: {
        default: new MathFormula('20'),
        type: ParamType.FORMULA,
        inputs: ['n', 'a', 'f', 'h', 'x', 'y'],
        displayName: 'Step formula',
        description: 'Computes the pixel length of each turtle step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
    /** md
- Width formula: an expression to compute the pixel width of each step of the
  turtle's path.
    **/
    widthFormula: {
        default: new MathFormula('1'),
        type: ParamType.FORMULA,
        inputs: ['n', 'a', 'f', 'h', 'x', 'y'],
        displayName: 'Width formula',
        description: 'Computes the pixel width of each turtle step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
    /** md
- Color formula: an expression to compute the color of each step of the
  turtle's path.
    **/
    colorFormula: {
        default: new MathFormula('#c98787'),
        type: ParamType.FORMULA,
        inputs: ['n', 'a', 'f', 'h', 'x', 'y'],
        displayName: 'Color formula',
        description: 'Computes the color of each turtle step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
} satisfies GenericParamDescription

const ruleParamNames = [
    'turns',
    'steps',
    'folds',
    'stretches',
    'widths',
    'strokeColor',
] as const

type RuleParam = (typeof ruleParamNames)[number]
type RuleParamInternal = `${RuleParam}Internal`

const ruleParamInternal = Object.fromEntries(
    ruleParamNames.map(name => [name, `${name}Internal`])
) as Record<RuleParam, RuleParamInternal>

// How many segments to gather into a reusable Geometry object
// Might need tuning
const CHUNK_SIZE = 1000

class Turtle extends P5GLVisualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // maps from domain to rotations and steps etc
    private rotMap = markRaw(new Map<string, number>())
    private stepMap = markRaw(new Map<string, number>())
    private foldMap = markRaw(new Map<string, number>())
    private stretchMap = markRaw(new Map<string, number>())
    private widthMap = markRaw(new Map<string, number>())
    private colorMap = markRaw(new Map<string, p5.Color>())

    // private copies of rule arrays
    private turnsInternal: number[] = []
    private stepsInternal: number[] = []
    private foldsInternal: number[] = []
    private stretchesInternal: number[] = []
    private widthsInternal: number[] = []
    private strokeColorInternal: string[] = []

    // variables recording the path
    private vertices = markRaw([new p5.Vector()]) // nodes of path
    private pathWidths = markRaw([1])
    private pathLengths = markRaw([0])
    private pathTurns = markRaw([0])
    private pathBearings = markRaw([0])
    private pathColors = markRaw([INVALID_COLOR])
    private chunks: p5.Geometry[] = markRaw([]) // "frozen" chunks of path
    private bearing = 0 // heading at tip of path
    private cursor = 0 // vertices up to this one have already been drawn

    // variables holding the parameter values
    // these don't change except in setup()
    private firstIndex = 0n // first term
    private animating = false // whether there's any fold/stretch
    private growth = 0 // growth of path per frame
    private maxLength = -1 // longest we will allow path to get

    // controlling the folding smoothness/speed/units
    // the units of the folding entry field are 1/denom degrees
    private foldDenom = 100000 // larger = more precision/slower
    private stretchDenom = 100 // larger = more precision/slower

    // throttling (max step lengths for animating)
    private throttleWarn = 5000
    private throttleLimit = 15000

    // handling slow caching & mouse
    private pathFailure = false
    private mouseCount = 0

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // lengths of rulesets should match length of domain
        for (const rule of ruleParamNames) {
            let ruleList: string | (string | number)[] = params[rule]
            if (rule === 'strokeColor' && typeof ruleList === 'string') {
                ruleList = ruleList.split(/[\s,]+/)
            }
            const entries = ruleList.length
            if (entries > 1 && entries < params.domain.length) {
                this.statusOf[rule].addWarning(
                    `fewer entries than the ${params.domain.length}-element `
                        + 'Domain; reusing last entry '
                        + `${params[rule][entries - 1]} for the remainder`
                )
            }
            if (entries > params.domain.length) {
                this.statusOf[rule].addWarning(
                    `more entries than the ${params.domain.length}-element `
                        + 'Domain; ignoring extras'
                )
            }
        }

        const animating =
            params.folds.some(value => value !== 0)
            || params.stretches.some(value => value !== 0)
        // warn when animation is turned on for long paths
        // BUG:  when sequence params change this isn't re-run
        // so the warning may be out of date
        if (
            animating
            && this.seq.length > this.throttleWarn
            && this.seq.length <= this.throttleLimit
        ) {
            // bug... why isn't this displaying?
            status.addWarning(
                `Animating with more than ${this.throttleWarn} steps is `
                    + 'likely to be quite laggy.'
            )
        }
        if (animating && this.seq.length > this.throttleLimit) {
            status.addWarning(
                `Path animation limited to the first ${this.throttleLimit} `
                    + 'entries of the sequence.'
            )
        }

        // Check that the domain seems suitable for the sequence:
        const toTest = 100n
        const threshold = 10
        if (this.seq.length >= toTest) {
            let nIn = 0
            const limit = this.seq.first + toTest
            for (let i = this.seq.first; i < limit; ++i) {
                try {
                    const val = this.seq.getElement(i)
                    if (params.domain.includes(val)) ++nIn
                } catch {
                    // bag the test
                    return status
                }
            }
            if (nIn < threshold) {
                this.statusOf.domain.addWarning(
                    `only ${nIn} of the first ${toTest} sequence entries `
                        + 'are in this list; consider adjusting'
                )
            }
        }

        return status
    }

    /**
     * Here, we implement selecting a color with the chooser inserting it into
     * the strokeColor:
     */
    async parametersChanged(nameList: string[]) {
        if (nameList.includes('colorChooser')) {
            this.strokeColor += this.colorChooser
            this.refreshParams()
            nameList.splice(nameList.indexOf('colorChooser'), 1)
            nameList.push('strokeColor')
        }
        super.parametersChanged(nameList)
    }

    storeRules() {
        const dLength = this.domain.length
        // Copy each rule parameter into the internal property, fixing its
        // length:
        for (const name of ruleParamNames) {
            let specd: string | (string | number)[] = this[name]
            if (name === 'strokeColor' && typeof specd === 'string') {
                specd = specd.split(/[\s,]+/)
            }
            const fixed: (string | number)[] = []
            for (let i = 0; i < dLength; ++i) {
                const useix = Math.min(specd.length - 1, i)
                fixed.push(specd[useix])
            }
            this[ruleParamInternal[name]] = fixed as string[] & number[]
        }

        // create map from sequence values to rotations, step lengths,
        // folds, stretches, and weights
        this.animating = false
        for (let i = 0; i < dLength; i++) {
            const key = this.domain[i].toString()
            this.rotMap.set(key, (Math.PI / 180) * this.turnsInternal[i])
            this.stepMap.set(key, this.stepsInternal[i])
            const thisFold = this.foldsInternal[i]
            if (thisFold != 0) this.animating = true
            this.foldMap.set(
                key,
                (Math.PI / 180) * (thisFold / this.foldDenom)
            )
            if (this.stretchesInternal[i] != 0) this.animating = true
            this.stretchMap.set(
                key,
                this.stretchesInternal[i] / this.stretchDenom
            )
            this.widthMap.set(key, this.widthsInternal[i])
            this.colorMap.set(
                key,
                this.sketch.color(this.strokeColorInternal[i])
            )
        }
    }

    setup() {
        super.setup()

        // create internal rule maps
        this.storeRules()

        // reset variables
        this.firstIndex = this.seq.first
        this.maxLength = this.animating
            ? this.throttleLimit
            : Number.MAX_SAFE_INTEGER
        if (this.seq.length < this.maxLength) {
            this.maxLength = Number(this.seq.length)
        }
        this.growth = this.speed
        // draw the entire path every frame if folding
        if (this.animating) this.growth = this.maxLength

        this.refresh()
    }

    refresh() {
        // eliminates the path so it will be recomputed, and redraws
        this.vertices = markRaw([new p5.Vector()]) // nodes of path
        this.pathWidths = markRaw([1])
        this.pathLengths = markRaw([0])
        this.pathTurns = markRaw([0])
        this.pathBearings = markRaw([0])
        this.pathColors = markRaw([INVALID_COLOR])
        this.chunks = markRaw([])
        this.bearing = 0
        this.redraw()
    }

    redraw() {
        // blanks the screen and sets up to redraw the path
        this.cursor = 0
        // prepare sketch
        this.sketch.background(this.bgColor).noStroke().frameRate(30)
    }

    // Draws the vertices between start and end INCLUSIVE
    drawVertices(start: number, end: number) {
        const sketch = this.sketch
        let lastPos = this.vertices[start]
        for (let i = start + 1; i <= end; ++i) {
            const pos = this.vertices[i]
            const width = this.pathWidths[i]
            const length = this.pathLengths[i]
            if (pos.x !== lastPos.x || pos.y !== lastPos.y) {
                sketch.fill(this.pathColors[i])
                sketch.push()
                sketch
                    .translate(lastPos.x, lastPos.y)
                    .rotateZ(this.pathBearings[i])
                if (length > width / 3) {
                    sketch.rect(0, -width / 2, length - width / 3, width)
                    sketch.circle(length - width / 3, 0, width)
                }
                sketch.circle(0, 0, width)
                sketch.pop()
            }
            lastPos = pos
        }
    }

    draw() {
        if (this.handleDrags()) this.cursor = 0
        const sketch = this.sketch
        if (this.animating) this.refresh()
        else if (this.cursor === 0) this.redraw()

        // compute more of path as needed:
        const targetLength = Math.min(
            this.vertices.length - 1 + this.growth,
            this.maxLength
        )
        this.extendPath(sketch.frameCount, targetLength)

        // draw path from cursor to tip:
        const newCursor = this.vertices.length - 1
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
        if (!this.animating && fullChunks > this.chunks.length) {
            // @ts-expect-error  The @types/p5 package omitted this function
            sketch.beginGeometry()
            this.drawVertices(
                (fullChunks - 1) * CHUNK_SIZE,
                fullChunks * CHUNK_SIZE
            )
            // @ts-expect-error  Ditto :-(
            this.chunks.push(sketch.endGeometry())
        }

        // stop drawing if no animation
        if (
            !this.animating
            && !sketch.mouseIsPressed
            && this.vertices.length > this.maxLength
            && !this.pathFailure
        ) {
            this.stop()
        }
    }

    // This should be run each time the path needs to be extended.
    // If folding, increment parameters by current frames.
    // Resulting path should be targetLength steps
    // meaning that vertices.length = that + 1
    extendPath(currentFrames: number, targetLength: number) {
        // First compute the rotMap and stepMap to use:
        let rotMap = this.rotMap
        if (this.animating) {
            rotMap = new Map<string, number>()
            for (const [entry, rot] of this.rotMap) {
                const extra = currentFrames * (this.foldMap.get(entry) ?? 0)
                rotMap.set(entry, rot + extra)
            }
        }
        let stepMap = this.stepMap
        if (this.animating) {
            stepMap = new Map<string, number>()
            for (const [entry, step] of this.stepMap) {
                const extra =
                    currentFrames * (this.stretchMap.get(entry) ?? 0)
                stepMap.set(entry, step + extra)
            }
        }

        // Now compute the new vertices in the path:
        this.pathFailure = false
        const len = this.vertices.length - 1
        const position = this.vertices[len].copy()
        const startIndex = this.firstIndex + BigInt(len)
        const endIndex = this.firstIndex + BigInt(targetLength)
        for (let i = startIndex; i < endIndex; i++) {
            // get the current sequence element and infer
            // the rotation/step
            let currElement = 0n
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
            const currElementString = currElement.toString()
            const turnAngle = rotMap.get(currElementString)
            let stepLength = 0
            if (turnAngle !== undefined) {
                stepLength = stepMap.get(currElementString) ?? 0
                this.bearing += turnAngle
                position.x += Math.cos(this.bearing) * stepLength
                position.y += Math.sin(this.bearing) * stepLength
            }
            this.pathWidths.push(this.widthMap.get(currElementString) ?? 1)
            this.pathLengths.push(stepLength)
            this.pathTurns.push(turnAngle ?? 0)
            this.pathBearings.push(this.bearing)
            this.pathColors.push(
                this.colorMap.get(currElementString) ?? INVALID_COLOR
            )
            this.vertices.push(position.copy())
        }
    }

    async resized(_toSize: ViewSize) {
        this.cursor = 0 // make sure we redraw
        return true // we handled it; framework need not do anything
    }

    mouseWheel(event: WheelEvent) {
        super.mouseWheel(event)
        this.cursor = 0 // make sure we redraw
    }
}

export const exportModule = new VisualizerExportModule(Turtle)
