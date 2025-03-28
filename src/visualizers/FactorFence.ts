import p5 from 'p5'

import {P5Visualizer, INVALID_COLOR} from './P5Visualizer'
import {VisualizerExportModule} from './VisualizerInterface'
import type {ViewSize} from './VisualizerInterface'

import {math} from '@/shared/math'
import type {ExtendedBigint} from '@/shared/math'
import type {GenericParamDescription} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'

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
as a sort of coloured graph.  At position _n_ horizontally, there is a bar,
or fencepost, which is of height log(_n_) and broken into different pieces
of height log(_p_) for each prime divisor _p_ (with multiplicity).
**/

// colour palette class
class FactorPalette {
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
    /** md
- highlight: A natural number, the prime factors of which will be highlighted
    in the display
     **/
    highlight: {
        default: 1n,
        type: ParamType.BIGINT,
        displayName: 'Your favourite number',
        required: true,
        description:
            'We highlight primes dividing this number.'
            + ' To highlight none, put 1.',
        hideDescription: true,
        validate: function (n: bigint, status: ValidationStatus) {
            if (n <= 0) {
                status.addError('Your favourite number must be positive.')
            }
        },
    },
    /** md
- labels: Specifies whether the chart legend should be displayed
     **/
    labels: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Show text info',
        required: true,
        description: 'If checked, some text info appears onscreen',
        hideDescription: true,
    },

    /** md
- signs: Specifies whether negative terms should display below the horizontal
    axis of the chart
     **/
    signs: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Take into account signs',
        required: true,
        description: 'If checked, negative terms display below axis',
        hideDescription: true,
    },
} satisfies GenericParamDescription

// vertical bar representing factor
interface Bar {
    prime: bigint
    log: number
    highlighted?: boolean
}

// "sort" a list of Bars so that the divisors of a given number come first
// also labels the divisors as highlighted
function divisorsFirst(bars: Bar[], n: bigint) {
    const divisors: Bar[] = []
    const nondivisors: Bar[] = []
    bars.forEach(bar => {
        bar.highlighted = math.divides(bar.prime, n)
        ;(bar.highlighted ? divisors : nondivisors).push(bar)
    })
    divisors.push(...nondivisors)
    return divisors
}

// data on which bars on screen
interface BarsData {
    minBars: bigint
    maxBars: bigint
    numBars: number // should be safe because not so many pixels on screen
}

// "Natural" width of the factor bars:
const recWidth = 12
// Shift from one bar to the next:
const recSpace = new p5.Vector(recWidth + 2, 0)
// How many frames to draw at a time
const tryFrames = 3

// helper function
const isTrivial = (term: bigint) => term > -2n && term < 2n

class FactorFence extends P5Visualizer(paramDesc) {
    static category = 'FactorFence'
    static description = 'Show the factors of your sequence log-visually.'

    // mouse control
    private mousePrime = 1n
    private mouseIndex: ExtendedBigint = math.negInfinity
    private mouseLast: MouseEvent | undefined = undefined // last mouse pos
    private mouseDown = false
    private dragging = false
    private dragStart = new p5.Vector()
    private graphCornerStart = new p5.Vector()

    // store factorizations in FactorFence's internal format
    private factorizations: Record<string, Bar[]> = {}

    // scaling control
    private scaleFactor = 1.0 // zooming
    private initialLimitTerms = 10000n // initial max number of terms
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
    private palette = new FactorPalette()

    // first factorization failure
    private firstFailure = -1024n // dummy, must be replaced

    barsShowing(size: ViewSize): BarsData {
        // determine which terms will be on the screen
        // in order to decide how to initialize the graph
        // and to be efficient in computing only the portion shown

        // minimum bar to compute
        // no less than first term
        let minBars = this.seq.first
        const offset = -math.bigInt(this.graphCorner.x / recSpace.x) - 1n
        if (offset > 0) minBars += offset

        // number of bars on screen
        // two extra to slightly bleed over edge
        let bigNumBars = math.bigInt(
            size.width / this.scaleFactor / recSpace.x + 2
        )
        let maxBars = minBars + bigNumBars - 1n

        if (this.seq.last < maxBars) {
            maxBars = BigInt(this.seq.last)
            bigNumBars = maxBars - minBars + 1n
        }

        return {minBars, maxBars, numBars: Number(bigNumBars)}
    }

    collectDataForScale(barsInfo: BarsData, size: ViewSize) {
        // collect some info on the sequence in order to decide
        // how best to vertically scale the initial graph
        this.collectFailed = false
        const seqVals = Array.from(Array(barsInfo.numBars), (_, i) => {
            let elt = 1n
            try {
                elt = this.seq.getElement(BigInt(i) + barsInfo.minBars)
            } catch {
                this.collectFailed = true
                return 0
            }
            let sig = 1n // sign of element
            if (elt < 0n) {
                if (this.signs) sig = -1n
                else elt = -elt
            }
            // in case elt = 0, store 1
            if (elt === 0n) elt = 1n

            // store height of bar (log) but with sign info
            return math.natlog(elt * sig) * Number(sig)
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
                        const thisBar = {prime: base, log: math.natlog(base)}
                        for (let i = 0; i < power; i++) {
                            factors.push(thisBar)
                        }
                    }
                }
            }
            this.factorizations[myIndex.toString()] = factors
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
        this.firstFailure = barsInfo.minBars
        await this.seq.fill(barsInfo.maxBars) // must await because used now
        this.collectDataForScale(barsInfo, size)
    }

    async presketch(size: ViewSize) {
        await super.presketch(size)

        // Warn the backend we plan to factor: (Note we don't await because
        // we don't actually use the factors until later.)
        this.seq.fill(this.seq.first + this.initialLimitTerms, 'factor')

        await this.standardizeView(size)
    }

    setup() {
        super.setup()

        this.palette = new FactorPalette(this.sketch)
        // text formatting
        this.sketch.textFont('Courier New')
        this.sketch.textStyle(this.sketch.NORMAL)

        // no stroke (rectangles without borders)
        this.sketch.strokeWeight(0)
        this.sketch.frameRate(30)
    }

    /** md
## Controls
Moving the mouse over the bar chart will highlight all occurrences of the
prime that the mouse is currently over, and display information about the
term that the mouse is above. Clicking a prime will set it as the persistent
highlight value. You can drag the chart in any direction to pan the view.

    **/
    // Implementation notes: control events (keypresses and mouse gestures) are
    // handled in this code in a slightly roundabout way: every draw() call
    // checks whether a keypress is in effect and/or whether any mouse
    // gestures are occurring, and handles them accordingly. But since the
    // graph doesn't change except as a result of these actions (or the cache
    // filling), the draw loop can generally stop. So the interaction checkers
    // have to extend the draw loop if they fire. And then finally, since
    // the draw loop tends to stop, pretty much all that the actual
    // event-handling functions (mousePressed() etc, well below here in this
    // file) have to do is restart the draw loop, and then the interaction
    // checkers in draw() will actually implement the behaviors that should
    // be invoked by those events.
    // It might be more natural-seeming to implement the behaviors directly
    // in the event-handling functions. That simpler scheme would likely work
    // for the mouse events. However, it is unclear how, in that scheme, one
    // could implement the behavior that the graph continues to zoom (or
    // stretch or whatever) as you hold the corresponding key down. That's
    // because you can only rely on a single keyPressed() event and a single
    // keyReleased() event, no matter how long you hold a key down.
    // So something has to run in the meantime and check if the key is still
    // down, and it seems as though that has to be the draw() call. And
    // as long as the draw() call is implementing the key controls, it seems
    // that for consistency, it might as well do all the controls.
    mouseCheckDrag() {
        const movement = new p5.Vector(this.sketch.mouseX, this.sketch.mouseY)
        movement.sub(this.dragStart)
        // The number below is an arbitrary cutoff so as not to detect
        // "jitter" as a bona fide drag
        if (movement.mag() > 4) {
            this.dragging = true
            movement.mult(1 / this.scaleFactor)
            this.graphCorner = this.graphCornerStart.copy().add(movement)
            this.extendLoop()
        }
    }

    /** md
In addition, several keypress commands are recognized:

    **/
    keyPresses() {
        // keyboard control for zoom, pan, stretch
        /** md
- right and left arrow: zoom in and out, respectively
        **/
        if (
            this.sketch.keyIsDown(this.sketch.LEFT_ARROW)
            || this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)
        ) {
            // zoom in RIGHT
            // zoom out LEFT
            const keyScale = this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)
                ? 1.03
                : 0.97
            this.scaleFactor *= keyScale
            this.graphCorner.y = this.graphCorner.y / keyScale
        } else if (this.sketch.keyIsDown(this.sketch.UP_ARROW)) {
            /** md
- up and down arrow: stretch the bars vertically
             **/
            // stretch up UP
            this.heightScale *= 1.03
        } else if (this.sketch.keyIsDown(this.sketch.DOWN_ARROW)) {
            // contract down DOWN
            this.heightScale *= 0.97
        } else if (this.sketch.keyIsDown(74)) {
            /** md
- J/I/K/L: pan the chart left/up/down/right
             **/
            // pan left J
            this.graphCorner.x -= 10 / this.scaleFactor
        } else if (this.sketch.keyIsDown(76)) {
            // pan right L
            this.graphCorner.x += 10 / this.scaleFactor
        } else if (this.sketch.keyIsDown(73)) {
            // pan up I
            this.graphCorner.y -= 10 / this.scaleFactor
        } else if (this.sketch.keyIsDown(75)) {
            // pan down K
            this.graphCorner.y += 10 / this.scaleFactor
        } else {
            // no key we care about
            return
        }
        // Make sure that if we keep the key down, the drawing keeps adjusting:
        this.extendLoop()
    }

    draw() {
        // countdown to timeout when no key pressed
        // if key is pressing, do what it directs
        // there's a bug here that when the keyboard is
        // pressed in this window but
        // released in another window, keyIsPressed stays
        // positive and the sketch keeps computing,
        // e.g. if you tab away from the window
        // [GTW 20240827: Unable to reproduce; if someone else can,
        // please file an issue with specific instructions. Otherwise,
        // this comment should be removed at the next maintenance.]
        if (this.sketch.keyIsPressed) this.keyPresses()
        if (this.mouseDown) this.mouseCheckDrag()

        // clear the sketch
        this.sketch.clear(0, 0, 0, 0)
        this.sketch.background(this.palette.backgroundColor)

        // determine which terms will be on the screen so we only
        // bother with those
        const barsInfo = this.barsShowing({
            width: this.sketch.width,
            height: this.sketch.height,
        })

        this.sketch.push()
        // The next call scales the whole sketch, which is why we
        // encapsulate it in the above push()
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

        this.mouseIndex = math.negInfinity
        this.mousePrime = 1n
        // Determine what the mouse is over, if anything:
        if (this.mouseOnSketch()) {
            const horiz =
                this.sketch.mouseX / this.scaleFactor - this.graphCorner.x
            if (horiz % recSpace.x < recWidth) {
                const rawIndex =
                    math.bigInt(horiz / recSpace.x) + this.seq.first
                if (
                    rawIndex >= barsInfo.minBars
                    && rawIndex <= barsInfo.maxBars
                ) {
                    this.mouseIndex = rawIndex
                    // draw that bar first to find the prime, if any:
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

        // return to ordinary scaling
        this.sketch.pop()
        // text at base of sketch, if not small canvas
        if (this.sketch.height > 400 && this.labels) this.bottomText()

        // If we are waiting on elements or factorizations, extend lifetime
        if (this.collectFailed || this.firstFailure < barsInfo.maxBars) {
            this.extendLoop()
        } else {
            this.stop(tryFrames)
        }
    }

    drawTerm(myIndex: bigint, extractPrime?: string) {
        // This function draws the full stacked bars for a single term
        // Input is index of the term
        const myTerm = this.seq.getElement(myIndex)

        // get sign of term
        let mySign = 1
        if (myTerm < 0 && this.signs) mySign = -1

        // get factors of term
        const factors = this.factorizations[myIndex.toString()]

        // determine where to put lower left corner of graph
        const barStart = this.graphCorner.copy()
        // for negative terms, bar should extend below "empty" axis
        if (mySign < 0 || myTerm === 0n) barStart.add(new p5.Vector(0, 1))

        // move over based on which term
        const moveOver = recSpace.copy()
        moveOver.mult(math.safeNumber(myIndex - this.seq.first))
        barStart.add(moveOver)

        // Now draw the bars:
        // special cases with no factors
        if (factors.length === 0) {
            if (isTrivial(myTerm)) {
                // draw a one pixel high placeholder bar for 0/1/-1
                this.grad_rect(
                    barStart.x,
                    barStart.y,
                    recWidth,
                    mySign,
                    this.palette.gradientBar.top,
                    this.palette.gradientBar.bottom
                )
                // in case no bars on screen, lowestBar must be set somewhere
                this.lowestBar = Math.max(this.lowestBar, barStart.y)
            } else {
                // draw an empty bar for unknown factorizations

                // height of rectangle is log of term
                // times scaling parameter
                const recHeight =
                    mySign
                    * math.natlog(math.bigabs(myTerm))
                    * this.heightScale

                // draw the rectangle
                const emptyColor = this.palette.gradientBar.top
                this.grad_rect(
                    barStart.x,
                    barStart.y,
                    recWidth,
                    recHeight,
                    emptyColor,
                    emptyColor
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
        for (const factor of divisorsFirst(factors, this.highlight)) {
            const recHeight = mySign * factor.log * this.heightScale
            // check where mouse is
            if (extractPrime) {
                this.mousePrimeSet(recHeight, barStart, mySign, factor.prime)
            }

            const gradient = this.chooseGradient(factor)
            // draw the rectangle
            this.grad_rect(
                barStart.x,
                barStart.y,
                recWidth,
                recHeight,
                gradient.top,
                gradient.bottom
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

    chooseGradient(b: Bar) {
        if (b.prime === this.mousePrime) return this.palette.gradientMouse
        if (b.highlighted) return this.palette.gradientHighlight
        return this.palette.gradientBar
    }

    mouseOnSketch(): boolean {
        const {mouseX, mouseY} = this.sketch
        if (
            mouseX < 0
            || mouseX > this.sketch.width
            || mouseY < 0
            || mouseY > this.sketch.height
        ) {
            return false
        }
        if (!this.mouseLast) return false
        const where = document.elementFromPoint(
            this.mouseLast.clientX,
            this.mouseLast.clientY
        )
        if (!where || !this.within) return false
        return where === this.within || where.contains(this.within)
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

    extendLoop() {
        this.continue() // clear the frames remaining
        this.stop(tryFrames) // and reset it
    }

    async resized(toSize: ViewSize) {
        await this.standardizeView(toSize)
        return false // Let the framework handle the redisplay
    }

    keyPressed() {
        this.continue()
    }

    keyReleased() {
        if (!this.sketch.keyIsPressed) this.stop()
    }

    mouseMoved(event: MouseEvent) {
        this.mouseLast = event
        this.extendLoop()
    }

    mouseDragged(event: MouseEvent) {
        this.mouseLast = event
        this.extendLoop()
    }

    mousePressed() {
        if (!this.mouseOnSketch()) return
        this.mouseDown = true
        this.dragStart = new p5.Vector(this.sketch.mouseX, this.sketch.mouseY)
        this.graphCornerStart = this.graphCorner.copy()
        this.extendLoop()
    }

    mouseReleased() {
        if (this.dragging) {
            this.dragging = false
        } else if (this.mouseDown) {
            // set highlight prime by click
            this.highlight = this.mousePrime
            this.refreshParams()
        }
        this.mouseDown = false
        this.extendLoop()
    }

    /** md

    You can also zoom the view using the scroll wheel.
    **/
    mouseWheel(event: WheelEvent) {
        // this adjusts scaling by adjusting
        // this.scaleFactor and (mouse position - scaled graph corner)
        // by the same factor

        // current mouse - scaledcorner (vector corner -> mouse)
        const mouse = new p5.Vector(this.sketch.mouseX, this.sketch.mouseY)
        const cornerToMouse = mouse
            .copy()
            .sub(this.graphCorner.copy().mult(this.scaleFactor))

        // change scale factor
        let scaleFac = 1
        if (event.deltaY > 0) scaleFac = 1.03
        else scaleFac = 0.97
        this.scaleFactor *= scaleFac

        // new scaledcorner = mouse - (mouse - scaledcorner)*scaled
        this.graphCorner = mouse
            .copy()
            .sub(cornerToMouse.mult(scaleFac))
            .mult(1 / this.scaleFactor)
        this.extendLoop()
    }

    // Displays text at given position, returning number of pixels used
    // Uses ... if it will run off screen
    textCareful(
        text: string,
        textLeft: number,
        textBottom: number,
        showDigits?: boolean
    ) {
        if (textLeft > this.sketch.width) return 0
        const overflow =
            this.sketch.textWidth(text) - this.sketch.width + textLeft
        if (overflow > 0) {
            let surplusCharacters =
                Math.ceil(overflow / this.sketch.textWidth('1')) + 3
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
            return this.sketch.textWidth(newText)
        }
        this.sketch.text(text, textLeft, textBottom)
        return this.sketch.textWidth(text)
    }

    bottomText() {
        // text size and position
        this.sketch.textSize(this.textSize)
        this.sketch.strokeWeight(0) // no outline
        let textLeft = this.textLeft

        // spacing between lines
        const lineHeight = this.textInterval
        let textBottom = Math.min(
            this.lowestBar * this.scaleFactor + 2 * lineHeight,
            this.sketch.height - 5.5 * lineHeight
        )

        // colours match graph colours
        const infoColors = [
            this.palette.gradientMouse.bottom,
            this.palette.gradientHighlight.bottom,
        ]

        // always visible static text info, line by line
        // boolean represents whether to line break
        const info = [
            {
                text: 'Click to select a prime;',
                color:
                    this.mouseDown && !this.dragging
                        ? infoColors[1]
                        : infoColors[0],
            },
            {
                text: ' drag to move;',
                color: infoColors[this.dragging ? 1 : 0],
            },
            {text: ' scroll or '},
            {
                text: '← → keys ',
                color:
                    this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)
                    || this.sketch.keyIsDown(this.sketch.LEFT_ARROW)
                        ? infoColors[1]
                        : infoColors[0],
            },
            {
                text: 'to zoom;',
                color:
                    this.sketch.keyIsDown(this.sketch.RIGHT_ARROW)
                    || this.sketch.keyIsDown(this.sketch.LEFT_ARROW)
                        ? infoColors[1]
                        : infoColors[0],
            },
            {
                text: ' ↑↓ to stretch',
                color:
                    this.sketch.keyIsDown(this.sketch.UP_ARROW)
                    || this.sketch.keyIsDown(this.sketch.DOWN_ARROW)
                        ? infoColors[1]
                        : infoColors[0],
                linebreak: true,
            },
            {
                text:
                    this.highlight === 1n
                        ? 'Not highlighting '
                        : `Highlighting factors of ${this.highlight} `,
                color: infoColors[1],
            },
            {
                text:
                    this.highlight === 1n
                        ? '(favourite number is 1)'
                        : '(and displaying them first)',
                color: infoColors[1],
                linebreak: true,
            },
        ]

        // display mouse invariant info
        let continuingLine = false
        for (const item of info) {
            if (
                this.sketch.textWidth(item.text)
                    > this.sketch.width - textLeft
                && continuingLine
            ) {
                textBottom += lineHeight
                textLeft = this.textLeft
            }
            this.sketch.fill(item.color || infoColors[0])
            textLeft += this.textCareful(item.text, textLeft, textBottom)
            if (item.linebreak) {
                textBottom += lineHeight
                textLeft = this.textLeft
                continuingLine = false
            } else {
                continuingLine = true
            }
        }

        // factorization text shown upon mouseover of graph
        const mIndex = this.mouseIndex
        if (typeof mIndex !== 'bigint') return
        const reorderedFactors = divisorsFirst(
            this.factorizations[mIndex.toString()],
            this.highlight
        )
        // term and sign
        const mTerm = this.seq.getElement(mIndex)
        let mSign = 1n
        if (mTerm < 0n) mSign = -1n

        // display mouseover info line
        const infoLineFunction = `a(${mIndex})`
        const infoLineStart = `${infoLineFunction} = `
        this.sketch.fill(infoColors[0])
        textLeft += this.textCareful(infoLineStart, textLeft, textBottom)
        this.textCareful(mTerm.toString(), textLeft, textBottom, true)
        textBottom += lineHeight

        if (isTrivial(mTerm)) return

        const infoLineContinue = ' = '
        textLeft = this.textLeft + this.sketch.textWidth(infoLineFunction)
        textLeft += this.textCareful(infoLineContinue, textLeft, textBottom)

        if (reorderedFactors.length === 0) {
            this.sketch.text('(factorization unknown)', textLeft, textBottom)
            return
        }
        if (reorderedFactors.length === 1) {
            this.sketch.fill(this.chooseGradient(reorderedFactors[0]).bottom)
            this.sketch.text('(prime)', textLeft, textBottom)
            return
        }
        if (mSign < 0n) {
            this.sketch.text('-', textLeft, textBottom)
            textLeft += this.sketch.textWidth('-') + 1
        }
        let first = true
        for (const bar of reorderedFactors) {
            if (!first) {
                this.sketch.fill(infoColors[0])
                textLeft += this.textCareful('×', textLeft, textBottom)
                textLeft += 1
            }

            this.sketch.fill(this.chooseGradient(bar).bottom)
            textLeft += this.textCareful(
                bar.prime.toString(),
                textLeft,
                textBottom
            )
            textLeft += 1
            first = false
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
        const fillStyle = this.sketch.drawingContext.fillStyle
        this.sketch.drawingContext.fillStyle = barGradient
        this.sketch.strokeWeight(0)
        this.sketch.rect(x, y - height, width, height)
        this.sketch.drawingContext.fillStyle = fillStyle
    }
}

export const exportModule = new VisualizerExportModule(FactorFence)
