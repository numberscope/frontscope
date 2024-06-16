<template>
    <div class="card-body" v-on:click="openSpecimen">
        <div
            class="card-preview"
            :id="cid"
            style="pointer-events: none"></div>
        <div class="card-title-box">
            <h5 class="card-title">
                {{ specimenName }}
            </h5>
            <p class="card-text">
                {{ seqName }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import {openSpecimen, openCurrent} from '../shared/browserCaching'
    import {Specimen} from '../shared/Specimen'
    let cid_count = 0

    export default defineComponent({
        name: 'SpecimenCard',
        props: {
            specimenName: {type: String, required: true},
            vizName: {type: String, required: true},
            seqName: {type: String, required: true},
            lastEdited: {type: String, required: false},
            cid: {
                type: String,
                default: function () {
                    return 'Card-' + cid_count++
                },
            },
        },
        methods: {
            openSpecimen() {
                openSpecimen(this.specimenName)
                openCurrent()
            },
        },
        mounted() {
            const specimen = new Specimen(
                this.specimenName,
                this.vizName,
                this.seqName
            )

            const canvasContainer = document.getElementById('' + this.cid)
            if (!(canvasContainer instanceof HTMLElement)) return

            specimen.setup(canvasContainer)
        },
    })
</script>

<style scoped>
    .card-body {
        position: relative;
        width: 216px;
        border: 1px solid var(--ns-color-black);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .card-preview {
        width: 200px;
        height: 200px;
        margin: 8px;
        background-color: #f8f9fa;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card-title-box {
        width: 100%;
        border-top: 1px solid var(--ns-color-black);
        align-items: left;
        text-align: left;
    }
    .card-title {
        font-size: 14px;
        font-weight: var(--ns-font-weight-medium);
        margin-left: 8px;
        margin-bottom: 2px;
        margin-top: 8px;
    }
    .card-text {
        font-size: 12px;
        margin-top: 2px;
        margin-left: 8px;
        margin-bottom: 8px;
        color: #6c757d;
    }
</style>
