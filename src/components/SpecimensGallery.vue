<template>
    <div v-if="specimens.length === 0"><em>{No specimens found}</em></div>
    <div v-if="specimens.length" id="toggle-display">
        Display as
        <span :class="asList ? '' : 'chosen'" @click="asList = false">thumbnails
        </span>
        <BasicToggleSwitch v-model="asList" class="tswitch" />
        <span :class="asList ? 'chosen' : ''" @click="asList = true">
            table</span>
    </div>
    <div v-if="specimens.length" id="spec-wrap">
        <div v-if="!asList" :id="galleryID" class="gallery">
            <SpecimenCard
                v-for="specimen in specimens"
                :key="specimen.subtitle + specimen.query"
                :query="specimen.query"
                :subtitle="specimen.subtitle"
                :last-edited="specimen.lastEdited"
                :permanent="!specimen?.canDelete"
                @selected="emit('selected')"
                @specimen-deleted="removeSpecimen(specimen)" />
        </div>
        <table v-if="asList">
            <thead>
                <tr>
                    <th>Name</th>
                    <td>Description</td>
                    <td />
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="specimen in specimens"
                    :key="specimen.subtitle + specimen.query"
                    @click="selectSpecimen(specimen)">
                    <th>
                        <span class="wrappable">{{ specimen.title }}</span>
                        <a
                            v-if="specimen.title.match(/A\d{6}\s*$/)"
                            :href="oeisLinkFor(specimen.title)"
                            target="_blank"
                            @click.stop>
                            <span class="info material-icons-sharp external">
                                launch
                            </span>
                        </a>
                    </th>
                    <td>{{ specimen.subtitle }}</td>
                    <td v-if="specimen.canDelete">
                        <span
                            class="delete-button material-icons-sharp"
                            @click.stop="removeSpecimen(specimen)">
                            delete
                        </span>
                    </td>
                    <td v-if="!specimen.canDelete" />
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
    // Note the :key above needs to include the subtitle so that
    // when the subtitle loads, the card will be replaced.

    import {ref} from 'vue'
    import {useRouter} from 'vue-router'

    import BasicToggleSwitch from './BasicToggleSwitch.vue'
    import SpecimenCard from './SpecimenCard.vue'

    import {addSequence, oeisLinkFor} from '@/shared/browserCaching'
    import {parseSpecimenQuery} from '@/shared/specimenEncoding'

    export interface CardSpecimen {
        query: string
        title: string
        subtitle: string
        lastEdited?: string
        canDelete?: boolean // if not present defaults to false
    }

    const props = defineProps<{
        specimens: CardSpecimen[]
        galleryID?: string
    }>()

    const asList = ref(false)

    const emit = defineEmits(['removeSpecimen', 'selected'])
    const router = useRouter()

    function selectSpecimen(spec: CardSpecimen) {
        const {sequenceKind, sequenceQuery} = parseSpecimenQuery(spec.query)
        addSequence(sequenceKind, sequenceQuery)
        router.push(`/?${spec.query}`)
        emit('selected')
    }

    function removeSpecimen(spec: CardSpecimen) {
        const index = props.specimens.indexOf(spec)
        emit('removeSpecimen', index)
    }
</script>

<style scoped lang="scss">
    #toggle-display {
        height: 32px;
        padding-left: 2em;
    }

    .tswitch {
        display: inline-block;
        position: relative;
        top: 6px;
        padding-left: 4px;
        padding-right: 4px;
    }

    .chosen {
        color: var(--ns-color-primary);
    }

    #spec-wrap {
        overflow: auto;
        height: calc(100% - 32px);
    }

    .gallery {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
        margin-top: 29px;
        gap: 29px;
    }
    thead {
        text-decoration: underline;
    }
    tr:nth-child(even) {
        background-color: var(--ns-color-pale);
    }
    tr:hover {
        background-color: color-mix(
            in srgb,
            var(--ns-color-primary),
            white 70%
        );
    }
    th {
        text-align: left;
        padding-right: 1em;
        font-weight: var(--ns-font-weight-medium);
        white-space: nowrap;
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
        .wrappable {
            white-space: normal;
        }
    }
    td:last-child {
        background-color: var(--ns-color-white);
        text-align: center;
        color: var(--ns-color-grey);
        &:hover {
            color: var(--ns-color-black);
        }
    }

    @media (min-width: $tablet-breakpoint) {
        .gallery {
            gap: 16px;
            margin: 16px 0 0 0;
        }
    }
</style>
