<template>
    <div class="gallery">
        <SpecimenCard
            v-for="specimen in currentSpecs()"
            :key="specimen.subtitle + specimen.query"
            :query="specimen.query"
            :subtitle="specimen.subtitle"
            :lastEdited="specimen.lastEdited"
            @specimenDeleted="removeSpecimen"
            :permanent="'canDelete' in specimen && !specimen.canDelete" />
    </div>
</template>

<script setup lang="ts">
    // Note the :key above needs to include the subtitle so that
    // when the subtitle loads, the card will be replaced.
    import SpecimenCard from './SpecimenCard.vue'
    import {nameOfQuery} from '../shared/browserCaching'
    import {ref} from 'vue'

    export interface CardSpecimen {
        query: string
        subtitle?: string
        lastEdited?: string
        canDelete: boolean
    }

    const props = defineProps<{
        specimens: CardSpecimen[]
    }>()

    const emit = defineEmits(['removeSpecimen'])

    const currentSpecimens = ref(props.specimens)

    function currentSpecs() {
        if (currentSpecimens.value.length) return currentSpecimens.value
        currentSpecimens.value = props.specimens
        return currentSpecimens.value
    }

    function removeSpecimen(name: string) {
        const index = currentSpecimens.value.findIndex(
            spec => name === nameOfQuery(spec.query)
        )
        if (index > -1) currentSpecimens.value.splice(index, 1)
        emit('removeSpecimen', name)
    }
</script>

<style scoped lang="scss">
    .gallery {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
        margin-top: 29px;
        gap: 29px;
    }
    @media (min-width: $tablet-breakpoint) {
        .gallery {
            gap: 16px;
            margin: 16px 0 0 0;
        }
    }
</style>
