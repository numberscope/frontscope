<template>
    <div class="card-body" v-on:click="openSpecimen">
        <Thumbnail :base64 />
        <div class="card-title-box">
            <div>
                <h5 class="card-title">
                    {{ specimenName }}
                </h5>
                <p class="card-text">
                    {{ useSub }}
                </p>
            </div>
            <div
                v-if="!permanent"
                v-on:click.stop="deleteSpecimen"
                style="padding-right: 15px">
                <span class="material-icons-sharp" style="user-select: none">
                    delete
                </span>
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
            base64: {type: String, required: true},
            lastEdited: {type: String},
            subtitle: {type: String},
            permanent: {type: Boolean},
            cid: {
                type: String,
                default: function () {
                    return 'Card-' + cid_count++
                },
            },
        },
        data() {
            return {specimenName: '', useSub: ''}
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
                    .then(_value => window.location.reload())
            },
            deleteSpecimen() {
                deleteSpecimen(this.specimenName)
                this.$emit('specimenDeleted', this.specimenName)
            },
        },
        mounted() {
            this.specimenName = Specimen.getNameFrom64(this.base64)
            if (this.subtitle) this.useSub = this.subtitle
            else this.useSub = Specimen.getSequenceNameFrom64(this.base64)
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
        cursor: pointer;
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
