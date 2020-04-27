<template>
    <a v-on:click="$emit('set-active-seq', title)">
        <li class="list-group-item">{{ title }}</li>
    </a>
</template>


<script>

export default {
    name: 'SeqSelector',

    props: {
        title: String,
    }
}
</script>

<style scoped>
li {
    text-align: left;
    }
</style>
