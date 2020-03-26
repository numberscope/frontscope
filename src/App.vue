<template>
        <div class="pagecontainer" id="app">
                <div id="containerwrap">
                        <nav-bar/>
                        <router-view></router-view>
                </div>
        <footer-component/>
    </div>
</template>

<script>

import NavBar from "@/views/minor/NavBar.vue";
import FooterComponent from "@/views/minor/Footer.vue";

export default {
        name: "app",
        components: {
                NavBar,
                FooterComponent,
        },
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

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.pagecontainer {
        position: relative;
        min-height: 100vh;
}

#containerwrap {
        padding-bottom: 100px;    /* Footer height */
}

</style>
