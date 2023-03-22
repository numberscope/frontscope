<template>
    <div id="canvas-container" class="row">
        <div class="col-sm-2">
            <div class="list-group">
                <StopDrawingButton v-on:stopDrawing="closeCanvas()" />
            </div>
        </div>
        <div class="col-sm-10">
            <div id="canvasContainer"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'
    import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
    import type {SequenceInterface} from '../sequences/SequenceInterface'
    import type p5 from 'p5'
    import StopDrawingButton from './StopDrawingButton.vue'
    export default defineComponent({
        name: 'CanvasArea',
        components: {
            StopDrawingButton,
        },
        props: {
            activeSeq: {
                type: Object as PropType<SequenceInterface>,
                required: true,
            },
            activeViz: {
                type: Object as PropType<VisualizerInterface>,
                required: true,
            },
        },
        methods: {
            closeCanvas: function (): void {
                this.$emit('closeCanvas')
            },
        },
        mounted: function (): void {
            const canvasContainer = document.getElementById(
                'canvasContainer'
            ) as HTMLElement
            this.activeSeq.initialize()
            this.activeViz.initialize(
                canvasContainer,
                this.activeSeq,
                canvasContainer.offsetWidth,
                canvasContainer.offsetHeight
            )

            // These two methods are (presumably) only needed by p5
            // visualizers.
            this.activeViz.setup()
            this.activeViz.draw()
        },
        data: function () {
            return {drawing: {} as p5} // To get correct type
        },
    })
</script>

<style scoped>
    #canvasContainer {
        width: 800px;
        height: 800px;
    }
</style>
