import p5 from 'p5'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerP5} from './VisualizerP5'

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
class Turtle extends VisualizerP5 implements VisualizerInterface {
    name = 'Turtle'
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
            displayName: 'Angles',
            required: true,
            description: '(comma-separated list of values in degrees)',
        },
        /** md
- stepSize: a number. Gives the length of the segment drawn for each entry.
         **/
        stepSize: {
            value: this.stepSize,
            forceType: 'integer',
            displayName: 'Step Size',
            required: true,
        },
        /**
- start: x,y coordinates of the point where drawing will start
         **/
        start: {
            value: this.start,
            displayName: 'Start',
            required: true,
            description: 'coordinates of the point where drawing will start',
        },
        /**
- strokeWeight: a number. Gives the width of the segment drawn for each entry.
         **/
        strokeWeight: {
            value: this.strokeWeight,
            forceType: 'integer',
            displayName: 'Stroke Width',
            required: true,
        },
        /**
- bgColor: The background color of the visualizer canvas
         **/
        bgColor: {
            value: this.bgColor,
            forceType: 'color',
            displayName: 'Background Color',
            required: false,
        },
        /**
- strokeColor: The color used for drawing the path.
         **/
        strokeColor: {
            value: this.strokeColor,
            forceType: 'color',
            displayName: 'Stroke Color',
            required: false,
        },
    }

    private currentIndex = 0
    private orientation = 0
    private X = 0
    private Y = 0

    initialize(
        canvasContainer: HTMLElement,
        seq: SequenceInterface,
        maxWidth: number,
        maxHeight: number
    ) {
        super.initialize(canvasContainer, seq, maxWidth, maxHeight)

        this.currentIndex = seq.first
        this.orientation = 0
        this.X = 0
        this.Y = 0

        for (let i = 0; i < this.domain.length; i++) {
            this.rotMap.set(
                this.domain[i].toString(),
                (Math.PI / 180) * this.range[i]
            )
        }
    }

    checkParameters() {
        const status = super.checkParameters()

        if (
            this.params.domain.value.length != this.params.range.value.length
        ) {
            status.isValid = false
            status.errors.push(
                'Domain and range must have the same number of entries'
            )
        }

        return status
    }

    setup() {
        this.X = this.sketch.width / 2
        this.Y = this.sketch.height / 2
        this.sketch.background(this.bgColor)
        this.sketch.stroke(this.strokeColor)
        this.sketch.strokeWeight(this.strokeWeight)
        this.sketch.frameRate(30)
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

export const exportModule = new VisualizerExportModule('Turtle', Turtle, '')
