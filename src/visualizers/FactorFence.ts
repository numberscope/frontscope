import p5 from 'p5'
import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import {ParamType} from '../shared/ParamType'
import type {ParamValues} from '../shared/Paramable'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Factor Fence Visualizer

[<img
  src="../../assets/img/Turtle/turtle-waitforit.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Turtle/turtle-waitforit.png)

This visualizer shows the factorization of the terms of the sequence
as a sort of coloured graph.  At position n horizontally, there is a bar,
or fencepost, which is of height log(n) and broken into different pieces
of height log(p) for each prime divisor p (with multiplicity).
**/

// colour palette class
class factorPalette {
    gradientBar: {[key: string]: p5.Color} = {}
    gradientHighlight: {[key: string]: p5.Color} = {}
    gradientMouse: {[key: string]: p5.Color} = {}
    backgroundColor: p5.Color
    constructor(
        sketch: p5 | undefined = undefined,
        // bottom to top
        hexBar: string[] = ['#876BB8', '#C3B7DB'], // violet, dark bottom
        // orange, dark bottom
        hexHighlight: string[] = ['#EC7E2B', '#F5CD95'],
        hexMouse: string[] = ['#589C48', '#7BB662'], // green, dark bottom
        hexBack = '#EBEAF3' // light violet
    ) {
        if (sketch) {
            this.gradientBar = {
                bottom: sketch.color(hexBar[0]),
                top: sketch.color(hexBar[1]),
            }
            this.gradientHighlight = {
                bottom: sketch.color(hexHighlight[0]),
                top: sketch.color(hexHighlight[1]),
            }
            this.gradientMouse = {
                bottom: sketch.color(hexMouse[0]),
                top: sketch.color(hexMouse[1]),
            }
            this.backgroundColor = sketch.color(hexBack)
        } else {
            this.gradientBar = {
                bottom: INVALID_COLOR,
                top: INVALID_COLOR,
            }
            this.gradientHighlight = {
                bottom: INVALID_COLOR,
                top: INVALID_COLOR,
            }
            this.backgroundColor = INVALID_COLOR
        }
    }
}

/** md
## Parameters
**/

const paramDesc = {
    /**
- terms: the number of terms to factor and display; if entered value is
too high, will decrease to number of terms available.
     **/
    terms: {
        default: 100,
        type: ParamType.INTEGER,
        displayName: 'Number of terms',
        required: true,
        description: 'How many terms of the sequence should we show?',
        hideDescription: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n <= 0,
                'Number of terms must be positive.'
            ),
    },
    /**
- highlight: the prime factor to highlight 
     **/
    highlight: {
        default: 2,
        type: ParamType.BIGINT,
        displayName: 'Your favourite prime',
        required: true,
        description:
            'Which prime should we highlight?'
            + ' If you put 0 or a non-prime, we highlight none.',
        hideDescription: true,
    },
} as const

interface bar {
    prime: bigint
    log: number
}

class FactorFence extends P5Visualizer(paramDesc) {
    static category = 'FactorFence'
    static description = 'Show the factors of your sequence log-visually.'

    // mouse control
    private mousePrime = 0n
    private mouseOn = false

    // store factorizations
    private factorizations: bar[][] = []

    // scaling control
    private scaleFactor = 1.0 // zooming
    private first = 0 // first term
    private last = 0 // last term
    private heightScale = 55 // stretching

    // for vertical scaling, store max/min sequence vals displayed
    private maxVal = 1
    private minVal = 1

    // lower left corner of graph
    private graphCorner = new p5.Vector()
    // lower left corner of text
    private textCorner = new p5.Vector()

    // vector shift from one bar to the next
    private recSpace = new p5.Vector()
    private recWidth = 12 // horizontal shift

    // text control
    private textInterval = 0
    private textSize = 0

    // for issues of caching taking time
    private collectFailed = false
    private factorizationFailed = false

    // colour palette
    private palette = new factorPalette()

    barsShowing() {
        // determine which terms will be on the screen
        // in order to decide how to initialize the graph
        // and to be efficient in computing only the portion shown

        // minimum bar to compute
        // no less than first term
        const minBars = Math.max(
            Math.floor(
                this.first - Math.min(0, this.graphCorner.x / this.recSpace.x)
            ) - 1,
            this.first
        )

        // number of bars on screen
        // two extra to slightly bleed over edge
        const numBars = Math.floor(
            Math.min(
                this.sketch.width / this.scaleFactor / this.recSpace.x + 2,
                this.last - minBars
            )
        )

        // maximum bar to compute
        const maxBars = minBars + numBars

        //console.log('bars', this.first, this.last, minBars, maxBars, numBars)
        return {
            minBars: minBars,
            maxBars: maxBars,
            numBars: numBars,
        }
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (this.seq.last < this.terms) {
            //console.log('this.seq.last', this.seq.last)
            this.terms = this.seq.last
        }

        return status
    }

    collectDataForScale() {
        // collect some info on the sequence in order to decide
        // how best to vertically scale the initial graph
        this.collectFailed = false
        const barsInfo = this.barsShowing()
        const seqVals = Array.from(Array(barsInfo.numBars), (_, i) => {
            let elt = 1n
            try {
                elt = this.seq.getElement(i + barsInfo.minBars)
            } catch (CacheError) {
                this.collectFailed = true
            }
            let sig = 1n // sign of element
            if (elt < 0n) {
                sig = -1n
            }
            // can I simplify this??
            if (elt * sig < 1n) {
                // in case elt = 0, store 1
                elt = sig
            }
            // store height of bar (log) but with sign info
            return BigLog(elt * sig) * Number(sig)
        })
        //console.log(seqVals)
        this.maxVal = Math.max(...seqVals)
        this.minVal = Math.min(...seqVals)
        //
        // we compute the graphHeight to scale graph to fit
        let heightMax =
            Math.sign(this.maxVal) * Math.max(2, Math.abs(this.maxVal))
        let heightMin =
            Math.sign(this.minVal) * Math.max(2, Math.abs(this.minVal))
        heightMax = Math.max(heightMax, 0)
        heightMin = Math.min(heightMin, 0)

        // scale according to total graph height
        const graphHeight = Math.abs(heightMax - heightMin)
        if (graphHeight != 0) {
            this.heightScale = (0.4 * this.sketch.height) / graphHeight
        } else {
            // should occur only for constant 0 seq
            this.heightScale = 0.4 * this.sketch.height
        }
        // adjust the x-axis upward to make room
        this.graphCorner.y = this.graphCorner.y + heightMin * this.heightScale
    }

    storeFactors() {
        // put all factorizations into an array for easy access
        this.factorizations = []
        this.factorizationFailed = false
        for (let myIndex = this.first; myIndex < this.last; myIndex++) {
            let facsRaw: bigint[][] = []
            try {
                facsRaw = this.seq.getFactors(myIndex) ?? []
            } catch (CacheError) {
                this.factorizationFailed = true
            }

            // change the factors into just a list of factors with repeats
            // suitable for looping through to make the bars
            // format: [prime, log(prime)]
            const factors: bar[] = []
            if (facsRaw) {
                for (const [base, power] of facsRaw) {
                    if (base != -1n && base != 0n) {
                        for (let i = 0; i < power; i++) {
                            const logPrime = BigLog(base)
                            const thisBar = {prime: base, log: logPrime}
                            factors.push(thisBar)
                        }
                    }
                }
            }
            this.factorizations[myIndex] = factors
        }
    }

    setup() {
        super.setup()

        this.refreshParams()

        this.palette = new factorPalette(this.sketch)

        // must be set so barsShowing() works; begin with no zoom
        this.scaleFactor = 1
        // horiz rectangle spacing vector
        this.recSpace = this.sketch.createVector(this.recWidth + 2, 0)
        // lower left graph corner as proportion of space avail
        this.graphCorner = this.sketch.createVector(
            this.sketch.width * 0.05,
            this.sketch.height * 0.75
        )

        // set up terms first and last
        this.first = this.seq.first
        this.last = this.terms

        // text formatting

        // upper left text corner
        this.textCorner = this.sketch.createVector(
            this.sketch.width * 0.05,
            this.sketch.height * 0.8
        )
        // vertical text spacing
        this.textInterval = this.sketch.height * 0.027
        this.textSize = this.sketch.height * 0.023

        this.sketch.textFont('Courier New')
        this.sketch.textStyle(this.sketch.NORMAL)

        // no stroke (rectangles without borders)
        this.sketch.strokeWeight(0)
        this.sketch.frameRate(30)

        this.collectDataForScale()

        this.storeFactors()
    }

    draw() {
        // try again if need more terms from cache
        if (this.factorizationFailed || this.collectFailed) {
            this.collectDataForScale()
            this.storeFactors()
        }

        // keyboard control for zoom, pan, stretch
        if (this.sketch.keyIsDown(73)) {
            // zoom in I
            this.scaleFactor *= 1.03
            this.graphCorner.y = this.graphCorner.y / 1.03
        }
        if (this.sketch.keyIsDown(75)) {
            // zoom out K
            this.scaleFactor *= 0.97
            this.graphCorner.y = this.graphCorner.y / 0.97
        }
        if (this.sketch.keyIsDown(74)) {
            // pan left J
            this.graphCorner.x -= 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(76)) {
            // pan right L
            this.graphCorner.x += 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(89)) {
            // pan up Y
            this.graphCorner.y -= 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(72)) {
            // pan down H
            this.graphCorner.y += 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(85)) {
            // stretch up U
            this.heightScale += 5
        }
        if (this.sketch.keyIsDown(79)) {
            // contract down O
            this.heightScale -= 5
        }

        this.sketch.clear(0, 0, 0, 0)
        this.sketch.background(this.palette.backgroundColor)

        // this scales the whole sketch
        // must compensate when using invariant sketch elements
        this.sketch.scale(this.scaleFactor)

        this.mouseOn = false // flag whether mouse is over the graph or not
        let mouseIndex = 0 // the term the mouse is hovering over

        let bottomColor = this.palette.gradientBar.bottom
        let topColor = this.palette.gradientBar.top

        // determine which terms will be on the screen so we only graph those
        const barsInfo = this.barsShowing()

        // loop through the terms of the seq
        for (
            let myIndex = barsInfo.minBars;
            myIndex < barsInfo.maxBars;
            myIndex++
        ) {
            let mySign = 1
            if (this.seq.getElement(myIndex) < 0) {
                mySign = -1
            }
            const factors = this.factorizations[myIndex] // get factors
            let cumulHt = 0 // how much of the bar we've drawn so far

            // primeType = 0 means the highlighted one (draw first)
            // primeType = 1 means the rest of the primes
            for (let primeType = 0; primeType < 2; primeType++) {
                // loop through bars to draw for term
                for (
                    let facIndex = 0;
                    facIndex < factors.length;
                    facIndex++
                ) {
                    const factor = factors[facIndex]

                    // Select the primes based on primeType
                    if (
                        (primeType == 0 && factor.prime == this.highlight)
                        || (primeType == 1 && factor.prime != this.highlight)
                    ) {
                        // height of rectangle is log of factor
                        // times scaling parameter
                        const recHeight =
                            mySign * factor.log * this.heightScale

                        // set colour gradient for rectangle
                        let gradient = this.palette.gradientBar
                        if (primeType == 0) {
                            gradient = this.palette.gradientHighlight
                        }
                        if (factor.prime == this.mousePrime) {
                            gradient = this.palette.gradientMouse
                        }
                        bottomColor = gradient.bottom
                        topColor = gradient.top

                        // determine where to put the rectangle
                        const barStart = this.graphCorner.copy()
                        const moveOver = this.recSpace.copy()
                        moveOver.mult(myIndex - this.first)
                        const moveUp = this.sketch.createVector(0, -cumulHt)
                        barStart.add(moveOver)
                        barStart.add(moveUp)
                        const barDiag = this.sketch.createVector(
                            this.recWidth,
                            recHeight
                        )
                        // draw the rectangle
                        this.grad_rect(
                            barStart.x,
                            barStart.y,
                            barDiag.x,
                            barDiag.y,
                            topColor,
                            bottomColor
                        )

                        // if the mouse is over the rectangle being drawn
                        // then we make note of the prime factor
                        // and term we are hovering over
                        const testVec = this.sketch.createVector(
                            this.sketch.mouseX,
                            this.sketch.mouseY
                        )
                        testVec.mult(1 / this.scaleFactor).sub(barStart)
                        testVec.y = testVec.y * mySign
                        const barDiagAbs = barDiag.copy()
                        barDiagAbs.y = -barDiagAbs.y * mySign
                        if (
                            testVec.x >= 0
                            && testVec.x <= barDiagAbs.x
                            && testVec.y <= 0
                            && testVec.y >= barDiagAbs.y
                        ) {
                            this.mousePrime = factor.prime
                            mouseIndex = myIndex
                            this.mouseOn = true
                        }

                        // bookkeeping
                        cumulHt += recHeight
                    }
                }
            }
        }

        // text at base of sketch, if not small canvas
        if (this.sketch.height > 400) {
            this.sketch.textSize(this.textSize / this.scaleFactor)
            const textPosition = this.textCorner.copy()
            textPosition.mult(1 / this.scaleFactor)
            const textIntervalVec = this.sketch.createVector(
                0,
                this.textInterval
            )
            textIntervalVec.mult(1 / this.scaleFactor)
            const info = [
                'Click select; J/L pan; I/K zoom; U/O stretch; Y/H raise/lower',
                'Highlighted prime: ' + this.highlight.toString(),
            ]
            const infoColors = [
                this.palette.gradientBar.bottom,
                this.palette.gradientHighlight.bottom,
            ]
            for (let i = 0; i < info.length; i++) {
                this.sketch.fill(infoColors[i])
                this.sketch.text(info[i], textPosition.x, textPosition.y)
                textPosition.add(textIntervalVec)
            }
            if (this.mouseOn) {
                const factorizationPrimes = this.factorizations[
                    mouseIndex
                ].map(factor => factor.prime)
                const factorizationPrimesPre = factorizationPrimes.filter(
                    factor => factor < this.mousePrime
                )
                const factorizationPrimesMouse = factorizationPrimes.filter(
                    factor => factor == this.mousePrime
                )
                const factorizationPrimesPost = factorizationPrimes.filter(
                    factor => factor > this.mousePrime
                )
                const factorStringParts = [
                    'S('
                        + mouseIndex.toString()
                        + ') = '
                        + this.seq.getElement(mouseIndex).toString()
                        + ' = '
                        + factorizationPrimesPre.toString()
                        + `${factorizationPrimesPre.length > 0 ? ',' : ''}`,
                    factorizationPrimesMouse.toString(),
                    `${factorizationPrimesPost.length > 0 ? ',' : ''}`
                        + factorizationPrimesPost.toString(),
                ]
                const factorStringColors = [
                    this.palette.gradientBar.bottom,
                    this.palette.gradientMouse.bottom,
                    this.palette.gradientBar.bottom,
                ]
                for (let i = 0; i < factorStringParts.length; i++) {
                    this.sketch.fill(factorStringColors[i])
                    this.sketch.text(
                        factorStringParts[i],
                        textPosition.x,
                        textPosition.y
                    )
                    textPosition.add(
                        this.sketch.createVector(
                            this.sketch.textWidth(factorStringParts[i]),
                            0
                        )
                    )
                }
            } else {
                // make sure mouseover disappears when not on graph
                this.mousePrime = 0n
            }
        }
    }

    //    mouseClicked() {
    //        // currently this function doesn't work
    //        // but it is ready to go when issue #120 is resolved
    //        if (this.mouseOn) {
    //            this.highlight = this.mousePrime
    //        } else {
    //            this.highlight = 0n
    //        }
    //    }

    grad_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        color1: p5.Color,
        color2: p5.Color
    ) {
        const barGradient = this.sketch.drawingContext.createLinearGradient(
            x,
            y,
            x,
            y - height
        )
        barGradient.addColorStop(0, color1)
        barGradient.addColorStop(1, color2)
        this.sketch.drawingContext.fillStyle = barGradient
        this.sketch.rect(x, y - height, width, height)
    }
}

// bigint logarithm base 10
// from https://stackoverflow.com/questions/70382306/logarithm-of-a-bigint
function BigLog10(n: bigint) {
    if (n < 0) return NaN
    const s = n.toString(10)
    return s.length + Math.log10(Number('0.' + s.substring(0, 15)))
}
function BigLog(n: bigint) {
    return BigLog10(n) / Math.log10(Math.E)
}

export const exportModule = new VisualizerExportModule(FactorFence)
