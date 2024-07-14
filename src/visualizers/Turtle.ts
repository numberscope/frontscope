import p5 from 'p5'
import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import {ParamType} from '../shared/ParamType'
import type {GenericParamDescription, ParamValues} from '../shared/Paramable'
import type {SequenceInterface} from '../sequences/SequenceInterface'

/** md
# Turtle Visualizer

[image should go here]

This visualizer interprets a sequence as instructions for a drawing machine,
with each entry determining what angle to turn before drawing the next
straight segment. It displays the resulting polygonal path.

## Parameters
**/

const vizName = 'Turtle'
const vizDescription =
    'Use a sequence to steer a virtual '
    + 'turtle that leaves a visible trail'

const paramDesc = {
    /** md
- domain: A comma-separated list of all of the values that may occur in the
sequence. (One way to ensure a small number of possible values is to use a
sequence that has been reduced with respect to some small modulus. But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: [0n, 1n, 2n, 3n, 4n] as bigint[],
        type: ParamType.BIGINT_ARRAY,
        displayName: 'Sequence Domain',
        required: true,
        description: '(comma-separated list of values)',
    },
    /** md
- range: a comma-separated list of numbers. These are turning angles,
corresponding positionally to the domain elements. Range and domain must
be the same length.
     **/
    range: {
        default: [30, 45, 60, 90, 120] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Angles',
        required: true,
        description: '(comma-separated list of values in degrees)',
    },
    /** md
- stepSize: a number. Gives the length of the segment drawn for each entry.
     **/
    stepSize: {
        default: 20,
        type: ParamType.INTEGER,
        displayName: 'Step Size',
        required: false,
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
    },
    /**
- strokeWeight: a number. Gives the width of the segment drawn for each entry.
     **/
    strokeWeight: {
        default: 5,
        type: ParamType.INTEGER,
        displayName: 'Stroke Width',
        required: false,
    },
    /**
- bgColor: The background color of the visualizer canvas
     **/
    bgColor: {
        default: '#666666',
        type: ParamType.COLOR,
        displayName: 'Background Color',
        required: true,
    },
    /**
- strokeColor: The color used for drawing the path.
     **/
    strokeColor: {
        default: '#ff0000',
        type: ParamType.COLOR,
        displayName: 'Stroke Color',
        required: true,
    },
} as const

// Turtle needs work
// Throwing the same error on previous Numberscope website
class Turtle extends P5Visualizer(paramDesc) {
    name = vizName
    description = vizDescription

    private rotMap = new Map<string, number>()

    private currentIndex = 0
    private orientation = 0
    private X = 0
    private Y = 0

    constructor(seq: SequenceInterface<GenericParamDescription>) {
        super(seq)
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.domain.length != params.range.length)
            status.addError(
                'Domain and range must have the same number of entries'
            )

        return status
    }

    setup() {
        super.setup()
        this.currentIndex = this.seq.first
        this.orientation = 0
        this.X = this.sketch.width / 2 + this.start.x
        this.Y = this.sketch.height / 2 + this.start.y

        for (let i = 0; i < this.domain.length; i++) {
            this.rotMap.set(
                this.domain[i].toString(),
                (Math.PI / 180) * this.range[i]
            )
        }

        this.sketch
            .background(this.bgColor)
            .stroke(this.strokeColor)
            .strokeWeight(this.strokeWeight)
            .frameRate(30)
    }

    draw() {
        const currElement = this.seq.getElement(this.currentIndex++)
        const angle = this.rotMap.get(currElement.toString())

        if (angle == undefined) {
            this.sketch.noLoop()
            return
        }

        const oldX = this.X
        const oldY = this.Y

        this.orientation = this.orientation + angle
        this.X += this.stepSize * Math.cos(this.orientation)
        this.Y += this.stepSize * Math.sin(this.orientation)

        this.sketch.line(oldX, oldY, this.X, this.Y)
        if (this.currentIndex > this.seq.last) this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    Turtle,
    vizName,
    vizDescription
)
