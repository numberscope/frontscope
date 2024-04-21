import {P5Visualizer} from './P5Visualizer'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import * as math from 'mathjs'

/** md

# Number Glyphs

[<img src="../../assets/img/glyph/ring1.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/glyph/ring1.png)

The terms of the sequence are laid out in a grid, left-to-right and top
to bottom.  For each term, a glyph is generated:  an image that depends
on the term, and has distinctive visual features.  The glyph generating
algorithm may depend on all the terms shown on screen, but 
repeated terms in the sequence will give repeated glyphs.

The default glyph generation algorithm is as follows.  Each glyph has a 
colour that reflects the prime factorization of the number, obtained by
blending colours assigned to all the primes appearing as divisors in the
terms of the sequence which appear on the screen.
The term is drawn as a disk, whose brightness 
varies according to a given function from outer rim to center.
The function grows faster for larger terms, and incorporates a 
modulus function so that one observes 'growth rings;' that is,
tighter growth rings indicate a larger integer.  Growth rings
that are drawn more frequently than the pixel distance will be suffer 
from a sort of aliasing effect, appearing as if they are less frequent.

### Bigint errors

Because `math.js` does not handle bigints, this visualizer will produce
errors when any of the following occur:

- terms do not fit in the javascript Number type
- the growth function evaluated at a term does not fit in the Number 
type
- as with any visualizer, if the visualizer is used with a Sequence 
From Formula which produces invalid or incorrect output because of overflow

The latter two types of errors occur inside `math.js` and may
produce unpredictable results.  To handle the first type of error,
currently this visualizer will set all terms whose absolute value
exceeds \( 2^{53}-1 \) to be 0.


### Keyboard interaction

- Press the **left arrow key** to show/hide the color of each prime factor.
- Press the **right arrow key** to show/hide labels.
- Press **[** to turn up brightness.
- Press **]** to turn down brightness.

### Parameters
 **/

class NumberGlyph extends P5Visualizer {
    name = 'Number Glyphs'
    n = 64
    customize = false
    brightCap = 25
    formula = 'abs(log(max(abs(n),2)^x)) % 25'

    params = {
        /** md
##### Number of Terms

The number of terms to display onscreen.  The sizes of the discs will 
be sized so that there are \(N^2\) disc positions, where \(N^2\) is the
smallest prime exceeding the number of terms (so that the terms mostly fill
the screen).  Choose a perfect square number of terms to fill the square.
If the sequence does not have that many terms, the visualizer will 
only attempt to show the available terms.
**/
        n: {
            value: this.n,
            forceType: 'integer',
            displayName: 'Number of Terms',
            required: true,
        },
        /** md
##### Customize Glyphs

This is a boolean which, if selected, will reveal further customization
options for the glyph generation function.
**/
        customize: {
            value: this.customize,
            forceType: 'boolean',
            displayName: 'Customize Glyphs',
            required: true,
        },
        /** md
##### Growth Function

This is a function in two variables, n and x.  Most standard math notations
are accepted (+, -, *, / , ^, log, sin, cos etc.)  The variable n 
represents the
term of which this disc is a representation.  The variable x takes the value 
0 at the outer rim of the disk, increasing once per pixel until the 
center.  The value of this function determines the brightness of the disk 
at that radius. A value of 0 is black
and higher values are brighter.  

The default value is `abs(log(max(abs(n),2)^x)) % 25`.
**/
        formula: {
            value: this.formula,
            displayName: 'Growth Function',
            description: "A function in 'n' (term) and 'x' (growth variable)",
            visibleDependency: 'customize',
            visibleValue: true,
            required: true,
        },
        /** md
##### Brightness Adjustment

This is a brightness adjustment.  It acts as a brightness cap or 
cutoff:  brightness values will range from zero to this value.  If set 
high (higher than most values of the function) it will produce dull dark 
glyphs.  If set low, 
brightnesses above the cutoff will be rounded down to the cutoff, resulting in 
bright `flat' glyphs with less brightness variation.

In general, results are nice when the brightness adjustment
is set to the maximum attained by the Growth Function.

The default value is 25.  
**/
        brightCap: {
            value: this.brightCap,
            forceType: 'integer',
            displayName: 'Brightness Adjustment',
            description:
                'Smaller values make brighter glyphs with decreased variation',
            visibleDependency: 'customize',
            visibleValue: true,
            required: false,
        },
    }

    private evaluator: math.EvalFunction

    colorMap = new Map()
    private last = 0
    private currentIndex = 0
    private position = this.sketch.createVector(0, 0)
    private boxSize = this.sketch.createVector(0, 0)
    private canvasSize = this.sketch.createVector(0, 0)
    private initialPosition = this.sketch.createVector(0, 0)
    private positionIncrement = 100
    private columns = 0
    private subG = this.sketch.createGraphics(0, 0)
    private subL = this.sketch.createGraphics(0, 0)
    private boxIsShow = false
    private primeNum: bigint[] = []
    private countPrime = 0
    private firstDraw = true
    private showLabel = false
    private brightAdjust = 100

    // dot control
    private radii = 50 // increments of radius in a dot
    private initialRadius = 50 // size of dots

    constructor(seq: SequenceInterface) {
        super(seq)
        // It is mandatory to initialize the `evaluator` property here,
        // so just use a simple dummy formula until the user provides one.
        this.evaluator = math.compile(this.formula)
    }

    inhabit(element: HTMLElement) {
        super.inhabit(element)
        this.currentIndex = this.seq.first
        this.position = this.sketch.createVector(0, 0)
        this.boxSize = this.sketch.createVector(800, 90)
        this.subG = this.sketch.createGraphics(this.boxSize.x, this.boxSize.y)
        this.canvasSize = this.sketch.createVector(800, 800)
        this.subL = this.sketch.createGraphics(
            this.canvasSize.x,
            this.canvasSize.y
        )
        this.columns = Math.ceil(Math.sqrt(this.n))
        this.last = this.n + this.seq.first // adjust for offset
        if (this.last > this.seq.last) {
            this.last = this.seq.last
        }
        this.positionIncrement = Math.floor(this.canvasSize.x / this.columns)
        this.initialRadius = Math.floor(this.positionIncrement / 2)
        this.radii = this.initialRadius
    }

    checkParameters() {
        // code currently re-used from SequenceFormula.ts
        const status = super.checkParameters()

        let parsetree = undefined
        try {
            parsetree = math.parse(this.params.formula.value)
        } catch (err: unknown) {
            status.isValid = false
            status.errors.push(
                'Could not parse formula: ' + this.params.formula.value
            )
            status.errors.push((err as Error).message)
            return status
        }
        const othersymbs = parsetree.filter(
            (node, path, parent) =>
                node.type === 'SymbolNode'
                && parent?.type !== 'FunctionNode'
                && node.name !== 'n'
                && node.name !== 'x'
        )
        if (othersymbs.length > 0) {
            status.isValid = false
            status.errors.push(
                "Only 'n' and 'x' may occur as a free variable in formula.",
                `Please remove '${(othersymbs[0] as math.SymbolNode).name}'`
            )
        }
        this.evaluator = parsetree.compile()
        return status
    }

    growthFunction(n: number, x: number) {
        return this.evaluator.evaluate({n: n, x: x})
    }

    setup() {
        super.setup()
        this.sketch
            .background('black')
            .colorMode(this.sketch.HSB, 360, 100, 100)
            .frameRate(30)

        this.firstDraw = true

        // Set position of the circle
        this.initialPosition = this.sketch.createVector(
            this.initialRadius,
            this.initialRadius
        )
        this.position = this.sketch.createVector(
            this.initialPosition.x,
            this.initialPosition.y
        )

        // Obtain all prime numbers that appear as factors in the sequence
        for (let i = this.seq.first; i < this.last; i++) {
            const checkCurrentFactors = this.seq.getFactors(i)
            if (checkCurrentFactors !== null) {
                for (let j = 0; j < checkCurrentFactors.length; j++) {
                    const checkCurrentPrime = checkCurrentFactors[j][0]
                    if (
                        !this.primeNum.includes(checkCurrentPrime)
                        && checkCurrentPrime != 0n
                        && checkCurrentPrime != -1n
                    ) {
                        this.primeNum.push(checkCurrentPrime)
                        this.countPrime += 1
                    }
                }
            }
        }

        //assign color to each prime number
        const colorNum = 360 / this.countPrime

        this.colorMap.set(1, 0)
        let tmp = 0

        for (let i = 0; i < this.primeNum.length; i++) {
            if (this.colorMap.has(this.primeNum[i]) == false) {
                tmp += colorNum
                this.colorMap.set(this.primeNum[i], tmp)
            }
        }
    }

    draw() {
        super.draw()
        if (this.firstDraw == true && this.currentIndex < this.last) {
            this.sketch.noStroke()

            this.drawCircle(this.currentIndex)

            this.changePosition()

            this.currentIndex++

            // Check if drawing finished
            if (this.currentIndex >= this.last) {
                this.firstDraw = false
            }
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
        this.redrawCircles()
    }

    brightnessDown() {
        this.brightAdjust -= 1
        this.redrawCircles()
    }

    // Draw labels for each circle
    drawLabel() {
        this.position = this.sketch.createVector(
            this.initialPosition.x,
            this.initialPosition.y
        )
        this.subL = this.sketch.createGraphics(
            this.canvasSize.x,
            this.canvasSize.y
        )
        this.subG.colorMode(this.sketch.HSB)
        this.subG.noStroke()
        for (let i = this.seq.first; i < this.last; i++) {
            this.showCircleLabel(i)
            this.changePosition()
        }
    }

    // Remove all labels by drawing circles again
    undrawLabel() {
        this.redrawCircles()
    }

    redrawCircles() {
        this.position = this.sketch.createVector(
            this.initialPosition.x,
            this.initialPosition.y
        )
        this.firstDraw = true
        this.currentIndex = this.seq.first
        this.sketch.redraw()
    }

    drawCircle(ind: number) {
        let numberNowBigint = this.seq.getElement(ind)
        // temporary fix while math.js doesn't handle bigint
        if (
            numberNowBigint < Number.MIN_SAFE_INTEGER
            || numberNowBigint > Number.MAX_SAFE_INTEGER
        ) {
            numberNowBigint = 0n
        }
        const numberNow = Number(numberNowBigint)
        this.sketch.ellipseMode(this.sketch.RADIUS)
        this.sketch.colorMode(this.sketch.HSB)
        this.sketch.noStroke()
        let radius = this.initialRadius
        let bright = 0

        // Obtain the color of the circle
        let combinedColor = this.factorColor(ind)
        let saturation = 100
        // greyscale if no primes
        // (occurs for -1,0,1 or couldn't factor)
        if (combinedColor == -1) {
            saturation = 0
            combinedColor = 0
        }
        this.sketch.fill(combinedColor, saturation, bright)

        // iterate smaller and smaller circles
        for (let x = 0; x < this.radii; x++) {
            // set brightness based on function value
            const val = this.growthFunction(numberNow, x)
            bright = val
            if (bright < 0) {
                bright = 0
            }
            if (bright > this.brightCap) {
                bright = this.brightCap
            }
            bright = this.brightAdjust * (bright / this.brightCap)

            // draw the circle
            this.sketch.fill(combinedColor, saturation, bright)
            this.sketch.ellipse(
                this.position.x,
                this.position.y,
                radius,
                radius
            )

            radius -= this.initialRadius / this.radii
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
        this.position.add(this.positionIncrement, 0)
        // if we need to go to next line
        if ((this.currentIndex - this.seq.first + 1) % this.columns == 0) {
            this.position.x = this.initialPosition.x
            this.position.add(0, this.positionIncrement)
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
            this.subG.fill(this.colorMap.get(this.primeNum[i]), 100, 100)

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
    factorColor(ind: number) {
        const factors = this.seq.getFactors(ind)
        if (factors === null) {
            return -1
        } // factoring failed

        //Combine color for each prime factor
        let colorAll = -1
        for (let i = 0; i < factors.length; i++) {
            const thisPrime = factors[i][0]
            const thisExp = factors[i][1]
            for (let j = 0; j < this.primeNum.length; j++) {
                if (thisPrime == this.primeNum[j]) {
                    for (let k = 0; k < thisExp; k++) {
                        if (colorAll == -1) {
                            colorAll = this.colorMap.get(thisPrime)
                        } else {
                            colorAll =
                                (colorAll + this.colorMap.get(thisPrime)) / 2
                        }
                    }
                }
            }
        }

        return colorAll
    }
}

export const exportModule = new VisualizerExportModule(
    'Number Glyphs',
    NumberGlyph,
    ''
)

/** md

## Examples

Click on any image to expand it.

###### The Positive Integers

[<img src="../../assets/img/glyph/integers.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/glyph/integers.png)
[<img src="../../assets/img/glyph/ring1.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/glyph/ring1.png)

First, the non-negative integers, with 
the default settings.  Next, with growth function taken  
modulo 1 (instead of the default 25) and Brightness Adjustment set 
to 1.  The second example shows some interesting 
effects because the rings
occur more rapidly than once per pixel.  

###### The semi-primes

[<img src="../../assets/img/glyph/semiprimes.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/glyph/semiprimes.png)

This image shows the semi-primes 
([A001358](https://oeis.org/A001358)).  In this example, 121 
elements are shown.

###### Another growth function

[<img src="../../assets/img/glyph/diff-func.png" width="320" 
style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/glyph/diff-func.png)

This shows the integers under the growth 
function \( 25(1-\cos(nx)) \) modulo 25.

## Credit

The original version of this visualizer was created by Jennifer Leong, as part
of the [Experimental Mathematics
Lab](https://www.colorado.edu/math/content/experimental-mathematics-lab) at
[CU Boulder](https://www.colorado.edu/math/).
**/
