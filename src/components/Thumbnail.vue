<template>
    <div class="canvas-container" ref="canvasContainer"></div>
</template>

<script setup lang="ts">
    import {onMounted, onUnmounted, ref} from 'vue'
    import {Specimen} from '@/shared/Specimen'

    const canvasContainer = ref<HTMLDivElement | null>(null)
    let specimen: Specimen | undefined = undefined
    const props = defineProps(['query'])

    onMounted(async () => {
        specimen = await Specimen.fromQuery(props.query)
        if (!(canvasContainer.value instanceof HTMLElement)) return
        specimen.setup(canvasContainer.value)
        setTimeout(() => specimen?.visualizer.stop(), 4000)
    })

    onUnmounted(() => {
        if (!specimen || !(canvasContainer.value instanceof HTMLElement))
            return
        specimen.visualizer.depart(canvasContainer.value)
    })
</script>

<style scoped>
    .canvas-container {
        width: 200px;
        height: 200px;
        margin: 8px;
    }
</style>
