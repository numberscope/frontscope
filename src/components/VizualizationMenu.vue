<template>
  <div>
    <h2>Visualizers</h2>
    <ul class="list-group">
        <ToolSelector
            v-for="viz in visualizers"
            v-bind:title="viz.name"
            v-bind:key="viz.id"
            v-on:set-active-viz="$emit('set-active-viz', viz)"
            >
            </ToolSelector>
    </ul>
    <div v-if="activeViz">
      <VizualizationSettingsPane
        v-bind:vizParams="activeViz.params">
      </VizualizationSettingsPane>
    </div>
  </div>
</template>

<script>
import ToolSelector from '@/components/ToolSelector.vue'
import VizualizationSettingsPane from '@/components/VizualizationSettingsPane.vue'

export default {
  name: 'ToolMenu',
  props: {
    visualizers: Object,
    sequences: Object,
    activeViz: Object,
    activeSeq: Object
  },
  components: {
    ToolSelector,
    VizualizationSettingsPane
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
