<script setup lang="ts">
    import {RouterLink} from 'vue-router'
</script>

<template>
    <footer class="text-center">
        <p>
            Thank you very much to
            <RouterLink class="footer-link" to="/acknowledgements">
                those who made Numberscope possible
            </RouterLink>
            over the years!
        </p>
    </footer>
</template>

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
