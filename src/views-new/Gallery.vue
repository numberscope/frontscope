<template>
    <div id="gallery-content">
        <div id="title-bar">
            <div id="titles">
                <h2 id="title">Specimen gallery</h2>
                <p id="visualizer-name">Self similarity telescope</p>
            </div>
            <div id="change-button"></div>
        </div>

        <div id="gallery">
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
    #gallery-content {
        margin: 30px 20px;
    }

    #title-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    #title,
    #visualizer-name {
        margin: 0;
    }

    #change-button {
        width: 100px;
        height: 100px;
        background-color: #000000;
    }

    #gallery {
        display: grid;
        //grid-template-columns: repeat(1, max-content);
        //column-gap: 30px;
        row-gap: 30px;
        //justify-content: center;
    }

    .specimen {
        width: 100%;
        height: 300px;
        background-color: #000000;
    }
</style>
