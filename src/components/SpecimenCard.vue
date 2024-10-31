<template>
    <div class="card-body" @click="openSpecimen">
        <Thumbnail :query />
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
                style="padding-right: 15px"
                @click.stop="deleteSpecimen">
                <span class="delete-button material-icons-sharp">
                    delete
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import {Specimen} from '../shared/Specimen'
    import {deleteSpecimen, nameOfQuery} from '../shared/browserCaching'
    import Thumbnail from './Thumbnail.vue'

    let cid_count = 0

    export default defineComponent({
        name: 'SpecimenCard',
        components: {
            Thumbnail,
        },
        props: {
            query: {type: String, required: true},
            lastEdited: {type: String, default: ''},
            subtitle: {type: String, default: ''},
            permanent: {type: Boolean},
            cid: {
                type: String,
                default: function () {
                    return 'Card-' + cid_count++
                },
            },
        },
        emits: ['specimenDeleted', 'selected'],
        data() {
            return {specimenName: '', useSub: ''}
        },
        mounted() {
            this.specimenName = nameOfQuery(this.query)
            if (this.subtitle) this.useSub = this.subtitle
            else this.useSub = Specimen.getSequenceNameFromQuery(this.query)
        },
        methods: {
            openSpecimen() {
                this.$router.push(`/?${this.query}`)
                this.$emit('selected')
            },
            deleteSpecimen() {
                deleteSpecimen(this.specimenName)
                this.$emit('specimenDeleted', this.specimenName)
            },
        },
    })
</script>

<style scoped>
    .card-body {
        position: relative;
        width: var(--ns-specimen-card-width);
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
        align-items: start;
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
        margin-right: 8px;
        margin-bottom: 8px;
        color: #6c757d;
    }
    .delete-button {
        user-select: none;
        margin-top: 1ex;
    }
</style>
