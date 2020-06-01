<template>

  <div>
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
    <SequenceParamsModal 
        v-if="showModal"
        v-bind:params="liveSequence.paramsSchema"
        v-on:closeModal="closeParamsModal"
        v-on:createSeq="createSeq" >
    </SequenceParamsModal>
    <!--/*
    v-on:set-active-seq="$emit('set-active-seq', seq)"
    <div v-if="activeSeq">
      <SequenceSettingsPane
        v-bind:seqParams="activeSeq.params">
      </SequenceSettingsPane>
    </div>
    */-->
  </div>
</template>

<script>
import SeqSelector from '@/components/SeqSelector.vue'
import SequenceParamsModal from '@/components/SequenceParamsModal.vue'
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
    SequenceParamsModal
  },
  methods: {
    openParamsModal: function() {
        this.showModal = true;
    },
    closeParamsModal: function() {
        this.showModal = false;
    },
    setParams: function(seq) {
              console.log(seq);
              this.liveSequence = new seq.sequence(1, false);
              console.log(this.liveSequence);
              console.log(this.liveSequence.sequenceParams);
              this.openParamsModal();  
    },
    createSeq: function() {
      console.log("create seq");
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
