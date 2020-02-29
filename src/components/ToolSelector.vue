<template>
    <li class="list-group-item">{{ title }}</li>
</template>

<script>
export default {
    name: 'ToolSelector',
    props: ['title']
}
</script>

<style scoped>
li {
    text-align: left;
    }
</style>
