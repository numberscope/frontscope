<template>
    <div v-if="!isInstance">
        <a v-on:click="$emit('set-seq-params')">
            <li class="list-group-item">{{ title }}</li>
        </a>
    </div>
    <div v-else>
        <a v-on:click="$emit('stage-instance')">
            <li class="list-group-item">Custom: {{ title }}</li>
        </a>
    </div>
</template>

<script lang="ts">
    export default {
        name: 'SeqSelector',
        props: {
            title: String,
            isInstance: Boolean,
        },
    }
</script>

<style scoped>
    a {
        cursor: pointer;
    }
    li:hover {
        background-color: #809fff;
        color: #ffffff;
    }
    li {
        text-align: left;
    }
</style>
