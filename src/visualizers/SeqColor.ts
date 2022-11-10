import type p5 from 'p5'
import {VisualizerDefault} from './VisualizerDefault'
import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'
import {VisualizerExportModule} from '@/visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'

const primeNum: number[] = []
let count_prime = 0
const colorMap = new Map()
//let pg

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

    initialize(sketch: p5, seq: SequenceInterface) {
        super.initialize(sketch, seq)
        this.sketch = sketch
        this.seq = seq

        this.current_num = seq.first
        this.X = 0
        this.Y = 0
        count_prime = 0

        for (let i = this.seq.first; i < this.n; i++) {
            if (this.isPrime(Number(this.seq.getElement(i))) == true) {
                count_prime += 1
                primeNum.push(Number(this.seq.getElement(i)))
                console.log(this.seq.getElement(i))
            }
        }

        this.ready = true
    }

    setup() {
        this.sketch.background('black')

        this.sketch.colorMode(this.sketch.HSB, 360, 100, 100)

        this.sketch.frameRate(30)

        this.X = 800 / this.n + 30
        this.Y = 800 / this.n + 50
        //pg = this.sketch.createGraphics(400, 250)
    }

    draw() {
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
                Number(count_prime)
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
            this.afterLoop()
        }
        this.sketch.noStroke()
    }

    afterLoop() {
        this.sketch.fill(0, 0, 100)
        this.sketch.rect(0, 700, 800, 90)
        let tmpX = 0
        let tmpY = 0

        //Bug: primeNum has repeat values -> "draw" twice so record the numbers twice
        for (let i = 0; i < primeNum.length / 2; i += 1) {
            this.sketch.fill('black')
            this.sketch.text(String(primeNum[i]), 0 + tmpX, 730 + tmpY)
            this.sketch.fill(colorMap.get(primeNum[i]), 100, 100)
            this.sketch.ellipse(25 + tmpX, 730 + tmpY, 10, 10)
            tmpX += 50
            if (tmpX >= 800) {
                tmpX = 0
                tmpY += 30
            }
        }

        this.sketch.noLoop()
    }

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

    primeFactors(n: number, total_prime: number) {
        const factors = []
        let factor_check = 2
        //assign color to each prime number
        const colorNum = 360 / Number(total_prime)

        // console.log("total_prime: ", total_prime)
        //const colorCombine = []

        colorMap.set(1, 0)
        let tmp = 0

        while (n >= 2) {
            if (n % factor_check == 0) {
                factors.push(factor_check)
                // console.log("factor_check: ", factor_check)
                n = n / factor_check
            } else {
                factor_check++
            }
        }

        for (let i = 0; i < primeNum.length; i++) {
            //console.log('PrimeNum: ', primeNum.length)
            if (colorMap.has(primeNum[i]) == false) {
                tmp += colorNum
                colorMap.set(primeNum[i], tmp)
                //console.log('           COLOR       TMP     :', tmp)
            }
        }

        /*
        Combine color for each prime factors
        }*/
        let colorAll = -1
        for (let i = 0; i < factors.length; i++) {
            for (let j = 0; j < primeNum.length; j++) {
                if (factors[i] == primeNum[j]) {
                    if (colorAll == -1) {
                        //colorAll = colorCombine[j]
                        //console.log("1ST PRIME FACTOR: ", colorCombine[j])
                        colorAll = colorMap.get(factors[i])
                    } else {
                        colorAll = (colorAll + colorMap.get(factors[i])) / 2
                    }
                }
            }
        }
        //console.log('colorAll: ', colorAll)
        for (const value of colorMap.values()) {
            //console.log('       MAPMAPMAP           ', value)
        }
        return colorAll
    }
}

export const exportModule = new VisualizerExportModule(
    'Sequence Color',
    SeqColor,
    ''
)
