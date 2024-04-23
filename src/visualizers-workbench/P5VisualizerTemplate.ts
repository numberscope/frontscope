import {P5Visualizer} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'

/** md
# p5 Visualizer Template

[image should go here]

This template can be used as a starting point for designing a p5 visualizer. You
can use it to step back and forth through a sequence, showing each element as a
written number.

## Parameters

- Step size

## Interactions

- Use the left and right arrow keys to step
**/

class P5VisualizerTemplate extends P5Visualizer {
    // the name that appears in bundle card titles
    static visualizationName = 'p5 Visualizer Template'

    // external parameters, which the user can choose while creating the
    // visualizer bundle
    stepSize = 1 // the default value of this parameter is zero
    params = {
        /** md
- stepSize: How far to step when the user presses a left or right arrow key.
         **/
        stepSize: {
            value: this.stepSize,
            displayName: 'Step size',
            required: true,
        },
    }

    // internal parameters. the value of `index` will always be overwritten in
    // `inhabit()`, but TypeScript can't infer that, so we have to give `index`
    // an initial value
    index = 0
    justStepped = false
    flash = 0

    checkParameters() {
        const status = super.checkParameters()

        // make sure the step size is positive
        if (this.params.stepSize.value <= 0) {
            status.isValid = false
            status.errors.push('Step size must be positive')
        }

        return status
    }

    inhabit(element: HTMLElement): void {
        // do the behind-the-scenes work of managing p5 canvases. this work is
        // finicky, and your visualizer won't work unless it's done properly, so
        // you should leave it to the superclass unless you have a very
        // compelling reason to do it yourself
        super.inhabit(element)
    }

    setup() {
        // the base setup function includes the `createCanvas()` call that must
        // appear in every p5 setup function
        //
        //   https://p5js.org/reference/#/p5/createCanvas
        //
        super.setup()

        // accessing `this.sketch` triggers some consistency checks, so it's
        // most parsimonious to access it at most once per function call,
        // storing its value as a local constant for future reference
        const sketch = this.sketch

        // set the stroke color and text alignment, which won't change from
        // frame to frame
        sketch.stroke(51, 51, 255)
        sketch.textAlign(sketch.CENTER, sketch.CENTER)

        // start at the beginning of the sequence
        this.index = this.seq.first
    }

    draw() {
        // accessing `this.sketch` triggers some consistency checks, so it's
        // most parsimonious to access it at most once per function call,
        // storing its value as a local constant for future reference
        const sketch = this.sketch

        // scale and center the coordinate system. calculations involving the
        // canvas dimensions need to be done every frame, because the dimensions
        // can change at any time
        sketch.translate(0.5 * sketch.width, 0.5 * sketch.height)
        const smallDim = Math.min(sketch.width, sketch.height)
        sketch.textSize(0.2 * smallDim)

        // paint the background. for an animated visualizer, this is often done
        // as the first drawing step in each frame, wiping out the previous
        // frame and leaving a blank canvas to draw on
        sketch.background(206, 212, 218)

        // fade the white flash that shows the index has changed, and set the
        // text fill color accordingly
        if (this.justStepped) {
            this.justStepped = false
        } else {
            this.flash *= Math.exp(-0.01 * sketch.deltaTime)
        }
        if (this.flash < 0.001) {
            // stop the animation when the flash has faded
            this.flash = 0
            sketch.noLoop()
        }
        const textFill = sketch.lerpColor(
            sketch.color(128, 159, 255),
            sketch.color(255),
            this.flash
        )
        sketch.fill(textFill)

        // print the current element
        const element = this.seq.getElement(this.index)
        sketch.text(element.toString(), 0, 0)
        console.log('drawn')
    }

    // when the user presses a key while the sketch is in focus, this function
    // is called to handle the input
    //
    //   https://p5js.org/reference/#/p5/keyPressed
    //
    // there are similar functions for other input events
    //
    //   https://p5js.org/reference/#group-Events
    //
    keyPressed() {
        // accessing `this.sketch` triggers some consistency checks, so it's
        // most parsimonious to access it at most once per function call,
        // storing its value as a local constant for future reference
        const sketch = this.sketch

        const oldIndex = this.index
        if (
            sketch.keyCode === sketch.RIGHT_ARROW
            && this.index < this.seq.last
        ) {
            this.index += this.stepSize
        } else if (
            sketch.keyCode === sketch.LEFT_ARROW
            && this.index > this.seq.first
        ) {
            this.index -= this.stepSize
        }

        // show a flash when the index changes. the `loop()` function re-starts
        // the sketch's animation loop
        if (this.index !== oldIndex) {
            this.justStepped = true
            this.flash = 1
            sketch.loop()
        }
    }
}

export const exportModule = new VisualizerExportModule(
    P5VisualizerTemplate, // visualizer class
    'A template for p5 visualizers' // short description
)
