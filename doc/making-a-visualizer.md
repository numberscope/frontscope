## Building a Visualizer

### The big picture

The easiest way to build a visualizer is to extend a pre-made visualizer base
class, which automatically sets up a graphics framework for you to use. Right
now, there's only one base class available:

-   `P5Visualizer` uses the [**p5.js**](https://p5js.org/) library for
    graphics and user interaction.

If you want to use a new graphics framework, you'll need to write your own
implementation of the [visualizer interface](#abstract-visualizers).

### p5 visualizers

A good way to start a p5 visualizer is to copy and modify one of the basic
examples in the `src/visualizers-workbench` directory:

-   `P5VisualizerTemplate.ts`
-   `Differences.ts` Let's look at the parts of a p5 visualizer, following
    along in one or both of these examples.

#### Name

Every visualizer must give its name, which is displayed in the visualizer
list.

#### Parameters

Parameters are user-facing structures that ask for values when a visualizer is
created. When the user clicks "save", each parameter stores its value is
stored in a corresponding top-level property of the visualizer object. If you
change one of those top-level properties while the visualizer is running, you
should refresh the corresponding parameter by calling `this.refreshParams()`.

After the list of parameter properties, the visualizer class has a `params`
property that describes how the parameters should appear in the UI. Look in
`src/shared/Paramable.ts`, or in other visualizers, to learn about the options
you can set in the `params` property.

-   p5 Visualizer Template: `stepSize = 1`.
-   Differences: `n` and `levels`. The parameters are refreshed in the in the
    `inhabit()` method.

#### Other top-level properties

You may also need top-level properties that are set and updated while the
visualizer is running, beyond the user's direct control. By convention, we
list these properties after the `params` property.

-   p5 Visualizer Template: `index`, `flash`.

#### Check parameters

When the user clicks "save", this function validates the parameter values, and
prompts the user to change any invalid parameters. You don't have to do
validation, but it can save the user some frustration if invalid parameters
are possible. Your validation has to be independent of the sequence, because
there might not be any sequence loaded when the validation check runs.

-   p5 Visualizer Template: Make sure that the step size is positive.
-   Differences: Make sure that the `number` is no less than the `levels`.

#### Set up the visualizer

You can implement a `setup()` function as usual with
[p5](https://p5js.org/learn/) if there are any one-time graphical operations
you want to do, like drawing a background for a static visualizer, or
specifying colors. If you implement `setup()`, start by calling
`super.setup()`, which creates the p5 canvas for you. (You should only skip
`super.setup()` if you have a really good reason to create the canvas
yourself).

#### _(Advanced)_ Inhabit

You can implement an `inhabit()` function if you have initialization you want
performed whenever the visualizer is inserted onto the page. If you do this,
start by calling `super.inhabit()` to get the standard initialization as well.

-   Differences: Fill in the default value of the `levels` property in case it
    was unset in the parameters dialog. Perform a consistency check between
    the sequence being visualized and the parameters. This check could not be
    done in `checkParameters` because when the user is choosing the
    parameters, the visualizer has not yet been associated with any sequence.

##### _(Advanced)_ Start, stop, and dispose of the visualizer

You shouldn't need to implement `show()`, `stop()`, or `dispose()`.

#### Draw the visualization!

Implement `draw()` to draw your visualization! Look at the examples and the
[p5.js reference](https://p5js.org/reference/) to see what kinds of things you
can do. It's a good idea to start with `super.draw()`.

It's a good idea to assign `this.sketch` to a local constant at the beginning
of the `draw()` function. This approach is used both for convenience of not
having to repeat `this.sketch` multiple times, and because some validation of
the current state of the visualizer is performed when `this.sketch` is
accessed; using it from a local variable prevents those checks from being
re-done.

To access each sequence element, use `this.seq`. This is a `SequenceInterface`
object, which is guaranteed to have a method `getElement(n)` that returns the
`n`-th element in the sequence.

If your visualization is a static picture, call the `noLoop()` function on the
sketch when you are done drawing (the Differences visualizer does this).
Otherwise, p5 will keep calling your draw function repeatedly, allowing user
interaction or animation. For example, some visualizers add one more sequence
entry with each frame—that is, each call to `draw()`.

### Abstract visualizers

Every visualizer needs to implement the interface defined in
`VisualizerInterface.ts` which specifies the basic expectations of a
visualizer.

(See below for the easy way to do this.) This interface includes the following
data and methods:

<!-- There is significant redundancy between the following and the contents
     of Paramable and VisualizerInterface. Ideally, it would be sorted into
     those two sources, and extracted from the relevant source files, to
     better obey the principle of documentation alongside relevant code.
-->

1. `isValid`: a boolean that is used to determine if the visualizer is ready
   to draw. Generally this will be set automatically based on what you return
   from the `checkParameters` method (see below).
2. `params`: The engine expects all visualizers to have parameters that can be
   set by the user, though these parameters can be empty. This `params`
   property is an object mapping parameter names to (plain) objects that
   satisfy the `ParamInterface` -- basically, they describe the parameter,
   giving whether it is required, how it should be labeled and presented in
   the UI, and so on.
3. `view()`: Takes a sequence object that implements the sequence interface.
   It should arrange for the visualizer to display information about the given
   sequence (without actually drawing anything at the time `view()` is
   called).
4. `inhabit(element)`: The argument is an HTMLElement. It should inject the
   output of the visualizer into the given element, typically a `div` whose
   size is already set up to comprise the available space for visualization.
   However, it should not yet perform any visualization.
5. `validate()`: must return `ValidationStatus` object that indicates to the
   engine that the visualizer is valid. The engine will call `validate` before
   it calls `initialize` and will only proceed if the `isValid` property of
   the `ValidationStatus` object is `true`. Otherwise it will display the
   error. Generally speaking, the framework takes care of these bookkeeping
   details and you can simply implement the `checkParameters()` method that
   just has to examine if parameter values are sensible and return a
   ValidationStatus accordingly.
6. `show()`: Begin (or resume) displaying the visualization.
7. `stop()`: Pause displaying the visualization (but don't erase any
   visualization produced so far or otherwise clean up the visualizer).
8. `dispose()`: Throw out the visualization, release its resources, remove its
   injected DOM elements, etc. Note that after this call, the visualizer must
   support `inhabit()` being called again, perhaps with a different div, to
   re-initialize the visualization.

## Exporting a visualizer

The engine expects visualizers to be packaged in `visualizerExportModules`
which take as their arguments the name of the visualizer which is displayed in
the UI. You can also reference the name of the visualizer to maintain
consistency, though the `Differences` sets it explicitly.

The other arguments in the export module are the visualizer itself
(`Differences` in the example case, which is the name of the class we
created), and a description.

If you place the file containing your visualizer class definition with the
export module in the folder name `Visualizers`, the engine will automatically
package it up and include it in the list of available visualizers.

There is no compiling needed. Simply place your file in the appropriate folder
and run the app with `npm run dev`. The JavaScript will be compiled at
runtime.

## Handling errors

Use the `alertMessage` utility (in `src/shared/`) to create an error message
to display to the user. You can display the message to the user by using
[window.alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert).
For example:

```typescript
window.alert(alertMessage(someError))
```

You can also simply throw an error; if it is not caught anywhere else, the
top-level framework will display it in an error dialog.
