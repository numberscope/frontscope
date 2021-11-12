<template>
    <div class="container-fluid">
        <div class="row" v-if="drawingActive" >
          <div class="col-sm-12">
                <CanvasArea 
                  v-bind:activeViz="activeViz" 
                  v-bind:activeSeq="activeSeq"
                  v-on:closeCanvas="closeCanvas()"
                />
            </div>
        </div>
        <div class="row" v-if="!drawingActive">
            <div class="col-sm-2">
                <SequenceMenu
                  v-bind:sequences="sequences"
                  v-bind:activeSeq="activeSeq"
                  v-on:createSeq="setActiveSeq($event)"
                  v-on:addOeisSeq="addOeisSeq($event)"
                />
                <VizualizationMenu 
                  v-bind:visualizers="visualizers"
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
                  v-on:drawBundle="drawBundle($event)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import VizualizationMenu from '@/components/VizualizationMenu.vue';
import SequenceMenu from '@/components/SequenceMenu.vue';
import CanvasArea from '@/components/CanvasArea.vue';
import BundleManager from '@/components/BundleManager.vue';
import visualizerS from '@/visualizers/visualizers';
import SEQUENCES from '@/sequences/sequences';
import { SequenceInterface,
         SequenceExportModule } from '@/sequences/SequenceInterface';
import { VisualizerInterface  } from '@/visualizers/VisualizerInterface';

export default Vue.extend({
  name: 'ToolMain',
  components: {
    VizualizationMenu,
    SequenceMenu,
    CanvasArea,
    BundleManager
  },
  methods: {
    setActiveViz: function(newViz: VisualizerInterface) {
      this.activeViz = newViz
    },
    setActiveSeq: function(newSeq: SequenceInterface) {
        this.activeSeq = newSeq;
    },
    addOeisSeq: function(newOeisSeq: SequenceInterface) {
      const seqBundle = new SequenceExportModule(
        newOeisSeq,
        newOeisSeq.name,
        true
      )
      this.sequences.push(seqBundle);
      this.setActiveSeq(newOeisSeq);
    },
    bundleSeqVizPair: function() {
        const bundle = {
            seq: this.activeSeq,
            viz: this.activeViz
        }
        this.seqVizPairs.push(bundle);
        this.clearActive();
    },
    drawBundle: function(seqVizBundle: {seq:SequenceInterface;
                                        viz:VisualizerInterface}) {
      console.log(seqVizBundle)
      this.activeSeq = seqVizBundle.seq;
      this.activeViz = seqVizBundle.viz;
      this.drawingActive = true;
    },
    closeCanvas: function() {
      this.clearActive();
      this.drawingActive = false;
    },
    clearActive: function() {
      this.activeViz = null;
      this.activeSeq = null;
    }
  },
  data: function(){
    const visualizers = []
    const sequences = []
    for (const vizKey in visualizerS){
        visualizers.push(visualizerS[vizKey]);
    }
    for (const seqKey in SEQUENCES){
        sequences.push(SEQUENCES[seqKey]);
    }
    const state = {
      visualizers: visualizers,
      sequences: sequences,
      seqVizPairs: ([] as {seq:SequenceInterface|null;   // Get the type correct
                           viz:VisualizerInterface|null}[]),
      activeViz: (null as VisualizerInterface|null),     // ditto
      activeSeq: (null as SequenceInterface|null),       // ditto
      drawingActive: false
    }
    return state
  }
})
</script>
