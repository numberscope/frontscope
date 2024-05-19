<template>
    <div id="gallery-content">
        <div id="title-bar">
            <div id="titles">
                <h2 id="title">Specimen gallery</h2>
                <p id="visualizer-name-mobile">Self similarity telescope</p>
            </div>
            <div id="change-button"></div>
        </div>

        <div class="visualizer-bar">
            <p class="visualizer-name">Self similarity telescope</p>
            <div class="arrow"></div>
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

<script setup lang="ts"></script>

<style>
    p,
    h2 {
        margin: 0;
    }
    #gallery-content {
        margin: 30px 20px;
    }

    #title-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    #change-button {
        width: 100px;
        height: 100px;
        background-color: #000000;
    }

    .visualizer-bar {
        display: none;
    }
    .arrow {
        width: 30px;
        height: 30px;
        background-color: #000000;
    }

    .gallery {
        display: grid;
        column-gap: 30px;
        row-gap: 30px;
    }

    .specimen {
        width: 100%;
        height: 300px;
        background-color: #000000;
    }

    @media only screen and (min-width: 1200px) {
        #gallery-content {
            margin: 30px auto;
        }

        #visualizer-name-mobile,
        #change-button {
            display: none;
        }

        .visualizer-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .visualizer-name {
            font-size: 1.5rem;
        }

        .gallery {
            grid-template-columns: repeat(4, max-content);
        }

        .specimen {
            width: 250px;
        }
    }
</style>
