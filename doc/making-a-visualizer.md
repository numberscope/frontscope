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

#### Document your visualizer

Each visualizer has its documentation woven into the source code, using
special `/** md`&nbsp;…&nbsp;`**/` comments that are automatically compiled
into a [documentation page](../src/visualizers/Differences.md). We have some
[conventions](#how-to-document-your-visualizer) for what the documentation
comments should include and where in the source code they should go.

### p5 visualizers

A good way to start a p5 visualizer is to copy and modify one of the basic
examples in the `src/visualizers-workbench` directory:

-   `P5VisualizerTemplate.ts`
-   `Differences.ts`

Let's look at the parts of a p5 visualizer. We recommend following along in
one of the basic examples as you read.

#### 🔑️ Name _(required)_

Put the visualizer's name in the static `visualizationName` property. The name
is used in the visualizer list and the titles of bundle cards.

#### 💡️ Parameters _(often used)_

Parameters are the user-facing structures that ask for values when a
visualizer is created. When the user clicks "save", each parameter stores its
value in a corresponding top-level property of the visualizer object. If you
change one of those top-level properties while the visualizer is running, you
should refresh the corresponding parameter by calling `this.refreshParams()`.

Below the list of parameter properties, the visualizer class has a `params`
property that describes how the parameters should appear in the UI. Look in
`src/shared/Paramable.ts`, or in other visualizers, to learn about the options
you can set in the `params` property.

-   **p5 Template:** `stepSize`.
-   **Differences:** `n`, `levels`. This visualizer uses `refreshParams()`
    when it auto-fills the optional parameter `levels`.

#### 💡️ Other top-level properties _(often used)_

You may also need top-level properties that are set and updated while the
visualizer is running, beyond the user's direct control. These might do things
like:

-   Keeping track of which part of the sequence you're looking at.
-   Storing colors that are created during setup.
-   Remembering where an animated object is.

By convention, we list these properties after the `params` property.

-   **p5 Template:** `index`.
-   **Differences:** `first`.

#### 💡️ Check parameters _(often used)_

When the user clicks "save", `checkParameters()` is called, giving you a
chance to check the parameter values and prompt the user to correct any
invalid ones.

Your validation can't depend on the sequence, because there might not be any
sequence loaded when the validation check runs. You can do sequence-dependent
validation in [`setup()`](#bulb-set-up-the-visualizer-often-used), as
described below, but you won't be able to prompt the user for corrections at
that point.

-   **p5 Template:** Make sure that the step size is positive.
-   **Differences:** Make sure that the number of terms is positive or zero,
    the number of levels is positive, and the number of terms is at least the
    number of levels.

#### 🔩️ Inhabit a page element _(advanced)_

Each time the visualizer is inserted into a page element, the `inhabit()`
function is called, giving you access to the element the visualizer is about
to inhabit. If you don't need information from the web page your visualizer is
running in, or access to its document object model (DOM), you shouldn't need
to implement `inhabit()`.

If you do implement `inhabit()`, start by passing the given element up to
`super.inhabit()`, which does the behind-the-scenes work of managing p5
canvases.

You can access the attached sequence in `inhabit()`, but we recommend doing
that in `setup()` instead.

#### 💡️ Set up the visualizer _(often used)_

When the p5 graphics context becomes available, `setup()` is called, giving
you your first chance to set graphics options and draw on the canvas. This is
a good place for one-time graphics operations, like painting the background of
a static visualizer or setting colors and stroke options that won't change
from frame to frame.

If you implement `setup()`, start by calling `super.setup()`, which includes
the [`createCanvas()`](https://p5js.org/reference/#/p5/createCanvas) call that
must appear in every p5 setup function.

When `setup()` is called, the visualizer will always be attached to a
sequence, so you can do sequence-dependent validation and initialization here.

-   **p5 Template:** Go to the beginning of the sequence. Create palette
    colors. Set text alignment.
-   **Differences:** Fill in the default value of the `levels` property if it
    was left unset in the parameters dialog. Do a consistency check between
    the sequence being visualized and the parameters.

#### 🔩️ Show or stop the visualization; depart from a page element _(advanced)_

You shouldn't need to implement `show()`, `stop()`, or `depart()`. You can
learn about them from the [visualizer interface](#abstract-visualizers)
documentation, and from how they're implemented in the `P5Visualizer` base
class.

#### 🔑️ Draw the visualization _(required)_

The `draw()` function is called on each frame, giving you a chance to draw
your visualization! Look at the examples and the p5
[tutorials](https://p5js.org/learn/) and
[p5.js reference](https://p5js.org/reference/) to learn about what you can do.

Drawing tools and options are found in the graphics context, `this.sketch`.
Accessing `this.sketch` triggers some consistency checks, so we recommend
storing its value as a local constant in each function call that uses it. This
avoids redundant checks.

Sequence information is found in `this.seq`. This is a `SequenceInterface`
object, so it will always have a method `getElement(n)` that returns the `n`th
entry in the sequence.

You have to implement the `draw()` method, even if it does nothing. Your
visualizer can't be loaded into Numberscope without it.

#### 💡️ Stop and start animation _(often used)_

If your visualization is a static picture, call the sketch's `noLoop()`
function when you're done drawing. This stops the animation loop, so you don't
waste time re-drawing the same picture dozens of times per second. If the
visualization is only static temporarily, you can call `loop()` to re-start
the animation loop whenever you need to.

-   **p5 Template:** Stop the animation loop at the end of each frame. Only
    start it again when the user steps to a different sequence entry,
    requiring the picture to be re-drawn.
-   **Differences:** Draw the whole visualization in one frame, and then stop
    the animation loop.

#### 💡️ Respond to user interactions _(often used)_

Each time the user interacts with your visualization, an
[event handling](https://p5js.org/reference/#group-Events) function like
`keyPressed()` or `mouseClicked()` will be called, giving you a chance to
respond. There are handlers for a wide variety of input events.

#### 🔑️ Export the visualizer _(required)_

The engine expects the visualizer to be packaged in a `VisualizerExportModule`
object, constructed from the visualizer class and a short description string.

#### 🔩️ Handle errors _(advanced)_

There are two ways to let people interacting with a visualizer know that
something unexpected has happened. The first is with the
[alertMessage](../src/shared/alertMessage.md) utility. The second is to just
throw an error. If it's not caught anywhere else, the visualizer framework
will show it in an error dialog.

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

### How to document your visualizer

The p5 Template visualizer and the Differences visualizer both follow our
documentation conventions.

#### Name, sample image, and description

In a documentation block just before the visualizer class definition, put a
level-1 heading with the visualizer's name, followed by a sample image and a
description.

To make the sample image, take a screenshot of your visualizer and put it in
the `src/assets/img<VisualizerName>` directory. Add the image to the
documentation page as shown in the examples, using the `width` property for
scaling.

Below the sample image, describe what the visualizer does.

#### Parameters

In a documentation block just before definition of `params`, put "Parameters"
in a level-2 heading. Inside the definition of `params`, just before each the
parameter's key, put a documentation block that displays like this:

> **Parameter name:** Description of the parameter. _(Type and constraints.)_

#### Controls

If users can interact with your visualizer while it's running, these
interactions should be documented too. In a documentation block just before
the first event handling method, put "Controls" in a level-2 heading. Display
control information like this:

> **Key or gesture:** Description of effect.

You can organize the control documentation comments in whatever way makes the
most sense. If possible, order the event handling methods so that most
controls can be documented near the method that implements them.

#### Additional documentation

Any additional documentation should go in documentation comments after all of
the event handling methods. This is the place for in-depth discussions,
example settings, image galleries, credits, and so forth.

Code-related documentation, like explanations of algorithms used in the
visualizer, should go as close as possible to the related code. This means, in
particular, that code requiring additional documentation should come after the
event handling methods if possible.

#### Export block

The `VisualizerExportModule` block should be the last thing in the visualizer
source file. That makes it easy to find.

### Abstract visualizers

Now that we've seen how to extend the [`P5Visualizer`](#p5-visualizers) base
class, let's take a peek at how the base class works internally. This section
will be most useful to you if you want to write a new base class, or to build
a visualizer so different from anything else that it shouldn't have a base
class. However, you can also use this knowledge to override the default
behavior of a base class you're extending. By overriding methods like
`inhabit()`, `show()`, `stop()`, and `depart()`, you can customize your
visualizer's behavior more deeply than usual.

Behind the scenes, a visualizer base class is an implementation of the
visualizer interface (`VisualizerInterface`). To support parameters, the base
class also has to implement the parameterizable object interface
(`ParamableInterface`). These interfaces are defined in
`VisualizerInterface.ts` and `Paramable.ts`, respectively. To write a new base
class, or to build a visualizer without one, you'll have to implement these
interfaces yourself. That means your visualizer class has to include the
following data and methods, and they have to behave in the way the engine
expects.

#### The visualizer interface

1. `visualization()`: Returns a string saying what type of visualizer this is.
   Typically, each base class chooses its own fixed return value, which all
   its descendants inherit.
2. `view(seq)`: Load the given sequence into the visualizer, where the drawing
   operations in later function calls will be able to access them. This method
   should not do any drawing.
3. `inhabit(element)`: Insert a view of the the visualizer into the given
   `HTMLElement`. This element is typically a `div` whose size is already set
   up to comprise the available space for visualization. The `inhabit()`
   method should not do any drawing.
4. `show()`: Start or resume display of the visualization.
5. `stop()`: Pause display of the visualization. Don't erase any visualization
   produced so far or otherwise clean up the visualizer.
6. `depart()`: Throw out the visualization, release its resources, remove its
   injected DOM elements, and do any other required cleanup. After this call,
   the visualizer must support `inhabit()` being called again, perhaps with a
   different div, to re-initialize the visualization.

#### The paramable interface

1. `name`
2. `description`
3. `isValid`: A boolean that says whether the current configuration of
   parameter values is self-consistent and safe to use. Generally, this will
   be set automatically based on the output of `checkParameters()`, which is
   mentioned in the description of `validate()` below.
4. `params`: A parameterizable object has to come with a set of user-facing
   parameters—even if the set is empty. The `params` property is an object
   mapping parameter names to parameter objects—that is, (plain) objects
   implementing the parameter interface (`ParamInterface`). A parameter object
   describes how a parameter should appear in the UI, what kind of values it
   can take, whether it's required, and so on.
5. `validate()`: Check whether the current configuration of parameter values
   is valid, and call the `assignParameters()` method below if so. Return a
   `ValidationStatus` object that tells the engine whether the check and
   assignment succeeded. Whenever the engine wants to load a parameter
   configuration into a parameterizable object, it will use `validate()` to do
   so. If it gets back a `ValidationStatus` with `isValid = true`, it will
   proceed with whatever it is doing. If it gets a status with
   `isValid = false`, it will will stop what it is doing and help the user fix
   the problem by displaying any error messages the status carries. Most
   parameterizable objects will extend `Paramable` and use its default
   implementation of `validate()`. This implementation checks parameter
   validity by calling the `checkParameters()` method, which just has to
   return a `ValidationStatus` that says whether the parameters are valid. The
   default implementation then handles all the other responsibilities of
   `validate()`.
6. `assignParameters()`: Copy the `value` property of each item in `params` to
   the place where the implementing object will access it. Typically, that
   means copying to top-level properties of the object. The implementing
   object should only use parameter values supplied by `assignParameters()`,
   because these have been vetted by `validate()`. In contrast, values taken
   directly from `params` are unvalidated, and they can change from valid to
   invalid at any time.
7. `refreshParams()`: Copy the current working values of the parameters back
   into the `value` properties in the `params` object, so they can be
   reflected in the parameter UI. This method is used by objects that can
   update their own parameters, rather than just having parameters assigned
   through the standard parameter UI.
