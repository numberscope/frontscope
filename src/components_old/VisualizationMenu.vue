<template>
    <div>
        <h2>Visualizers</h2>
        <ul class="list-group">
            <VizSelector
                v-for="viz in visualizers"
                v-bind:title="viz.name"
                v-bind:key="viz.name"
                v-on:set-viz-params="setParams(viz)" />
        </ul>
        <SeqVizParamsModal
            v-if="showModal"
            v-bind:params="livevisualizer.params"
            v-bind:errors="errors"
            v-on:closeModal="closeParamsModal"
            v-on:submitParams="createViz" />
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'
    import type {
        VisualizerInterface,
        VisualizerExportModule,
    } from '@/visualizers/VisualizerInterface'
    import VizSelector from './ToolSelector.vue'
    import SeqVizParamsModal from './SeqVizParamsModal.vue'
    import type {SequenceInterface} from '../sequences/SequenceInterface'
    import {SequenceDefault} from '../sequences/SequenceDefault'
    export default defineComponent({
        name: 'VizualizationMenu',
        props: {
            visualizers: Array as PropType<VisualizerExportModule[]>,
            activeViz: Object as PropType<VisualizerInterface | null>,
            activeSeq: Object as PropType<SequenceInterface | null>,
        },
        components: {
            VizSelector,
            SeqVizParamsModal,
        },
        methods: {
            openParamsModal: function () {
                this.showModal = true
            },
            closeParamsModal: function () {
                this.showModal = false
            },
            setParams: function (viz: VisualizerExportModule) {
                this.livevisualizer = new viz.visualizer(
                    this.activeSeq ?? this.dummySequence
                )
                this.openParamsModal()
            },
            createViz: function () {
                const validationResult = this.livevisualizer.validate()
                if (validationResult.isValid()) {
                    this.errors = []
                    this.closeParamsModal()
                    this.$emit('createViz', this.livevisualizer)
                } else {
                    this.errors = validationResult.errors
                }
            },
        },
        data: function () {
            return {
                showModal: false,
                // "as" clauses below for type inference of the data
                livevisualizer: {} as VisualizerInterface,
                dummySequence: new SequenceDefault(0),
                errors: [] as string[],
            }
        },
    })
</script>

<style scoped>
    ul {
        list-style: none;
    }
</style>
