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

class Turtle extends P5GLVisualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // maps from domain to rotations and steps
    private rotMap = markRaw(new Map<string, number>())
    private stepMap = markRaw(new Map<string, number>())
    private foldMap = markRaw(new Map<string, number>())
    // private copies of rule arrays
    private turnsInternal: number[] = []
    private stepsInternal: number[] = []
    private foldsInternal: number[] = []

    // variables recording the path
    private vertices = markRaw([new p5.Vector()]) // nodes of path
    private bearing = 0 // heading at tip of path
    private cursor = 0 // vertices up to this one have already been drawn

    // variables holding the parameter values
    // these don't change except in setup()
    private firstIndex = 0n // first term
    private folding = false // whether there's any folding
    private growth = 0 // growth of path per frame
    private maxLength = -1 // longest we will allow path to get

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
                (Math.PI / 180) * (this.foldsInternal[i] / this.denom)
            )
        }
    }

    setup() {
        super.setup()

        // create internal rule maps
        this.storeRules()

        // reset variables
        this.firstIndex = this.seq.first
        this.maxLength = this.folding ? 4000 : Number.MAX_SAFE_INTEGER
        if (this.seq.length < this.maxLength) {
            this.maxLength = Number(this.seq.length)
        }
        this.growth = Math.min(this.speed, 100)
        // draw the entire path every frame if folding
        if (this.folding) this.growth = this.maxLength

        this.refresh()
    }

    refresh() {
        // eliminates the path so it will be recomputed, and redraws
        this.vertices = markRaw([new p5.Vector()]) // nodes of path
        this.bearing = 0
        this.redraw()
    }

    redraw() {
        // blanks the screen and sets up to redraw the path
        this.cursor = 0
        // prepare sketch
        this.sketch
            .background(this.bgColor)
            .noFill()
            .stroke(this.strokeColor)
            .strokeWeight(this.strokeWeight)
            .frameRate(30)
    }

    draw() {
        const sketch = this.sketch
        if (this.folding) this.refresh()
        else if (this.cursor === 0) this.redraw()

        // compute more of path as needed:
        console.log(this.vertices.length, this.growth, this.maxLength)
        const targetLength = Math.min(
            this.vertices.length - 1 + this.growth,
            this.maxLength
        )
        this.extendPath(sketch.frameCount, targetLength)

        // draw path from cursor to tip:
        if (this.cursor < this.vertices.length - 1) {
            sketch.beginShape()
            let lastPos: undefined | p5.Vector = undefined
            while (this.cursor < this.vertices.length) {
                const pos = this.vertices[this.cursor++]
                if (pos.x !== lastPos?.x || pos.y !== lastPos?.y) {
                    sketch.vertex(pos.x, pos.y)
                }
                lastPos = pos
            }
            this.cursor-- // get it back in range
            sketch.endShape()
        }

        // stop drawing if no animation
        if (
            !this.folding
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
        console.log(`Frame ${currentFrames}, to ${targetLength}`)
        // First compute the rotMap to use:
        let rotMap = this.rotMap
        if (this.folding) {
            rotMap = new Map<string, number>()
            for (const [entry, rot] of this.rotMap) {
                const extra = currentFrames * (this.foldMap.get(entry) ?? 0)
                rotMap.set(entry, rot + extra)
            }
        }
        // Now compute the new vertices in the path:
        this.pathFailure = false
        const len = this.vertices.length - 1
        const position = this.vertices[len].copy()
        const startIndex = this.firstIndex + BigInt(len)
        const endIndex = this.firstIndex + BigInt(targetLength)
        console.log('Indices', startIndex, 'to', endIndex - 1n)
        for (let i = startIndex; i < endIndex; i++) {
            // get the current sequence element and infer
            // the rotation/step/increment
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
            if (turnAngle !== undefined) {
                const stepLength = this.stepMap.get(currElementString) ?? 0
                this.bearing += turnAngle
                position.x += Math.cos(this.bearing) * stepLength
                position.y += Math.sin(this.bearing) * stepLength
            }
            this.vertices.push(position.copy())
        }
    }

    mouseReaction() {
        this.cursor = 0
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
