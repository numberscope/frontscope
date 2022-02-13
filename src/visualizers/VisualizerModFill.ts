import {SequenceInterface} from '@/sequences/SequenceInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {
    VisualizerInterface,
    VisualizerExportModule,
} from '@/visualizers/VisualizerInterface'
import p5 from 'p5'

class VizModFill extends VisualizerDefault implements VisualizerInterface {
    name = 'Mod Fill'
    modDimension = {value: 10n, displayName: 'Mod dimension', required: true}
    params = {modDimension: this.modDimension}
    rectWidth = 0
    rectHeight = 0
    i = 0
    ready = false

    initialize(sketch: p5, seq: SequenceInterface) {
        this.sketch = sketch
        this.seq = seq

        this.ready = true
    }

    checkParameters() {
        const status = super.checkParameters()

        if (this.modDimension.value <= 0n) {
            status.isValid = false
            status.errors.push('Mod dimension must be positive')
        }

        return status
    }

    drawNew(num: number, seq: SequenceInterface) {
        const black = this.sketch.color(0)
        this.sketch.fill(black)
        for (let mod = 1n; mod <= this.modDimension.value; mod++) {
            const s = seq.getElement(num)
            const x = Number(mod - 1n) * this.rectWidth
            const y
                = this.sketch.height - Number((s % mod) + 1n) * this.rectHeight
            this.sketch.rect(x, y, this.rectWidth, this.rectHeight)
        }
    }

    setup() {
        const modDimension = Number(this.modDimension.value)
        this.rectWidth = this.sketch.width / modDimension
        this.rectHeight = this.sketch.height / modDimension
        this.sketch.noStroke()
        this.i = this.seq.first
    }

    draw() {
        this.drawNew(this.i, this.seq)
        this.i++
        if (this.i == 1000 || this.i > this.seq.last) {
            this.sketch.noLoop()
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Mod Fill',
    VizModFill,
    ''
)
