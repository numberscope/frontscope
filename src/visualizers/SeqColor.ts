import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import * as math from 'mathjs'

/** md

# Primes and Sizes Visualizer

In this visualizer, the brightness of each circle represents how fast $1/a^n$, 
where a is a number in the sequence, 
approaches zero as n increases.
Each prime number is assigned a color, 
and the color of each circle represents 
the color combination of its prime factors. \s

Press the "Left arrow key" to show/hide the color of each prime factor.\s
Press the "Right arrow key" to show/hide labels.\s
Press "[" to turn up brightness.\s
Press "]" to turn down brightness. \s
 **/

const colorMap = new Map()

// Show description box by pressing left arrow key
class SeqColor extends VisualizerDefault implements VisualizerInterface {
    name = 'Primes and Sizes'
    n = 64
    modulus = 100
    formula = 'log(n^x)'

    params = {
        n: {
            value: this.n,
            forceType: 'integer',
            displayName: 'number of terms',
            required: true,
        },
        modulus: {
            value: this.modulus,
            forceType: 'integer',
            displayName: 'growth ring modulus',
            description: 'Spacing of level sets',
            required: true,
        },
        formula: {
            value: this.formula,
            displayName: 'growth function',
            description: "A function in 'n' (term) and 'x' (growth variable)",
            required: true,
        },
    }

    private evaluator: math.EvalFunction

    private currentIndex = 0
    private position = this.sketch.createVector(0, 0)
    private boxSize = this.sketch.createVector(0, 0)
    private canvasSize = this.sketch.createVector(0, 0)
    private initialPosition = this.sketch.createVector(0, 0)
    private positionIncrement = 100
    private columns = 0
    private subG = this.sketch.createGraphics(0, 0)
    private subL = this.sketch.createGraphics(0, 0)
    private boxIsShow = false
    private primeNum: bigint[] = []
    private countPrime = 0
    private firstDraw = true
    private showLabel = false
    private brightAdjust = 100

    // dot control
    private radii = 50 // increments of radius in a dot
    private initialRadius = 50 // size of dots

    constructor() {
        super()
        // It is mandatory to initialize the `evaluator` property here,
        // so just use a simple dummy formula until the user provides one.
        this.evaluator = math.compile(this.formula)
    }

    initialize(sketch: p5, seq: SequenceInterface) {
        super.initialize(sketch, seq)
        this.sketch = sketch
        this.seq = seq
        this.currentIndex = seq.first
        this.position = this.sketch.createVector(0, 0)
        this.ready = true
        this.boxSize = this.sketch.createVector(800, 90)
        this.subG = this.sketch.createGraphics(this.boxSize.x, this.boxSize.y)
        this.canvasSize = this.sketch.createVector(800, 800)
        this.subL = this.sketch.createGraphics(
            this.canvasSize.x,
            this.canvasSize.y
        )
        this.columns = Math.ceil(Math.sqrt(this.n))
        this.positionIncrement = Math.floor(this.canvasSize.x / this.columns)
        this.initialRadius = Math.floor(this.positionIncrement / 2)
        this.radii = this.initialRadius
    }

    checkParameters() {
        // code currently re-used from SequenceFormula.ts
        const status = super.checkParameters()

        let parsetree = undefined
        try {
            parsetree = math.parse(this.params.formula.value)
        } catch (err: unknown) {
            status.isValid = false
            status.errors.push(
                'Could not parse formula: ' + this.params.formula.value
            )
            status.errors.push((err as Error).message)
            return status
        }
        const othersymbs = parsetree.filter(
            (node, path, parent) =>
                node.type === 'SymbolNode'
                && parent?.type !== 'FunctionNode'
                && node.name !== 'n'
                && node.name !== 'x'
        )
        if (othersymbs.length > 0) {
            status.isValid = false
            status.errors.push(
                "Only 'n' and 'x' may occur as a free variable in formula.",
                `Please remove '${(othersymbs[0] as math.SymbolNode).name}'`
            )
        }
        this.evaluator = parsetree.compile()
        return status
    }

    growthFunction(n: number, x: number) {
        return this.evaluator.evaluate({n: n, x: x})
    }

    setup() {
        this.sketch.background('black')
        this.sketch.colorMode(this.sketch.HSB, 360, 100, 100)
        this.sketch.frameRate(30)

        this.firstDraw = true

        // Set position of the circle
        this.initialPosition = this.sketch.createVector(
            this.initialRadius,
            this.initialRadius
        )
        this.position = this.sketch.createVector(
            this.initialPosition.x,
            this.initialPosition.y
        )

        // Obtain all prime numbers that appear as factors in the sequence
        for (let i = this.seq.first; i < this.n; i++) {
            const checkCurrentFactors = this.seq.getFactors(i)
            if (checkCurrentFactors !== null) {
                for (let j = 0; j < checkCurrentFactors.length; j++) {
                    const checkCurrentPrime = checkCurrentFactors[j][0]
                    if (!this.primeNum.includes(checkCurrentPrime)) {
                        this.primeNum.push(checkCurrentPrime)
                        this.countPrime += 1
                    }
                }
            }
        }
    }

    draw() {
        if (this.firstDraw == true && this.currentIndex < this.n) {
            this.drawCircle(this.currentIndex)

            this.currentIndex++

            this.changePosition()

            // Check if drawing finished
            if (this.currentIndex >= this.n) {
                this.firstDraw = false
            }
            this.sketch.noStroke()
        } else {
            // Moniitor keyboard events after finishing drawing
            // Bug: multiple clicks detected when only one click happened
            this.keyboardEvents()
        }
    }
    /** The following code can be used to fix the keyboardEvents() bug
     * once issue #120 is resolved
	keyPressed() {
  if (this.sketch.keyCode === this.sketch.LEFT_ARROW) {
        // Show/hide description box when the left arrow key is pressed
            if (this.boxIsShow == true && this.subG != null) {
                this.boxIsShow = false
                this.undrawBox()
            } else {
                this.boxIsShow = true
                this.drawBox()
            }
	}  else if (this.sketch.keyCode === this.sketch.RIGHT_ARROW) {
        // Show/hide label when right arrow key is pressed
    if (this.showLabel == false) {
                this.showLabel = true
                this.drawLabel()
            } else {
                this.showLabel = false
                this.undrawLabel()
            }
	}
	}
	**/
    keyboardEvents() {
        // Show description box when the left arrow key is pressed
        if (this.sketch.keyIsDown(this.sketch.LEFT_ARROW)) {
            if (this.boxIsShow == true && this.subG != null) {
                this.boxIsShow = false
                this.undrawBox()
            } else {
                this.boxIsShow = true
                this.drawBox()
            }
        }

        // Show label when right arrow key is pressed
        if (
            this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)
            && this.firstDraw == false
        ) {
            if (this.showLabel == false) {
                this.showLabel = true
                this.drawLabel()
            } else {
                this.showLabel = false
                this.undrawLabel()
            }
        }

        // Increase brightness "[" key is pressed
        if (this.sketch.keyIsDown(219) && this.firstDraw == false) {
            this.brightnessUp()
        }

        // Decrease brightness "]" key is pressed
        if (this.sketch.keyIsDown(221) && this.firstDraw == false) {
            this.brightnessDown()
        }
    }

    brightnessUp() {
        this.brightAdjust += 1
        this.redrawCircles()
    }

    brightnessDown() {
        this.brightAdjust -= 1
        this.redrawCircles()
    }

    // Draw labels for each circle
    drawLabel() {
        this.position = this.sketch.createVector(
            this.initialPosition.x,
            this.initialPosition.y
        )
        this.subL = this.sketch.createGraphics(
            this.canvasSize.x,
            this.canvasSize.y
        )
        this.subG.colorMode(this.sketch.HSB)
        this.subG.noStroke()
        for (let i = this.seq.first; i < this.n; i++) {
            this.showCircleLabel(i)
            this.changePosition()
        }
    }

    // Remove all labels by drawing circles again
    undrawLabel() {
        this.redrawCircles()
    }

    redrawCircles() {
        this.position = this.sketch.createVector(
            this.initialPosition.x,
            this.initialPosition.y
        )
        this.firstDraw = true
        this.currentIndex = this.seq.first
        this.sketch.redraw()
    }

    drawCircle(ind: number) {
        const numberNowBigint = this.seq.getElement(ind)
        const numberNow = Number(numberNowBigint)
        this.sketch.ellipseMode(this.sketch.RADIUS)
        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.noStroke()
        let radius = this.initialRadius
        let bright = 0

        // Obtain the color of the circle
        const combinedColor = this.primeFactors(ind)

        // iterate smaller and smaller circles
        for (let x = 0; x < this.radii; x++) {
            // set brightness based on function value
            bright =
                Math.abs(this.growthFunction(numberNow, x)) % this.modulus
            bright = this.brightAdjust * (bright / this.modulus)

            // draw the circle
            this.sketch.fill(combinedColor, 100, bright)
            this.sketch.ellipse(
                this.position.x,
                this.position.y,
                radius,
                radius
            )

            // Change brightness in terms of the difference
            radius -= this.initialRadius / this.radii
        }
    }

    showCircleLabel(numberNow: number) {
        this.sketch.fill('white')
        this.sketch.text(
            '1/'.concat(String(numberNow)).concat('^n'),
            this.position.x,
            this.position.y
        )
    }

    changePosition() {
        this.position.add(this.positionIncrement, 0)
        // if we need to go to next line
        if (this.currentIndex % this.columns == 0) {
            this.position.x = this.initialPosition.x
            this.position.add(0, this.positionIncrement)
        }
    }

    drawBox() {
        //Create a white background for the description box
        this.subG = this.sketch.createGraphics(this.boxSize.x, this.boxSize.y)
        this.subG.colorMode(this.sketch.HSB)
        this.subG.noStroke()
        this.subG.fill(0, 0, 100)
        this.subG.rect(0, 0, this.boxSize.x, this.boxSize.y)
        this.subG.fill('black')
        let tmpX = 0
        let tmpY = 0

        //Show the color of every prime number
        for (let i = 0; i < this.primeNum.length; i++) {
            this.subG.fill('black')
            this.subG.text(String(this.primeNum[i]), 10 + tmpX, 15 + tmpY)
            this.subG.fill(colorMap.get(this.primeNum[i]), 100, 100)

            this.subG.ellipse(35 + tmpX, 15 + tmpY, 10, 10)
            tmpX += 50
            if (tmpX >= this.canvasSize.x) {
                tmpX = 0
                tmpY += 30
            }
        }
        this.sketch.image(this.subG, 0, 700)
    }

    undrawBox() {
        if (this.subG) {
            //Draw a new black background to cover the description box
            this.subG.fill('black')
            this.subG.rect(0, 0, this.boxSize.x, this.boxSize.y)
            this.sketch.image(this.subG, 0, 700)
        }
    }

    isPrime(ind: number): boolean {
        const factors = this.seq.getFactors(ind)
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

    //return a number which represents the color
    primeFactors(ind: number) {
        const factors = this.seq.getFactors(ind)
        if (factors === null) {
            return -30
        } // factoring failed

        //assign color to each prime number
        const colorNum = 360 / this.countPrime

        colorMap.set(1, 0)
        let tmp = 0

        for (let i = 0; i < this.primeNum.length; i++) {
            if (colorMap.has(this.primeNum[i]) == false) {
                tmp += colorNum
                colorMap.set(this.primeNum[i], tmp)
            }
        }

        //Combine color for each prime factors
        let colorAll = -1
        for (let i = 0; i < factors.length; i++) {
            const thisPrime = factors[i][0]
            const thisExp = factors[i][1]
            for (let j = 0; j < this.primeNum.length; j++) {
                if (thisPrime == this.primeNum[j]) {
                    for (let k = 0; k < thisExp; k++) {
                        if (colorAll == -1) {
                            colorAll = colorMap.get(thisPrime)
                        } else {
                            colorAll =
                                (colorAll + colorMap.get(thisPrime)) / 2
                        }
                    }
                }
            }
        }

        return colorAll
    }
}

export const exportModule = new VisualizerExportModule(
    'Sequence Color',
    SeqColor,
    ''
)
// Bug: First circle for n+2, n+3, etc. is not shown properly
