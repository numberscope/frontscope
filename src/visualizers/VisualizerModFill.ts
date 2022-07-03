import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerDefault} from '../visualizers/VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'

class VizModFill extends VisualizerDefault implements VisualizerInterface {
    name = 'Mod Fill'
    modDimension = 10n
    params = {
        modDimension: {
            value: this.modDimension,
            displayName: 'Mod dimension',
            required: true,
        },
    }

    rectWidth = 0
    rectHeight = 0
    i = 0
    ready = false

    checkParameters() {
        const status = super.checkParameters()

        if (this.params.modDimension.value <= 0n) {
            status.isValid = false
            status.errors.push('Mod dimension must be positive')
        }

        return status
    }

    drawNew(num: number, seq: SequenceInterface) {
        const black = this.sketch.color(0)
        this.sketch.fill(black)
        for (let mod = 1n; mod <= this.modDimension; mod++) {
            const s = seq.getElement(num)
            const x = Number(mod - 1n) * this.rectWidth
            const y =
                this.sketch.height - Number((s % mod) + 1n) * this.rectHeight
            this.sketch.rect(x, y, this.rectWidth, this.rectHeight)
        }
    }

    setup() {
        this.rectWidth = this.sketch.width / Number(this.modDimension)
        this.rectHeight = this.sketch.height / Number(this.modDimension)
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
