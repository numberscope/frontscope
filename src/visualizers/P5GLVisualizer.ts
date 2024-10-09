import p5 from 'p5'
import * as brush from 'p5.brush'

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

        // Have to reassign name as category because of JavaScript default
        // initialization order rules
        constructor(seq: SequenceInterface) {
            super(seq)
            this.name = this.category
        }

        // Just like P5Visualizer, but also initialize the brush interface
        _initializeSketch(): (sketch: p5) => void {
            const superInit = super._initializeSketch()
            return sketch => {
                superInit(sketch)
                brush.instance(sketch)
            }
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
            this.camera = this.sketch.createCamera()
            brush.load()
        }

        // Provide default camera controls: left drag pans, mouse wheel zooms
        mouseDragged() {
            const sketch = this.sketch
            if (this.camera && sketch.mouseButton === 'left') {
                this.camera.move(-sketch.movedX, -sketch.movedY, 0)
                this.continue()
            }
        }

        mouseWheel(event: WheelEvent) {
            if (this.camera) {
                this.camera.move(0, 0, event.deltaY)
                this.continue()
            }
        }
    }

    type P5GLVisInstance = InstanceType<typeof P5GLVisualizer>
    return P5GLVisualizer as unknown as new (
        seq: SequenceInterface
    ) => P5GLVisInstance & P5VizInterface & ParamValues<PD>
}
