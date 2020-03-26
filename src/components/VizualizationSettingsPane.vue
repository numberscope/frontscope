<template>
    <ul>
        <p 
            v-for="param in vizParams" 
            v-bind:key="param.id">
            {{param.name}}
        </p>
    </ul>
</template>

<script>
export default {
    name: 'VizualizationSettingsPane',
    props: ['vizParams']
}
</script>

<style>

</style>