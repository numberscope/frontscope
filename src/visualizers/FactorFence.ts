import p5 from 'p5'
import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import {ParamType} from '../shared/ParamType'
import type {ParamValues} from '../shared/Paramable'
import {ValidationStatus} from '@/shared/ValidationStatus'

/** md
# Factor Fence Visualizer

[<img
  src="../../assets/img/FactorFence/ramanujan-tau.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/FactorFence/ramanujan-tau.png)

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
    /**
- labels: show text info 
     **/
    labels: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Show text info',
        required: true,
        description: 'If true, some text info appears onscreen',
        hideDescription: true,
    },

    /**
- signs: take into account signs 
     **/
    signs: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Take into account signs?',
        required: true,
        description: 'If true, negative terms display below axis',
        hideDescription: true,
    },
} as const

// vertical bar representing factor
interface bar {
    prime: bigint
    log: number
}

// data on which bars on screen
interface barsData {
    minBars: number
    maxBars: number
    numBars: number
}

class FactorFence extends P5Visualizer(paramDesc) {
    static category = 'FactorFence'
    static description = 'Show the factors of your sequence log-visually.'

    // mouse control
    private mousePrime = 0n
    private mouseOn = false // mouse on graph
    private mouseIndex = 0 // term mouse is hovering over

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

    // colour palette
    private palette = new factorPalette()

    // frame counter for timeout on loop()
    // first factorization failure
    private frame = 0
    private firstFailure = Number.POSITIVE_INFINITY

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

        return {
            minBars: minBars,
            maxBars: maxBars,
            numBars: numBars,
        }
    }

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        if (this.seq.last < this.terms) {
            this.terms = this.seq.last
        }

        return status
    }

    collectDataForScale(barsInfo: barsData) {
        // collect some info on the sequence in order to decide
        // how best to vertically scale the initial graph
        this.collectFailed = false
        const seqVals = Array.from(Array(barsInfo.numBars), (_, i) => {
            let elt = 1n
            try {
                elt = this.seq.getElement(i + barsInfo.minBars)
            } catch {
                this.collectFailed = true
            }
            let sig = 1n // sign of element
            if (elt < 0n && this.signs) {
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
        this.maxVal = Math.max(...seqVals)
        this.minVal = Math.min(...seqVals)

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

    storeFactors(barsInfo: barsData) {
        // put all factorizations into an array for easy access

        // track factorization progress in case backend is slow
        let firstFailure = barsInfo.maxBars

        // only try to store the factorizations of the bars that are showing,
        // and we have not previously done
        for (
            let myIndex = this.firstFailure;
            myIndex < barsInfo.maxBars;
            myIndex++
        ) {
            let facsRaw: bigint[][] = []
            try {
                facsRaw = this.seq.getFactors(myIndex) ?? []
            } catch {
                if (firstFailure > myIndex) firstFailure = myIndex
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
        return firstFailure
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
        this.firstFailure = this.first // set factoring needed pointer
        this.last = this.terms

        // warn the backend we plan to factor
        try {
            this.seq.getFactors(this.last)
            // we only wanted to send info to the backend,
            // we don't care what we get
            // eslint-disable-next-line  no-empty
        } catch {}
        // make an empty factoring array
        for (let myIndex = this.first; myIndex < this.last; myIndex++) {
            const factors: bar[] = []
            this.factorizations[myIndex] = factors
        }

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

        // initial scaling
        const barsInfo = this.barsShowing()
        this.collectDataForScale(barsInfo)
    }

    keyPresses() {
        // keyboard control for zoom, pan, stretch
        if (
            this.sketch.keyIsDown(this.sketch.UP_ARROW)
            || this.sketch.keyIsDown(this.sketch.DOWN_ARROW)
        ) {
            // zoom in UP
            // zoom out DOWN
            const keyScale = this.sketch.keyIsDown(this.sketch.UP_ARROW)
                ? 1.03
                : 0.97
            this.scaleFactor *= keyScale
            this.graphCorner.y = this.graphCorner.y / keyScale
        }
        if (this.sketch.keyIsDown(this.sketch.LEFT_ARROW)) {
            // pan left LEFT
            this.graphCorner.x -= 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)) {
            // pan right RIGHT
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
            this.heightScale += 1
        }
        if (this.sketch.keyIsDown(79)) {
            // contract down O
            this.heightScale -= 1
        }
    }

    draw() {
        // countdown to timeout when no key pressed
        // if key is pressing, do what it directs
        // there's a bug here that when the keyboard is
        // pressed in this window but
        // released in another window, keyIsPressed stays
        // positive and the sketch keeps computing,
        // e.g. if you tab away from the window
        if (this.sketch.keyIsPressed) {
            this.keyPresses()
        } else {
            ++this.frame
        }

        // clear the sketch
        this.sketch.clear(0, 0, 0, 0)
        this.sketch.background(this.palette.backgroundColor)

        // determine which terms will be on the screen so we only
        // bother with those
        // resets this.scaleFactor
        const barsInfo = this.barsShowing()

        // this scales the whole sketch
        // must compensate when using invariant sketch elements
        // like text
        this.sketch.scale(this.scaleFactor)

        this.mouseOn = false // flag mouse is not on graph by default

        // try again if need more terms from cache
        if (this.collectFailed) this.collectDataForScale(barsInfo)

        // set factoring needed pointer
        this.firstFailure = this.storeFactors(barsInfo)

        // loop through the terms of the seq and draw the bars for each
        for (
            let myIndex = barsInfo.minBars;
            myIndex < barsInfo.maxBars;
            myIndex++
        )
            // note that this also watches for mouseover as each bar
            // is drawn
            this.drawTerm(myIndex)

        // text at base of sketch, if not small canvas
        if (this.sketch.height > 400 && this.labels) this.bottomText()

        // stop drawing if no input from user
        if (this.frame > 3) this.sketch.noLoop()
    }

    drawTerm(myIndex: number) {
        // This function draws the full stacked bars for a single term
        // Input is index of the term

        // set colours
        let bottomColor = this.palette.gradientBar.bottom
        let topColor = this.palette.gradientBar.top

        // get sign of term
        let mySign = 1
        if (this.seq.getElement(myIndex) < 0 && this.signs) mySign = -1

        // get factors of term
        const factors = this.factorizations[myIndex]

        // we are drawing several bars
        // on top of each other,
        // so this height counter moves up as we go
        let cumulHt = 0

        for (const primeIsHigh of [true, false]) {
            // first we do this with primeIsHigh = true
            // (that means highlighted prime is at hand)
            // then with primeIsHigh = false
            // in this way the highlighted prime sits
            // at the bottom of the stack

            // loop through factor to draw for this term
            // from smaller to larger
            for (let facIndex = 0; facIndex < factors.length; facIndex++) {
                // get the next prime factor
                const factor = factors[facIndex]

                // Select the primes based on primeIsHigh flag
                // First time through the loop we only draw highlighted prime
                // Second time we draw everything else
                if (
                    (primeIsHigh && factor.prime == this.highlight)
                    || (!primeIsHigh && factor.prime != this.highlight)
                ) {
                    // height of rectangle is log of factor
                    // times scaling parameter
                    const recHeight = mySign * factor.log * this.heightScale

                    // set colour gradient for rectangle
                    let gradient = this.palette.gradientBar
                    if (primeIsHigh) {
                        gradient = this.palette.gradientHighlight
                    }
                    if (factor.prime == this.mousePrime) {
                        gradient = this.palette.gradientMouse
                    }
                    bottomColor = gradient.bottom
                    topColor = gradient.top

                    // determine where to put lower left corner
                    const barStart = this.graphCorner.copy()

                    // move over based on which term
                    const moveOver = this.recSpace.copy()
                    moveOver.mult(myIndex - this.first)

                    // move up based on cumulative height so far
                    const moveUp = this.sketch.createVector(0, -cumulHt)
                    barStart.add(moveOver)
                    barStart.add(moveUp)

                    // figure out upper right corner
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
                        this.mouseIndex = myIndex
                        this.mouseOn = true
                    }

                    // move upward in preparation for next bar
                    cumulHt += recHeight
                }
            }
        }
    }

    resetLoop() {
        this.frame = 0
        this.sketch.loop()
    }

    keyPressed() {
        this.resetLoop()
    }

    mouseMoved() {
        this.resetLoop()
    }

    mouseWheel(event: MouseEvent) {
        let scaleFac = 1
        if (event instanceof WheelEvent) {
            if (event.deltaY > 0) scaleFac = 1.03
            else scaleFac = 0.97
        }
        this.scaleFactor *= scaleFac
        this.graphCorner.y = this.graphCorner.y / scaleFac
        this.resetLoop()
    }

    // set highlight prime by click
    mouseClicked() {
        if (this.mouseOn) {
            this.highlight = this.mousePrime
        } else {
            this.highlight = 0n
        }
        this.refreshParams()
        this.resetLoop()
    }

    bottomText() {
        // text size and position
        this.sketch.textSize(this.textSize / this.scaleFactor)
        const textPosition = this.textCorner.copy()
        textPosition.mult(1 / this.scaleFactor)

        // spacing between lines
        const textIntervalVec = this.sketch.createVector(0, this.textInterval)
        textIntervalVec.mult(1 / this.scaleFactor)

        // always visible static text info, line by line
        const info = [
            'Click select; arrow keys to move; U/O stretch; Y/H raise/lower',
            'Highlighted prime: ' + this.highlight.toString(),
        ]

        // colours match graph colours
        const infoColors = [
            this.palette.gradientBar.bottom,
            this.palette.gradientHighlight.bottom,
        ]

        // display static info line by line
        for (let i = 0; i < info.length; i++) {
            this.sketch.fill(infoColors[i])
            this.sketch.text(info[i], textPosition.x, textPosition.y)
            textPosition.add(textIntervalVec)
        }

        // factorization text shown upon mouseover of graph
        if (this.mouseOn) {
            // parse out the factorization, categorizing
            // into primes (a) smaller than the highlighted one,
            // (b) highlighted one, and (c) bigger ones
            const factorizationPrimes = this.factorizations[
                this.mouseIndex
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

            // factorization info string, broken into pre/highlight/post
            const factorStringParts = [
                'S('
                    + this.mouseIndex.toString()
                    + ') = '
                    + this.seq.getElement(this.mouseIndex).toString()
                    + ' = '
                    + factorizationPrimesPre.toString()
                    // primes before highlighted prime
                    + `${factorizationPrimesPre.length > 0 ? ',' : ''}`,
                // highlighted prime
                factorizationPrimesMouse.toString(),
                // primes after highlighted prime
                `${factorizationPrimesPost.length > 0 ? ',' : ''}`
                    + factorizationPrimesPost.toString(),
            ]

            // colours for factorization
            const factorStringColors = [
                this.palette.gradientBar.bottom, // before highlighted
                this.palette.gradientMouse.bottom, // highlighted
                this.palette.gradientBar.bottom, // after highlighted
            ]

            // display mouseover info line, chunk by chunk
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

    // draw a gradient rectangle
    grad_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        colorTop: p5.Color,
        colorBottom: p5.Color
    ) {
        const barGradient = this.sketch.drawingContext.createLinearGradient(
            x,
            y,
            x,
            y - height
        )
        barGradient.addColorStop(0, colorTop)
        barGradient.addColorStop(1, colorBottom)
        this.sketch.drawingContext.fillStyle = barGradient
        this.sketch.rect(x, y - height, width, height)
    }
}

// bigint logarithm base 10
// would be good to put this in shared math later
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
