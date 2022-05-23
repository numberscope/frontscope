<template>
    <div id="homeContent">
        <img :src="background4" id="background4" />
        <p id="numberscopeDescription">
            The Online Tool for Visualizing Integer Sequences
        </p>
        <RouterLink class="btn btn-primary" to="/scope">
            Go to the 'Scope
        </RouterLink>
    </div>
</template>

<script setup lang="ts">
    import {RouterLink} from 'vue-router'
    import background4 from '../assets/img/toolpage/background4.jpg'
</script>

<style>
    #homeContent {
        margin-top: 5%;
        text-align: center;
    }
    #background4 {
        border: solid black;
        border-radius: 10%;
        max-width: 50%;
    }
    #numberscopeDescription {
        margin-top: 2em;
        margin-bottom: 2em;
        font-weight: bold;
        font-size: large;
    }
</style>
