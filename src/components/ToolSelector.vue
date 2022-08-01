<template>
    <a v-on:click="$emit('set-viz-params', title)">
        <li class="btn">{{ title }}</li>
    </a>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    export default defineComponent({
        name: 'VizSelector',
        props: {
            title: String,
        },
    })
</script>

<style scoped>
    a {
        cursor: pointer;
    }
    li:hover {
        color: var(--ns-navigation-foreground);
        background-color: var(--ns-navigation-background);
    }
    li {
        text-align: left;
        width: 100%;
        border-color: var(--ns-information-background);
    }
</style>
