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

<script>
import SeqSelector from '@/components/SeqSelector.vue'
import SeqGetter from '@/components/SeqGetter.vue'
import SeqVizParamsModal from '@/components/SeqVizParamsModal.vue'
import OEISSequenceTemplate from '@/sequences/OEISSequenceTemplate.ts'

export default {
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
    setParams: function(seq) {
      if(seq.isOeis) {
        this.$emit("createSeq", this.liveSequence);
      } else {
        this.liveSequence = new seq.sequence(1, false);
        this.openParamsModal();
      }
    },
    loadSeq: function() {
      this.liveSequence = new OEISSequenceTemplate(1, false);
      this.loadingOeis = true;
      this.openParamsModal();
    },
    createSeq: function(oeis, activeSeq) {
      console.log(activeSeq)
      if(oeis) this.liveSequence = activeSeq.sequence; // OEIS sequences are not constructed
      const validationResult = this.liveSequence.validate();
      if(validationResult.isValid){
        this.errors = [];
        this.closeParamsModal();
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
        this.loadingOeis = false;
        this.liveSequence.populate();
        this.liveSequence.name = this.liveSequence.settings['name'];
        this.$emit("addOeisSeq", this.liveSequence);
      } else {
        this.errors = validationResult.errors;
      }
    }
  },
  data: function(){
      return {
        showModal: false,
        liveSequence: { paramsSchema: [], settings: {}},
        loadingOeis: false,
        errors: []
      }
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
