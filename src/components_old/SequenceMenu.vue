<template>
    <div class="mb-3">
        <h2>Sequences</h2>
        <ul class="list-group">
            <SeqSelector
                v-for="seq in isGetter(sequences, false)"
                v-bind:title="seq.name"
                v-bind:isInstance="seq.kind == instanceKind"
                v-bind:key="seq.name"
                v-on:set-seq-params="setParams(seq)"
                v-on:stage-instance="createSeq(true, seq)" />
            <hr />
            <SeqGetter
                v-for="seq in isGetter(sequences, true)"
                v-bind:title="seq.name"
                v-bind:key="seq.name"
                v-on:load-seq="loadSeq(seq)" />
        </ul>
        <SeqVizParamsModal
            v-if="showModal"
            v-bind:params="liveSequence.params"
            v-bind:errors="errors"
            v-bind:loading-instance="loadingInstance"
            v-on:closeModal="closeParamsModal"
            v-on:submitParams="createSeq"
            v-on:submitInstance="createInstance" />
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'
    import SeqSelector from './SeqSelector.vue'
    import SeqGetter from './SeqGetter.vue'
    import SeqVizParamsModal from './SeqVizParamsModal.vue'
    import type {SequenceInterface} from '../sequences/SequenceInterface'
    import {
        SequenceExportModule,
        SequenceExportKind,
    } from '../sequences/SequenceInterface'
    import {SequenceDefault} from '../sequences/SequenceDefault'
    export default defineComponent({
        name: 'SequenceMenu',
        props: {
            sequences: {
                type: Array as PropType<SequenceExportModule[]>,
                required: true,
            },
            activeViz: Object,
            activeSeq: Object as PropType<SequenceInterface | null>,
        },
        components: {
            SeqSelector,
            SeqGetter,
            SeqVizParamsModal,
        },
        methods: {
            openParamsModal: function () {
                this.showModal = true
            },
            closeParamsModal: function () {
                this.showModal = false
            },
            setParams: function (seq: SequenceExportModule) {
                if (seq.kind == SequenceExportKind.INSTANCE) {
                    this.$emit('createSeq', this.liveSequence)
                } else {
                    const constructor = seq.sequence
                    this.liveSequence = new constructor(this.sequences.length)
                    this.openParamsModal()
                }
            },
            isGetter: function (
                items: SequenceExportModule[],
                which: boolean
            ) {
                return items.filter(
                    item =>
                        (item.kind === SequenceExportKind.GETTER) === which
                )
            },
            loadSeq: function (seq: SequenceExportModule) {
                const constructor = seq.sequence
                this.liveSequence = new constructor(this.sequences.length)
                this.loadingInstance = true
                this.openParamsModal()
            },
            createSeq: function (
                isInstance: boolean,
                activeSeq: SequenceExportModule
            ) {
                if (isInstance) {
                    // instances are already constructed
                    this.liveSequence = new activeSeq.sequence(0)
                }
                const validationResult = this.liveSequence.validate()
                if (validationResult.isValid()) {
                    this.errors = []
                    this.closeParamsModal()
                    this.liveSequence.initialize()
                    this.$emit('createSeq', this.liveSequence)
                } else {
                    this.errors = validationResult.errors
                }
            },
            createInstance: function () {
                const validationResult = this.liveSequence.validate()
                if (validationResult.isValid()) {
                    this.errors = []
                    this.closeParamsModal()
                    this.liveSequence.initialize()
                    this.loadingInstance = false
                    this.$emit('addInstance', this.liveSequence)
                } else {
                    this.errors = validationResult.errors
                }
            },
        },
        data: function () {
            return {
                showModal: false,
                instanceKind: SequenceExportKind.INSTANCE,
                liveSequence: new SequenceDefault(0) as SequenceInterface,
                loadingInstance: false,
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
