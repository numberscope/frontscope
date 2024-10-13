import p5 from 'p5'

import type {ViewSize} from './VisualizerInterface'
import {VisualizerExportModule} from './VisualizerInterface'
import {P5GLVisualizer} from './P5GLVisualizer'

import {CachingError} from '@/sequences/Cached'
import type {
    GenericParamDescription,
    ParamValues,
    ParamInterface,
} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'
import type {ExtendedBigint} from '@/shared/math'
import {math} from '@/shared/math'

/** md
# Turtle Visualizer

[<img
  src="../../assets/img/Turtle/turtle-waitforit.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Turtle/turtle-waitforit.png)

This visualizer interprets a sequence as instructions for a drawing machine.
For each value in a domain of possible sequence values, the entry determines
a turn angle and step length.  The visualizer displays the resulting polygonal
path.

There are two ways to animate the resulting path:

1.  By setting the growth parameter to be positive, you can watch the path
being drawn some number of steps per frame until it reaches the full length.

2.  By setting non-zero values for the `Folding rates', the user can set the
turn angles to gradually increase or decrease over time, resulting a
protein-folding effect.

## Parameters
**/

const paramDesc = {
    /** md
- domain: A list of all of the values that may occur in the sequence.
Values of the sequence not occurring in this list will be ignored.
(One way to ensure a small number of possible values is to use a
sequence that has been reduced with respect to some small modulus.) But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: [0n, 1n, 2n, 3n, 4n] as bigint[],
        type: ParamType.BIGINT_ARRAY,
        displayName: 'Sequence Domain',
        required: true,
        description:
            'values to interpret as rules; sequence values not '
            + ' matching any term here are ignored',
        hideDescription: false,
    },
    /** md
- turns: a list of numbers. These are turning angles, in degrees,
corresponding positionally to the domain elements. Must contain
the same number of elements as the domain.  In other words, the first
element of the domain will be interpreted as an instruction to turn
x degrees, where x is the first number in this field.
     **/
    turns: {
        default: [30, 45, 60, 90, 120] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Turning angles',
        required: true,
        description:
            'list of angles in degrees, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: false,
    },
    /** md
- steps: a list of numbers. These are step lengths, corresponding
positionally to the domain elements.  Must contain the same number of
elements as the domain.  As with turn angles, the n-th step length
will be interpreted as the step length for the n-th domain element.
     **/
    steps: {
        default: [20, 20, 20, 20, 20] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Step lengths',
        required: true,
        description:
            'list of step lengths in pixels, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: false,
    },
    /**
- foldControls: boolean. If true, show folding controls, and turn on folding
    **/
    foldControls: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Turn on protein folding animation ↴',
        required: false,
    },
    /** md
- folding: a list of numbers. When these are non-zero, the path will animate.
These are angle increments added to the turning
angles each frame.  They correspond
positionally to the domain elements.  Must contain the same number of elements
as domain.  The units is 1/10^5th of a degree.  For example, if the first
entry here is a `2`, then in each frame of the animation, the turn angle for
the first domain element will increase by 2/10^5-th of a degree.  The result
looks a little like protein folding.
     **/
    folds: {
        default: [0, 0, 0, 0, 0] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Folding rates',
        required: false,
        description:
            'turns on animation:  list of angle increments per frame in units'
            + ' of 0.01 degree, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: false,
        visibleDependency: 'foldControls',
        visibleValue: true,
    },
    /**
- pathLook: boolean. If true, show path style controls
    **/
    pathLook: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Path speed/styling ↴',
        required: false,
    },
    /**
- speed: a number.  If zero, the full path is drawn all at once.
Otherwise, the visualizer will animate: this is the number of steps of the path
to grow per frame, until the path reaches its maximum length (give by sequence
 last parameter).
     **/
    speed: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Turtle speed',
        required: false,
        description: 'how many more terms to show per frame',
        hideDescription: false,
        visibleDependency: 'pathLook',
        visibleValue: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n <= 0,
                'Path speed must be non-negative'
            ),
    },
    /**
- strokeWeight: a number. Gives the width of the segment drawn for each entry,
in pixels.
     **/
    strokeWeight: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Stroke Width',
        required: false,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0) status.addError('Stroke width must be positive')
        },
        visibleDependency: 'pathLook',
        visibleValue: true,
    },
    /**
- bgColor: The background color of the visualizer canvas.
     **/
    bgColor: {
        default: '#6b1a1a',
        type: ParamType.COLOR,
        displayName: 'Background Color',
        required: true,
        visibleDependency: 'pathLook',
        visibleValue: true,
    },
    /**
- strokeColor: The color used for drawing the path.
     **/
    strokeColor: {
        default: '#c98787',
        type: ParamType.COLOR,
        displayName: 'Stroke Color',
        required: true,
        visibleDependency: 'pathLook',
        visibleValue: true,
    },
} satisfies GenericParamDescription

class turtleData {
    position: p5.Vector
    orientation: number // angle in degrees

    constructor(position: p5.Vector, orientation: number) {
        this.position = position
        this.orientation = orientation
    }
}

class Turtle extends P5GLVisualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // maps from domain to rotations and steps
    private rotMap = new Map<string, number>()
    private stepMap = new Map<string, number>()
    private foldMap = new Map<string, number>()
    // private copies of rule arrays
    private turnsInternal: number[] = []
    private stepsInternal: number[] = []
    private foldsInternal: number[] = []

    // variables controlling path to draw in a given frame
    private beginStep: ExtendedBigint = 0n // path step at which drawing begins
    private currentLength: ExtendedBigint = 1n // length of path
    private turtleState = new turtleData(new p5.Vector(), 0) // current state
    private path: turtleData[] = [] // array of path info

    // variables holding the parameter values
    // these won't change
    private firstTerm: ExtendedBigint = 0n // first term
    private folding = false // whether there's any folding
    private growthInitial = 0 // growth is turned on or off overall
    private growth = 0 // growth currently happening or not
    private pathLength: ExtendedBigint = 1n // can be infinity

    // controlling the folding smoothness/speed/units
    // the units of the folding entry field are 1/denom degrees
    private denom = 100000 // larger = more precision/slower

    // handling slow caching & mouse
    private pathFailure = false
    private mouseCount = 0

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // first term handling
        this.firstTerm = this.seq.first

        // path length handling
        this.pathLength = this.seq.length

        // walkAnimation handling
        this.growthInitial = params.speed
        this.growth = params.speed
        if (this.pathLength === Infinity && this.growth === 0) {
            // we cannot allow the visualizer to attempt
            // to draw infinitely many terms in
            // one frame
            status.addWarning(
                'To draw without growth, must limit '
                    + 'sequence to finitely many terms.  '
                    + 'Showing only 10000 terms.'
            )
            this.pathLength = 10000n
        }

        // domain handling
        // for each of the rule arrays, should match
        // params.domain.length; otherwise special handling

        // tell user the appropriate rule lengths
        const ruleParams = [
            {
                param: params.turns,
                local: this.turnsInternal,
                desc: paramDesc.turns as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'Turn angles',
            },
            {
                param: params.steps,
                local: this.stepsInternal,
                desc: paramDesc.steps as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'Step sizes',
            },
            {
                param: params.folds,
                local: this.foldsInternal,
                desc: paramDesc.folds as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'Folding rates',
            },
        ]

        for (const rule of ruleParams) {
            // how can I add a newline before parenthetical?
            rule.desc.displayName =
                rule.text
                + ` (must match domain length, ${params.domain.length})`
        }

        // ignore (remove) or add extra rules for excess/missing
        // terms compared to domain length
        // note: this changes the actual param values
        // if refreshParams() were called this would be
        // visible to the user
        ruleParams.forEach(rule => {
            rule.local = [...rule.param]
        })
        ruleParams.forEach(rule => {
            while (rule.local.length < params.domain.length) {
                rule.local.push(0)
            }
            while (rule.local.length > params.domain.length) {
                rule.local.pop()
            }
        })
        // store internally
        this.turnsInternal = ruleParams[0].local
        this.stepsInternal = ruleParams[1].local
        this.foldsInternal = ruleParams[2].local

        // add warnings explaining the behaviour
        ruleParams.forEach(rule => {
            if (rule.param.length > params.domain.length) {
                // when implemented, have this appear next to parameter
                // associated to array and make warning instead
                status.addWarning(
                    'More entries ('
                        + rule.param.length
                        + ') in '
                        + rule.text
                        + ' than in domain ('
                        + params.domain.length
                        + '); ignoring extras.'
                )
            }
            if (rule.param.length < params.domain.length) {
                // when implemented, have this appear next to parameter
                // associated to array and make warning instead
                // error is stopping refreshParams()
                status.addWarning(
                    'Fewer entries ('
                        + rule.param.length
                        + ') in '
                        + rule.text
                        + ' than in domain ('
                        + params.domain.length
                        + '); using trivial behaviour for missing terms.'
                )
            }
        })
        return status
    }
    async presketch(size: ViewSize) {
        await super.presketch(size)

        await this.refreshParams()
    }

    setup() {
        super.setup()

        // create a map from sequence values to rotations
        for (let i = 0; i < this.domain.length; i++) {
            this.rotMap.set(
                this.domain[i].toString(),
                (Math.PI / 180) * this.turnsInternal[i]
            )
        }

        // create a map from sequence values to step lengths
        for (let i = 0; i < this.domain.length; i++) {
            this.stepMap.set(this.domain[i].toString(), this.stepsInternal[i])
        }

        // create a map from sequence values to turn increments
        // notice if path is static or we are folding
        this.folding = false
        for (let i = 0; i < this.domain.length; i++) {
            if (this.foldsInternal[i] != 0) this.folding = true
            this.foldMap.set(
                this.domain[i].toString(),
                this.foldsInternal[i]
                // in units of this.incrementFactor
            )
        }

        // reset variables
        this.beginStep = 0n
        this.currentLength = 1n
        this.growth = this.growthInitial

        // if not growing, set to full length immediately
        // pathLength is finite if growth is zero (from
        // parameter verification)
        if (this.growth == 0) this.currentLength = this.pathLength

        // create initial path
        // must be in setup not presketch since uses p5.Vector
        // in case we are animating, we will recompute anyway,
        // so use current length only, for efficiency
        this.createpath(0, 0n, this.currentLength)

        // prepare sketch
        this.sketch
            .background(this.bgColor)
            .fill(this.bgColor)
            .stroke(this.strokeColor)
            .strokeWeight(this.strokeWeight)
            .frameRate(30)
    }

    draw() {
        const sketch = this.sketch

        // if folding or moving, clear and reset draw to beginning of path
        if (this.sketch.mouseIsPressed) {
            this.mouseCount = sketch.frameCount
        }
        if (this.folding || this.mouseCount > sketch.frameCount - 10) {
            this.sketch.clear().background(this.bgColor)
            this.beginStep = 0n
            this.createpath(sketch.frameCount, 0n, this.currentLength)
        }

        // draw path from this.beginStep to this.currentLength
        let startState = this.path[0]
        let endState = this.path[1]
        for (
            let i = 1;
            i < math.bigsub(this.currentLength, this.beginStep);
            i++
        ) {
            endState = this.path[i]
            sketch.line(
                startState.position.x,
                startState.position.y,
                endState.position.x,
                endState.position.y
            )
            startState = endState
        }
        // advance this.beginStep
        if (!this.pathFailure)
            this.beginStep = math.bigsub(this.currentLength, 1n)

        // stop drawing if no animation
        if (!this.folding && this.growth === 0 && !this.pathFailure) {
            console.log('stopping')
            this.stop()
        }

        // if path is growing, lengthen path
        if (!this.pathFailure) {
            this.currentLength = math.bigadd(this.currentLength, this.growth)
        }
        // if reached full length, stop growing
        if (this.currentLength > this.pathLength) {
            this.currentLength = this.pathLength
            this.growth = 0
        }

        // create the path needed for next draw loop
        this.turtleState = endState
        this.createpath(
            sketch.frameCount,
            this.beginStep,
            this.currentLength,
            endState
        )
    }

    // this should be run each time the path needs to be extended
    // or re-calculated
    // if folding, include current frames; otherwise `frames=0`
    createpath(
        currentFrames: number,
        beginStep: ExtendedBigint,
        currentLength: ExtendedBigint,
        turtleState?: turtleData
    ) {
        this.pathFailure = false

        // initialize turtle position
        if (!turtleState) {
            const canvasCtr = new p5.Vector(0, 0)
            turtleState = new turtleData(canvasCtr, 0)
        }
        let orientation = turtleState.orientation
        const position = turtleState.position.copy()

        // clear path
        this.path = [turtleState]

        // read sequence to create path
        // start at beginStep past firstTerm
        // go until currentLength allows
        const startStep = math.bigadd(this.firstTerm, this.beginStep)
        for (
            let i = startStep;
            i < math.bigadd(startStep, currentLength);
            i++
        ) {
            // get the current sequence element and infer
            // the rotation/step/increment
            let step = new p5.Vector(0, 0)
            try {
                const currElement: ExtendedBigint = this.seq.getElement(
                    BigInt(i)
                )
                const currElementString = currElement.toString()
                const turnAngle = this.rotMap.get(currElementString)
                const stepLength = this.stepMap.get(currElementString)
                const turnIncrement = this.foldMap.get(currElementString)

                // turn (thisIncrement is raw increment)
                const thisIncrement = currentFrames * (turnIncrement ?? 0)
                orientation
                    += (turnAngle ?? 0)
                    + (Number(math.modulo(thisIncrement, 360 * this.denom))
                        / this.denom)
                        * (Math.PI / 180)

                // step
                step = new p5.Vector(
                    Math.cos(orientation),
                    Math.sin(orientation)
                )
                step.mult(stepLength ?? 0)
            } catch (e) {
                if (e instanceof CachingError) {
                    this.pathFailure = true
                } else {
                    console.log('mystery error:', e)
                }
            }
            // happens whether step has info or not
            position.add(step)

            // add the new position to the path
            turtleState = new turtleData(position.copy(), orientation)
            this.path.push(turtleState)
        }
    }

    mouseReaction() {
        this.mouseCount = this.sketch.frameCount
        this.continue()
    }
    // why doesn't super work on mouseWheel? where do I get a mouseEvent?
    mouseWheel(event: WheelEvent) {
        super.mouseWheel(event)
        this.mouseReaction()
    }
    mouseDragged() {
        super.mouseDragged()
        this.mouseReaction()
    }
}

export const exportModule = new VisualizerExportModule(Turtle)
