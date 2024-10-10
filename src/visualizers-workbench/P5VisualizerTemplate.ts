// === p5 Visualizer Template ===
// This file can be used as a template for writing a new p5 visualizer. It is
// also a simple working Visualizer in its own right. It includes comments,
// formatted like this one, that explain what each part of a Visualizer
// is and does. You don't need to include these comments in your own
// Visualizer --- but you should include ordinary comments, of course! You
// should also include the documentation comments, which are formatted like
// this:
//
//   /** md
//   ...
//   **/
//
// These comments get compiled into the Visualizer's user guide page.

// === Import statements ===
// These import functionality that is used to implement aspects of
// the visualizer.  See the referenced files for
// further information on what these each do.
//
// Standard visualizer class and export:
// INVALID_COLOR allows for initializing p5 color variables
import {P5Visualizer, INVALID_COLOR} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '../visualizers/VisualizerInterface'
import type {ViewSize} from '../visualizers/VisualizerInterface'

// Standard parameter functionality:
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
// ValidationStatus allows for validation checking in parameters
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Entries (p5 Template)

[<img
  src="../../assets/img/Entries/1729.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Entries/1729.png)

This visualizer allows you to step back and forth through a sequence, showing
each entry as a written number.

_This visualizer is meant to be used as a template for new visualizers based on
the p5.js library. It includes explanatory comments and minimal examples of
required and commonly used features._

## Parameters
**/

// === User-modifiable parameters ===
const paramDesc = {
    // Will be interpreted by the UI and presented to the user
    // in the form of controls such as fields, drop-downs and
    // color-pickers.  More information can be found in
    // src/shared/Paramable.ts
    /** md
- **Step size:** How far to step when the user presses an arrow key. _(Positive
integer.)_
     **/
    stepSize: {
        default: 1n, // Default value
        type: ParamType.BIGINT, // Type validated by UI on user input
        displayName: 'Step size', // Title of the field
        description: 'The increment between subsequent values',
        hideDescription: true, // put the description in a tooltip
        // If required = true, default value is entered in field
        // If required = false, a greyed-out default or
        // placeholder is shown until user interacts with field
        // In both cases, default value is used, but the visual
        // impact of the variable in the parameter panel differs
        required: true,
        // The type is validated automatically, but any further
        // restriction on the input should be validated with
        // a custom function here
        validate: function (n: bigint, status: ValidationStatus) {
            if (n <= 0) status.addError('Step size must be positive')
        },
    },
} satisfies GenericParamDescription

class P5VisualizerTemplate extends P5Visualizer(paramDesc) {
    // === Visualizer category (name of the class) and description ===
    // Appears in the visualizer list and bundle card titles
    static category = 'Entries (p5 Template)'
    static description = 'Step through entries one at a time'

    // === Internal properties ===
    // Top-level properties that are set and updated while the visualizer is
    // running, beyond the user's direct control. All of these properties will
    // be initialized during setup, but TypeScript can't infer that, so we have
    // to give them placeholder values. P5Visualizer provides an INVALID_COLOR
    // we can use to initialize color properties, since we have to wait to
    // have a sketch object (in setup(), draw(), or an event-handling function)
    // to generate valid colors that p5 can draw with.

    // navigation state
    index = 0n

    // palette colors
    bgColor = INVALID_COLOR
    textColor = INVALID_COLOR
    outlineColor = INVALID_COLOR

    async presketch(size: ViewSize) {
        // === Asynchronous setup ===
        // If any pre-computations must be run before the sketch is created,
        // placing them in the `presketch()` function will allow them
        // to run asynchronously, i.e. without blocking the browser.
        // The sketch will not be created until this function completes.

        await super.presketch(size)
        // The above call performs the default behavior of intializing the
        // first cache block of the sequence.
        // So down here is where you can do any computation-heavy preparation
        // for your visualization; for example, you could ask that the
        // _entire_ sequence and its factorizations be preloaded via
        // `await this.seq.fill(this.seq.last)`.
        // (But don't do that unless you really need _all_ the sequence
        // values before you can draw anything at all, as for some sequences
        // it would create a noticeable delay before the sketch appears.)
        // Note also that this entire function is not needed if, as in this
        // case, you have no such computations. (We only included it in this
        // template for the sake of discussion.)
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

        // displayed entry always centered
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
        sketch.background(this.bgColor)

        // === Chaining operations ===
        // Each sketch operation returns a reference to the sketch, so you can
        // chain calls like we do above and below

        // print the current entry
        const element = this.seq.getElement(this.index)
        sketch
            .fill(this.textColor)
            .stroke(this.outlineColor)
            .text(element.toString(), 0, 0)

        // draw a progress bar; see documentation below
        const barScale = 7
        const sqrtDist = Math.sqrt(Number(this.index - this.seq.first))
        const progress = 1 - barScale / (barScale + sqrtDist)
        const barLen = 0.6 * smallDim
        const barWidth = 0.02 * smallDim
        sketch
            .translate(-0.5 * barLen, 0.2 * smallDim)
            .noStroke()
            .fill(255, 128 + 128 * progress, 0) // orange -> yellow as we go
            .rect(0, 0, progress * barLen, barWidth)
            .fill(this.textColor)
            .rect(progress * barLen, 0, (1 - progress) * barLen, barWidth)
            .noFill()
            .stroke(this.outlineColor)
            .rect(0, 0, barLen, barWidth)

        // print a hint about the controls
        sketch
            .textSize(0.02 * smallDim)
            .noStroke()
            .fill(this.outlineColor)
            .text('← browse with arrow keys →', 0.5 * barLen, 0.05 * smallDim)

        // === Stopping the animation loop ===
        // If your visualization is completely drawn and won't
        // need to change in future frames if there are no interaction events
        // (i.e., you're not animating anything or drawing progressively),
        // prevent the browser from using excess processor effort by stopping
        // the drawing loop:
        this.stop()
        // Note you should not call the usual p5.js `noLoop()` or `loop()`
        // methods on the sketch; use `this.stop()` and `this.continue()`
        // instead.
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

        // stay within sequence bounds
        if (this.index < this.seq.first || this.index > this.seq.last) {
            this.index = oldIndex
        } else {
            // === Restarting the animation loop ===
            // If your visualizer finished drawing for a while and so
            // called stop(), but an event changes what needs to be
            // displayed, make sure to restart by calling continue().
            this.continue()
        }
    }

    // === Aspect ratios ===
    // If this visualizer would like a canvas with a particular aspect ratio,
    // such can be requested here. A value of `undefined` indicates no desired
    // aspect ratio, but a number greater than 0 can be used instead if a
    // specific aspect ratio is desired. The aspect ratio is defined as:
    // width / height
    // requestedAspectRatio(): number | undefined {
    // }
}
/** md
## The "sequence progress bar"

Below the displayed sequence entry, this visualizer displays a "progress
bar" to indicate your position (current index) in the sequence. Note that
because integer sequences can have infinitely many terms, it behaves a little
differently than most progress bars you are used to. In particular, as you
step, you will find that the bar advances less and less each time. That's
because infinity is, well, infinitely far away!
**/

// === Export module ===
// Putting this at the end of the source file makes it easy for other people
// to find. Put the visualizer class and a short description string into the
// export module constructor
export const exportModule = new VisualizerExportModule(P5VisualizerTemplate)
