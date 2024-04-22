import {P5Visualizer} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'

/** md
# p5 Visualizer Template

[image should go here]

This template can be used as a starting point for designing a p5 visualizer.

## Parameters
**/

class P5VisualizerTemplate extends P5Visualizer {
    name = 'p5 Visualizer Template' // the name shown on the visualizer menu

    // external parameters, which the user can choose while creating the
    // visualizer bundle
    baseIndex = 0 // the default value of this parameter is zero
    params = {
        /** md
- baseIndex: Where in the sequence to start browsing.
         **/
        baseIndex: {
            value: this.baseIndex,
            displayName: 'Base index',
            required: true,
        },
    }

    // internal parameters. the value of `index` will always be overwritten in
    // `setup`, but TypeScript can't infer that, so we have to give `index` an
    // initial value
    index = 0
    flash = 0

    checkParameters() {
        const status = super.checkParameters()

        // make sure the base index doesn't precede the first index
        if (this.params.baseIndex.value < this.seq.first) {
            status.isValid = false
            status.errors.push(
                "The base index can't precede the"
                    + ` first index, ${this.seq.first}`
            )
        }

        return status
    }

    setup() {
        // run the setup process for a general p5 visualizer, and make sure the
        // p5 sketch has been successfully created. most p5 visualizers should
        // do this
        super.setup()
        if (!this.sketch) {
            throw (
                'Attempt to show p5 Template Visualizer'
                + ' before injecting into element'
            )
        }

        // start viewing the sequence at the base index, which the user chose
        // when creating the visualizer
        this.index = this.baseIndex

        this.sketch.stroke(51, 51, 255)
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER)
        /*this.sketch.fill(128, 159, 255)*/
    }

    draw() {
        super.draw()

        // for convenience, give the sketch a shorter name
        const sketch = this.sketch

        // scale and center the coordinate system. this needs to be done every
        // frame in case the canvas dimensions change
        sketch.translate(0.5 * sketch.width, 0.5 * sketch.height)
        const smallDim = Math.min(sketch.width, sketch.height)
        sketch.textSize(0.2 * smallDim)

        // paint the background. this is often done as the first drawing step in
        // each frame, wiping out the previous frame and leaving a blank canvas
        // to draw on
        sketch.background(206, 212, 218)

        // fade the white flash that shows the index has changed, and set the
        // text fill color accordingly
        this.flash *= Math.exp(-0.01 * sketch.deltaTime)
        const textFill = sketch.lerpColor(
            sketch.color(128, 159, 255),
            sketch.color(255),
            this.flash
        )
        sketch.fill(textFill)

        // print the value of the current element
        const element = this.seq.getElement(this.index)
        sketch.text(element.toString(), 0, 0)
    }

    // when the user presses a key while the sketch is in focus, this function
    // is called to handle the input
    keyPressed() {
        // for convenience, give the sketch a shorter name
        const sketch = this.sketch

        const oldIndex = this.index
        if (sketch.keyCode === sketch.DOWN_ARROW) {
            this.index = this.baseIndex
        } else if (sketch.keyCode === sketch.RIGHT_ARROW) {
            this.index += 1
        } else if (
            sketch.keyCode === sketch.LEFT_ARROW
            && this.index > this.seq.first
        ) {
            this.index -= 1
        }

        // show a flash when the index changes
        if (this.index !== oldIndex) {
            this.flash = 1
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'p5 Visualizer Template',
    P5VisualizerTemplate,
    'A template for p5 visualizers'
)
