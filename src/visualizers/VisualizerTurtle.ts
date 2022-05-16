import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import {
    VisualizerInterface,
    VisualizerExportModule,
} from './VisualizerInterface'
import {SequenceInterface} from '../sequences/SequenceInterface'

// Turtle needs work
// Throwing the same error on previous Numberscope website
class VisualizerTurtle
    extends VisualizerDefault
    implements VisualizerInterface
{
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
        domain: {
            value: this.domain,
            displayName: 'Sequence Domain',
            required: true,
            description: '(comma-separated list of values)',
        },
        range: {
            value: this.range,
            displayName: 'Angles',
            required: true,
            description: '(comma-separated list of values in degrees)',
        },
        stepSize: {
            value: this.stepSize,
            forceType: 'integer',
            displayName: 'Step Size',
            required: true,
        },
        start: {
            value: this.start,
            displayName: 'Start',
            required: true,
            description: 'coordinates of the point where drawing will start',
        },
        strokeWeight: {
            value: this.strokeWeight,
            forceType: 'integer',
            displayName: 'Stroke Width',
            required: true,
        },
        bgColor: {
            value: this.bgColor,
            forceType: 'color',
            displayName: 'Background Color',
            required: false,
        },
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

    initialize(sketch: p5, seq: SequenceInterface) {
        this.sketch = sketch
        this.seq = seq

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

        this.ready = true
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

export const exportModule = new VisualizerExportModule(
    'Turtle',
    VisualizerTurtle,
    ''
)
