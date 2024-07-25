import p5 from 'p5'

import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'
import {modulo} from '../shared/math'

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
sequence that has been reduced with respect to some small modulus (see
`modulus' below). But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: [0, 1, 2, 3, 4, 5] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Sequence Domain',
        required: true,
        description:
            'values to interpret as rules; sequence values not '
            + ' matching any term here are ignored; pro tip: if you enter a'
            + ' single value it will autopopulate 0, 1, ..., n-1 and set'
            + ' modulus value to n',
        hideDescription: true,
    },
    /**
- modulus: the modulus to apply to any incoming sequence.  This is the most
common way
to ensure the sequence values will lie in your domain.  A value of 0 means 
that no modulus is applied.
     **/
    modulus: {
        default: 5,
        type: ParamType.INTEGER,
        displayName: 'Sequence Modulus',
        required: true,
        description: 'consider sequence values modulo this; 0 means none',
        hideDescription: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 0,
                'Modulus should be non-negative; 0 means none.'
            ),
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
        hideDescription: true,
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
        hideDescription: true,
    },
    /**
- pathLength: a number. Gives the number of sequence terms to use.  
Entering a 0 means to use all available terms (possibly forever), and 
will force the 'growth' animation to turn on.
If the user enters a number exceeding the number of terms available, 
this will default to the max number of terms available.
     **/
    pathLength: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Path length',
        required: true,
        description:
            'cannot exceed available number of terms from sequence;'
            + ' entering 0 will indicate infinity',
        hideDescription: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 0,
                'Path length must be non-negative'
            ),
    },
    /**
- growth: a number.  If zero, the full path is drawn all at once.  
Otherwise, the visualizer will animate: this is the number of steps of the path
to grow per frame, until the path reaches its maximum length (give by 
`pathLength` set above).
     **/
    growth: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Path growth',
        required: false,
        description:
            'turns on animation: how many more terms to show per frame',
        hideDescription: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 0,
                'Path growth must be non-negative'
            ),
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
    folding: {
        default: [0, 0, 0, 0, 0] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Folding rates',
        required: false,
        description:
            'turns on animation:  list of angle increments per frame in units'
            + ' of 0.01 degree, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: true,
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
    },
    /**
- bgColor: The background color of the visualizer canvas.
     **/
    bgColor: {
        default: '#6b1a1a',
        type: ParamType.COLOR,
        displayName: 'Background Color',
        required: true,
    },
    /**
- strokeColor: The color used for drawing the path.
     **/
    strokeColor: {
        default: '#c98787',
        type: ParamType.COLOR,
        displayName: 'Stroke Color',
        required: true,
    },
    /**
- start: x,y coordinates of the point where drawing will start.  The default
0,0 represents the center of the canvas, and positive values will move the
to the right and down, respectively.
     **/
    start: {
        default: new p5.Vector(),
        type: ParamType.VECTOR,
        displayName: 'Start',
        required: false,
        description: 'coordinates of the point where drawing will start',
        hideDescription: true,
    },
} satisfies GenericParamDescription

class Turtle extends P5Visualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // maps from domain to rotations and steps
    private rotMap = new Map<string, number>()
    private stepMap = new Map<string, number>()
    private foldingMap = new Map<string, number>()

    private currentIndex = 0n
    private orientation = 0
    private X = 0
    private Y = 0
    
    // variables controlling path to draw in a given frame
    private begin = 0 // path step at which drawing begins
    private currentLength = 1 // length of path
    private path: p5.Vector[] = [] // array of path info
    private pathIsStatic = true // whether there's any folding
    private growthInternal = 0 // growth
    private pathLengthInternal = 1 // can be infinity

    // controlling the folding smoothness/speed/units
    // the units of the folding entry field are 1/denom degrees
    private denom = 100000 // larger = more precision/slower

    // handling slow caching
    private pathFailure = false

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // If number is entered, immediately populate
        if (params.domain.length === 1) {
            if (params.domain[0] > 0 && params.domain[0] < 10) {
                params.modulus = params.domain[0]
                params.domain = [...Array(params.modulus).keys()]
            } else {
                status.addError(
                    'If you enter only one integer for'
                        + ' domain, it is interpreted as a'
                        + ' modulus and must lie between'
                        + ' 1 and 9.'
                )
            }
        }

        // for each of the rule arrays, adjust them to the length
        // params.domain.length
        const paramArrays: number[][] = [
            params.turns,
            params.steps,
            params.folding,
        ]

        paramArrays.forEach(subarray => {
            while (subarray.length < params.domain.length) {
                subarray.push(0)
            }
            while (subarray.length > params.domain.length) {
                subarray.pop()
            }
        })

        // cannot request a path longer than the sequence provides
        params.pathLength = Math.min(
            params.pathLength,
            this.seq.last - this.seq.first
        )
        this.pathLengthInternal = params.pathLength

        // if path length is zero, force growth
        if (params.pathLength == 0) {
            this.pathLengthInternal = this.seq.last - this.seq.first
            if (params.growth == 0) params.growth = 1
        }

        return status
    }

    async presketch() {
        await super.presketch()

        await this.refreshParams()

        // create a map from sequence values to rotations
        for (let i = 0; i < this.domain.length; i++) {
            this.rotMap.set(
                this.domain[i].toString(),
                (Math.PI / 180) * this.turns[i]
            )
        }

        // create a map from sequence values to step lengths
        for (let i = 0; i < this.domain.length; i++) {
            this.stepMap.set(this.domain[i].toString(), this.steps[i])
        }

        // create a map from sequence values to turn increments
        // notice if path is static or we are folding
        this.pathIsStatic = true
        for (let i = 0; i < this.domain.length; i++) {
            if (this.folding[i] != 0) this.pathIsStatic = false
            this.foldingMap.set(
                this.domain[i].toString(),
                this.folding[i] // in units of this.incrementFactor
            )
        }
    }

    setup() {
        super.setup()

        // this line should be removed once issue #403 is resolved
        // right now it avoids crashes caused by that issue
        // but ideally we should never be in a state where
        // this.pathLength exceeds this.seq.last - this.seq.first
        this.pathLengthInternal = Math.min(
            this.pathLengthInternal,
            this.seq.last - this.seq.first
        )

        // reset variables
        this.begin = 0
        this.currentLength = 1
        this.growthInternal = this.growth

        // if not growing, set to full length immediately
        // pathLength should always be finite if growth is zero
        if (this.growthInternal == 0)
            this.currentLength = this.pathLengthInternal

        // create initial path
        // must be in setup since uses p5.Vector
        // in case we are animating, we will recompute anyway,
        // so use current length only, for efficiency
        this.createpath(0, this.currentLength)

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

        if (angle == undefined) {
            this.stop()
            return
        // if folding, clear and reset draw to beginning of path
        if (!this.pathIsStatic) {
            sketch.clear().background(this.bgColor)
            this.begin = 0
        }

        // draw path from this.begin to this.currentLength
        let startPt = this.path[this.begin]
        for (let i = this.begin + 1; i < this.currentLength; i++) {
            const endPt = this.path[i]
            sketch.line(startPt.x, startPt.y, endPt.x, endPt.y)
            startPt = endPt.copy()
        }
        // advance this.begin
        if (!this.pathFailure) this.begin = this.currentLength - 1

        // stop drawing if no animation
        if (this.pathIsStatic && !this.growthInternal && !this.pathFailure) {
            sketch.noLoop()
        }

        this.sketch.line(oldX, oldY, this.X, this.Y)
        if (++this.currentIndex > this.seq.last) this.stop()

        // if path is growing, lengthen path
        if (!this.pathFailure) {
            this.currentLength += this.growthInternal
        }
        // if reached full length, stop growing
        if (this.currentLength > this.pathLengthInternal) {
            this.currentLength = this.pathLengthInternal
            this.growthInternal = 0
        }

        // if we are still drawing, recreate path
        this.createpath(sketch.frameCount, this.currentLength)
    }

    createpath(frames: number, length: number) {
        this.pathFailure = false

        // initialize turtle position
        let orientation = 0
        const position = new p5.Vector(
            this.sketch.width / 2,
            this.sketch.height / 2
        )
        position.add(this.start)

        // clear path
        this.path = []

        // read sequence to create path
        for (
            let i = this.seq.first;
            i < this.seq.first + Math.min(length, this.pathLengthInternal);
            i++
        ) {
            // get the current sequence element and infer
            // the rotation/step/increment
            let step = new p5.Vector(0, 0)
            try {
                let currElement = this.seq.getElement(i)
                currElement = this.modulus
                    ? modulo(currElement, this.modulus)
                    : currElement
                const currElementString = currElement.toString()
                const turnAngle = this.rotMap.get(currElementString)
                const stepLength = this.stepMap.get(currElementString)
                const turnIncrement = this.foldingMap.get(currElementString)

                // turn
                const thisIncrement = frames * (turnIncrement ?? 0) // raw inc
                orientation
                    += (turnAngle ?? 0)
                    + (Number(modulo(thisIncrement, 360 * this.denom))
                        / this.denom)
                        * (Math.PI / 180)

                // step
                step = new p5.Vector(
                    Math.cos(orientation),
                    Math.sin(orientation)
                )
                step.mult(stepLength ?? 0)
            } catch (CachingError) {
                this.pathFailure = true
            }
            // happens whether step has info or not
            position.add(step)

            // add the new position to the path
            this.path.push(position.copy())
        }
    }
}

export const exportModule = new VisualizerExportModule(Turtle)
