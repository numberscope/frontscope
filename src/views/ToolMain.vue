<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-2">
                <SequenceMenu
                  v-bind:sequences="sequences"
                  v-bind:activeSeq="activeSeq"
                  v-on:set-active-viz="setActiveViz($event)"
                />
                <ToolMenu 
                  v-bind:visualizers="visualizers"
                  v-bind:activeViz="activeViz" 
                  v-on:set-active-viz="setActiveViz($event)"
                />
            </div>
            <div class="col-sm-10">
                <CanvasArea 
                  v-bind:activeViz="activeViz" 
                  v-bind:activeSeq="activeSeq"
                />
            </div>
        </div>
    </div>
</template>

<script>

import ToolMenu from '@/components/ToolMenu.vue'
import SequenceMenu from '@/components/SequenceMenu.vue'
import CanvasArea from '@/components/CanvasArea.vue'
import MODULES from '@/modules/modules.js';
import SEQUENCES from '@/sequences/sequences.js';

console.log(SEQUENCES)

export default {
  name: 'App',
  components: {
    ToolMenu,
    SequenceMenu,
    CanvasArea
  },
  methods: {
    setActiveViz: function(newViz){
      this.activeViz = newViz
      console.log(this.activeViz);
    },
    setActiveSeq: function(newSeq){
        console.log(newSeq);
    }
  },
  data: function(){
    var state = {
      visualizers: MODULES,
      sequences: SEQUENCES,
      activeViz: {},
      activeSeq: {}
    }
    return state
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
