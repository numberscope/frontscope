import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'

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
    n = 40

    params = {
        n: {
            value: this.n,
            forceType: 'integer',
            displayName: 'number of terms',
            required: true,
        },
    }

    private currentIndex = 0
    private position = this.sketch.createVector(0, 0)
    private boxSize = this.sketch.createVector(0, 0)
    private canvasSize = this.sketch.createVector(0, 0)
    private subG = this.sketch.createGraphics(0, 0)
    private subL = this.sketch.createGraphics(0, 0)
    private boxIsShow = false
    private primeNum: bigint[] = []
    private countPrime = 0
    private firstDraw = true
    private showLabel = false
    private brightAdjust = 100

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
    }

    setup() {
        this.sketch.background('black')
        this.sketch.colorMode(this.sketch.HSB, 360, 100, 100)
        this.sketch.frameRate(30)

        this.firstDraw = true

        // Set position of the circle
        this.position = this.sketch.createVector(
            this.canvasSize.x / this.n + 30,
            this.canvasSize.x / this.n + 50
        )

        // Obtain all prime numbers from the sequence
        for (let i = this.seq.first; i < this.n; i++) {
            const checkCurrentPrime = this.seq.getElement(i)
            if (
                this.isPrime(i)
                && !this.primeNum.includes(checkCurrentPrime)
            ) {
                this.primeNum.push(checkCurrentPrime)
                this.countPrime += 1
            }
        }
    }

    draw() {
        if (this.firstDraw == true && this.currentIndex < this.n) {
            this.drawCircle(this.currentIndex++)

            this.changePosition()

            // Check if drawing finished
            if (this.currentIndex >= this.n) {
                this.firstDraw = false
            }
            this.sketch.noStroke()
        } else {
            // Monitor keyboard events after finishing drawing
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
        this.redrawCircle()
    }

    brightnessDown() {
        this.brightAdjust -= 1
        this.redrawCircle()
    }

    // Draw labels for each circle
    drawLabel() {
        this.position = this.sketch.createVector(
            this.canvasSize.x / this.n + 30,
            this.canvasSize.y / this.n + 50
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
        this.redrawCircle()
    }

    redrawCircle() {
        this.position = this.sketch.createVector(
            this.canvasSize.x / this.n + 30,
            this.canvasSize.x / this.n + 50
        )
        this.firstDraw = true
        this.currentIndex = this.seq.first
        this.sketch.redraw(1)
    }

    drawCircle(ind: number) {
        const numberNow = this.seq.getElement(ind)
        this.sketch.ellipseMode(this.sketch.RADIUS)
        let radius = 50
        let bright = 0

        for (let x = this.n; x >= 2; x--) {
            // Calculate the difference
            //  between 1/(number)^n and 1/(number)^(n-1)
            const diff = Math.abs(
                Math.log(
                    Math.abs(
                        1 / Math.pow(Number(numberNow), x - 1)
                            - Math.log(1 / Math.pow(Number(numberNow), x))
                    )
                )
            )

            // Obtain the color of the circle
            const combinedColor = this.primeFactors(
                ind,
                Number(this.countPrime)
            )

            this.sketch.colorMode(this.sketch.HSB)
            this.sketch.fill(combinedColor, 100, bright)
            this.sketch.ellipse(
                this.position.x,
                this.position.y,
                radius,
                radius
            )

            // Change brightness regarding
            //  the difference between 1/(number)^n and 1/(number)^(n-1)
            bright =
                (this.changeColor(diff, bright) * this.brightAdjust) / 100

            radius -= 1
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
        this.position.add(100, 0)
        // if we need to go to next line
        if (this.position.x >= this.canvasSize.x) {
            this.position.x = this.canvasSize.x / this.n + 30
            this.position.add(0, 100)
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

    //change the brightness of the circle
    changeColor(difference: number, now: number) {
        if ((now + difference) % 100 < now) {
            return 100
        }
        return (now + difference) % 100
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
    primeFactors(ind: number, totalPrime: number) {
        const factors = this.seq.getFactors(ind)
        if (factors === null) {
            return -1
        } // factoring failed

        //assign color to each prime number
        const colorNum = 360 / Number(totalPrime)

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
