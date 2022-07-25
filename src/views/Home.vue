<template>
    <div id="homeContent">
        <RouterLink to="/scope">
            <img :src="background4" id="background4" />
        </RouterLink>
        <p id="numberscopeDescription">
            The Online Tool for Visualizing Integer Sequences
        </p>
        <RouterLink id="goToScopeButton" class="btn btn-primary" to="/scope">
            Go to the 'Scope
        </RouterLink>
        <p>
            By using this website, you agree that any images or media you
            create using the tools on this website are released by you into
            the public domain according to
            <a href="https://creativecommons.org/publicdomain/zero/1.0/"
                >CC0 1.0</a
            >.
        </p>
    </div>
</template>

<script setup lang="ts">
    import {RouterLink} from 'vue-router'
    import background4 from '../assets/img/toolpage/background4.jpg'
</script>

<style>
    #homeContent {
        margin-top: 2em;
        text-align: center;
    }
    #background4 {
        border: solid black;
        border-radius: 10%;
        max-width: 50%;
    }
    #goToScopeButton {
        background-color: var(--ns-dark-blue);
        margin-bottom: 1ex;
    }
    #goToScopeButton:hover {
        text-decoration: underline;
    }
    #numberscopeDescription {
        margin-top: 1.5ex;
        margin-bottom: 1.5ex;
        font-weight: bold;
        font-size: large;
    }
    @media only screen and (max-width: 600px) {
        #background4 {
            max-width: 90%;
        }
    }
</style>
