import type {SequenceInterface} from '../sequences/SequenceInterface'
import type {ParamableInterface} from '../shared/Paramable'

/** md
# Visualizers: Behind the Scenes
In the guide to [making a visualizer](../../doc/visualizer-overview.md), we
saw how to extend the
[`P5Visualizer`](../../doc/visualizer-in-depth.md#a-p5-visualizer-in-detail)
base class. Now, let's take a peek at how a base class works internally.

This page will be most useful to you if you want to write a new base class.
(See the [technical details](#technical-details) below as to why you can't
just write a visualizer with no base class.) However, you can also use the
information here to alter the default behavior of a base class you're
extending. By overriding methods like `inhabit()`, `show()`, `stop()`, and
`depart()`, you can customize your visualizer's behavior more deeply than
usual.

Behind the scenes, a visualizer base class is an implementation of the
[visualizer interface](#the-visualizer-interface). To support parameters, the
base class also has to implement the
[parameterizable object interface](#the-parameterizable-object-interface). To
write a new base class, you'll have to implement these interfaces yourself.
That means including all the required properties and methods, and making sure
they behave in the way the engine expects.

And just as a reminder, only generate random numbers (if needed) using mathjs;
see the [math documentation](../shared/math.md).

**/

interface VisualizerConstructor {
    /**
     * Constructs a visualizer
     * @param seq SequenceInterface The initial sequence to visualize
     */
    new (seq: SequenceInterface): VisualizerInterface
    // Enforce that all visualizers have standard static properties
    category: string
    description: string
}

export class VisualizerExportModule {
    visualizer: VisualizerConstructor
    category: string
    description: string

    constructor(
        viz: VisualizerConstructor,
        category?: string,
        description?: string
    ) {
        this.visualizer = viz
        this.category = category || viz.category
        this.description = description || viz.description
    }
}

export interface ViewSize {
    width: number
    height: number
}
export const nullSize = {width: 0, height: 0}
export function sameSize(size1: ViewSize, size2: ViewSize) {
    return size1.width === size2.width && size1.height === size2.height
}

// A visualizer may be either unmounted, drawing, or stopped:
export const DrawingUnmounted = 0
export const Drawing = 1
export const DrawingStopped = 2
export type DrawingState =
    | typeof DrawingUnmounted
    | typeof Drawing
    | typeof DrawingStopped

/** md
## The visualizer interface

In the list below of properties of this interface, methods are shown with their
arguments and return types, and data properties are shown just with their
types. All of these properties, except for `resized()`, must be implemented
by any visualizer, so typically a base class will provide default
implementations for all or almost all of them.

**/

export interface VisualizerInterface extends ParamableInterface {
    /** md */
    usesGL(): boolean
    /* **/
    /** md
:   Should return true if this visualizer requires a WebGL graphics context
    (of which a limited number are available concurrently in a browser),
    false otherwise.
<!-- -->
    **/
    /** md */
    view(sequence: SequenceInterface): Promise<void>
    /* **/
    /** md
:   Load _sequence_ into the visualizer for it to display. This _sequence_ must
    be stored by the visualizer so that the drawing operations in later
    method calls will be able to access it. This method should not itself do
    any drawing, but if the visualizer has already been `show()`n, it must
    arrange that the display will change to show _sequence_ at the next
    opportunity. Note, as indicated by its Promise return type, this method
    will typically be `async` (because it may need to access some information
    about _sequence_ in preparation).
<!-- -->
    **/
    /** md */
    requestedAspectRatio(): number | undefined
    /* **/
    /** md
:   Specify the visualizer's desired aspect ratio for its canvas. If it
    returns a number _n_, it should be positive, and _n_ gives the desired
    aspect ratio as width/height, meaning:

    | Range     | Shape |
    | --------- | ----- |
    | 0 < n < 1 | The canvas is taller than it is wide (portrait orientation) |
    | n = 1     | The canvas is square |
    | n > 1     | The canvas is wider than it is tall (landscape orientation) |

    If the visualizer does not wish to request a specific aspect ratio and
    will instead work with whatever is given, this method may return
    `undefined` instead. In that case, frontscope will provide the largest
    canvas that will fit in the available space.
<!-- -->
    **/
    /** md */
    inhabit(element: HTMLElement, size: ViewSize): Promise<void>
    /* **/
    /** md
:   Insert the display of the visualizer into the given DOM _element_. This
    _element_ is typically a `div` whose size is already set up to comprise
    the available space for visualization. The visualizer should remove
    itself from any other location it might have been displaying, and prepare
    to draw within the provided _element_. It must be safe to call this with
    the same _element_ in which the visualizer is already displaying (and the
    "reset" consisting of removal and preparation should still happen).
    The size provided in the call to `inhabit()` is the size the visualizer
    should assume, and it will respect the preferences returned by
    `requestedAspectRatio()`. In the rare case the visualizer needs the
    dimensions of the full space that was available (beyond the requested
    aspect ratio), it can just directly query the size of _element_.
    Similarly to `view()`, this method should not itself do any drawing, and
    will typically be `async`.
<!-- -->
    **/
    /** md */
    show(): void
    /* **/
    /** md
:   Start display of the visualization. When this is called, you can (and
    should!) actually start drawing things. However, if the visualizer is not
    currently `inhabit()`ing an element, this call should do nothing.
<!-- -->
    **/
    /** md */
    stop(max?: number): void
    /* **/
    /** md
:   Stop drawing the visualization after at most _max_ more frames. If
    _max_ is not positive or not specified, stops immediately. If _max_ is
    `Infinity`, this call has no effect. You must be able to clear a
    previously set maximum frame count by calling the `continue()` method.
<!-- -->
    **/
    /** md */
    continue(): void
    /* **/
    /** md
:   Continue drawing the visualization, i.e., clear any frame limit previously
    set by a call to `stop()`.
<!-- -->
    **/
    /** md */
    drawingState: DrawingState
    /* **/
    /** md
:   The visualizer must maintain the value of its _drawingState_ property to
    indicate the current status of whether it is actively drawing, via one
    of the following three constants (the only values of type DrawingState):

    +------------------+---------------------------------------------------+
    | Value            | Meaning                                           |
    +==================+===================================================+
    | DrawingUnmounted | The visualizer is currently not `inhabit()`ing    |
    |                  | any DOM element.                                  |
    +------------------+---------------------------------------------------+
    | Drawing          | The visualizer is actively drawing in an element. |
    +------------------+---------------------------------------------------+
    | DrawingStopped   | The visualizer is not currently drawing, although |
    |                  | `inhabit()`ing an element.                        |
    +------------------+---------------------------------------------------+

    For example, suppose a visualizer has successfully `inhabit()`ed an
    element, been `show()`n there, `stop()` has been called, and any given
    max frame count has expired. Then the visualizer's _drawingState_ should
    be equal to `DrawingStopped`. If `continue()` is then called, the
    _drawingState_ should revert to `Drawing`.
<!-- -->
    **/
    /** md */
    depart(element: HTMLElement): void
    /* **/
    /** md
:   Remove the visualization from the given DOM _element_, release its
    resources, and do any other required cleanup. It is an error to call this
    method if the visualization is not currently `inhabit()`ing any element.
    If the visualization is currently `inhabit()`ing a **different** location
    in the DOM than _element_, it is presumed that the realization within
    _element_ was already cleaned up, and this can be a no-op. Note that after
    this call, it must be ok to call `inhabit()` again, possibly with a
    different location in the DOM, to reinitialize it.
<!-- -->
    **/
    /** md */
    resized?(size: ViewSize): Promise<boolean>
    /* **/
    /** md
:   This method, if it exists, is called by the frontscope when the size of
    the visualizer should change, either because the window is resized, or
    the docking configuration has changed. Visualizer writers should take
    care to resize their canvas and to make sure that any html elements it
    created aren't wider than the requested width. The provided _size_ is the
    available space given the new configuration, cut down to respect the
    `requestedAspectRatio()`. Not implementing this method will mean that the
    visualizer is reset (by re-calling `inhabit()` and `show()`) on resize.
    If it is implemented, returning true means that the visualizer has itself
    handled the resize (so it will **not** be reset by the frontscope), and
    so returning false means that it will be reset. Note that it is typically
    `async`.
<!-- -->
    **/
}

/** md
### Technical details

Note that every Visualizer class instance must be a `Paramable` object, and
we want the code in a visualizer to be able to directly access its parameters
with correct TypeScript types. For example, if the visualizer has a
parameter `speed` of `ParamType.NUMBER`, then a visualizer method should be
able to write `this.speed` and have it be of type `number`. These types
are deduced from the "parameter description" object (see its
[documentation](../../doc/visualizer-basics.md#parameters-often-used)).
Because of limitations on how TypeScript can inherit from generic classes,
these requirements mean that a Visualizer base class cannot be an ordinary
generic class.

Instead, it should be a generic "class factory function" with a type
parameter `PD` for the parameter description, and taking an argument of that
type. Then _within_ the class factory function, you can define the base
class. Finally, return the constructor of the base class from the factory
function, with its return type cast to its "natural type" intersected with
`ParamValues<PD>` (using the TypeScript `&` operator on types). It's this
cast that ensures classes derived from the return value of your base class
factory function will have their parameter properties properly typed by
TypeScript. That way, supposing your function is called `MyVisualizerBase`
(and it only takes the parameter description as an argument), then anyone
implementing a visualizer using your base class can just write

```
class TheirVisualizer extends MyVisualizerBase(paramDesc) {
    // Their code goes here...
}
```

For an example of a working class factory function, see the code in
[`src/Visualizers/P5Visualizer.ts`](https://github.com/numberscope
/frontscope/blob/main/src/visualizers/P5Visualizer.ts).

<!-- Extract the remainder from Paramable.ts, using xmd instead of md -->
{! ../shared/Paramable.ts extract:
    start: '^\s*[/]\*\*+\W?xmd\b' # Opening comment with xmd
    stop: '^(.*?)\s*(?:/\*.*)?\*\*[/].*$' # comment closed with double *
    # Note that content preceding the comment close will be
    # extracted, except possibly for a comment open if that's needed.
!}
**/
