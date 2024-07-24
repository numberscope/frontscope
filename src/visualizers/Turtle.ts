import p5 from 'p5'
import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import {ParamType} from '../shared/ParamType'
import type {ParamValues} from '../shared/Paramable'
import {ValidationStatus} from '@/shared/ValidationStatus'
import {modulo} from '../shared/math'

/** md
# Turtle Visualizer

[<img
  src="../../assets/img/Turtle/turtle-waitforit.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Turtle/turtle-waitforit.png)

This visualizer interprets a sequence as instructions for a drawing machine,
with each entry determining what angle to turn before drawing the next
straight segment. It displays the resulting polygonal path.

## Parameters
**/

const paramDesc = {
    /** md
- domain: A list of all of the values that may occur in the sequence.
(One way to ensure a small number of possible values is to use a
sequence that has been reduced with respect to some small modulus. But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: 5,
        type: ParamType.INTEGER,
        displayName: 'Sequence Modulus',
        required: true,
        description: 'modulus to consider sequence values',
        hideDescription: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 2 || n > 20,
                'Modulus should be between 2 and 20.'
            ),
    },
    /** md
- turns: a list of numbers. These are turning angles, corresponding
positionally to the domain elements. Must contain the same number of elements
as domain.
     **/
    turns: {
        default: [30, 45, 60, 90, 120] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Turning angles',
        required: true,
        description:
            'list of angles in degrees, corresponding to sequence values'
            + ' 0, 1, ... (up to modulus)',
        hideDescription: true,
    },
    /** md
- steps: a list of numbers. These are step lengths, corresponding
positionally to the domain elements.  Must contain the same number of elements 
as domain.
     **/
    steps: {
        default: [20, 20, 20, 20, 20] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Step lengths',
        required: true,
        description:
            'list of step lengths in pixels, corresponding to sequence values'
            + ' 0, 1, ... (up to modulus)',
        hideDescription: true,
    },
    /**
- pathLength: a number. Gives the number of sequence terms to use.
     **/
    pathLength: {
        default: 100,
        type: ParamType.INTEGER,
        displayName: 'Path length',
        required: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(n <= 0, 'Path length must be positive'),
    },
    /**
- growth: a number.  If zero, a static path length.  Otherwise, number of terms
to grow per frame, up to pathLength above.
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
- folding: a list of numbers. These are angle increments added to the turning 
angles each frame, corresponding
positionally to the domain elements.  Must contain the same number of elements 
as domain.  The units is 1/100th of a degree.
     **/
    folding: {
        default: [0, 0, 0, 0, 0] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Turning angle increments',
        required: false,
        description:
            'turns on animation:  list of angle increments per frame in units'
            + ' of 0.01 degree, corresponding to sequence values'
            + ' 0, 1, ... (up to modulus)',
        hideDescription: true,
    },

    /**
- strokeWeight: a number. Gives the width of the segment drawn for each entry.
     **/
    strokeWeight: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Stroke Width',
        required: false,
        validate: (n: number) =>
            ValidationStatus.errorIf(n <= 0, 'Stroke width must be positive'),
    },
    /**
- bgColor: The background color of the visualizer canvas
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
- start: x,y coordinates of the point where drawing will start
     **/
    start: {
        default: new p5.Vector(),
        type: ParamType.VECTOR,
        displayName: 'Start',
        required: false,
        description: 'coordinates of the point where drawing will start',
        hideDescription: true,
    },
} as const

class Turtle extends P5Visualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // maps from domain to rotations and steps
    private rotMap = new Map<string, number>()
    private stepMap = new Map<string, number>()
    private foldingMap = new Map<string, number>()

    // variables controlling path to draw in a given frame
    private begin = 0 // path step at which drawing begins
    private currentLength = 0 // length of path
    private path: p5.Vector[] = [] // array of path info
    private pathIsStatic = true // whether there's any folding
    private growthInternal = 0 // growth

    // this sets the units for increments; 0.1 means 1/10th of a degree
    private incrementFactor = 0.01

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // for each of the rule arrays, adjust them to the length params.domain
        const paramArrays: number[][] = [
            params.turns,
            params.steps,
            params.folding,
        ]

        paramArrays.forEach(subarray => {
            while (subarray.length < params.domain) {
                subarray.push(0)
            }
            while (subarray.length > params.domain) {
                subarray.pop()
            }
        })

        // cannot request a path longer than the sequence provides
        params.pathLength = Math.min(
            params.pathLength,
            this.seq.last - this.seq.first
        )

        return status
    }

    async presketch() {
        await super.presketch()

        this.refreshParams()

        // create a map from sequence values to rotations
        for (let i = 0; i < this.domain; i++) {
            this.rotMap.set(i.toString(), (Math.PI / 180) * this.turns[i])
        }

        // create a map from sequence values to step lengths
        for (let i = 0; i < this.domain; i++) {
            this.stepMap.set(i.toString(), this.steps[i])
        }

        // create a map from sequence values to turn increments
        // notice if path is static
        this.pathIsStatic = true
        for (let i = 0; i < this.domain; i++) {
            if (i != 0) this.pathIsStatic = false
            this.foldingMap.set(
                i.toString(),
                this.folding[i] // in units of 0.1 degree
            )
        }
    }

    setup() {
        super.setup()

        // reset variables
        this.begin = 0
        this.currentLength = 0
        this.growthInternal = this.growth

        // if not growing, set to full length immediately
        if (this.growthInternal == 0) this.currentLength = this.pathLength

        // create initial path
        // must be in setup since uses p5.Vector
        // in case we are not static, we will recompute anyway,
        // so use current length only, for efficiency
        this.createpath(
            0,
            this.pathIsStatic ? this.pathLength : this.currentLength
        )

        // prepare sketch
        this.sketch
            .background(this.bgColor)
            .fill(this.bgColor)
            .stroke(this.strokeColor)
            .strokeWeight(this.strokeWeight)
            .frameRate(30)
    }

    draw() {
        // if path is changing, clear and reset draw to beginning of path
        if (!this.pathIsStatic) {
            this.sketch.clear().background(this.bgColor)
            this.begin = 0
        }

        // draw path from this.begin
        this.sketch.beginShape()
        for (let i = this.begin; i < this.currentLength; i++) {
            const pt = this.path[i]
            this.sketch.vertex(pt.x, pt.y)
        }
        this.sketch.endShape()
        this.begin = this.currentLength // advance this.begin

        // stop drawing if the path is static
        if (this.pathIsStatic && this.growthInternal == 0)
            this.sketch.noLoop()
        // if path is growing, lengthen path
        this.currentLength += this.growthInternal
        if (this.currentLength > this.pathLength) {
            this.currentLength = this.pathLength
            this.growthInternal = 0
        }
        // if angles are dynamic, recreate entire path
        if (!this.pathIsStatic)
            this.createpath(this.sketch.frameCount, this.currentLength)
    }

    createpath(increment: number, length: number) {
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
            i < this.seq.first + Math.min(length, this.pathLength);
            i++
        ) {
            // get the current sequence element and infer
            // the rotation/step/increment
            // this takes the input integer modulo domain size
            const currElement = this.seq.getElement(i)
            const currElementModString = Number(
                modulo(currElement, this.domain)
            ).toString()
            const turnAngle = this.rotMap.get(currElementModString)
            const stepLength = this.stepMap.get(currElementModString)
            const turnIncrement = this.foldingMap.get(currElementModString)

            // turn
            orientation
                += (turnAngle ?? 0)
                + Number(modulo(increment * (turnIncrement ?? 0), 360))
                    * (Math.PI / 180)
                    * this.incrementFactor

            // step
            const step = new p5.Vector(
                Math.cos(orientation),
                Math.sin(orientation)
            )
            step.mult(stepLength ?? 0)
            position.add(step)

            // add the new position to the path
            this.path.push(position.copy())
        }
    }
}

export const exportModule = new VisualizerExportModule(Turtle)
