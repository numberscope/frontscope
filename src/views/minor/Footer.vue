<template>
    <!-- Since the copyright has moved to the NavBar, just ensure there -->
    <!-- remains a dark blue band to mark the bottom of the page. Also, -->
    <!-- this leaves the footer as a place where additional boilerplate -->
    <!-- be placed in the future if needed. -->
    <footer class="page-footer font-small">{{ '\xa0' }}</footer>
</template>

<script>
    export default {
        name: 'FooterComponent',
    }
</script>

<style>
    footer {
        background-color: #3333ff;
        position: absolute;
        bottom: 0;
        width: 100%;
    }
    .footer-link {
        color: orange;
    }
    .footer-link:hover {
        color: white;
    }
</style>
