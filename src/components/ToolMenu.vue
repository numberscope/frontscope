<template>
  <div>
    <ul class="list-group">
        <ToolSelector
            v-for="tool in tools"
            v-bind:title="tool.name"
            v-bind:key="tool.id"
            v-on:set-active-tool="activeTool = $event"
            >
            </ToolSelector>
    </ul>
    <div v-if="activeTool !== null">
      <p>Active Tool Selected</p>
      <VizualizationSettingsPane
        v-bind:vizParams="activeTool.params">
      </VizualizationSettingsPane>
    </div>
  </div>
</template>

<script>
import ToolSelector from './ToolSelector.vue'
import Scope from '../global/ScopeState.js'

export default {
  name: 'ToolMenu',
  components: {
    ToolSelector,
    VizualizationSettingsPane
  },
  methods: {
    setActive: function(active) {
        console.log(active);
        const moduleKey = 'module' + active.replace(' ','');
        Scope.state.activeViz = Scope.modules[moduleKey]
        console.log(Scope.state.activeViz);
        }
  },
  data: function(){
    return{
      tools: Scope.modules,
      activeTool: null
    }
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
