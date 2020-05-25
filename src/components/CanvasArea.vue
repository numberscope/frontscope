<template>
    <div id="canvas-container">
        <button type="button" class="btn btn-warning" v-on:click="draw">Draw</button>
        <div id="p5-goes-here"></div>
    </div>
</template>


<script>
import p5 from '@/assets/p5.min.js'
import { SequenceParamsSchema } from '@/sequences/sequenceInterface'

export default {
    props: {
        activeSeq: Object,
        activeViz: Object
    },
    methods:{
        draw: function(){
            console.log(SequenceParamsSchema);
            console.log('Drawing with Visualizer: ', this.activeViz.name);
            console.log('Drawing with Sequence', this.activeSeq.name);

            // params here are ID and finite
            const sequence = new this.activeSeq.sequence(1, false);
            sequence.initialize(
            [
                new SequenceParamsSchema(
                'constantValue',
                'number',
                'Constant Value',
                '1'
                )    
            ]
            );

            const activeTool = this.activeViz;

            const drawing = new p5(function(sketch){

                    const visualizer = new activeTool.viz(sequence, sketch, {
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
    }
}
</script>

<style>
</style>
