import p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import {
    VisualizerInterface,
    VisualizerExportModule,
} from './VisualizerInterface'

// CAUTION: This is unstable with some sequences
// Using it may crash your browser
class VizShiftCompare
    extends VisualizerDefault
    implements VisualizerInterface
{
    name = 'Shift Compare'
    private img: p5.Image = new p5.Image()
    mod = {
        value: 2n,
        displayName: 'Modulo',
        required: true,
        description: 'Modulus used to compare sequence elements',
    }
    params = {mod: this.mod}

    checkParameters() {
        const status = super.checkParameters()

        if (this.mod.value <= 0n) {
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
        console.log(this.sketch.height, this.sketch.width)
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
        console.log('drawing')
        console.log(this.img.pixels.length)

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
            this.mod.value += 1n
            this.sketch.key = ''
            console.log('UP PRESSED, NEW MOD: ' + this.mod.value.toString())
        } else if (this.sketch.key == 'ArrowDown') {
            this.mod.value -= 1n
            this.sketch.key = ''
            console.log('DOWN PRESSED, NEW MOD: ' + this.mod.value.toString())
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
                        const index
                            = 4
                            * ((y * d + j) * this.sketch.width * d
                                + (x * d + i))
                        console.log('x,y: ' + xEl + ', ' + yEl)
                        if (xEl % this.mod.value == yEl % this.mod.value) {
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
