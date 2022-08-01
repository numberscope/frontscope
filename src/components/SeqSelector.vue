<template>
    <div v-if="!isInstance">
        <a v-on:click="$emit('set-seq-params')">
            <li class="btn">{{ title }}</li>
        </a>
    </div>
    <div v-else>
        <a v-on:click="$emit('stage-instance')">
            <li class="btn">Custom: {{ title }}</li>
        </a>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    export default defineComponent({
        name: 'SeqSelector',
        props: {
            title: String,
            isInstance: Boolean,
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
        width: 100%;
        text-align: left;
        border-color: var(--ns-information-background);
    }
</style>
