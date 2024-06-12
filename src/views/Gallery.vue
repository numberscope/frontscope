<template>
    <div id="gallery-content">
        <div id="header-mobile">
            <div>
                <h2>Specimen gallery</h2>
                <h3>Self similarity telescope</h3>
            </div>
            <div type="button" id="change-button">
                <span class="material-icons-sharp">swap_horiz</span>
                <p id="change-text">Select Visualizer</p>
            </div>
        </div>

        <h1 id="header">Specimen gallery</h1>

        <div type="button" class="visualizer-bar">
            <h2>Self similarity telescope</h2>
            <span class="material-icons-sharp">keyboard_arrow_up</span>
        </div>
        <div class="gallery">
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
        </div>

        <div type="button" class="visualizer-bar">
            <h2>Self similarity telescope</h2>
            <span class="material-icons-sharp">keyboard_arrow_up</span>
        </div>
        <div class="gallery">
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
            <SpecimenCard :seqName="sequenceName" :cardName="cardName" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import SpecimenCard from '../components/SpecimenCard.vue'

    const sequenceName = '2-acid val of Z'
    const cardName = 'Pinstripe'
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
        justify-content: space-evenly;
        margin-top: 29px;
        gap: 29px;
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
