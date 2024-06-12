<template>
    <div class="specimen-bar">
        <div class="input-container">
            <label>
                Specimen name
                <input type="text" />
            </label>

            <div class="desc-tooltip">
                <span class="help material-icons-sharp">help</span>
                <div class="desc-tooltip-text help-box">
                    You can enter the name you want to give this specimen
                </div>
            </div>
        </div>
        <div class="button material-icons-sharp" @click="refresh">
            refresh
        </div>
        <div
            id="pause-button"
            class="button material-icons-sharp"
            @click="togglePause">
            pause
        </div>
        <div
            id="share-button"
            class="button material-icons-sharp"
            @click="shareUrl">
            share
            <div class="copy-notification help-box">Copied to clipboard!</div>
        </div>

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
        // find the pause button and change the icon based on 'paused'.
        const playButton = document.getElementById('pause-button')
        if (!(playButton instanceof HTMLElement)) return
        playButton.innerHTML = paused ? 'play_arrow' : 'pause'
        console.log('updated buttons')
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
    function shareUrl() {
        //get url
        const url = window.location.href
        //copy to clipboard

        const clipboard = navigator.clipboard
        console.log(clipboard)
        clipboard.writeText(url)

        const notification = document.querySelector('.copy-notification')
        if (!(notification instanceof HTMLElement)) return

        //show notification for 2 seconds
        notification.style.visibility = 'visible'
        notification.style.opacity = '1'
        setTimeout(() => {
            notification.style.visibility = 'hidden'
            notification.style.opacity = '0'
        }, 2000)
    }
</script>
<style>
    .specimen-bar {
        display: flex;
        flex-direction: row;
        gap: 8px;
        justify-content: space-between;
        align-items: flex-end;
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
        min-width: 30px;
        text-align: center;
        width: 30px;
        height: 30px;
        line-height: 30px;
        vertical-align: middle;
        font-size: 24px;
        border: 1px solid var(--ns-color-black);
        color: var(--ns-color-grey);
        cursor: pointer;
        user-select: none;
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
    .copy-notification {
        translate: -210px 0px;
    }
    .help-box {
        overflow: hidden;
        visibility: hidden;
        width: 240px;
        background-color: var(--ns-color-white);
        color: var(--ns-color-black);
        text-align: left;
        border: 1px solid var(--ns-color-black);
        padding: 8px;
        font-size: 12px;

        position: absolute;
        z-index: 10000;
        opacity: 0;
        transition:
            opacity 0.2s,
            visibility 0.2s;
    }
    .desc-tooltip .desc-tooltip-text {
        right: 0;
    }

    .desc-tooltip:hover .desc-tooltip-text {
        visibility: visible;
        opacity: 1;
    }
</style>
