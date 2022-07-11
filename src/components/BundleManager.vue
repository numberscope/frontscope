<template>
    <div>
        <h2>Select a sequence and visualizer to create a bundle.</h2>
        <p>
            You can set up several bundles and then inspect them more closely
            to compare.
        </p>
        <div class="row">
            <div class="col-sm-6">
                <div
                    v-if="
                        activeSeq === null || activeSeq.isValid === undefined
                    "
                    class="alert alert-warning">
                    Select a sequence
                </div>
                <div v-else class="alert alert-primary">
                    Active sequence: {{ activeSeq.name }}
                </div>
            </div>
            <div class="col-sm-6">
                <div
                    v-if="
                        activeViz === null || activeViz.isValid === undefined
                    "
                    class="alert alert-warning">
                    Select a visualizer
                </div>
                <div v-else class="alert alert-primary">
                    Active visualizer: {{ activeViz.name }}
                </div>
            </div>
        </div>
        <button
            v-if="readyToBundle"
            class="btn btn-primary"
            v-on:click="$emit('createBundle')">
            Create Bundle
        </button>
        <div class="row">
            <BundleCard
                v-for="bundle in bundles"
                v-bind:key="bundle.seq.name + bundle.viz.name"
                v-bind:seq="bundle.seq"
                v-bind:viz="bundle.viz"
                v-on:drawBundle="$emit('drawBundle', $event)" />
        </div>
        <!-- <button
                 v-if="readyToDraw"
                 type="button"
                 class="btn btn-warning" 
                 v-on:click="draw">
                 Draw
             </button>
        -->
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'
    import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
    import type {SequenceInterface} from '../sequences/SequenceInterface'
    import BundleCard from './BundleCard.vue'
    export default defineComponent({
        components: {
            BundleCard,
        },
        props: {
            activeSeq: {
                type: [null, Object] as PropType<SequenceInterface | null>,
                required: true,
            },
            activeViz: {
                type: [null, Object] as PropType<VisualizerInterface | null>,
                required: true,
            },
            bundles: Array as PropType<
                {
                    seq: SequenceInterface
                    viz: VisualizerInterface
                }[]
            >,
        },
        computed: {
            readyToBundle: function (): boolean {
                return (
                    this.activeSeq !== null
                    && this.activeSeq.isValid !== undefined
                    && this.activeViz !== null
                    && this.activeViz.isValid !== undefined
                )
            },
        },
    })
</script>
