import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {floorSqrt} from '@/shared/math'
import type {ParamInterface} from '@/shared/Paramable'

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
    Rainbow_Colored_By_Last_Digit,
    Rainbow_Colored_By_Last_Digit_Alternative,
}

enum PathType {
    Spiral,
    Rows,
    Rows_Reset_Augmented_By_One,
    Rows_Reset_Augmented_By_One_And_Values_Are_Squared,
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
    Number_Sequence,
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
    None,
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
        displayName: `Property ${index + 1} color:`,
        required: false,
        visibleDependency: `property${index}Visualization`,
        visiblePredicate: (dependentValue: PropertyVisualization) =>
            dependentValue === PropertyVisualization.Primary_Color
            || dependentValue === PropertyVisualization.Secondary_Color,
    }

    return propertyColor
}

class VisualizerGrid extends VisualizerDefault {
    name = 'Grid'
    description =
        'This visualizer puts any number sequence in a spiral or in '
        + 'rows and allows you to highlight numbers based on various'
        + ' properties.'
        + ' One use of this tool is to put the natural numbers in a spiral'
        + " and to highlight the prime ones, which is known as Ulam's "
        + 'spiral. '
        + 'Another use of this tool is highlighting properties such as'
        + ' whether a number is abundant, polygonal, '
        + 'or in some other sequence.'

    //Grid variables
    amountOfNumbers = 40000
    currentSequenceIndex = 0
    startingIndex = 0
    currentNumber = 0n
    showNumbers = false
    preset = Preset.Custom
    pathType = PathType.Spiral
    resetAndAugmentByOne = false
    squareValues = false
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
        preset: {
            value: this.preset,
            from: Preset,
            displayName: 'Presets',
            required: false,
            description:
                'Note: If a preset is selected, properties no longer function.',
        },
        amountOfNumbers: {
            value: this.amountOfNumbers,
            displayName: 'Amount of Numbers',
            required: false,
            description:
                'Note: There is an increased lag time over 10,000 numbers',
        },
        startingIndex: {
            value: this.startingIndex,
            displayName: 'Starting Index',
            required: false,
            description: 'Note: This does not accept negative numbers.',
        },
        pathType: {
            value: this.pathType,
            from: PathType,
            displayName: 'How path moves about grid',
            required: false,
        },
        showNumbers: {
            value: this.showNumbers,
            forceType: 'boolean',
            displayName: 'Show numbers',
            required: false,
            description:
                'Note: Show_Path and Show_Numbers default to 400 numbers',
        },
        numberColor: {
            value: this.numberColor,
            forceType: 'color',
            displayName: 'Number color:',
            required: false,
            visibleDependency: 'showNumbers',
            visiblePredicate: (dependentValue: boolean) =>
                dependentValue === true,
        },
        backgroundColor: {
            value: this.backgroundColor,
            forceType: 'color',
            displayName: 'Background color:',
            required: false,
        },
    }

    constructor() {
        super()
        for (let i = 1; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            this.propertyObjects.push({
                property: Property.None,
                visualization: PropertyVisualization.None,
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

    setup(): void {
        this.sketch.createCanvas(400, 400)
    }

    draw(): void {
        this.setPresets()

        this.sketch.strokeWeight(0)

        this.setOverridingSettings()

        this.amountOfNumbers = Math.min(
            this.amountOfNumbers,
            this.seq.last - this.seq.first + 1
        )

        if (this.usesNumberSequenceAsProperty()) {
            this.amountOfNumbers = Math.min(
                this.amountOfNumbers,
                Number(this.seq.getElement(this.seq.last))
            )
        }

        //Round up amount of numbers so that it is a square number.
        const squareRootOfAmountOfNumbers = Number(
            floorSqrt(this.amountOfNumbers)
        )

        this.amountOfNumbers =
            squareRootOfAmountOfNumbers * squareRootOfAmountOfNumbers

        //This is because 20 x 20 is 1:1 scaling.
        this.scalingFactor = 400 / squareRootOfAmountOfNumbers

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
        } else if (this.preset === Preset.Rainbow_Colored_By_Last_Digit) {
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
        } else if (
            this.preset === Preset.Rainbow_Colored_By_Last_Digit_Alternative
        ) {
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
        if (this.pathType === PathType.Rows_Reset_Augmented_By_One) {
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
        }

        if (
            this.pathType
            === PathType.Rows_Reset_Augmented_By_One_And_Values_Are_Squared
        ) {
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
            this.squareValues = true
        }

        if (this.showNumbers && this.amountOfNumbers > 400) {
            this.amountOfNumbers = 400
        }
    }

    setCurrentNumber(currentSequenceIndex: number, augmentForRow: bigint) {
        this.currentNumber = 0n

        if (this.usesNumberSequenceAsProperty()) {
            this.currentNumber = BigInt(currentSequenceIndex)
        } else {
            this.currentNumber = this.seq.getElement(currentSequenceIndex)
        }

        if (this.squareValues) {
            this.currentNumber = this.currentNumber * this.currentNumber
        }

        this.currentNumber = this.currentNumber + augmentForRow
    }

    usesNumberSequenceAsProperty() {
        for (let i = 0; i < this.propertyObjects.length; i++) {
            if (
                this.propertyObjects[i].property == Property.Number_Sequence
            ) {
                return true
            }
        }

        return false
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
        this.colorMainColorProperties()
        this.drawBigSquare()
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
        if (property === Property.Number_Sequence) {
            for (
                let a = this.seq.first;
                a < Math.min(this.seq.last - this.seq.first + 1, 200);
                a++
            ) {
                if (this.seq.getElement(a) == num) {
                    return true
                }
            }
            return false
        } else if (property === Property.Prime) {
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
function isPrime(num: bigint) {
    if (num === 0n || num === 1n) {
        return false
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
function getSumOfDivisors(num: bigint) {
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
function isSumOfTwoSquares(num: bigint) {
    for (let i = 1n; i * i <= num; i++) {
        for (let j = 1n; j * j <= num; j++)
            if (i * i + j * j === num) {
                return true
            }
    }
}

//Modification of Geeks for Geeks :
//https://www.geeksforgeeks.org/program-check-n-pentagonal-number/
function isPolygonal(num: bigint, order: bigint) {
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
function isAbundant(num: bigint) {
    return getSumOfDivisors(num) > 2n * num
}

//Taken from Geeks For Geeks :
//https://www.geeksforgeeks.org/perfect-number/
function isPerfect(num: bigint) {
    // To store sum of divisors
    let sum = 1n

    // Find all divisors and add them
    for (let i = 2n; i * i <= num; i++) {
        if (num % i === 0n) {
            if (i * i != num) sum = sum + i + num / i
            else sum = sum + i
        }
    }
    // If sum of divisors is equal to
    // n, then n is a perfect number
    if (sum === num && num != 1n) return true

    return false
}

//Taken from Geeks for Geeks:
//https://www.geeksforgeeks.org/check-whether-number-semiprime-not/
function isSemiPrime(num: bigint) {
    let cnt = 0n
    for (let i = 2n; cnt < 2n && i * i <= num; ++i)
        while (num % i === 0n) {
            num /= i // Increment count // of prime numbers
            ++cnt
        }
    // If number is greater than 1,
    // add it to the count variable
    // as it indicates the number
    // remain is prime number
    if (num > 1n) ++cnt
    return cnt === 2n ? 1n : 0n
    // Return '1' if count is equal // to '2' else return '0'
}
