<template>
    <div id="container">
        <main>
            <RouterView />
        </main>
    </div>
</template>

<script setup lang="ts">
    import {RouterView} from 'vue-router'

    import {reactivateOEIS} from '@/sequences/sequences'

    reactivateOEIS()
</script>

<!-- Global styles. This style tag is explicitly unscoped. -->
<style>
    #container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        max-height: 100vh;

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
    }

    a {
        color: inherit;
    }
    html,
    body {
        margin: 0;
        padding: 0;
    }
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

        /* Dimensions */
        --ns-desktop-navbar-height: 76px;
        --ns-desktop-tab-width: 300px;
        --ns-specimen-card-width: 216px;

        /* Breakpoint widths
        Default styles should be for vertical mobile devices
        (devices narrower than --ns-breakpoint-mobile)

        // Small devices (landscape phones)
        @media (min-width: $mobile-breakpoint) { ... }
        // Note var(...) expressions are not allowed in media queries,
        // so it's necessary to use the global scss variables set up
        // in src/assets/scss/_variables.scss directly, as shown

        // Medium devices (tablets)
        @media (min-width: $tablet-breakpoint) { ... }

        // Large devices (desktops)
        @media (min-width: $desktop-breakpoint) { ... }
        */
        --ns-breakpoint-mobile: $mobile-breakpoint;
        --ns-breakpoint-tablet: $tablet-breakpoint;
        /* Not actually used at the moment:
          --ns-breakpoint-desktop: 1200px;
         */
    }

    /* Display font */
    @font-face {
        font-family: 'Infinity';
        src: url('@/assets/fonts/infinity/Infinity.ttf');
    }

    /* Body font */
    @font-face {
        font-family: 'Inter';
        src: url('@/assets/fonts/inter/Inter-VariableFont_slnt,wght.ttf')
            format('truetype');
    }

    /* Decorations */
    .shadowed {
        box-shadow: 4px 4px 0px var(--ns-color-primary);
    }
</style>
