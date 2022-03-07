<template>
    <h1 class="green">{{ msg }}</h1>
</template>

<script setup lang="ts">
    defineProps<{
        msg: string
    }>()
</script>

<style scoped>
    h1 {
        font-weight: 500;
        font-size: 2.6rem;
        top: -10px;
    }
</style>
