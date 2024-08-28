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
        <SpecimensGallery
            id="featured-gallery"
            v-if="showFeatured"
            :specimens="featured"
            :canDelete="false" />

        <div type="button" class="visualizer-bar">
            <h2>Saved Specimens</h2>
            <span
                :class="['material-icons-sharp', savedArrowClass]"
                style="user-select: none"
                @click="toggleSpecimens">
                keyboard_arrow_up
            </span>
        </div>
        <SpecimensGallery
            id="saved-gallery"
            v-if="showSaved"
            :specimens="saved" />
    </div>
</template>

<script setup lang="ts">
    import SpecimensGallery from '../components/SpecimensGallery.vue'
    import {ref, onMounted, computed} from 'vue'
    import {getSIMs} from '../shared/browserCaching'
    import {getFeatured} from '../shared/defineFeatured'
    import type {SIM} from '../shared/browserCaching'
    import NavBar from '../views/minor/NavBar.vue'

    const saved = ref<SIM[]>([])
    const featured = ref<SIM[]>([])

    const showFeatured = ref(true)
    const showSaved = ref(true)
    const featuredArrowClass = computed(() =>
        showFeatured.value ? 'arrow-up' : 'arrow-down'
    )
    const savedArrowClass = computed(() =>
        showSaved.value ? 'arrow-up' : 'arrow-down'
    )

    function toggleFeatured() {
        showFeatured.value = !showFeatured.value
    }

    function toggleSpecimens() {
        showSaved.value = !showSaved.value
    }

    function loadFeatured() {
        featured.value = getFeatured()
    }

    function loadSaved() {
        saved.value = getSIMs()
    }

    onMounted(() => {
        loadFeatured()
        loadSaved()
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
        margin-top: 3ex;
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
        }

        .visualizer-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
    }
</style>
