## Building a Visualizer

Big picture, every visualizer needs to implement the `visualizerInterface.ts`
which provides the basic expectations of a visualizer. See below for the easy
way to do this. These include the following:

1. `isValid`: a boolean that is used to determine if the visualizer is ready to
   draw. Generally this will be set automatically based on what you return from
   the `checkParameters` method (see below).
2. `params`: The engine expects all visualizers to have parameters that can be
   set by the user, though these parameters can be empty. This `params`
   property is an object mapping parameter names to (plain) objects that
   satisfy the `ParamInterface` -- basically, they describe the parameter,
   giving whether it is required, how it should be labeled and presented
   in the UI, and so on.
3. `seq`: A sequence object that implements the sequence interface. Usually, the
   way this is handled is to set `seq` to be an instance of the default sequence
   (`sequenceClassDefault`) upon creation, until the visualizer `initialize()`
   is called, at which point, its `seq` is set to the sequence that the user
   selected. This allows the same visualizers to remain live while swapping
   sequences in and out.
4. `sketch`: a `p5` sketch object already live on the page. Usually, this will
   be set by the module manager when a visualizer is created, so all you need to
   do is provide that `initialize()` sets `this.sketch = sketch` (see the
   `visualizerDefault` for an example).
5. `initialize(sketch, seq)`: a method that is called by the engine to prepare
   the visualizer for drawing. Good practice is to check that `isValid` is true
   before intializing, though you are free to initialize however you like.
6. `validate()`: must return `ValidationStatus` object that indicates to the
   engine that the visualizer is valid. The engine will call `validate` before
   it calls `initialize` and will only proceed if the `isValid` property of the
   `ValidationStatus` object is `true`. Otherwise it will display the error.
   Generally speaking, the framework takes care of these bookkeeping details and
   you can simply implement the `checkParameters()` method that just has to
   examine if parameter values are sensible and return a ValidationStatus
   accordingly.
7. `setup()`: a method that acts on the p5 sketch to set up the canvas for
   drawing. Called just prior to draw.
8. `draw()`: the method that does the bulk of the visualizer's work. This is
   where you can get creative. Generally acts on the sketch p5 object and
   actually draws the visualization. For details on this, refer to the p5
   documentation.

### The easy way

The simplest and fastest way to set up your visualizer is to extend the
`VisualizerDefault` class. This guarantees that you will implement the
interface, however you will still need to supply your collection of `params`,
and provide the details of your `checkParameters`, `initialize`, `setup`,
and `draw` functions. The default class provides a rough
template for the best way to structure a visualizer.

The provided example visualizers are good starting points for how to extend the
default class.

### Example: `VisualizerDifferences.ts`

If you open this file, located in `src/visualizers/VisualizerDifferences.ts`,
and follow along, you'll notice that it begins by setting its name. Then
it has the two user-settable properties that control its behavior. Then it has
its `params` object that describe how these two properties should appear in the
UI (look in `src/shared/Paramable.ts` or other visualizers for all of the
options you can set in the params object).

In `checkParameters`, the versions of
the control values in the params object are checked for consistency.
This visualizer only has one validation check. It makes sure that the `number`
is no less than the `levels`. If that is not the case, it invalidates
the status and adds an error message that is displayed to the user on the
settings popup. All these specific validation checks are of course unique
to each visualizer.

If the checks pass and a valid ValidationStatus is returned, the param values
are copied into the top-level properties of the visualizer. That's why you
will see them used directly at the top level in the rest of the visualizer code.

Note there's no constructor for the VizDifferences class; generally the default
constructor supplied by the base class does everything you need.

#### Where to put your visualizers

Place your new visualizer in `src/visualizers`, named in PascalCase (capital
first letter of every word, no spaces).

#### Creating params and assigning their values

If you have a lot of params, the specification of the `params` object gets
rather long. Unfortunately, we want TypeScript to be able to see the types
of the value properties for each individual param. So they should generally
be initialized to the same contents as the top-level properties of the
visualizer that they correspond to. So currently there is not a practical way
to move that long specification outside of the Visualizer class definition.

These params will be used by the frontend engine to build the UI display that
asks the user to set the values. Currently, when the use clicks the "save"
button, the values are validated, and if validation is successful, they are
copied to the corresponding top-level properties of the visualizer. All of this
is done for you by the infrastructure; you just need to write the
`checkParameters()` method that decides if the parameter values are OK to use,
and returns a ValidationStatus object accordingly.

#### Params vs. top-level properties

A good way to think about params is that these are the user-facing structures
that you create to ask for values, which are then injected into top-level
properties of your visualizer. Movement of data in that direction is an
automatic part of validation, occurring when the user clicks 'save'.

On the other hand, you may need to update some of the top-level properties
in the course of your visualizer's operation: maybe you have it responding
to keystrokes, or it fills in some unspecified values, or what have you. If you
change any of the top-level properties corresponding to params, you should
update the params to reflect that change so that the new values will show
up in the UI. You can do that by calling `this.refreshParams()`.

#### Drawing your sequence

Returning to the example, `drawDifferences` is a helper function that
is not required, but simplifies the `draw` function later on. This particular
visualizer uses it to do the bulk of the drawing work.

There is an optional `setup` method that can be defined to prepare to draw.
However, this visualizer doesn't have any setup work to do, so the method is
not present here.

The method `draw` calls `drawDifferences` with some arguments and then stops
the sketch from drawing, as normally `draw` is called in a loop.

To access each sequence element, use `this.seq`. This is a `SequenceInterface`
object, which is guaranteed to have a method `getElement(n)` that returns the
`n`-th element in the sequence.

## Exporting a visualizer

The engine expects visualizers to be packaged in `visualizerExportModules` which
take as their arguments the name of the visualizer which is displayed in the UI.
You can also reference the name of the visualizer to maintain consistency,
though the `visualizerDifferences` sets it explicitly.

The other arguments in the export module are the visualizer itself
(`VizDifferences` in the example case, which is the name of the class we
created), and a description.

If you place the file containing your visualizer class definition with the
export module in the folder name `Visualizers`, the engine will automatically
package it up and include it in the list of available visualizers.

There is no compiling needed. Simply place your file in the appropriate folder
and run the app. JavaScript is compiled at runtime.
