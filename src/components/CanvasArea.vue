<template>
    <div id="canvas-container">
        <div id="p5-goes-here"></div>
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

<style>
</style>
