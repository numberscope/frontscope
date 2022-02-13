import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import {
    VisualizerInterface,
    VisualizerExportModule,
} from './VisualizerInterface'
import {SequenceInterface} from '@/sequences/SequenceInterface'

// Turtle needs work
// Throwing the same error on previous numberscope website
class VisualizerTurtle
    extends VisualizerDefault
    implements VisualizerInterface
{
    name = 'Turtle'
    private rotMap = new Map<string, number>()
    domain = {
        value: [0n, 1n, 2n, 3n, 4n],
        displayName: 'Sequence Domain',
        required: true,
        description: '(comma-separated list of values)',
    }
    range = {
        value: [30, 45, 60, 90, 120],
        displayName: 'Angles',
        required: true,
        description: '(comma-separated list of values in degrees)',
    }
    stepSize = {value: 20, displayName: 'Step Size', required: true}
    start = {
        value: new p5.Vector(),
        displayName: 'Start',
        required: true,
        description: 'coordinates of the point where drawing will start',
    }
    strokeWeight = {value: 5, displayName: 'Stroke Width', required: true}
    bgColor = {
        value: '#666666',
        forceType: 'color',
        displayName: 'Background Color',
        required: false,
    }
    strokeColor = {
        value: '#ff0000',
        forceType: 'color',
        displayName: 'Stroke Color',
        required: false,
    }

    params = {
        domain: this.domain,
        range: this.range,
        stepSize: this.stepSize,
        start: this.start,
        strokeWeight: this.strokeWeight,
        bgColor: this.bgColor,
        strokeColor: this.strokeColor,
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

        console.log('initializing turtle')
        for (let i = 0; i < this.domain.value.length; i++) {
            this.rotMap.set(
                this.domain.value[i].toString(),
                (Math.PI / 180) * this.range.value[i]
            )
        }

        this.ready = true
    }

    checkParameters() {
        const status = super.checkParameters()
        if (this.domain.value.length != this.range.value.length) {
            status.isValid = false
            status.errors.push(
                'Domain and range must have the same number of entries'
            )
        }
        console.log('Hoho', this.domain.value.toString())
        return status
    }

    setup() {
        this.X = this.sketch.width / 2
        this.Y = this.sketch.height / 2
        this.sketch.background(this.bgColor.value)
        this.sketch.stroke(this.strokeColor.value)
        this.sketch.strokeWeight(this.strokeWeight.value)
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
        this.X += this.stepSize.value * Math.cos(this.orientation)
        this.Y += this.stepSize.value * Math.sin(this.orientation)

        this.sketch.line(oldX, oldY, this.X, this.Y)
        if (this.currentIndex > this.seq.last) this.sketch.noLoop()
    }
}

export const exportModule = new VisualizerExportModule(
    'Turtle',
    VisualizerTurtle,
    ''
)
