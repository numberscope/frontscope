# Numberscope code style

Outside of the code style issues that are covered by our automated code style
tools (ESLint and Prettier as of this writing), we also like to:

# Minimize the number of return statements in a function

-   If you can easily figure out that you need to bail out of a function, go
    ahead and put a return at the top of the function and then proceed with
    the rest of the function.
-   Otherwise, try to minimize the number of return statements in a function.
    Having them strewn throughout a function (especially a long function) is
    generally hard to read.
