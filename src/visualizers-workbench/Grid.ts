import {P5Visualizer} from '../visualizers/P5Visualizer'
import {VisualizerExportModule} from '../visualizers/VisualizerInterface'

import type {
    SequenceInterface,
    Factorization,
} from '@/sequences/SequenceInterface'
import simpleFactor from '@/sequences/simpleFactor'
import {math} from '@/shared/math'
import type {
    GenericParamDescription,
    ParamInterface,
} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'

// NOTE: Grid visualizer is not currently working due to the new Paramable
// system, which is why it has been moved to `visualizers-workbench`
// Perhaps an issue should be opened to fix this

/** md
# Grid Visualizer

[<img src="../../assets/img/Grid/example-grid.png" width="320"
style="margin-left: 1em; margin-right: 1em"
/>](../assets/img/Grid/example-grid.png)

This visualizer places the entries of a sequence into a square grid along
a specified path (a spiral or along rows, etc.) and allows you to highlight
the cells of the grid based on various properties of the number placed into
each cell.

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
// #IHateTypeScriptRedundancy
type PropertyIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

enum Preset {
    Primes,
    Abundant_Numbers,
    Abundant_Numbers_And_Primes,
    Polygonal_Numbers,
    Color_By_Last_Digit_1,
    Color_By_Last_Digit_2,
    Custom,
}
type PresetName = Exclude<keyof typeof Preset, number>

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

const leftTurn: Record<string, Direction> = {
    Right: Direction.Up,
    Left: Direction.Down,
    Up: Direction.Left,
    Down: Direction.Right,
}

enum Property {
    None,
    Prime,
    Negative,
    Even,
    Odd,
    Divisible_By,
    Last_Digit_Is,
    Polygonal_Number,
    Sum_Of_Two_Squares,
    Abundant,
    Perfect,
    Deficient,
    Semiprime,
}

enum PropertyVisualization {
    Fill_Cell,
    Box_In_Cell,
}

const propertyAuxName: Record<string, string> = {
    Divisible_By: 'Divisor',
    Last_Digit_Is: 'Digit',
    Polygonal_Number: 'Sides',
}

interface PropertyObject {
    property: Property
    visualization: PropertyVisualization
    color: string // should this be a typedef?
    aux: bigint // auxiliary parameter for the property, meaning varies
}

const presetBackgrounds: {[key in PresetName]: string} = {
    Custom: BLACK,
    Primes: BLACK,
    Abundant_Numbers: WHITE,
    Abundant_Numbers_And_Primes: WHITE,
    Polygonal_Numbers: BLACK,
    Color_By_Last_Digit_1: BLACK,
    Color_By_Last_Digit_2: BLACK,
}

const presetProperties: {[key in PresetName]: PropertyObject[]} = {
    Custom: [],
    Primes: [
        {
            property: Property.Prime,
            visualization: PropertyVisualization.Fill_Cell,
            color: RED,
            aux: 0n,
        },
    ],
    Abundant_Numbers: [
        {
            property: Property.Abundant,
            visualization: PropertyVisualization.Fill_Cell,
            color: BLACK,
            aux: 0n,
        },
    ],
    Abundant_Numbers_And_Primes: [
        {
            property: Property.Prime,
            visualization: PropertyVisualization.Fill_Cell,
            color: RED,
            aux: 0n,
        },
        {
            property: Property.Abundant,
            visualization: PropertyVisualization.Fill_Cell,
            color: BLACK,
            aux: 0n,
        },
    ],
    Polygonal_Numbers: [
        {
            property: Property.Polygonal_Number,
            visualization: PropertyVisualization.Fill_Cell,
            color: RED,
            aux: 3n,
        },
        {
            property: Property.Polygonal_Number,
            visualization: PropertyVisualization.Fill_Cell,
            color: ORANGE,
            aux: 4n,
        },
        {
            property: Property.Polygonal_Number,
            visualization: PropertyVisualization.Fill_Cell,
            color: YELLOW,
            aux: 5n,
        },
        {
            property: Property.Polygonal_Number,
            visualization: PropertyVisualization.Fill_Cell,
            color: GREEN,
            aux: 6n,
        },
        {
            property: Property.Polygonal_Number,
            visualization: PropertyVisualization.Fill_Cell,
            color: BLUE,
            aux: 7n,
        },
        {
            property: Property.Polygonal_Number,
            visualization: PropertyVisualization.Fill_Cell,
            color: PURPLE,
            aux: 8n,
        },
    ],
    Color_By_Last_Digit_1: Array.from({length: 10}, (_item, index) => ({
        property: Property.Last_Digit_Is,
        visualization: PropertyVisualization.Fill_Cell,
        color: RAINBOW[index],
        aux: BigInt(index),
    })),
    Color_By_Last_Digit_2: Array.from({length: 10}, (_item, index) => ({
        property: Property.Last_Digit_Is,
        visualization:
            index % 2
                ? PropertyVisualization.Box_In_Cell
                : PropertyVisualization.Fill_Cell,
        color: RAINBOW[index],
        aux: BigInt(index),
    })),
}

/*
 * The following functions are used to check properties.
 */

function isPrime(factors: Factorization): boolean {
    if (factors === null) throw new Error('Internal error in Grid')
    if (factors.length == 0) return false // 1 is not prime
    const [factor, power] = factors[0]
    switch (factors.length) {
        case 1:
            return factor > 1n && power === 1n
        case 2:
            return factor === -1n && factors[1][1] === 1n // negative of prime
    }
    return false // two or more prime factors
}

// Adapted from Geeks for Geeks:
// https://www.geeksforgeeks.org/deficient-number/
function getSumOfProperDivisors(num: bigint): bigint {
    if (num === 0n) return 1n // conventional value to make 0 abundant.
    // returns the sum of divisors of the absolute value
    if (num < 0n) num = -num
    let sumOfDivisors = 1n // 1 always divisor, leave out num itself
    let i, partner
    // Note that this loop will break beyond square root of n
    for (i = 2n, partner = num / i; i <= partner; i++, partner = num / i) {
        if (num % i === 0n) {
            sumOfDivisors += i
            if (partner > i) sumOfDivisors += partner
        }
    }
    return sumOfDivisors
}

function isSumOfTwoSquares(factors: Factorization): boolean {
    if (factors === null) throw new Error('Internal error in Grid')
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
    return legendre === 1
}

// Modification of Geeks for Geeks:
// https://www.geeksforgeeks.org/program-check-n-pentagonal-number/
function isPolygonal(num: bigint, order = 3n): boolean {
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

const isAbundant = (n: bigint) => getSumOfProperDivisors(n) > math.bigabs(n)
const isPerfect = (n: bigint) => n > 1n && getSumOfProperDivisors(n) === n
const isDeficient = (n: bigint) => getSumOfProperDivisors(n) < math.bigabs(n)

function isSemiPrime(factors: Factorization): boolean {
    if (factors === null) throw new Error('Internal error in Grid')
    if (factors.length === 0) return false // 1 is not semi-prime
    const [factor, power] = factors[0]
    switch (factors.length) {
        case 1:
            if (factor < 2n) return false // 0, -1 not semiprime
            return power === 2n // square of prime
        case 2:
            if (factor < 2n) {
                return factors[1][1] === 2n // negative prime square
            }
            return power === 1n && factors[1][1] === 1n // product of two primes
        case 3:
            if (factor < 2n) {
                // negative of product of two primes
                return factors[1][1] === 1n && factors[2][1] === 1n
            }
        // FALL THROUGH
    }
    return false // three or more prime factors
}

function divisibleBy(value: bigint, divisor = 3n) {
    return value % divisor === 0n
}

function congruenceIndicator(modulus: bigint, residue: bigint) {
    return (value: bigint) => math.divides(modulus, value - residue)
}

function lastDigitIs(value: bigint, digit = 0n) {
    return value < 0n ? value % 10n === -digit : value % 10n === digit
}

/* Define the semantics of the Property values */

type PropertyName = Exclude<keyof typeof Property, number>

const propertyOfFactorization = {
    Prime: true,
    Sum_Of_Two_Squares: true,
    Semiprime: true,
} as const

type FactorPropertyName = keyof typeof propertyOfFactorization
type ValuePropertyName = Exclude<PropertyName, FactorPropertyName>

const propertyIndicatorFunction: {
    [key in PropertyName]: key extends FactorPropertyName
        ? (factorization: Factorization) => boolean
        : key extends ValuePropertyName
          ? (() => boolean) | ((value: bigint, aux?: bigint) => boolean)
          : never
} = {
    None: () => false,
    Prime: isPrime,
    Negative: (v: bigint) => v < 0n,
    Even: congruenceIndicator(2n, 0n),
    Odd: congruenceIndicator(2n, 1n),
    Divisible_By: divisibleBy,
    Last_Digit_Is: lastDigitIs,
    Sum_Of_Two_Squares: isSumOfTwoSquares,
    Polygonal_Number: isPolygonal,
    Abundant: isAbundant,
    Perfect: isPerfect,
    Deficient: isDeficient,
    Semiprime: isSemiPrime,
}

const templatePropertyObjects: PropertyObject[] = []

for (let i = 0; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
    const ithPropertyObject = {
        property: i === 0 ? Property.Prime : Property.None,
        visualization:
            i === 1
                ? PropertyVisualization.Box_In_Cell
                : PropertyVisualization.Fill_Cell,
        color: DEFAULT_COLORS[i],
        aux: 3n,
    }
    templatePropertyObjects.push(ithPropertyObject)
}

type propParamHelper<N extends number> = {
    [K in `property${N}`]: ParamInterface<ParamType.ENUM>
} & {[K in `prop${N}Vis`]: ParamInterface<ParamType.ENUM>} & {
    [K in `prop${N}Color`]: ParamInterface<ParamType.COLOR>
} & {[K in `prop${N}Aux`]: ParamInterface<ParamType.BIGINT>}

function getPropertyParams<N extends number>(index: N) {
    const prop = templatePropertyObjects[index]
    const propIx: `property${N}` = `property${index}`
    const propVis: `prop${N}Vis` = `prop${index}Vis`
    const propColor: `prop${N}Color` = `prop${index}Color`
    const propAux: `prop${N}Aux` = `prop${index}Aux`
    return {
        [propIx]: {
            default: prop.property,
            type: ParamType.ENUM,
            from: Property,
            displayName: `Property ${index + 1}`,
            required: true,
            visibleDependency: index > 0 ? `property${index - 1}` : 'preset',
            visibleValue: index === 0 ? Preset.Custom : undefined,
            visiblePredicate:
                index > 0 ? (d: Property) => d !== Property.None : undefined,
            level: 0,
        },
        [propVis]: {
            default: prop.visualization,
            type: ParamType.ENUM,
            from: PropertyVisualization,
            displayName: 'Display',
            required: true,
            visibleDependency: `property${index}`,
            visiblePredicate: (d: Property) => d !== Property.None,
        },
        [propColor]: {
            default: prop.color,
            type: ParamType.COLOR,
            displayName: 'Color',
            required: true,
            visibleDependency: `property${index}`,
            visiblePredicate: (d: Property) => d !== Property.None,
        },
        [propAux]: {
            default: prop.aux,
            type: ParamType.BIGINT,
            displayName: (d: Property) => propertyAuxName[Property[d]] || '',
            required: false,
            visibleDependency: `property${index}`,
            visiblePredicate: (d: Property) => Property[d] in propertyAuxName,
        },
    } as propParamHelper<N>
}

const paramDesc = {
    /** md
### Path in grid: The path to follow while filling numbers into the grid.

- Spiral:  An Ulam-type square spiral starting at the center of grid.
- Rows:  Left-to-right, top-to-bottom in rows.
- Rows_Augment:  Each row restarts the sequence from the starting index,
but adds the row number to the sequence _values_.
    **/
    pathType: {
        default: PathType.Spiral,
        type: ParamType.ENUM,
        from: PathType,
        displayName: 'Path in grid',
        required: true,
    },

    /** md
### Show entries: Whether to show values overlaid on cells

When this is selected, the number of cells in the grid will be
limited to 400
even if you choose more.
    **/
    showNumbers: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Show entries',
        required: true,
        description: 'When true, grid is limited to 400 cells',
    },

    /** md
### Entry color: The font color of displayed entries

This parameter is only available when the "Show entries" parameter is
checked.
    **/
    numberColor: {
        default: WHITE,
        type: ParamType.COLOR,
        displayName: 'Entry color',
        required: true,
        visibleDependency: 'showNumbers',
        visiblePredicate: (dependentValue: boolean) =>
            dependentValue === true,
    },
    /** md
### Background Color: Background color of the grid
    **/
    backgroundColor: {
        default: BLACK,
        type: ParamType.COLOR,
        displayName: 'Background color',
        required: false,
    },
    /** md
### Highlight properties: What attribute(s) of the entries to display

For details on the meanings of the
terms below, see the
[Properties](#property-1-2-etc-properties-to-display-by-coloring-cells)
section of the documentation.

- Primes:  primes are shown in red
- Abundant_Numbers:  the abundant numbers are shown in black
- Abundant_Numbers_And_Primes:  the primes are shown in red and the abundant
numbers in black
- Polygonal_Numbers:  the polygonal numbers are shown in a variety of
different colors (one for each type of polygon)
- Color_By_Last_Digit_1:  the last digit is shown (one color for each digit
in a rainbow style)
- Color_By_Last_Digit_2:  a variation on the last, where odd digits are
indicated by smaller boxes
- Custom:  choose whatever specific properties you would like to highlight
    **/
    preset: {
        default: Preset.Primes,
        type: ParamType.ENUM,
        from: Preset,
        displayName: 'Highlight properties',
        required: true,
    },
    /* HELP: If anyone can figure out how to avoid listing all 12 of
       the following while still getting the correct type for paramDesc,
       please improve this code:
    */
    ...getPropertyParams(0),
    ...getPropertyParams(1),
    ...getPropertyParams(2),
    ...getPropertyParams(3),
    ...getPropertyParams(4),
    ...getPropertyParams(5),
    ...getPropertyParams(6),
    ...getPropertyParams(7),
    ...getPropertyParams(8),
    ...getPropertyParams(9),
    ...getPropertyParams(10),
    ...getPropertyParams(11),
} satisfies GenericParamDescription

class Grid extends P5Visualizer(paramDesc) {
    static category = 'Grid'
    static description =
        'Puts sequence entries in grid cells, highlighting them '
        + 'based on various properties'

    // Grid variables
    nEntries = 4096n
    sideOfGrid = 64
    currentIndex = 0n
    currentNumber = 0n
    resetAndAugmentByOne = false

    // Path variables
    x = 0
    y = 0
    scalingFactor = 0
    currentDirection = Direction.Right
    numberToTurnAtForSpiral = 0
    incrementForNumberToTurnAt = 1
    whetherIncrementShouldIncrement = true

    // Properties
    propertyObjects: PropertyObject[] = []
    primaryProperties: number[] = []
    secondaryProperties: number[] = []

    constructor(seq: SequenceInterface) {
        super(seq)
        /** md
### Property 1, 2, etc.:  Properties to display by coloring cells

You can add multiple properties.  For each, there are some parameters
to set.

##### Property:  the property to highlight

The description for each property specifies the conditions under which
that property holds for a given integer.

- None:  This is simply a placeholder to indicate that no further properties
will be used.  Choosing anything other than none will add a new property
and reveal parameters for it.
- Prime:  Its absolute value is prime
- Negative:  Less than zero
- Even:  Divisible by two
- Odd: Not even
- Divisible_By:  Divisible by the specified divisor
- Last_Digit_Is:  The final digit base 10 is the specified digit
- Polygonal_Number:  Positive and that many dots can be arranged in a
  polygonal arrangement with the specified number of sides.
- Sum_Of_Two_Squares:  Nonnegative and equal to the sum of two squares
- Abundant:  Its absolute value exceeds the sum of its proper divisors
- Perfect:  Equal to the sum of its proper divisors
- Deficient:  Its absolute value is less than the sum of its proper divisors
- Semiprime:  Its absolute value is a
  [semiprime](https://en.wikipedia.org/wiki/Semiprime), that is, a product of
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
        this.propertyObjects = templatePropertyObjects.map(pobj =>
            Object.assign({}, pobj)
        )
    }

    async assignParameters() {
        await super.assignParameters()

        for (let i: PropertyIndex = 0; i < MAXIMUM_ALLOWED_PROPERTIES; i++) {
            this.propertyObjects[i].property =
                this[`property${i}` as `property${PropertyIndex}`]
            this.propertyObjects[i].visualization =
                this[`prop${i}Vis` as `prop${PropertyIndex}Vis`]
            this.propertyObjects[i].color =
                this[`prop${i}Color` as `prop${PropertyIndex}Color`]
            this.propertyObjects[i].aux =
                this[`prop${i}Aux` as `prop${PropertyIndex}Aux`]
        }
    }

    setup(): void {
        super.setup()
        this.setPresets()
        this.setOverridingSettings()

        this.sketch.background(this.backgroundColor).strokeWeight(0)

        // determine whether to watch for primary or secondary fills
        this.primaryProperties = this.propertiesFilledWith(
            PropertyVisualization.Fill_Cell
        )
        this.secondaryProperties = this.propertiesFilledWith(
            PropertyVisualization.Box_In_Cell
        )

        if (typeof this.seq.length === 'bigint') {
            this.nEntries = this.seq.length
        } // else TODO: Post warning about not using all terms

        // Round down amount of numbers so that it is a square number.
        const side = math.floorSqrt(this.nEntries)
        this.sideOfGrid = Number(side)
        this.nEntries = side * side

        this.scalingFactor = this.sketch.width / this.sideOfGrid
        this.setPathVariables(this.sideOfGrid)
    }

    draw(): void {
        this.currentIndex = this.seq.first
        let augmentForRowReset = 0n

        for (let iteration = 0; iteration < this.nEntries; iteration++) {
            // Reset current sequence for row reset and augment by one.
            if (this.currentDirection === Direction.StartNewRow) {
                if (this.resetAndAugmentByOne) {
                    this.currentIndex = this.seq.first
                    augmentForRowReset++
                }
            }

            this.setCurrentNumber(this.currentIndex, augmentForRowReset)
            this.fillGridCell()
            this.currentIndex++
            this.moveCoordinatesUsingPath(iteration)
        }
        this.stop()
    }

    setPresets() {
        if (this.preset != Preset.Custom) {
            for (let i = 0; i < this.propertyObjects.length; i++) {
                this.propertyObjects[i].property = Property.None
            }
            const preset = Preset[this.preset] as PresetName
            this.backgroundColor = presetBackgrounds[preset]
            const useProps = presetProperties[preset]
            for (let i = 0; i < useProps.length; ++i) {
                Object.assign(this.propertyObjects[i], useProps[i])
            }
        }
    }

    setOverridingSettings() {
        if (this.pathType === PathType.Rows_Augment) {
            this.pathType = PathType.Rows
            this.resetAndAugmentByOne = true
        }

        if (this.showNumbers && this.nEntries > 400n) {
            this.nEntries = 400n
        }
    }

    setCurrentNumber(currentIndex: bigint, augmentForRow: bigint) {
        this.currentNumber = this.seq.getElement(currentIndex)
        this.currentNumber = this.currentNumber + augmentForRow
    }

    setPathVariables(gridSize: number) {
        // The default starting point is the top left.
        this.x = 0
        this.y = 0

        // The default starting direction is right.
        this.currentDirection = Direction.Right

        if (this.pathType === PathType.Spiral) {
            // The starting point placed so that the whole spiral is centered
            if (gridSize % 2 === 1) {
                this.x = (gridSize / 2 - 1 / 2) * this.scalingFactor
                this.y = (gridSize / 2 - 1 / 2) * this.scalingFactor
            } else {
                this.x = (gridSize / 2 - 1) * this.scalingFactor
                this.y = (gridSize / 2) * this.scalingFactor
            }

            // The amount of numbers to the next turn increases every other turn
            this.numberToTurnAtForSpiral = 1
            this.incrementForNumberToTurnAt = 1
            this.whetherIncrementShouldIncrement = true
        }
    }

    fillGridCell() {
        this.drawSquare(this.primaryProperties, this.scalingFactor)
        this.drawSquare(
            this.secondaryProperties,
            this.scalingFactor / 2,
            this.scalingFactor / 4
        )
        if (this.showNumbers) {
            this.showNumber()
        }
    }

    drawSquare(props: number[], size: number, offset = 0) {
        if (this.colorProperties(props)) {
            this.sketch.rect(this.x + offset, this.y + offset, size, size)
        }
    }

    propertiesFilledWith(fillType: PropertyVisualization) {
        const retVal: number[] = []
        for (let i = 0; i < this.propertyObjects.length; i++) {
            if (
                this.propertyObjects[i].property != Property.None
                && this.propertyObjects[i].visualization === fillType
            ) {
                retVal.push(i)
            }
        }
        return retVal
    }

    // returns whether any of the properties held, i.e. whether indicator
    // needs to be drawn, and by side effect sets the fill color
    colorProperties(props: number[]): boolean {
        let retval = false
        for (const i of props) {
            if (
                this.hasProperty(
                    this.currentIndex,
                    this.propertyObjects[i].property,
                    this.propertyObjects[i].aux
                )
            ) {
                this.sketch.fill(this.propertyObjects[i].color)
                retval = true
            }
        }
        return retval
    }

    hasProperty(ind: bigint, property: Property, aux?: bigint) {
        const propertyName = Property[property] as PropertyName
        if (propertyName in propertyOfFactorization) {
            let factors: Factorization = null
            if (this.currentNumber === this.seq.getElement(ind)) {
                factors = this.seq.getFactors(ind)
            }
            if (factors === null) {
                factors = simpleFactor(this.currentNumber)
            }
            if (factors === null) {
                throw new RangeError(
                    `Factorization needed to compute ${propertyName} `
                        + `of ${this.currentNumber}, but unavailable.`
                )
            }
            return propertyIndicatorFunction[
                propertyName as FactorPropertyName
            ](factors)
        }
        return propertyIndicatorFunction[propertyName as ValuePropertyName](
            this.currentNumber,
            aux
        )
    }

    showNumber() {
        const currentNumberAsString = this.currentNumber.toString()

        if (this.showNumbers) {
            this.sketch
                .fill(this.numberColor)
                .text(
                    currentNumberAsString,
                    this.x + 0 * this.scalingFactor,
                    this.y + (15 * this.scalingFactor) / 20
                )
        }
    }

    moveCoordinatesUsingPath(iteration: number) {
        this.changeDirectionUsingPathType(iteration)
        this.moveCoordinatesUsingCurrentDirection()
    }

    changeDirectionUsingPathType(iteration: number) {
        // Choose direction for next number
        if (this.pathType === PathType.Spiral) {
            // Turn at the numberToTurn at which increases every other turn
            if (iteration === this.numberToTurnAtForSpiral) {
                this.numberToTurnAtForSpiral
                    += this.incrementForNumberToTurnAt
                if (this.whetherIncrementShouldIncrement) {
                    this.incrementForNumberToTurnAt += 1
                    this.whetherIncrementShouldIncrement = false
                } else {
                    this.whetherIncrementShouldIncrement = true
                }
                this.currentDirection =
                    leftTurn[Direction[this.currentDirection]]
            }
        } else if (this.pathType === PathType.Rows) {
            // Go to new row when the row is complete
            if ((iteration + 1) % this.sideOfGrid === 0) {
                this.currentDirection = Direction.StartNewRow
            } else if (BigInt(iteration) === this.nEntries) {
                this.currentDirection = Direction.None
            } else {
                this.currentDirection = Direction.Right
            }
        }
    }

    moveCoordinatesUsingCurrentDirection() {
        switch (this.currentDirection) {
            case Direction.Right:
                this.x += this.scalingFactor
                break
            case Direction.Up:
                this.y -= this.scalingFactor
                break
            case Direction.Left:
                this.x -= this.scalingFactor
                break
            case Direction.StartNewRow:
                this.x = 0
            // FALL THROUGH
            case Direction.Down:
                this.y += this.scalingFactor
        }
    }
}

export const exportModule = new VisualizerExportModule(Grid)

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
