# Overview

Here's a general outline of creating visualizers that we will flesh out more
in the following pages.

### Grab a template for your chosen graphics framework

The easiest way to build a visualizer is to extend a pre-made visualizer base
class, which automatically sets up a graphics framework for you to use. Right
now, there are only two base classes available:

-   [`P5Visualizer`](visualizer-basics.md) uses the
    [**p5.js**](https://p5js.org) library for graphics and user interaction.
-   `P5GLVisualizer`: a slight variant of `P5Visualizer`. You should derive
    from this base class if you wish to use p5.js in WebGL mode. See the
    [Turtle](../src/visualizers/Turtle.md) visualizer for an example.

Note that by "extend a base class," we mean that in the standard TypeScript
sense: You will see that visualizer source code files literally contain a line
like

`class Differences extends P5Visualizer(paramDesc) {`

followed by the code that implements the visualizer class. For a quick start,
copy and modify the template file for your chosen framework, which you can
find in `src/visualizers-workbench`.

If you want to use a new graphics framework, you'll need to write your own
implementation of the
[visualizer interface](../src/visualizers/VisualizerInterface.md).

### Document as you write

Each visualizer has its user guide documentation woven into the source code,
using special `/** md`&nbsp;…&nbsp;`**/` comments that are automatically
compiled into a [documentation page](../src/visualizers/Differences.md). We
have some [conventions](visualizer-basics.md#how-to-document-your-visualizer)
for what the documentation comments should include and where in the source
code they should go.

### Develop your visualizer on the workbench

While you're working on a visualizer, we recommend keeping it in the
`src/visualizers-workbench` directory, where frontscope typically won't notice
it. To load it, run frontscope in "workbench mode" by calling
`npm run dev:workbench`.

When you're ready to propose your visualizer as an official part of
Numberscope, you'll move it to `src/visualizers`. Then frontscope will notice
and load it when you call the usual `npm run dev`. You can find some more
detail on this process on the
[next page](visualizer-basics.md#where-to-put-your-visualizer).

A visualizer, like a work of art, is never really finished—even when it's
accepted into Numberscope. Even the humble template visualizer discussed below
could be extended. You could shorten the infinite progress bar for finite
sequences, allow fast navigation by holding down arrow keys, add a progress
bar mouse-over that shows the index… the possibilities are endless. We invite
you to try extending or enhancing existing visualizers as well as building
your own.

You can proceed to the [next page](visualizer-basics.md) for a tour of the
core implementation parts of a basic visualizer.
