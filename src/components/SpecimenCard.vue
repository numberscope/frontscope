<template>
    <div class="card-body">
        <div class="card-preview" :id="cid" v-on:click="openSpecimen"></div>
        <div class="card-title-box">
            <div>
                <h5 class="card-title">
                    {{ specimenName }}
                </h5>
                <p class="card-text">
                    {{ seqName }}
                </p>
            </div>
            <div v-on:click="deleteSpecimen" style="padding-right: 15px">
                <span class="material-icons-sharp" style="user-select: none"
                    >delete</span
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import {Specimen} from '../shared/Specimen'
    import {deleteSpecimen} from '../shared/browserCaching'

    let cid_count = 0

    export default defineComponent({
        name: 'SpecimenCard',
        props: {
            url: {type: String, required: true},
            lastEdited: {type: String, required: true},
            cid: {
                type: String,
                default: function () {
                    return 'Card-' + cid_count++
                },
            },
        },
        data() {
            return {
                seqName: '',
                specimenName: '',
            }
        },
        methods: {
            openSpecimen() {
                this.$router
                    .push({
                        path: '/',
                        query: {
                            specimen: this.url,
                        },
                    })
                    .then(window.location.reload)
            },
            deleteSpecimen() {
                deleteSpecimen(this.specimenName)
                this.$emit('specimenDeleted', this.specimenName)
            },
        },
        mounted() {
            const specimen = Specimen.fromURL(this.url)

            this.seqName = specimen.sequence.name
            this.specimenName = specimen.name

            const canvasContainer = document.getElementById('' + this.cid)
            if (!(canvasContainer instanceof HTMLElement)) return

            specimen.setup(canvasContainer)
            specimen.visualizer.isValid = true
            specimen.sequence.isValid = true
            specimen.visualizer.assignParameters()
            specimen.sequence.assignParameters()
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
        display: flex;
        align-items: center;
        justify-content: space-between;
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
