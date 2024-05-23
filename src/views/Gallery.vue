<template>
    <div>
        <p>Gallery page will be here</p>
        <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
    </div>
</template>

<script setup lang="ts">
    import SpecimenCard from '../components/SpecimenCard.vue'

    const sequenceName = '2-acid val of Z'
    const cardName = 'Pinstripe'
</script>

<style lang="scss" scoped></style>
