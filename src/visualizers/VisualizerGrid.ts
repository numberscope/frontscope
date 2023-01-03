import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {floorSqrt} from '@/shared/math'
import type {ParamInterface} from '@/shared/Paramable'

/** md
# Grid Visualizer

(example image should go here)

This visualizer puts a sequence in a square spiral or in
rows and allows you to highlight numbers based on various
properties.

The inspiration for this visualizer is [Ulam's
spiral](https://en.wikipedia.org/wiki/Ulam_spiral), which puts the
natural numbers in a square spiral and highlights the primes.  One can
also highlight properties such a whether a number is abundant or
polygonal. Several properties can be highlighted at once, in which case
later properties overcolor earlier ones.

The original version of this visualizer was created by Olivia Brobin, as part
of the [Experimental Mathematics
Lab](https://www.colorado.edu/math/content/experimental-mathematics-lab) at
[CU Boulder](https://www.colorado.edu/math/).

## Examples

###### 1 Natural numbers – Primes in a spiral with numbers

These are the natural numbers in a square spiral, with each of the prime
numbers highlighted; this is the classic [Ulam
spiral](https://en.wikipedia.org/wiki/Ulam_spiral).  In this preset, the value
of each term of the sequence is shown over the corresponding cell, in order to
demonstrate the spiral.

###### 2 Natural numbers – Primes in a spiral

This shows many more terms; it becomes evident that the primes form long
diagonal lines. These diagonal lines are quadratic equations, namely \( x^2 +
c, \) \( x^2 + 2x + c, \) \( x^2 -2x + c, \) and \( x^2 + 4x + c. \)

###### 3 Natural numbers – Primes in rows with numbers

The natural numbers are put in rows, with each of the prime numbers
highlighted.

###### 4 Primes in rows

Explanation?

###### 5 Natural numbers – Primes in rows that reset and augment with numbers

These are the natural numbers put in rows, but each row the sequence resets
with each number one more than the number above it.

###### 6 Natural numbers – Primes in rows that reset and augment

###### 7 Natural numbers – N^2 Primes in rows that reset and augment with
numbers

These are the square numbers put in rows, but each row the sequence resets
with each number one more than the number above it.

###### 8 Natural numbers – N^2 Primes in rows that reset and augment

When there are lots of numbers, long diagonal lines become apparent. The
diagonal lines that go up and to the right each have a corresponding diagonal
line that goes down and to the right because numbers repeat when they are
arranged this way. The quadratic equation for which each of these diagonals
corresponds is x^2 – x + C.

###### 9 Natural numbers – Abundant numbers in spiral

These are the natural numbers in a spiral. The abundant numbers are the black
squares, and the non-abundant numbers are the white squares. Abundant numbers
are numbers for which the sum of the factors is greater than the As you can
see, the abundant numbers have a lot more structure than the abundant numbers.

###### 10 Natural numbers – Abundant numbers in rows

The structure of the abundant numbers becomes even more evident when they are
put in rows.

###### 11 Natural numbers – Abundant numbers and primes in spiral

The abundant numbers are black, and the primes are red. When they are show
together, primes apear less sporadic as they seems to fit around the abundant
numbers.

###### 12 Natural numbers – Polygonal Numbers in spiral

This is the natural numbers in a spiral. The polygonal number are highlighted.
The triangle numbers are red, the square number are orange, the pentagonal
numbesr are yellow, the hexagonal numbers are green, the heptagonal numbers
are blue, and the octagonal numbers are purple. Polygonal numbers are the
number of dots that can be arranged in the shape of that polygon. For example,
6 is a triangle number because one can form a triangle with three dots at the
bottom, two dots in the middle, and one dot at the top.

###### 13 Natural numbers – Polyongal Number in rows

These are the polygonal numbers highlighted in rows.

###### 14 Natural numbers – N^2 Polygonal Numbers in rows that reset and
augment

These are the polygonal numbers highlighted in rows with the top row being x^2
and each of the squares being one more than the number above it.

###### 15 Natural numbers, Rainbow Colored in rows with numbers

These are the natural numbers in rows wiht each digit colored a different
color.

###### 16 Natural numbers, Rainbow Colored in spiral

These are the natural numbers in a spiral with each digit colored a different
color.

###### 17 Pi ([A000796](https://oeis.org/A000796)) – Rainbow Colored in rows
(With 1000 numbers)

These are the digits of pi in rows, with each digit colored a different color.

###### 18 Pi ([A000796](https://oeis.org/A000796)) – Rainbow Colored in rows
(With 40000 numbers)

These are the digits of pi in rows, with each digit colored a different color.

###### 19 Abundant Numbers ([A005101](https://oeis.org/A005101)) Colored By
Last Digit Alternative in a spiral

When the abundant numbers are put in a spiral and highlighted by their last
digit, the scarcit of odd abundant numbers becomes visually apparent. (With
1000 numbers)

###### 20 Abundant Numbers ([A005101](https://oeis.org/A005101)) Colored By
Last Digit Alternative in a spiral (With 40000 numbers)

When the abundant numbers are put in a spiral and highlighted by their last
digit, their structure clearly becomes not random.

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
    Primary_Color,
    Secondary_Color,
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
        displayName: `Property ${index + 1} Visualization`,
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
            visualization: PropertyVisualization.Primary_Color,
            color: RED,
        },
    ]

    params: {[key: string]: ParamInterface} = {
        /** md
### preset: Which preset to display

If a preset other than `Custom` is selected, then the `Properties`
portion of the dialog is overriden.  For details on the meanings of the terms
below, see the [properties section](#property-id) of the documentation.

- Custom:  the remaining properties can be set by the user
- Primes:  primes are shown in red
- Abundant_Numbers:  the abundant numbers are shown in black
- Abundant_Numbers_And_Primes:  the primes are shown in red and the abundant
  numbers in black
- Polygonal_Numbers:  the polygonal numbers are shown in a variety of
  different colours (one for each type of polygon)
- Color_By_Last_Digit_1:  the last digit is shown (one colour for each digit
  in a rainbow style)
- Color_By_Last_Digit_2:  a variation on the last, where some digits are
  'secondary' so the boxes are smaller

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
### amountOfNumbers: The number of cells to display in the grid

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
### startingIndex: The sequence index at which to begin
         **/
        startingIndex: {
            value: this.startingIndex,
            displayName: 'Starting Index',
            required: false,
            description: '',
        },

        /** md
### pathType: The path to follow while filling numbers into the grid.

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
### showNumbers: Whether to show sequence values overtop of grid boxes

When this is selected, the number of cells in the grid will be limited to 400
even if the user chooses more.
         **/
        showNumbers: {
            value: this.showNumbers,
            forceType: 'boolean',
            displayName: 'Show numbers',
            required: false,
            description: 'When true, grid is limited to 400 cells',
        },

        /** md
### numberColor: The font color of displayed numbers
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
### backgroundColor: The color of the background of the grid (non-highlighted
boxes)
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
{#property-id}

The user can add multiple properties.  For each, they must choosen a property
to highlight, and a colour with which to display it.  For each, the user can
select ```Primary_Color``` or ```Secondary_Color```.  Primary colours fill the
complete cell, while secondary colours fill a smaller box centered in the
cell; this allows for visualizing two properties at once without overcoloring.
Otherwise, later properties overcolor earlier ones.

- None:  No effect
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
         **/

        for (let i = 1; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            this.propertyObjects.push({
                property: Property.None,
                visualization: PropertyVisualization.Primary_Color,
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
                PropertyVisualization.Primary_Color
            this.propertyObjects[0].color = RED
        } else if (this.preset === Preset.Abundant_Numbers) {
            this.backgroundColor = WHITE
            this.propertyObjects[0].property = Property.Abundant
            this.propertyObjects[0].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[0].color = BLACK
        } else if (this.preset === Preset.Abundant_Numbers_And_Primes) {
            this.backgroundColor = WHITE
            this.propertyObjects[0].property = Property.Prime
            this.propertyObjects[0].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[0].color = RED
            this.propertyObjects[1].property = Property.Abundant
            this.propertyObjects[1].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[1].color = BLACK
        } else if (this.preset === Preset.Polygonal_Numbers) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Triangular_Number
            this.propertyObjects[0].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[0].color = RED
            this.propertyObjects[1].property = Property.Square_Number
            this.propertyObjects[1].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[1].color = ORANGE
            this.propertyObjects[2].property = Property.Pentagonal_Number
            this.propertyObjects[2].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[2].color = YELLOW
            this.propertyObjects[3].property = Property.Hexagonal_Number
            this.propertyObjects[3].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[3].color = GREEN
            this.propertyObjects[4].property = Property.Heptagonal_Number
            this.propertyObjects[4].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[4].color = BLUE
            this.propertyObjects[5].property = Property.Octagonal_Number
            this.propertyObjects[5].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[5].color = PURPLE
        } else if (this.preset === Preset.Color_By_Last_Digit_1) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Ends_With_Zero
            this.propertyObjects[0].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[0].color = RAINBOW[0]
            this.propertyObjects[1].property = Property.Ends_With_One
            this.propertyObjects[1].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[1].color = RAINBOW[1]
            this.propertyObjects[2].property = Property.Ends_With_Two
            this.propertyObjects[2].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[2].color = RAINBOW[2]
            this.propertyObjects[3].property = Property.Ends_With_Three
            this.propertyObjects[3].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[3].color = RAINBOW[3]
            this.propertyObjects[4].property = Property.Ends_With_Four
            this.propertyObjects[4].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[4].color = RAINBOW[4]
            this.propertyObjects[5].property = Property.Ends_With_Five
            this.propertyObjects[5].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[5].color = RAINBOW[5]
            this.propertyObjects[6].property = Property.Ends_With_Six
            this.propertyObjects[6].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[6].color = RAINBOW[6]
            this.propertyObjects[7].property = Property.Ends_With_Seven
            this.propertyObjects[7].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[7].color = RAINBOW[7]
            this.propertyObjects[8].property = Property.Ends_With_Eight
            this.propertyObjects[8].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[8].color = RAINBOW[8]
            this.propertyObjects[9].property = Property.Ends_With_Nine
            this.propertyObjects[9].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[9].color = RAINBOW[9]
        } else if (this.preset === Preset.Color_By_Last_Digit_2) {
            this.backgroundColor = BLACK
            this.propertyObjects[0].property = Property.Ends_With_Zero
            this.propertyObjects[0].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[0].color = RAINBOW[0]
            this.propertyObjects[1].property = Property.Ends_With_One
            this.propertyObjects[1].visualization =
                PropertyVisualization.Secondary_Color
            this.propertyObjects[1].color = RAINBOW[1]
            this.propertyObjects[2].property = Property.Ends_With_Two
            this.propertyObjects[2].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[2].color = RAINBOW[2]
            this.propertyObjects[3].property = Property.Ends_With_Three
            this.propertyObjects[3].visualization =
                PropertyVisualization.Secondary_Color
            this.propertyObjects[3].color = RAINBOW[3]
            this.propertyObjects[4].property = Property.Ends_With_Four
            this.propertyObjects[4].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[4].color = RAINBOW[4]
            this.propertyObjects[5].property = Property.Ends_With_Five
            this.propertyObjects[5].visualization =
                PropertyVisualization.Secondary_Color
            this.propertyObjects[5].color = RAINBOW[5]
            this.propertyObjects[6].property = Property.Ends_With_Six
            this.propertyObjects[6].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[6].color = RAINBOW[6]
            this.propertyObjects[7].property = Property.Ends_With_Seven
            this.propertyObjects[7].visualization =
                PropertyVisualization.Secondary_Color
            this.propertyObjects[7].color = RAINBOW[7]
            this.propertyObjects[8].property = Property.Ends_With_Eight
            this.propertyObjects[8].visualization =
                PropertyVisualization.Primary_Color
            this.propertyObjects[8].color = RAINBOW[8]
            this.propertyObjects[9].property = Property.Ends_With_Nine
            this.propertyObjects[9].visualization =
                PropertyVisualization.Secondary_Color
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
                    === PropertyVisualization.Primary_Color
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
                    === PropertyVisualization.Secondary_Color
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
