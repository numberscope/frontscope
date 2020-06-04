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

            const activeTool = this.activeViz;
            const drawing = new p5(function(sketch){
                    const visualizer = new activeTool.viz(activeSeq, sketch, {
                        domain: [1,2,3,4,5],
                        range: [10,20,30,40,50],
                        stepSize: 20,
                        strokeWeight: 5,
                        startingX: 0,
                        startingY: 0,
                        bgColor: "#666666",
                        strokeColor: '#ff0000',
                    });

                    sketch.setup = function(){
                        sketch.createCanvas(200, 200);
                        sketch.background("white");
                        visualizer.setup();
                    }

                    sketch.draw = function(){
                    visualizer.draw();
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
