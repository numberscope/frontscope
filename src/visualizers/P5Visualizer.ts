import type {VisualizerInterface} from './VisualizerInterface'
import {Paramable} from '../shared/Paramable'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {CachingError} from '../sequences/Cached'
import p5 from 'p5'

// Ugh, the gyrations we go through to keep TypeScript happy
// while only listing the p5 methods once:

class WithP5 extends Paramable {
    deviceMoved() {}
    deviceShaken() {}
    deviceTurned() {}
    doubleClicked() {}
    keyPressed() {}
    keyReleased() {}
    keyTyped() {}
    mouseClicked() {}
    mouseDragged() {}
    mouseMoved() {}
    mousePressed() {}
    mouseReleased() {}
    mouseWheel() {}
    setup() {}
    touchEnded() {}
    touchMoved() {}
    touchStarted() {}
    windowResized() {}
}

type P5Methods = Exclude<keyof WithP5, keyof Paramable>
const dummyWithP5 = new WithP5()
const p5methods: P5Methods[] = Object.getOwnPropertyNames(
    Object.getPrototypeOf(dummyWithP5)
).filter(name => name != 'constructor') as P5Methods[]

// Base class for implementing Visualizers that use p5.js
export class P5Visualizer extends WithP5 implements VisualizerInterface {
    name = 'P5-based Visualizer'
    within?: HTMLElement
    sketch?: p5
    canvas?: p5.Renderer
    seq: SequenceInterface

    /***
     * Create a P5-based visualizer
     * @param seq SequenceInterface  The initial sequence to draw
     */
    constructor(seq: SequenceInterface) {
        super()
        this.seq = seq
    }

    /***
     * Places the sketch into the given HTML element, and prepares to draw.
     * This has to create the sketch and generate the methods it needs.
     * @param element HTMLElement  Where the visualizer should inject itself
     */
    inhabit(element: HTMLElement): void {
        if (!this.isValid) {
            throw (
                'The visualizer is not valid. '
                + 'Run validate and address any errors.'
            )
        }
        this.within = element
        this.sketch = new p5(sketch => {
            this.sketch = sketch
            // A little bit of gymnastics to set all of the p5 methods
            // in the sketch that exist on the Visualizser:
            for (const method of p5methods) {
                const definition = this[method]
                const dummyText = method + '(){}'
                const defText = definition.toString().replace(/\s/g, '')
                if (defText !== dummyText) {
                    sketch[method] = definition.bind(this)
                }
            }
            // And draw is special because of passing in the sketch
            // and the error handling
            sketch.draw = () => {
                try {
                    this.draw(sketch)
                } catch (e) {
                    if (e instanceof CachingError) {
                        sketch.cursor('progress')
                        return
                    } else {
                        throw e
                    }
                }
                sketch.cursor(sketch.ARROW)
            }
        }, element)
    }

    /**
     * Change the sequence being shown by the visualizer
     * @param seq SequenceInterface  The sequence to show
     */
    view(seq: SequenceInterface): void {
        this.seq = seq
    }

    /**
     * Display the visualizer within the element that it is inhabiting.
     * All it has to do is call draw, since p5 calls setup for us.
     */
    show(): void {
        this.sketch?.draw()
    }

    /**
     * Stop displaying the visualizer
     */
    stop(): void {
        this.sketch?.noLoop()
    }

    /**
     * Determining the maximum pixel width and height the containing
     * element allows.
     * @returns [number, number] Maximum width and height of inhabited element
     */
    measure(): [number, number] {
        if (!this.within) return [0, 0]
        return [this.within.clientWidth, this.within.clientHeight]
    }

    /**
     * The p5 setup for this visualizer. Note that derived Visualizers
     * _must_ call this first and should just return if it returns false
     */
    setup() {
        if (!this.sketch) {
            throw 'Attempt to show P5 Visualizer before injecting into element'
        }
        const [w, h] = this.measure()
        this.canvas = this.sketch.createCanvas(w, h)
        this.sketch.background('white')
    }

    /**
     * The p5 drawing function. Even though it currently does nothing
     * it is best for derived Visualizers to call this first in case
     * we ever want or need to put some functionality here.
     */
    draw(_sketch: p5): void {
        return
    }

    /**
     * What to do when the window resizes
     */
    windowResized(): void {
        if (!this.sketch) return
        // Make sure the canvas isn't acting as a "strut" keeping the div big:
        this.sketch.resizeCanvas(10, 10)
        const [w, h] = this.measure()
        this.sketch.resizeCanvas(w, h)
    }

    /**
     * Get rid of the visualization altogether
     */
    dispose(): void {
        if (this.sketch) this.sketch.remove()
        this.sketch = undefined
        this.canvas = undefined
    }
}
