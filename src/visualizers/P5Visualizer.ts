import p5 from 'p5'

import {
    DrawingUnmounted,
    Drawing,
    DrawingStopped,
    nullSize,
} from './VisualizerInterface'
import type {VisualizerInterface, ViewSize} from './VisualizerInterface'

import {CachingError} from '@/sequences/Cached'
import type {SequenceInterface} from '@/sequences/SequenceInterface'
import {Paramable} from '@/shared/Paramable'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'

// Ugh, the gyrations we go through to keep TypeScript happy
// while only listing the p5 methods once:

class WithP5<PD extends GenericParamDescription> extends Paramable<PD> {
    deviceMoved() {}
    deviceShaken() {}
    deviceTurned() {}
    doubleClicked() {}
    keyPressed(_event: KeyboardEvent) {}
    keyReleased(_event: KeyboardEvent) {}
    keyTyped(_event: KeyboardEvent) {}
    mouseClicked(_event: MouseEvent) {}
    mouseDragged() {}
    mouseMoved(_event: MouseEvent) {}
    mousePressed(_event: MouseEvent) {}
    mouseReleased() {}
    mouseWheel(_event: WheelEvent) {}
    setup() {}
    touchEnded() {}
    touchMoved() {}
    touchStarted() {}
    windowResized() {}
}

// The following is used to check if a visualizer has defined
// any of the above methods:
const dummyP5 = new WithP5<GenericParamDescription>({})
const ignoreOffCanvas = new Set([
    'mousePressed',
    'mouseClicked',
    'mouseWheel',
])
const ignoreFocusedElsewhere = new Set([
    'keyPressed',
    'keyReleased',
    'keyTyped',
])

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
        name = 'uninitialized P5-based visualizer'
        _sketch?: p5
        _canvas?: p5.Renderer
        _size = nullSize
        _framesRemaining = Infinity
        drawingState = DrawingUnmounted

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
            this.name = this.category // Not currently using per-instance names
            this.seq = seq
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
         * @param {HTMLElement} element
         *     Where the visualizer should inject itself
         * @param {ViewSize} size
         *     The width and height the visualizer should occupy
         */
        async inhabit(element: HTMLElement, size: ViewSize) {
            let needsPresketch = true
            if (this.within) {
                // oops, already inhabiting somewhere else; depart there
                this.depart(this.within)
                // Only do the presketch initialization once, though:
                needsPresketch = false
            }
            this._size = size
            this.within = element
            // Perform any necessary asynchronous preparation before
            // creating sketch. For example, some Visualizers need sequence
            // factorizations in setup().
            if (needsPresketch) await this.presketch(size)
            // TODO: Can presketch() sometimes take so long that we should
            // show an hourglass icon in the meantime, or something like that?

            // Now we can create the sketch
            this._sketch = new p5(sketch => {
                this._sketch = sketch // must assign here,  as setup is
                // called before the `new p5` returns; I think that makes
                // the outer (re-) assigning of that result to this._sketch
                // redundant, but I also think it makes this code a bit
                // clearer than if inhabit() simply calls `new p5(...)` and
                // discards the result, so I left that outer reassignment
                // there as well.

                // Now, a little bit of gymnastics to set all of the p5 methods
                // in the sketch that exist on the Visualizer. Since TypeScript
                // seems to require that they be methods in this base class,
                // I couldn't find a way to arrange the code so that the below
                // could be simplified to just check whether or not
                // `this[method]` is defined or undefined:
                for (const method of p5methods) {
                    const definition = this[method]
                    if (definition !== dummyP5[method]) {
                        if (ignoreOffCanvas.has(method)) {
                            sketch[method] = (event: MouseEvent) => {
                                if (!this.within) return true
                                // Check that the event position is in bounds
                                const rect =
                                    this.within.getBoundingClientRect()
                                const x = event.clientX
                                if (x < rect.left || x >= rect.right) {
                                    return true
                                }
                                const y = event.clientY
                                if (y < rect.top || y >= rect.bottom) {
                                    return true
                                }
                                // Check also that the event element is OK
                                const where = document.elementFromPoint(x, y)
                                if (!where) return true
                                if (
                                    where !== this.within
                                    && !where.contains(this.within)
                                ) {
                                    return true
                                }
                                return this[method](event as never)
                                // Cast makes typescript happy :-/
                            }
                            continue
                        }
                        if (ignoreFocusedElsewhere.has(method)) {
                            sketch[method] = (event: KeyboardEvent) => {
                                const active = document.activeElement
                                if (active && active.tagName === 'INPUT') {
                                    return true
                                }
                                return this[method](event as never)
                            }
                            continue
                        }
                        // Otherwise no special condition, just forward event
                        sketch[method] = definition.bind(this)
                    }
                }
                // And draw is special because of the error handling:
                sketch.draw = () => {
                    try {
                        this.draw()
                        if (--this._framesRemaining <= 0) {
                            this.stop(0)
                        }
                    } catch (e) {
                        if (e instanceof CachingError) {
                            sketch.cursor('progress')
                            return
                        } else {
                            throw e
                        }
                    }
                    sketch.cursor(
                        getComputedStyle(element).cursor || 'default'
                    )
                }
            }, element)
        }

        /**
         * Extend this default presketch() function if you have other
         * things that must happen asynchronously before a p5 visualizer
         * can create its sketch.
         */
        async presketch(_size: ViewSize) {
            await this.seq.fill()
        }

        /**
         * Change the sequence being shown by the visualizer
         * @param seq SequenceInterface  The sequence to show
         */
        async view(seq: SequenceInterface<GenericParamDescription>) {
            this.seq = seq
            if (!this._sketch) return
            const element = this.within!
            this.stop()
            this.depart(element) // ensures any sequence-dependent setup
            // that the visualizer might do in presketch will be redone
            await this.inhabit(element, this._size)
            this.show()
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

            if (this._canvas) {
                this.drawingState = Drawing
                this._sketch?.draw()
            } else {
                // If the rendering context is not yet ready, start an interval
                // that waits until the canvas is ready and shows when finished
                const interval = setInterval(() => {
                    if (this._canvas) {
                        clearInterval(interval)
                        this.drawingState = Drawing
                        this._sketch?.draw()
                    }
                }, displayTimeout)
            }
        }

        /**
         * Stop displaying the visualizer
         */
        stop(max: number = 0): void {
            if (max <= 0) {
                // hard stop now
                this.drawingState = DrawingStopped
                this._sketch?.noLoop()
            } else if (max < this._framesRemaining) {
                this._framesRemaining = max
            }
        }

        /**
         * Continue displaying the visualizer
         */
        continue(): void {
            this.drawingState = Drawing
            this._framesRemaining = Infinity
            this._sketch?.loop()
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
            this.drawingState = DrawingUnmounted
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

        async parameterChanged(_name: string) {
            await super.parameterChanged(_name)
            await this.reset()
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
        async reset() {
            if (!this._sketch) return
            const element = this.within!
            this.stop()
            await this.inhabit(element, this._size)
            this.show()
        }
    }

    return P5Visualizer as unknown as new (
        seq: SequenceInterface<GenericParamDescription>
    ) => InstanceType<typeof P5Visualizer> & ParamValues<PD>
}
