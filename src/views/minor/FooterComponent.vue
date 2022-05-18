<template>
    <footer class="text-center">
        <p>{{ copyright }}</p>
        <p>
            Licensed under the
            <a class="footer-link" href="https://opensource.org/licenses/MIT">
                MIT License</a
            >.
        </p>
        <p>
            By using this website, you agree that any images or media you
            create using the tools on this website are released by you into
            the public domain according to
            <a
                class="footer-link"
                href="https://creativecommons.org/publicdomain/zero/1.0/"
                >CC0 1.0</a
            >.
        </p>
    </footer>
</template>

<script lang="ts">
    const currentYear = new Date().getFullYear()
    // prettier-ignore
    const copyrightText
    = `Copyright © 2020-${currentYear} Regents of the University of Colorado`
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
        background-color: #3333ff;
        color: white;
        padding: 16px 4px;
    }
    .footer-link {
        color: orange;
    }
    .footer-link:hover {
        color: white;
    }
</style>
