import p5 from 'p5'
import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {ParamType} from '../shared/ParamType'

/** md
# Turtle Visualizer

[image should go here]

This visualizer interprets a sequence as instructions for a drawing machine,
with each entry determining what angle to turn before drawing the next
straight segment. It displays the resulting polygonal path.

## Parameters
**/

// Turtle needs work
// Throwing the same error on previous Numberscope website
class Turtle extends P5Visualizer {
    name = 'Turtle'
    description =
        'Use a sequence to steer a virtual '
        + 'turtle that leaves a visible trail'

    private rotMap = new Map<string, number>()
    domain = [0n, 1n, 2n, 3n, 4n]
    range = [30, 45, 60, 90, 120]
    stepSize = 20
    start = new p5.Vector()
    strokeWeight = 5
    bgColor = '#666666'
    strokeColor = '#ff0000'

    params = {
        /** md
- domain: A comma-separated list of all of the values that may occur in the
    sequence. (One way to ensure a small number of possible values is to use a
    sequence that has been reduced with respect to some small modulus. But
    some sequences, like A014577 "The regular paper-folding sequence", naturally
    have a small domain.)
         **/
        domain: {
            value: this.domain,
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
            value: this.range,
            type: ParamType.NUMBER_ARRAY,
            displayName: 'Angles',
            required: true,
            description: '(comma-separated list of values in degrees)',
        },
        /** md
- stepSize: a number. Gives the length of the segment drawn for each entry.
         **/
        stepSize: {
            value: this.stepSize,
            type: ParamType.INTEGER,
            displayName: 'Step Size',
            required: true,
        },
        /**
- start: x,y coordinates of the point where drawing will start
         **/
        start: {
            value: this.start,
            type: ParamType.VECTOR,
            displayName: 'Start',
            required: true,
            description: 'coordinates of the point where drawing will start',
        },
        /**
- strokeWeight: a number. Gives the width of the segment drawn for each entry.
         **/
        strokeWeight: {
            value: this.strokeWeight,
            type: ParamType.INTEGER,
            displayName: 'Stroke Width',
            required: true,
        },
        /**
- bgColor: The background color of the visualizer canvas
         **/
        bgColor: {
            value: this.bgColor,
            type: ParamType.COLOR,
            displayName: 'Background Color',
            required: false,
        },
        /**
- strokeColor: The color used for drawing the path.
         **/
        strokeColor: {
            value: this.strokeColor,
            type: ParamType.COLOR,
            displayName: 'Stroke Color',
            required: false,
        },
    }

    private currentIndex = 0
    private orientation = 0
    private X = 0
    private Y = 0

    checkParameters(params: {[key: string]: unknown}) {
        const status = super.checkParameters(params)

        if (
            (params.domain as bigint[]).length
            != (params.range as number[]).length
        )
            status.addError(
                'Domain and range must have the same number of entries'
            )

        return status
    }

    setup() {
        super.setup()
        this.currentIndex = this.seq.first
        this.orientation = 0
        this.X = this.sketch.width / 2
        this.Y = this.sketch.height / 2

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

export const exportModule = new VisualizerExportModule(Turtle)
