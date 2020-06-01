<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-2">
                <SequenceMenu
                  v-bind:sequences="sequences"
                  v-bind:activeSeq="activeSeq"
                  v-on:set-active-seq="setActiveSeq($event)"
                />
                <VizualizationMenu 
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

import VizualizationMenu from '@/components/VizualizationMenu.vue';
import SequenceMenu from '@/components/SequenceMenu.vue';
import CanvasArea from '@/components/CanvasArea.vue';
import MODULES from '@/modules/modules.js';
import SEQUENCES from '@/sequences/sequences';

console.log(SEQUENCES)

export default {
  name: 'ToolMain',
  components: {
    VizualizationMenu,
    SequenceMenu,
    CanvasArea,
  },
  methods: {
    setActiveViz: function(newViz){
      this.activeViz = newViz
      console.log(this.activeViz);
    },
    createSeq: function(seq){
        console.log('creating a new sequence', seq);
    },
    setActiveSeq: function(newSeq){
        this.activeSeq = newSeq;
        console.log("The active sequence is now", newSeq.name);
    }
  },
  data: function(){
    const sequences = []
    // We are grooming the raw SEQUENCES module into something
    // we can use by looking for only sequences that have an 
    // export module (ie, aren't utility files)
    for (const seqKey in SEQUENCES){
      const theModule = SEQUENCES[seqKey]
      if(theModule.exportModule){
        console.log(theModule.exportModule);
        sequences.push(theModule.exportModule);
      }
    }
    const state = {
      visualizers: MODULES,
      sequences: sequences,
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
