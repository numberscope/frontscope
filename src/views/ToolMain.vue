<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-2">
                <ToolMenu 
                  v-bind:visualizers="visualizers"
                  v-bind:sequences="sequences"
                  v-bind:activeViz="activeViz" 
                  v-bind:activeSeq="activeSeq"
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
import CanvasArea from '@/components/CanvasArea.vue'
import MODULES from '@/modules/modules.js';
import SEQUENCES from '@/sequences/sequences.js';

export default {
  name: 'App',
  components: {
    ToolMenu,
    CanvasArea
  },
  methods: {
    setActiveViz: function(newViz){
      this.activeViz = newViz
      console.log(this.sequences)
      const test = new this.sequences.sequenceGetter.SequenceGetter();
      test.initialize();
      console.log(this.sequences.sequenceNaturals.SequenceNaturals)
      this.activeSeq = this.sequences.sequenceNaturals
      console.log(this.activeViz)
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
