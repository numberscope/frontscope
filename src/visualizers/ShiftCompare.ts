import p5 from 'p5'
import {modulo} from '../shared/math'
import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import {ParamType} from '../shared/ParamType'
import type {GenericParamDescription, ParamValues} from '../shared/Paramable'
import type {SequenceInterface} from '../sequences/SequenceInterface'

/** md
# Shift Compare Visualizer

[image should go here]

This visualizer creates an image whose width and height are the number of
entries in the sequence or the dimensions of the visualizer canvas, whichever
is smaller. Each pixel of the image is colored white if using its coordinates
as indices into the sequence, the two entries are congruent (in the given
modulus). The pixel is colored black otherwise.

## Parameters
**/

const vizName = 'Shift Compare'
const vizDescription =
    'A grid showing pairwise congruence '
    + 'of sequence entries, to some modulus'

const paramDesc = {
    /** md
- mod: The modulus to use when comparing entries.
     **/
    mod: {
        default: 2n,
        type: ParamType.BIGINT,
        displayName: 'Modulo',
        required: true,
        description: 'Modulus used to compare sequence elements',
    },
} as const

// CAUTION: This is unstable with some sequences
// Using it may crash your browser
class ShiftCompare extends P5Visualizer(paramDesc) {
    name = vizName
    description = vizDescription

    private img: p5.Image = new p5.Image(1, 1) // just a dummy
    mod = 2n

    constructor(seq: SequenceInterface<GenericParamDescription>) {
        super(seq)
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (params.mod <= 0n) status.addError('Modulo must be positive')

        return status
    }

    setup() {
        super.setup()
        this.img = this.sketch.createImage(
            this.sketch.width,
            this.sketch.height
        )
        this.img.loadPixels() // Enables pixel-level editing.
    }

    clip(a: number, min: number, max: number) {
        if (a < min) {
            return min
        } else if (a > max) {
            return max
        }
        return a
    }

    //This will be called everytime to draw
    draw() {
        const sketch = this.sketch
        // Ensure mouse coordinates are sane.
        // Mouse coordinates look they're floats by default.
        const d = sketch.pixelDensity()
        if (sketch.key == 'ArrowUp') {
            this.mod += 1n
            sketch.key = ''
            this.refreshParams()
        } else if (sketch.key == 'ArrowDown') {
            this.mod -= 1n
            sketch.key = ''
            this.refreshParams()
        }
        // since settings.mod can be any of string | number | bool,
        // assign it here explictly to a number, to avoid type errors
        const xLim = Math.min(sketch.width - 1, this.seq.last)
        const yLim = Math.min(sketch.height - 1, this.seq.last)

        // Write to image, then to screen for speed.
        for (let x = this.seq.first; x <= xLim; x++) {
            const xResidue = modulo(this.seq.getElement(x), this.mod)
            for (let y = this.seq.first; y <= yLim; y++) {
                const yResidue = modulo(this.seq.getElement(y), this.mod)
                for (let i = 0; i < d; i++) {
                    for (let j = 0; j < d; j++) {
                        const index =
                            ((y * d + j) * sketch.width * d + (x * d + i)) * 4
                        if (xResidue == yResidue) {
                            this.img.pixels[index] = 255
                            this.img.pixels[index + 1] = 255
                            this.img.pixels[index + 2] = 255
                            this.img.pixels[index + 3] = 255
                        } else {
                            this.img.pixels[index] = 0
                            this.img.pixels[index + 1] = 0
                            this.img.pixels[index + 2] = 0
                            this.img.pixels[index + 3] = 255
                        }
                    }
                }
            }
        }

        this.img.updatePixels() // Copies our edited pixels to the image.

        sketch.image(this.img, 0, 0) // Display image to screen.
    }
}

export const exportModule = new VisualizerExportModule(
    ShiftCompare,
    vizName,
    vizDescription
)
