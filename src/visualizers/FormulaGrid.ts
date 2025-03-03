import p5 from 'p5'

import {P5Visualizer} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'

import {chroma, dilute, overlay} from '@/shared/Chroma'
import type {Chroma} from '@/shared/Chroma'
import {math, MathFormula} from '@/shared/math'
import type {MathType} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Formula Grid visualizer

(needs image)

This visualizer divides the rectangular canvas into a grid of _r_ by _c_
identical rectangular cells. Each cell has an integer _x_ coordinate (starting
from 1 in the leftmost column and increasing to the right), a _y_ coordinate
(starting from 1 in the top row and increasing as you go down), and a "spiral
position" _s_ that starts from 1 near the center of the rectangle and
increases along a rectangular spiral path that visits every cell in the grid.

In each animation frame, Formula Grid will draw one or more shapes (from a
variety of supported shapes) in each of the next group of consecutive cells
in the grid, in whatever fill order is currently configured.

Some presets for the fill order of the cells are provided: the default is
left-to-right, top-to-bottom. You can also easily select a spiral from the
center and a triangular layout with one cell in the center of the top row,
then two cells on its left and right in the second row, and so on. In addition,
you can customize the fill order with a formula giving the coordinates of the
_k_-th cell to be visited, starting from _k_ = 1. Note that there is no
requirement that a given cell in the grid is visited exactly once as a result
of these formulas; it could equally well never be visited or be visited
multiple times. For example, one can make a typical point plot of a sequence
using the fill order formula `[k, floor(r/2) - a]`. Note that the
_y_-coordinate in this formula is not simply `a` because the rows of the grid
are numbered from 1 to _r_ from top to bottom, rather than in typical Cartesian
coordinate fashion with _y_ increasing upwards.

The shapes drawn and the (RGBA) colors used for them are determined by the
Fill formula. If it just returns a color or a value that can be converted to
a color, the rectangular cell at the current fill position is filled with that
color. For details on how formulas may create and manipulate colors, see
the [Chroma documentation](../shared/Chroma.md), but note that a false value
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
  of a cell, centered in the cell. The fraction is given by the Inset
  formula, documented below.

ellipse
: Draws an ellipse with axes the horizontal and vertical center lines of the
  cell.

circle
: Draws a circle with diameter a configurable fraction of the shorter
  dimension of a cell, centered in the cell. As with the square, the fraction
  is given by the Inset formula. This means that if you specify both circle
  and square, the circle is always inscribed in the square.

[<img src="../../assets/img/FormulaGrid/Hexagons.png" width=300
 style="margin-left: 1em; margin-right: 0.5em; float: right;"
 />](../assets/img/FormulaGrid/Hexagons.png)

hexagon
: Draws a hexagon twice the width and 4/3 the height of a cell, in which the
  current cell is inscribed. The resulting hexagons doubly cover the plane;
  if you take the odd cells horizontally in one row and the even cells in
  the next, those hexagons tile the plane. Note the Triangle pre-set fill
  order only visits such cells, making this shape ideal for use along with the
  Triangle fill order when you want to display the rows of a triangular array
  with one entry in the first row, two in the second, and so on. When the
  aspect ratio of a cell is 1/√3, the hexagons are regular. See the
  accompanying diagram for the layout of the hexagons; the underlying
  rectangular cells are blue, each inscribed in the corresponding hexagon
  shape, which are drawn in black with every other one having dotted
  perimeter.

[<img src="../../assets/img/FormulaGrid/Triangles.png" width=300
 style="margin-left: 1em; margin-right: 0.5em; float: right;"
 />](../assets/img/FormulaGrid/Triangles.png)

triangle
: Draws a triangle the height of a cell with horizontal base twice the width
  of a cell, centered on the current cell. On odd rows the odd triangles point
  up and the even triangles point down; on even rows the directions are
  reversed. The resulting triangles tile the plane. When the aspect ratio
  of a cell is 1/√3, the triangles are equilateral. See the accompanying
  diagram of the layout of the triangles, superimposed on the underlying
  rectangular grid, which is shown in blue. Each triangle is associated with
  the unique grid cell that it overlaps the most.

text
: This key represents a special shape. The value of the associated formula
  will be converted into a string (if it is an array, the entries will be
  individually converted to strings and concatenated). This string will
  be written centered in the cell in a font size half the height of the cell
  if it has four or fewer characters, or a font size one quarter the height
  of the cell otherwise. The text color will be black or white, whichever
  has highest contrast with the cell color.

mouseover
: Another special shape key. The value of the associated formula will be
  converted into a string and shown in a popup when the mouse pointer hovers
  over the cell.

Except for the special text shapes, the value associated to a key will be
interpreted as a color in the same way as the default behavior, and the shape
will be drawn in that color. If multiple keys are specified, the shapes are
drawn successively in the order that they appear in the object returned.

The fill formula may use any of the variables _x_, _y_, _r_, _c_, and _s_
described above; their values will be supplied by the visualizer. It may
also use any of the following additional variables:

_k_ -- the serial number of the cell in the order they are filled in, starting
from 1

_m_ -- the minimum (first) index of the current sequence being visualized

_M_ -- the Maximum (last) index of the current sequence (may be infinite)

_n_ = _k_ - 1 + _m_ -- the index of the sequence entry associated with the
current cell

_a_ -- the value of the current sequence at index _n_

_f_ -- the frame number of the current drawing pass; this is the greatest
integer in _k_ divided by the current drawing speed.

You may also use the symbol `A` as a function symbol in your formula, and
it will provide access to the value of the sequence being visualized for any
index. For example, the formula `(a + A(n+1) + A(n+2))/3` would provide a
three-element running average of the current sequence starting from the
current entry. The FormulaGrid visualizer also defines a function symbol
`spiral` that takes a positive integer _k_ and returns a two-element array
of the coordinates of the _k_-th position in the spiral path from the center.

Being the heart of this visualizer, there is a lot of information that is
packed into the fill formula, and it can get relatively complicated. So
here are a few illustrative examples, all assuming By_Rows fill order:

* A black/red checkerboard: `(x+y) % 2 ? red : black`
* Every 7th cell has a white background and every 11th cell has an inner
  red square: `{rectangle: (k % 7) == 1, square: not(k % 11) ? red : false}`
* Tile the plane with hexagons in a rainbow given by their distance from the
  center of the grid; note we only color every other position, because
  the hexagons overlap to cover every pixel twice. Also, we display
  the distance on mouseover.
```
{ hexagon:
    (x+y) % 2 ? rainbow(10*sqrt((x-c/2)^2 + (y-r/2)^2)) : false,
  mouseover:
    [sqrt((x-c/2)^2 + (y-r/2)^2), ' units from center']
}
```

## Parameters
**/

enum FillOrder {
    By_Rows,
    Spiral,
    Triangle,
    Custom,
}

const formulaSymbols = [
    'x',
    'y',
    's',
    'r',
    'c',
    'k',
    'm',
    'M',
    'n',
    'a',
    'f',
    'A',
    'spiral',
] as const

const formulaDescription =
    "May use k (the serial number of the cell), m (the sequence's first "
    + 'index), M (the last index), n (the current index = m + k - 1), '
    + 'a (the n-th sequence entry), A(...) (an arbitrary sequence entry), '
    + 'r (the total number of rows), c (number of columns), '
    + 'f (the frame number), x (the x-coordinate of the current cell), '
    + 'y (the y-coordinate), or s (the position along spiral from center).'

// Now the formulas for computing the various preset paths.
// The only tricky bit in the coordinates for By_Rows is to get the computation
// correct with 1-based column and row numbers; they turn out to be
// `(k - 1) % c + 1` and `ceil(k / c)`. However, they are list as just
// `[x,y]` below because that's what the inputs x and y are set to when
// computing the path. That way you can perturb the By_Rows order if you like,
// e.g. transpose it easily, at least in the square case.
// The spiral case is a bit complicated.
// The number of "extra" right moves before the "first regular right move"
// is `c - r - (c>r)`, where a negative value means the extra moves are down,
// not right. We call this quantity the "horizontality" and denote it by `h`.
// The column of the starting position is `floor((min(r,c)+1)/2)` and the row
// is `floor(min(r,c)/2)+1`.
// Now note that for any nonnegative integer `j`, the `j*(j+|h|)`-th position
// will complete a `j`-by-`j+|h|` rectangle (oriented either landscape or
// portrait depending on whether `h` is positive or negative). So to find the
// `k`th position, we can find the largest such completed rectangle by
// `j = |_ (√(h^2+4k) - |h|)/2 _|`.
// The coordinates of the last position included in that `j`th rectangle are
// the starting coordinates plus
// `[0,0]` if j = 0
// `[(j-1)/2 + max(h,0), (j-1)/2 - min(h,0)]` if `j` odd, and
// `[1 - j/2, -j/2]` if `j` even.
// We then have `l` additional steps, where `l = k - j*(j+|h|)`. If j is odd,
// the first of these steps moves [1,0]; the next `j-min(h,0)` move [0,-1];
// and the rest move [-1, 0]. If j is even, the first moves [-1, 0], the next
// `j - min(h,0)` move [0, 1], and the rest move [1, 0].
// Although the formulas above could be captured in the mathjs expression
// language, the result would be tremendously long and complicated, so
// we define some functions here and pass them in through the evaluation
// scope for convenience.

const X = 0
const Y = 1
const R = 0
const C = 1
type NPair = [number, number]

// compute the "horizontality" and start position from the comments above
function horizontalityStart(r: number, c: number): [number, NPair] {
    const h = c - r - (c > r ? 1 : 0)
    const {floor, min} = math
    const start: NPair = [
        floor((min(r, c) + 1) / 2),
        floor(min(r, c) / 2) + 1,
    ]
    return [h, start]
}
function spiralRC(k: number, r: number, c: number) {
    // We just follow the computations in the comments above:
    const [h, start] = horizontalityStart(r, c)
    const {floor, abs, max, min, add} = math
    const v = -min(h, 0) // the "verticality"

    // number of completed rectangles:
    const j = floor((Math.sqrt(h * h + 4 * k) - abs(h)) / 2)
    const jeven = j % 2 === 0
    const jsign = jeven ? 1 : -1
    let cornerOffset = [0, 0]
    if (j > 0) {
        if (jeven) cornerOffset = [1 - j / 2, -j / 2]
        else cornerOffset = add([max(h, 0), v], (j - 1) / 2)
    }
    // additional steps
    let l = k - j * (j + abs(h))
    const position = add(start, cornerOffset)
    if (l > 0) {
        if (j > 0) position[X] += -jsign
        l -= 1
    }
    const turnAt = j + v
    position[Y] += jsign * min(l, turnAt)
    if (l > turnAt) position[X] += jsign * (l - turnAt)
    return position
}
// We also need to be able to calculate the inverse of the above function
// in order to supply the `s` value to the formulas:
function invSpiral(x: number, y: number, r: number, c: number) {
    const [h, start] = horizontalityStart(r, c)
    const {subtract, abs, max, min} = math
    const ph = max(h, 0) // the "positive horizontality"
    const v = -min(h, 0) // the "verticality"
    // The idea is to figure out which direction we would be traveling
    // at [x,y]. Knowing that lets us compute the number j of completed
    // rectangles, and then we add the number of extra steps it takes to get
    // to our location.
    const [offsetX, offsetY] = subtract([x, y], start)
    let j = 0 // number of rectangles
    let l = 0 // additional steps
    // First: if offsetX is nonpositive and offsetY is in the interval
    // [offsetX, verticality - offsetX) then we are going down.
    if (offsetX <= 0 && offsetY >= offsetX && offsetY < v - offsetX) {
        l = offsetY - offsetX + 1
        j = -2 * offsetX
        // Conversely, if offsetX greater than the positive horizontality
        // and offsetY is in the interval (-offsetX + ph, offsetX - h)
        // then we are going up.  CHECK HERE!
    } else if (
        offsetX > ph
        && offsetY > ph - offsetX
        && offsetY < offsetX - h
    ) {
        l = offsetX - h - offsetY
        j = 2 * (offsetX - ph) - 1
        // For the horizontal directions, if offsetY is negative we are going
        // left. That's all we need to check because we've dealt with all
        // cases of vertical motion already:
    } else if (offsetY < 0) {
        j = -2 * offsetY - 1
        l = -3 * offsetY - offsetX + abs(h)
    } else {
        // we are going right
        j = 2 * (offsetY - v)
        l = j + 1 + offsetX + offsetY
    }
    return j * (j + abs(h)) + l
}

const path: Record<number, string> = {
    [FillOrder.By_Rows]: '[x, y]',
    [FillOrder.Spiral]: 'spiral(k)',
    [FillOrder.Triangle]:
        '[ceil(c/2) - invTriangular(k-1)'
        + ' + 2*(k - triangular(invTriangular(k-1)) - 1),'
        + 'invTriangular(k-1) + 1]',
}

// now the stuff for drawing shapes
const black = chroma()
const white = chroma(1)
const transparent = dilute(black, 0)
type DrawData = {
    cx: number
    cy: number
    cw: number
    ch: number
    cm: number
    inset: number
    x: number
    y: number
    text: string
    sketch: p5
}
type Drawer = (data: DrawData) => void
const drawShape = {
    rectangle: ({cx, cy, cw, ch, sketch}) => sketch.rect(cx, cy, cw, ch),
    square: ({cx, cy, cw, ch, cm, inset, sketch}) => {
        const side = cm * inset
        sketch.rect(cx + (cw - side) / 2, cy + (ch - side) / 2, side, side)
    },
    ellipse: ({cx, cy, cw, ch, sketch}) => {
        sketch.ellipse(cx + cw / 2, cy + ch / 2, cw, ch)
    },
    circle: ({cx, cy, cw, ch, cm, inset, sketch}) => {
        sketch.circle(cx + cw / 2, cy + ch / 2, cm * inset)
    },
    hexagon: ({cx, cy, cw, ch, sketch}) => {
        sketch.beginShape()
        // We start 1/6 of the height above the center of the top edge:
        sketch.vertex(cx + cw / 2, cy - ch / 6)
        sketch.vertex(cx + (3 * cw) / 2, cy + ch / 6)
        sketch.vertex(cx + (3 * cw) / 2, cy + (5 * ch) / 6)
        sketch.vertex(cx + cw / 2, cy + (7 * ch) / 6)
        sketch.vertex(cx - cw / 2, cy + (5 * ch) / 6)
        sketch.vertex(cx - cw / 2, cy + ch / 6)
        sketch.endShape(sketch.CLOSE)
    },
    triangle: ({cx, cy, cw, ch, x, y, sketch}) => {
        const basey = x % 2 === y % 2 ? cy + ch : cy
        const peaky = 2 * cy + ch - basey
        sketch.triangle(
            cx - cw / 2,
            basey,
            cx + cw / 2,
            peaky,
            cx + (3 * cw) / 2,
            basey
        )
    },
    text: ({cx, cy, cw, ch, text, sketch}) => {
        const size = ch / (text.length > 4 ? 4 : 2)
        sketch.textSize(size).text(text, cx + cw / 2, cy + ch / 2)
    },
    mouseover: _dummy => {
        console.warn('Unhandled mouseover') // should never happen
    },
} satisfies Record<string, Drawer>

type Shape = keyof typeof drawShape

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
                s === 'r' || /^\d*([.]\d*)?$/.test(s),
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
  and `y` giving the coordinates. For example, if you want to fill the cells
  starting from the upper left corner and then proceeding down each column
  in turn, you could write `[ceil(k/r), k % r + 1]`, or equivalently
  `{x: ceil(k/r), y: k % r + 1}`. The formula may use any of the variables
  listed in the description above, where the inputs _x_, _y_, and _s_ are
  calculated as if the fill order were the default 'By_Rows'. This latter
  convention is useful if you want to tweak the default fill order.
    **/
    pathFormula: {
        default: new MathFormula(path[FillOrder.By_Rows], formulaSymbols),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
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
        symbols: formulaSymbols,
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
- Inset formula: An expression giving the side length of the 'square' shape
  and/or diameter of the 'circle' shape, as a multiple of the shorter
  dimension of a cell. The value is allowed to be greater than one, in which
  case the shapes may overlap. This parameter has no effect on any shapes
  other than circle and square.
    **/
    inset: {
        default: new MathFormula('0.6', formulaSymbols),
        type: ParamType.FORMULA,
        symbols: formulaSymbols,
        displayName: 'Inset formula',
        required: false,
        description:
            'A formula giving the size of circle and/or square as a '
            + 'multiple of short side of cell.'
            + formulaDescription,
        hideDescription: true,
        visibleDependency: 'fillFormula',
        visiblePredicate: (fill: MathFormula) =>
            /square|circle/.test(fill.source),
    },
} satisfies GenericParamDescription

class FormulaGrid extends P5Visualizer(paramDesc) {
    static category = 'Formula Grid'
    static description =
        'Fill the cells of a grid using shapes/colors determined by a formula'

    index = 0n
    rows = 0
    columns = 0
    cellwidth = 0
    cellheight = 0
    cellmin = 0
    frames = 0
    mouseText: string[][] = []
    popup?: HTMLElement = undefined

    async parametersChanged(names: Set<string>) {
        if (names.has('fillOrder') && this.fillOrder !== FillOrder.Custom) {
            const newPath = path[this.fillOrder]
            if (newPath !== this.pathFormula.source) {
                this.pathFormula = new MathFormula(newPath, formulaSymbols)
                names.add('pathFormula')
                this.refreshParams(new Set(['pathFormula']))
            }
        }
        super.parametersChanged(names)
    }

    interpretAspect() {
        if (!this.aspect) return 1
        if (/^[rR]/.test(this.aspect)) return 1 / Math.sqrt(3)
        return parseFloat(this.aspect)
    }

    requestedAspectRatio() {
        if (
            this.dimensions.length == 2 // have specified rows and columns
            && this.aspect !== '' // and the aspect ratio of each cell
        ) {
            return (
                (this.dimensions[C] * this.interpretAspect())
                / this.dimensions[R]
            )
        }
    }

    setup() {
        super.setup()
        // first calculate the sizes of the grid
        switch (this.dimensions.length) {
            case 2:
                ;[this.rows, this.columns] = this.dimensions
                this.cellwidth = this.sketch.width / this.columns
                this.cellheight = this.sketch.height / this.rows
                this.cellmin = Math.min(this.cellwidth, this.cellheight)
                break
            case 1:
                this.rows = this.dimensions[R]
                this.cellheight = this.sketch.height / this.rows
                this.cellwidth = this.interpretAspect() * this.cellheight
                this.columns = Math.floor(this.sketch.width / this.cellwidth)
                this.cellmin = Math.min(this.cellwidth, this.cellheight)
                break
            case 0: {
                const asp = this.interpretAspect()
                let entries = isFinite(Number(this.seq.length))
                    ? math.safeNumber(this.seq.length)
                    : Infinity
                const columnsPerRow =
                    this.sketch.width / this.sketch.height / asp
                if (entries === Infinity) {
                    entries = Math.floor(
                        (this.sketch.height / 8) ** 2 * columnsPerRow
                    )
                }
                this.rows = Math.floor(Math.sqrt(entries / columnsPerRow))
                this.cellheight = this.sketch.height / this.rows
                this.cellwidth = asp * this.cellheight
                this.cellmin = Math.min(this.cellwidth, this.cellheight)
                if (this.cellmin < 0.5) {
                    if (asp < 1) {
                        this.cellwidth = 1
                        this.cellheight = 1 / asp
                    } else {
                        this.cellheight = 1
                        this.cellwidth = asp
                    }
                    this.cellmin = 1
                    this.rows = Math.floor(
                        this.sketch.height / this.cellheight
                    )
                }
                this.columns = Math.floor(this.sketch.width / this.cellwidth)
            }
        }
        // now set up to draw
        this.index = 1n
        this.frames = 0
        this.mouseText = []
        this.sketch
            .noStroke()
            .textAlign(this.sketch.CENTER, this.sketch.CENTER)
            .background(this.backgroundColor)
        this.hidePopup()
    }

    draw() {
        ++this.frames
        for (let rep = this.speed; rep > 0; --rep) {
            // See if we've either filled the canvas or exhausted the sequence
            if (
                (this.fillOrder !== FillOrder.Custom
                    && this.index > this.rows * this.columns)
                || this.index + this.seq.first > this.seq.last
            ) {
                this.stop()
                return
            }

            // prepare the sequence inputs; before we compute the path position,
            // we pretend we are doing things by rows:
            const k = Number(this.index)
            const tentativeX = ((k - 1) % this.columns) + 1
            const tentativeY = Math.ceil(k / this.columns)
            const seqIndex = this.index + this.seq.first - 1n
            const input = {
                x: tentativeX,
                y: tentativeY,
                s: invSpiral(tentativeX, tentativeY, this.rows, this.columns),
                r: this.rows,
                c: this.columns,
                k,
                m: Number(this.seq.first),
                M: Number(this.seq.last),
                n: Number(seqIndex),
                a: Number(this.seq.getElement(seqIndex)),
                f: this.frames,
                A: (n: number | bigint) =>
                    Number(this.seq.getElement(BigInt(n))),
                spiral: (k: number) => spiralRC(k, this.rows, this.columns),
            }
            let pos = this.pathFormula.computeWithStatus(
                this.statusOf.pathFormula,
                input
            )
            if (typeof pos === 'object' && 'x' in pos && 'y' in pos) {
                pos = [Number(pos.x), Number(pos.y)]
            } else if (!Array.isArray(pos)) {
                this.statusOf.pathFormula.addError(
                    'must return an array, '
                        + 'or plain object {x: number, y: number}'
                )
                return
            }
            if (typeof pos[X] !== 'number' || typeof pos[Y] !== 'number') {
                this.statusOf.pathFormula.addError(
                    'must return [number, number]'
                )
                return
            }
            ;[input.x, input.y] = pos
            if (
                input.x < 1
                || input.x > this.columns
                || input.y < 1
                || input.y > this.rows
            ) {
                // Off screen, so nothing to do
                continue
            }
            input.s = invSpiral(input.x, input.y, this.rows, this.columns)
            let toFill: MathType | Partial<Record<Shape, MathType>> =
                this.fillFormula.computeWithStatus(
                    this.statusOf.fillFormula,
                    input
                )
            if (
                typeof toFill !== 'object'
                || Object.keys(toFill).some(k => !(k in drawShape))
            ) {
                toFill = {rectangle: toFill as MathType}
            }
            let color = chroma(this.backgroundColor)
            for (const entry of Object.entries(toFill)) {
                const shape = entry[0] as Shape
                let spec = entry[1]
                const text = Array.isArray(spec)
                    ? spec.map(i => i.toString()).join('')
                    : spec.toString()
                if (shape === 'text') {
                    // Choose black or white to contrast with latest color
                    let tc = black
                    if (
                        chroma.contrast(color, white)
                        > chroma.contrast(color, tc)
                    ) {
                        tc = white
                    }
                    this.sketch.fill(tc.hex())
                } else if (shape === 'mouseover') {
                    if (!this.mouseText[input.x]) this.mouseText[input.x] = []
                    this.mouseText[input.x][input.y] = text
                    continue // don't draw anything now
                } else {
                    // all other shapes
                    if (!Array.isArray(spec)) {
                        spec = [spec]
                    }
                    color = spec.reduce(
                        (c: Chroma, layer: number | string | Chroma) => {
                            return overlay(c, chroma(layer))
                        },
                        transparent
                    )
                    this.sketch.fill(color.hex())
                }
                let inset = 1
                if (shape === 'square' || shape === 'circle') {
                    inset = Number(
                        this.inset.computeWithStatus(
                            this.statusOf.inset,
                            input
                        )
                    )
                }
                drawShape[shape]({
                    cx: (input.x - 1) * this.cellwidth,
                    cy: (input.y - 1) * this.cellheight,
                    cw: this.cellwidth,
                    ch: this.cellheight,
                    cm: this.cellmin,
                    inset,
                    x: input.x,
                    y: input.y,
                    text,
                    sketch: this.sketch,
                })
            }
            ++this.index
        }
    }

    mouseMoved(event: MouseEvent) {
        const where = document.elementFromPoint(event.clientX, event.clientY)
        const onSketch =
            where
            && this.within
            && (where === this.within || where.contains(this.within))
        let mousetext = ''
        let x = 0
        if (onSketch) {
            x = Math.floor(this.sketch.mouseX / this.cellwidth) + 1
            const y = Math.floor(this.sketch.mouseY / this.cellheight) + 1
            const textRow = this.mouseText[x]
            if (textRow) mousetext = textRow[y] ?? ''
        }
        if (mousetext && onSketch) {
            const r = where.getBoundingClientRect()
            this.showPopup(mousetext, [
                event.clientX - r.x,
                event.clientY - r.y,
            ])
        } else this.hidePopup()
    }

    showPopup(text: string, [x, y]: NPair) {
        if (!this.within) return
        if (!this.popup) {
            this.popup = document.createElement('div')
            this.popup.classList.add('shadowed')
            const sty = this.popup.style
            sty.background = 'white'
            sty.opacity = '1'
            sty.position = 'absolute'
            sty.padding = '2px'
            sty.border = '1px solid black'
            sty.zIndex = '3'
            this.within.appendChild(this.popup)
        }
        this.popup.textContent = text
        const sty = this.popup.style
        sty.display = 'block'
        let popx = x + 16
        let popy = y + 24
        const pad = 6
        let xBlocked = false
        const popr = this.popup.getBoundingClientRect()
        const {width, height} = this.within.getBoundingClientRect()
        if (popx + popr.width + pad > width) {
            xBlocked = true
            popx = width - popr.width - pad
        }
        if (popy + popr.height + pad > height) {
            popy = (xBlocked ? y - 4 : height) - popr.height - pad
        }
        sty.left = popx + 'px'
        sty.top = popy + 'px'
    }

    hidePopup() {
        if (this.popup) this.popup.style.display = 'none'
    }
}

export const exportModule = new VisualizerExportModule(FormulaGrid)
