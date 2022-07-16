# Code Organization

The Numberscope system actually comprises two code repositories. This
documentation is generated from the one called `frontscope`, and is primarily
concerned with the operation and development of that portion of the system.

The code in this `frontscope` repository is responsible for defining and
displaying the visualizers, and for establishing how to specify the sequences
the visualizers act on. In general, it provides Numberscope's user interface.

If you need to deal with the code responsible for retrieving integer sequences
from the [Online Encyclopedia of Integer Sequences (OEIS)](https://oeis.org/),
or for performing the computations involved in generating sequence entries and
their factorizations, see
[backscope](https://github.com/numberscope/backscope).

The remainder of the pages in this section provide a complete guide to the
code structure and standards, interacting with the repository, and so on
