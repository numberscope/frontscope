<template>
    <div class="card-body">
        <Thumbnail :url="url" v-on:click="openSpecimen" />
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
    import Thumbnail from './Thumbnail.vue'

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
            this.seqName = Specimen.getSequenceNameFromURL(this.url)
            this.specimenName = Specimen.getNameFromURL(this.url)
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
