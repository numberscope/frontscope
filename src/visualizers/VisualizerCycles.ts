import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'
import {floorSqrt} from '@/shared/math'

/** md
# cycles
This visualizer displays the number of steps each sequence value 
takes to reach a repeating
cycle under either the Collatz function or the Juggler function.
**/

//Choices of sequence formula
enum cycleFormula {
    Collatz,
    Juggler,
}

//Find the number of steps 'n' takes to reach 1 under the collatz formula
function collatzStepsTo1(n: bigint): number {
    let steps = 0n
    if (n <= 1n) {
        return 1
    }
    while (n !== 1n) {
        if (n % 2n == 0n) {
            n = n / 2n
            steps++
        } else if (n % 2n !== 0n) {
            n = n * 3n + 1n
            steps++
        }
    }
    // casting 'steps' to a number will not create
    // issues as 'steps' will always be very small
    return Number(steps)
}

//Find the number of steps 'm' takes to reach 1 under the juggler formula
function jugglerStepsTo1(m: bigint): number {
    // Juggler will NOT work well with bigints because we need to
    // take a square root of a bigint, currently don't have a good fix
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
        } else if (m % 2n !== 0n) {
            // WARNING The function will fail after too many iterations
            // if m is odd, take the floor of it's square root cubed
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
    numberOfTerms = 1000
    width = 50
    cycleFormula = cycleFormula.Collatz
    displayBoxLines = false
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
        cycleFormula: {
            value: this.cycleFormula,
            from: cycleFormula,
            displayName: 'Cycle Formula',
            required: true,
        },
        displayBoxLines: {
            value: this.displayBoxLines,
            displayName: 'Overlay Box Lines',
            required: false,
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
        console.log('Success')

        //assorted settings
        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.background(0, 0, 0)
        this.sketch.textSize(13)

        // Convert the input sequence to an array
        this.workingSequence = [] as number[]
        const end = Math.min(
            this.seq.first + this.numberOfTerms - 1,
            this.seq.last
        )

        // maxCycle will be the largest number of steps that
        // any of the starting values takes to reach 1
        let maxCycle = 1

        // The user selects either collatz or juggler collatz
        const stepFinder =
            this.cycleFormula === cycleFormula.Collatz
                ? collatzStepsTo1
                : jugglerStepsTo1

        for (let i = this.seq.first; i <= end; i++) {
            this.workingSequence.push(stepFinder(this.seq.getElement(i)))
        }
        //Find the maxCycle under collatz
        for (let i = 0; i < this.workingSequence.length; i++) {
            if (this.workingSequence[i] > maxCycle) {
                maxCycle = this.workingSequence[i]
            }
        }

        for (let i = 0; i < this.workingSequence.length; i++) {
            const x = (800 / this.width) * (i % this.width)
            const y = (800 / this.width) * Math.floor(i / this.width)
            this.sketch.fill(100, 100, 0)

            this.sketch.fill(
                (this.workingSequence[i] * 255) / maxCycle,
                100,
                100
            )

            //Draw each of the squares
            this.sketch.noStroke()
            this.sketch.square(x, y, 800 / this.width)

            //Show black lines around each box
            if (this.displayBoxLines) {
                this.sketch.stroke(1, 1, 0)
                this.sketch.square(x, y, 800 / this.width)
            }
            this.sketch.noStroke()
        }
    }

    // draw() contains all of the mouseOver functions
    draw() {
        super.draw()

        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.textFont('Helvetica')

        //x and y-coordinate of mouse
        const x = this.sketch.mouseX
        const y = this.sketch.mouseY

        // find the y-coordinate to set the mouseOver info
        const tempY =
            (800 / this.width) * Math.floor(this.numberOfTerms / this.width)
        let lastY = 0
        if (tempY < 720) {
            lastY = tempY
        }
        if (tempY >= 720) {
            lastY = 720
        }
        const squareWidth = 800 / this.width
        const indexOfSquareMouseOver =
            Math.floor(x / squareWidth)
            + this.width * Math.floor(y / squareWidth)

        //background large rectangle
        this.sketch.fill(225, 50, 100)
        this.sketch.rect(0, lastY, 800, 80)

        // text settings for top of mouseOver info
        this.sketch.fill(0, 0, 100)
        this.sketch.textSize(25)

        if (indexOfSquareMouseOver < this.workingSequence.length) {
            let m = this.seq.getElement(
                indexOfSquareMouseOver + this.seq.first
            )
            console.log(indexOfSquareMouseOver, m)

            const mainText =
                `Starting value: ${m} Cycle value: `
                + `${collatzStepsTo1(m)} Sequence: `
            this.sketch.text(mainText, 15, lastY + 27)

            //smaller background rect for sequence
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
            let hDist = 12 + this.getlength(m) * 5
            for (let i = 0; hDist <= 700; i++) {
                const j = this.getlength(m)
                if (m % 2n == 0n) {
                    m = m / 2n
                    hDist += j * 5 + 22
                    // red means the previous number was even
                    this.sketch.fill(0, 100, 100)
                    this.sketch.text(m.toString(), hDist, lastY + 60)
                } else if (m % 2n == 1n) {
                    m = 3n * m + 1n
                    hDist += j * 5 + 22
                    // blue means the previous number was odd
                    this.sketch.fill(240, 100, 100)
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
