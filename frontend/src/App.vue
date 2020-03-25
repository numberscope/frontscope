<template>
  <div id="app">
    <NavBar />
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
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import ToolMenu from './components/ToolMenu.vue'
import CanvasArea from './components/CanvasArea.vue'

export default {
  name: 'App',
  components: {
    NavBar,
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
