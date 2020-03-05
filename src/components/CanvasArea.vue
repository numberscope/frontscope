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
            console.log('sequence', Scope.sequences.default);
            var sequence = Scope.sequences.default.BuiltInSeqs.Naturals;
            var activeTool = Scope.state.activeViz;
            console.log('active visualizer', activeTool)
            var drawing = new p5(function(sketch){
                var visualizer = new activeTool.viz(sequence, sketch, {});
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
