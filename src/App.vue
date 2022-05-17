<template>
    <main>
        <NavBar />
        <RouterView />
    </main>
    <FooterComponent />
</template>

<script setup lang="ts">
    import FooterComponent from './views/minor/FooterComponent.vue'
    import NavBar from './views/minor/NavBar.vue'
    import {RouterView} from 'vue-router'
</script>

<style>
    main {
        min-height: 100vh;
    }
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
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
        padding-bottom: 100px; /* Footer height */
    }
</style>
