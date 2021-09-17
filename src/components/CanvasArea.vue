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

<script>
import p5 from '@/assets/p5.min.js'
import StopDrawingButton from '@/components/StopDrawingButton.vue';

export default {
    name: 'CanvasArea',
    components: {
        StopDrawingButton
    },
    props: {
        activeSeq: Object,
        activeViz: Object
    },
    methods: {
        closeCanvas: function() {
            this.drawing.noLoop();
            this.$emit('closeCanvas');
        }
    },
    mounted: function(){
        console.log('Drawing with Visualizer: ', this.activeViz.name);
        console.log('Drawing with Sequence', this.activeSeq.name);

        // params here are ID and finite
        const activeSeq = this.activeSeq;
        activeSeq.initialize();

        const activeViz = this.activeViz;

        this.drawing = new p5(function(sketch){
                activeViz.initialize(sketch, activeSeq);

                sketch.setup = function(){
                    sketch.createCanvas(800, 800);
                    sketch.background("white");
                    activeViz.setup();
                }

                sketch.draw = function(){
                    activeViz.draw();
                }

}, 'p5-goes-here');

        this.drawing.setup();
        this.drawing.draw();

    },
    data: function() {
        const drawing = {};
        return drawing;
    }
}
</script>

<style scoped>
</style>