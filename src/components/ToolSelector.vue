<template>
    <a v-on:click="$emit('set-viz-params', title)">
        <li class="list-group-item">{{ title }}</li>
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
        background-color: var(--ns-light-blue);
        color: #ffffff;
    }
    li {
        text-align: left;
    }
</style>
