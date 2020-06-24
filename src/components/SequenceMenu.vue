<template>

  <div class="mb-3">
    <h2>Sequences</h2>
    <ul class="list-group">
        <SeqSelector
            v-for="seq in sequences"
            v-bind:title="seq.name"
            v-bind:key="seq.id"
            v-on:set-seq-params="setParams(seq)"
            >
            </SeqSelector>
    </ul>
    <SeqVizParamsModal 
        v-if="showModal"
        v-bind:params="liveSequence.params"
        v-on:closeModal="closeParamsModal"
        v-on:submitParams="createSeq" >
    </SeqVizParamsModal>
  </div>
</template>

<script>
import SeqSelector from '@/components/SeqSelector.vue'
import SeqVizParamsModal from '@/components/SeqVizParamsModal.vue'
//import VizualizationSettingsPane from '@/components/SequenceSettingsPane.vue'

export default {
  name: 'SequenceMenu',
  props: {
    sequences: Array,
    activeViz: Object,
    activeSeq: Object,
  },
  components: {
    SeqSelector,
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
              this.liveSequence = new seq.sequence(1, false);
              this.openParamsModal();  
    },
    createSeq: function() {
      this.closeParamsModal();
      this.$emit("createSeq", this.liveSequence);
    }
  },
  data: function(){
      return {
        showModal: false,
        liveSequence: { paramsSchema: []}
      }
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
