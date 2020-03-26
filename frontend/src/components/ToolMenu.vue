<template>
    <ul class="list-group">
        <ToolSelector
            v-for="tool in tools"
            v-bind:title="tool.name"
            v-bind:key="tool.id"
            >
            </ToolSelector>
    </ul>
</template>

<script>
import ToolSelector from '@/components/ToolSelector.vue'
import Scope from '@/global/ScopeState.js'

export default {
name: 'ToolMenu',
components: {
                ToolSelector
            },
data: function(){
  return{
    tools: Scope.modules,
  }
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
