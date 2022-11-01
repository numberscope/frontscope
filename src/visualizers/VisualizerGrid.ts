import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from '@/visualizers/VisualizerDefault'
import {ceil, floor} from 'mathjs'

const FIBONACCI_NUMBERS = [
    0n,
    1n,
    1n,
    2n,
    3n,
    5n,
    8n,
    13n,
    21n,
    34n,
    55n,
    89n,
    144n,
    233n,
    377n,
    610n,
    987n,
    1597n,
    2584n,
    4181n,
    6765n,
    10946n,
    17711n,
    28657n,
    46368n,
    75025n,
    121393n,
    196418n,
    317811n,
    514229n,
    832040n,
    1346269n,
    2178309n,
    3524578n,
    5702887n,
    9227465n,
    14930352n,
    24157817n,
    39088169n,
    63245986n,
    102334155n,
    165580141n,
    267914296n,
    433494437n,
    701408733n,
    1134903170n,
    1836311903n,
    2971215073n,
    4807526976n,
    7778742049n,
    12586269025n,
]
const LUCAS_NUMBERS = [
    2n,
    1n,
    3n,
    4n,
    7n,
    11n,
    18n,
    29n,
    47n,
    76n,
    123n,
    199n,
    322n,
    521n,
    843n,
    1346n,
    2207n,
    3571n,
    5778n,
    9349n,
    15127n,
    24476n,
    39603n,
    64079n,
    103682n,
    167761n,
    271443n,
    439204n,
    710647n,
    1149851n,
    1860498n,
    3010349n,
    4870847n,
    7881196n,
    12752043n,
    20633239n,
    33385282n,
    54018521n,
    87403803n,
    141422324n,
    228826127n,
    370248451n,
    599074578n,
    969323029n,
    1568397607n,
    2537720636n,
    4106118243n,
    6643838879n,
    10749957122n,
]

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

const HIGHLIGHT = RED
const SHADE13 = 'rgb(255, 255, 255)'
const SHADE12 = 'rgb(240, 240, 240)'
const SHADE11 = 'rgb(220, 220, 220)'
const SHADE10 = 'rgb(200, 200, 200)'
const SHADE9 = 'rgb(180, 180, 180)'
const SHADE8 = 'rgb(160, 160, 160)'
const SHADE7 = 'rgb(140, 140, 140)'
const SHADE6 = 'rgb(120, 120, 120)'
const SHADE5 = 'rgb(100, 100, 100)'
const SHADE4 = 'rgb(080, 080, 080)'
const SHADE3 = 'rgb(060, 060, 060)'
const SHADE2 = 'rgb(040, 040, 040)'
const SHADE1 = 'rgb(020, 020, 020)'
const SHADE0 = 'rgb(000, 000, 000)'

enum Preset {
    Custom,
    Primes,
    Factors,
    Factors_and_Primes,
    Divisibility,
    Abundant_Numbers,
    Abundant_Numbers_And_Primes,
    Polygonal_Numbers,
}

enum PathType {
    Spiral,
    Rows,
    Rows_Reset_Augmented_By_One,
    Rows_Have_Values_Squared_And_Reset_Augmented_By_One,
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
    Ends_With_One,
    Ends_With_Two,
    Ends_With_Three,
    Ends_With_Four,
    Ends_With_Five,
    Ends_With_Six,
    Ends_With_Seven,
    Ends_With_Eight,
    Ends_With_Nine,
    Ends_With_Zero,
    Triangular_Number,
    Square_Number,
    Pentagonal_Number,
    Hexagonal_Number,
    Heptagonal_Number,
    Octagonal_Number,
    Sum_Of_Two_Squares,
    Fibonacci_Number,
    Lucas_Number,
    Abundant,
    Perfect,
    Deficient,
    Semi_Prime,
}

enum PropertyVisualization {
    None,
    Color,
    Circle,
}

enum Formula {
    N,
    N_SQUARED,
    N_SQUARED_MINUS_N_PLUS_1,
}

class VisualizerGrid extends VisualizerDefault {
    name = 'Grid'
    description = 'This puts numbers in a grid!'
    amountOfNumbers = 40000n
    startingIndex = 0n
    showNumbers = false
    message = ''
    preset = Preset.Custom
    pathType = PathType.Spiral
    resetAndAugmentByOne = false
    formula = Formula.N
    backgroundColor = BLACK
    numberColor = WHITE

    //Path variables
    x = 0n
    y = 0n
    currentDirection = Direction.Right
    numberToTurnAt = 0n
    incrementForNumberToTurnAt = 1n
    whetherIncrementShouldIncrementForSpiral = true

    property1 = Property.Prime
    property1Visualization = PropertyVisualization.Color
    property1MainColor = RED
    property2 = Property.None
    property2Visualization = PropertyVisualization.None
    property2MainColor = BLUE
    property3 = Property.None
    property3Visualization = PropertyVisualization.None
    property3MainColor = GREEN
    property4 = Property.None
    property4Visualization = PropertyVisualization.None
    property4MainColor = YELLOW
    property5 = Property.None
    property5Visualization = PropertyVisualization.None
    property5MainColor = ORANGE
    property6 = Property.None
    property6Visualization = PropertyVisualization.None
    property6MainColor = PURPLE
    property7 = Property.None
    property7Visualization = PropertyVisualization.None
    property7MainColor = CYAN
    property8 = Property.None
    property8Visualization = PropertyVisualization.None
    property8MainColor = MAGENTA
    property9 = Property.None
    property9Visualization = PropertyVisualization.None
    property9MainColor = VERDANT
    property10 = Property.None
    property10Visualization = PropertyVisualization.None
    property10MainColor = VIOLET
    property11 = Property.None
    property11Visualization = PropertyVisualization.None
    property11MainColor = MUSTARD
    property12 = Property.None
    property12Visualization = PropertyVisualization.None
    property12MainColor = GRAY

    params = {
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
        property1: {
            value: this.property1,
            from: Property,
            displayName: 'Property 1',
            required: false,
        },
        property1Visualization: {
            value: this.property1Visualization,
            from: PropertyVisualization,
            displayName: 'Property 1 Visualization',
            required: false,
            visibleDependency: 'property1',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property1MainColor: {
            value: this.property1MainColor,
            forceType: 'color',
            displayName: 'Property 1 color:',
            required: false,
            visibleDependency: 'property1Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property2: {
            value: this.property2,
            from: Property,
            displayName: 'Property 2',
            required: false,
            visibleDependency: 'property1',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property2Visualization: {
            value: this.property2Visualization,
            from: PropertyVisualization,
            displayName: 'Property 2 Visualization',
            required: false,
            visibleDependency: 'property2',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property2MainColor: {
            value: this.property2MainColor,
            forceType: 'color',
            displayName: 'Property 2 color:',
            required: false,
            visibleDependency: 'property2Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property3: {
            value: this.property3,
            from: Property,
            displayName: 'Property 3',
            required: false,
            visibleDependency: 'property2',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property3Visualization: {
            value: this.property3Visualization,
            from: PropertyVisualization,
            displayName: 'Property 3 Visualization',
            required: false,
            visibleDependency: 'property3',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property3MainColor: {
            value: this.property3MainColor,
            forceType: 'color',
            displayName: 'Property 3 color:',
            required: false,
            visibleDependency: 'property3Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property4: {
            value: this.property4,
            from: Property,
            displayName: 'Property 4',
            required: false,
            visibleDependency: 'property3',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property4Visualization: {
            value: this.property4Visualization,
            from: PropertyVisualization,
            displayName: 'Property 4 Visualization',
            required: false,
            visibleDependency: 'property4',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property4MainColor: {
            value: this.property4MainColor,
            forceType: 'color',
            displayName: 'Property 4 color:',
            required: false,
            visibleDependency: 'property4Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property5: {
            value: this.property5,
            from: Property,
            displayName: 'Property 5',
            required: false,
            visibleDependency: 'property4',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property5Visualization: {
            value: this.property5Visualization,
            from: PropertyVisualization,
            displayName: 'Property 5 Visualization',
            required: false,
            visibleDependency: 'property5',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property5MainColor: {
            value: this.property5MainColor,
            forceType: 'color',
            displayName: 'Property 5 color:',
            required: false,
            visibleDependency: 'property5Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property6: {
            value: this.property6,
            from: Property,
            displayName: 'Property 6',
            required: false,
            visibleDependency: 'property5',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property6Visualization: {
            value: this.property6Visualization,
            from: PropertyVisualization,
            displayName: 'Property 6 Visualization',
            required: false,
            visibleDependency: 'property6',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property6MainColor: {
            value: this.property6MainColor,
            forceType: 'color',
            displayName: 'Property 6 color:',
            required: false,
            visibleDependency: 'property6Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property7: {
            value: this.property7,
            from: Property,
            displayName: 'Property 7',
            required: false,
            visibleDependency: 'property6',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property7Visualization: {
            value: this.property7Visualization,
            from: PropertyVisualization,
            displayName: 'Property 7 Visualization',
            required: false,
            visibleDependency: 'property7',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property7MainColor: {
            value: this.property7MainColor,
            forceType: 'color',
            displayName: 'Property 7 color:',
            required: false,
            visibleDependency: 'property7Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property8: {
            value: this.property8,
            from: Property,
            displayName: 'Property 8',
            required: false,
            visibleDependency: 'property7',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property8Visualization: {
            value: this.property8Visualization,
            from: PropertyVisualization,
            displayName: 'Property 8 Visualization',
            required: false,
            visibleDependency: 'property8',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property8MainColor: {
            value: this.property8MainColor,
            forceType: 'color',
            displayName: 'Property 8 color:',
            required: false,
            visibleDependency: 'property8Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property9: {
            value: this.property9,
            from: Property,
            displayName: 'Property 9',
            required: false,
            visibleDependency: 'property8',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property9Visualization: {
            value: this.property9Visualization,
            from: PropertyVisualization,
            displayName: 'Property 9 Visualization',
            required: false,
            visibleDependency: 'property9',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property9MainColor: {
            value: this.property9MainColor,
            forceType: 'color',
            displayName: 'Property 9 color:',
            required: false,
            visibleDependency: 'property9Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property10: {
            value: this.property10,
            from: Property,
            displayName: 'Property 10',
            required: false,
            visibleDependency: 'property9',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property10Visualization: {
            value: this.property10Visualization,
            from: PropertyVisualization,
            displayName: 'Property 10 Visualization',
            required: false,
            visibleDependency: 'property10',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property10MainColor: {
            value: this.property10MainColor,
            forceType: 'color',
            displayName: 'Property 10 color:',
            required: false,
            visibleDependency: 'property10Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property11: {
            value: this.property11,
            from: Property,
            displayName: 'Property 11',
            required: false,
            visibleDependency: 'property10',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property11Visualization: {
            value: this.property11Visualization,
            from: PropertyVisualization,
            displayName: 'Property 11 Visualization',
            required: false,
            visibleDependency: 'property11',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property11MainColor: {
            value: this.property11MainColor,
            forceType: 'color',
            displayName: 'Property 11 color:',
            required: false,
            visibleDependency: 'property11Visualization',
            visibleValue: PropertyVisualization.Color,
        },
        property12: {
            value: this.property12,
            from: Property,
            displayName: 'Property 12',
            required: false,
            visibleDependency: 'property11',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property12Visualization: {
            value: this.property12Visualization,
            from: PropertyVisualization,
            displayName: 'Property 12 Visualization',
            required: false,
            visibleDependency: 'property12',
            visiblePredicate: (dependentValue: Property) =>
                dependentValue !== Property.None,
        },
        property12MainColor: {
            value: this.property12MainColor,
            forceType: 'color',
            displayName: 'Property 12 color:',
            required: false,
            visibleDependency: 'property12Visualization',
            visibleValue: PropertyVisualization.Color,
        },
    }

    checkParameters() {
        const status = super.checkParameters()
        if (typeof this.message !== 'string') {
            status.isValid = false
            status.errors.push('message must be a string')
        }

        return status
    }
    setup(): void {
        this.sketch.createCanvas(400, 400)
    }

    draw(): void {
        this.setPresets()

        this.sketch.strokeWeight(0)

        this.setOverridingSettings()

        //Round up amount of numbers so that it is a square number.
        const squareRootOfAmountOfNumbers: bigint = bigIntSqrt(
            this.amountOfNumbers
        )
        this.amountOfNumbers =
            squareRootOfAmountOfNumbers * squareRootOfAmountOfNumbers

        //Calculate scaling factor
        const scalingFactor = 400n / squareRootOfAmountOfNumbers
        //This is because 20 x 20 is 1:1 scaling.

        //Set path variables
        this.setPathVariables(squareRootOfAmountOfNumbers, scalingFactor)

        let currentSequenceIndex = this.startingIndex - 1n
        let augmentForRow = 0n

        for (
            let iteration = 0n;
            iteration < this.amountOfNumbers;
            iteration++
        ) {
            currentSequenceIndex++

            if (this.currentDirection === Direction.StartNewRow) {
                if (this.resetAndAugmentByOne) {
                    currentSequenceIndex = this.startingIndex
                    augmentForRow++
                }
            }

            const sequenceElement = this.getNumberFromFormula(
                currentSequenceIndex,
                augmentForRow
            )

            const sequenceElementAsString = sequenceElement.toString()

            this.setColorForSquare(sequenceElement)

            //Draw square
            this.sketch.rect(
                Number(this.x),
                Number(this.y),
                Number(scalingFactor),
                Number(scalingFactor)
            )

            this.showNumbersOnGrid(sequenceElementAsString, scalingFactor)

            this.changeDirectionBasedOnPathType(
                squareRootOfAmountOfNumbers,
                iteration
            )

            this.moveCoordinatesBasedOnCurrentDirection(scalingFactor)
        }
        this.sketch.noLoop()
    }

    setPresets() {
        if (this.preset != Preset.Custom) {
            this.property1 = Property.None
            this.property2 = Property.None
            this.property3 = Property.None
            this.property4 = Property.None
            this.property5 = Property.None
            this.property6 = Property.None
            this.property7 = Property.None
            this.property8 = Property.None
            this.property9 = Property.None
            this.property10 = Property.None
            this.property11 = Property.None
            this.property12 = Property.None
        }

        if (this.preset === Preset.Primes) {
            this.backgroundColor = BLACK
            this.property1 = Property.Prime
            this.property1Visualization = PropertyVisualization.Color
            this.property1MainColor = RED
        } else if (this.preset === Preset.Abundant_Numbers) {
            this.backgroundColor = WHITE
            this.property1 = Property.Abundant
            this.property1Visualization = PropertyVisualization.Color
            this.property1MainColor = BLACK
        } else if (this.preset === Preset.Abundant_Numbers_And_Primes) {
            this.backgroundColor = WHITE
            this.property1 = Property.Abundant
            this.property1Visualization = PropertyVisualization.Color
            this.property1MainColor = BLACK
            this.property2 = Property.Prime
            this.property2Visualization = PropertyVisualization.Color
            this.property2MainColor = RED
        } else if (this.preset === Preset.Polygonal_Numbers) {
            this.backgroundColor = BLACK
            this.property1 = Property.Triangular_Number
            this.property1Visualization = PropertyVisualization.Color
            this.property1MainColor = RED
            this.property2 = Property.Square_Number
            this.property2Visualization = PropertyVisualization.Color
            this.property2MainColor = ORANGE
            this.property3 = Property.Pentagonal_Number
            this.property3Visualization = PropertyVisualization.Color
            this.property3MainColor = YELLOW
            this.property4 = Property.Hexagonal_Number
            this.property4Visualization = PropertyVisualization.Color
            this.property4MainColor = GREEN
            this.property5 = Property.Heptagonal_Number
            this.property5Visualization = PropertyVisualization.Color
            this.property5MainColor = BLUE
            this.property6 = Property.Octagonal_Number
            this.property6Visualization = PropertyVisualization.Color
            this.property6MainColor = PURPLE
        }
    }

    setOverridingSettings() {
        if (this.pathType === PathType.Rows_Reset_Augmented_By_One) {
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
        }

        if (
            this.pathType
            === PathType.Rows_Have_Values_Squared_And_Reset_Augmented_By_One
        ) {
            this.formula = Formula.N_SQUARED
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
        }

        if (this.showNumbers && this.amountOfNumbers > 400n) {
            this.amountOfNumbers = 400n
        }
    }

    getNumberFromFormula(
        currentSequenceIndex: bigint,
        augmentForRow: bigint
    ) {
        let sequenceElementAsNumber = this.seq.getElement(
            Number(currentSequenceIndex)
        )

        if (this.formula === Formula.N) {
            sequenceElementAsNumber = sequenceElementAsNumber + augmentForRow
        } else if (this.formula === Formula.N_SQUARED) {
            sequenceElementAsNumber =
                sequenceElementAsNumber * sequenceElementAsNumber
                + augmentForRow
        } else if (this.formula === Formula.N_SQUARED_MINUS_N_PLUS_1) {
            sequenceElementAsNumber =
                sequenceElementAsNumber * sequenceElementAsNumber
                + sequenceElementAsNumber
                + augmentForRow
                + 1n
        }

        return sequenceElementAsNumber
    }

    setPathVariables(
        squareRootOfAmountOfNumbers: bigint,
        scalingFactor: bigint
    ) {
        const gridSize = BigInt(squareRootOfAmountOfNumbers)

        //Declare initial movement variables
        if (this.pathType === PathType.Spiral) {
            //The starting point is placed so that the whole spiral is centered
            if (gridSize % 2n === 1n) {
                this.x = (gridSize / 2n - 1n) * scalingFactor
                this.y = (gridSize / 2n) * scalingFactor
            } else {
                this.x = (gridSize / 2n - 1n) * scalingFactor
                this.y = (gridSize / 2n) * scalingFactor
            }
        }

        if (this.pathType === PathType.Spiral) {
            //This uses an increment that decreases every other turn
            this.numberToTurnAt = 1n
            this.incrementForNumberToTurnAt = 1n
            this.currentDirection = Direction.Right
            this.whetherIncrementShouldIncrementForSpiral = true
        } else if (this.pathType === PathType.Rows) {
            this.currentDirection = Direction.Right
        }
    }

    changeDirectionBasedOnPathType(
        squareRootOfAmountOfNumbers: bigint,
        iteration: bigint
    ) {
        //Choose direction for next number
        if (this.pathType === PathType.Spiral) {
            //Turn at the numberToTurn at which increases every other turn
            if (iteration === this.numberToTurnAt) {
                this.numberToTurnAt += this.incrementForNumberToTurnAt
                if (this.whetherIncrementShouldIncrementForSpiral) {
                    this.incrementForNumberToTurnAt += 1n
                    this.whetherIncrementShouldIncrementForSpiral = false
                } else {
                    this.whetherIncrementShouldIncrementForSpiral = true
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
            if ((iteration + 1n) % squareRootOfAmountOfNumbers === 0n) {
                this.currentDirection = Direction.StartNewRow
            } else if (iteration === this.amountOfNumbers) {
                this.currentDirection = Direction.None
            } else {
                this.currentDirection = Direction.Right
            }
        }
    }

    moveCoordinatesBasedOnCurrentDirection(scalingFactor: bigint) {
        //Move coordinates to direction they're going to
        if (this.currentDirection === Direction.Right) {
            this.x += scalingFactor
        } else if (this.currentDirection === Direction.Up) {
            this.y -= scalingFactor
        } else if (this.currentDirection === Direction.Left) {
            this.x -= scalingFactor
        } else if (this.currentDirection === Direction.Down) {
            this.y += scalingFactor
        } else if (this.currentDirection === Direction.StartNewRow) {
            this.x = 0n
            this.y += scalingFactor
        }
    }

    setColorForSquare(sequenceElementAsNumber: bigint) {
        //Color number
        this.colorGradientPresets(sequenceElementAsNumber)
        this.colorMainColorProperties(sequenceElementAsNumber)
    }

    colorGradientPresets(sequenceElementAsNumber: bigint) {
        const preset = this.preset

        if (
            preset === Preset.Factors
            || preset === Preset.Factors_and_Primes
        ) {
            const numberOfFactors = sequenceElementAsNumber

            if (
                numberOfFactors === 0n
                || numberOfFactors === 1n
                || numberOfFactors === 2n
            ) {
                this.sketch.fill(SHADE0)

                if (preset === Preset.Factors_and_Primes) {
                    if (isPrime(sequenceElementAsNumber)) {
                        this.sketch.fill(HIGHLIGHT)
                    }
                }
            } else if (numberOfFactors === 3n) {
                this.sketch.fill(SHADE1)
            } else if (numberOfFactors === 4n) {
                this.sketch.fill(SHADE2)
            } else if (numberOfFactors === 5n) {
                this.sketch.fill(SHADE3)
            } else if (numberOfFactors === 6n) {
                this.sketch.fill(SHADE4)
            } else if (numberOfFactors === 7n) {
                this.sketch.fill(SHADE5)
            } else if (numberOfFactors === 8n) {
                this.sketch.fill(SHADE6)
            } else if (numberOfFactors === 9n) {
                this.sketch.fill(SHADE7)
            } else if (numberOfFactors === 10n) {
                this.sketch.fill(SHADE8)
            } else if (numberOfFactors === 11n) {
                this.sketch.fill(SHADE9)
            } else if (numberOfFactors === 12n) {
                this.sketch.fill(SHADE10)
            } else if (numberOfFactors === 13n) {
                this.sketch.fill(SHADE11)
            } else if (numberOfFactors === 14n) {
                this.sketch.fill(SHADE12)
            } else if (numberOfFactors === 15n) {
                this.sketch.fill(SHADE13)
            } else {
                this.sketch.fill(SHADE13)
            }
        } else if (preset === Preset.Divisibility) {
            if (
                sequenceElementAsNumber === 0n
                || sequenceElementAsNumber === 1n
            ) {
                this.sketch.fill(SHADE0)
            } else if (sequenceElementAsNumber % 2n === 0n) {
                this.sketch.fill(SHADE0)
            } else if (sequenceElementAsNumber % 3n === 0n) {
                this.sketch.fill(SHADE1)
            } else if (sequenceElementAsNumber % 5n === 0n) {
                this.sketch.fill(SHADE2)
            } else if (sequenceElementAsNumber % 7n === 0n) {
                this.sketch.fill(SHADE3)
            } else if (sequenceElementAsNumber % 11n === 0n) {
                this.sketch.fill(SHADE4)
            } else if (sequenceElementAsNumber % 13n === 0n) {
                this.sketch.fill(SHADE5)
            } else if (sequenceElementAsNumber % 17n === 0n) {
                this.sketch.fill(SHADE6)
            } else if (sequenceElementAsNumber % 19n === 0n) {
                this.sketch.fill(SHADE7)
            } else if (sequenceElementAsNumber % 23n === 0n) {
                this.sketch.fill(SHADE8)
            } else if (sequenceElementAsNumber % 29n === 0n) {
                this.sketch.fill(SHADE9)
            } else if (sequenceElementAsNumber % 31n === 0n) {
                this.sketch.fill(SHADE10)
            } else if (sequenceElementAsNumber % 37n === 0n) {
                this.sketch.fill(SHADE11)
            } else if (sequenceElementAsNumber % 41n === 0n) {
                this.sketch.fill(SHADE12)
            } else if (isPrime(sequenceElementAsNumber)) {
                this.sketch.fill(SHADE13)
            } else {
                this.sketch.fill(SHADE13)
            }
        } else {
            this.sketch.fill(this.backgroundColor)
        }
    }

    showNumbersOnGrid(
        sequenceElementAsString: string,
        scalingFactor: bigint
    ) {
        if (this.showNumbers) {
            this.sketch.fill(this.numberColor)
            this.sketch.text(
                sequenceElementAsString,
                Number(this.x + 0n * scalingFactor),
                Number(this.y + (15n * scalingFactor) / 20n)
            )
        }
    }

    colorMainColorProperties(sequenceElementAsNumber: bigint) {
        if (
            this.property1 != Property.None
            && this.property1Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property1)) {
                this.sketch.fill(this.property1MainColor)
            }
        }
        if (
            this.property2 != Property.None
            && this.property2Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property2)) {
                this.sketch.fill(this.property2MainColor)
            }
        }
        if (
            this.property3 != Property.None
            && this.property3Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property3)) {
                this.sketch.fill(this.property3MainColor)
            }
        }
        if (
            this.property4 != Property.None
            && this.property4Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property4)) {
                this.sketch.fill(this.property4MainColor)
            }
        }
        if (
            this.property5 != Property.None
            && this.property5Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property5)) {
                this.sketch.fill(this.property5MainColor)
            }
        }
        if (
            this.property6 != Property.None
            && this.property6Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property6)) {
                this.sketch.fill(this.property6MainColor)
            }
        }
        if (
            this.property7 != Property.None
            && this.property7Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property7)) {
                this.sketch.fill(this.property7MainColor)
            }
        }
        if (
            this.property8 != Property.None
            && this.property8Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property8)) {
                this.sketch.fill(this.property8MainColor)
            }
        }
        if (
            this.property9 != Property.None
            && this.property9Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property9)) {
                this.sketch.fill(this.property9MainColor)
            }
        }
        if (
            this.property10 != Property.None
            && this.property10Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property10)) {
                this.sketch.fill(this.property10MainColor)
            }
        }
        if (
            this.property11 != Property.None
            && this.property11Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property11)) {
                this.sketch.fill(this.property11MainColor)
            }
        }
        if (
            this.property12 != Property.None
            && this.property12Visualization === PropertyVisualization.Color
        ) {
            if (hasProperty(sequenceElementAsNumber, this.property12)) {
                this.sketch.fill(this.property12MainColor)
            }
        }
    }
}
export const exportModule = new VisualizerExportModule(
    'Grid',
    VisualizerGrid,
    'Puts numbers in a grid.'
)

function hasProperty(num: bigint, property: Property) {
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
        return num % 10n === 1n
    } else if (property === Property.Sum_Of_Two_Squares) {
        return isSumOfTwoSquares(num)
    } else if (property === Property.Fibonacci_Number) {
        return isPartOfSequence(num, FIBONACCI_NUMBERS)
    } else if (property === Property.Lucas_Number) {
        return isPartOfSequence(num, LUCAS_NUMBERS)
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

/*
 *   FUNCTIONS TO CHECK FOR PROPERTIES
 */

function isPartOfSequence(num: bigint, sequence: bigint[]) {
    for (let x = 0; x < sequence.length; x++) {
        if (num === sequence[x]) {
            return true
        }
    }
}

//Taken from Stack Overflow :
//https://stackoverflow.com/questions/40200089/number-prime-test-in-javascript
//TODO This should be replaced with the getFactors from Numberscope.
function isPrime(num: bigint) {
    if (num === 0n || num === 1n) {
        return false
    }

    for (let x = 2n, s = bigIntSqrt(num); x <= s; x++) {
        if (num % x === 0n) {
            return false
        }
    }

    return num > 1n
}

function bigIntSqrt(value: bigint) {
    if (value < 0n) {
        throw 'square root of negative numbers is not supported'
    }

    if (value < 2n) {
        return value
    }

    return newtonIteration(value, 1n)
}

function newtonIteration(n: bigint, x0: bigint): bigint {
    const x1 = (n / x0 + x0) >> 1n
    if (x0 === x1 || x0 === x1 - 1n) {
        return x0
    }
    return newtonIteration(n, x1)
}
//Taken from Stack Overflow :
//https://stackoverflow.com/
//questions/22130043/trying-to-find-factors-of-a-number-in-js
//TODO This should be replaced with the getFactors from Numberscope.
function getNumberOfFactors(num: bigint) {
    if (num === 0n) {
        return 0n
    }
    if (num === 1n) {
        return 1n
    }

    const isEven = num % 2n === 0n
    const max = bigIntSqrt(num)
    const inc = isEven ? 1n : 2n
    const factors = [1n, num]

    for (
        let curFactor = isEven ? 2n : 3n;
        curFactor <= max;
        curFactor += inc
    ) {
        if (num % curFactor !== 0n) continue
        factors.push(curFactor)
        const compliment = num / curFactor
        if (compliment !== curFactor) factors.push(compliment)
    }

    return factors.length
}

//Taken from Geeks For Geeks :
//https://www.geeksforgeeks.org/deficient-number/
function getSumOfDivisors(num: bigint) {
    let sumOfDivisors = 0n // Initialize sum of prime factors

    // Note that this loop runs till square root of n
    for (let i = 1n; i <= bigIntSqrt(num); i++) {
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
    if (num > 1n) ++cnt // Return '1' if count is equal // to '2' else return '0'
    return cnt === 2n ? 1n : 0n
}
