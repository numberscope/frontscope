<template>
  <div>
    <ul class="list-group">
        <SeqSelector
            v-for="seq in sequences"
            v-bind:title="seq.name"
            v-bind:key="seq.id"
            v-on:set-active-viz="$emit('set-active-seq', seq)"
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
    visualizers: Object,
    sequences: Object,
    activeViz: Object,
    activeSeq: Object
  },
  components: {
    SeqSelector,
    //VizualizationSettingsPane
  },
  methods: {
    setActive: function(active) {
        console.log(active);
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
