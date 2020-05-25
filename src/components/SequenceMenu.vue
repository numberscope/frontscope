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
    <SequenceParamsModal v-on:create-seq="$emit('create-seq', seq)" >
        <p>Hey</p>
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
  name: 'ToolMenu',
  props: {
    sequences: Array,
    activeViz: Object,
    activeSeq: Object
  },
  components: {
    SeqSelector,
    SequenceParamsModal
  },
  methods: {
    setParams: function(seq) {
               const liveSequence = new seq.sequence(1, false);
               console.log(liveSequence);
               console.log(liveSequence.sequenceParams);
              this.$modal.show('seq-params-modal', { params : liveSequence.sequenceParams});
    }
  },
  data: function(){
    return {
    } 
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
