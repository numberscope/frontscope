<template>
    <div class="canvas-container" ref="canvasContainer"></div>
</template>

<script setup lang="ts">
    import {onMounted, ref} from 'vue'
    import {Specimen} from '@/shared/Specimen'

    const canvasContainer = ref<HTMLDivElement | null>(null)
    const props = defineProps(['url'])

    onMounted(() => {
        const specimen = Specimen.fromURL(props.url)

        if (!(canvasContainer.value instanceof HTMLElement)) return

        specimen.visualizer.validate()
        specimen.sequence.validate()
        specimen.visualizer.isValid = true
        specimen.sequence.isValid = true
        specimen.visualizer.assignParameters()
        specimen.sequence.assignParameters()
        specimen.setup(canvasContainer.value)
    })
</script>

<style scoped>
    .canvas-container {
        width: 200px;
        height: 200px;
        margin: 8px;
    }
</style>
