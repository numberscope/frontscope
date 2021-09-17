<template>
    <div v-if="!isOeis">
        <a v-on:click="$emit('set-seq-params')">
            <li class="list-group-item">{{ title }}</li>
        </a>
    </div>
    <div v-else>
        <a v-on:click="$emit('stage-oeis-seq')">
            <li class="list-group-item">OEIS: {{ title }}</li>
        </a>
    </div>
</template>

<script>
export default {
    name: 'SeqSelector',
    props: {
        title: String,
        isOeis: Boolean
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