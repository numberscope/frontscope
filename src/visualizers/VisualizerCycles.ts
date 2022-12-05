import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import {VisualizerDefault} from './VisualizerDefault'

//Choices of sequence formula
enum cycleFormula {
    Collatz,
    Juggler,
}

class VisualizerCycles extends VisualizerDefault {
    name = 'Cycles'
    numberOfTerms = 1000
    width = 50
    cycleFormula = cycleFormula.Collatz
    displayBoxLines = false

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

    // Find the square root of a bigint
    bigIntSqrt(n: bigint): bigint {
        if (n < 0n) {
            console.error('error')
        }
        if (n < 2n) {
            return n
        }
        function newtonIteration(n: bigint, x0: bigint): bigint {
            const x1 = (n / x0 + x0) >> 1n
            if (x0 === x1 || x0 === x1 - 1n) {
                return x0
            }
            return newtonIteration(n, x1)
        }
        return newtonIteration(n, 1n)
    }

    //Find the number of steps 'n' takes to reach 1 under the collatz formula
    collatzStepsTo1(n: bigint): number {
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
    jugglerStepsTo1(m: bigint): number {
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
                m = this.bigIntSqrt(m)
                steps++
            } else if (m % 2n !== 0n) {
                // WARNING The function will fail after too many iterations
                // if m is odd, take the floor of it's square root cubed
                m = this.bigIntSqrt(m ** 3n)
                steps++
            }
        }
        // casting 'steps' to a number will not create
        // issues as 'steps' will always be very small
        return Number(steps)
    }

    getlength(n: number): number {
        return n.toString().length
    }

    setup() {
        console.log('Success')

        //assorted settings
        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.background(0, 0, 0)
        this.sketch.textSize(13)

        // Convert the input sequence to an array
        const workingSequence: bigint[] = []
        const end = Math.min(
            this.seq.first + this.numberOfTerms - 1,
            this.seq.last
        )

        // maxCycle will be the largest number of steps that
        // any of the starting values takes to reach 1
        let maxCycle = 1

        // The user selects either collatz or juggler
        switch (this.cycleFormula) {
            //collatz
            case cycleFormula.Collatz:
                for (let i = this.seq.first; i <= end; i++) {
                    workingSequence.push(
                        BigInt(this.collatzStepsTo1(this.seq.getElement(i)))
                    )
                }
                //Find the maxCycle under collatz
                for (let i = 0; i < workingSequence.length; i++) {
                    if (
                        this.collatzStepsTo1(this.seq.getElement(i))
                        > maxCycle
                    ) {
                        maxCycle = this.collatzStepsTo1(
                            this.seq.getElement(i)
                        )
                    }
                }
                break
            //juggler
            case cycleFormula.Juggler:
                for (let i = this.seq.first; i <= end; i++) {
                    workingSequence.push(
                        BigInt(this.jugglerStepsTo1(this.seq.getElement(i)))
                    )
                }
                //Find the maxCycle under juggler
                for (let i = 0; i < workingSequence.length; i++) {
                    if (
                        this.jugglerStepsTo1(this.seq.getElement(i))
                        > maxCycle
                    ) {
                        maxCycle = this.jugglerStepsTo1(
                            this.seq.getElement(i)
                        )
                    }
                }
                break
        }

        // scaler is used to convert the maxCycle to the dark blue
        // color while all the rest of the steps will take on a
        // color that is proportional to their cycle value
        const scaler = 255 / maxCycle

        for (let i = 0; i < this.numberOfTerms; i++) {
            const x = (800 / this.width) * (i % this.width)
            const y = (800 / this.width) * Math.floor(i / this.width)
            this.sketch.fill(100, 100, 0)

            // display collatz cycle colors
            if (this.cycleFormula === cycleFormula.Collatz) {
                this.sketch.fill(
                    this.collatzStepsTo1(this.seq.getElement(i)) * scaler,
                    100,
                    100
                )
            }
            // display juggler cycle colors
            if (this.cycleFormula === cycleFormula.Juggler) {
                this.sketch.fill(
                    this.jugglerStepsTo1(this.seq.getElement(i)) * scaler,
                    100,
                    100
                )
            }

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

        let m = Number(this.seq.getElement(indexOfSquareMouseOver))
        this.sketch.text('Starting value: ' + m, 15, lastY + 27)
        this.sketch.text(
            'Cycle value: ' + this.collatzStepsTo1(BigInt(m)),
            260,
            lastY + 27
        )
        this.sketch.text('Sequence:', 550, lastY + 27)

        //smaller background rect for sequence
        this.sketch.fill(225, 75, 100)
        this.sketch.rect(18, lastY + 40, 765, 30, 10)

        // text settings for the sequence list
        this.sketch.textStyle('bold')
        this.sketch.textSize(15)
        this.sketch.fill(0, 0, 0)
        this.sketch.text(m, 25, lastY + 60)

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
            if (m % 2 == 0) {
                m = m / 2
                hDist += j * 5 + 22
                // red means the previous number was even
                this.sketch.fill(0, 100, 100)
                this.sketch.text(m, hDist, lastY + 60)
            } else if (m % 2 == 1) {
                m = 3 * m + 1
                hDist += j * 5 + 22
                // blue means the previous number was odd
                this.sketch.fill(240, 100, 100)
                this.sketch.text(m, hDist, lastY + 60)
            }
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Cycles',
    VisualizerCycles,
    ''
)
