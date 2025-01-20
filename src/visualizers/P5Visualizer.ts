import type {VisualizerInterface} from './VisualizerInterface'
import {Paramable} from '../shared/Paramable'
import type {GenericParamDescription, ParamValues} from '../shared/Paramable'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {CachingError} from '../sequences/Cached'
import p5 from 'p5'

// Ugh, the gyrations we go through to keep TypeScript happy
// while only listing the p5 methods once:

class WithP5<PD extends GenericParamDescription> extends Paramable<PD> {
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

type P5Methods<PD extends GenericParamDescription> = Exclude<
    keyof WithP5<PD>,
    keyof Paramable<PD>
>
const dummyWithP5 = new WithP5<GenericParamDescription>({})
const p5methods: P5Methods<GenericParamDescription>[] =
    Object.getOwnPropertyNames(Object.getPrototypeOf(dummyWithP5)).filter(
        name => name != 'constructor'
    ) as P5Methods<GenericParamDescription>[]

/* A convenience HACK so that visualizer writers can initialize
    p5 color properties without a sketch. Don't try to draw with this!
    TODO: replace with a safe-to-use black or white, or at least an
    object that throws an understandable instead of cryptic error
    if p5 tries to draw with it, e.g.
    `Attempt for p5 to use INVALID_COLOR; please initialize your
    color from a sketch object.`
*/
export const INVALID_COLOR = {} as p5.Color

// Base class for implementing Visualizers that use p5.js
export function P5Visualizer<PD extends GenericParamDescription>(desc: PD) {
    const defaultObject = Object.fromEntries(
        Object.keys(desc).map(param => [param, desc[param].default])
    )
    const P5Visualizer = class
        extends WithP5<PD>
        implements VisualizerInterface<PD>
    {
        _sketch?: p5
        _canvas?: p5.Renderer
        _size: {width: number; height: number}

        within?: HTMLElement
        get sketch(): p5 {
            if (!this._sketch) {
                throw (
                    'Attempt to access p5 sketch '
                    + 'while Visualizer is unmounted.'
                )
            }
            return this._sketch
        }
        get canvas(): p5.Renderer {
            if (!this._canvas) {
                throw 'Attempt to access canvas while Visualizer is unmounted.'
            }
            return this._canvas
        }
        seq: SequenceInterface<GenericParamDescription>

        /***
         * Create a P5-based visualizer
         * @param seq SequenceInterface  The initial sequence to draw
         */
        constructor(seq: SequenceInterface<GenericParamDescription>) {
            super(desc)
            this.seq = seq
            this._size = {width: 0, height: 0}
            Object.assign(this, defaultObject)
        }

        /***
         * Places the sketch into the given HTML element, and prepares to draw.
         * This has to create the sketch and generate the methods it needs. In
         * p5-based visualizers, we presume that initialization will generally
         * take place in the standard p5 setup() method, so only the rare
         * visualizer that needs to interact with the DOM or affect the
         * of the p5 object itself would need to implement an extended or
         * replaced inhabit() method.
         * @param element HTMLElement  Where the visualizer should inject itself
         * @param size The width and height the visualizer should occupy
         */
        inhabit(
            element: HTMLElement,
            size: {width: number; height: number}
        ): void {
            if (this.within === element) return // already inhabiting there
            if (this.within) {
                // oops, already inhabiting somewhere else; depart there
                this.depart(this.within)
            }
            this._size = size
            this.within = element
            this._sketch = new p5(sketch => {
                this._sketch = sketch // must assign here,  as setup is called
                // before the `new p5` returns; I think that makes the outer
                // (re-) assigning of that result to this._sketch redundant, but
                // I also think it makes this code a bit clearer than if
                // inhabit() simply calls `new p5(...)` and discards the result,
                // so I left that outer reassignment there.

                // Now, a little bit of gymnastics to set all of the p5 methods
                // in the sketch that exist on the Visualizser. Since TypeScript
                // seems to require that they be methods in this base class, I
                // couldn't find a way to arrange the code so that the below
                // could be simplified to just check whether or not
                // `this[method]` is defined or undefined:
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
        view(seq: SequenceInterface<GenericParamDescription>): void {
            this.seq = seq
            this.reset()
        }

        /**
         * Display the visualizer within the element that it is inhabiting.
         * All it has to do is call draw, since p5 calls setup for us.
         */
        show(): void {
            // In the event that the rendering context isn't ready, this value
            // represents how long in milliseconds we should wait before trying
            // again
            const displayTimeout = 5

            if (this._canvas) this._sketch?.draw()
            else {
                // If the rendering context is not yet ready, start an interval
                // that waits until the canvas is ready and shows when finished
                const interval = setInterval(() => {
                    if (this._canvas) {
                        clearInterval(interval)
                        this._sketch?.draw()
                    }
                }, displayTimeout)
            }
        }

        /**
         * Stop displaying the visualizer
         */
        stop(): void {
            this._sketch?.noLoop()
        }

        /**
         * The p5 setup for this visualizer. Note that derived Visualizers
         * _must_ call this first.
         */
        setup() {
            this._canvas = this.sketch
                .background('white')
                .createCanvas(this._size.width, this._size.height)
        }

        /**
         * The p5 drawing function. This must be implemented by derived classes
         * that actually wish to serve as Visualizers. It should use p5 methods
         * on this.sketch to create the desired image connected with the
         * associated sequence/parameters.
         *
         * Note that because this is an anonymous class, methods can't directly
         * be abstract. However, visualizer writers are still expected to
         * implement this function.
         */
        draw(): void {}

        /**
         * Get rid of the visualization altogether
         */
        depart(element: HTMLElement): void {
            if (!this._sketch || !this.within) {
                throw 'Attempt to dispose P5Visualizer that is not on view.'
            }
            if (this.within !== element) return // that view already departed
            this._sketch.remove()
            this._sketch = undefined
            this._canvas = undefined
            this.within = undefined
        }
        /* Further remarks on realizing visualizers in the DOM with inhabit()
            and depart():
    
            If an HTML element (usually a div) gets removed from the DOM while
            a visualizer is still inhabiting it, the visualizer becomes a
            troublesome "ghost": the user can't see or interact with it, but
            it's still listening for events and consuming system resources.
            There are two ways to prevent this:
    
            1. Immediately tell the visualizer to depart the div you're removing
    
            2. Immediately tell the visualizer to inhabit a div that is still in
                the DOM.
    
            It's safe for these calls to happen redundantly. If you tell a
            visualizer to depart a div that it's not inhabiting, or to inhabit
            a div that it's already inhabiting, nothing will happen.
        */

        parameterChanged(_name: string): void {
            this.reset()
        }

        /* By default, a P5 visualizer returns undefined from this function,
         * meaning it will not request an aspect ratio and instead be given a
         * canvas of any arbitrary width and height. Visualizers can override
         * this to request a specific aspect ratio.
         */
        requestedAspectRatio(): number | undefined {
            return undefined
        }

        /* If the visualizer is currently being displayed, we reset the display
         * by stopping the visualizer, re-inhabiting the element, and showing
         * it again. In other words, a hard reset. If a visualizer wishes to
         * have any of its internal state be reset during a hard reset event,
         * it should override this function.
         */
        reset() {
            if (!this._sketch) return
            const element = this.within!
            this.stop()
            this.depart(element)
            this.inhabit(element, this._size)
            this.show()
        }
    }

    return P5Visualizer as unknown as new (
        seq: SequenceInterface<GenericParamDescription>
    ) => InstanceType<typeof P5Visualizer> & ParamValues<PD>
}
