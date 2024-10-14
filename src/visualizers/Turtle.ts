import p5 from 'p5'
import {markRaw} from 'vue'

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
- domain: a list of numbers.  These are the values that
that the turtle should pay attention to when appearing as
terms of the sequence.  Values of the sequence
not occurring in this list will be ignored.
(One way to ensure a small number of possible values is to use a
sequence that has been reduced with respect to some small modulus. But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: [0n, 1n, 2n, 3n, 4n] as bigint[],
        type: ParamType.BIGINT_ARRAY,
        displayName: 'Domain',
        required: true,
        description:
            'sequence values to interpret as rules; terms not '
            + ' matching any value here are ignored',
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
- foldControls: boolean. If true, show folding controls
    **/
    foldControls: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Protein folding animation ↴',
        required: false,
    },
    /** md
- folding: a list of numbers. When these are non-zero, the path will animate.
These are angle increments added to the turning
angles each frame.  They correspond
positionally to the domain elements.  Must contain the same number of elements
as the domain.  The units are (1/10^5)-th of a degree.
For example, if the first
entry here is a `2`, then in each frame of the animation, the turn angle for
the first domain element will increase by (2/10^5)-th of a degree.  The result
looks a little like protein folding.
     **/
    folds: {
        default: [0, 0, 0, 0, 0] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Folding rates',
        required: false,
        description:
            'turns on animation:  list of angle increments per frame in units'
            + ' of 1/10^5 degree, in order corresponding'
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
 last parameter).  The visualizer has a brake on it to prevent lag: the speed
 cannot exceed 100 steps per frame.
     **/
    speed: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Turtle speed',
        required: false,
        description: 'steps added per frame',
        hideDescription: false,
        visibleDependency: 'pathLook',
        visibleValue: true,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0) status.addError('Speed must be positive')
            if (n > 100) status.addWarning('Speed capped at 100')
        },
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

// current position and orientation of a turtle
class TurtleData {
    position: p5.Vector
    orientation: number // angle in degrees

    constructor(position: p5.Vector, orientation: number) {
        this.position = position
        this.orientation = orientation
        markRaw(this)
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
    // "step" refers to steps of turtle
    // "index" refers to sequence index
    // (the two are not always the same)
    private beginStep = 0n // path step at which drawing begins
    private currentLength = 1n // length of path
    private turtleState = new TurtleData(new p5.Vector(), 0) // current state
    private path: TurtleData[] = markRaw([]) // array of path info

    // variables holding the parameter values
    // these won't change
    private firstIndex = 0n // first term
    private folding = false // whether there's any folding
    private growth = 0n // growth per frame
    private pathLength: ExtendedBigint = 1n // can be infinity

    // controlling the folding smoothness/speed/units
    // the units of the folding entry field are 1/denom degrees
    private denom = 100000 // larger = more precision/slower

    // handling slow caching & mouse
    private pathFailure = false
    private mouseCount = 0

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // lengths of rulesets should match length of domain
        const ruleParams = [
            {
                param: this.turns,
                desc: paramDesc.turns as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'turns',
                startText: 'Turning angles ',
            },
            {
                param: this.steps,
                desc: paramDesc.steps as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'steps',
                startText: 'Step lengths ',
            },
            {
                param: this.folds,
                desc: paramDesc.folds as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'folds',
                startText: 'Folding rates ',
            },
        ]
        for (const rule of ruleParams) {
            // how can I add a newline before parenthetical?
            rule.desc.displayName =
                rule.startText
                + ` (should match domain length, ${params.domain.length})`
            if (rule.param.length < params.domain.length) {
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
            if (rule.param.length > params.domain.length) {
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
        }

        // warn when folding is turned on for long paths
        // BUG:  when sequence params change this isn't re-run
        // so the warning may be out of date
        if (
            params.folds.some(value => value !== 0)
            && this.seq.length > 1000
            && this.seq.length <= 4000
        ) {
            status.addWarning(
                'Turning on folding with more than 1000 terms is likely'
                    + ' to be quite laggy.'
            )
        }
        if (
            params.folds.some(value => value !== 0)
            && this.seq.length > 4000
        ) {
            status.addWarning(
                'Folding animation not available with more than'
                    + ' 4000 terms; using only 4000.'
            )
        }
        return status
    }

    storeRules() {
        // this function creates the internal rule maps from user input

        // create an adjusted internal copy of the rules
        const ruleParams = [
            {
                param: this.turns,
                local: [0],
            },
            {
                param: this.steps,
                local: [0],
            },
            {
                param: this.folds,
                local: [0],
            },
        ]
        ruleParams.forEach(rule => {
            rule.local = [...rule.param]
        })
        // ignore (remove) or add extra rules for excess/missing
        // terms compared to domain length
        ruleParams.forEach(rule => {
            while (rule.local.length < this.domain.length) {
                rule.local.push(0)
            }
            while (rule.local.length > this.domain.length) {
                rule.local.pop()
            }
        })
        this.turnsInternal = ruleParams[0].local
        this.stepsInternal = ruleParams[1].local
        this.foldsInternal = ruleParams[2].local

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
    }

    setup() {
        super.setup()

        // create internal rule maps
        this.storeRules()

        // reset variables
        this.firstIndex = this.seq.first
        this.pathLength = this.seq.length
        if (this.folding && this.seq.length > 4000) this.pathLength = 4000n
        this.beginStep = 0n
        this.currentLength = 1n
        this.growth = BigInt(math.bigmin(100n, BigInt(this.speed)))

        // create initial path
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

        // if folding or mouse moving,
        // then clear and reset draw to beginning of path
        if (this.sketch.mouseIsPressed) {
            this.mouseCount = sketch.frameCount
        }
        // magic number 10 is how many frames to go before quitting after
        // a mouse event
        if (this.folding || this.mouseCount > sketch.frameCount - 10) {
            this.sketch.clear().background(this.bgColor)
            this.beginStep = 0n
            this.createpath(sketch.frameCount, 0n, this.currentLength)
        }

        // draw path
        // but only if there's more path to draw
        if (this.path.length > 1) {
            let startState = this.path[0]
            let endState = this.path[1]
            for (let i = 1; i < this.path.length; i++) {
                endState = this.path[i]
                sketch.line(
                    startState.position.x,
                    startState.position.y,
                    endState.position.x,
                    endState.position.y
                )
                startState = endState
            }
            // since we did some steps, must
            // advance this.beginStep and this.turtleState
            // unless the path failed somehow
            if (!this.pathFailure) {
                this.beginStep += BigInt(this.path.length - 1)
                this.turtleState = endState
            }
        }

        // stop drawing if no animation
        if (
            !this.folding
            && this.currentLength === this.pathLength
            && !this.pathFailure
        ) {
            this.stop()
        }

        // if path is growing, lengthen path
        if (!this.pathFailure) {
            this.currentLength += this.growth
        }
        // if reached full length, stop growing
        if (this.currentLength > this.pathLength) {
            this.currentLength = BigInt(this.pathLength) // must be finite
            this.growth = 0n
        }

        // create the path needed for next draw loop
        this.createpath(
            sketch.frameCount,
            this.beginStep,
            this.currentLength,
            this.turtleState
        )
    }

    // this should be run each time the path needs to be extended
    // or re-calculated.
    // if folding, include current frames; otherwise `frames=0`
    // resulting path should be currentLength - beginStep steps
    // meaning that path.length = that + 1
    createpath(
        currentFrames: number,
        beginStep: bigint,
        currentLength: bigint,
        turtleState?: TurtleData
    ) {
        this.pathFailure = false

        // initialize turtle position
        if (!turtleState) {
            const canvasCtr = new p5.Vector(0, 0)
            turtleState = new TurtleData(canvasCtr, 0)
        }
        let orientation = turtleState.orientation
        const position = turtleState.position.copy()

        // clear path
        this.path = markRaw([turtleState])

        // read sequence to create path
        // start at beginStep past firstIndex
        // go until currentLength allows
        const startIndex = this.firstIndex + this.beginStep
        const numSteps = this.currentLength - this.beginStep
        for (let i = startIndex; i < numSteps + startIndex; i++) {
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
                    this.pathFailure = true
                }
            }
            // happens whether step has info or not
            position.add(step)

            // add the new position to the path
            turtleState = new TurtleData(position.copy(), orientation)
            this.path.push(turtleState)
        }
    }

    mouseReaction() {
        this.mouseCount = this.sketch.frameCount
        this.continue()
    }
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
