<template>
    <div ref="canvasContainer" class="canvas-container" />
</template>

<script setup lang="ts">
    import {onMounted, onUnmounted, ref} from 'vue'

    import {thumbnailGCcount} from './thumbnails'

    import {Specimen} from '@/shared/Specimen'
    import {DrawingUnmounted} from '@/visualizers/VisualizerInterface'

    const canvasContainer = ref<HTMLDivElement | null>(null)
    let savedContainer: HTMLDivElement | null = null
    let specimen: Specimen | undefined = undefined
    let usingGC = false
    const thumbnailGCmax = 8
    const props = defineProps<{query: string}>()

    onMounted(async () => {
        specimen = await Specimen.fromQuery(props.query)
        if (!(canvasContainer.value instanceof HTMLElement)) return
        savedContainer = canvasContainer.value
        let setupNow = true
        if (specimen.visualizer.usesGL()) {
            if (thumbnailGCcount.value < thumbnailGCmax) {
                thumbnailGCcount.value += 1
                usingGC = true
            } else {
                setupNow = false
            }
        }
        console.log('THUMB setup', thumbnailGCcount.value, savedContainer)
        if (setupNow) {
            specimen.setup(savedContainer)
            setTimeout(() => specimen?.visualizer.stop(), 4000)
        } else {
            const limitMsg = document.createTextNode(
                'All WebGL graphics contexts in use'
            )
            savedContainer.appendChild(limitMsg)
        }
    })

    onUnmounted(() => {
        if (usingGC) {
            thumbnailGCcount.value -= 1
            usingGC = false
            console.log('THUMB cleanup', thumbnailGCcount.value, specimen)
        }
        // Turns out canvasContainer has already been de-refed
        // by the time we get here, so we can't depart using that.
        // Hence the need for savedContainer, unfortunately.
        if (!specimen || !(savedContainer instanceof HTMLElement)) {
            return
        }
        const viz = specimen.visualizer
        if (viz.drawingState !== DrawingUnmounted) viz.depart(savedContainer)
    })
</script>

<style scoped>
    .canvas-container {
        width: 200px;
        height: 200px;
        margin: 8px;
    }
</style>
