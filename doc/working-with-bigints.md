## Working with bigints

All of frontscope's Sequence objects return bigints as their elements. The
rationale is that many OEIS entries contain integer values too large to be
accurately represented by JavaScript's `number` type, and attempting to
compute with `number`s would lead to incorrect behavior such as considering
all sufficiently large integers to be even.

As a result, when working with sequence values you should attempt to use only
the bigint type insofar as possible.

Here's more information and techniques to facilitate using bigint in your
code:

-   The name of the TypeScript type for bigints is `bigint`. However, when you
    want to make a value `v` of some other type into a bigint, you call
    `BigInt(v)`.
-   Literal values of type `bigint` consist digits followed by a lower-case n,
    like 73n for the bigint with value 73, or 0n or -10n, etc.
-   Right now unfortunately mathjs does not work on bigints but soon we will
    update to a version that does.
-   In the meantime to compensate for the lack of bigints in mathjs, we have a
    code file (`@/shared/math`) in numberscope that adds some utilities to the
    `math` module for working with bigints. You should familiarize yourself
    with the [functions it offers](../src/shared/math.md).
-   In particular, if you are forced to convert a bigint to the JavaScript
    number type, you should do it with the `math.safeNumber` function provided
    by the math utility module, unless for some structural reason you are
    **certain** the bigint won't overflow the number. That will provide
    overflow checking and throw an error if accuracy would be lost. Note that
    any value you get from the OEIS may be too large to fit in the JavaScript
    number type.
-   For example, you may want to evaluate a function like sine or log on a
    bigint value. For sine, you will have to convert to a number; for log we
    have `natlog` in the math module that works on both numbers and bigints.
    Note that if you have a bigint larger than can safely be converted to a
    number (e.g., larger than JavaScript `Number.MAX_SAFE_INTEGER`), and you
    want to take say the sine of it, it should be possible to use double-angle
    and sum formulas to bring the operand down into the safe range for
    conversion. If there is demand for such operations, we could implement
    them in the math module.
-   In any arithmetic operations like + and \*, both operands must be of the
    same type. So generally prefer converting to bigints any numbers you may
    need to use in a calculation with bigints, if possible.
-   However, note that the result of dividing one bigint by another is
    automatically "floored" to produce an integer result. Be careful to think
    if that's what you want; if not, you may need to rearrange your
    expressions. For example `x * (3n/5n)` is very different from `(x*3n)/5n`
    -- the former is always 0n, but the second will have the value 60n when x
    is 100n, for example.
-   You can't index an array with a bigint, so that is one case in which you
    will be forced to convert to the number type. Since your array will not
    have billions of elements, if you have made sure that your bigint is small
    enough to index into the array, it will be small enough to safely convert
    to a number.
-   Use `===` to test if two bigints are equal and `!==` to check if they are
    different. As with other operations, you can't use these to compare a
    bigint and a number.
