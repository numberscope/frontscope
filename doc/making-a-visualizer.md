## Building a Visualizer

### Get started

#### Choose a graphics framework

The easiest way to build a visualizer is to extend a pre-made visualizer base
class, which automatically sets up a graphics framework for you to use. Right
now, there's only one base class available:

-   [`P5Visualizer`](#p5-visualizers) uses the
    [**p5.js**](https://p5js.org/learn/) library for graphics and user
    interaction.

If you want to use a new graphics framework, you'll need to write your own
implementation of the [visualizer interface](#abstract-visualizers).

#### Test your visualizer on the workbench

While you're working on a visualizer, we recommend keeping it in the
`src/visualizers-workbench` directory, where Frontscope typically won't notice
it. To load it, run Frontscope in "workbench mode" by calling
`npm run dev:workbench`.

When you're ready to propose your visualizer as an official part of
Numberscope, you'll move it to `src/visualizers`. Then Frontscope will notice
and load it when you call the usual `npm run dev`. For details, see
[below](#where-to-put-your-visualizer).

### p5 visualizers

A good way to start a p5 visualizer is to copy and modify one of the basic
examples in the `src/visualizers-workbench` directory:

-   `P5VisualizerTemplate.ts`
-   `Differences.ts`

Let's look at the parts of a p5 visualizer. We recommend following along in
one of the basic examples as you read.

#### :key: Name _(required)_

The `name` property appears in the titles of bundle cards.

The name that appears in the visualizer list is set later, when you
[export the visualizer](#export-the-visualizer).

#### :bulb: Parameters _(often used)_

Parameters are the user-facing structures that ask for values when a
visualizer is created. When the user clicks "save", each parameter stores its
value in a corresponding top-level property of the visualizer object. If you
change one of those top-level properties while the visualizer is running, you
should refresh the corresponding parameter by calling `this.refreshParams()`.

Below the list of parameter properties, the visualizer class has a `params`
property that describes how the parameters should appear in the UI. Look in
`src/shared/Paramable.ts`, or in other visualizers, to learn about the options
you can set in the `params` property.

-   **p5 Visualizer Template:** `stepSize = 1`.
-   **Differences:** `n = 20`, `levels = 5`. The parameters are refreshed in
    the in the `inhabit()` method.

#### :bulb: Other top-level properties _(often used)_

You may also need top-level properties that are set and updated while the
visualizer is running, beyond the user's direct control. By convention, we
list these properties after the `params` property.

-   **p5 Visualizer Template:** `index`, `flash`.
-   **Differences:** `first`.

#### :bulb: Check parameters _(often used)_

When the user clicks "save", `checkParameters()` is called, giving you a
chance to check the parameter values and prompt the user to correct any
invalid ones.

Your validation can't depend on the sequence, because there might not be any
sequence loaded when the validation check runs. You can do sequence-dependent
validation in [`inhabit()`](#advanced-inhabit), as described below, but you
won't be able to prompt the user for corrections at that point.

-   **p5 Visualizer Template:** Make sure that the step size is positive.
-   **Differences:** Make sure that the number of terms is at least the number
    of levels.

#### :nut*and_bolt: Inhabit a page element *(advanced)\_

Each time the visualizer is inserted into a page element, the `inhabit()`
function is called, giving you access to the element the visualizer is about
to inhabit. If you implement `inhabit()`, start by passing the given element
up to `super.inhabit()`, which does the behind-the-scenes work of managing p5
canvass.

When `inhabit()` is called, the visualizer will always be attached to a
sequence, so you can do sequence-dependent validation and initialization here.

-   **p5 Visualizer Template:** Go to the beginning of the sequence.
-   **Differences:** Fill in the default value of the `levels` property in
    case it was left unset in the parameters dialog. Do a consistency check
    between the sequence being visualized and the parameters.

#### :bulb: Set up the visualizer _(often used)_

When the p5 graphics context becomes available, `setup()` is called, giving
you your first chance to set graphics options and draw on the canvas. This is
a good place for one-time graphics operations, like painting the background of
a static visualizer or setting colors and stroke options that won't change
from frame to frame.

If you implement `setup()`, start by calling `super.setup()`, which includes
the [`createCanvas()`](https://p5js.org/reference/#/p5/createCanvas) call that
must appear in every p5 setup function.

#### :nut*and_bolt: Show or stop the visualization; depart from a page element *(advanced)\_

You shouldn't need to implement `show()`, `stop()`, or `depart()`. You can
learn about them from the [visualizer interface](#abstract-visualizers)
documentation, and from how they're implemented in the `P5Visualizer` base
class.

#### :key: Draw the visualization _(required)_

The `draw()` function is called on each frame, giving you a chance to draw
your visualization! Look at the examples and the p5
[tutorials](https://p5js.org/learn/) and
[p5.js reference](https://p5js.org/reference/) to learn about what you can do.

Drawing tools and options are found in the graphics context, `this.sketch`.
Accessing `this.sketch` triggers some consistency checks, so it's most
parsimonious to access it at most once per function call, storing its value as
a local constant for future reference.

Sequence information is found in `this.seq`. This is a `SequenceInterface`
object, so it will always have a method `getElement(n)` that returns the `n`th
element in the sequence.

You have to implement this method, even if it does nothing. Your visualizer
can't be loaded into Numberscope without it.

#### :bulb: Stop and start animation _(often used)_

If your visualization is a static picture, call the sketch's `noLoop()`
function when you're done drawing. This stops the animation loop, so you don't
waste time re-drawing the same picture dozens of times per second. If the
visualization is only static temporarily, you can call `loop()` to re-start
the animation loop whenever you need to.

-   **p5 Visualizer Template:** Only loop while animating the white flash that
    indicates an index change.
-   **Differences:** Draw the whole visualization in one frame, and then call
    `noLoop()` to stop the animation loop.

#### :bulb: Respond to user interactions _(often used)_

Each time the user interacts with your visualization, an
[event handling](https://p5js.org/reference/#group-Events) function like
`keyPressed()` or `mouseClicked()` will be called, giving you a chance to
respond. There are handlers for a wide variety of input events.

#### :key: Export the visualizer _(required)_

The engine expects the visualizer to be packaged in a `VisualizerExportModule`
object, whose constructor takes three arguments:

-   The name that should appear on the visualizer list
-   The visualizer class
-   A short description

#### :nut*and_bolt: Handle errors *(advanced)\_

You can create an error message with the `alertMessage` utility in
`src/shared/`, and show it to the user with
[`window.alert`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert):

```typescript
window.alert(alertMessage(someError))
```

You can also just throw an error. If it's not caught anywhere else, the
visualizer framework will show it in an error dialog.

### Abstract visualizers

Every visualizer needs to implement the interface defined in
`VisualizerInterface.ts`, which specifies the basic expectations of a
visualizer. This interface includes the following data and methods.

<!-- There is significant redundancy between the following and the contents
     of Paramable and VisualizerInterface. Ideally, it would be sorted into
     those two sources, and extracted from the relevant source files, to
     better obey the principle of documentation alongside relevant code.
-->

1. `isValid`: A boolean that is used to determine if the visualizer is ready
   to draw. Generally this will be set automatically based on what you return
   from the `checkParameters` method (see below).
2. `params`: The engine expects all visualizers to have parameters that can be
   set by the user, though these parameters can be empty. This `params`
   property is an object mapping parameter names to (plain) objects that
   satisfy the `ParamInterface` -- basically, they describe the parameter,
   giving whether it is required, how it should be labeled and presented in
   the UI, and so on.
3. `view(seq)`: Load the given sequence into the visualizer, where the drawing
   operations in later function calls will be able to access them. This method
   should not do any drawing.
4. `inhabit(element)`: Insert a view of the the visualizer into the given
   `HTMLElement`. This element is typically a `div` whose size is already set
   up to comprise the available space for visualization. The `inhabit()`
   method should not do any drawing.
5. `validate()`: Return a `ValidationStatus` object that indicates to the
   engine that the visualizer is valid. The engine will call `validate` before
   it calls `initialize`, and it will only proceed if the `isValid` property
   of the `ValidationStatus` object is `true`. Otherwise, it will display the
   error. Generally speaking, the framework takes care of these bookkeeping
   details, and you can just implement the `checkParameters()` method, which
   only has to return a `ValidationStatus` that indicates whether the
   parameter values are sensible.
6. `show()`: Start or resume display of the visualization.
7. `stop()`: Pause display of the visualization. Don't erase any visualization
   produced so far or otherwise clean up the visualizer.
8. `depart()`: Throw out the visualization, release its resources, remove its
   injected DOM elements, and do any other required cleanup. After this call,
   the visualizer must support `inhabit()` being called again, perhaps with a
   different div, to re-initialize the visualization.

### Where to put your visualizer

When a visualizer is ready for Numberscope users, place the file containing
its class definition and export module in the folder `src/visualizers`. When
the Frontscope client runs, it'll find your visualizer and compile it at
runtime.

The visualizers in `src/visualizers` can be tested with the usual
`npm run dev` call.

As discussed [earlier](#test-your-visualizer-on-the-workbench), visualizers
that aren't ready for Numberscope users should go in
`src/visualizers-workbench`. You can load them for testing by calling
`npm run dev:workbench`.
