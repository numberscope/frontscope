<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-2">
                <ToolMenu />
            </div>
            <div class="col-sm-10">
                <CanvasArea />
            </div>
        </div>
    </div>
</template>

<script>

import ToolMenu from '@/components/ToolMenu.vue'
import CanvasArea from '@/components/CanvasArea.vue'

export default {
  name: 'App',
  components: {
    ToolMenu,
    CanvasArea
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
