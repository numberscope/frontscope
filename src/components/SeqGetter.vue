<template>
    <a v-on:click="$emit('load-seq')">
        <li class="list-group-item">{{ title }}</li>
    </a>
</template>

<script>
    export default {
        name: 'SeqGetter',
        props: {
            title: String,
            instanceId: String,
        },
    }
</script>

<style scoped>
    a {
        cursor: pointer;
    }

    li:hover {
        background-color: #809fff;
        color: #ffffff;
    }

    li {
        text-align: left;
    }
</style>
