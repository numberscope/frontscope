import p5 from 'p5'
import {markRaw} from 'vue'

import {P5Visualizer} from './P5Visualizer'
import type {P5VizInterface} from './P5Visualizer'

import type {SequenceInterface} from '@/sequences/SequenceInterface'
import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'

// Base class for implementing Visualizers that use p5.js in WebGL mode

export function P5GLVisualizer<PD extends GenericParamDescription>(desc: PD) {
    const P5GLVisualizer = class extends (P5Visualizer<PD>(
        desc
    ) as unknown as new (
        seq: SequenceInterface
    ) => ReturnType<typeof P5Visualizer<PD>> & P5VizInterface) {
        name = 'uninitialized P5-based WebGL visualizer'
        camera: p5.Camera | undefined = undefined
        lastMX: number | undefined = undefined
        lastMY: number | undefined = undefined
        initialCameraZ = 800

        // Have to reassign name as category because of JavaScript default
        // initialization order rules
        constructor(seq: SequenceInterface) {
            super(seq)
            this.name = this.category
        }

        usesGL() {
            return true
        }

        // Just like P5Visualizer, but use WebGL renderer, load the brush,
        // and create a camera.
        // However we override rather than extend so there is only one call
        // to createCanvas.
        // Note that derived Visualizers _must_ call this first.
        setup() {
            this._canvas = this.sketch
                .background('white')
                .createCanvas(
                    this.size.width,
                    this.size.height,
                    this.sketch.WEBGL
                )
            this.camera = markRaw(this.sketch.createCamera())
            this.initialCameraZ = this.camera.eyeZ
        }

        // returns the coordinates and scaling of an absolute viewport position
        // vX, vY transformed into the plot-plane coordinates, as a
        // {pX: number, pY: number, scale: number} object:
        canvasToPlot(vX: number, vY: number) {
            const cameraXoff = this.camera?.eyeX ?? 0
            const cameraYoff = this.camera?.eyeY ?? 0
            const cameraZ = this.camera?.eyeZ ?? this.initialCameraZ
            const scale = cameraZ / this.initialCameraZ
            // Center of the field of view:
            const cX = this.sketch.width / 2 + cameraXoff
            const cY = this.sketch.height / 2 + cameraYoff
            // Translate of the viewport position:
            let pX = vX + cameraXoff
            let pY = vY + cameraYoff
            // Dilate from center:
            pX = (pX - cX) * scale + cX
            pY = (pY - cY) * scale + cY
            return {pX, pY, scale}
        }

        // returns the current mouse position in plot-plane coordinates, as a
        // {pX: number, pY: number, scale: number} object:
        mouseToPlot() {
            return this.canvasToPlot(this.sketch.mouseX, this.sketch.mouseY)
        }

        mousePressed() {
            // Remember where the mouse was pressed
            this.lastMX = this.sketch.mouseX
            this.lastMY = this.sketch.mouseY
            // And restart the animation in case there's a move
            this.continue()
        }

        mouseReleased() {
            // clear the mousepress info so we don't then respond to stray
            // clicks elsewhere on the screen
            this.lastMX = undefined
            this.lastMY = undefined
        }

        // Call this at the top of your draw() function to handle
        // left drag pan, right drag rotate.
        // NOTE: returns true if the camera moved
        handleDrags() {
            const sketch = this.sketch
            if (
                !sketch.mouseIsPressed
                || !this.camera
                || this.lastMX === undefined
                || this.lastMY === undefined
            ) {
                return false
            }
            const {pX: lX, pY: lY} = this.canvasToPlot(
                this.lastMX,
                this.lastMY
            )
            const {pX, pY} = this.mouseToPlot()
            this.lastMX = sketch.mouseX
            this.lastMY = sketch.mouseY
            if (sketch.mouseButton === 'left') {
                if (lX === pX && lY === pY) return false
                this.camera.move(lX - pX, lY - pY, 0)
                return true
            }
            if (sketch.mouseButton === 'right') {
                const rotateSpeed = 0.002
                if (lX === pX) return false
                // @ts-expect-error  The @types/p5 package omits roll
                this.camera.roll((lX - pX) * rotateSpeed)
                return true
            }
            return false
        }

        // Provides default mouse wheel behavior: zoom
        mouseWheel(event: WheelEvent) {
            if (this.camera) {
                let camMove = this.camera.eyeZ / 2
                if (event.deltaY < 0) camMove = (-camMove * 2) / 3
                this.camera.move(0, 0, camMove)
                // Make sure the clipping planes include the XY-plane
                const newZ = this.camera.eyeZ
                const defaultFOV = 2 * Math.atan(this.sketch.height / 2 / 800)
                const ar = this.sketch.width / this.sketch.height
                // @ts-expect-error  @types/p5 has wrong signature:
                this.camera.perspective(defaultFOV, ar, newZ - 1, newZ + 1)
                this.continue()
            }
        }
    }

    type P5GLVisInstance = InstanceType<typeof P5GLVisualizer>
    return P5GLVisualizer as unknown as new (
        seq: SequenceInterface
    ) => P5GLVisInstance & P5VizInterface & ParamValues<PD>
}
