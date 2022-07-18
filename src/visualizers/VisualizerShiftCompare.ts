import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'

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

// CAUTION: This is unstable with some sequences
// Using it may crash your browser
class VizShiftCompare
    extends VisualizerDefault
    implements VisualizerInterface
{
    name = 'Shift Compare'
    private img: p5.Image = new p5.Image(1, 1) // just a dummy
    mod = 2n
    params = {
        /** md
- mod: The modulus to use when comparing entries.
         **/
        mod: {
            value: this.mod,
            displayName: 'Modulo',
            required: true,
            description: 'Modulus used to compare sequence elements',
        },
    }

    checkParameters() {
        const status = super.checkParameters()

        if (this.params.mod.value <= 0n) {
            status.isValid = false
            status.errors.push('Modulo must be positive')
        }

        return status
    }

    setup() {
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
        // Ensure mouse coordinates are sane.
        // Mouse coordinates look they're floats by default.
        const d = this.sketch.pixelDensity()
        const mx = this.clip(
            Math.round(this.sketch.mouseX),
            0,
            this.sketch.width
        )
        const my = this.clip(
            Math.round(this.sketch.mouseY),
            0,
            this.sketch.height
        )
        if (this.sketch.key == 'ArrowUp') {
            this.mod += 1n
            this.sketch.key = ''
            this.refreshParams()
        } else if (this.sketch.key == 'ArrowDown') {
            this.mod -= 1n
            this.sketch.key = ''
            this.refreshParams()
        } else if (this.sketch.key == 'ArrowRight') {
            console.log(console.log('MX: ' + mx + ' MY: ' + my))
        }
        // since settings.mod can be any of string | number | bool,
        // assign it here explictly to a number, to avoid type errors
        const xLim = Math.min(this.sketch.width - 1, this.seq.last)
        const yLim = Math.min(this.sketch.height - 1, this.seq.last)

        // Write to image, then to screen for speed.
        for (let x = this.seq.first; x <= xLim; x++) {
            const xEl = this.seq.getElement(x)
            for (let y = this.seq.first; y <= yLim; y++) {
                const yEl = this.seq.getElement(y)
                for (let i = 0; i < d; i++) {
                    for (let j = 0; j < d; j++) {
                        const index =
                            ((y * d + j) * this.sketch.width * d
                                + (x * d + i))
                            * 4
                        if (xEl % this.mod == yEl % this.mod) {
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

        this.sketch.image(this.img, 0, 0) // Display image to screen.
    }
}

export const exportModule = new VisualizerExportModule(
    'Shift Compare',
    VizShiftCompare,
    ''
)
