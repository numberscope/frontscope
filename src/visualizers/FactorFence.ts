import p5 from 'p5'
import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'
import {ParamType} from '../shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'
import {modulo} from '../shared/math'

/** md
# Factor Fence Visualizer

[<img
  src="../../assets/img/FactorFence/naturals.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/FactorFence/naturals.png)

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
- highlight: the prime factor to highlight 
     **/
    highlight: {
        default: 1,
        type: ParamType.BIGINT,
        displayName: 'Your favourite number',
        required: true,
        description:
            'We highlight primes dividing this number.'
            + ' To highlight none, put 1.',
        hideDescription: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n <= 0,
                'Your favourite number must be positive.'
            ),
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
        displayName: 'Take into account signs',
        required: true,
        description: 'If true, negative terms display below axis',
        hideDescription: true,
    },
} as const

// vertical bar representing factor
interface Bar {
    prime: bigint
    log: number
}

// data on which bars on screen
interface BarsData {
    minBars: number
    maxBars: number
    numBars: number
}

// "Natural" width of the factor bars:
const recWidth = 12
// Shift from one bar to the next:
const recSpace = new p5.Vector(recWidth + 2, 0)

class FactorFence extends P5Visualizer(paramDesc) {
    static category = 'FactorFence'
    static description = 'Show the factors of your sequence log-visually.'

    // mouse control
    private mousePrime = 1n
    private mouseIndex = NaN // term mouse is hovering over

    // store factorizations
    private factorizations: Bar[][] = []

    // scaling control
    private scaleFactor = 1.0 // zooming
    private initialLimitTerms = 10000 // initial max number of terms
    private availableTerms = 0 // max number of terms available
    private seqTerms = 0 // total number of terms we are using
    private first = 0 // first term
    private last = 0 // last term
    private heightScale = 55 // stretching

    // for vertical scaling, store max/min sequence vals displayed
    private maxVal = 1
    private minVal = 1

    // lower left corner of graph
    private graphCorner = new p5.Vector()
    // left margin of text
    private textLeft = 0
    // lowest extent of any bar
    private lowestBar = 0

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

    barsShowing(size: ViewSize): BarsData {
        // determine which terms will be on the screen
        // in order to decide how to initialize the graph
        // and to be efficient in computing only the portion shown

        // minimum bar to compute
        // no less than first term
        const minBars = Math.max(
            Math.floor(
                this.first - Math.min(0, this.graphCorner.x / recSpace.x)
            ) - 1,
            this.first
        )

        // number of bars on screen
        // two extra to slightly bleed over edge
        const numBars = Math.floor(
            Math.min(
                size.width / this.scaleFactor / recSpace.x + 2,
                this.last - minBars + 1
            )
        )

        // maximum bar to compute
        const maxBars = minBars + numBars - 1

        return {minBars, maxBars, numBars}
    }

    collectDataForScale(barsInfo: BarsData, size: ViewSize) {
        // collect some info on the sequence in order to decide
        // how best to vertically scale the initial graph
        this.collectFailed = false
        const seqVals = Array.from(Array(barsInfo.numBars), (_, i) => {
            let elt = 1n
            try {
                elt = this.seq.getElement(i + barsInfo.minBars)
            } catch {
                this.collectFailed = true
                return 0
            }
            let sig = 1n // sign of element
            if (elt < 0n && this.signs) sig = -1n
            if (elt < 0n && !this.signs) elt = -1n * elt
            // in case elt = 0, store 1
            if (elt == 0n) elt = 1n

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
            this.heightScale = (0.4 * size.height) / graphHeight
        } else {
            // should occur only for constant 0 seq
            this.heightScale = 0.4 * size.height
        }
        // adjust the x-axis upward to make room
        this.graphCorner.y = this.graphCorner.y + heightMin * this.heightScale
    }

    storeFactors(barsInfo: BarsData) {
        // put all factorizations into an array for easy access

        // track factorization progress in case backend is slow
        let firstFailure = barsInfo.maxBars

        // only try to store the factorizations of the bars that are showing,
        // and we have not previously done
        for (
            let myIndex = this.firstFailure;
            myIndex <= barsInfo.maxBars;
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
            const factors: Bar[] = []
            if (facsRaw) {
                for (const [base, power] of facsRaw) {
                    if (base != -1n && base != 0n) {
                        const thisBar = {prime: base, log: BigLog(base)}
                        for (let i = 0; i < power; i++) {
                            factors.push(thisBar)
                        }
                    }
                }
            }
            this.factorizations[myIndex] = factors
        }
        return firstFailure
    }

    // put the view in a good starting state:
    async standardizeView(size: ViewSize) {
        this.scaleFactor = 1
        // lower left graph corner as proportion of space avail
        this.graphCorner = new p5.Vector(
            size.width * 0.05,
            size.height * 0.75
        )
        // Text sizing:
        // left margin of text
        this.textLeft = size.width * 0.05
        // vertical text spacing
        this.textInterval = size.height * 0.027
        this.textSize = size.height * 0.023

        // initial scaling
        const barsInfo = this.barsShowing(size)
        this.collectDataForScale(barsInfo, size)
    }

    async presketch(size: ViewSize) {
        await super.presketch(size)

        // begin by limiting to 10000 terms
        this.availableTerms = this.seq.last - this.seq.first + 1
        this.seqTerms = this.availableTerms
        if (this.seqTerms > this.initialLimitTerms) {
            this.seqTerms = this.initialLimitTerms
        }

        // set up terms first and last
        this.first = this.seq.first
        this.firstFailure = this.first // set factoring needed pointer
        this.last = this.seq.first + this.seqTerms - 1

        // Warn the backend we plan to factor: (Note we don't await because
        // we don't actually use the factors until later.)
        this.seq.fill(this.last)

        await this.standardizeView(size)
    }

    setup() {
        super.setup()

        this.palette = new factorPalette(this.sketch)
        // text formatting
        this.sketch.textFont('Courier New')
        this.sketch.textStyle(this.sketch.NORMAL)

        // no stroke (rectangles without borders)
        this.sketch.strokeWeight(0)
        this.sketch.frameRate(30)

        // Extend factoring array as needed
        for (let myIndex = this.first; myIndex < this.last; myIndex++) {
            if (myIndex in this.factorizations) continue
            const factors: Bar[] = []
            this.factorizations[myIndex] = factors
        }
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
        if (this.sketch.keyIsDown(73)) {
            // pan up I
            this.graphCorner.y -= 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(75)) {
            // pan down K
            this.graphCorner.y += 10 / this.scaleFactor
        }
        if (this.sketch.keyIsDown(85)) {
            // stretch up U
            this.heightScale *= 1.03
        }
        if (this.sketch.keyIsDown(79)) {
            // contract down O
            this.heightScale *= 0.97
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
        const barsInfo = this.barsShowing({
            width: this.sketch.width,
            height: this.sketch.height,
        })

        // If we are getting close to the hidden max terms, raise it
        if (
            3 * barsInfo.maxBars > this.seqTerms
            && this.seqTerms < this.availableTerms
        ) {
            this.seqTerms = Math.min(
                this.availableTerms,
                3 * barsInfo.maxBars
            )
            this.last = this.seq.first + this.seqTerms - 1
            this.seq.fill(this.last)
            this.collectFailed = true // trigger recollect
        }

        // this scales the whole sketch
        // must compensate when using invariant sketch elements
        // like text
        this.sketch.scale(this.scaleFactor)

        // try again if need more terms from cache
        if (this.collectFailed) {
            this.collectDataForScale(barsInfo, {
                width: this.sketch.width,
                height: this.sketch.height,
            })
        }

        // set factoring needed pointer
        this.firstFailure = this.storeFactors(barsInfo)
        this.lowestBar = 0

        this.mouseIndex = NaN
        // Determine what the mouse is over, if anything:
        const {mouseX, mouseY} = this.sketch
        if (
            mouseX >= 0
            && mouseX < this.sketch.width
            && mouseY >= 0
            && mouseY <= this.sketch.height
        ) {
            const horiz = mouseX / this.scaleFactor - this.graphCorner.x
            if (horiz % recSpace.x < recWidth) {
                const rawIndex = Math.floor(horiz / recSpace.x) + this.first
                if (
                    rawIndex >= barsInfo.minBars
                    && rawIndex <= barsInfo.maxBars
                ) {
                    this.mouseIndex = rawIndex
                    // draw that bar first to find the prime, if any:
                    this.mousePrime = 1n
                    this.drawTerm(rawIndex, 'extract prime')
                }
            }
        }
        // loop through the terms of the seq and draw the bars for each
        for (
            let myIndex = barsInfo.minBars;
            myIndex <= barsInfo.maxBars;
            myIndex++
        ) {
            // Note the drawTerm function also updates this.lowestBar
            this.drawTerm(myIndex)
        }

        // text at base of sketch, if not small canvas
        if (this.sketch.height > 400 && this.labels) this.bottomText()

        // stop drawing if no input from user and not waiting on elements
        // or factorizations
        if (
            this.frame > 3
            && !this.collectFailed
            && this.firstFailure >= barsInfo.maxBars
        ) {
            this.sketch.noLoop()
        }
    }

    drawTerm(myIndex: number, extractPrime?: string) {
        // This function draws the full stacked bars for a single term
        // Input is index of the term
        const myTerm = this.seq.getElement(myIndex)

        // set colours
        let bottomColor = this.palette.gradientBar.bottom
        let topColor = this.palette.gradientBar.top

        // get sign of term
        let mySign = 1
        if (myTerm < 0 && this.signs) mySign = -1

        // get factors of term
        const factors = this.factorizations[myIndex]

        // determine where to put lower left corner of graph
        const barStart = this.graphCorner.copy()
        // for negative terms, bar should extend below "empty" axis
        if (mySign < 0 || myTerm == 0n) barStart.add(new p5.Vector(0, 1))

        // move over based on which term
        const moveOver = recSpace.copy()
        moveOver.mult(myIndex - this.first)
        barStart.add(moveOver)

        // Now draw the bars:
        // special cases with no factors
        if (factors.length == 0) {
            if (this.isTrivial(myTerm)) {
                // draw a one pixel high placeholder bar for 0/1/-1
                this.grad_rect(
                    barStart.x,
                    barStart.y,
                    recWidth,
                    mySign,
                    this.palette.gradientBar.top,
                    this.palette.gradientBar.bottom,
                    false
                )
                // in case no bars on screen, lowestBar must be set somewhere
                this.lowestBar = Math.max(this.lowestBar, barStart.y)
            } else {
                // draw an empty bar for unknown factorizations

                // height of rectangle is log of term
                // times scaling parameter
                const recHeight =
                    mySign
                    * (myTerm < 0 ? BigLog(-myTerm) : BigLog(myTerm))
                    * this.heightScale

                // draw the rectangle
                const emptyColor = this.palette.gradientBar.top
                this.grad_rect(
                    barStart.x,
                    barStart.y,
                    recWidth,
                    recHeight,
                    emptyColor,
                    emptyColor,
                    false
                )
                this.lowestBar = Math.max(
                    barStart.y,
                    barStart.y - recHeight,
                    this.lowestBar
                )
            }
            return
        }

        // The "usual" case: draw a stack of bars

        for (const primeIsHigh of [true, false]) {
            // first we do this with primeIsHigh = true
            // (that means a highlighted prime is at hand)
            // then with primeIsHigh = false
            // in this way the highlighted primes sit
            // at the bottom of the stack

            // But if we are not highlighting anything, don't bother checking
            // all the primes.
            if (primeIsHigh && this.highlight < 2n) continue

            // loop through factor to draw for this term
            // from smaller to larger
            for (const factor of factors) {
                // Select the primes based on primeIsHigh flag
                // First time through the loop we only draw highlighted primes
                // Second time we draw everything else
                if (
                    (primeIsHigh
                        && Number(modulo(this.highlight, factor.prime)) === 0)
                    || (!primeIsHigh
                        && Number(modulo(this.highlight, factor.prime)) !== 0)
                ) {
                    // height of rectangle is log of factor
                    // times scaling parameter
                    const recHeight = mySign * factor.log * this.heightScale

                    // check where mouse is
                    if (extractPrime) {
                        this.mousePrimeSet(
                            recHeight,
                            barStart,
                            mySign,
                            factor.prime
                        )
                    }

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

                    // draw the rectangle
                    this.grad_rect(
                        barStart.x,
                        barStart.y,
                        recWidth,
                        recHeight,
                        topColor,
                        bottomColor,
                        false
                    )
                    this.lowestBar = Math.max(
                        barStart.y,
                        barStart.y - recHeight,
                        this.lowestBar
                    )

                    // move up in preparation for next bar
                    barStart.y -= recHeight
                }
            }
        }
    }

    mousePrimeSet(
        barHeight: number,
        barStart: p5.Vector,
        mySign: number,
        prime: bigint
    ) {
        // if the mouse is over the rectangle being drawn
        // then we make note of the prime factor
        // and term we are hovering over
        const mouseV =
            mySign * (this.sketch.mouseY / this.scaleFactor - barStart.y)
        const barLimit = -barHeight * mySign
        if (mouseV <= 0 && mouseV >= barLimit) this.mousePrime = prime
    }

    resetLoop() {
        this.frame = 0
        this.sketch.loop()
    }

    async resized(toSize: ViewSize) {
        await this.standardizeView(toSize)
        return false // Let the framework handle the redisplay
    }

    keyPressed() {
        this.resetLoop()
    }

    mouseMoved() {
        this.resetLoop()
    }

    mouseWheel(event: WheelEvent) {
        let scaleFac = 1
        if (event.deltaY > 0) scaleFac = 1.03
        else scaleFac = 0.97
        this.scaleFactor *= scaleFac
        this.graphCorner.y = this.graphCorner.y / scaleFac
        this.resetLoop()
    }

    // set highlight prime by click
    mouseClicked() {
        this.highlight = this.mousePrime
        this.refreshParams()
        this.resetLoop()
    }

    isTrivial(term: bigint) {
        if (term == 0n || term == 1n || term == -1n) return true
        return false
    }

    textCareful(
        text: string,
        textLeft: number,
        textBottom: number,
        showDigits: boolean
    ) {
        if (textLeft * this.scaleFactor > this.sketch.width) return
        const overflow =
            this.sketch.textWidth(text) * this.scaleFactor
            - this.sketch.width
            + textLeft * this.scaleFactor
        if (overflow > 0) {
            let surplusCharacters =
                Math.ceil(
                    overflow / this.scaleFactor / this.sketch.textWidth('1')
                ) + 3
            let digitCount = 0
            if (showDigits) {
                const textNoSign = text
                textNoSign.replace('-', '')
                digitCount = textNoSign.length
                const digitCountDigitCount = digitCount.toString().length
                surplusCharacters += digitCountDigitCount + 9 // space for dig's
            }
            let newText =
                text.substring(0, text.length - surplusCharacters) + '...'
            if (showDigits)
                newText += '[' + digitCount.toString() + ' digits]'
            this.sketch.text(newText, textLeft, textBottom)
        } else {
            this.sketch.text(text, textLeft, textBottom)
        }
    }

    bottomText() {
        // text size and position
        this.sketch.textSize(this.textSize / this.scaleFactor)
        this.sketch.strokeWeight(0) // no outline
        let textLeft = this.textLeft / this.scaleFactor

        // spacing between lines
        const lineHeight = this.textInterval / this.scaleFactor

        let textBottom = Math.min(
            this.lowestBar + 2 * lineHeight,
            this.sketch.height / this.scaleFactor - 4 * lineHeight
        )

        // colours match graph colours
        const infoColors = [
            this.palette.gradientMouse.bottom,
            this.palette.gradientHighlight.bottom,
        ]

        // always visible static text info, line by line
        // boolean represents whether to line break
        const info = [
            {text: 'Click select; ', color: infoColors[0], linebreak: false},
            {
                text: 'arrow keys to move',
                color:
                    this.sketch.keyIsDown(this.sketch.UP_ARROW)
                    || this.sketch.keyIsDown(this.sketch.DOWN_ARROW)
                    || this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)
                    || this.sketch.keyIsDown(this.sketch.LEFT_ARROW)
                        ? infoColors[1]
                        : infoColors[0],
                linebreak: false,
            },
            {text: '; ', color: infoColors[0], linebreak: false},
            {
                text: 'U/O stretch',
                color:
                    this.sketch.keyIsDown(85) || this.sketch.keyIsDown(79)
                        ? infoColors[1]
                        : infoColors[0],
                linebreak: false,
            },
            {text: '; ', color: infoColors[0], linebreak: false},
            {
                text: 'I/K raise/lower',
                color:
                    this.sketch.keyIsDown(73) || this.sketch.keyIsDown(75)
                        ? infoColors[1]
                        : infoColors[0],
                linebreak: true,
            },
            {
                text:
                    'Highlighting (and sinking to bottom of bars)'
                    + 'all prime factors of '
                    + this.highlight.toString(),
                color: infoColors[1],
                linebreak: true,
            },
        ]

        // display mouse invariant info
        for (const item of info) {
            this.sketch.fill(item.color)
            this.sketch.text(item.text, textLeft, textBottom)
            textLeft += this.sketch.textWidth(item.text)
            if (item.linebreak) {
                textBottom += lineHeight
                textLeft = this.textLeft / this.scaleFactor
            }
        }

        // factorization text shown upon mouseover of graph
        const mIndex = this.mouseIndex
        if (!isNaN(mIndex)) {
            const factorizationPrimesRaw = this.factorizations[mIndex].map(
                factor => factor.prime
            )
            // move the highlighted primes first
            const highlightedPrimes = factorizationPrimesRaw.filter(
                prime => Number(modulo(this.highlight, prime)) === 0
            )
            const otherPrimes = factorizationPrimesRaw.filter(
                prime => Number(modulo(this.highlight, prime)) !== 0
            )
            const factorizationPrimes = [...highlightedPrimes, ...otherPrimes]

            // term and sign
            const mTerm = this.seq.getElement(mIndex)
            let mSign = 1n
            if (mTerm < 0n) mSign = -1n

            // display mouseover info line
            const infoLineFunction = `a(${mIndex})`
            const infoLineStart = `${infoLineFunction} = `
            this.sketch.fill(infoColors[0])
            this.textCareful(infoLineStart, textLeft, textBottom, false)
            textLeft += this.sketch.textWidth(infoLineStart)
            this.textCareful(mTerm.toString(), textLeft, textBottom, true)
            textBottom += lineHeight

            if (!this.isTrivial(mTerm)) {
                const infoLineContinue = ' = '
                textLeft = this.textLeft / this.scaleFactor
                textLeft += this.sketch.textWidth(infoLineFunction)
                this.sketch.text(infoLineContinue, textLeft, textBottom)
                textLeft += this.sketch.textWidth(infoLineContinue) + 1

                if (factorizationPrimes.length == 0 && mTerm * mSign < 2n) {
                    const eltString = mTerm.toString() + ' '
                    this.sketch.text(eltString, textLeft, textBottom)
                    textLeft += this.sketch.textWidth(eltString) + 1
                }
                if (mSign < 0n && factorizationPrimes.length > 0) {
                    this.sketch.text('-', textLeft, textBottom)
                    textLeft += this.sketch.textWidth('-') + 1
                }
                let first = true
                for (const prime of factorizationPrimes) {
                    if (!first) {
                        this.sketch.fill(infoColors[0])
                        this.textCareful('×', textLeft, textBottom, false)
                        textLeft += this.sketch.textWidth('×') + 1
                    }

                    this.sketch.fill(
                        prime == this.mousePrime
                            ? this.palette.gradientMouse.bottom
                            : Number(modulo(this.highlight, prime)) === 0
                              ? this.palette.gradientHighlight.bottom
                              : this.palette.gradientBar.bottom
                    )
                    this.textCareful(
                        prime.toString(),
                        textLeft,
                        textBottom,
                        false
                    )
                    textLeft += this.sketch.textWidth(prime.toString()) + 1
                    first = false
                }
                if (factorizationPrimes.length == 0 && mTerm * mSign >= 2n) {
                    this.sketch.text(
                        '(factorization unknown)',
                        textLeft,
                        textBottom
                    )
                }
            }
        }
    }

    // draw a gradient rectangle
    grad_rect(
        x: number,
        y: number,
        width: number,
        height: number,
        colorTop: p5.Color,
        colorBottom: p5.Color,
        edge: boolean
    ) {
        const barGradient = this.sketch.drawingContext.createLinearGradient(
            x,
            y,
            x,
            y - height
        )
        barGradient.addColorStop(0, colorTop)
        barGradient.addColorStop(1, colorBottom)
        const fillStyle = this.sketch.drawingContext.fillStyle
        this.sketch.drawingContext.fillStyle = barGradient
        if (edge) {
            this.sketch.strokeWeight(1)
            this.sketch.stroke(this.palette.gradientBar.bottom)
        } else {
            this.sketch.strokeWeight(0)
        }
        this.sketch.rect(x, y - height, width, height)
        this.sketch.drawingContext.fillStyle = fillStyle
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
