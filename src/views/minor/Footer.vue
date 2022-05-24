<template>
    <footer class="page-footer font-small">
        <div class="text-center py-3" style="color: white">
            {{ copyright }}
            <p>
                Licensed under the
                <a
                    class="footer-link"
                    href="https://opensource.org/licenses/MIT">
                    MIT License</a
                >.
            </p>
        </div>
    </footer>
</template>

<script>
    const currentYear = new Date().getFullYear()
    // prettier-ignore
    const copyrightText
    = `Copyright © 2020-${currentYear} Regents of the University of Colorado`
    export default {
        /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
        data() {
            return {
                copyright: copyrightText,
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
    }
    .footer-link {
        color: orange;
    }
    .footer-link:hover {
        color: white;
    }
</style>
