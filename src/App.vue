<template>
    <div id="container">
        <main>
            <RouterView />
        </main>
    </div>
</template>

<script setup lang="ts">
    import {RouterView} from 'vue-router'
</script>

<!-- Global styles. This style tag is explicitly unscoped. -->
<style>
    :root {
        /* Font sizes */
        --ns-size-body: 12px;
        --ns-size-display: 24px;
        --ns-size-heading: 16px;
        --ns-size-subheading: 12px;
        --ns-size-mini: 10px;
        --ns-size-heading-2: 14px;
        --ns-size-title: 24px;

        /* Fonts */
        --ns-font-display: 'Infinity', sans-serif;
        --ns-font-main: 'Inter', sans-serif;

        /* Colors */
        --ns-color-primary: #809fff;
        --ns-color-white: #ffffff;
        --ns-color-light: #b5b5b5;
        --ns-color-grey: #636363;
        --ns-color-black: #2f2f2f;

        /* Bolditude */
        --ns-font-weight-medium: 500;

        /* Breakpoint widths
        Default styles should be for vertical mobile devices
        (devices narrower than --ns-breakpoint-mobile)

        Small devices (landscape phones)
        @media (min-width: var(--ns-breakpoint-mobile)) { ... }

        Medium devices (tablets)
        @media (min-width: var(--ns-breakpoint-tablet)) { ... }

        // Large devices (desktops)
        @media (min-width: var(--ns-breakpoint-desktop)) { ... }
        */
        --ns-breakpoint-mobile: 580px;
        --ns-breakpoint-tablet: 800px;
        --ns-breakpoint-desktop: 1200px;
    }

    #container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;

        main {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
    }

    * {
        box-sizing: border-box;
        font-family: var(--ns-font-main);
        color: var(--ns-color-black);
    }

    html,
    body {
        margin: 0;
        padding: 0;
    }

    /* Display font */
    @font-face {
        font-family: 'Infinity';
        src: url('../src/assets/fonts/infinity/Infinity.ttf');
    }

    /* Body font */
    @font-face {
        font-family: 'Inter';
        src: url('/src/assets/fonts/inter/Inter-VariableFont_slnt\,wght.ttf');
    }
</style>
