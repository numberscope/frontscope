<template>
    <footer class="text-center">
        <p>{{ copyright }}</p>
        <p>Licensed under the <a href="#">Blah License</a>.</p>
    </footer>
</template>

<script lang="ts">
    const currentYear = new Date().getFullYear()
    // prettier-ignore
    const copyrightText
        = `Copyright © 2020-${currentYear} University of Colorado Boulder`
    export default {
        data() {
            return {
                copyright: copyrightText,
            }
        },
        name: 'CopyAndLicense',
    }
</script>

<style>
    footer {
        background-color: lightgrey;
        padding-top: 16px;
        padding-bottom: 16px;
    }
</style>
