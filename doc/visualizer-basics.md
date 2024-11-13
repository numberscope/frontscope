# The basics

A good way to start a p5 visualizer is to copy and modify the basic example in
the `src/visualizers-workbench` directory:

-   [`P5VisualizerTemplate.ts`](https://github.com/numberscope/frontscope/blob/main/src/visualizers-workbench/P5VisualizerTemplate.ts)

On this page we look at all of the core parts that go into this basic p5
visualizer, as an introduction. The [following page](visualizer-in-depth.md)
will provide a complete summary of all of the methods and data properties you
can use to implement more involved features and to handle additional
possibilities that might come up in the use of a visualizer.

Let's start with a diagram showing the basic lifecycle of a visualizer:

````d2 layout="elk"
direction: right
classes: {
  method: {
    height: 40
    style: {
      border-radius: 10
      font-size: 20
    }
  }
}

Start: "" {
   style: {fill: blue}
   shape: circle
   width: 10
}
Init: |md
    ### Create visualizer object
    ```txt
    property initializers,
    constructor
    ```
|
Start -> Init: | page load/
visualizer change|
SPC: |md
    ### Parameter checks
    ```txt
         individual
    validate() functions
    ```
|
Init -> SPC
Setup: "setup()" {class: method}
SPC -> Setup
Draw: "draw()" {class: method}
Setup -> Draw
Draw -> Draw: {target-arrowhead: "[stop()/continue()]"}
Draw -> SPC: "change parameter" {style.font-size: 18}

legend: {
  near: bottom-center
  label.near: top-left
  direction: right
  method: "classMethod()" {
    class: method
    height: 20
    style: {
      opacity: 0.6
      font-size: 14
    }
  }
  otherCode: |
    ### Other code section
    ```txt
    details
    ...
    ```
  | {
    width: 200
    style: {
      opacity: 0.6
      font-size: 12
    }
  }
  method -> otherCode: "action/event" {style.font-size: 14}
  style {
    opacity: 0.4
    font-size: 18
  }
}
````

When someone visits a Numberscope URL that uses a particular visualizer, or
selects it from the Visualizer Switcher popup or from a Specimen Gallery, then
the frontscope system has to create the Visualizer class object, which in
TypeScript language terms means to execute the statements in its class
definition that assign initial values to its properties, and call its
constructor method.

Then the values of the parameters specifying the details of the behavior of
that visualizer have to be checked, to make sure they make sense. The
frontscope system does some of this automatically; for example, it makes sure
that a parameter you've designated as an integer doesn't have any decimal
part. The primary way you add more checks is with `validate()` functions
included in the descriptions of the parameters of your visualizer.

Once all of the parameters check out, the system creates a p5 drawing canvas
for you, and as typical for p5, calls your `setup()` method once and then
starts a loop calling your `draw()` method repeatedly to "paint" each frame of
your visualization on the screen (under the presumption that what you want to
display changes over time; there's
[discussion below](#stop-and-start-animation-often-used) of what to do if
not). Once this drawing loop is underway, it can be stopped and started with
`stop()` and `continue()` methods (which are provided for you by the
`P5Visualizer` base class). Moreover, if any of the parameters are changed
through their controls in the browser user interface (UI), the system will go
back to the validation step and reinitialize the process from there. (So in
particular, it will not re-run the property initializers or class constructor
method.)

In the next section we go through all of these aspects of the visualizer code
a bit more systematically, in the order in which they appear in
[`P5VisualizerTemplate.ts`](https://github.com/numberscope/frontscope/blob/main/src/visualizers-workbench/P5VisualizerTemplate.ts).
You may want to follow along in that code.

## Core parts of a visualizer implementation

### 💡️ Parameters _(often used)_

-   In **P5VisualizerTemplate:** `stepSize`

Parameters are the data items that control the details of the behavior of your
visualizer. The frontscope system creates an input element (like a text box or
checkbox) for each of them in its UI. When someone running your visualizer
sets a parameter through the UI, its value is written to a corresponding
top-level property of the visualizer object (with the same name as the
parameter).

The parameters are described in the `paramDesc` object, usually defined just
before the declaration of your class derived from `P5Visualizer`. The keys of
this object are the names of the parameters. The values are inner objects that
represent various different characteristics of the parameter. Each parameter
must specify its `type` (for example, `ParamType.BIGINT` if the parameter will
take on a TypeScript `bigint` value), its `default` value (e.g., `1n` for a
`BIGINT` parameter), its primary designation `displayName` in the UI (e.g.,
`Step size`), and whether it is `required` to be filled in. There are many
optional parameters, such as a longer `description` that may be shown
alongside the input element for the parameter, or popped up as a tooltip when
the mouse pointer hovers on the parameter's entry area. For a complete list of
the options you can set and what they do, check
[this page](../src/shared/Paramable.md).

Note that you pass the `paramDesc` object as an _argument_ to the base class
`P5Visualizer` when you declare your class.

#### 💡️ Determine validity of parameter values _(often used)_

In particular, if you have additional checks you want to do on a parameter
value before you accept it and start displaying your image, the easiest thing
to do is define a `validate()` function in the options object for your
parameter. The `P5VisualizerTemplate` does this for `stepSize` to make sure it
is positive. Note that in a `validate()` function, you receive the potential
value of the parameter as the first argument, along with a `ValidationStatus `
object _status_. If you find a problem with the proposed value, you should
call `.addError()` on `status`. On the other hand, if there's merely something
unusual or possibly the matter with the value, you may prefer to call
`.addWarning()` on the `status` which will display a message in the UI but
still allow your visualizer to proceed.

### 🔑️ Name _(required)_ and description

-   In **P5VisualizerTemplate:** `category` and `description`

Put the visualizer's name in the static `category` property of your Visualizer
class; this is just a string value. It's encoded in this way because
individual visualizers don't have distinct names, just the class of Visualizer
you are creating does. A brief text `description` can also be provided, again
as a static property. The name (`category`) and `description` are used when
presenting visualizers to the user to choose from.

### 💡️ Other data properties _(often used)_

-   In **P5VisualizerTemplate:** `index`, `bgColor`, `textColor`, and
    `outlineColor`

You may also need internal data (top-level properties that are set and updated
while the visualizer is running, beyond the user's direct control). These
properties might do things like:

-   Keeping track of which part of the sequence you're looking at.
-   Storing colors that are created during setup.
-   Remembering where an animated object is.

By convention, we list these properties after `category` and `description`. By
the rules of the TypeScript language, you must at least specify the type of
each property; but whenever possible, it is convenient to set an initial
placeholder value for the property. In the case of colors, p5 does not provide
a way to create a color until the sketch is initialized, a bit later in the
process. So you can initialize any color properties you may have with
`INVALID_COLOR` provided by frontscope code -- just don't forget to reset them
with valid colors once you have a sketch. Often this happens in the `setup()`
method.

### 💡️ Set up the visualizer _(often used)_

There are two methods of your Visualizer class in which you can do
pre-computation before it enters the drawing loop. One is `presketch()`;
there's an empty placeholder version of this in `P5VisualizerTemplate`, and we
will cover its capabilities and why you might want to use it on the
[next page](visualizer-in-depth.md#set-up-for-drawing).

The other is `setup()`, which is called immediately after the p5 drawing
canvas has been created. Here, you should set the values for all of your
additional data properties that you want them to have just before a new
visualization begins. It's important to set them all unless there are ones you
know won't change during the drawing process and for which you can rely on the
values set in the class initialization. That's because the frontscope may
re-run the set-up procedure, say when parameters change, without taking the
trouble to go all the way back to destroying and re-constructing your
visualizer object. Note this is the first chance to set graphics options and
access the drawing canvas (through the `this.sketch` property). Hence, you may
want to create color objects here, or do one-time graphics operations like
painting the background if you don't need to do that on every frame, or
setting the width of your drawing strokes if that won't be changing.

If you implement `setup()`, always make sure to call `super.setup()`, which
includes the [`createCanvas()`](https://p5js.org/reference/#/p5/createCanvas)
call that must appear in every p5 setup function. You won't be able to perform
any drawing operation before this call.

The `P5VisualizerTemplate` uses `setup()` to go to the beginning of the
sequence, set text alignment, and create palette colors.

### 🔑️ Draw the visualization _(required)_

The `draw()` function is called on each frame, giving you a chance to draw
your visualization! Look at the examples and the p5
[tutorials](https://p5js.org/learn/) and
[p5.js reference](https://p5js.org/reference/) to learn about what you can do.

Drawing tools and options are found in the graphics context, `this.sketch`.
Sequence information is found in `this.seq`. This is a `SequenceInterface`
object, so it will always have a method `getElement(n)` that returns the `n`th
entry in the sequence.

You have to implement the `draw()` method, even if it does nothing. Your
visualizer can't be loaded into Numberscope without it. The
`P5VisualizerTemplate` uses `draw()` to write the value of the current entry
in large type, make a two-color rectangle that serves as a progress bar, and
display a hint about the controls.

### 💡️ Stop and start animation _(often used)_

If your visualization is a static picture (like the `P5VisualizerTemplate`) or
if `draw()` has executed enough times that you have nothing further left to
show, call the visualizer `stop()` method when you're done drawing. This
method stops the p5 animation loop, so you don't waste processor time
repeatedly drawing the same picture.

If you have previous experience with p5.js, you might be used to calling
`noLoop()` and `loop()` to stop and start your sketch. In a Visualizer,
however, you need to use its `stop()` and `continue()` methods to ensure that
all of Numberscope's controls remain properly updated.

### 💡️ Respond to user interactions _(often used)_

Each time the user interacts with your visualization, an
[event handling](https://p5js.org/reference/#Events) function like
`keyPressed()` (used by the `P5VisualizerTemplate` to move the current index
back and forth) or `mouseClicked()` will be called, giving you a chance to
respond. There are handlers for a wide variety of input events. Note that if
you previously stopped drawing by calling the `stop()` method but would like
to draw some more frames based on the event that occurred, you can call the
`continue()` method to restart the drawing loop.

## 🔑️ How to make your visualizer available _(required)_

The engine expects the visualizer to be packaged in a `VisualizerExportModule`
object, constructed from the visualizer class and a short description string.
This "export" happens after the class definition.

## How to document your visualizer

Documentation should be included in the source file between markdown tags
`/** md` and `**/`. This will be extracted from the source code and
automatically collated into the online documentation. The p5 Template
visualizer demonstrates our documentation conventions. That template also
includes other helpful comments marked with `// ===`; these are not compiled
into the online documentation and are only provided in the template to augment
this guide (you need not imitate this). You should also provide any ordinary
code comments as you normally would.

### Name, sample image, and description

In a documentation block just before the visualizer class definition, put a
level-1 heading with the visualizer's name, followed by a sample image and a
description.

To make the sample image, export an image of your visualizer with the snapshot
button in the UI, and put it in the `src/assets/img<VisualizerName>`
directory. (You can crop it with an image editing tool if you like to show the
important detail.) Add the image to the documentation page as shown in the
examples, using the `width` property for scaling.

Below the sample image, describe what the visualizer does. Please be precise
about exactly how the image is created from the terms of the sequence.

### Parameters

In a documentation block just before definition of `params`, put "Parameters"
in a level-2 heading. Inside the definition of `params`, just before each the
parameter's key, put a documentation block that displays like this:

> **Parameter name:** Description of the parameter. _(Type and constraints.)_

### Controls

If users can interact with your visualizer while it's running, these
interactions should be documented too. In a documentation block just before
the first event handling method, put "Controls" in a level-2 heading. Display
control information like this:

> **Key or gesture:** Description of effect.

You can organize the control documentation comments in whatever way makes the
most sense. If possible, order the event handling methods so that most
controls can be documented near the method that implements them.

### Additional documentation

Any additional documentation should go in documentation comments after all of
the event handling methods. This is the place for in-depth discussions,
example settings, image galleries, credits, and so forth.

Code-related documentation, like explanations of algorithms used in the
visualizer, should go as close as possible to the related code. This means, in
particular, that code requiring additional documentation should come after the
event handling methods if possible.

### Export block

The `VisualizerExportModule` block should be the last thing in the visualizer
source file. That makes it easy to find.

## Where to put your visualizer

However you made it, when a visualizer is ready for other Numberscope users,
place the file containing its class definition and export module in the folder
`src/visualizers`. When the frontscope client runs, it'll find your visualizer
and compile it at runtime.

If running `npm run dev`, visualizers in `src/visualizers` will be available.
As discussed
[on the previous page](visualizer-overview.md#develop-your-visualizer-on-the-workbench),
visualizers that aren't ready for Numberscope users should go in
`src/visualizers-workbench`. You can load them (and the P5Template visualizer
discussed in this guide) to see how they work by running with
`npm run dev:workbench`.
