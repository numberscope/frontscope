<template>
    <div class="card-body">
        <Thumbnail :base64 v-on:click="openSpecimen" />
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
    import {Specimen} from '../shared/Specimen'
    import Thumbnail from './Thumbnail.vue'

    let cid_count = 0

    export default defineComponent({
        name: 'FeaturedCard',
        props: {
            base64: {type: String, required: true},
            lastEdited: {type: String, required: true},
            cid: {
                type: String,
                default: function () {
                    return 'featuredCard-' + cid_count++
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
                            specimen: this.base64,
                        },
                    })
                    .then(window.location.reload)
            },
        },
        mounted() {
            this.seqName = Specimen.getSequenceNameFrom64(this.base64)
            this.specimenName = Specimen.getNameFrom64(this.base64)
        },
        components: {
            Thumbnail,
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
