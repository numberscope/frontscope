import p5 from 'p5'
import {markRaw} from 'vue'

import {
    DrawingUnmounted,
    Drawing,
    DrawingStopped,
    nullSize,
} from './VisualizerInterface'
import type {
    DrawingState,
    ViewSize,
    VisualizerInterface,
} from './VisualizerInterface'

import type {SequenceInterface} from '@/sequences/SequenceInterface'
import {CachingError} from '@/shared/math'
import {Paramable} from '@/shared/Paramable'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {Specimen} from '@/shared/Specimen'

// Ugh, the gyrations we go through to keep TypeScript happy
// while only listing the p5 methods once:

class WithP5 extends Paramable {
    deviceMoved() {}
    deviceShaken() {}
    deviceTurned() {}
    doubleClicked(_event: MouseEvent) {}
    keyPressed(_event: KeyboardEvent) {}
    keyReleased(_event: KeyboardEvent) {}
    keyTyped(_event: KeyboardEvent) {}
    mouseClicked(_event: MouseEvent) {}
    mouseDragged(_event: MouseEvent) {}
    mouseMoved(_event: MouseEvent) {}
    mousePressed(_event: MouseEvent) {}
    mouseReleased() {}
    mouseWheel(_event: WheelEvent) {}
    touchEnded() {}
    touchMoved() {}
    touchStarted() {}
    windowResized() {}
    setup() {}
}

// The following is used to check if a visualizer has defined
// any of the above methods:
type P5Methods = Exclude<keyof WithP5, keyof Paramable>
const dummyWithP5 = new WithP5({})
const p5methods: P5Methods[] = Object.getOwnPropertyNames(
    Object.getPrototypeOf(dummyWithP5)
).filter(name => name != 'constructor') as P5Methods[]

/* A convenience HACK so that visualizer writers can initialize
    p5 color properties without a sketch. Don't try to draw with this!
    TODO: replace with a safe-to-use black or white, or at least an
    object that throws an understandable instead of cryptic error
    if p5 tries to draw with it, e.g.
    `Attempt for p5 to use INVALID_COLOR; please initialize your
    color from a sketch object.`
*/
export const INVALID_COLOR = {} as p5.Color

/* Flag to force a call to presketch in a reset() call: */
export const P5ForcePresketch = true

export interface P5VizInterface extends VisualizerInterface, WithP5 {
    _sketch?: p5
    _canvas?: p5.Renderer
    _framesRemaining: number
    size: ViewSize
    drawingState: DrawingState
    readonly sketch: p5
    readonly canvas: p5.Renderer
    seq: SequenceInterface
    _initializeSketch(): (sketch: p5) => void
    presketch(size: ViewSize): Promise<void>
    hatchRect(x: number, y: number, w: number, h: number): void
    reset(): Promise<void>
}

// Base class for implementing Visualizers that use p5.js
export function P5Visualizer<PD extends GenericParamDescription>(desc: PD) {
    const defaultObject = Object.fromEntries(
        Object.keys(desc).map(param => [param, desc[param].default])
    )
    const P5Visualizer = class extends WithP5 implements P5VizInterface {
        name = 'uninitialized P5-based visualizer'
        _sketch?: p5
        _canvas?: p5.Renderer
        _framesRemaining = Infinity
        size = nullSize
        drawingState: DrawingState = DrawingUnmounted

        within?: HTMLElement
        usesGL() {
            return false
        }
        get sketch(): p5 {
            if (this._sketch === undefined) {
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
        seq: SequenceInterface

        /***
         * Create a P5-based visualizer
         * @param seq SequenceInterface  The initial sequence to draw
         */
        constructor(seq: SequenceInterface) {
            super(desc)
            this.name = this.category // Not currently using per-instance names
            this.seq = seq
            Object.assign(this, defaultObject)
        }

        /***
         * Supplies the argument to the p5 constructor that initializes a
         * new sketch object, supplying its methods, etc. That is to say,
         * the arrow function this method returns will simply be passed to
         * `new p5(__, element)` when the visualizer `inhabit`s an element.
         *
         * @returns {(sketch: p5) => void}  The sketch initializer function
         */
        _initializeSketch(): (sketch: p5) => void {
            return sketch => {
                // The following assignment is necessary even though it
                // may seem a bit redundant with the assignment in inhabit()
                // below -- that's because this.sketch is often used in
                // setup(). Also, the call to markRaw is needed so that Vue's
                // reactivity API does not alter behavior inside of p5 (and
                // I don't think we need Vue to re-render when a sketch
                // changes anyway; the sketch does that itself).
                this._sketch = markRaw(sketch)

                // Now, a little bit of gymnastics to set all of the p5 methods
                // in the sketch that exist on the Visualizer. Since TypeScript
                // seems to require that they be methods in this base class,
                // I couldn't find a way to arrange the code so that the below
                // could be simplified to just check whether or not
                // `this[method]` is defined or undefined:
                for (const method of p5methods) {
                    const definition = this[method]
                    if (definition !== dummyWithP5[method]) {
                        if (
                            method === 'mousePressed'
                            || method === 'mouseClicked'
                            || method === 'mouseWheel'
                        ) {
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
                        if (
                            method === 'keyPressed'
                            || method === 'keyReleased'
                            || method === 'keyTyped'
                        ) {
                            sketch[method] = (event: KeyboardEvent) => {
                                const active = document.activeElement
                                if (active && active.tagName === 'INPUT') {
                                    return true
                                }
                                return this[method](event)
                            }
                            continue
                        }
                        // Otherwise no special condition, just forward event
                        sketch[method] = definition.bind(this) as () => void
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
                            // TODO: This throw is typically going to go
                            // uncaught (because there is a try..finally
                            // block in p5.js with no catch) and so
                            // just result in a console error message.
                            // Should we pop up an alert message?
                            throw e
                        }
                    }
                    if (this.within) {
                        sketch.cursor(
                            getComputedStyle(this.within).cursor || 'default'
                        )
                    }
                }
            }
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
                // Only do the presketch initialization if the size has
                // changed, though:
                needsPresketch =
                    size.width !== this.size.width
                    || size.height !== this.size.height
            }
            this.size = size
            this.within = element
            // Perform any necessary asynchronous preparation before
            // creating sketch. For example, some Visualizers need sequence
            // factorizations in setup().
            if (needsPresketch) await this.presketch(size)
            // TODO: Can presketch() sometimes take so long that we should
            // show an hourglass icon in the meantime, or something like that?

            // Now we can create the sketch
            this._sketch = new p5(this._initializeSketch(), element)
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
        async view(seq: SequenceInterface) {
            this.seq = seq
            await seq.fill()
            this.validationStatus = this.checkParameters(
                this as unknown as ParamValues<GenericParamDescription>
            )
            if (this.validationStatus.isValid()) this.reset(P5ForcePresketch)
        }

        /**
         * Display the visualizer within the element that it is inhabiting.
         * All it has to do is call draw, since p5 calls setup for us.
         */
        show(): void {
            // If not inhabiting an element, do nothing
            if (!this._sketch) return
            // In the event that the rendering context isn't ready, this value
            // represents how long in milliseconds we should wait before trying
            // again
            const displayTimeout = 5

            if (this._canvas) {
                this.drawingState = Drawing
                this._sketch.loop()
                this._sketch.draw()
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
                .createCanvas(this.size.width, this.size.height)
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
         * Utility for drawing a hatched rectangle. Takes the same arguments
         * as p5 `rect()` in mode CORNER. Does nothing if there is no sketch.
         * @param {number} x  coordinate of corner
         * @param {number} y  coordinate of corner
         * @param {number} w  width of rectangle
         * @param {number} h  height of rectangle
         */
        hatchRect(x: number, y: number, w: number, h: number): void {
            const sketch = this.sketch
            if (!sketch) return
            sketch.push()
            sketch.rectMode(sketch.CORNER)
            sketch.rect(x, y, w, h)
            const xdir = Math.sign(w)
            w = w * xdir
            const ydir = Math.sign(h)
            h = h * ydir
            const dist = w + h
            const step = 12
            for (let place = step; place < dist; place += step) {
                const sx = x + xdir * Math.min(place, w)
                const sy = y + ydir * Math.max(0, place - w)
                const ex = x + xdir * Math.max(0, place - h)
                const ey = y + ydir * Math.min(place, h)
                sketch.line(sx, sy, ex, ey)
            }
            sketch.pop()
        }

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

        async parametersChanged(names: Set<string>) {
            await super.parametersChanged(names)
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
         * @param {boolean} forcePresketch
         *     if true, ensures presketch initialization will also be redone;
         *     defaults to false. Call with constant P5ForcePresketch for
         *     readability of calling code.
         */
        async reset(forcePresketch: boolean = false) {
            console.log('Forcing', forcePresketch)
            if (!this._sketch) return
            const element = this.within!
            this.stop()
            if (forcePresketch) this.depart(element)
            let size = this.size
            if (this.within) {
                size = Specimen.calculateSize(
                    {
                        width: element.clientWidth,
                        height: element.clientHeight,
                    },
                    this.requestedAspectRatio()
                )
            }
            await this.inhabit(element, size)
            this.show()
        }
    }

    type P5VisInstance = InstanceType<typeof P5Visualizer>
    return P5Visualizer as unknown as new (
        seq: SequenceInterface
    ) => P5VisInstance & P5VizInterface & ParamValues<PD>
}
