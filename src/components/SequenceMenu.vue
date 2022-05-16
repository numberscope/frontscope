<template>
    <div class="mb-3">
        <h2>Sequences</h2>
        <ul class="list-group">
            <SeqSelector
                v-for="seq in isGetter(sequences, false)"
                v-bind:title="seq.name"
                v-bind:isInstance="seq.kind == instanceKind"
                v-bind:key="seq.id"
                v-on:set-seq-params="setParams(seq)"
                v-on:stage-instance="createSeq(true, seq)" />
            <hr />
            <SeqGetter
                v-for="seq in isGetter(sequences, true)"
                v-bind:title="seq.name"
                v-bind:key="seq.id"
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
    import SeqSelector from './SeqSelector.vue'
    import SeqGetter from './SeqGetter.vue'
    import SeqVizParamsModal from './SeqVizParamsModal.vue'
    import {
        SequenceInterface,
        SequenceConstructor,
        SequenceExportModule,
        SequenceExportKind,
    } from '../sequences/SequenceInterface.ts'
    import {SequenceClassDefault} from '../sequences/SequenceClassDefault.ts'
    export default {
        name: 'SequenceMenu',
        props: {
            sequences: Array,
            activeViz: Object,
            activeSeq: Object,
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
                    // prettier-ignore
                    const constructor
                    = seq.constructorOrSequence as SequenceConstructor
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
                // prettier-ignore
                const constructor
                = seq.constructorOrSequence as SequenceConstructor
                this.liveSequence = new constructor(this.sequences.length)
                this.loadingInstance = true
                this.openParamsModal()
            },
            createSeq: function (
                isInstance: boolean,
                activeSeq: SequenceExportModule
            ) {
                console.log(activeSeq)
                if (isInstance) {
                    // instances are already constructed
                    // prettier-ignore
                    this.liveSequence
                    = activeSeq.constructorOrSequence as SequenceInterface
                }
                const validationResult = this.liveSequence.validate()
                if (validationResult.isValid) {
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
                if (validationResult.isValid) {
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
                liveSequence: new SequenceClassDefault(
                    0
                ) as SequenceInterface,
                loadingInstance: false,
                errors: [] as string[],
            }
        },
    }
</script>

<style scoped>
    ul {
        list-style: none;
    }
</style>
