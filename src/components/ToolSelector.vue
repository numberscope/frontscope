<template>
    <a v-on:click="$emit('set-active-tool', title)"><li class="list-group-item">{{ title }}</li></a>
</template>


<script>
import Scope from '@/global/ScopeState.js';

export default {
    name: 'ToolSelector',

    props: {
        title: String,
    }
}
</script>

<style scoped>
li {
    text-align: left;
    }
</style>
