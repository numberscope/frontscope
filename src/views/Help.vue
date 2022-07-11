<template>
    <div class="container" id="helpContent">
        <h1>Need help?</h1>
        <nav>
            <ul>
                <li>
                    <i class="bi bi-question-circle"></i>&nbsp;
                    <a href="#">User Guide</a>
                </li>
                <li>
                    <i class="bi bi-file-text"></i>&nbsp;
                    <RouterLink to="/documentation">Documentation</RouterLink>
                </li>
                <li>
                    <i class="bi bi-github"></i>&nbsp;
                    <a href="https://github.com/numberscope"
                        >Find Us on GitHub</a
                    >
                </li>
                <li>
                    <i class="bi bi-envelope"></i>&nbsp;
                    <a href="mailto:numberscope@colorado.edu"
                        >Shoot Us an Email</a
                    >
                </li>
            </ul>
        </nav>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import {RouterLink} from 'vue-router'
    // To be honest: this check exists only to avoid "unused variable" warning
    if (!RouterLink) {
        console.log('Failed import of RouterLink')
    }
    export default defineComponent({})
</script>

<style>
    #helpContent {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
