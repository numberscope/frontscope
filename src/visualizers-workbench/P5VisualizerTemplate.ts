// === p5 Visualizer Template ===
// This file can be used as a template for writing a new p5 visualizer. It is
// also a simple working Visualizer in its own right. It includes comments,
// formatted like this one, that explain what each part of a Visualizer
// is and does. You don't need to include these comments in your own
// Visualizer---but you should include ordinary comments, of course! You should
// also include the documentation comments, which are formatted like this:
//
//   /** md
//   ...
//   **/
//
// These comments get compiled into the Visualizer's user guide page

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
    // === Visualizer name ===
    // Appears in the visualizer list and bundle card titles
    static visualizationName = 'Entries (p5 Template)'

    // === Parameters ===
    // Top-level properties that the user can choose while creating the
    // visualizer bundle. If a parameter is meant to have a default value, we
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
            value: this.stepSize, // === Default value ===
            forceType: 'integer',
            displayName: 'Step size',
            required: true,
        },
    }

    // === Internal properties ===
    // Top-level properties that are set and updated while the visualizer is
    // running, beyond the user's direct control. All of these properties will
    // be initialized during setup, but TypeScript can't infer that, so we have
    // to give them placeholder values. We use `undefined` as a placeholder for
    // colors because the function that creates color objects won't be available
    // until steup

    // navigation state
    index = 0

    // palette colors
    bgColor: p5.Color | undefined = undefined
    textColor: p5.Color | undefined = undefined
    outlineColor: p5.Color | undefined = undefined

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
        // === Default setup ===
        // The base class setup function includes the `createCanvas()` call that
        // must appear in every p5 setup function
        //
        //   https://p5js.org/reference/#/p5/createCanvas
        //
        super.setup()

        const sketch = this.sketch

        // initialize palette colors, chosen from the Numberscope site palette
        this.bgColor = sketch.color(206, 212, 218)
        this.textColor = sketch.color(128, 159, 255)
        this.outlineColor = sketch.color(51, 51, 255)

        // set the text alignment, which won't change from frame to frame
        sketch.textAlign(sketch.CENTER, sketch.CENTER)

        // start at the beginning of the sequence
        this.index = this.seq.first
    }

    // === Draw here ===
    // This is where you draw your visualization! Look at the examples and the
    // p5 tutorials and reference to learn about what you can do
    //
    //   https://p5js.org/learn/
    //   https://p5js.org/reference/
    //
    // You have to implement this method, even if it does nothing. Your
    // visualizer can't be loaded into Numberscope without it
    draw() {
        // === Local sketch constant ===
        // Accessing `this.sketch` triggers some consistency checks. By storing
        // its value as a local constant, we avoid redundant checks
        const sketch = this.sketch

        // === Scaling and centering ===
        // Calculations involving canvas dimensions need to be done every frame,
        // because the dimensions can change at any time. For this visualizer,
        // we scale and center the coordinate system, and we scale the text to
        // fit the canvas.
        const smallDim = Math.min(sketch.width, sketch.height)
        sketch
            .translate(0.5 * sketch.width, 0.5 * sketch.height)
            .textSize(0.2 * smallDim)

        // === Background painting ===
        // For an animated visualizer, painting the background is often the
        // first drawing step in each frame. It wipes out the previous frame,
        // leaving a blank canvas to draw on
        sketch.background(this.bgColor as p5.Color)

        // === Chaining operations ===
        // Each sketch operation returns a reference to the sketch, so you can
        // chain calls like we do above and below

        // print the current entry
        const element = this.seq.getElement(this.index)
        sketch
            .fill(this.textColor as p5.Color)
            .stroke(this.outlineColor as p5.Color)
            .text(element.toString(), 0, 0)

        // draw a progress bar
        const barScale = 7
        const sqrtDist = Math.sqrt(this.index - this.seq.first)
        const progress = 1 - barScale / (barScale + sqrtDist)
        const barLen = 0.6 * smallDim
        const barWidth = 0.02 * smallDim
        sketch
            .translate(-0.5 * barLen, 0.2 * smallDim)
            .noStroke()
            .fill(255, 128 + 128 * progress, 0)
            .rect(0, 0, progress * barLen, barWidth)
            .fill(this.textColor as p5.Color)
            .rect(progress * barLen, 0, (1 - progress) * barLen, barWidth)
            .noFill()
            .stroke(this.outlineColor as p5.Color)
            .rect(0, 0, barLen, barWidth)

        // Stop the animation loop
        sketch.noLoop()
    }

    // === Event handling ===
    // When the user presses a key while the sketch is in focus, this function
    // is called to handle the input
    //
    //   https://p5js.org/reference/#/p5/keyPressed
    //
    // There are similar functions for other input events
    //
    //   https://p5js.org/reference/#group-Events
    //
    /** md
## Controls
- **Left and right arrow keys:** Step back and forth through the sequence.
    **/
    keyPressed() {
        const sketch = this.sketch

        // === Key identification ===
        // Check which key was pressed, and respond accordingly
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
            // restart the animation loop to print the new entry
            sketch.loop()
        }
    }
}

// === Export module ===
// Putting this at the end of the source file makes it easy for other people
// to find. Put the visualizer class and a short description string into the
// export module constructor
export const exportModule = new VisualizerExportModule(
    P5VisualizerTemplate,
    'Step through entries one at a time'
)
