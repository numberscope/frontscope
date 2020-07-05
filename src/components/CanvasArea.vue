<template>
    <div id="canvas-container" class="row">
        <div class="col-sm-2">
            <div class="list-group">
                <a href="#" v-on:click="$emit('closeCanvas')" aria-label="Back" class="list-group-item list-group-item-action">
                    &#8249; Back
                </a>
            </div>
        </div>
        <div class="col-sm-10">
            <div id="p5-goes-here"></div>
        </div>
    </div>
</template>


<script>
import p5 from '@/assets/p5.min.js'

export default {
    props: {
        activeSeq: Object,
        activeViz: Object
    },
    mounted: function(){
        console.log('Drawing with Visualizer: ', this.activeViz.name);
        console.log('Drawing with Sequence', this.activeSeq.name);

        // params here are ID and finite
        const activeSeq = this.activeSeq;
        activeSeq.initialize();

        const activeViz = this.activeViz;
        console.log(activeViz);

        const drawing = new p5(function(sketch){
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

        drawing.setup();
        drawing.draw();

    },
}
</script>

<style scoped>
.back-btn {
    cursor: pointer;
}

</style>
