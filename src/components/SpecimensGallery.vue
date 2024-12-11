<template>
    <div v-if="specimens.length === 0"><em>{No specimens found}</em></div>
    <div v-if="specimens.length" id="toggle-display">
        Display as:
        <span :class="asList ? 'unchosen' : 'chosen'" @click="asList = false">
            thumbnails
        </span>
        <BasicToggleSwitch v-model="asList" class="tswitch" />
        <span :class="asList ? 'chosen' : 'unchosen'" @click="asList = true">
            list</span>
    </div>
    <div v-if="specimens.length" id="spec-wrap">
        <div v-if="!asList" :id="galleryID" class="gallery">
            <SpecimenCard
                v-for="specimen in specimens"
                :key="specimen.subtitle + specimen.query"
                :spec="specimen"
                @selected="emit('selected')"
                @specimen-deleted="removeSpecimen(specimen)" />
        </div>
        <table v-if="asList">
            <thead>
                <tr>
                    <th>{{ nameLabel }}</th>
                    <td>Description</td>
                    <td />
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="specimen in specimens"
                    :key="specimen.subtitle + specimen.query"
                    @click="selectSpecimen(specimen)">
                    <th><SpecimenTitle :spec="specimen" /></th>
                    <td v-safe-html="specimen.subtitle" />
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

    import {ref, watch} from 'vue'
    import {useRouter} from 'vue-router'

    import BasicToggleSwitch from './BasicToggleSwitch.vue'
    import SpecimenCard from './SpecimenCard.vue'
    import SpecimenTitle from './SpecimenTitle.vue'
    import type {CardSpecimen} from './SpecimenCard.vue'

    import {
        LIST,
        THUMBNAILS,
        addSequence,
        getPreferredGallery,
        setPreferredGallery,
    } from '@/shared/browserCaching'
    import {parseSpecimenQuery} from '@/shared/specimenEncoding'

    const props = withDefaults(
        defineProps<{
            specimens: CardSpecimen[]
            galleryID: string
            nameLabel?: string
        }>(),
        {
            nameLabel: 'Name',
        }
    )

    const asList = ref(getPreferredGallery(props.galleryID) === LIST)
    watch(asList, newPref =>
        setPreferredGallery(props.galleryID, newPref ? LIST : THUMBNAILS)
    )

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
        font-weight: var(--ns-font-weight-medium);
        color: var(--ns-color-grey);
    }
    .unchosen {
        color: var(--ns-color-grey);
        cursor: pointer;
    }
    .unchosen:hover {
        color: var(--ns-color-black);
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
    tbody tr {
        cursor: pointer;
    }
    tr:nth-child(even) {
        background-color: var(--ns-color-pale);
    }
    tbody tr:hover {
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
    }
    th::first-letter {
        text-transform: capitalize;
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
