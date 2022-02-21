<script setup lang="ts">
    import FooterComponent from './views/minor/FooterComponent.vue'
    import NavBar from './views/minor/NavBar.vue'
    import {RouterView} from 'vue-router'
</script>

<template>
    <main>
        <NavBar />
        <RouterView />
    </main>
    <FooterComponent />
</template>

<style>
    main {
        min-height: 100vh;
    }
</style>
