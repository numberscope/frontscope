<template>
    <footer class="page-footer font-small">
        <div class="footer-copyright text-center py-3" style="color: white">
            {{ copyright }}
        </div>
    </footer>
</template>

<script>
    const currentYear = new Date().getFullYear()
    const copyrightText
        = `Copyright © 2020-${currentYear} University of Colorado Boulder`
    export default {
        /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
        data() {
            return {
                copyright: copyrightText
            }
        },
        name: 'FooterComponent',
    }
</script>

<style>
    footer {
        background-color: #3333ff;
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 100px;
    }
</style>
