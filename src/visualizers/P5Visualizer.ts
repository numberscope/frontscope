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
    private _sketch?: p5
    private _canvas?: p5.Renderer

    name = 'P5-based Visualizer'
    within?: HTMLElement
    get sketch(): p5 {
        if (!this._sketch) {
            throw 'Attempt to access p5 sketch while Visualizer is unmounted.'
        }
        return this._sketch
    }
    get canvas(): p5.Renderer {
        if (!this._canvas) {
            throw 'Attempt to access canvas while Visualizer is unmounted.'
        }
        return this._canvas
    }
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
        this._sketch = new p5(sketch => {
            this._sketch = sketch // must assign here,  as setup is called
            // before the `new p5` returns; I think that makes the outer
            // (re-) assigning of that result to this._sketch redundant, but
            // I also think it makes this code a bit clearer than if inhabit()
            // simply calls `new p5(...)` and discards the result, so I left
            // that outer reassignment there.

            // Now, a little bit of gymnastics to set all of the p5 methods
            // in the sketch that exist on the Visualizser. Since TypeScript
            // seems to require that they be methods in this base class, I
            // couldn't find a way to arrange the code so that the below could
            // be simplified to just check whether or not `this[method]` is
            // defined or undefined:
            for (const method of p5methods) {
                const definition = this[method]
                const dummyText = method + '(){}'
                const defText = definition.toString().replace(/\s/g, '')
                if (defText !== dummyText) {
                    sketch[method] = definition.bind(this)
                }
            }
            // And draw is special because of the error handling, so we
            // treat it separately.
            sketch.draw = () => {
                try {
                    this.draw()
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
        this._sketch?.draw()
    }

    /**
     * Stop displaying the visualizer
     */
    stop(): void {
        this._sketch?.noLoop()
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
     * _must_ call this first.
     */
    setup() {
        const [w, h] = this.measure()
        this._canvas = this.sketch.background('white').createCanvas(w, h)
    }

    /**
     * The p5 drawing function. Even though it currently does nothing
     * it is best for derived Visualizers to call this first in case
     * we ever want or need to put some functionality here.
     */
    draw(): void {
        return
    }

    /**
     * What to do when the window resizes
     */
    windowResized(): void {
        if (!this._sketch) return
        // Make sure the canvas isn't acting as a "strut" keeping the div big:
        this._sketch.resizeCanvas(10, 10)
        const [w, h] = this.measure()
        this._sketch.resizeCanvas(w, h)
    }

    /**
     * Get rid of the visualization altogether
     */
    dispose(): void {
        this._sketch?.remove()
        this._sketch = undefined
        this._canvas = undefined
    }
}
