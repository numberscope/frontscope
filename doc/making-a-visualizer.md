## Building a Visualizer

Big picture, every visualizer needs to implement the interface defined in
`VisualizerInterface.ts` which specifies the basic expectations of a
visualizer. (See below for the easy way to do this.) This interface includes
the following data and methods:

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

### The easy way

The simplest and fastest way to set up your visualizer is to use the `p5.js`
library to create its graphical output. You can do this by extending the
`P5Visualizer` base class. This approach guarantees that you will implement
the necessary interface. However, you will still need to supply your
collection of `params`, and provide the details of your `checkParameters`. You
can optionally implement the `inhabit` function if you have initialization you
want performed whenever the visualizer is inserted onto the page, but be
certain to call `super.inhabit` therein to get the standard P5Visualizer
initialization as well.

You shouldn't need to implement `show()`, `stop()`, or `dispose()`, but you
can implement a `setup()` function as usual with [p5](https://p5js.org/learn/)
if there are any one-time graphical operations you want to do, like drawing a
background or specifying colors, etc. If you do create such a function, in it
you _must_ call `super.setup()` to begin with the standard setup, as it
creates the p5 canvas for you. Finally, you should definitely create a
`draw()` function as usual with p5; it is still a good idea to start with
`super.draw()`.

There are also a number of functions like `keyPressed()` or `mouseClicked()`
that you can implement to handle various interactions with your visualization.
See the [p5 documentation](https://p5js.org/reference) for details on these.

Some of the previously existing visualizers provide good starting points to
see how to extend the base P5Visualizer class.

### Example: `Differences.ts`

<!-- TODO: This section should definitely be moved into Differences.ts, and
     either linked to or extracted from there.
-->

If you open this file, located in `src/visualizers/Differences.ts`, and follow
along, you'll notice that it begins by setting its name. Then it creates the
two user-settable properties that control its behavior. Next, it specifies its
`params` object that describe how these two properties should appear in the UI
(look in `src/shared/Paramable.ts` or other visualizers for all of the options
you can set in the params object).

In `checkParameters`, the versions of the control values in the params object
are checked for consistency. This visualizer only has one validation check. It
makes sure that the `number` is no less than the `levels`. If that is not the
case, it invalidates the status and adds an error message that is displayed to
the user on the settings popup. All these specific validation checks are of
course unique to each visualizer.

If the checks pass and a valid ValidationStatus is returned, the param values
are copied into the top-level properties of the visualizer. That's why you
will see them used directly at the top level in the rest of the visualizer
code.

Note there's no constructor for the Differences class; generally the default
constructor supplied by the base class does everything you need.

In `inhabit`, the Differences visualizer fills in the default value of the
`levels` property in case it was unset in the parameters dialog. It also
performs a consistency check between the sequence being visualized and the
parameters. This check could not be performed in `checkParameters` because at
the time the parameters are being manipulated, the visualizer has not yet been
associated with any sequence.

There is no special `setup` needed for the Differences visualizer beyond the
standard one.

Finally, the `draw` function displays the sequence values and their successive
differences, using standard p5 functions called on the sketch object. Note
that the Differences visualizer assigns `this.sketch` to a local variable.
This approach is used both for convenience of not having to repeat
`this.sketch` multiple times, and because some validation of the current state
of the visualizer is performed when `this.sketch` is accessed; using it from a
local variable prevents those checks from being re-executed.

#### Where to put your visualizers

Place your new visualizer in `src/visualizers`, named in PascalCase (capital
first letter of every word, no spaces). Also make sure your source file
contains an `exportModule` describing your visualizer, as in the
Differences.ts example, so that the menu of visualizers displayed in the
frontscope will pick up your new visualizer and allow it as an option. (There
are more details on this "exporting" step below.)

#### Creating params and assigning their values

If you have a lot of params, the specification of the `params` object gets
rather long. Unfortunately, we want TypeScript to be able to see the types of
the value properties for each individual param. So they should generally be
initialized to the same contents as the top-level properties of the visualizer
that they correspond to. So currently there is not a practical way to move
that long specification outside of the Visualizer class definition.

These params will be used by the frontend engine to build the UI display that
asks the user to set the values. Currently, when the use clicks the "save"
button, the values are validated, and if validation is successful, they are
copied to the corresponding top-level properties of the visualizer. All of
this is done for you by the infrastructure; you just need to write the
`checkParameters()` method that decides if the parameter values are OK to use,
and returns a ValidationStatus object accordingly.

#### Params vs. top-level properties

A good way to think about params is that these are the user-facing structures
that you create to ask for values, which are then injected into top-level
properties of your visualizer. Movement of data in that direction is an
automatic part of validation, occurring when the user clicks 'save'.

On the other hand, you may need to update some of the top-level properties in
the course of your visualizer's operation: maybe you have it responding to
keystrokes, or it fills in some unspecified values, or what have you. If you
change any of the top-level properties corresponding to params, you should
update the params to reflect that change so that the new values will show up
in the UI. You can do that by calling `this.refreshParams()`. You can see an
example of this in the Differences.ts `inhabit` method.

#### Drawing your sequence

To access each sequence element, use `this.seq`. This is a `SequenceInterface`
object, which is guaranteed to have a method `getElement(n)` that returns the
`n`-th element in the sequence.

If your visualization is a single static picture, call the `noLoop()` function
on the sketch when you are done drawing (the Differences visualizer does
this). Otherwise, p5 will continue to call your draw function repeatedly, so
that it could respond to events like mouse clicks or key presses, or so it can
add to or animate what it has drawn. For example, some visualizers add one
more sequence entry with each "frame" (i.e., each call to `draw()`).

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
