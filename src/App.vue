<script setup lang="ts">
    import {RouterLink, RouterView} from 'vue-router'
    import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
    <header>
        <HelloWorld msg="Numberscope" />
        <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
        </nav>
    </header>

    <RouterView />
</template>
