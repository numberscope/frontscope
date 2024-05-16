<template>
    <div id="canvas-container" class="row flexi">
        <div class="col-sm-2">
            <div class="list-group">
                <StopDrawingButton v-on:stopDrawing="closeCanvas()" />
            </div>
        </div>
        <div class="col-sm-10 propflex">
            <div id="visualizer-here" class="flexi"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'
    import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
    import type {SequenceInterface} from '../sequences/SequenceInterface'
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
                this.activeViz.stop()
                this.$emit('closeCanvas')
            },
        },
        mounted: function (): void {
            this.activeSeq.initialize()
            this.activeViz.view(this.activeSeq)
            this.activeViz.inhabit(
                document.getElementById('visualizer-here') as HTMLElement
            )
            this.activeViz.show()
        },
        beforeUnmount() {
            this.activeViz.depart(
                document.getElementById('visualizer-here') as HTMLElement
            )
        },
    })
</script>

<style scoped>
    .flexi {
        flex: 1;
    }
</style>
