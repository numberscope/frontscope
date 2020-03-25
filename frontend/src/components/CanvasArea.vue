<template>
    <div id="canvas-container">
        <button v-on:click="draw">Draw an Ellipse</button>
        <div id="p5-goes-here"></div>
    </div>
</template>

<script>
import p5 from '../assets/p5.min.js'
import Scope from '../global/ScopeState.js'

export default {
    methods:{
        draw: function(){
            console.log('Drawing with', Scope.state.activeViz);
            console.log('sequence', Scope.state.activeSeq);
            var sequence = new Scope.sequence.SequenceNaturals(1, false);
            sequence.initialize();

            let activeVizName = Scope.state.activeViz;
            var activeTool = Scope.modules[activeVizName];

            var drawing = new p5(function(sketch){

                var visualizer = new activeTool.viz(sequence, sketch, {
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
