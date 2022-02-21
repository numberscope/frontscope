<script setup lang="ts">
    import {RouterLink} from 'vue-router'
</script>

<template>
    <div id="homeContent">
        <h1>Numberscope</h1>
        <p>
            Numberscope is a tool for creating beautiful visualizations of
            integer sequences.
        </p>
        <RouterLink class="btn btn-primary" to="/scope">
            Go to the 'Scope
        </RouterLink>
    </div>
</template>

<style>
    #homeContent {
        margin-top: 10%;
        text-align: center;
    }
</style>
