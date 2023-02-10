import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'
import {floorSqrt} from '@/shared/math'

/** md
# cycles
This visualizer displays the number of steps each sequence value 
takes to reach a repeating cycle under either the Collatz 
function or the Juggler function.
**/

// choices of sequence formula
enum stepsTo1Formula {
    Collatz,
    Juggler,
}

// find the number of steps 'n' takes to reach 1 under the collatz formula
function collatzStepsTo1(n: bigint): number {
    let steps = 0n
    if (n <= 1n) {
        return 1
    }
    while (n !== 1n) {
        // if n is even, divide by 2
        if (n % 2n == 0n) {
            n = n / 2n
            steps++
        }
        // if n is odd (not even), then multiply by 3 and add 1
        else if (n % 2n !== 0n) {
            n = n * 3n + 1n
            steps++
        }
    }
    // casting 'steps' to a number will not create
    // issues as 'steps' will always be very small
    return Number(steps)
}

// find the number of steps 'm' takes to reach 1 under the juggler formula
function jugglerStepsTo1(m: bigint): number {
    let steps = 0n
    // steps stop when the sequence reaches 1
    if (m <= 1n) {
        return 1
    }
    while (m !== 1n) {
        // if m is even, take the floor of it's square root
        if (m % 2n == 0n) {
            m = floorSqrt(m)
            steps++
        }
        // if m is odd, take the floor of the it's cube
        else if (m % 2n !== 0n) {
            m = floorSqrt(m ** 3n)
            steps++
        }
    }
    // casting 'steps' to a number will not create
    // issues as 'steps' will always be very small
    return Number(steps)
}

class VisualizerCycles extends VisualizerDefault {
    name = 'Cycles'
    numberOfTerms = 2000
    width = 64
    stepsTo1Formula = stepsTo1Formula.Collatz
    workingSequence = [] as number[]
    params = {
        numberOfTerms: {
            value: this.numberOfTerms,
            forceType: 'integer',
            displayName: 'Number of Terms',
            required: true,
        },
        width: {
            value: this.width,
            forceType: 'integer',
            displayName: 'Mod of Array (width)',
            required: true,
        },
        stepsTo1Formula: {
            value: this.stepsTo1Formula,
            from: stepsTo1Formula,
            displayName: 'Steps To 1 Formula',
            required: true,
        },
    }

    checkParameters() {
        const status = super.checkParameters()
        if (this.params.numberOfTerms.value <= 0) {
            status.isValid = false
            status.errors.push('Number of terms must be positive')
        }
        if (this.params.width.value <= 0) {
            status.isValid = false
            status.errors.push('Width must be positive')
        }
        return status
    }

    getlength(n: bigint): number {
        return n.toString().length
    }

    setup() {
        // assorted settings
        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.background(0, 0, 0)
        this.sketch.textSize(13)

        // convert the input sequence to an array
        this.workingSequence = [] as number[]
        const end = Math.min(
            this.seq.first + this.numberOfTerms - 1,
            this.seq.last
        )

        // maxStepsTo1 will be the largest number of steps that
        // any of the starting values takes to reach 1
        let maxStepsTo1 = 1

        // user selects either collatz or juggler collatz
        const stepFinder =
            this.stepsTo1Formula === stepsTo1Formula.Collatz
                ? collatzStepsTo1
                : jugglerStepsTo1

        for (let i = this.seq.first; i <= end; i++) {
            this.workingSequence.push(stepFinder(this.seq.getElement(i)))
        }

        // find the maxStepsTo1 under collatz
        for (let i = 0; i < this.workingSequence.length; i++) {
            if (this.workingSequence[i] > maxStepsTo1) {
                maxStepsTo1 = this.workingSequence[i]
            }
        }

        for (let i = 0; i < this.workingSequence.length; i++) {
            const x = (800 / this.width) * (i % this.width)
            const y = (800 / this.width) * Math.floor(i / this.width)
            this.sketch.fill(100, 100, 0)

            this.sketch.fill(
                (this.workingSequence[i] * 255) / maxStepsTo1,
                100,
                100
            )

            // draw each of the squares
            this.sketch.noStroke()
            this.sketch.square(x, y, 800 / this.width)
        }
    }

    // draw() contains all of the mouseOver functions
    draw() {
        super.draw() // not exactly sure what this line is for

        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.textFont('Helvetica')

        // x and y-coordinate of mouse
        const x = this.sketch.mouseX
        const y = this.sketch.mouseY

        // find the y-coordinate to set the mouseOver info
        const tempY =
            (800 / this.width) * Math.floor(this.numberOfTerms / this.width)
        let lastY = 0
        // we can't let the display screen go past 720 vertical
        // or it would go off the screen
        if (tempY < 720) {
            lastY = tempY
        }
        if (tempY >= 720) {
            lastY = 720
        }
        // given the x and y coordinates of the mouse, find the
        // corresponding index of the square's sequence value
        const squareWidth = 800 / this.width
        const indexOfSquareMouseOver =
            Math.floor(x / squareWidth)
            + this.width * Math.floor(y / squareWidth)

        // background large rectangle
        this.sketch.fill(225, 50, 100)
        this.sketch.rect(0, lastY, 800, 80)

        // text settings for top of mouseOver info
        this.sketch.fill(0, 0, 100)
        this.sketch.textSize(20)

        // run only if the mouse if over the visualizer
        if (
            indexOfSquareMouseOver < this.workingSequence.length
            && x > 0
            && y > 0
            && x <= 800
        ) {
            let m = this.seq.getElement(
                indexOfSquareMouseOver + this.seq.first
            )

            const mainText = `Index: ${indexOfSquareMouseOver}  Value: ${m}  Steps To 1: ${collatzStepsTo1(
                m
            )}`
            this.sketch.text(mainText, 15, lastY + 27)

            // smaller background rect for sequence
            this.sketch.fill(225, 75, 100)
            this.sketch.rect(18, lastY + 40, 765, 30, 10)

            // text settings for the sequence list
            this.sketch.textStyle('bold')
            this.sketch.textSize(15)
            this.sketch.fill(0, 0, 0)
            this.sketch.text(m.toString(), 25, lastY + 60)

            if (this.sketch.mouseIsPressed) {
                // white outline on the square that the mouse is over
                this.sketch.strokeWeight(3)
                this.sketch.noFill()
                this.sketch.stroke(0, 0, 100)
                // draw the outline
                this.sketch.square(
                    squareWidth * Math.floor(x / squareWidth) + 2,
                    squareWidth * Math.floor(y / squareWidth) + 2,
                    800 / this.width - 4
                )
                this.sketch.strokeWeight(0)
                this.sketch.fill(0, 0, 0)
            }

            // hDist tracks the horizontal distance at which the next number
            // is placed and is dependent on the length of the previous number
            let hDist = 7 + this.getlength(m) * 0.5
            for (let i = 0; hDist <= 700; i++) {
                const j = this.getlength(m)
                if (m % 2n == 0n) {
                    m = m / 2n
                    hDist += j * 8 + 22
                    // red means the previous number was even
                    this.sketch.fill(0, 100, 100) // color red
                    this.sketch.text(m.toString(), hDist, lastY + 60)
                } else if (m % 2n == 1n) {
                    m = 3n * m + 1n
                    hDist += j * 8 + 22
                    // blue means the previous number was odd
                    this.sketch.fill(240, 100, 100) // color blue
                    this.sketch.text(m.toString(), hDist, lastY + 60)
                }
            }
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Cycles',
    VisualizerCycles,
    ''
)
