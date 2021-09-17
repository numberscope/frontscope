<template>
    <a v-on:click="$emit('set-viz-params', title)">
        <li class="list-group-item">{{ title }}</li>
    </a>
</template>

<script>

export default {
    name: 'VizSelector',

    props: {
        title: String,
    }
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