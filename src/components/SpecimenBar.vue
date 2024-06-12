<template>
    <div class="specimen-bar">
        <div class="input-container">
            <label>
                Specimen name
                <input type="text" />
            </label>

            <div class="desc-tooltip">
                <span class="help material-icons-sharp">help</span>
                <div class="desc-tooltip-text">
                    You can enter the name you want to give this specimen
                </div>
            </div>
        </div>
        <div class="button material-icons-sharp" @click="refresh">
            refresh
        </div>
        <div
            id="#pause-button"
            class="button material-icons-sharp"
            @click="togglePause">
            pause
        </div>
        <div class="button material-icons-sharp">share</div>
        <div class="button material-icons-sharp">save</div>
    </div>
</template>

<script setup lang="ts">
    import {specimen} from '../views/Scope.vue'
    import {visualizer} from '../views/Scope.vue'
    // true if paused, false if playing
    let paused = false
    // refreshes the specimen
    function refresh() {
        specimen.updateSequence()
        paused = false
        updateButtons()
    }
    function updateButtons() {
        const playButton = document.getElementById('#pause-button')
        if (!(playButton instanceof HTMLElement)) return
        playButton.innerHTML = paused ? 'play_arrow' : 'pause'
    }
    // toggles the pause state
    function togglePause() {
        if (paused) {
            // continue the visualizer
            visualizer.continue()
            paused = false
            console.log('unpaused')
        } else {
            // pause the visualizer
            visualizer.stop()
            paused = true
            console.log('paused')
        }
        updateButtons()
    }
</script>
<style>
    .specimen-bar {
        display: flex;
        flex-direction: row;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
    }
    label {
        font-size: 12px;
        width: 100%;
    }

    input {
        &[type='text'] {
            border: none;
            border-bottom: 1.5px solid var(--ns-color-black);
            font-size: 14px;
            padding: 6px 8px 6px 8px;
            width: 100%;

            &:focus {
                border-bottom: 1.5px solid var(--ns-color-primary);
                outline: none;
            }
        }
    }
    .button {
        border: 1px solid var(--ns-color-black);
        color: var(--ns-color-grey);
        cursor: pointer;
        user-select: none;
    }
    select {
        border: 1px solid var(--ns-color-black);
        background-color: var(--ns-color-white);
        display: block;
        width: 100%;
        padding: 8px;
        margin-top: 4px;

        &:focus {
            outline: 3px solid var(--ns-color-primary);
            border: none;
        }
    }
    .help {
        color: var(--ns-color-black);
    }
    .param-description {
        font-size: 12px;
        color: var(--ns-color-grey);
        margin-bottom: 8px;
        margin-top: 0px;
    }

    .input-container {
        display: flex;
        flex-direction: row;
        position: relative;
    }

    .desc-tooltip {
        position: absolute;
        display: inline-block;
        cursor: default;
        right: 4px;
        bottom: 4px;
    }

    .desc-tooltip .desc-tooltip-text {
        visibility: hidden;
        width: 240px;
        background-color: var(--ns-color-white);
        color: var(--ns-color-black);
        text-align: left;
        border: 1px solid var(--ns-color-black);
        padding: 8px;
        font-size: 12px;

        position: absolute;
        z-index: 1;
        right: 0;
        margin-left: -120px;

        opacity: 0;
        transition:
            opacity 0.2s,
            visibility 0.2s;
    }

    .desc-tooltip:hover .desc-tooltip-text {
        visibility: visible;
        opacity: 1;
    }
</style>
