<template>
    <div class="canvas-container" ref="canvasContainer"></div>
</template>

<script setup lang="ts">
    import {onMounted, onUnmounted, ref} from 'vue'
    import {Specimen} from '@/shared/Specimen'
    import {defaultSpecimen} from '@/shared/browserCaching'

    const canvasContainer = ref<HTMLDivElement | null>(null)
    let specimen = defaultSpecimen
    const props = defineProps(['base64'])

    onMounted(() => {
        specimen = Specimen.decode64(props.base64)
        if (!(canvasContainer.value instanceof HTMLElement)) return

        specimen.visualizer.validate()
        specimen.sequence.validate()
        specimen.visualizer.isValid = true
        specimen.sequence.isValid = true
        specimen.visualizer.assignParameters()
        specimen.sequence.assignParameters()
        specimen.setup(canvasContainer.value)
        setTimeout(() => specimen.visualizer.stop(), 4000)
    })

    onUnmounted(() => {
        if (!(canvasContainer.value instanceof HTMLElement)) return
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
