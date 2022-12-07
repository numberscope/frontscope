import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'

/** md
# Sequence Color Visualizer
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
    name = 'Sequence Color'
    n = 40

    params = {
        n: {
            value: this.n,
            forceType: 'integer',
            displayName: 'number of terms',
            required: true,
        },
    }

    private currentNum = 0
    private X = 0
    private Y = 0
    private boxSizeX = 800
    private boxSizeY = 90
    //private boxSize = this.sketch.createVector(800, 90)
    private canvasSizeX = 800
    private canvasSizeY = 800
    private subG = this.sketch.createGraphics(this.boxSizeX, this.boxSizeY)
    private subL = this.sketch.createGraphics(
        this.canvasSizeX,
        this.canvasSizeY
    )
    private boxIsShow = false
    private primeNum: number[] = []
    private countPrime = 0
    private firstDraw = true
    private showLabel = false
    private brightAdjust = 100

    initialize(sketch: p5, seq: SequenceInterface) {
        super.initialize(sketch, seq)
        this.sketch = sketch
        this.seq = seq
        this.currentNum = seq.first
        this.X = 0
        this.Y = 0
        this.ready = true
    }

    setup() {
        this.sketch.background('black')
        this.sketch.colorMode(this.sketch.HSB, 360, 100, 100)
        this.sketch.frameRate(30)

        this.firstDraw = true

        // Set position of the circle
        this.X = this.canvasSizeX / this.n + 30
        this.Y = this.canvasSizeX / this.n + 50

        // Obtain all prime numbers from the sequence
        for (let i = this.seq.first; i < this.n; i++) {
            const checkCurrentPrime = Number(this.seq.getElement(i))
            if (
                this.isPrime(checkCurrentPrime)
                && !this.primeNum.includes(checkCurrentPrime)
            ) {
                this.primeNum.push(checkCurrentPrime)
                this.countPrime += 1
            }
        }
    }

    draw() {
        if (this.firstDraw == true && this.currentNum < this.n) {
            const currentElement = Number(
                this.seq.getElement(this.currentNum++)
            )
            this.drawCircle(currentElement)

            this.changePosition()

            // Check if drawing finished
            if (this.currentNum >= this.n) {
                this.firstDraw = false
            }
            this.sketch.noStroke()
        } else {
            // Monitor keyboard events after finishing drawing
            // Bug: multiple clicks detected when only one click happened
            this.keyboardEvents()
        }
    }

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
        this.X = this.canvasSizeX / this.n + 30
        this.Y = this.canvasSizeX / this.n + 50
        this.subL = this.sketch.createGraphics(
            this.canvasSizeX,
            this.canvasSizeY
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
        this.X = this.canvasSizeX / this.n + 30
        this.Y = this.canvasSizeX / this.n + 50
        this.firstDraw = true
        this.currentNum = this.seq.first
        this.sketch.redraw(1)
    }

    drawCircle(numberNow: number) {
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
                Number(numberNow),
                Number(this.countPrime)
            )

            this.sketch.colorMode(this.sketch.HSB)
            this.sketch.fill(combinedColor, 100, bright)
            this.sketch.ellipse(this.X, this.Y, radius, radius)

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
            this.X,
            this.Y
        )
    }

    changePosition() {
        this.X += 100
        if (this.X >= this.canvasSizeX) {
            this.X = this.canvasSizeX / this.n + 30
            this.Y += 100
        }
    }

    drawBox() {
        //Create a white background for the description box
        this.subG = this.sketch.createGraphics(this.boxSizeX, this.boxSizeY)
        this.subG.colorMode(this.sketch.HSB)
        this.subG.noStroke()
        this.subG.fill(0, 0, 100)
        this.subG.rect(0, 0, this.boxSizeX, this.boxSizeY)
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
            if (tmpX >= this.canvasSizeX) {
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
            this.subG.rect(0, 0, this.boxSizeX, this.boxSizeY)
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

    isPrime(n: number) {
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) {
                return false
            }
        }
        return n > 1
    }

    //return a number which represents the color
    primeFactors(n: number, totalPrime: number) {
        const factors = []
        let factorCheck = 2
        //assign color to each prime number
        const colorNum = 360 / Number(totalPrime)

        colorMap.set(1, 0)
        let tmp = 0

        while (n >= 2) {
            if (n % factorCheck == 0) {
                factors.push(factorCheck)
                n = n / factorCheck
            } else {
                factorCheck++
            }
        }

        for (let i = 0; i < this.primeNum.length; i++) {
            if (colorMap.has(this.primeNum[i]) == false) {
                tmp += colorNum
                colorMap.set(this.primeNum[i], tmp)
            }
        }

        //Combine color for each prime factors
        let colorAll = -1
        for (let i = 0; i < factors.length; i++) {
            for (let j = 0; j < this.primeNum.length; j++) {
                if (factors[i] == this.primeNum[j]) {
                    if (colorAll == -1) {
                        colorAll = colorMap.get(factors[i])
                    } else {
                        colorAll = (colorAll + colorMap.get(factors[i])) / 2
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
