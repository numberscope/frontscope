<template>
    <div :id="`SC-${specimenName}`" class="card-body" @click="openSpecimen">
        <Thumbnail :query />
        <div class="card-title-box">
            <div>
                <h5 class="card-title">
                    {{ specimenName
                    }}<a
                        v-if="specimenName.match(/A\d{6}\s*$/)"
                        :href="oeisLinkFor(specimenName)"
                        target="_blank"
                        @click.stop>
                        <div class="info material-icons-sharp external">
                            launch
                        </div>
                    </a>
                </h5>
                <p class="card-text">
                    {{ subtitle }}
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

    import Thumbnail from './Thumbnail.vue'

    import {
        addSequence,
        nameOfQuery,
        oeisLinkFor,
    } from '@/shared/browserCaching'
    import {parseSpecimenQuery} from '@/shared/specimenEncoding'

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
            return {specimenName: ''}
        },
        mounted() {
            this.specimenName = nameOfQuery(this.query)
        },
        methods: {
            openSpecimen() {
                const {sequenceKind, sequenceQuery} = parseSpecimenQuery(
                    this.query
                )
                addSequence(sequenceKind, sequenceQuery)
                this.$router.push(`/?${this.query}`)
                this.$emit('selected')
            },
            deleteSpecimen() {
                this.$emit('specimenDeleted')
            },
            oeisLinkFor,
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
    .high-card {
        background-color: var(--ns-color-primary);
    }
    .fade-card {
        background-color: var(--ns-color-white);
        transition: background-color 2s linear;
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

        a {
            color: var(--ns-color-grey);
            .info {
                transform: scale(0.6);
            }
            .info:hover {
                transform: scale(0.75);
            }
        }
        a:hover {
            color: var(--ns-color-black);
        }
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
        color: var(--ns-color-grey);
        &:hover {
            color: var(--ns-color-black);
        }
    }
</style>
