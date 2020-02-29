<template>
    <ul class="list-group">
        <ToolSelector
            v-for="tool in tools"
            v-bind:title="tool.title"
            v-bind:key="tool.id">
            </ToolSelector>
    </ul>
</template>

<script>
import ToolSelector from './ToolSelector.vue'

export default {
name: 'ToolMenu',
components: {
                ToolSelector
            },
data: function(){
  return{
    tools: [
           { id: 1, title: 'Tool 1' },
           { id: 2, title: 'Tool 2' },
           { id: 3, title: 'Tool 3' },
           { id: 4, title: 'Tool 4' },
        ]
      }
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
