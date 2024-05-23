<template>
    <div id="gallery-content">
        <div id="header-mobile">
            <div>
                <h2>Specimen gallery</h2>
                <h3>Self similarity telescope</h3>
            </div>
            <div type="button" id="change-button">
                <img :src="swap" alt="Swap icon" id="change-icon" />
                <p id="change-text">Change Visualizer</p>
            </div>
        </div>

        <h1 id="header">Specimen gallery</h1>

        <div type="button" class="visualizer-bar">
            <h2>Self similarity telescope</h2>
            <img :src="arrow" alt="Arrow up" />
        </div>
        <div class="gallery">
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
        </div>

        <div type="button" class="visualizer-bar">
            <h2>Self similarity telescope</h2>
            <img :src="arrow" alt="Arrow up" />
        </div>
        <div class="gallery">
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
            <div class="specimen"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import swap from '../assets/img/icons/swap.svg'
    import arrow from '../assets/img/icons/arrow.svg'
</script>

<style>
    p,
    h1,
    h2,
    h3 {
        margin: 0;
    }
    h1 {
        font-size: 24pt;
    }
    h2 {
        font-size: 16pt;
    }
    h3 {
        font-size: 12pt;
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
    }
    #change-icon {
        display: block;
        margin: auto;
    }
    #change-text {
        font-size: 10pt;
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
        justify-content: space-between;
        margin-top: 29px;
        gap: 29px;
    }

    .specimen {
        width: 216px;
        height: 268px;
        background-color: #000000;
        flex-grow: 1;
    }

    @media only screen and (min-width: 480px) {
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
