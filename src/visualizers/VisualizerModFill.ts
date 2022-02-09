import {SequenceInterface} from '@/sequences/SequenceInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {
    VisualizerInterface,
    VisualizerParamsSchema,
    VisualizerSettings,
    VisualizerExportModule,
} from '@/visualizers/VisualizerInterface'
import {ParamType} from '@/shared/ParamType'
import p5 from 'p5'
import {ValidationStatus} from '@/shared/ValidationStatus'
//An example module

class VizModFill extends VisualizerDefault implements VisualizerInterface {
    name = 'Mod Fill'
    settings: VisualizerSettings = {}
    rectWidth = 0
    rectHeight = 0
    i = 0
    ready = false

    constructor() {
        super()
        const modDimensionScheme = new VisualizerParamsSchema()
        modDimensionScheme.name = 'modDimension'
        modDimensionScheme.displayName = 'Mod dimension'
        modDimensionScheme.type = ParamType.number
        modDimensionScheme.description = ''
        modDimensionScheme.required = true

        this.params.push(modDimensionScheme)
        this.i = 0
    }

    initialize(sketch: p5, seq: SequenceInterface) {
        this.sketch = sketch
        this.seq = seq

        this.ready = true
    }

    validate() {
        this.assignParams()
        if (this.settings.modDimension > 0) return new ValidationStatus(true)
        else if (this.settings.modDimension <= 0)
            return new ValidationStatus(false, [
                'Mod dimension must be positive',
            ])
        else
            return new ValidationStatus(false, ['Please set a mod dimension'])
    }

    drawNew(num: number, seq: SequenceInterface) {
        const black = this.sketch.color(0)
        this.sketch.fill(black)
        for (let mod = 1n; mod <= BigInt(this.settings.modDimension); mod++) {
            const s = seq.getElement(num)
            const x = Number(mod - 1n) * this.rectWidth
            const y
                = this.sketch.height - Number((s % mod) + 1n) * this.rectHeight
            this.sketch.rect(x, y, this.rectWidth, this.rectHeight)
        }
    }

    setup() {
        const modDimension = Number(this.settings.modDimension)
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
