<template>
    <div class="gallery">
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
</template>

<script setup lang="ts">
    // Note the :key above needs to include the subtitle so that
    // when the subtitle loads, the card will be replaced.
    import SpecimenCard from './SpecimenCard.vue'

    export interface CardSpecimen {
        query: string
        subtitle?: string
        lastEdited?: string
        canDelete?: boolean // if not present defaults to false
    }

    const props = defineProps<{
        specimens: CardSpecimen[]
    }>()

    const emit = defineEmits(['removeSpecimen', 'selected'])

    function removeSpecimen(spec: CardSpecimen) {
        const index = props.specimens.indexOf(spec)
        emit('removeSpecimen', index)
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
