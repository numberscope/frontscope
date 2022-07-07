<template>
    <div class="container-fluid">
        <div class="row" v-if="drawingActive">
            <div class="col-sm-12">
                <CanvasArea
                    v-bind:activeViz="guaranteeViz()"
                    v-bind:activeSeq="guaranteeSeq()"
                    v-on:closeCanvas="closeCanvas()" />
            </div>
        </div>
        <div class="row" v-if="!drawingActive">
            <div class="col-sm-2">
                <SequenceMenu
                    v-bind:sequences="sequences"
                    v-bind:activeSeq="activeSeq"
                    v-on:createSeq="setActiveSeq($event)"
                    v-on:addInstance="addInstance($event)" />
                <VisualizationMenu
                    v-bind:visualizers="visualizers"
                    v-bind:activeViz="activeViz"
                    v-on:createViz="setActiveViz($event)" />
            </div>
            <div class="col-sm-10">
                <BundleManager
                    v-bind:activeViz="activeViz"
                    v-bind:activeSeq="activeSeq"
                    v-bind:bundles="seqVizPairs"
                    v-on:createBundle="bundleSeqVizPair()"
                    v-on:drawBundle="drawBundle($event)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import VisualizationMenu from '../components/VisualizationMenu.vue'
    import SequenceMenu from '../components/SequenceMenu.vue'
    import CanvasArea from '../components/CanvasArea.vue'
    import BundleManager from '../components/BundleManager.vue'
    import VISUALIZERS from '../visualizers/visualizers'
    import SEQUENCES from '../sequences/sequences'
    import type {SequenceInterface} from '../sequences/SequenceInterface'
    import {
        SequenceExportKind,
        SequenceExportModule,
    } from '../sequences/SequenceInterface'
    import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
    export default defineComponent({
        name: 'ToolMain',
        components: {
            VisualizationMenu,
            SequenceMenu,
            CanvasArea,
            BundleManager,
        },
        methods: {
            guaranteeViz: function () {
                return this.activeViz as VisualizerInterface
            },
            setActiveViz: function (newViz: VisualizerInterface) {
                this.activeViz = newViz
            },
            guaranteeSeq: function () {
                return this.activeSeq as SequenceInterface
            },
            setActiveSeq: function (newSeq: SequenceInterface) {
                this.activeSeq = newSeq
            },
            addInstance: function (newInstance: SequenceInterface) {
                const seqBundle = new SequenceExportModule(
                    newInstance,
                    newInstance.name,
                    SequenceExportKind.INSTANCE
                )
                this.sequences.push(seqBundle)
                this.setActiveSeq(newInstance)
            },
            bundleSeqVizPair: function () {
                const bundle = {
                    seq: this.activeSeq as SequenceInterface,
                    viz: this.activeViz as VisualizerInterface,
                }
                this.seqVizPairs.push(bundle)
                this.clearActive()
            },
            drawBundle: function (seqVizBundle: {
                seq: SequenceInterface
                viz: VisualizerInterface
            }) {
                console.log(seqVizBundle)
                this.activeSeq = seqVizBundle.seq
                this.activeViz = seqVizBundle.viz
                this.drawingActive = true
            },
            closeCanvas: function () {
                this.clearActive()
                this.drawingActive = false
            },
            clearActive: function () {
                this.activeViz = null
                this.activeSeq = null
            },
        },
        data: function () {
            const visualizers = []
            const sequences = []
            for (const vizKey in VISUALIZERS) {
                visualizers.push(VISUALIZERS[vizKey])
            }
            for (const seqKey in SEQUENCES) {
                sequences.push(SEQUENCES[seqKey])
            }
            const state = {
                visualizers: visualizers,
                sequences: sequences,
                seqVizPairs: [] as {
                    seq: SequenceInterface
                    viz: VisualizerInterface
                }[],
                activeViz: null as VisualizerInterface | null,
                activeSeq: null as SequenceInterface | null,
                drawingActive: false,
            }
            return state
        },
    })
</script>
