import {math, MathFormula} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Formula Grid visualizer

(needs image)

This visualizer divides the rectangular canvas into a grid of _r_ by _c_
identical rectangular cells. Each cell has an _x_ coordinate, a _y_ coordinate,
and a number of spiral steps _s_ from the "spiral center" of the rectangle.
In each animation frame, Formula Grid will draw one or more shapes (from a
variety of supported shapes) in each of the next group of consecutive cells
in the grid.

Some presets for the fill order of the cells are provided: the default is
left-to-right, top-to-bottom, but spiral from the center and triangular layout
with one cell in the center of the top row, two cells on its left and right in
the second row, and so on, are also provided. In addition, you can customize
the fill order with a formula giving the coordinates of the _i_th cell to be
visited. Note that it is not required that a given cell in the grid is visited
exactly once as a result of these formulas; it could equally well never be
visited or be visited multiple times. For example, one can make a typical point
plot of a sequence using the fill order formula `[i, r - a(n)]`. Note that the
_y_-coordinate returned by this formula is not simply `a(n)` because the
rows of the grid are numbered from zero at the top row to _r_ at the bottom
row, rather than in typical Cartesian coordinate fashion.

The shapes drawn and the (RGBA) colors used for them are determined by the
Fill formula. If it just returns a color or a value that can be converted to
a color, the rectangular cell at the current fill position is filled with that
color. For details on how formulas may create and manipulate colors, see
the [Chroma documenation](../shared/Chroma.md), but note that a false value
will be converted to the completely transparent color. In other words, whenever
the fill formula returns false, nothing will be drawn. For convenience, if
the formula returns an array that cannot otherwise be converted to a color,
Formula Grid will attempt to convert each element to a color and take the
(overlay) sum of the colors, which is equivalent to drawing each resulting
color into the cell in the order they appear.

On the other hand, the fill formula may instead return a plain object with keys
drawn from the list of supported shapes:

rectangle
: Behaves the same as the default operation of the fill formula when it does
  not return an object.

square
: Draws a square with side a configurable fraction of the shorter dimension
  of a cell, centered in the cell.

ellipse
: Draws an ellipse with axes the horizontal and vertical center lines of the
cell.

circle
: Draws a circle with diameter a configurable fraction of the shorter
  dimension of a cell, centered in the cell.

hexagon
: Draws a hexagon twice the width and 4/3 the height of a cell, in which the
  current cell is inscribed. The resulting hexagons doubly cover the plane;
  if you take the odd cells horizontally in one row and the even cells in
  the next, those hexagons tile the plane. Note the Triangle pre-set fill
  order only visits such cells. When the aspect ratio of a cell is 1/√3, the
  hexagons are regular. (Needs diagram.)

triangle
: Draws a triangle the height of a cell with horizontal base twice the width
  of a cell, centered on the current cell. On odd rows the odd triangles point
  up and the even triangles point down; on even rows the directions are
  reversed. The resulting triangles tile the plane. When the aspect ratio
  of a cell is 1/√3, the triangles are equilateral.

text
: This key represents a special shape. The value of the associated formula
  will be converted into a string and written centered in the cell in a font
  size half the height of the cell if the string has four or fewer characters,
  or a font size one quarter the height of the cell otherwise. The text color
  will be black or white, whichever has highest contrast with the cell
  color.

mouseover
: Another special shape key. The value of the associated formula will be
  converted into a string and shown in a popup with the mouse pointer hovers
  over the cell.

Except for the special text shapes, the value associated to a key will be
interpreted as a color in the same way as the default behavior, and the shape
will be drawn in that color. If multiple keys are specified, the shapes are
drawn successively in the order that they appear in the object returned.

The fill formula may use any of the variables _x_, _y_, _r_, _c_, and _s_
described above; their values will be supplied by the visualizer. It may
also use any of the following additional variables:

_k_ -- the 1-based serial number of the cell in the order they are filled in

_m_ -- the minimum (first) index of the current sequence being visualized

_M_ -- the Maximum (last) index of the current sequence (may be infinite)

_n_ = _k_ - 1 + _m_ -- the index of the sequence entry associated with the
current cell

_a_ -- the value of the current sequence at index _n_

_f_ -- the frame number of the current drawing pass; this is the greatest
integer in _k_ divided by the current drawing speed.

You may also use the symbol `A` as a function symbol in your formula, and
it will provide access to the value of the sequence being visualized for any
index. For example, the formula `(A(n-1) + a + A(n+1))/3` would provide a
three-element running average of the current sequence centered on the current
entry. The FormulaGrid visualizer also defines a function symbol `spiral`
that takes a positive integer _k_ and returns a two-element array of the
coordinates of the _k_th position in the spiral path from the center.

## Parameters
**/

enum FillOrder {
    By_Rows,
    Spiral,
    Triangle,
    Custom,
}

const formulaSymbols = [
    'x', 'y', 's', 'r', 'c', 'k', 'm', 'M', 'n', 'a', 'f', 'A', 'spiral'
] as const

const formulaDescription =
    "May use k (the serial number of the cell), m (the sequence's first "
    + 'index), M (the last index), n (the current index = m + k - 1), '
    + 'a (the n-th sequence entry), A(...) (an arbitrary sequence entry), '
    + 'r (the total number of rows), c (number of columns), '
    + 'f (the frame number), x (the x-coordinate of the current cell), '
    + 'y (the y-coordinate), or s (the position along spiral from center).'

// Now the formulas for computing the various preset paths.
// The coordinates for By_Rows are easy, they are `k % c` and `floor(k / c)`
// but listed as just `[x,y]` below because that's what the inputs x and y are
// set to when computing the path.
// The spiral case is a bit complicated.
// The number of "extra" right moves before the "first regular right move"
// is `c - r - (c>r)`, where a negative value means the extra moves are down,
// not right. We call this quantity the "horizontality" and denote it by `h`.
// The column of the starting position is `floor((min(r,c)+1)/2)` and the row
// is `floor(min(r,c)/2)+1`.
// Now note that for any nonnegative integer `j`, after `j*(j+|h|)` moves we
// have covered a `j`-by-`j+|h|` rectangle. After `k` moves, we can find the
// largest such rectangle by `j = |_ (√(h^2+4k) - |h|)/2 _|`.
// The coordinates of the last point reached in that `j`th rectangle are
// the starting coordinates plus
// `[0,0]` if j = 0
// `[(j-1)/2 + max(h,0), (j-1)/2 - min(h,0)]` if j odd, and
// `[1 - j/2, -j/2]` if j even.
// We then have `l` additional steps, where `l = k - j*(j+|h|)`. If j is odd,
// the first of these steps moves [1,0]; the next `j-min(h,0)` move [0,-1];
// and the rest move [-1, 0]. If j is even, the first moves [-1, 0], the next
// `j - min(h,0)` move [0, 1], and the rest move [1, 0].
// Although the formulas above could be captured in the mathjs expression
// language, the result would be tremendously long and complicated, so
// we define a function here and pass the function in through the evaluation
// scope for convenience.

function spiralRC(k: number, r: number, c: number) {
    HERE!
}

const path = {
    [FillOrder.By_Rows]: '[x, y]',
    [FillOrder.Spiral]: 'spiral(k)',
    [FillOrder.Triangle]:
        '[floor(c/2) - invTriangular(k-1)'
        + ' + 2*(k - triangular(invTriangular(k-1)) - 1),'
        + 'invTriangular(k-1)]',
}

const paramDesc = {
    /** md
- Dimensions: the number of rows and columns in the grid. Note that you may
  leave this blank, in which case FormulaGrid will try to choose suitable
  values to display the selected sequence, or you may specify just the
  number of rows, in which case FormulaGrid will choose the number of columns
  to fill the canvas. Or you may explicitly specify both the number of rows
  and number of columns in the grid, separated by a space or comma.
    **/
    dimensions: {
        default: [],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Dimensions',
        required: false,
        description:
            'Number of rows, or number of rows and number of '
            + 'columns separated by a space or comma, to divide the canvas '
            + 'into. If unspecified, FormulaGrid will try to display as '
            + 'much of the sequence as it reasonably can while filling the '
            + 'canvas.',
        hideDescription: true,
        validate: function (dim: number[], status: ValidationStatus) {
            status.forbid(
                dim.length > 2, 
                'Just number of rows and number of columns may be specified'
            )
            status.mandate(
                dim.every(d => d > 0),
                'Each dimension must be positive'
            )
            status.mandate(
                dim.every(d => math.isInteger(d)),
                'Each dimension must be an integer'
            )
        },
    },
    /** md
- Cell aspect: the aspect ratio (width/height) of each cell in the grid.
  Defaults to the value that will fill the available space in the canvas.
  If this cell aspect is set and at least the number of columns is
  unspecified, the dimensions will be chosen to fill the canvas. If this
  parameter is set and both dimensions are set, the aspect ratio of the
  portion of the canvas used by FormulaGrid will be set accordingly.
  For convenience, the special aspect ratio 1/√3 that makes the hexagon
  and triangle shapes be regular can be entered simply as the character `r`
  (for "regular ratio").
    **/
    aspect: {
        default: '',
        type: ParamType.STRING,
        displayName: 'Cell aspect',
        required: false,
        description:
            'Cell aspect ratio (width/height). If unspecified, '
            + 'FormulaGrid will adjust to fill the canvas. Use `r` to '
            + 'make hexagons/triangles come out regular.',
        hideDescription: true,
        validate: function (s: string, status: ValidationStatus) {
            status.mandate(
                s === 'r' || /^\d*[.]\d*$/.test(s),
                'Must be a positive number or the letter `r`.'
            )
        },
    },
    /** md
- Fill order: the path through the grid in which cells should be filled.
  Defaults to 'By_Rows', which fills them left-to-right and top-to-bottom.
  May also be 'Spiral', which makes a rectangular spiral filling the grid,
  or 'Triangle', which visit cells starting with the top center, then the
  two immediately left and right in the next row, then three in the middle of
  the third row, etc. Finally, if this is set to 'Custom', an entry box for
  a formula explicitly giving the _x_ and _y_ coordinates of the _k_-th cell
  visited will pop up, allowing custom paths, scatter plots, etc.
    **/
    fillOrder: {
        default: FillOrder.By_Rows,
        type: ParamType.ENUM,
        from: FillOrder,
        displayName: 'Fill order',
        required: true,
    },
    /** md
- Path formula: A formula giving the _x_ and _y_ coordinates of the _k_-th
  cell to be visited as the visualization is drawn. It is only shown/used
  if Fill order is 'Custom'. The value may be a two-element array giving the
  _x_ and _y_ coordinates in that order, or a plain object with keys `x`
  and `y` giving the coordinates. The formula may use any of the variables
  listed in the description above, where the inputs _x_, _y_, and _s_ are
  calculated as if the fill order were the default 'By_Rows'. This latter
  convention is useful if you want to tweak the default fill order.
    **/
    pathFormula: {
        default: new MathFormula(path[FillOrder.By_Rows], formulaSymbols),
        type: ParamType.FORMULA,
        inputs: formulaSymbols,
        displayName: 'Path formula',
        required: false,
        description:
            'A formula giving the coordinates of the k-th cell '
            + 'to be filled. '
            + formulaDescription
            + ' In this case, inputs x, y, and s are computed as if the path '
            + 'were By_Rows.',
        hideDescription: true,
        visibleDependency: 'fillOrder',
        visibleValue: FillOrder.Custom,
    },
    /** md
- Background color: The color of the background.
    **/
    backgroundColor: {
        default: '#FFFFFF',
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: true,
    },
    /** md
- Speed: Cells filled per animation frame.
    **/
    speed: {
        default: 32,
        type: ParamType.INTEGER,
        displayName: 'Speed',
        required: false,
        description: 'Cells filled per animation frame',
        validate: function (s: number, status: ValidationStatus) {
            status.mandate(s > 0, 'must be positive')
        },
    },
    /** md
- Fill formula: This parameter specifies the core behavior of Formula Grid,
  directing what is drawn in each cell as the visualization reaches it.
  As such, it is documented fully in the overview above.
    **/
    fillFormula: {
        default: new MathFormula('a', formulaSymbols),
        type: ParamType.FORMULA,
        inputs: formulaInputs,
        displayName: 'Fill formula',
        required: true,
        description:
            'A formula giving the color or array of colors to fill the '
            + 'cell with, or a plain object associating with some shape '
            + 'names the color or array of colors to draw them with. Allowed '
            + 'keys are rectangle, square, ellipse, circle, hexagon, '
            + 'triangle, text, or mouseover; the values for the last two '
            + '"shapes" will be (converted to) strings, not colors. '
            + formulaDescription,
        hideDescription: true,
    },
    /** md
- Inset: The side length of the 'square' shape and/or diameter of the 'circle'
  shape, as a multiple of the shorter dimension of a cell. Must be positive,
  but allowed to be greater than one, in which case the shapes may overlap.
    **/
    inset: {
        default: 0.6,
        type: ParamType.NUMBER,
        displayName: 'Inset',
        required: false,
        description:
            'Size of circle and/or square as multiple of short side of cell',
        validate: function (inset: number, status: ValidationStatus) {
            status.mandate(inset > 0, 'Must be positive')
        },
        visibleDependency: 'fillFormula',
        visiblePredicate:
           (fill: MathFormula) => /square|circle/.test(fill.source),
    },
} satisfies GenericParamDescription

class FormulaGrid extends P5Visualizer(paramDesc) {
    static category = 'Formula Grid'
    static description =
        'Fill the cells of a grid using shapes/colors determined by a formula'

    index = 0n
    rows = 0
    columns = 0
    
}
