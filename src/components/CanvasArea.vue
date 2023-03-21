<template>
    <div id="canvas-container" class="row">
        <div class="col-sm-2">
            <div class="list-group">
                <StopDrawingButton v-on:stopDrawing="closeCanvas()" />
            </div>
        </div>
        <div class="col-sm-10">
            <div id="p5-goes-here"></div>
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
                this.drawing.noLoop()
                this.$emit('closeCanvas')
            },
        },
        mounted: function (): void {
            const activeSeq = this.activeSeq
            activeSeq.initialize()
            const activeViz = this.activeViz
            activeViz.initialize(this.activeViz.sketch, activeSeq)
            activeViz.setup()
            activeViz.draw()
        },
        data: function () {
            return {drawing: {} as p5} // To get correct type
        },
    })
</script>

<style scoped></style>
