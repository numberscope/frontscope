# User guide

From the Numberscope landing page, you can access the visualization tool
itself with either of the buttons mentioning "the 'Scope." (There's one in the
top navigation bar and one right in the center of the page for convenience.)
That will bring you to:

{! ../src/views/Scope.vue extract: { start: '<!-- md', stop: '^\s*-->'} !}

## Errors

If Numberscope experiences an error, you might see an alert with the error
message. Sometimes the error results from the parameters you've chosen for the
visualization. For example, if you use a formula like `log(a)` and then one of
the sequence entries used for the value of `a` turns out to be zero, you may
get an error about trying to use -Infinity as a number.

If you see an error that seems to be a part of Numberscope itself, rather than
incompatible parameters, and it does not resolve upon reloading the page,
please let us know about the problem by
[filing an issue on GitHub](https://github.com/numberscope/frontscope/issues/new).
Please describe as thoroughly as you can what you were doing when the alert
occurred and what it said -- steps to reproduce it, a screenshot, and the URL
you were looking at could all be helpful. You can select the error message
using Ctrl-A/⌘-A (which grabs all text on the page) to copy-and-paste it.
Thanks!
