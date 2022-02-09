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
    import Vue from 'vue'
    import p5 from 'p5'
    import StopDrawingButton from '@/components/StopDrawingButton.vue'

    export default Vue.extend({
        name: 'CanvasArea',
        components: {
            StopDrawingButton,
        },
        props: {
            activeSeq: Object,
            activeViz: Object,
        },
        methods: {
            closeCanvas: function (): void {
                this.drawing.noLoop()
                this.$emit('closeCanvas')
            },
        },
        mounted: function (): void {
            console.log('Drawing with Visualizer: ', this.activeViz.name)
            console.log('Drawing with Sequence', this.activeSeq.name)

            // params here are ID and finite
            const activeSeq = this.activeSeq
            activeSeq.initialize()

            const activeViz = this.activeViz

            this.drawing = new p5(function (sketch) {
                activeViz.initialize(sketch, activeSeq)

                sketch.setup = function () {
                    sketch.createCanvas(800, 800)
                    sketch.background('white')
                    activeViz.setup()
                }

                sketch.draw = function () {
                    activeViz.draw()
                }
            }, document.getElementById('p5-goes-here') as HTMLElement)

            this.drawing.setup()
            this.drawing.draw()
        },
        data: function () {
            return {drawing: {} as p5} // To get correct type
        },
    })
</script>

<style scoped></style>
