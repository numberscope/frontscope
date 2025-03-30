import p5 from 'p5'
import {markRaw} from 'vue'

import {INVALID_COLOR} from './P5Visualizer'
import {P5GLVisualizer} from './P5GLVisualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'

import {math, MathFormula, CachingError} from '@/shared/math'
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
an angle and step length.  The visualizer displays the resulting polygonal
path.

There are two ways to animate the resulting path:

1.  By setting the speed parameter to be positive, you can watch the path
being drawn some number of steps per frame, as long as more terms of the
sequence are available.

2.  By setting non-zero values for the fold and stretch parameters in the
animation section, the user can set the angles and/or step lengths to
gradually change over time, resulting in a visual effect reminiscent of
protein folding. In this mode, the same fixed number of stepsvof the path
are re-drawn in every frame.

## Parameters
**/

enum RuleMode {
    List,
    Formula,
}

enum AngleMeaning {
    Turn,
    Bearing,
}

enum AngleUnit {
    Degrees,
    Radians,
}

const formulaSymbols = [
    'n',
    'a',
    'A',
    'k',
    'm',
    'M',
    'f',
    'b',
    'x',
    'y',
] as const
// set version
const formulaSymSet = new Set(formulaSymbols)

const paramDesc = {
    /** md
- **Domain**: a list of numbers.  These are the values that
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
        required: false,
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
which case it is used for every element of **Domain**. Or it can be a list
of numbers the same length as **Domain**, in which case the numbers correspond
in order: the first number is used when an entry is equal to the first value
in **Domain**, the second number is used for entries equal to the second value,
and so on. For example, if the **Step length(s)** parameter below is "10",
then a segment 10 pixels long will be drawn for every sequence entry in
**Domain**, whereas if **Domain** is "0 1 2" and **Step length(s)** is
"20 10 0", then the turtle will move 20 pixels each time it sees a sequence
entry of 0, 10 pixels for each 1, and it won't draw anything when an entry
is equal to 2 (but it might turn).

- **Angle(s)**: Determines the bearing angle (in degrees) for the turtle before
each step (corresponding to one sequence entry in **Domain**). Angles are
measured so that positive angles run counterclockwise, and negative clockwise.
     **/
    angles: {
        default: [30, 45, 60],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Angle(s)',
        required: false,
        description:
            'An angle (in degrees) or a list of angles, in order '
            + 'corresponding to the sequence values listed in Domain.',
        hideDescription: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
    },
    /** md
- **Angle is...**: specifies whether the angle for each step is taken directly
  as the new bearing of the turtle (counterclockwise from moving horizontally
  to the right), or as a turn (counterclockwise change in bearing) from its
  previous bearing. In either case, the turtle takes on its new bearing
  _before_ taking its next step.
    **/
    angleMeaning: {
        default: AngleMeaning.Turn,
        type: ParamType.ENUM,
        from: AngleMeaning,
        displayName: 'Angle is...',
        description:
            "'Bearing' means that the angle directly gives the turtle's "
            + "new direction; 'Turn' means the turtle turns that amount ccw.",
        required: true,
        level: 1,
    },
    /** md
- **Step length(s)**: Specifies (in pixels) how far the turtle should move (and
draw a line segment as it goes) for each sequence entry in **Domain**. Note
negative values (for moving backward) are allowed.
     **/
    steps: {
        default: [20],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Step length(s)',
        required: false,
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
- **Folding rate(s)**: Specifies (in units of 0.00001 degree) how each angle
changes from one frame to the next. For example, if there is just one entry
of "5" here, then in each frame of the animation, the angle for every
element of **Domain** will increase by 0.00005 degree. Similarly, if
**Domain** is "0 1" and this list is "200 -100" then in each frame the angle
for 0 entries will increase by 0.002 degrees, and the angle for 1 entries
will decrease by 0.001 degree. These increments might seem small, but with
so many steps in a turtle path, a little goes a long way.
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
            + 'animate, adding the increment(s) to the angle(s) in the list '
            + 'above before each frame; these additions accumulate from '
            + 'frame to frame. '
            + 'Produces a visual effect akin to protein folding.',
        hideDescription: false,
        visibleDependency: 'animationControls',
        visibleValue: true,
    },
    /** md
- **Stretch rate(s)**: Specifies (in units of 0.01 pixel) how each step length
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
- **Stroke width(s)**: Gives the width of the segment drawn for each entry,
  in pixels.
    **/
    widths: {
        default: [1],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Stroke width(s)',
        required: false,
        description:
            'A width (in pixels), or list of widths corresponding '
            + 'in order to the sequence values listed in Domain. '
            + 'The segments of the path are drawn with the corresponding '
            + 'widths.',
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        validate: function (widths: number[], status: ValidationStatus) {
            status.mandate(
                widths.every(n => n > 0),
                'must be positive'
            )
        },
        level: 0,
    },
    /** md
- **Stroke color(s)**: One or more colors, corresponding to the elements in
  **Domain** just as all of the above parameters do. You can add a color by
  clicking the `+` button, and delete a color by selecting it and pressing
  the `Delete` key.
    **/
    strokeColor: {
        default: ['#c98787'],
        type: ParamType.COLOR_ARRAY,
        displayName: 'Stroke color(s)',
        required: true,
        description:
            'A color or list of colors corresponding to the sequence values '
            + 'listed in Domain. To remove a color, click it and press '
            + 'the Delete key.',
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.List,
        level: 0,
    },
    /** md

(Note that as an advanced convenience feature, useful mainly when **Domain**
has many elements, you may specify fewer entries in any of the above lists
than there are elements in **Domain**, and the last one will be re-used
as many times as necessary. Using this feature will display a warning, in
case you inadvertently left out a value.)

- **Background color**: The color of the visualizer canvas.
     **/
    bgColor: {
        default: '#6b1a1a',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },
    /** md
- **Turtle speed**: a number.  If zero (or if any of the **Folding rate(s)**
  or **Stretch rate(s)** are nonzero), the full path is drawn all at once.
  Otherwise, the path drawing will be animated, and the **Turtle speed**
  specifiesthe number of steps of the path to draw per frame. The drawing
  continues as long as there are additional entries of the sequence to display.
  The Turtle visualizer has a brake on it to prevent lag: this speed cannot
  exceed 1000 steps per frame.
     **/
    speed: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Turtle speed',
        required: false,
        description: 'Steps added per frame.',
        hideDescription: false,
        validate: function (n: number, status: ValidationStatus) {
            status.forbid(n < 0, 'must non-negative')
            status.forbid(n > 1000, 'the speed is capped at 1000')
        },
    },
    /** md
- **Rule mode**: You may select "List" or "Formula". Generally speaking, the
  parameters above are used to control the Turtle visualization when this
  Rule mode parameter has its default value of "List". The parameters below
  are used when the **Rule mode** is "Formula". (Note that **Background color**
  and **Turtle speed** are used in either case.) Broadly, in Formula mode,
  you can enter expressions that calculate the different aspects of each
  segment of the turtle's path (angle, step length, color, etc.) directly
  from the sequence entries. In each of these formulas, you may use the
  following variables, the values of which will be filled in for you:

  `n` The index of the entry in the sequence being visualized.

  `a` The value of the entry.

  `k` The serial number of the step starting from one for the first step
  that the turtle takes.

  `m` The minimum index of the sequence being visualized. Note that the
  above definitions mean that `n`, `k`, and `m` are related by `n = m + k - 1`.

  `M` The Maximum index of the sequence being visualized. Note this value
  may be Infinity for sequences that are defined and can be calculated in
  principle for any index.

  `f` The frame number of this drawing pass. If you use this variable, the
  visualization will be redrawn from the beginning on every frame,
  animating the shape of the path.

  `b` The current bearing of the turtle, in degrees counterclockwise from its
  initial bearing. Note this value represents the bearing _before_ the
  new one when the angle formula is being computed, and the resulting new
  bearing when all of the other formulas are being computed. For example,
  if you compute the color of the stroke using the `b` variable, it will
  correctly base the color on the bearing of that stroke (not on the previous
  one).

  `x` The current x-coordinate of the turtle (before the upcoming step).

  `y` The current y-coordinate of the turtle.

  You may also use the symbol `A` as a function symbol in your formula, and it
  will provide access to the value of the sequence being visualized for any
  index. For example, the formula `A(n+1) - A(n)` or equivalently `A(n+1) - a`
  would produce the so-called "first differences" of the sequence.

  Note that as you change parameters in List mode, the formulas will be
  updated in the background to match for you, but not vice versa: If you
  switch to List mode, the visualization will change to reflect the last
  List mode values you set. That's because most changes you might make
  in Formula mode can't possibly be captured in the simpler List mode. Hence,
  the Turtle visualizer simply doesn't try to keep the List values in
  sync with Formula changes.

     **/
    ruleMode: {
        default: RuleMode.List,
        type: ParamType.ENUM,
        from: RuleMode,
        displayName: 'Rule mode',
        required: true,
        updateAction: function (newRule: string) {
            const turtle = this instanceof Turtle ? this : null
            if (turtle === null) return
            const rule: RuleMode = parseInt(newRule)
            if (rule === RuleMode.List) {
                turtle.params.ruleMode.description = ''
            } else {
                turtle.params.ruleMode.description =
                    'The formulas below may use the following symbols: '
                    + '`a` - sequence entry, `n` - sequence index, '
                    + '`k` - step number, `m` - minimum index, '
                    + '`M` - Maximum index, '
                    + '`A(...)` -- sequence entry at any index, '
                    + '`b` - current bearing, `x`,`y` - current position, '
                    + '`f` - frame number (triggers animation).'
                // If there are any invalid rules, reset them to their
                // default values:
                const freshRules = new Set<string>()
                let name: RuleParam = 'angles'
                for (name in ruleParams) {
                    if (turtle.statusOf[name].invalid()) {
                        turtle.resetParam(name)
                        freshRules.add(name)
                    }
                }
                if (freshRules.size) turtle.refreshParams(freshRules)
            }
        },
    },
    /** md
- **Angle formula**: an expression to compute the angle for a given step of the
  turtle's path. Just as in list mode, the **Angle is...** parameter
  above specifies whether the value of this expression is taken directly as
  the new Bearing of the turtle, or whether the turtle makes a
  (counterclockwise) Turn by this angle before taking its next step.
    **/
    angleFormula: {
        default: new MathFormula(
            '0 <= a < 3 ? 30+15a : undefined',
            formulaSymbols
        ),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Angle formula',
        description: 'Computes the angle for the turtle at each step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
    /** md
- **Angle measure**: whether the result of the **Angle formula** should be
  interpreted in degrees or radians. Note that the selection also gives the
  units in which the value of the `b` (bearing) variable  that can be used
  in formulas will be determined.
    **/
    angleMeasure: {
        default: AngleUnit.Degrees,
        type: ParamType.ENUM,
        from: AngleUnit,
        displayName: 'Angle measure',
        required: true,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
    },
    /** md
- **Step formula**: an expression to compute the pixel length of each step
  of the turtle's path.
    **/
    stepFormula: {
        default: new MathFormula('20'),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Step formula',
        description: 'Computes the pixel length of each turtle step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
    /** md
- **Width formula**: an expression to compute the pixel width of each step
  of the turtle's path.
    **/
    widthFormula: {
        default: new MathFormula('1'),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Width formula',
        description: 'Computes the pixel width of each turtle step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        level: 0,
    },
    /** md
- **Color formula**: an expression to compute the color of each step of the
  turtle's path.
    **/
    colorFormula: {
        default: new MathFormula('#c98787'),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Color formula',
        description: 'Computes the color of each turtle step',
        required: false,
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
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
        visibleDependency: 'ruleMode',
        visibleValue: RuleMode.Formula,
        updateAction: function (newColor: string) {
            const turtle = this instanceof Turtle ? this : null
            if (turtle === null) return
            const cfIn = document.querySelector('.param-field #colorFormula')
            if (!(cfIn instanceof HTMLInputElement)) return
            const cf = turtle.tentativeValues.colorFormula
            const start = cfIn.selectionStart ?? cf.length
            const end = cfIn.selectionEnd ?? start
            turtle.tentativeValues.colorFormula =
                cf.substr(0, start) + newColor + cf.substr(end)
        },
    },
} satisfies GenericParamDescription

const formulaParamNames = [
    'angleFormula',
    'stepFormula',
    'widthFormula',
    'colorFormula',
] as const
const ruleParams = {
    angles: 'angleFormula',
    steps: 'stepFormula',
    folds: 'angleFormula',
    stretches: 'stepFormula',
    widths: 'widthFormula',
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

class Turtle extends P5GLVisualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // variables recording the path
    private vertices = markRaw([new p5.Vector()]) // nodes of path
    private pathWidths = markRaw([1])
    private pathLengths = markRaw([0])
    private pathBearings = markRaw([math.evaluate('0')])
    private pathColors = markRaw([INVALID_COLOR])
    private chunks: p5.Geometry[] = markRaw([]) // "frozen" chunks of path
    private bearing = this.pathBearings[0] // bearing at tip of path
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
        let rule: RuleParam = 'angles'
        for (rule in ruleParams) {
            const ruleList: (string | number)[] = params[rule]
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

        let animating =
            params.folds.some(value => value !== 0)
            || params.stretches.some(value => value !== 0)
        if (params.ruleMode === RuleMode.Formula) {
            animating = formulaParamNames.some(name =>
                params[name].freevars.has('f')
            )
        }
        // warn when animation is turned on for long paths
        // BUG:  when sequence params change this isn't re-run
        // so the warning may be out of date
        if (
            animating
            && this.seq.length > this.throttleWarn
            && this.seq.length <= this.throttleLimit
        ) {
            status.addWarning(
                `Animating with more than ${this.throttleWarn} steps is `
                    + 'likely to have a very low frame rate.'
            )
        }
        if (animating && this.seq.length > this.throttleLimit) {
            status.addWarning(
                `Path animation limited to the first ${this.throttleLimit} `
                    + 'entries of the sequence.'
            )
        }
        return status
    }

    convertTable(fmlaName: FormulaParam) {
        const primaryRule = formulaRules[fmlaName][0]
        const frameRule = formulaRules[fmlaName][1]
        const primaryArray: (string | number)[] = this[primaryRule]
        const primaryLast = primaryArray.length - 1
        const dLength = this.domain.length
        let fmlaSource = ''
        for (let ix = 0; ix < dLength; ix++) {
            const key = `"${this.domain[ix]}"`
            let value = `${primaryArray[Math.min(ix, primaryLast)]}`
            if (frameRule) {
                const frameArray = this[frameRule]
                const frameLast = frameArray.length - 1
                const frameValue = frameArray[Math.min(ix, frameLast)]
                if (frameValue) {
                    const mult =
                        frameRule === 'stretches' ? '0.01' : '0.00001'
                    value += ` + ${mult}*f*${frameValue}`
                }
            }
            if (fmlaSource) fmlaSource += ', '
            else fmlaSource = '{'
            fmlaSource += `${key}: ${value}`
        }
        fmlaSource += '}[string(a)]'
        return new MathFormula(fmlaSource, formulaSymbols)
    }

    async parametersChanged(names: Set<string>) {
        if (this.ruleMode === RuleMode.List) {
            if (names.has('ruleMode') || names.has('domain')) {
                // pretend every rule changed
                for (const rule in ruleParams) names.add(rule)
            }
            const freshFmlas = new Set<string>()
            for (const name of names) {
                if (!checkRule(name)) continue
                const fmlaName = ruleParams[name]
                const oldFmla = this[fmlaName].source
                const newFmla = this.convertTable(fmlaName)
                if (newFmla.freevars.isSubsetOf(formulaSymSet)) {
                    this[fmlaName] = newFmla
                    if (newFmla.source !== oldFmla) {
                        names.add(fmlaName)
                        freshFmlas.add(fmlaName)
                    }
                    if (
                        fmlaName === 'angleFormula'
                        && this.angleMeasure !== AngleUnit.Degrees
                    ) {
                        this.angleMeasure = AngleUnit.Degrees
                        names.add('angleMeasure')
                        freshFmlas.add('angleMeasure')
                    }
                }
            }
            if (freshFmlas.size) this.refreshParams(freshFmlas)
        }
        super.parametersChanged(names)
    }

    setup() {
        super.setup()

        // reset variables
        this.animating = formulaParamNames.some(fmla =>
            this[fmla].freevars.has('f')
        )
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
        this.pathBearings = markRaw([math.evaluate('0')])
        this.pathColors = markRaw([INVALID_COLOR])
        this.chunks = markRaw([])
        this.bearing = this.pathBearings[0]
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
            let radBearing = math.safeNumber(this.pathBearings[i])
            if (this.angleMeasure === AngleUnit.Degrees) {
                radBearing *= Math.PI
                radBearing /= 180
            }
            if (pos.x !== lastPos.x || pos.y !== lastPos.y) {
                sketch.fill(this.pathColors[i])
                sketch.push()
                sketch.scale(1, -1, 1)
                sketch.translate(lastPos.x, lastPos.y).rotateZ(radBearing)
                if (Math.abs(length) > width / 3) {
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
        // Now compute the new vertices in the path:
        this.pathFailure = false
        const len = this.vertices.length - 1
        const position = this.vertices[len].copy()
        const startIndex = this.firstIndex + BigInt(len)
        const endIndex = this.firstIndex + BigInt(targetLength)
        let checked = 0
        let inDomain = 0
        const threshold = 0.03
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
            if (this.ruleMode === RuleMode.List) {
                ++checked
                if (this.domain.includes(currElement)) inDomain++
            }
            const input = {
                n: Number(i),
                a: Number(currElement),
                k: Number(i - this.seq.first + 1n),
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                f: currentFrames,
                b: this.bearing,
                x: position.x,
                y: position.y,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
            }
            let stepLength = 0
            let clr: unknown = null
            try {
                const angle = this.angleFormula.computeWithStatus(
                    this.statusOf.angleFormula,
                    input
                )
                if (this.statusOf.angleFormula.invalid()) return
                if (angle !== undefined) {
                    if (this.angleMeaning === AngleMeaning.Bearing)
                        this.bearing = angle
                    else this.bearing = math.add(this.bearing, angle)
                    input.b = this.bearing
                    stepLength = math.safeNumber(
                        this.stepFormula.computeWithStatus(
                            this.statusOf.stepFormula,
                            input
                        ) ?? 0
                    )
                    if (this.statusOf.stepFormula.invalid()) return
                }
                this.pathWidths.push(
                    math.safeNumber(
                        this.widthFormula.computeWithStatus(
                            this.statusOf.widthFormula,
                            input
                        ) ?? 1
                    )
                )
                if (this.statusOf.widthFormula.invalid()) return
                clr =
                    this.colorFormula.computeWithStatus(
                        this.statusOf.colorFormula,
                        input
                    ) ?? 0
                if (this.statusOf.colorFormula.invalid()) return
            } catch (e) {
                this.pathFailure = true
                if (e instanceof CachingError) {
                    return // need to wait for more elements
                } else {
                    // don't know what to do with this
                    throw e
                }
            }
            let radBearing = math.safeNumber(this.bearing)
            if (this.angleMeasure === AngleUnit.Degrees) {
                radBearing *= Math.PI
                radBearing /= 180
            }
            position.x += Math.cos(radBearing) * stepLength
            position.y += Math.sin(radBearing) * stepLength
            if (typeof clr === 'string') {
                this.pathColors.push(this.sketch.color(clr))
            } else if (math.isChroma(clr)) {
                this.pathColors.push(this.sketch.color(clr.hex()))
            } else this.pathColors.push(this.sketch.color('white'))
            this.pathLengths.push(stepLength)
            this.pathBearings.push(this.bearing)
            this.vertices.push(position.copy())
        }
        if (this.ruleMode === RuleMode.List) {
            this.statusOf.domain.warnings.length = 0 // clear prior warning
            if (inDomain / checked < threshold) {
                this.statusOf.domain.addWarning(
                    `only ${inDomain} of current group of ${checked} sequence`
                        + 'entries are in this list; consider adjusting'
                )
            }
        }
    }

    async resized(toSize: ViewSize) {
        this.cursor = 0 // make sure we redraw
        this.sketch.resizeCanvas(toSize.width, toSize.height)
        return true // we handled it; framework need not do anything
    }

    mouseWheel(event: WheelEvent) {
        super.mouseWheel(event)
        this.cursor = 0 // make sure we redraw
    }
}

export const exportModule = new VisualizerExportModule(Turtle)
