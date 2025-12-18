<template>
    <div ref="canvasContainer" class="canvas-container" />
</template>

<script setup lang="ts">
    import {onMounted, onUnmounted, ref, watch} from 'vue'

    import {thumbnailGCcount} from './thumbnails'

    import {Specimen} from '@/shared/Specimen'
    import {clearErrorOverlay} from '@/shared/alertMessage'
    import {
        DrawingUnmounted,
        DrawingStopped,
    } from '@/visualizers/VisualizerInterface'

    const canvasContainer = ref<HTMLDivElement | null>(null)
    let savedContainer: HTMLDivElement | null = null
    let specimen: Specimen | undefined = undefined
    let usingGC = false
    let needsSetup = true
    const TGClim = 7
    const props = defineProps<{query: string; thumbFrames?: number}>()

    function captureAndDepart() {
        if (usingGC) {
            thumbnailGCcount.value -= 1
            usingGC = false
        }
        if (!specimen || !savedContainer) return
        const canvas = savedContainer.querySelector('canvas')
        if (canvas instanceof HTMLCanvasElement) {
            const {width, height} = canvas.getBoundingClientRect()
            const vizShot = new Image(width, height)
            vizShot.src = canvas.toDataURL()
            // Note we do _not_ clear any possible error overlay here;
            // we want it still to be visible to the user.
            specimen.visualizer.depart(savedContainer)
            savedContainer.prepend(vizShot) // under any error overlay
        } else {
            specimen.visualizer.stop()
        }
    }
    function setupSpecimen() {
        needsSetup = false
        if (!specimen || !savedContainer) return
        specimen.setup(savedContainer)

        // Safety fallback
        const maxWait = setTimeout(() => {
            // Clean up the polling interval so it stops checking.
            clearInterval(checkInterval)
            captureAndDepart()
        }, 30000)

        // Poll to check if visualizer stopped
        const checkInterval = setInterval(() => {
            if (!specimen || !savedContainer) return
            if (specimen.visualizer.drawingState === DrawingStopped) {
                clearInterval(checkInterval)
                clearTimeout(maxWait)
                captureAndDepart()
            }
        }, 100)
    }

    onMounted(async () => {
        const queryWithFrames = props.thumbFrames
            ? `frames=${props.thumbFrames}&${props.query}`
            : props.query
        specimen = await Specimen.fromQuery(queryWithFrames)
        if (!(canvasContainer.value instanceof HTMLElement)) return
        savedContainer = canvasContainer.value
        if (specimen.visualizer.usesGL()) {
            usingGC = true
            if (thumbnailGCcount.value > TGClim) {
                // defer setup
                const limitMsg = document.createTextNode(
                    '[... waiting for WebGL graphics context]'
                )
                savedContainer.appendChild(limitMsg)
                watch(thumbnailGCcount, newCount => {
                    if (!savedContainer) return
                    if (newCount <= TGClim && needsSetup) {
                        if (savedContainer.lastChild) {
                            savedContainer.removeChild(
                                savedContainer.lastChild
                            )
                        }
                        setupSpecimen()
                        thumbnailGCcount.value += 1
                    }
                })
            } else {
                setupSpecimen()
                thumbnailGCcount.value += 1
            }
        } else setupSpecimen()
    })

    onUnmounted(() => {
        if (usingGC) {
            thumbnailGCcount.value -= 1
            usingGC = false
        }
        // Turns out canvasContainer has already been de-refed
        // by the time we get here, so we can't depart using that.
        // Hence the need for savedContainer, unfortunately.
        if (!specimen || !(savedContainer instanceof HTMLElement)) {
            return
        }
        clearErrorOverlay(savedContainer)
        const viz = specimen.visualizer
        if (viz.drawingState !== DrawingUnmounted) viz.depart(savedContainer)
    })
</script>

<style scoped>
    .canvas-container {
        width: 200px;
        height: 200px;
        margin: 8px;
        position: relative;
    }
</style>
