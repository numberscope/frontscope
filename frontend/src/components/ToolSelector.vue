<template>
    <a v-on:click="setActive(title)"><li class="list-group-item">{{ title }}</li></a>
</template>

<script>
import Scope from '../global/ScopeState.js';

export default {
    name: 'ToolSelector',

    props: {
        title: String,
    },
    methods: {
        setActive: function(active) {
            console.log(active);
            const moduleKey = 'module' + active.replace(' ','');
            Scope.state.activeViz = Scope.modules[moduleKey]
            console.log(Scope.state.activeViz);
            }
        }
}
</script>

<style scoped>
li {
    text-align: left;
    }
</style>
