# Extending Numberscope

The main initial way that people excited by Numberscope's possibilities want
to extend it is by creating their own Visualizer. Sometimes this addition is
to tweak the behavior or add a feature to an existing Visualizer, or sometimes
it's a whole new idea about looking at the universe of numbers. Whichever is
the case for you, this guide will show you how to go about implementing a new
Visualizer.

Currently in order to do this, you must begin by setting up to run Numberscope
from source code on your own machine. (Rather than running from the public
server -- hopefully in the future Numberscope will switch to an architecture
in which the only code you need locally on your machine is the code for your
new visualizer.) You also may want to get set up with a convenient code editor
for working with the program you're going to create.

Once you have that working, you just need to add one source code file to
calculate and display the images you want to create. Once that file is in the
correct place, you simply restart Numberscope and your visualizer will appear
as one of the options.

The details of these two main steps are on the following pages. If your
visualizer ends up working well and you'd like to submit it back to the
Numberscope project for possible inclusion on the public server, that's one of
the topics in the [Contributing](../CONTRIBUTING.md) section.
