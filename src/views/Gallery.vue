<template>
    <NavBar class="navbar" />
    <div id="gallery-content">
        <div id="header-mobile">
            <div>
                <h2>Specimen gallery</h2>
                <h3>Featured Gallery</h3>
            </div>
            <div type="button" id="change-button">
                <span class="material-icons-sharp">swap_horiz</span>
                <p id="change-text">Select Visualizer</p>
            </div>
        </div>

        <h1 id="header">Specimen gallery</h1>

        <div type="button" class="visualizer-bar">
            <h2>Featured Gallery</h2>
            <span
                id="featured-arrow"
                :class="['material-icons-sharp', featuredArrowClass]"
                style="user-select: none"
                @click="toggleFeatured">
                keyboard_arrow_up</span
            >
        </div>
        <div id="featured-gallery" class="gallery" v-if="showFeatured">
            <FeaturedCard
                v-for="specimen in featured"
                :key="specimen.url"
                :url="specimen.url"
                :lastEdited="specimen.lastEdited">
            </FeaturedCard>
        </div>

        <div type="button" class="visualizer-bar">
            <h2>Saved Specimens</h2>
            <span
                :class="['material-icons-sharp', specimensArrowClass]"
                style="user-select: none"
                @click="toggleSpecimens">
                keyboard_arrow_up</span
            >
        </div>
        <div id="saved-gallery" class="gallery" v-if="showSpecimens">
            <SpecimenCard
                v-for="specimen in specimens"
                :key="specimen.url"
                :url="specimen.url"
                :lastEdited="specimen.lastEdited"
                @specimenDeleted="loadSpecimens">
            </SpecimenCard>
        </div>
    </div>
    <Footer />
</template>

<script setup lang="ts">
    import SpecimenCard from '../components/SpecimenCard.vue'
    import NavBar from '../views/minor/NavBar.vue'
    import Footer from '../views/minor/Footer.vue'
    import FeaturedCard from '../components/FeaturedCard.vue'
    import {ref, onMounted, computed} from 'vue'
    import {getSIMs} from '../shared/browserCaching'
    import {getFeatured} from '../shared/defineFeatured'
    import type {SIM} from '../shared/browserCaching'

    interface cardSpecimen {
        url: string
        lastEdited: string
    }

    const specimens = ref<cardSpecimen[]>([])
    const featured = ref<cardSpecimen[]>([])

    const showFeatured = ref(true)
    const showSpecimens = ref(true)
    const featuredArrowClass = computed(() =>
        showFeatured.value ? 'arrow-up' : 'arrow-down'
    )
    const specimensArrowClass = computed(() =>
        showSpecimens.value ? 'arrow-up' : 'arrow-down'
    )

    function toggleFeatured() {
        showFeatured.value = !showFeatured.value
    }

    function toggleSpecimens() {
        showSpecimens.value = !showSpecimens.value
    }

    function loadFeatured() {
        const savedSIMs: SIM[] = getFeatured()
        featured.value = SIMstoCards(savedSIMs)
    }

    function loadSpecimens() {
        const savedSIMs: SIM[] = getSIMs()
        specimens.value = SIMstoCards(savedSIMs)
    }

    function SIMstoCards(savedSIMs: SIM[]): cardSpecimen[] {
        const cardSpecs: cardSpecimen[] = []
        for (let i = 0; i < savedSIMs.length; i++) {
            const url = savedSIMs[i].url
            const date = savedSIMs[i].date

            cardSpecs.push({
                url: url,
                lastEdited: date,
            })
        }
        return cardSpecs
    }

    onMounted(() => {
        loadFeatured()
        loadSpecimens()
    })
</script>

<style scoped>
    p,
    h1,
    h2,
    h3 {
        margin: 0;
    }
    h1 {
        font-size: var(--ns-size-title);
    }
    h2 {
        font-size: var(--ns-size-heading);
    }
    h3 {
        font-size: var(--ns-size-subheading);
    }

    #gallery-content {
        margin: 16px;
    }

    #header-mobile {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0;
    }
    #change-button {
        max-width: 100px;
        width: min-content;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #change-icon {
        display: block;
        margin: auto;
    }
    #change-text {
        font-size: var(--ns-size-mini);
        text-align: center;
    }

    #header {
        display: none;
    }

    .visualizer-bar {
        display: none;
    }

    .gallery {
        display: flex;
        flex-wrap: wrap;
        justify-content: left;
        margin-top: 29px;
        gap: 29px;
    }

    .arrow-up {
        transform: rotate(0deg);
        transition: transform 0.3s;
    }

    .arrow-down {
        transform: rotate(180deg);
        transition: transform 0.3s;
    }

    @media (min-width: 580px) {
        #gallery-content {
            margin: 32px auto;
            padding: 0 16px;
            max-width: 1000px;
            width: 100%;
        }

        #header-mobile {
            display: none;
        }

        #header {
            display: block;
            margin-bottom: 16px;
        }

        .visualizer-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .gallery {
            gap: 16px;
            margin: 0 0 16px 0;
        }
    }
</style>
