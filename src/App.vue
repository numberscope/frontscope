<template>
    <main>
        <NavBar />
        <RouterView />
    </main>
    <Footer />
</template>

<script setup lang="ts">
    import Footer from './views/minor/Footer.vue'
    import NavBar from './views/minor/NavBar.vue'
    import {RouterView} from 'vue-router'
</script>

<style>
    :root {
        --ns-light-blue: #809fff;
        --ns-dark-blue: #3333ff;
    }
    main {
        min-height: 80vh;
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
