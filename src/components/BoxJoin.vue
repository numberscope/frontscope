<template>
    <svg
        class="boxing box-join"
        fill="none"
        :viewBox="`0 0 ${width} ${height}`"
        xmlns="http://www.w3.org/2000/svg">
        <line
            x1="0"
            :x2="width / 2"
            :y1="height / 2"
            :y2="height / 2"
            stroke="currentColor"
            :stroke-width="strokeWidth" />
        <line
            :x1="width / 2"
            :x2="width / 2"
            y1="0"
            :y2="height"
            stroke="currentColor"
            :stroke-width="strokeWidth" />
    </svg>
</template>

<script lang="ts" setup>
    defineProps({
        height: {
            default: 28,
            type: Number,
        },
        strokeWidth: {
            default: 2,
            type: Number,
        },
        width: {
            default: 24,
            type: Number,
        },
    })
</script>

<style scoped>
    svg {
        vertical-align: middle;
    }
</style>
