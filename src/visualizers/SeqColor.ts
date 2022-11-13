import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'

const colorMap = new Map()
let firstDraw = true
let countClick = 0

//Show description box by pressing left arrow key
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

    private current_num = 0
    private X = 0
    private Y = 0
    private subG = this.sketch.createGraphics(800, 90)
    private boxIsShow = false
    private primeNum: number[] = []
    private count_prime = 0

    initialize(sketch: p5, seq: SequenceInterface) {
        super.initialize(sketch, seq)
        this.sketch = sketch
        this.seq = seq
        this.current_num = seq.first
        this.X = 0
        this.Y = 0
        this.ready = true
    }

    setup() {
        this.sketch.background('black')

        this.sketch.colorMode(this.sketch.HSB, 360, 100, 100)

        this.sketch.frameRate(30)

        this.X = 800 / this.n + 30
        this.Y = 800 / this.n + 50

        for (let i = this.seq.first; i < this.n; i++) {
            if (
                this.isPrime(Number(this.seq.getElement(i))) == true
                && this.valueDoesNotRepeat(
                    Number(this.seq.getElement(i)),
                    this.primeNum
                ) == true
            ) {
                this.primeNum.push(Number(this.seq.getElement(i)))
                this.count_prime += 1
            }
        }
    }

    //bug: plot disappear after clicking "Back" -- firstDraw = false
    draw() {
        if (firstDraw == true) {
            this.sketch.ellipseMode(this.sketch.RADIUS)
            const number_now = this.seq.getElement(this.current_num++)
            let radius = 50
            let bright = 0
            for (let x = this.n; x >= 2; x -= 1) {
                const diff = Math.abs(
                    Math.log(
                        1 / Math.pow(Number(number_now), x - 1)
                            - Math.log(1 / Math.pow(Number(number_now), x))
                    )
                )
                const h = this.primeFactors(
                    Number(number_now),
                    Number(this.count_prime)
                )

                this.sketch.colorMode(this.sketch.HSB)
                this.sketch.fill(h, 100, bright)
                this.sketch.ellipse(this.X, this.Y, radius, radius)
                bright = this.changeColor(diff, bright)

                radius -= 1
            }

            this.sketch.fill('white')
            this.sketch.text(
                '1/'.concat(String(number_now)).concat('^n'),
                this.X,
                this.Y
            )
            this.X += 100
            if (this.X >= 800) {
                this.X = 800 / this.n + 30
                this.Y += 100
            }

            if (this.current_num >= this.n) {
                firstDraw = false
            }
            this.sketch.noStroke()
        } else {
            //Bug(?): multiple clicks detected when only one click happened
            if (this.sketch.keyIsDown(this.sketch.LEFT_ARROW)) {
                console.log(countClick++)
                if (this.boxIsShow == true && this.subG != null) {
                    this.boxIsShow = false
                    this.undrawBox()
                } else {
                    this.boxIsShow = true
                    this.drawBox()
                }
            }
        }
    }

    drawBox() {
        this.subG = this.sketch.createGraphics(800, 90)
        this.subG.colorMode(this.sketch.HSB)
        this.subG.noStroke()
        this.subG.fill(0, 0, 100)
        this.subG.rect(0, 0, 800, 90)
        this.subG.fill('black')
        let tmpX = 0
        let tmpY = 0

        for (let i = 0; i < this.primeNum.length; i += 1) {
            this.subG.fill('black')
            this.subG.text(String(this.primeNum[i]), 10 + tmpX, 15 + tmpY)
            this.subG.fill(colorMap.get(this.primeNum[i]), 100, 100)

            this.subG.ellipse(35 + tmpX, 15 + tmpY, 10, 10)
            tmpX += 50
            if (tmpX >= 800) {
                tmpX = 0
                tmpY += 30
            }
        }

        this.sketch.image(this.subG, 0, 700)

        //this.sketch.noLoop()
    }

    undrawBox() {
        if (this.subG) {
            console.log('undraw')
            this.subG.fill('black')
            this.subG.rect(0, 0, 800, 90)
            this.sketch.image(this.subG, 0, 700)
        }
    }

    //change the brightness of the circle
    changeColor(difference: number, now: number) {
        if ((now + difference) % 100 < now) {
            return 100
        } else {
            return (now + difference) % 100
        }
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
    primeFactors(n: number, total_prime: number) {
        const factors = []
        let factor_check = 2
        //assign color to each prime number
        const colorNum = 360 / Number(total_prime)

        colorMap.set(1, 0)
        let tmp = 0

        while (n >= 2) {
            if (n % factor_check == 0) {
                factors.push(factor_check)
                n = n / factor_check
            } else {
                factor_check++
            }
        }

        for (let i = 0; i < this.primeNum.length; i++) {
            if (colorMap.has(this.primeNum[i]) == false) {
                tmp += colorNum
                colorMap.set(this.primeNum[i], tmp)
            }
        }

        /*
        Combine color for each prime factors
        }*/
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

    valueDoesNotRepeat(n: number, arr: number[]) {
        for (let i = 0; i < arr.length; i++) {
            if (n == arr[i]) {
                return false
            }
        }

        return true
    }
}

export const exportModule = new VisualizerExportModule(
    'Sequence Color',
    SeqColor,
    ''
)
