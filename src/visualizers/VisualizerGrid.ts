import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {floorSqrt} from '@/shared/math'
import type {ParamInterface} from '@/shared/Paramable'

/** md
# Grid Visualizer

[<img src="../../assets/img/Grid/example-grid.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/example-grid.png)

This visualizer puts a sequence in a square spiral or in
rows and allows you to highlight numbers based on various
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
    Rows_Offset,
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
    Fill_Box,
    Small_Box,
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
        displayName: `Property ${index + 1} Style`,
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
        displayName: `Property ${index + 1} color`,
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
    currentSequenceIndex = 0
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
            visualization: PropertyVisualization.Fill_Box,
            color: RED,
        },
    ]

    params: {[key: string]: ParamInterface} = {
        /** md
### Presets: Which preset to display

If a preset other than `Custom` is selected, then the `Properties`
portion of the dialog is overriden.  For details on the meanings of the terms
below, see the 
[Properties](#property-1-2-etc-properties-to-display-by-colouring-cells) 
section of the documentation.

- Custom:  the remaining properties can be set by you
- Primes:  primes are shown in red
- Abundant_Numbers:  the abundant numbers are shown in black
- Abundant_Numbers_And_Primes:  the primes are shown in red and the abundant
  numbers in black
- Polygonal_Numbers:  the polygonal numbers are shown in a variety of
  different colours (one for each type of polygon)
- Color_By_Last_Digit_1:  the last digit is shown (one colour for each digit
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
property being testing.  

         **/
        amountOfNumbers: {
            value: this.amountOfNumbers,
            displayName: 'Grid cells',
            required: false,
            description: 'Warning: display lags over 10,000 numbers',
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

- Spiral:  An Ulam-type square spiral out from the origin.
- Rows:  Left-to-right, top-to-bottom in rows.
- Rows_Offset:  The n-th row contains the sequence beginning at term n, read
  left-to-right.
         **/
        pathType: {
            value: this.pathType,
            from: PathType,
            displayName: 'Path in grid',
            required: false,
        },

        /** md
### Show numbers: Whether to show sequence values overtop of grid boxes

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

This is only relevant when the ```Show Numbers``` parameter is checked.
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
### Property 1, 2, etc.:  Properties to display by colouring cells

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

##### Property Style:  Highlight style for cells with the property  

This allows for visualizing two properties at once without overcoloring.
Otherwise, later properties overcolor earlier ones.

- Fill_Box:  Fill the complete cell
- Small_Box:  Fill only a smaller central box in the cell

##### Property Color:  Highlight color for cells with the property
         **/

        for (let i = 1; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            this.propertyObjects.push({
                property: Property.None,
                visualization: PropertyVisualization.Fill_Box,
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

        this.currentSequenceIndex = Math.max(
            this.startingIndex,
            this.seq.first
        )
        let augmentForRowReset = 0n

        for (
            let iteration = 0;
            iteration < this.amountOfNumbers;
            iteration++
        ) {
            //Reset current sequence for row reset and augment by one.
            if (this.currentDirection === Direction.StartNewRow) {
                if (this.resetAndAugmentByOne) {
                    this.currentSequenceIndex = Math.max(
                        this.startingIndex,
                        this.seq.first
                    )
                    augmentForRowReset++
                }
            }

            this.setCurrentNumber(
                this.currentSequenceIndex,
                augmentForRowReset
            )

            this.currentSequenceIndex++

            this.fillGridCell()

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
                PropertyVisualization.Fill_Box
            this.propertyObjects[0].color = RED
        } else if (this.preset === Preset.Abundant_Numbers) {
            this.backgroundColor = WHITE
            this.propertyObjects[0].property = Property.Abundant
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[0].color = BLACK
        } else if (this.preset === Preset.Abundant_Numbers_And_Primes) {
            this.backgroundColor = WHITE
            this.propertyObjects[0].property = Property.Prime
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[0].color = RED
            this.propertyObjects[1].property = Property.Abundant
            this.propertyObjects[1].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[1].color = BLACK
        } else if (this.preset === Preset.Polygonal_Numbers) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Triangular_Number
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[0].color = RED
            this.propertyObjects[1].property = Property.Square_Number
            this.propertyObjects[1].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[1].color = ORANGE
            this.propertyObjects[2].property = Property.Pentagonal_Number
            this.propertyObjects[2].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[2].color = YELLOW
            this.propertyObjects[3].property = Property.Hexagonal_Number
            this.propertyObjects[3].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[3].color = GREEN
            this.propertyObjects[4].property = Property.Heptagonal_Number
            this.propertyObjects[4].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[4].color = BLUE
            this.propertyObjects[5].property = Property.Octagonal_Number
            this.propertyObjects[5].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[5].color = PURPLE
        } else if (this.preset === Preset.Color_By_Last_Digit_1) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Ends_With_Zero
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[0].color = RAINBOW[0]
            this.propertyObjects[1].property = Property.Ends_With_One
            this.propertyObjects[1].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[1].color = RAINBOW[1]
            this.propertyObjects[2].property = Property.Ends_With_Two
            this.propertyObjects[2].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[2].color = RAINBOW[2]
            this.propertyObjects[3].property = Property.Ends_With_Three
            this.propertyObjects[3].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[3].color = RAINBOW[3]
            this.propertyObjects[4].property = Property.Ends_With_Four
            this.propertyObjects[4].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[4].color = RAINBOW[4]
            this.propertyObjects[5].property = Property.Ends_With_Five
            this.propertyObjects[5].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[5].color = RAINBOW[5]
            this.propertyObjects[6].property = Property.Ends_With_Six
            this.propertyObjects[6].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[6].color = RAINBOW[6]
            this.propertyObjects[7].property = Property.Ends_With_Seven
            this.propertyObjects[7].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[7].color = RAINBOW[7]
            this.propertyObjects[8].property = Property.Ends_With_Eight
            this.propertyObjects[8].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[8].color = RAINBOW[8]
            this.propertyObjects[9].property = Property.Ends_With_Nine
            this.propertyObjects[9].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[9].color = RAINBOW[9]
        } else if (this.preset === Preset.Color_By_Last_Digit_2) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Ends_With_Zero
            this.propertyObjects[0].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[0].color = RAINBOW[0]
            this.propertyObjects[1].property = Property.Ends_With_One
            this.propertyObjects[1].visualization =
                PropertyVisualization.Small_Box
            this.propertyObjects[1].color = RAINBOW[1]
            this.propertyObjects[2].property = Property.Ends_With_Two
            this.propertyObjects[2].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[2].color = RAINBOW[2]
            this.propertyObjects[3].property = Property.Ends_With_Three
            this.propertyObjects[3].visualization =
                PropertyVisualization.Small_Box
            this.propertyObjects[3].color = RAINBOW[3]
            this.propertyObjects[4].property = Property.Ends_With_Four
            this.propertyObjects[4].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[4].color = RAINBOW[4]
            this.propertyObjects[5].property = Property.Ends_With_Five
            this.propertyObjects[5].visualization =
                PropertyVisualization.Small_Box
            this.propertyObjects[5].color = RAINBOW[5]
            this.propertyObjects[6].property = Property.Ends_With_Six
            this.propertyObjects[6].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[6].color = RAINBOW[6]
            this.propertyObjects[7].property = Property.Ends_With_Seven
            this.propertyObjects[7].visualization =
                PropertyVisualization.Small_Box
            this.propertyObjects[7].color = RAINBOW[7]
            this.propertyObjects[8].property = Property.Ends_With_Eight
            this.propertyObjects[8].visualization =
                PropertyVisualization.Fill_Box
            this.propertyObjects[8].color = RAINBOW[8]
            this.propertyObjects[9].property = Property.Ends_With_Nine
            this.propertyObjects[9].visualization =
                PropertyVisualization.Small_Box
            this.propertyObjects[9].color = RAINBOW[9]
        }
    }

    setOverridingSettings() {
        if (this.pathType === PathType.Rows_Offset) {
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
        }

        if (this.showNumbers && this.amountOfNumbers > 400) {
            this.amountOfNumbers = 400
        }
    }

    setCurrentNumber(currentSequenceIndex: number, augmentForRow: bigint) {
        this.currentNumber = this.seq.getElement(currentSequenceIndex)
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
                    === PropertyVisualization.Fill_Box
            ) {
                if (
                    this.hasProperty(
                        this.currentNumber,
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
                    === PropertyVisualization.Small_Box
            ) {
                if (
                    this.hasProperty(
                        this.currentNumber,
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

    hasProperty(num: bigint, property: Property) {
        if (property === Property.Prime) {
            return isPrime(num)
        } else if (property === Property.Negative) {
            return num < 0n
        } else if (property === Property.Even) {
            return num % 2n === 0n
        } else if (property === Property.Divisible_By_Three) {
            return num % 3n === 0n
        } else if (property === Property.Divisible_By_Four) {
            return num % 4n === 0n
        } else if (property === Property.Divisible_By_Five) {
            return num % 5n === 0n
        } else if (property === Property.Divisible_By_Six) {
            return num % 6n === 0n
        } else if (property === Property.Divisible_By_Seven) {
            return num % 7n === 0n
        } else if (property === Property.Divisible_By_Eight) {
            return num % 8n === 0n
        } else if (property === Property.Ends_With_One) {
            return num % 10n === 1n
        } else if (property === Property.Ends_With_Two) {
            return num % 10n === 2n
        } else if (property === Property.Ends_With_Three) {
            return num % 10n === 3n
        } else if (property === Property.Ends_With_Four) {
            return num % 10n === 4n
        } else if (property === Property.Ends_With_Five) {
            return num % 10n === 5n
        } else if (property === Property.Ends_With_Six) {
            return num % 10n === 6n
        } else if (property === Property.Ends_With_Seven) {
            return num % 10n === 7n
        } else if (property === Property.Ends_With_Eight) {
            return num % 10n === 8n
        } else if (property === Property.Ends_With_Nine) {
            return num % 10n === 9n
        } else if (property === Property.Ends_With_Zero) {
            return num % 10n === 0n
        } else if (property === Property.Sum_Of_Two_Squares) {
            return isSumOfTwoSquares(num)
        } else if (property === Property.Triangular_Number) {
            return isPolygonal(num, 3n)
        } else if (property === Property.Square_Number) {
            return isPolygonal(num, 4n)
        } else if (property === Property.Pentagonal_Number) {
            return isPolygonal(num, 5n)
        } else if (property === Property.Hexagonal_Number) {
            return isPolygonal(num, 6n)
        } else if (property === Property.Heptagonal_Number) {
            return isPolygonal(num, 7n)
        } else if (property === Property.Octagonal_Number) {
            return isPolygonal(num, 8n)
        } else if (property === Property.Abundant) {
            return isAbundant(num)
        } else if (property === Property.Perfect) {
            return isPerfect(num)
        } else if (property === Property.Deficient) {
            return !isPerfect(num) && !isAbundant(num)
        } else if (property === Property.Semi_Prime) {
            return isSemiPrime(num)
        }
        return false
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
}

export const exportModule = new VisualizerExportModule(
    'Grid',
    VisualizerGrid,
    'Puts numbers in a grid.'
)

/*
 *   FUNCTIONS TO CHECK FOR PROPERTIES
 */
//Taken from Stack Overflow :
//https://stackoverflow.com/questions/40200089/number-prime-test-in-javascript
//TODO This should be replaced with the getFactors from Numberscope.
function isPrime(num: bigint): boolean {
    if (num === 0n || num === 1n) {
        return false
    }
    if (num < 0n) {
        return isPrime(-num)
    }

    for (let x = 2n, s = floorSqrt(num); x <= s; x++) {
        if (num % x === 0n) {
            return false
        }
    }

    return num > 1n
}

//Taken from Geeks For Geeks :
//https://www.geeksforgeeks.org/deficient-number/
function getSumOfDivisors(num: bigint): bigint {
    // returns the sum of divisors of the absolute value
    if (num < 0n) {
        return getSumOfDivisors(-num)
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

//Taken from Geeks For Geeks :
//https://www.geeksforgeeks.org/
//check-whether-number-can-represented-sum-two-squares/
function isSumOfTwoSquares(num: bigint): boolean {
    // negative inputs are never sums of two squares
    if (num < 0n) {
        return false
    }
    for (let i = 1n; i * i <= num; i++) {
        for (let j = 1n; j * j <= num; j++)
            if (i * i + j * j === num) {
                return true
            }
    }
    return false
}

//Modification of Geeks for Geeks :
//https://www.geeksforgeeks.org/program-check-n-pentagonal-number/
function isPolygonal(num: bigint, order: bigint): boolean {
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

//Taken from Geeks For Geeks :
//https://www.geeksforgeeks.org/deficient-number/
function isAbundant(num: bigint): boolean {
    return getSumOfDivisors(num) > 2n * num
}

//Taken from Geeks For Geeks :
//https://www.geeksforgeeks.org/perfect-number/
function isPerfect(num: bigint): boolean {
    const sum = getSumOfDivisors(num) - num
    // If sum of divisors is equal to
    // n, then n is a perfect number
    if (sum === num && num != 1n) return true

    return false
}

//Taken from Geeks for Geeks:
//https://www.geeksforgeeks.org/check-whether-number-semiprime-not/
function isSemiPrime(num: bigint): boolean {
    // checks whether absolute value is semiprime
    if (num < 0n) {
        return isSemiPrime(-num)
    }

    // cnt counts prime divisors; it is correct for
    // primes and semiprimes and a lowerbound otherwise
    let cnt = 0
    // loop through integers below num
    for (let i = 2n; cnt < 2 && i * i <= num; ++i)
        while (num % i === 0n) {
            num /= i // if a divisor, divide out
            ++cnt // at least one prime was divided out
        }
    // If remaining number is greater than 1,
    // it is divisible by a prime number
    if (num > 1n) ++cnt
    return cnt === 2 ? true : false
}
/** md


## Examples

Click on any image to expand it.

###### The Ulam Spiral

[<img src="../../assets/img/Grid/1.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/1.png)
[<img src="../../assets/img/Grid/2.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/2.png)

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
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/3.png)
[<img src="../../assets/img/Grid/4.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/4.png)

The natural numbers are put in rows (left to right, top to bottom), 
with each of the prime numbers
highlighted in red.  Primes can only appear at positions 
which are coprime to the
rowlength, leading to the visual effect of black columns.

###### The Rows_Offset capability

[<img src="../../assets/img/Grid/5.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/5.png)
[<img src="../../assets/img/Grid/6.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/6.png)
[<img src="../../assets/img/Grid/7.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/7.png)
[<img src="../../assets/img/Grid/8.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/8.png)

When you choose ```Rows_Offset``` for the parameter ```Path in Grid```,
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
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/9.png)
[<img src="../../assets/img/Grid/10.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/10.png)
[<img src="../../assets/img/Grid/11.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/11.png)

[Abundant numbers](https://en.wikipedia.org/wiki/Abundant_number) 
([A005101](https://oeis.org/A005101)) are those whose sum of 
divisors (excluding the number 
itself) exceed the number.  The first two images show a spiral and row
arrangement of the natural numbers, with abundant numbers in 
black on a white background.
The last image combines abundant and primes in a spiral arrangement of 
the natural numbers.  The primes appear to fit "around" the abundant
numbers (this effect is easiest to appreciate by clicking on the last
image to expand it).

###### Polygonal Numbers

[<img src="../../assets/img/Grid/12.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/12.png)
[<img src="../../assets/img/Grid/13.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/13.png)
[<img src="../../assets/img/Grid/14.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/14.png)

Putting the natural numbers in a spiral or in rows (first two images), 
we can highlight the [polygonal
numbers](https://en.wikipedia.org/wiki/Polygonal_number). Polygonal numbers
are the
number of dots that can be arranged in the shape of that polygon. For example,
6 is a triangle number because one can form an equilateral triangle with 
three dots at the bottom, two dots in the middle, and one dot at the top.
The triangle numbers are red, the square number are orange, the 
pentagonal
numbers are yellow, the hexagonal numbers are green, the heptagonal numbers
are blue, and the octagonal numbers are purple. 
For the final image, we use the sequence of squares, and use the 
```Rows_Offset``` mode.

###### Digit colourings

[<img src="../../assets/img/Grid/15.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/15.png)
[<img src="../../assets/img/Grid/16.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/16.png)
[<img src="../../assets/img/Grid/17.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/17.png)
[<img src="../../assets/img/Grid/18.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/18.png)

The first image shows the natural numbers in rows, coloured by final digit.
The second image is the same, but in spiral format.  The final two images
show the digits of pi ([A000796](https://oeis.org/A000796)) in rows, 
at different magnifications.

###### Digits of abundant numbers ([A005101](https://oeis.org/A005101))

[<img src="../../assets/img/Grid/19.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/19.png)
[<img src="../../assets/img/Grid/20.png" width="320" 
style="margin-left: 1em; margin-right: 1em" 
/>](../../assets/img/Grid/20.png)

When the abundant numbers are put in a spiral and highlighted by their last
digit, the scarcity of odd abundant numbers (indicated here by small squares)
becomes visually apparent.  As we zoom out, we see they are clearly not 
random.


## Credit

The original version of this visualizer was created by Olivia Brobin, as part
of the [Experimental Mathematics
Lab](https://www.colorado.edu/math/content/experimental-mathematics-lab) at
[CU Boulder](https://www.colorado.edu/math/).


**/
