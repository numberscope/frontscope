<template>
    <div class="gallery">
        <SpecimenCard
            v-for="specimen in currentSpecs()"
            :key="specimen.base64"
            :base64="specimen.base64"
            :subtitle="specimen.subtitle"
            :lastEdited="specimen.lastEdited"
            @specimenDeleted="removeSpecimen"
            :permanent="!canDelete" />
    </div>
</template>

<script setup lang="ts">
    import SpecimenCard from './SpecimenCard.vue'
    import {Specimen} from '../shared/Specimen'
    import {ref} from 'vue'

    export interface CardSpecimen {
        base64: string
        subtitle?: string
        lastEdited?: string
    }

    const props = defineProps<{
        canDelete: boolean
        specimens: CardSpecimen[]
    }>()

    const currentSpecimens = ref(props.specimens)

    function currentSpecs() {
        if (currentSpecimens.value.length) return currentSpecimens.value
        currentSpecimens.value = props.specimens
        return currentSpecimens.value
    }

    function removeSpecimen(name: string) {
        const index = currentSpecimens.value.findIndex(
            spec => name === Specimen.getNameFrom64(spec.base64)
        )
        if (index > -1) currentSpecimens.value.splice(index, 1)
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
