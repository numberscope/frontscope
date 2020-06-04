<template>
  <div>
    <h2>Visualizers</h2>
    <ul class="list-group">
        <ToolSelector
            v-for="viz in vizualizers"
            v-bind:title="viz.name"
            v-bind:key="viz.id"
            v-on:set-active-viz="$emit('set-active-viz', viz)"
            >
            </ToolSelector>
    </ul>
  </div>
</template>

<script>
import ToolSelector from '@/components/ToolSelector.vue'

export default {
  name: 'VizualizationMenu',
  props: {
    vizualizers: Array,
    activeViz: Object,
    activeSeq: Object
  },
  components: {
    ToolSelector,
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
