<template>
    <a v-on:click="$emit('load-seq')">
        <li class="list-group-item">{{ title }}</li>
    </a>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    export default defineComponent({
        name: 'SeqGetter',
        props: {
            title: String,
            instanceId: String,
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
    }
</style>
