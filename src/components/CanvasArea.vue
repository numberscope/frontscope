<template>
    <div id="canvas-container">
        <div v-if="activeSeq.name === undefined" class="alert alert-warning">Select a sequence</div>
        <div v-if="activeViz.name === undefined" class="alert alert-warning">Select a vizualizer</div>
        <div v-if="activeViz.name !== undefined || activeSeq.name !== undefined" class="alert alert-primary">
            <div v-if="activeSeq.name !== undefined">Active sequence: {{activeSeq.name}}</div>
            <div v-if="activeViz.name !== undefined">Active vizualizer: {{activeViz.name}}</div>
        </div>
        <button v-if="readyToDraw" type="button" class="btn btn-warning" v-on:click="draw">Draw</button>
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
    methods:{
        draw: function(){
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
        }
    },
    computed: {
        readyToDraw: function() {
            return this.activeSeq.name !== undefined && this.activeViz.name !== undefined;
        }
    }
}
</script>

<style>
</style>
