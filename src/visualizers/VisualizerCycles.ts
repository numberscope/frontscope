import type p5 from 'p5'
import type {SequenceInterface} from '../sequences/SequenceInterface'
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
    displayCycleValues = false
    displayStartingValues = false
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
        displayCycleValues: {
            value: this.displayCycleValues,
            displayName: 'Overlay cycle values',
            required: false,
        },
        displayStartingValues: {
            value: this.displayStartingValues,
            displayName: 'Overlay starting values',
            required: false,
        },
        displayBoxLines: {
            value: this.displayBoxLines,
            displayName: 'Overlay Box Lines',
            required: false,
        },
    }
    private mouseOn = false

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
        if (
            (this.displayCycleValues = true)
            && (this.displayStartingValues = true)
        ) {
            status.isValid = true
            status.errors.push(
                'Cannot display Cycle and Starting Values at the same time'
            )
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
    collatzCycle(n: bigint): number {
        let steps = 0n
        if (n <= 1n) {
            steps = 1n
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
    jugglerCycle(m: bigint): number {
        // Juggler will NOT work well with bigints because we need to
        // take a square root of a bigint, currently don't have a good fix
        let steps = 0n
        // steps stop when the sequence reaches 1
        if (m <= 1n) {
            steps = 1n
        } else {
            while (m !== 1n) {
                if (m % 2n == 0n) {
                    m = this.bigIntSqrt(m)
                    steps++
                } else if (m % 2n !== 0n) {
                    // WARNING The function will fail after too many iterations
                    m = this.bigIntSqrt(m ** 3n)
                    steps++
                }
            }
        }
        // casting 'steps' to a number will not create
        // issues as 'steps' will always be very small
        return Number(steps)
    }

    getlength(n: number): number {
        return n.toString().length
    }

    setup() {}

    drawCycles(numberOfTerms: number, width: number, seq: SequenceInterface) {
        //Define the background canvas
        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.background(227, 100, 56)
        this.sketch.textSize(13)

        // Convert the input sequence to an array
        const workingSequence: BigInt[] = []
        const end = Math.min(seq.first + numberOfTerms - 1, seq.last)

        // maxCycle will be the largest number of steps that
        // any of the starting values takes to reach 1
        let maxCycle = 1

        // The user selects either collatz or juggler
        switch (this.cycleFormula) {
            //collatz
            case cycleFormula.Collatz:
                for (let i = seq.first; i <= end; i++) {
                    workingSequence.push(
                        BigInt(this.collatzCycle(seq.getElement(i)))
                    )
                }
                for (let i = 0; i < workingSequence.length; i++) {
                    if (this.collatzCycle(seq.getElement(i)) > maxCycle) {
                        maxCycle = this.collatzCycle(seq.getElement(i))
                    }
                }
                break
            //juggler
            case cycleFormula.Juggler:
                for (let i = seq.first; i <= end; i++) {
                    workingSequence.push(
                        BigInt(this.jugglerCycle(seq.getElement(i)))
                    )
                }
                for (let i = 0; i < workingSequence.length; i++) {
                    if (this.jugglerCycle(seq.getElement(i)) > maxCycle) {
                        maxCycle = this.jugglerCycle(seq.getElement(i))
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

            // Uncomment these lines for troubleshooting
            // this.sketch.text("scaler:" + scaler, 100, 100)
            // this.sketch.text("maxCycle" + maxCycle, 100, 120)
            // this.sketch.text(Number(this.bigIntSqrt(4907n)), 100, 120)

            // display collatz cycle colors
            if (this.cycleFormula === cycleFormula.Collatz) {
                this.sketch.fill(
                    this.collatzCycle(seq.getElement(i)) * scaler,
                    100,
                    100
                )
            }
            // display juggler cycle colors
            if (this.cycleFormula === cycleFormula.Juggler) {
                this.sketch.fill(
                    this.jugglerCycle(seq.getElement(i)) * scaler,
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

            if (this.displayCycleValues) {
                if (this.getlength(i) == 1) {
                    this.sketch.textSize(12)
                }
                if (this.getlength(i) == 2) {
                    this.sketch.textSize(11)
                }
                if (this.getlength(i) == 3) {
                    this.sketch.textSize(9)
                }
                if (this.getlength(i) >= 4) {
                    this.sketch.textSize(8)
                }
                if (
                    this.collatzCycle(seq.getElement(i))
                    > (5 * maxCycle) / 6
                ) {
                    this.sketch.fill(0, 0, 100)
                } else {
                    this.sketch.fill(0, 100, 0)
                }
                if (this.cycleFormula === cycleFormula.Collatz) {
                    this.sketch.text(
                        this.collatzCycle(seq.getElement(i)),
                        x,
                        y + 12
                    )
                }
                if (this.cycleFormula === cycleFormula.Juggler) {
                    this.sketch.text(
                        this.jugglerCycle(seq.getElement(i)),
                        x,
                        y + 12
                    )
                }
            }

            if (this.displayStartingValues) {
                if (
                    this.collatzCycle(seq.getElement(i))
                    > (5 * maxCycle) / 6
                ) {
                    this.sketch.fill(0, 0, 100)
                } else {
                    this.sketch.fill(0, 100, 0)
                }
                this.sketch.text(Number(seq.getElement(i)), x + 1, y + 12)
            }
        }
    }

    draw() {
        super.draw()

        this.drawCycles(this.numberOfTerms, this.width, this.seq)

        this.sketch.colorMode(this.sketch.HSB)

        //variables for mouseover function
        const x = this.sketch.mouseX
        const y = this.sketch.mouseY
        const squareWidth = 800 / this.width
        const indexOfSquareMouseOver =
            Math.floor(x / squareWidth)
            + this.width * Math.floor(y / squareWidth)

        //background for text
        this.sketch.fill(0, 0, 0)
        this.sketch.rect(0, 450, 700, 100)
        this.sketch.textSize(25)
        this.sketch.fill(100, 100, 100)

        this.sketch.fill(0, 0, 0)
        this.sketch.rect(0, 450, 700, 100)
        this.sketch.fill(100, 100, 100)

        let m = Number(this.seq.getElement(indexOfSquareMouseOver))
        this.sketch.text(m, 50, 500)
        for (let i = 1; i <= 6; i++) {
            if (m % 2 == 0) {
                m = m / 2
                this.sketch.fill(200, 100, 100)
                this.sketch.text(m, 100 + 60 * i, 500)
            } else if (m % 2 == 1) {
                m = 3 * m + 1
                this.sketch.fill(150, 100, 100)
                this.sketch.text(m, 100 + 60 * i, 500)
            }
        }
    }
}

export const exportModule = new VisualizerExportModule(
    'Cycles',
    VisualizerCycles,
    ''
)
