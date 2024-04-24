import p5 from 'p5' // we need the p5.Color type to declare top-level colors
import {P5Visualizer} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'

/** md
# Entries (p5 Template)

[<img
  src="../../assets/img/Entries/1729.png"
  width=700
  style="margin-left: 1em; margin-right: 0.5em"
/>](../../assets/img/Entries/1729.png)

This visualizer allows you to step back and forth through a sequence, showing
each entry as a written number.

_This visualizer is meant to be used as a template for new visualizers based on
the p5.js library. It includes explanatory comments and minimal examples of
required and commonly used features._
**/

class P5VisualizerTemplate extends P5Visualizer {
    // === visualizer name ===
    // appears in the visualizer list and bundle card titles

    static visualizationName = 'Entries (p5 Template)'

    // === parameters ===
    // top-level properties that the user can choose while creating the
    // visualizer bundle. if a parameter is meant to have a default value, we
    // conventionally use that as the initial value, so we can refer to it when
    // we set the default value below

    stepSize = 1

    /** md
## Parameters
    **/
    params = {
        /** md
- **Step size:** How far to step when the user presses an arrow key. _(Positive
integer.)_
         **/
        stepSize: {
            value: this.stepSize, // default value
            forceType: 'integer',
            displayName: 'Step size',
            required: true,
        },
    }

    // === internal properties ===
    // top-level properties that are set and updated while the visualizer is
    // running, beyond the user's direct control

    // navigation state. this property will be initialized during setup, but
    // TypeScript can't infer that, so we have to give a placeholder value
    index = 0

    // palette colors. these will also be initialized during setup, which is our
    // first chance to create colors. for now, we use `undefined` as a
    // placeholder value
    bgColor: p5.Color | undefined = undefined
    textColor: p5.Color | undefined = undefined

    checkParameters() {
        const status = super.checkParameters()

        // make sure the step size is positive
        if (this.params.stepSize.value <= 0) {
            status.isValid = false
            status.errors.push('Step size must be positive')
        }

        return status
    }

    setup() {
        // the base setup function includes the `createCanvas()` call that must
        // appear in every p5 setup function
        //
        //   https://p5js.org/reference/#/p5/createCanvas
        //
        super.setup()

        const sketch = this.sketch

        // initialize palette colors, chosen from the Numberscope site palette
        this.bgColor = sketch.color(206, 212, 218)
        this.textColor = sketch.color(128, 159, 255)
        const outlineColor = sketch.color(51, 51, 255)

        // set the stroke color and text alignment, which won't change from
        // frame to frame. each setting method returns a reference to the
        // sketch, so you can chain the methods as shown here
        sketch.stroke(outlineColor).textAlign(sketch.CENTER, sketch.CENTER)

        // start at the beginning of the sequence
        this.index = this.seq.first
    }

    // this is where you draw your visualization! look at the examples and the
    // p5 tutorials and reference to learn about what you can do
    //
    //   https://p5js.org/learn/
    //   https://p5js.org/reference/
    //
    // you have to implement this method, even if it does nothing. your
    // visualizer can't be loaded into Numberscope without it
    draw() {
        // accessing `this.sketch` triggers some consistency checks. by storing
        // its value as a local constant, we avoid redundant checks
        const sketch = this.sketch

        // scale and center the coordinate system; scale the text to fit the
        // canvas. calculations involving canvas dimensions need to be done
        // every frame, because the dimensions can change at any time
        const smallDim = Math.min(sketch.width, sketch.height)
        sketch
            .translate(0.5 * sketch.width, 0.5 * sketch.height)
            .textSize(0.2 * smallDim)

        // paint the background. for an animated visualizer, this is often done
        // as the first drawing step in each frame, wiping out the previous
        // frame and leaving a blank canvas to draw on
        sketch.background(this.bgColor as p5.Color)

        // print the current entry
        const element = this.seq.getElement(this.index)
        sketch.fill(this.textColor as p5.Color).text(element.toString(), 0, 0)

        // draw a progress bar. drawing methods can be chained, just like
        // setting methods
        const progress = 1 - 7 / (7 + Math.sqrt(this.index - this.seq.first))
        const barLength = 0.6 * smallDim
        sketch
            .fill(255, 128 + 128 * progress, 0)
            .translate(-0.5 * barLength, 0.2 * smallDim)
            .line(0, 0, barLength, 0)
            .circle(progress * barLength, 0, 0.02 * smallDim)

        // stop the animation loop
        sketch.noLoop()
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
    /** md
## Controls
- **Left and right arrow keys:** Step back and forth through the sequence.
    **/
    keyPressed() {
        const sketch = this.sketch

        // check which key was pressed, and respond accordingly
        //
        //   https://p5js.org/reference/#/p5/keyCode
        //
        const oldIndex = this.index
        if (sketch.keyCode === sketch.RIGHT_ARROW) {
            this.index += this.stepSize
        } else if (sketch.keyCode === sketch.LEFT_ARROW) {
            this.index -= this.stepSize
        }

        // make sure we haven't stepped out of bounds
        if (this.index < this.seq.first || this.index > this.seq.last) {
            this.index = oldIndex
        } else {
            // re-start the animation loop to print the new entry
            sketch.loop()
        }
    }
}

export const exportModule = new VisualizerExportModule(
    P5VisualizerTemplate, // visualizer class
    'Step through entries one at a time' // short description
)
