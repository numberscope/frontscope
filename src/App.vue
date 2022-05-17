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
        font-family: Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }
    nav {
        padding: 30px;
    }
    nav a {
        font-weight: bold;
        color: #2c3e50;
    }
</style>
