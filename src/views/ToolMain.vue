<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-2">
                <SequenceMenu
                  v-bind:sequences="sequences"
                  v-bind:activeSeq="activeSeq"
                  v-on:createSeq="setActiveSeq($event)"
                />
                <VizualizationMenu 
                  v-bind:vizualizers="vizualizers"
                  v-bind:activeViz="activeViz" 
                  v-on:createViz="setActiveViz($event)"
                />
            </div>
            <div class="col-sm-10">
                <BundleManager
                  v-bind:activeViz="activeViz"
                  v-bind:activeSeq="activeSeq"
                  v-bind:bundles="seqVizPairs"
                  v-on:createBundle="bundleSeqVizPair()"
                />
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
import BundleManager from '@/components/BundleManager.vue';
import VIZUALIZERS from '@/vizualizers/vizualizers';
import SEQUENCES from '@/sequences/sequences';


export default {
  name: 'ToolMain',
  components: {
    VizualizationMenu,
    SequenceMenu,
    CanvasArea,
    BundleManager
  },
  methods: {
    setActiveViz: function(newViz){
      this.activeViz = newViz
    },
    setActiveSeq: function(newSeq){
        this.activeSeq = newSeq;
    },
    bundleSeqVizPair: function(){
        const bundle = {
            seq: this.activeSeq,
            viz: this.activeViz
        }
        this.seqVizPairs.push(bundle);
        this.activeSeq = {};
        this.activeViz = {};
        console.log(this.seqVizPairs);
    }
  },
  data: function(){
    const vizualizers = []
    const sequences = []
    // We are grooming the raw VIZUALIZERS and SEQUENCES module into something
    // we can use by looking for only modules that have an 
    // export module (ie, aren't utility files)
    for (const vizKey in VIZUALIZERS){
      const theModule = VIZUALIZERS[vizKey]
      if(theModule.exportModule){
        vizualizers.push(theModule.exportModule);
      }
    }
    for (const seqKey in SEQUENCES){
      const theModule = SEQUENCES[seqKey]
      if(theModule.exportModule){
        sequences.push(theModule.exportModule);
      }
    }
    const state = {
      vizualizers: vizualizers,
      sequences: sequences,
      seqVizPairs: [],
      activeViz: {},
      activeSeq: {}
    }
    return state
  }
}
</script>

<style>
</style>
