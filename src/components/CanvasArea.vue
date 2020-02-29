<template>
    <div id="canvas-container">
        <button v-on:click="listModules">Draw</button>
        <button v-on:click="draw">Draw</button>
        <div id="p5-goes-here"></div>
    </div>
</template>

<script>
import p5 from '../assets/p5.min.js'
import MODULES from '../modules/modules.js'

export default {
    methods:{
        listModules: function() {
            console.log(MODULES);
        },
        draw: function(){
            var drawing = new p5(function(sketch){
                sketch.setup = function(){
                    sketch.createCanvas(200,200);
                    sketch.background("white");
                }
                sketch.draw = function(){
                  sketch.ellipse(50, 50, 80, 80);
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
