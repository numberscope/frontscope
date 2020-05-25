<template>
  <div>
    <h2>Sequences</h2>
    <ul class="list-group">
        <SeqSelector
            v-for="seq in sequences"
            v-bind:title="seq.name"
            v-bind:key="seq.id"
            v-on:set-active-seq="$emit('set-active-seq', seq)"
            >
            </SeqSelector>
    </ul>
    <!--/*
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
