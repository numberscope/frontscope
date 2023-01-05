import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {floorSqrt} from '@/shared/math'
import type {ParamInterface} from '@/shared/Paramable'

/** md
# Grid Visualizer

[<img src="../../assets/img/Grid/example-grid.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../assets/img/Grid/example-grid.png)

This visualizer puts a sequence in a square spiral or in
rows and allows you to highlight its values based on various
properties.

The inspiration for this visualizer is [Ulam's
spiral](https://en.wikipedia.org/wiki/Ulam_spiral), which puts the
natural numbers in a square spiral and highlights the primes.  One can
also highlight properties such a whether a number is abundant or
polygonal. Several properties can be highlighted at once, in which case
later properties overcolor earlier ones.


## Parameters
**/
const BLACK = '#000000'
const WHITE = '#ffffff'

const RED = '#ff5733'
const ORANGE = '#ff9d33'
const YELLOW = '#e6ff33'
const GREEN = '#14cd33'
const BLUE = '#3388ff'
const PURPLE = '#8814cd'
const CYAN = '#00ffff'
const MAGENTA = '#ff00ff'
const VERDANT = '#9BBF30'
const VIOLET = '#7f00ff'
const MUSTARD = '#ffdb58'
const GRAY = '#808080'

const DEFAULT_COLORS = [
    RED,
    ORANGE,
    YELLOW,
    GREEN,
    BLUE,
    PURPLE,
    CYAN,
    MAGENTA,
    VERDANT,
    VIOLET,
    MUSTARD,
    GRAY,
]

const RAINBOW = [
    '#FF0000',
    '#FF6700',
    '#FFE000',
    '#51FF00',
    '#00F4E8',
    '#00B1FF',
    '#0055FF',
    '#C000FF',
    '#FF00F9',
    '#FF0080',
]

const MAXIMUM_ALLOWED_PROPERTIES = 12

enum Preset {
    Custom,
    Primes,
    Abundant_Numbers,
    Abundant_Numbers_And_Primes,
    Polygonal_Numbers,
    Color_By_Last_Digit_1,
    Color_By_Last_Digit_2,
}

enum PathType {
    Spiral,
    Rows,
    Rows_Augment,
}

enum Direction {
    Right,
    Left,
    Up,
    Down,
    StartNewRow,
    None,
}

enum Property {
    None,
    Prime,
    Negative,
    Even,
    Divisible_By_Three,
    Divisible_By_Four,
    Divisible_By_Five,
    Divisible_By_Six,
    Divisible_By_Seven,
    Divisible_By_Eight,
    Ends_With_Zero,
    Ends_With_One,
    Ends_With_Two,
    Ends_With_Three,
    Ends_With_Four,
    Ends_With_Five,
    Ends_With_Six,
    Ends_With_Seven,
    Ends_With_Eight,
    Ends_With_Nine,
    Triangular_Number,
    Square_Number,
    Pentagonal_Number,
    Hexagonal_Number,
    Heptagonal_Number,
    Octagonal_Number,
    Sum_Of_Two_Squares,
    Abundant,
    Perfect,
    Deficient,
    Semi_Prime,
}

enum PropertyVisualization {
    Fill_Cell,
    Box_In_Cell,
}

function getProperty(
    value: Property,
    index: number,
    hasVisibleDependencyAndPredicate: boolean
) {
    const property = {
        value: value,
        from: Property,
        displayName: `Property ${index + 1}`,
        required: false,
        visibleDependency: '',
        visiblePredicate: (dependentValue: Property) =>
            dependentValue !== Property.None,
    }

    if (hasVisibleDependencyAndPredicate) {
        property.visibleDependency = `property${index - 1}`
        property.visiblePredicate = (dependentValue: Property) =>
            dependentValue !== Property.None
    }

    return property
}

function getPropertyVisualization(
    value: PropertyVisualization,
    index: number
) {
    const propertyVisualization = {
        value: value,
        from: PropertyVisualization,
        displayName: `Display`,
        required: false,
        visibleDependency: `property${index}`,
        visiblePredicate: (dependentValue: Property) =>
            dependentValue !== Property.None,
    }

    return propertyVisualization
}

function getPropertyColor(value: string, index: number) {
    const propertyColor = {
        value: value,
        forceType: 'color',
        displayName: `Color`,
        required: false,
        visibleDependency: `property${index}`,
        visiblePredicate: (dependentValue: Property) =>
            dependentValue !== Property.None,
    }

    return propertyColor
}

class VisualizerGrid extends VisualizerDefault {
    name = 'Grid'

    //Grid variables
    amountOfNumbers = 4096
    currentIndex = 0
    startingIndex = 0
    currentNumber = 0n
    showNumbers = false
    preset = Preset.Custom
    pathType = PathType.Spiral
    resetAndAugmentByOne = false
    backgroundColor = BLACK
    numberColor = WHITE

    //Path variables
    x = 0
    y = 0
    scalingFactor = 0
    currentDirection = Direction.Right
    numberToTurnAtForSpiral = 0
    incrementForNumberToTurnAt = 1
    whetherIncrementShouldIncrement = true

    //Properties
    propertyObjects = [
        {
            property: Property.Prime,
            visualization: PropertyVisualization.Fill_Cell,
            color: RED,
        },
    ]
    propertyIndicatorFunction: {
        [key in Property]: ((ind: number) => boolean) | (() => false)
    } = {
        [Property.None]: () => false,
        [Property.Prime]: (ind: number) => this.isPrime(ind),
        [Property.Negative]: (ind: number) => this.seq.getElement(ind) < 0n,
        [Property.Even]: (ind: number) =>
            this.seq.getElement(ind) % 2n === 0n,
        [Property.Divisible_By_Three]: (ind: number) =>
            this.seq.getElement(ind) % 3n === 0n,
        [Property.Divisible_By_Four]: (ind: number) =>
            this.seq.getElement(ind) % 4n === 0n,
        [Property.Divisible_By_Five]: (ind: number) =>
            this.seq.getElement(ind) % 5n === 0n,
        [Property.Divisible_By_Six]: (ind: number) =>
            this.seq.getElement(ind) % 6n === 0n,
        [Property.Divisible_By_Seven]: (ind: number) =>
            this.seq.getElement(ind) % 7n === 0n,
        [Property.Divisible_By_Eight]: (ind: number) =>
            this.seq.getElement(ind) % 8n === 0n,
        [Property.Ends_With_One]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 1n,
        [Property.Ends_With_Two]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 2n,
        [Property.Ends_With_Three]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 3n,
        [Property.Ends_With_Four]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 4n,
        [Property.Ends_With_Five]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 5n,
        [Property.Ends_With_Six]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 6n,
        [Property.Ends_With_Seven]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 7n,
        [Property.Ends_With_Eight]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 8n,
        [Property.Ends_With_Nine]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 9n,
        [Property.Ends_With_Zero]: (ind: number) =>
            this.seq.getElement(ind) % 10n === 0n,
        [Property.Sum_Of_Two_Squares]: (ind: number) =>
            this.isSumOfTwoSquares(ind),
        [Property.Triangular_Number]: (ind: number) =>
            this.isPolygonal(ind, 3n),
        [Property.Square_Number]: (ind: number) => this.isPolygonal(ind, 4n),
        [Property.Pentagonal_Number]: (ind: number) =>
            this.isPolygonal(ind, 5n),
        [Property.Hexagonal_Number]: (ind: number) =>
            this.isPolygonal(ind, 6n),
        [Property.Heptagonal_Number]: (ind: number) =>
            this.isPolygonal(ind, 7n),
        [Property.Octagonal_Number]: (ind: number) =>
            this.isPolygonal(ind, 8n),
        [Property.Abundant]: (ind: number) => this.isAbundant(ind),
        [Property.Perfect]: (ind: number) => this.isPerfect(ind),
        [Property.Deficient]: (ind: number) =>
            !this.isPerfect(ind) && !this.isAbundant(ind),
        [Property.Semi_Prime]: (ind: number) => this.isSemiPrime(ind),
    }
    params: {[key: string]: ParamInterface} = {
        /** md
### Presets: Which preset to display

If a preset other than `Custom` is selected, then the `Properties`
portion of the dialog is overriden.  For details on the meanings of the terms
below, see the 
[Properties](#property-1-2-etc-properties-to-display-by-coloring-cells)
section of the documentation.

- Custom:  the remaining properties can be set by you
- Primes:  primes are shown in red
- Abundant_Numbers:  the abundant numbers are shown in black
- Abundant_Numbers_And_Primes:  the primes are shown in red and the abundant
  numbers in black
- Polygonal_Numbers:  the polygonal numbers are shown in a variety of
  different colors (one for each type of polygon)
- Color_By_Last_Digit_1:  the last digit is shown (one color for each digit
  in a rainbow style)
- Color_By_Last_Digit_2:  a variation on the last, where odd digits are
  are indicated by smaller boxes
         **/
        preset: {
            value: this.preset,
            from: Preset,
            displayName: 'Presets',
            required: false,
            description:
                'If a preset is selected, properties no longer function.',
        },

        /** md
### Grid cells: The number of cells to display in the grid

This will be rounded down to the nearest square integer.
This may get laggy when it is in the thousands or higher, depending on the
property being tested.
         **/
        amountOfNumbers: {
            value: this.amountOfNumbers,
            displayName: 'Grid cells',
            required: false,
            description: 'Warning: display lags over 10,000 cells',
        },

        /** md
### Starting Index: The sequence index at which to begin
         **/
        startingIndex: {
            value: this.startingIndex,
            displayName: 'Starting Index',
            required: false,
            description: '',
        },

        /** md
### Path in grid: The path to follow while filling numbers into the grid.

- Spiral:  An Ulam-type square spiral starting at the center of grid.
- Rows:  Left-to-right, top-to-bottom in rows.
- Rows_Augment:  Each row restarts the sequence from the starting index,
    but adds the row number to the sequence _values_.
         **/
        pathType: {
            value: this.pathType,
            from: PathType,
            displayName: 'Path in grid',
            required: false,
        },

        /** md
### Show numbers: Whether to show values overlaid on cells

When this is selected, the number of cells in the grid will be limited to 400
even if you choose more.
         **/
        showNumbers: {
            value: this.showNumbers,
            forceType: 'boolean',
            displayName: 'Show numbers',
            required: false,
            description: 'When true, grid is limited to 400 cells',
        },

        /** md
### Number color: The font color of displayed numbers

This parameter is only available when the "Show Numbers" parameter is checked.
         **/
        numberColor: {
            value: this.numberColor,
            forceType: 'color',
            displayName: 'Number color',
            required: false,
            visibleDependency: 'showNumbers',
            visiblePredicate: (dependentValue: boolean) =>
                dependentValue === true,
        },
        /** md
### Background Color: Background color of the grid
         **/
        backgroundColor: {
            value: this.backgroundColor,
            forceType: 'color',
            displayName: 'Background color',
            required: false,
        },
    }

    constructor() {
        super()
        /** md
### Property 1, 2, etc.:  Properties to display by coloring cells

You can add multiple properties.  For each, there are some parameters
to set.

##### Property:  the property to highlight

- None:  This is simply a placeholder to indicate that no further properties
will be used.  Choosing anything other than none will add a new property
and reveal parameters for it.
- Prime:  Whether the absolute value of an integer is prime
- Negative:  Whether an integer is negative
- Even:  Whether an integer is even
- Divisible_By_Three, Divisible_By_Four etc.:  Whether an integer is divisible
  by 3, 4, etc.
- Ends_With_Zero, Ends_With_One etc.:  Whether an integer's final digit is 0,
  1, 2, etc.
- Triangular_Number, Square_Number etc.:  Whether an integer is triangular,
  square, pentagonal etc.
- Sum_Of_Two_Squares:  Whether an integer is a sum of two squares (always
  False for negative numbers)
- Abundant:  Whether an integer is
  [abundant](https://en.wikipedia.org/wiki/Abundant_number), that is,
exceeding the sum of its divisors (excluding itself)
- Perfect:  Whether an integer is
  [perfect](https://en.wikipedia.org/wiki/Perfect_number), that is, equal to
  the sum of its divisors (excluding itself)
- Deficient:  Whether an integer is
  [deficient](https://en.wikipedia.org/wiki/Deficient_number), that is, less
  than the sum of its divisors (excluding itself)
- Semi_Prime:  Whether the absolute value of an integer is a
  [semi-prime](https://en.wikipedia.org/wiki/Semiprime), that is, a product of
  exactly two primes (possibly equal)

##### Display:  Highlight style for cells with the property  

Using different display styles allows for visualizing two properties
that are both true for the same value at once,
without them overcoloring each other. (Note that later properties overcolor
earlier ones that use the _same_ style.)

- Fill_Cell:  Fill the complete cell
- Box_In_Cell:  Fill only a smaller central box in the cell

##### Color:  Highlight color for cells with the property
         **/

        for (let i = 1; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            this.propertyObjects.push({
                property: Property.None,
                visualization: PropertyVisualization.Fill_Cell,
                color: DEFAULT_COLORS[i],
            })
        }

        for (let i = 0; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            (this.params['property' + i] = getProperty(
                this.propertyObjects[i].property,
                i,
                i !== 0
            )),
                (this.params['property' + i + 'Visualization'] =
                    getPropertyVisualization(
                        this.propertyObjects[i].visualization,
                        i
                    )),
                (this.params['property' + i + 'MainColor'] = getPropertyColor(
                    this.propertyObjects[i].color,
                    i
                ))
        }
    }

    checkParameters() {
        const status = super.checkParameters()

        return status
    }

    assignParameters(): void {
        super.assignParameters()

        for (let i = 0; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            (this.propertyObjects[i].property = this.params['property' + i]
                .value as Property),
                (this.propertyObjects[i].visualization = this.params[
                    'property' + i + 'Visualization'
                ].value as PropertyVisualization),
                (this.propertyObjects[i].color = this.params[
                    'property' + i + 'MainColor'
                ].value as string)
        }
    }

    draw(): void {
        this.setPresets()

        this.sketch.strokeWeight(0)

        this.setOverridingSettings()

        this.amountOfNumbers = Math.min(
            this.amountOfNumbers,
            this.seq.last - this.seq.first + 1
        )

        //Round up amount of numbers so that it is a square number.
        const squareRootOfAmountOfNumbers = Number(
            floorSqrt(this.amountOfNumbers)
        )

        this.amountOfNumbers =
            squareRootOfAmountOfNumbers * squareRootOfAmountOfNumbers

        //This is because 20 x 20 is 1:1 scaling.
        this.scalingFactor = this.sketch.width / squareRootOfAmountOfNumbers

        this.setPathVariables(squareRootOfAmountOfNumbers)

        this.currentIndex = Math.max(this.startingIndex, this.seq.first)
        let augmentForRowReset = 0n

        for (
            let iteration = 0;
            iteration < this.amountOfNumbers;
            iteration++
        ) {
            //Reset current sequence for row reset and augment by one.
            if (this.currentDirection === Direction.StartNewRow) {
                if (this.resetAndAugmentByOne) {
                    this.currentIndex = Math.max(
                        this.startingIndex,
                        this.seq.first
                    )
                    augmentForRowReset++
                }
            }

            this.setCurrentNumber(this.currentIndex, augmentForRowReset)

            this.fillGridCell()

            this.currentIndex++

            this.moveCoordinatesUsingPath(
                squareRootOfAmountOfNumbers,
                iteration
            )
        }
        this.sketch.noLoop()
    }

    setPresets() {
        if (this.preset != Preset.Custom) {
            for (let i = 0; i < this.propertyObjects.length; i++) {
                this.propertyObjects[i].property = Property.None
            }
        }
        if (this.preset === Preset.Primes) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Prime
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[0].color = RED
        } else if (this.preset === Preset.Abundant_Numbers) {
            this.backgroundColor = WHITE
            this.propertyObjects[0].property = Property.Abundant
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[0].color = BLACK
        } else if (this.preset === Preset.Abundant_Numbers_And_Primes) {
            this.backgroundColor = WHITE
            this.propertyObjects[0].property = Property.Prime
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[0].color = RED
            this.propertyObjects[1].property = Property.Abundant
            this.propertyObjects[1].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[1].color = BLACK
        } else if (this.preset === Preset.Polygonal_Numbers) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Triangular_Number
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[0].color = RED
            this.propertyObjects[1].property = Property.Square_Number
            this.propertyObjects[1].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[1].color = ORANGE
            this.propertyObjects[2].property = Property.Pentagonal_Number
            this.propertyObjects[2].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[2].color = YELLOW
            this.propertyObjects[3].property = Property.Hexagonal_Number
            this.propertyObjects[3].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[3].color = GREEN
            this.propertyObjects[4].property = Property.Heptagonal_Number
            this.propertyObjects[4].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[4].color = BLUE
            this.propertyObjects[5].property = Property.Octagonal_Number
            this.propertyObjects[5].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[5].color = PURPLE
        } else if (this.preset === Preset.Color_By_Last_Digit_1) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Ends_With_Zero
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[0].color = RAINBOW[0]
            this.propertyObjects[1].property = Property.Ends_With_One
            this.propertyObjects[1].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[1].color = RAINBOW[1]
            this.propertyObjects[2].property = Property.Ends_With_Two
            this.propertyObjects[2].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[2].color = RAINBOW[2]
            this.propertyObjects[3].property = Property.Ends_With_Three
            this.propertyObjects[3].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[3].color = RAINBOW[3]
            this.propertyObjects[4].property = Property.Ends_With_Four
            this.propertyObjects[4].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[4].color = RAINBOW[4]
            this.propertyObjects[5].property = Property.Ends_With_Five
            this.propertyObjects[5].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[5].color = RAINBOW[5]
            this.propertyObjects[6].property = Property.Ends_With_Six
            this.propertyObjects[6].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[6].color = RAINBOW[6]
            this.propertyObjects[7].property = Property.Ends_With_Seven
            this.propertyObjects[7].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[7].color = RAINBOW[7]
            this.propertyObjects[8].property = Property.Ends_With_Eight
            this.propertyObjects[8].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[8].color = RAINBOW[8]
            this.propertyObjects[9].property = Property.Ends_With_Nine
            this.propertyObjects[9].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[9].color = RAINBOW[9]
        } else if (this.preset === Preset.Color_By_Last_Digit_2) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Ends_With_Zero
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[0].color = RAINBOW[0]
            this.propertyObjects[1].property = Property.Ends_With_One
            this.propertyObjects[1].visualization =
                PropertyVisualization.Box_In_Cell
            this.propertyObjects[1].color = RAINBOW[1]
            this.propertyObjects[2].property = Property.Ends_With_Two
            this.propertyObjects[2].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[2].color = RAINBOW[2]
            this.propertyObjects[3].property = Property.Ends_With_Three
            this.propertyObjects[3].visualization =
                PropertyVisualization.Box_In_Cell
            this.propertyObjects[3].color = RAINBOW[3]
            this.propertyObjects[4].property = Property.Ends_With_Four
            this.propertyObjects[4].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[4].color = RAINBOW[4]
            this.propertyObjects[5].property = Property.Ends_With_Five
            this.propertyObjects[5].visualization =
                PropertyVisualization.Box_In_Cell
            this.propertyObjects[5].color = RAINBOW[5]
            this.propertyObjects[6].property = Property.Ends_With_Six
            this.propertyObjects[6].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[6].color = RAINBOW[6]
            this.propertyObjects[7].property = Property.Ends_With_Seven
            this.propertyObjects[7].visualization =
                PropertyVisualization.Box_In_Cell
            this.propertyObjects[7].color = RAINBOW[7]
            this.propertyObjects[8].property = Property.Ends_With_Eight
            this.propertyObjects[8].visualization =
                PropertyVisualization.Fill_Cell
            this.propertyObjects[8].color = RAINBOW[8]
            this.propertyObjects[9].property = Property.Ends_With_Nine
            this.propertyObjects[9].visualization =
                PropertyVisualization.Box_In_Cell
            this.propertyObjects[9].color = RAINBOW[9]
        }
    }

    setOverridingSettings() {
        if (this.pathType === PathType.Rows_Augment) {
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
        }

        if (this.showNumbers && this.amountOfNumbers > 400) {
            this.amountOfNumbers = 400
        }
    }

    setCurrentNumber(currentIndex: number, augmentForRow: bigint) {
        this.currentNumber = this.seq.getElement(currentIndex)
        this.currentNumber = this.currentNumber + augmentForRow
    }

    setPathVariables(gridSize: number) {
        //The default starting point is the top left.
        this.x = 0
        this.y = 0

        //The default starting direction is right.
        this.currentDirection = Direction.Right

        if (this.pathType === PathType.Spiral) {
            //The starting point placed so that the whole spiral is centered
            if (gridSize % 2 === 1) {
                this.x = (gridSize / 2 - 1 / 2) * this.scalingFactor
                this.y = (gridSize / 2 - 1 / 2) * this.scalingFactor
            } else {
                this.x = (gridSize / 2 - 1) * this.scalingFactor
                this.y = (gridSize / 2) * this.scalingFactor
            }

            //The amount of numbers to the next turn increases every other turn.
            this.numberToTurnAtForSpiral = 1
            this.incrementForNumberToTurnAt = 1
            this.whetherIncrementShouldIncrement = true
        }
    }

    fillGridCell() {
        this.drawBackgroundSquare()

        this.drawPrimaryColorSquare()

        this.drawSecondaryColorSquare()

        this.showNumber()
    }

    drawBackgroundSquare() {
        this.sketch.fill(this.backgroundColor)
        this.drawBigSquare()
    }

    drawPrimaryColorSquare() {
        this.colorMainColorProperties()
        this.drawBigSquare()
    }

    drawSecondaryColorSquare() {
        this.colorSecondaryColorProperties()
        this.drawSmallSquare()
    }

    colorMainColorProperties() {
        for (let i = 0; i < this.propertyObjects.length; i++) {
            if (
                this.propertyObjects[i].property != Property.None
                && this.propertyObjects[i].visualization
                    === PropertyVisualization.Fill_Cell
            ) {
                if (
                    this.hasProperty(
                        this.currentIndex,
                        this.propertyObjects[i].property
                    )
                ) {
                    this.sketch.fill(this.propertyObjects[i].color)
                }
            }
        }
    }

    colorSecondaryColorProperties() {
        for (let i = 0; i < this.propertyObjects.length; i++) {
            if (
                this.propertyObjects[i].property != Property.None
                && this.propertyObjects[i].visualization
                    === PropertyVisualization.Box_In_Cell
            ) {
                if (
                    this.hasProperty(
                        this.currentIndex,
                        this.propertyObjects[i].property
                    )
                ) {
                    this.sketch.fill(this.propertyObjects[i].color)
                }
            }
        }
    }

    drawBigSquare() {
        this.sketch.rect(
            this.x,
            this.y,
            this.scalingFactor,
            this.scalingFactor
        )
    }

    drawSmallSquare() {
        this.sketch.rect(
            this.x + this.scalingFactor / 4,
            this.y + this.scalingFactor / 4,
            this.scalingFactor / 2,
            this.scalingFactor / 2
        )
    }

    hasProperty(ind: number, property: Property) {
        console.log('bool:', this.propertyIndicatorFunction[property](ind))
        return this.propertyIndicatorFunction[property](ind)
    }

    showNumber() {
        const currentNumberAsString = this.currentNumber.toString()

        if (this.showNumbers) {
            this.sketch.fill(this.numberColor)
            this.sketch.text(
                currentNumberAsString,
                this.x + 0 * this.scalingFactor,
                this.y + (15 * this.scalingFactor) / 20
            )
        }
    }

    moveCoordinatesUsingPath(
        squareRootOfAmountOfNumbers: number,
        iteration: number
    ) {
        this.changeDirectionUsingPathType(
            squareRootOfAmountOfNumbers,
            iteration
        )

        this.moveCoordinatesUsingCurrentDirection()
    }

    changeDirectionUsingPathType(
        squareRootOfAmountOfNumbers: number,
        iteration: number
    ) {
        //Choose direction for next number
        if (this.pathType === PathType.Spiral) {
            //Turn at the numberToTurn at which increases every other turn
            if (iteration === this.numberToTurnAtForSpiral) {
                this.numberToTurnAtForSpiral
                    += this.incrementForNumberToTurnAt
                if (this.whetherIncrementShouldIncrement) {
                    this.incrementForNumberToTurnAt += 1
                    this.whetherIncrementShouldIncrement = false
                } else {
                    this.whetherIncrementShouldIncrement = true
                }

                if (this.currentDirection === Direction.Right) {
                    this.currentDirection = Direction.Up
                } else if (this.currentDirection === Direction.Up) {
                    this.currentDirection = Direction.Left
                } else if (this.currentDirection === Direction.Left) {
                    this.currentDirection = Direction.Down
                } else if (this.currentDirection === Direction.Down) {
                    this.currentDirection = Direction.Right
                }
            }
        } else if (this.pathType === PathType.Rows) {
            //Go to new row when the row is complete
            if ((iteration + 1) % squareRootOfAmountOfNumbers === 0) {
                this.currentDirection = Direction.StartNewRow
            } else if (iteration === this.amountOfNumbers) {
                this.currentDirection = Direction.None
            } else {
                this.currentDirection = Direction.Right
            }
        }
    }

    moveCoordinatesUsingCurrentDirection() {
        //Move coordinates to direction they're going to
        if (this.currentDirection === Direction.Right) {
            this.x += this.scalingFactor
        } else if (this.currentDirection === Direction.Up) {
            this.y -= this.scalingFactor
        } else if (this.currentDirection === Direction.Left) {
            this.x -= this.scalingFactor
        } else if (this.currentDirection === Direction.Down) {
            this.y += this.scalingFactor
        } else if (this.currentDirection === Direction.StartNewRow) {
            this.x = 0
            this.y += this.scalingFactor
        }
    }
    /*
     *   FUNCTIONS TO CHECK FOR PROPERTIES
     */
    isPrime(ind: number): boolean {
        const factors = this.seq.getFactors(ind)
        console.log(this.seq.getElement(ind))
        console.log(factors)
        if (
            factors === null // if we can't factor, it isn't prime
            || factors.length === 0 // 1 is not prime
            || factors[0][0] === 0n // 0 is not prime
            || (factors.length === 1 && factors[0][0] === -1n) // -1 not prime
        ) {
            return false
        }
        if (
            (factors.length === 1 && factors[0][1] === 1n) // prime
            || (factors.length === 2
                && factors[0][0] === -1n
                && factors[1][1] == 1n) // negative of prime
        ) {
            return true
        } else {
            return false
        }
    }

    //Taken from Geeks For Geeks :
    //https://www.geeksforgeeks.org/deficient-number/
    getSumOfDivisors(num: bigint): bigint {
        //
        // returns the sum of divisors of the absolute value
        if (num < 0n) {
            return this.getSumOfDivisors(-num)
        }
        let sumOfDivisors = 0n // Initialize sum of prime factors

        // Note that this loop runs till square root of n
        for (let i = 1n; i <= floorSqrt(num); i++) {
            if (num % i === 0n) {
                // If divisors are equal, take only one
                // of them
                if (num / i === i) {
                    sumOfDivisors = sumOfDivisors + i
                } // Otherwise take both
                else {
                    sumOfDivisors = sumOfDivisors + i
                    sumOfDivisors = sumOfDivisors + num / i
                }
            }
        }

        return sumOfDivisors
    }

    isSumOfTwoSquares(ind: number): boolean {
        const factors = this.seq.getFactors(ind)

        if (factors === null) {
            return false // we can't factor, so can't tell
        }
        let legendre = 1
        for (let i = 0; i < factors.length; i++) {
            const factor = factors[i]
            const prime = factor[0]
            const exponent = factor[1]
            if (prime === -1n) {
                // negative numbers are never sums of squares
                return false
            }
            // otherwise update legendre for every prime 3 mod 4
            if (prime % 4n === 3n && exponent % 2n === 1n) {
                legendre = -1 * legendre
            }
        }
        if (legendre === 1) {
            return true
        } else {
            return false
        }
    }

    //Modification of Geeks for Geeks :
    //https://www.geeksforgeeks.org/program-check-n-pentagonal-number/
    isPolygonal(ind: number, order: bigint): boolean {
        const num = this.seq.getElement(ind)

        // negative inputs are never polygonal
        if (num < 0n) {
            return false
        }
        let i = 1n,
            M
        do {
            M = (order - 2n) * ((i * (i - 1n)) / 2n) + i
            i += 1n
        } while (M < num)
        return M === num
    }

    isAbundant(ind: number): boolean {
        const num = this.seq.getElement(ind)
        return this.getSumOfDivisors(num) - num > num
    }

    isPerfect(ind: number): boolean {
        const num = this.seq.getElement(ind)
        const sum = this.getSumOfDivisors(num) - num
        // If sum of divisors is equal to
        // n, then n is a perfect number
        if (sum === num && num != 1n) {
            return true
        }

        return false
    }

    isSemiPrime(ind: number): boolean {
        const factors = this.seq.getFactors(ind)
        console.log(this.seq.getElement(ind))
        console.log(factors)
        if (
            factors === null // if we can't factor, it isn't semi-prime
            || factors.length === 0 // 1 is not semi-prime
            || factors[0][0] === 0n // 0 is not semi-prime
            || (factors.length === 1 && factors[0][0] === -1n) // -1 not s-prime
        ) {
            return false
        }
        if (
            (factors.length === 1 && factors[0][1] === 2n) // square
            || (factors.length === 2
                && factors[0][0] === -1n
                && factors[1][1] === 2n) // negative of square
            || (factors.length === 2
                && factors[0][1] === 1n
                && factors[1][1] === 1n) // semi-prime
            || (factors.length === 3
                && factors[0][0] === -1n
                && factors[1][1] == 1n
                && factors[2][1] == 1n) // negative of semi-prime
        ) {
            return true
        } else {
            return false
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Grid',
    VisualizerGrid,
    'Puts numbers in a grid.'
)

/** md


## Examples

Click on any image to expand it.

###### The Ulam Spiral

[<img src="../../assets/img/Grid/1.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Grid/1.png)
[<img src="../../assets/img/Grid/2.png" width="320" 
style="margin-left: 0.5em; margin-right: 1em"
/>](../assets/img/Grid/2.png)

These are the natural numbers in a square spiral, with each of the prime
numbers highlighted in red; this is the classic [Ulam
spiral](https://en.wikipedia.org/wiki/Ulam_spiral).  In the first image, the 
value of each term of the sequence is shown over the corresponding cell, 
in order to
demonstrate the spiral.  In the second, we see many more terms, whereupon
it becomes evident that the primes form long
diagonal lines. These diagonal lines are quadratic equations, namely 
\( x^2 + c\), \( x^2 + 2x + c\), \( x^2 -2x + c\), and 
\( x^2 + 4x + c \).

###### Traversing the grid in rows

[<img src="../../assets/img/Grid/3.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Grid/3.png)
[<img src="../../assets/img/Grid/4.png" width="320" 
style="margin-left: 0.5em; margin-right: 1em"
/>](../assets/img/Grid/4.png)

The natural numbers are put in rows (left to right, top to bottom), 
with each of the prime numbers
highlighted in red.  Primes can only appear at positions 
which are coprime to the
rowlength, leading to the visual effect of black columns.

###### The Rows_Augment capability

[<img src="../../assets/img/Grid/5.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/5.png)
[<img src="../../assets/img/Grid/6.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/6.png)
[<img src="../../assets/img/Grid/7.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/7.png)
[<img src="../../assets/img/Grid/8.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/8.png)

When you choose ```Rows_Augment``` for the parameter ```Path in Grid```,
the sequence starts over in each row, but its _values_ are incremented by one.
In this example, primes are again highlighted in red.
(1) and (2): natural numbers; (3) and (4): squares.
In the second series of images, long diagonal lines become apparent. The
diagonal lines that go up and to the right each have a corresponding diagonal
line that goes down and to the right because numbers repeat when they are
arranged this way. The quadratic equation for which each of these diagonals
corresponds is \(x^2 – x + C\).

###### Abundant numbers ([A005101](https://oeis.org/A005101)) and primes

[<img src="../../assets/img/Grid/9.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/9.png)
[<img src="../../assets/img/Grid/10.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/10.png)
[<img src="../../assets/img/Grid/11.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/11.png)

[Abundant numbers](https://en.wikipedia.org/wiki/Abundant_number) 
([A005101](https://oeis.org/A005101)) are those less than their sum of
proper divisors.  The first two images show a spiral and row
arrangement of the natural numbers, with abundant numbers in 
black on a white background.

The last image combines abundant and primes in a spiral arrangement of 
the natural numbers.  The primes appear to fit "around" the abundant
numbers (this effect is easiest to appreciate by clicking on the last
image to expand it).  This is a tendency, not a rule, as most 
(but not all) abundant numbers are divisible by 2 or 3.

###### Polygonal Numbers

[<img src="../../assets/img/Grid/12.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/12.png)
[<img src="../../assets/img/Grid/13.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/13.png)
[<img src="../../assets/img/Grid/14.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/14.png)

Putting the natural numbers in a spiral or in rows (first two images), 
we can highlight the [polygonal
numbers](https://en.wikipedia.org/wiki/Polygonal_number). Polygonal numbers
count dots that can be arranged in the shape of that polygon. For example,
6 is a triangular number because one can form an equilateral triangle with
three dots at the bottom, two dots in the middle, and one dot at the top.
The triangular numbers are red, square numbers are orange, pentagonal
yellow, hexagonal green, heptagonal blue, and the octagonal numbers
are purple. For the final image, we use the sequence of squares, and use the
```Rows_Augment``` mode.

###### Digit colorings

[<img src="../../assets/img/Grid/15.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/15.png)
[<img src="../../assets/img/Grid/16.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/16.png)
[<img src="../../assets/img/Grid/pi-digits-more.png" width="320" 
style="margin: 0.5em" />](../assets/img/Grid/pi-digits-more.png)

The first image shows the natural numbers in rows, colored by final digit.
The second image is the same, but in spiral format.  The final image
shows the digits of pi ([A000796](https://oeis.org/A000796)) in rows.

###### Digits of abundant numbers ([A005101](https://oeis.org/A005101))

[<img src="../../assets/img/Grid/19.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Grid/19.png)
[<img src="../../assets/img/Grid/abundant-more.png" width="320" 
style="margin-left: 0.5em; margin-right: 1em"
/>](../assets/img/Grid/abundant-more.png)

When the abundant numbers are put in a spiral and highlighted by their last
digit, the scarcity of odd abundant numbers (indicated on the left by small
squares) becomes visually apparent.  As we zoom out in the right image, we
see they are clearly not random.


## Credit

The original version of this visualizer was created by Olivia Brobin, as part
of the [Experimental Mathematics
Lab](https://www.colorado.edu/math/content/experimental-mathematics-lab) at
[CU Boulder](https://www.colorado.edu/math/).


**/
