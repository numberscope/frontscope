<template>
  <div class="mb-3">
    <h2>Sequences</h2>
    <ul class="list-group">
        <SeqSelector
            v-for="seq in sequences"
            v-bind:title="seq.name"
            v-bind:isOeis="seq.isOeis"
            v-bind:key="seq.id"
            v-on:set-seq-params="setParams(seq)"
            v-on:stage-oeis-seq="createSeq(true, seq)"
            >
            </SeqSelector>
        <hr>
        <SeqGetter v-on:load-seq="loadSeq"></SeqGetter>
    </ul>
    <SeqVizParamsModal 
        v-if="showModal"
        v-bind:params="liveSequence.params"
        v-bind:errors="errors"
        v-bind:loading-oeis="loadingOeis"
        v-on:closeModal="closeParamsModal"
        v-on:submitParams="createSeq"
        v-on:submitOeisParams="createOeisSeq">
    </SeqVizParamsModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import SeqSelector from '@/components/SeqSelector.vue'
import SeqGetter from '@/components/SeqGetter.vue'
import SeqVizParamsModal from '@/components/SeqVizParamsModal.vue'
import OEISSequenceTemplate from '@/sequences/OEISSequenceTemplate.ts'
import { SequenceInterface, SequenceConstructor, SequenceExportModule } from '@/sequences/SequenceInterface.ts'
import { SequenceClassDefault } from '@/sequences/SequenceClassDefault.ts'

export default Vue.extend({
  name: 'SequenceMenu',
  props: {
    sequences: Array,
    activeViz: Object,
    activeSeq: Object,
  },
  components: {
    SeqSelector,
    SeqGetter,
    SeqVizParamsModal
  },
  methods: {
    openParamsModal: function() {
        this.showModal = true;
    },
    closeParamsModal: function() {
        this.showModal = false;
    },
    setParams: function(seq: SequenceExportModule) {
      if (seq.isOeis) {
        this.$emit("createSeq", this.liveSequence);
      } else {
        const constructor = (seq.constructorOrSequence as SequenceConstructor);
        this.liveSequence = new constructor(this.sequences.length);
        this.openParamsModal();
      }
    },
    loadSeq: function() {
      this.liveSequence = new OEISSequenceTemplate(this.sequences.length);
      this.loadingOeis = true;
      this.openParamsModal();
    },
    createSeq: function(oeis: boolean, activeSeq: SequenceExportModule) {
      console.log(activeSeq)
      if (oeis) {
          // OEIS sequences are not constructed
          this.liveSequence =
              (activeSeq.constructorOrSequence as SequenceInterface);
      }
      const validationResult = this.liveSequence.validate();
      if(validationResult.isValid){
        this.errors = [];
        this.closeParamsModal();
        this.liveSequence.initialize();
        this.$emit("createSeq", this.liveSequence);
      } else {
        this.errors = validationResult.errors;
      }
    },
    createOeisSeq: function() {
      const validationResult = this.liveSequence.validate();
      if(validationResult.isValid){
        this.errors = [];
        this.closeParamsModal();
        this.liveSequence.initialize();
        this.loadingOeis = false;
        this.$emit("addOeisSeq", this.liveSequence);
      } else {
        this.errors = validationResult.errors;
      }
    }
  },
  data: function(){
      return {
        showModal: false,
        liveSequence: ((new SequenceClassDefault(0)) as SequenceInterface),
        loadingOeis: false,
        errors: ([] as string[])
      }
  }
})
</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
