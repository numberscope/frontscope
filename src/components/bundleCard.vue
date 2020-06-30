<template>
<div class="col-4-sm">
    <div class="card" style="width: 18rem;">
      <!--<img class="card-img-top" src=".../100px180/" alt="Card image cap">-->
      <div class="card-body">
        <h5 class="card-title">{{seq.name + ' + ' + viz.name}}</h5>
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <div :id="this.uid"></div>
        <a  href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
</div>
</template>

<script>
import p5 from '@/assets/p5.min.js'

export default {
    name: 'BundleCard',
    mounted: function(){
        const seq = this.seq;
        const viz = this.viz;
        const thumb = new p5(function(sketch){
            viz.initialize(sketch, seq);

            sketch.setup = function(){
                sketch.createCanvas(200, 200);
                sketch.background("white");
                viz.setup();
            }

            sketch.draw = function(){
                viz.draw();
                if(sketch.frameCount >= 50){
                    sketch.noLoop();
                }
            }

        }, this.uid);
        thumb.setup();
        thumb.draw();
        setTimeout(function(){thumb.noLoop()}, 1000)
    },
    methods : { },
    props: {
        seq: Object,
        viz: Object
        }
    }
</script>

<style scoped>
    .card{
        margin: 1em;
        min-height: 250px;
    }
</style>
