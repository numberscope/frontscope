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
        --ns-foreground: #2c3e50;
        --ns-navigation-foreground: white;
        --ns-navigation-background: #809fff;
        --ns-information-foreground: white;
        --ns-information-background: #3333ff;
        --ns-footer-height: 9ex;
    }
    main {
        min-height: calc(100vh - var(--ns-footer-height));
        font-family: Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: var(--ns-foreground);
    }
    nav {
        padding: 30px;
    }
    nav a {
        font-weight: bold;
        color: var(--ns-foreground);
    }
</style>
