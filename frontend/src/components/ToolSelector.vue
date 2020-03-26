<template>
    <a style="cursor: pointer;" v-on:click="setActive(title)"><li class="list-group-item orange">{{ title }}</li></a>
</template>

<script>
import Scope from '@/global/ScopeState.js';

export default {
    name: 'ToolSelector',

    props: {
        title: String,
    },
    methods: {
        setActive: function(active) {
            const moduleKey = 'module' + active.replace(' ','');
            Scope.state.activeViz = Scope.modules[moduleKey];
            }
        }
}
</script>

<style scoped>
li {
    text-align: left;
    }
</style>
