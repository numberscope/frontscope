# Visualizers: Behind the Scenes

<!-- TODO:
     * This information/page needs either to be in, or extracteed from,
       the relevant source files to maintain DRYness and "doc-code adjacency"
       principles.
     * If we continue to use tables, need to get the text to wrap in
       the description part. Perhaps install and use
       https://pypi.org/project/markdown-grid-tables/
-->

In the guide to [making a visualizer](making-a-visualizer.md), we saw how to
extend the
[`P5Visualizer`](making-a-visualizer.md#making-a-p5-visualizer-in-detail) base
class. Now, let's take a peek at how a base class works internally. This page
will be most useful to you if you want to write a new base class, or to build
a visualizer so different from anything else that it shouldn't have a base
class. However, you can also use this knowledge to override the default
behavior of a base class you're extending. By overriding methods like
`inhabit()`, `show()`, `stop()`, and `depart()`, you can customize your
visualizer's behavior more deeply than usual.

Behind the scenes, a visualizer base class is an implementation of the
[visualizer interface](#the-visualizer-interface). To support parameters, the
base class also has to implement the
[parameterizable object interface](#the-parameterizable-object-interface). To
write a new base class, or to build a visualizer without one, you'll have to
implement these interfaces yourself. That means including all the required
properties and methods, and making sure they behave in the way the engine
expects.

## Visualizers

Source: `VisualizerInterface.ts`.

### The visualizer interface

| Method             | Required behavior                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visualization()`  | Returns a string saying what type of visualizer this is. Typically, this would depend only on the class of the visualizer, rather than varying from instance to instance.                                                                                               |
| `view(seq)`        | Load the given sequence into the visualizer, so that the drawing operations in later function calls will be able to access it. This method should not do any drawing.                                                                                                   |
| `inhabit(element)` | Insert a view of the the visualizer into the given `HTMLElement`. This element is typically a `div` whose size is already set up to comprise the available space for visualization. The `inhabit()` method should not do any drawing.                                   |
| `show()`           | Start or resume display of the visualization. When this is called, you can (and should!) actually start drawing things.                                                                                                                                                 |
| `stop()`           | Pause display of the visualization (i.e., don't do any more drawing until another call to show). Don't erase any visualization produced so far or otherwise clean up the visualizer.                                                                                    |
| `depart()`         | Throw out the visualization, release its resources, remove its injected DOM elements, and do any other required cleanup. After this call, the visualizer must support `inhabit()` being called again, perhaps with a different div, to re-initialize the visualization. |

## Parameterizable objects

Source: `Paramable.ts`.

### The parameterizable object interface

An object that takes parameters, like a visualizer or a sequence, has to
implement `ParamableInterface`. An easy way to do this is to extend the
generic implementation, [`Paramable`](#the-paramable-base-class).

| Property      | Description                                             |
| ------------- | ------------------------------------------------------- |
| `name`        | See [generic implementation](#the-paramable-base-class) |
| `description` | See [generic implementation](#the-paramable-base-class) |

| Method               | Required behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isValid`            | A boolean that says whether the current configuration of parameter values is self-consistent and safe to use. Generally, this will be set automatically based on the output of `checkParameters()`, which is mentioned in the description of `validate()` below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `params`             | A parameterizable object has to come with a set of user-facing parameters—even if the set is empty. The `params` property is an object mapping parameter names to parameter objects—that is, (plain) objects implementing the parameter interface (`ParamInterface`). A parameter object describes how a parameter should appear in the UI, what kind of values it can take, whether it's required, and so on.                                                                                                                                                                                                                                                                                                                                                                    |
| `validate()`         | Check whether the current configuration of parameter values is valid, and call the `assignParameters()` method below if so. Return a `ValidationStatus` object that tells the engine whether the check and assignment succeeded. Whenever the engine wants to load a parameter configuration into a parameterizable object, it will use `validate()` to do so. If it gets back a `ValidationStatus` with `isValid = true`, it will proceed with whatever it is doing. If it gets a status with `isValid = false`, it will will stop what it is doing and help the user fix the problem by displaying any error messages the status carries. Most parameterizable objects will extend [`Paramable`](#the-paramable-base-class) and use its default implementation of `validate()`. |
| `assignParameters()` | Copy the `value` property of each item in `params` to the place where the implementing object will access it. Typically, that means copying to top-level properties of the object. The implementing object should only use parameter values supplied by `assignParameters()`, because these have been vetted by `validate()`. In contrast, if you took values directly from `params` they could be unvalidated, and they can change from valid to invalid at any time.                                                                                                                                                                                                                                                                                                            |
| `refreshParams()`    | Copy the current working values of the parameters back into the `value` properties in the `params` object, so they can be reflected in the parameter UI. This method is used by objects that can update their own parameters, rather than just having parameters assigned through the standard parameter UI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### The paramable base class

The `Paramable` class is a generic implementation of the parameterizable
object interface.

| Parameter     | Value                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `'Paramable'`                                                                                                                                 |
| `description` | `'A class which can have parameters set'` Derived classes may override this property, but it's currently not displayed anywhere user-visible. |

| Method       | Implementation                                                                                                                                                                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate()` | Checks parameter validity by calling the `checkParameters()` method, and then handles all the other responsibilities of `validate()`. A class extending `Paramable` will typically just override `checkParameters()`, which returns a `ValidationStatus` that says whether the current parameter configuration is self-consistent and safe to use. |
