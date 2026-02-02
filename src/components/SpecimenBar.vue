<template>
    <div class="title-and-button-bar">
        <div class="input-container">
            <label>
                Specimen name
                <input
                    id="spec-name"
                    type="text"
                    :value="specimen.name"
                    @keyup.enter="blurName()"
                    @input="updateName($event)">
            </label>

            <div class="desc-tooltip tooltip-anchor">
                <span class="help material-icons-sharp">help</span>
                <div class="desc-tooltip-text help-box shadowed">
                    You can enter the name you want to give this specimen
                </div>
            </div>
        </div>
        <div class="button-container">
            <div
                id="refresh-button"
                class="button material-icons-sharp"
                @click="refresh">
                refresh
            </div>
            <div
                id="pause-button"
                v-safe-html="playPause"
                class="button material-icons-sharp"
                @click="togglePause" />
            <div
                id="share-button"
                class="button material-icons-sharp"
                @click="shareUrl">
                share
                <div id="share-popup" class="notification help-box">
                    URL copied to clipboard!
                </div>
            </div>
            <div>
                <div
                    id="save-button"
                    class="button material-icons-sharp"
                    @click="checkSave()">
                    save
                </div>
                <div id="save-popup" class="notification help-box">
                    Saved to gallery!
                </div>
                <div id="overwrite-popup" class="notification help-box">
                    <div id="overwrite-text">
                        You already have a specimen with the same name, do you
                        want to overwrite it?
                    </div>
                    <div id="confirm-overwrite">
                        <div class="overwrite-button" @click="saveCurrent">
                            yes
                        </div>
                        <div
                            class="overwrite-button"
                            @click="removeOverwritePopup">
                            no
                        </div>
                    </div>
                </div>
            </div>
            <div
                id="download-button"
                class="button material-icons-sharp"
                @click="downloadSpecimen">
                download
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {onMounted, ref} from 'vue'
    import type {PropType, UnwrapNestedRefs} from 'vue'

    import {saveSpecimen, getSIMByName} from '@/shared/browserCaching'
    import type {Specimen} from '@/shared/Specimen'
    import {DrawingStopped} from '@/visualizers/VisualizerInterface'

    const props = defineProps({
        specimen: {
            type: Object as PropType<UnwrapNestedRefs<Specimen>>,
            required: true,
        },
    })

    const playPause = ref<string>('pause')
    const updatePP = () => {
        playPause.value =
            props.specimen.visualizer.drawingState === DrawingStopped
                ? 'play_arrow'
                : 'pause'
    }

    // TODO: Find a solution for updating the play/pause indicator that does
    // not involve polling. I tried making playPause a computed value based
    // on props.specimen.visualizer.drawingState, and that usually worked,
    // but for a few complicated visualizers like the Chaos Game in the
    // Featured Gallery, it would "miss" the change to the stopped state,
    // defeating the testing.
    onMounted(() => setInterval(updatePP, 500))

    const emit = defineEmits(['updateSpecimenName'])

    function updateName(event: Event) {
        if (event && event.target) {
            const inputBox = event.target as HTMLInputElement
            emit('updateSpecimenName', inputBox.value)
        }
    }

    function blurName() {
        window.document.getElementById('spec-name')?.blur()
    }

    function refresh() {
        props.specimen.updateSequence()
    }

    function togglePause() {
        if (props.specimen.visualizer.drawingState === DrawingStopped) {
            props.specimen.visualizer.continue()
        } else props.specimen.visualizer.stop()
        updatePP()
    }

    function shareUrl() {
        const url = window.location.href
        navigator.clipboard.writeText(url)

        const notification = document.getElementById('share-popup')
        if (!(notification instanceof HTMLElement)) return

        //show notification for 2 seconds
        notification.style.visibility = 'visible'
        notification.style.opacity = '1'
        setTimeout(() => {
            notification.style.visibility = 'hidden'
            notification.style.opacity = '0'
        }, 2000)
    }

    function checkSave() {
        // get specimen name
        const name = document.querySelector('input[type="text"]')
        if (!(name instanceof HTMLInputElement)) return
        const specimenName = name.value

        const existingSpecimen = getSIMByName(specimenName)
        if (existingSpecimen) {
            const overwrite = document.getElementById('overwrite-popup')
            if (!(overwrite instanceof HTMLElement)) return
            overwrite.style.visibility = 'visible'
            overwrite.style.opacity = '1'
        } else saveCurrent() // not in database, so safe to save
    }

    function saveCurrent() {
        removeOverwritePopup()
        saveSpecimen(props.specimen.query)

        const notification = document.getElementById('save-popup')
        if (!(notification instanceof HTMLElement)) return

        //show notification for 2 seconds
        notification.style.visibility = 'visible'
        notification.style.opacity = '1'
        setTimeout(() => {
            notification.style.visibility = 'hidden'
            notification.style.opacity = '0'
        }, 2000)
    }

    function removeOverwritePopup() {
        const overwrite = document.getElementById('overwrite-popup')
        if (!(overwrite instanceof HTMLElement)) return
        setTimeout(() => {
            overwrite.style.visibility = 'hidden'
            overwrite.style.opacity = '0'
        }, 10)
    }

    function downloadSpecimen() {
        // get specimen input box and the canvas
        const name = document.querySelector('input[type="text"]')
        const canvas = document.querySelector('#canvas-container canvas')

        if (!(name instanceof HTMLInputElement)) return
        if (!(canvas instanceof HTMLCanvasElement)) return

        // get specimen name
        const specimenName = name.value
        //create a link from the canvas
        const canvasURL = canvas.toDataURL()

        // create a link element and download the canvas
        const link = document.createElement('a')
        link.href = canvasURL
        link.download = `${specimenName}.png`
        link.click()
    }
</script>

<style>
    /* Note NOT scoped, these are global styles, used also (for example)
       in ParamEditor.vue.
     */
    .title-and-button-bar {
        display: flex;
        flex-direction: row;
        gap: 8px;
        justify-content: space-between;
        align-items: end;
        padding-top: 8px;
        padding-bottom: 8px;
    }
    label {
        font-size: 12px;
        width: 100%;
    }
    input {
        &[type='text'] {
            border: none;
            border-bottom: 1.5px solid var(--ns-color-black);
            font-size: var(--ns-size-heading-2);
            background-color: inherit;
            padding: 6px 8px 6px 8px;
            width: 100%;

            &:focus {
                border-bottom: 1.5px solid var(--ns-color-primary);
                outline: none;
            }
        }
    }
    .button-container {
        display: flex;
        gap: 8px;
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

            &:hover {
                color: var(--ns-color-black);
            }
        }
    }

    .help {
        color: var(--ns-color-black);
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
    #share-popup {
        translate: -210px 0px;
    }
    #save-popup {
        translate: -210px 0px;
    }
    #overwrite-popup {
        translate: -210px 0px;
    }
    #confirm-overwrite {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-left: 8px;
        margin-right: 8px;
    }
    #overwrite-text {
        color: var(--ns-color-grey);
        margin-bottom: 8px;
        margin-top: 0px;
    }
    .overwrite-button {
        padding: 2px;
        text-align: center;
        vertical-align: middle;
        font-size: 16px;
        border: 1px solid var(--ns-color-black);
        color: var(--ns-color-grey);
        cursor: pointer;
        user-select: none;
    }
    .help-box {
        line-height: normal;
        text-wrap: wrap;
        visibility: hidden;
        width: max-content;
        max-width: 240px;
        background-color: var(--ns-color-surface);
        color: var(--ns-color-black);
        text-align: left;
        border: 1px solid var(--ns-color-black);
        padding: 8px;
        font-size: 11px;

        position: absolute;
        z-index: 10000;
        opacity: 0;
        transition:
            opacity 0.2s,
            visibility 0.2s;
    }
    .tooltip-anchor .desc-tooltip-text {
        right: 0;
    }

    .tooltip-anchor:hover .desc-tooltip-text {
        visibility: visible;
        opacity: 1;
    }
</style>
