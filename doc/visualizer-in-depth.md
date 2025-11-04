# A p5 visualizer, in detail

As on the [previous page](visualizer-basics.md), let's begin with a (more
detailed) diagram of the life cycle of a visualizer. This version represents
all of the methods that your Visualizer class might want to implement, extend,
or override to accomplish a variety of effects, as well as all of the
significant actions that might occur as someone explores sequences with your
visualizer.

````d2 layout="elk"
direction: down
classes: {
  init: {style: {
     stroke: red
     font-size: 18
     font-color: darkred
  } }
  parChg: {style: {
     stroke: orange
     font-size: 18
     font-color: chocolate
  } }
  seqChg: {style: {
     stroke: green
     font-size: 18
     font-color: darkGreen
  } }
  resize: {style: {
     stroke: purple
     font-size: 18
     font-color: indigo
  } }
  any: {style: {
     stroke: black
     stroke-width: 2
     font-size: 18
     font-color: black
  } }
  dot: {
    shape: circle
    width: 10
  }
  method: {
    height: 40
    style: {
      border-radius: 10
      font-size: 20
    }
  }
  returns: {
    shape: cf-many
    style.opacity: 0.0
  }
  deflt: {
    style: {
      stroke-width: 3
      stroke-dash: 5
    }
  }
  pseudolabel: {
    shape: text
    style: {
      italic: true
      font-size: 16
    }
  }
}

secret: {
   label: ""
   near: center-left
   style: {opacity: 0.0}
   Start: "" {
      class: [dot; init]
      style.fill: red
   }
   dummy: "" {
      height: 1115
      style.opacity: 0.0
   }
   Start -> dummy {style.opacity: 0.0}
}

early: {
  direction: right
  label: "can't use\nsequence or sketch       "
  label.near: top-right
  style.fill: "#fee"
  style.font-size: 18
  Init: |md
    ### Create visualizer object
    ```txt
    property initializers,
    constructor
    ```
  |
  SPC: |md
    ### Parameter checks
    ```txt
         individual
    validate() functions
    ```
  |
  Init -> SPC: {class: init}
}

secret.Start -> early.Init: "init (page load/\nvisualizer change)" {
   class: init
   style.font-size: 20
}

mid: {
  label: "    sequence available,\nno sketch"
  label.near: top-left
  style.fill: "#ffe"
  style.font-size: 18
  CheckPar: "checkParameters()" {class: method}
  parUp: "parameter\nchange" {class: [pseudolabel; parChg]}
  checkPar -- parUp {class: parChg}
  ParChg: "parametersChanged()" {class: method}
  parUp -> ParChg {class: parChg}
  Reset: "reset()" {class: method}
  checkPar --> Reset: "init" {class: init}
  checkPar --> Reset: "sequence\nchange" {class: seqChg}
  ParChg -> Reset {class: [deflt; parChg]}
  PreSk: "presketch()" {class: method}
  Reset -> PreSk: "init" {class: init}
  Reset -> PreSk: "sequence\nchange" {class: seqChg}
  Reset -> PreSk: "canvas\nresize" {class: resize}
  routingQ: "" {class: [dot; resize]; width: 2}
  routingR: "" {class: [dot; resize]; width: 2}
  routingQ -- routingR -> Reset: {class: [deflt; resize]}
  routingZ: "" {class: [dot; any]; width: 1}
  PreSk <-- routingZ {
     class: any
     source-arrowhead: "in any\nevent" {shape: cf-many}
  }
}
early.SPC -> mid.CheckPar: "init" {class: init}
early.SPC -> mid.CheckPar: "parameter\nchange" {class: parChg}
late: {
  near: center-right
  direction: up
  label: "sequence & sketch available"
  label.near: top-right
  style.fill: "#efe"
  style.font-size: 19
  Setup: "setup()" {class: method}
  Draw: |md
     ### p5 Draw Loop
     ```txt
     repeatedly calls
       draw() method
     for you; you can
     stop()/continue()
       in any method
     ```
  | {style.font-size: 20}
  Setup -> Draw
  Draw -> Draw
  routingP: "" {
     class: [dot; parChg]
     width: 1
  }
  Draw -- routingP {class: parChg}
  Resize: "resized()" {class: method}
  Draw -> Resize: "canvas\nresize" {class: resize}
  Resize <-> Draw {
    class: resize
    source-arrowhead: "  (returns\nfalse)" {
       shape: cf-many
    }
  }
  Event: "" {class: dot; style.fill: blue}
  Handler: "(handler method)" {class: method}
  Event -> Handler: "mouse click/\nkey press/\netc."
}
spacer: "" {
  width: 200
  style.opacity: 0.0
}

mid.routingQ -> late.Resize: "canvas\nresize" {
    class: [deflt; resize]
    target-arrowhead: "(returns    \ntrue)" {shape: cf-many}
}
mid.Reset -> late.Setup: "parameter\nchange" {class: parChg}
mid.routingZ -> late.Setup {class: any}
late.routingP -> early.SPC: "parameter\nchange" {class: parChg}
late.Draw -> mid.CheckPar: "    sequence\nchange" {class: seqChg}

legend: {
  near: top-right
  label.near: top-left
  direction: right
  method: "classMethod()" {
    class: method
    style.opacity: 0.6
  }
  otherCode: |
    ### Other code section
    ```txt
    details
    ...
    ```
  | {style.opacity: 0.6}
  method -> otherCode: "action/event" {style.font-size: 18}
  method -> otherCode: "default behavior\n(can be overridden)" {class: deflt}
  style.opacity: 0.4
}
````

Here, we systematically review all properties and methods of P5Visualizer.
Information already on the [introductory page](visualizer-basics.md) is not
repeated here, but there are more items as well as additional detail on many
previously mentioned items.

### Parameters

By declaring that the `paramDesc` object you build your Visualizer class with
`satisfies GenericParamDescription`, you gain two advantages:

1. TypeScript checks that all of the
   [`ParamInterface`](../src/shared/Paramable.md) objects describing
   parameters in your `paramDesc` conform to the requirements, and
2. TypeScript assigns a "narrow" type to the object literal giving the
   `paramDesc` so that the corresponding properties in your Visualizer
   instances will be assigned the correct realized types.

Note that if your visualizer code internally changes one of the properties
corresponding to a parameter (for example, after the user zooms the view you
update the `magnification` value which is a parameter of your visualization),
you should immediately call the `refreshParams()` method. This method will
copy the new values back into the properties used for controlling the user
interface (UI), so that they will be visible on screen.

### Determine validity of parameter values

There are actually three ways the validity of user input can be checked. They
are listed here in order of preference. The first is automatic type checking,
based on the `type` property of a parameter. Type errors are announced by the
UI next to the relevant input field.

The second consists of storing a function in the `validate` property of a
parameter in the paramDesc structure, as described in the
[introductory page](visualizer-basics.md#determine-validity-of-parameter-values-often-used).
Further detail is available [here](../src/shared/Paramable.md). Such checks
concern only that single parameter. Any errors or warning messages from these
checks will immediately be displayed to the user next to the relevant input
field.

The third provides an opportunity to check overall consistency among multiple
parameters. For example, it may be that the number of items in two separate
list parameters must be equal. Such checks can be performed in the function
`checkParameters()`, which is called whenever parameters are changed by the
user. This method gives you a chance to check the parameter values and prompt
the user to correct any invalid ones. In this function, you can provide errors
or warning messages to be displayed at the top of the parameters panel by
placing them in the returned status object. You may also or instead put errors
or warnings next to a specific parameter: suppose the parameter is named
`speed`. Then you can write `this.statusOf.speed.addWarning(message)`, for
example. Note that if you add an error to any individual parameter in this
way, you should also make sure that `checkParameters()` returns an invalid
status.

By the time `checkParameters()` is called, the visualizer's sequence should be
sufficiently initialized that you can depend on its `first` and `last` (index)
values, in case you need those for validation. (And hence, `checkParameters()`
will be called again if the sequence changes.) On the other hand, the sketch
will not necessarily yet be available.

You can do sketch-dependent validation in [`setup()`](#set-up-for-drawing), as
described below. By that point (any time in the life cycle beyond
`checkParameters()`), errors you add to the parameters or the visualizer's
`validationStatus` won't block the new parameters from taking effect as they
would if handled in `checkParameters()`, but at least the person running the
visualization will be notified in the UI. Another fine point in this case is
that since `validationStatus` and `statusOf` properties are not by default
reset when `setup()` is again called, you may need to be careful that
additional copies of your error or warning do not accumulate as `setup()` is
repeatedly called (say for the sake of resizing the screen).

Finally, note that `checkParameters()` is called with _tentative_ parameter
values, and there is no guarantee that those parameter values will actually be
loaded into the visualizer. So (a) only access the values through the
passed-in `params` object, not through the visualizer itself, and (b) don't
start setting up for visualization using those values: leave that to one of
the set-up functions discussed [below](#set-up-for-drawing).

### Name and description

The [introductory page](visualizer-basics.md#name-required-and-description)
notes to put the name in a static `category` property. This guideline arises
from a convention that Visualizer instances do not have individual names, but
instead that their `name` properties are the same for all instances of the
same class. But there still _is_ a `name` property; the base class simply
fills it in from the `category`, and makes it read-only.

### Other properties

#### Status of mouse primary button

A P5Visualizer automatically maintains a property `mousePrimaryDown` that is
true when the primary mouse button is in its pressed/down state. This property
is in essence identical to `sketch.mouseIsPressed` but (a) it specifically
only pays attention to the primary mouse button, and (b) has its value
maintained more reliably in the face of events outside the sketch.

#### Vue and reactive objects

It is important to know that Vue will instrument (i.e., insert code into) your
Visualizer class to be a "reactive" object so that changes to its properties
can trigger changes to what's displayed in the browser window. This
instrumenting is necessary to support the two-way interaction between
parameter controls in the UI and corresponding properties of your visualizer.
However, the instrumentation can on occasion be a nuisance, causing (for
example) update of internal state properties (that may have nothing to do with
the browser display) to become extremely expensive or even behave erroneously.
Primitive data fields (numbers, strings, bigints, and so on) are not
susceptible to this problem, but object data (Arrays, Maps, plain objects, and
the like) can very much be. If you suspect that some object in your internal
state may be falling into this trap, you are advised to call the Vue
`markRaw()` function on it before you store it in a data property defined in
your class. That call tells Vue not to instrument its argument object at all.
It means that changes to that object cannot directly affect the browser view;
but presumably you are already calling `refreshParams()` to explicitly update
the view when needed, so there is unlikely to be a problem. Note, however,
that you should not call `markRaw()` on the values of _parameters_ even if
they are objects, as in the case of `ParamType.NUMBER_ARRAY`; doing so could
prevent proper display updating.

#### p5 color values

Many visualizers want to manipulate and store p5.Color objects in data
properties. TypeScript throws a bit of a hitch into this process. If you
declare a property of your Visualizer class to have type `p5.Color`, it will
naturally insist that you initialize that property, either on the line in
which you declare it, or in the class constructor function. However, the p5
system is (as of this writing) designed so that there is no way to construct a
p5.Color object without access to the p5 sketch in which the color is to be
used. But at Visualizer construction time, there is no p5 sketch available --
it doesn't exist yet.

As a workaround to this impasse, `src/visualizers/P5Visualizer.ts` exports
`INVALID_COLOR`, a value forcibly typed to `p5.Color` that you can use to
initialize your p5.Color properties. Then in the `setup()` method, you can
fill in these properties with the actual colors you want them to represent.
Make sure you do fill them all in -- if you attempt to draw with an
`INVALID_COLOR`, p5 will crash.

### React to parameter changes

Any time a parameter value is assigned into its corresponding property in your
Visualizer object, the `parametersChanged()` method of your Visualizer is
called with a Set of the parameter name(s) that changed. The default
implementation of this method in the P5Visualizer base class resets the
display of the visualizer so that it re-runs from the beginning. So you likely
do not need to modify that behavior. However, there could be a specialized
situation in which you might want to: imagine you are progressively drawing a
diagram and would like to simply continue in the middle of drawing with a
newly-specified color when its parameter changes (rather than re-drawing the
entire thing from the beginning with that new color). In that case, you could
implement an altered `parametersChanged()` that would detect the situation and
avoid the reset.

### Inhabit a page element

Each time the visualizer is inserted into a page element, the `inhabit()`
function is called, giving you access to the element the visualizer is about
to inhabit. If you don't need information from the web page your visualizer is
running in, or access to its document object model (DOM), you should be able
to just inherit the base class `inherit()` and not implement it in your
Visualizer class. The full details on this method are in the
[visualizer interface](../src/visualizers/VisualizerInterface.md)
documentation.

### Handle aspect ratio

By default, a visualizer does not set its own sketch dimensions (width and
height). Instead, the Numberscope UI assigns these dimensions, providing the
visualizer with the largest available canvas for the user's setup. After
`setup()` is run, the dimensions are stored in `this.sketch.width` and
`this.sketch.height` and the visualizer should handle all its drawing with
respect to these.

In some cases, a visualizer design may run best in a fixed aspect ratio, such
as a square canvas. In this case, you can request a specific aspect ratio by
implementing `requestedAspectRatio()` to return the desired ratio as a number
representing width/height. In this case, the UI will provide a canvas of the
maximal size with that ratio.

### Set up for drawing

The [introductory page](visualizer-basics.md#set-up-the-visualizer-often-used)
covered the `setup()` method of a P5Visualizer that is called once when a new
graphics context `this.sketch` becomes available. However, there is an earlier
opportunity to do pre-computation as well. That is the `presketch()` method,
which runs asynchronously, meaning that the browser will not be blocked while
this function completes. This facility is not a part of p5.js, but a part of
the P5Visualizer design. The `presketch()` method is called by the framework
with one argument, representing the size of the canvas to be created as a
ViewSize object with number fields `width` and `height`.

If you implement `presketch()`, begin by calling
`await super.presketch(size)`, which will initialize the sequence that the
visualizer is viewing. After this call, you have access to the values of the
sequence, so you can do sequence-dependent initialization here. It is OK to
set up internal data variables in this method. For example, this is a good
place to populate an array with time-consuming precomputed values you will use
repeatedly during the sketch. However, in `presketch()` you still have no
access to the p5 canvas or the `this.sketch` object.

Note also that `presketch()` is called when there is a new visualizer, when
the sequence changes, when the canvas size changes, and when you reload the
page or visit a new Numberscope URL. It is not called when visualizer
parameters change. So if there is initialization you want to do only on these
more signifcant changes but not on parameter changes, then `presketch()` is a
good method.

When a visualizer is resized, or the restart button on Numberscope is pressed,
the class function `reset()` is called. By default, a new canvas is created on
a `reset()` (and so `setup()` will be called). In this event, `presketch()`
will only be called if that new canvas is a different size than the previous
one. However, the visualizer object constructor is not re-run and any data
stored in variables in the visualizer object persists. Those default behaviors
mean that you have the option to forgo re-doing expensive pre-computations: if
they don't need sketch access, you can put such calculations in `presketch()`.
But the flip side is that you can't rely on property initializers, your class
constructor, or on (say) `checkParameters()` to put your other visualizer
instance properties in a "clean" state.

For example, if you need some array to be all zeros when you start drawing
your visualization, and previous calls to `draw()` may have changed some of
those array entries, you need to zero it out in `setup()` because after a
parameter change, that's the only preparation function that will by default be
called before going back into the drawing loop.

For even greater customization of what happens when, you can override/extend
`reset()` from the `P5Visualizer` base class, or you can define a `resized()`
method for behavior that only occurs when the canvas is resized. Note that in
this latter case, you can control whether the framework does the `reset()` for
you: return `true` if you have handled any need to reset (and so the framework
should NOT call `reset()`), and false if you do want the framework to
`reset()`.

### Draw your visualization

The P5Visualizer provides a utility method `hatchRect(x, y, w, h)` that draws
a rectangle with corner at (x, y) and width w and height h, filled with
diagonal hatch lines.

### Show or stop the visualization; depart from a page element

You shouldn't frequently need to implement `show()`, `stop()`, or `depart()`.
Briefly, `show()` begins the drawing loop for the first time, `stop()` halts
or limits the duration of the drawing loop, and `depart()` removes the
visualization from displaying in the browser and cleans up any resources it
might be using. You can learn more about them from the
[visualizer interface](../src/visualizers/VisualizerInterface.md)
documentation, and from how they're implemented in the `P5Visualizer` base
class.

### Draw the visualization

Note that accessing `this.sketch` triggers some consistency checks before the
actual sketch object can be returned. Hence, to eke out the maximum
performance in your `draw()` function (if you find that you are
computationally bound in the frame rate you can achieve), we recommend storing
its value as a local constant before the first time you need it in `draw()`.
This tactic avoids redundant checks.

### Stop and start animation

The
[introductory page](visualizer-basics.md#stop-and-start-animation-often-used)
points out that you can call `continue()` from an event-handling function to
ensure that the visualization will be redrawn. Actually, you can call
`continue()` from anywhere in your code that the sketch is available (see the
lifecycle diagram above) and it will have a similar effect. This mechanism is
most often useful in event handlers, but could be helpful elsewhere. Moreover,
suppose when you call continue you know there are a limited number of frames
you will need to draw, but there isn't otherwise logic in your `draw()`
function to `stop()` again when those are done. In that case, you can
immediately call `stop(n)` after the `continue()` and only _n_ more frames
will be drawn, after which the visualizer will automatically stop drawing.

Again, you can call this form of `stop()` with an argument anywhere the sketch
is available. So if you know you only want your visualization to run for 100
frames, you could just call `this.stop(100)` right in your `setup()` function.

### Respond to user interactions

Here is a list of all of the event handling methods that you may implement in
your Visualizer. Each is called when the corresponding event occurs on the
browser, often with the JavaScript `Event` structure as shown.

```
{! ../src/visualizers/P5Visualizer.ts extract:
    start: class.WithP5
    stop: setup
    replace: ['\s*([^{}]*)']
!}
```

### Display a simple informational popup

As a convenience and to prevent code duplication among Visualizers derived
from P5Visualizer, the base P5Visualizer class provides a simple informational
popup/tooltip facility, via the following instance method:

`this.simplePopup('Display me', [atX, atY])`

-   Shows the popup with the given text ('Display me' in this example) at the
    given X and Y coordinates (here `atX` and `atY`). If the text to display
    is empty (the default), hides the popup instead; thus, you can simply call
    `this.simplePopup()` to hide the popup. The popup starts invisible and
    will not be displayed unless/until there is a call to this method with a
    non-empty first argument.

The popup is styled to coordinate with the overall frontscope visual design;
there is not currently any mechanism to alter its styling.

### How to report errors

There are three ways to let people interacting with a visualizer know that
something unexpected has happened. The first has been mentioned above: at any
time you can add errors or warnings to the `validationStatus` property or the
values of the `statusOf[PARAMETER_NAME]` property. These will be reflected in
the appropriate place in the parameter tab for the Visualizer.

The second is with the [alertMessage](../src/shared/alertMessage.md) utility.
And the third is just to throw an error. If it's not caught anywhere else, the
visualizer framework will show it in an error dialog.

### Getting random numbers

Do not use the built-in `Math.random()` random number generator, because there
is no practical mechanism for making its output reproducible for testing
purposes. Instead, obtain random numbers using the provided `math` module,
along the following lines:

```
import {math} from '@/shared/math'
import {P5Visualizer} from '@/visualizers/P5Visualizer'

class DiceVisualizer extends P5Visualizer({}) {
    ...
    draw() {
        ...
        // Roll a die (generate a number 1, 2, 3, 4, 5, or 6,
        // all equally likely, at random):
        const myRoll = math.randomInt(1, 7)  // upper limit is exclusive.
        ...
```

For more details, see the [math documentation](../src/shared/math.md).
