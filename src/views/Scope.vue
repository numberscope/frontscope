<template>
    <NavBar class="navbar">
        <SpecimenBar
            id="specimen-bar-desktop"
            :specimen
            @updateSpecimenName="handleSpecimenUpdate">
        </SpecimenBar>
    </NavBar>
    <div id="specimen-container">
        <tab
            id="sequenceTab"
            class="tab docked"
            docked="top-right"
            :last-coords-x="Math.floor(tabWidth / 3)"
            :last-coords-y="Math.floor(tabWidth / 3)">
            <ParamEditor
                title="Sequence"
                :paramable="specimen.sequence"
                @changed="
                    () => {
                        specimen.updateSequence()
                        updateURL()
                    }
                " />
        </tab>
        <tab
            id="visualiserTab"
            class="tab docked"
            docked="bottom-right"
            last-dropzone="bottom-right"
            :last-coords-x="Math.floor((2 * tabWidth) / 3)"
            :last-coords-y="Math.floor((2 * tabWidth) / 3)">
            <ParamEditor
                title="Visualizer"
                :paramable="specimen.visualizer"
                @changed="() => updateURL()" />
        </tab>
        <SpecimenBar
            id="specimen-bar-phone"
            class="specimen-bar"
            :specimen
            @updateSpecimenName="handleSpecimenUpdate" />
        <!-- 
            The dropzone ids must remain like "[position]-dropzone"
            where [position] is the same as the dropzone attribute.

            This is because the dropzones are looked up by id in the
            tab management code.
        -->
        <div id="main">
            <div
                id="left-dropzone-container"
                class="dropzone-container empty">
                <div class="dropzone-size-wrapper">
                    <div
                        id="top-left-dropzone"
                        class="dropzone empty"
                        dropzone="top-left"></div>
                    <div class="dropzone-resize material-icons-sharp">
                        drag_handle
                    </div>
                </div>
                <div class="dropzone-size-wrapper">
                    <div
                        id="bottom-left-dropzone"
                        class="dropzone empty"
                        dropzone="bottom-left"></div>
                </div>
            </div>
            <div id="canvas-container"></div>
            <div id="right-dropzone-container" class="dropzone-container">
                <div class="dropzone-size-wrapper">
                    <div
                        id="top-right-dropzone"
                        class="dropzone"
                        dropzone="top-right"></div>
                    <div class="dropzone-resize material-icons-sharp">
                        drag_handle
                    </div>
                </div>

                <div class="dropzone-size-wrapper">
                    <div
                        id="bottom-right-dropzone"
                        class="dropzone"
                        dropzone="bottom-right"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import NavBar from './minor/NavBar.vue'
    import SpecimenBar from '../components/SpecimenBar.vue'
    import {openCurrent, updateCurrent} from '@/shared/browserCaching'

    /**
     * Positions a tab to be inside a dropzone
     * Resizes the tab to be the same size as the dropzone
     * @param tab The HTML container that the draggable tab lives in
     * @param dropzone The dropzone the tab is docked to
     */
    export function positionAndSizeTab(
        tab: HTMLElement,
        dropzone: HTMLElement
    ): void {
        if (window.innerWidth < 700) return

        const dropzoneContainer = dropzone.parentElement?.parentElement
        const dropzoneRect = dropzone.getBoundingClientRect()

        const {x, y} = translateCoords(dropzoneRect.x, dropzoneRect.y)

        tab.style.top = y + 'px'
        tab.style.left = x + 'px'
        tab.style.height = dropzoneRect.height + 'px'

        // update the classlist with "minimized"
        // if the height is less or equal than 110
        if (dropzoneRect.height <= 110) {
            tab.classList.add('minimized')
        } else {
            tab.classList.remove('minimized')
        }

        tab.setAttribute('data-x', x.toString())
        tab.setAttribute('data-y', y.toString())

        if (
            tab instanceof HTMLElement
            && dropzoneContainer instanceof HTMLElement
            && dropzone instanceof HTMLElement
            && dropzone.classList.contains('empty')
        ) {
            dropzone.classList.remove('empty')
            dropzone.classList.remove('drop-hover')
            dropzoneContainer.classList.remove('empty')
            tab.classList.add('docked')
            const dropzoneAttribute = dropzone.getAttribute('dropzone')
            if (dropzoneAttribute !== null) {
                tab.setAttribute('docked', dropzoneAttribute)
            }
        }
    }

    /**
     * Translates global (viewport) coordinates into coordinates in
     * the specimen container.
     * @param x x coordinate
     * @param y y coordinate
     */
    export function translateCoords(
        x: number,
        y: number
    ): {x: number; y: number} {
        const specimenContainer = document.querySelector(
            '#specimen-container'
        )
        if (specimenContainer instanceof HTMLElement) {
            const rect = specimenContainer.getBoundingClientRect()

            return {
                x: x - rect.x,
                y: y - rect.y,
            }
        }

        return {x, y}
    }

    /**
     * Places every docked tab back in its position and size.
     * Doesn't affect non-docked tabs.
     * Used when the window is resized.
     */
    export function positionAndSizeAllTabs(): void {
        document.querySelectorAll('.tab').forEach((tab: Element) => {
            if (!(tab instanceof HTMLElement)) return
            if (tab.getAttribute('docked') === 'none') return

            const dropzone = document.querySelector(
                '#' + tab.getAttribute('docked') + '-dropzone'
            )
            if (!(dropzone instanceof HTMLElement)) return

            positionAndSizeTab(tab, dropzone)
        })
    }
    // selects a tab
    export function selectTab(tab: HTMLElement): void {
        deselectTab()
        const drag = tab.querySelector('.drag')
        if (!(drag instanceof HTMLElement)) return

        drag.classList.add('selected')
        drag.style.backgroundColor = 'var(--ns-color-primary)'
        tab.style.zIndex = '100'
    }
    // deselects all tabs
    export function deselectTab(): void {
        const tabs = document.querySelectorAll('.tab')
        tabs.forEach(tab => {
            if (tab instanceof HTMLElement) {
                const drag = tab.querySelector('.drag')
                if (!(drag instanceof HTMLElement)) return
                drag.classList.remove('selected')
                drag.style.backgroundColor = 'var(--ns-color-black)'
                tab.style.zIndex = '1'
            }
        })
    }
</script>

<script setup lang="ts">
    import Tab from '@/components/Tab.vue'
    import interact from 'interactjs'
    import {onMounted, onUnmounted} from 'vue'
    import {useRoute, useRouter} from 'vue-router'
    import ParamEditor from '@/components/ParamEditor.vue'
    import {reactive} from 'vue'
    import {Specimen} from '@/shared/Specimen'

    const router = useRouter()
    const route = useRoute()

    const specimen = reactive(
        typeof route.query.specimen === 'string'
            ? Specimen.decode64(route.query.specimen)
            : openCurrent()
    )
    updateCurrent(specimen)

    const tabWidth = parseInt(
        window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--ns-desktop-tab-width')
    )

    const updateURL = () => {
        updateCurrent(specimen)
        router.push({
            query: {
                specimen: specimen.encode64(),
            },
        })
    }

    function handleSpecimenUpdate(newName: string) {
        specimen.name = newName
        updateURL()
    }

    let canvasContainer: HTMLElement = document.documentElement
    onMounted(() => {
        const specimenContainer = document.getElementById(
            'specimen-container'
        )!
        positionAndSizeAllTabs()

        window.addEventListener('resize', () => {
            positionAndSizeAllTabs()
        })

        canvasContainer = document.getElementById('canvas-container')!
        specimen.setup(canvasContainer)

        setInterval(() => {
            specimen.resized(
                canvasContainer.clientWidth,
                canvasContainer.clientHeight
            )
        }, 500)
    })

    onUnmounted(() => {
        specimen.visualizer.depart(canvasContainer)
    })

    // enable draggables to be dropped into this
    interact('.dropzone').dropzone({
        accept: '.drag',
        // amount of required overlap for drop
        overlap: 0.5,
        // activates when a tab is dragged over a dropzone
        ondragenter: function (event: Interact.InteractEvent) {
            event.target.classList.add('drop-hover')
        },

        // activates when a tab is dragged out of a dropzone
        ondragleave: function (event: Interact.InteractEvent) {
            event.target.classList.remove('drop-hover')

            const dropzone = event.target
            const dropzoneContainer = dropzone.parentElement?.parentElement
            const tab = event.relatedTarget?.parentElement
            if (
                tab instanceof HTMLElement
                && dropzoneContainer instanceof HTMLElement
                && tab.classList.contains('docked')
            ) {
                // Both individual dropzones and their containers have an
                // empty class. It exists to make the dropzones not occupy
                // any space when they are empty. The classes must always be
                // updated with any changes to the tab state.

                dropzone.classList.add('empty')
                tab.classList.remove('docked')
                tab.setAttribute('docked', 'none')

                if (
                    dropzoneContainer.querySelectorAll('.empty').length == 2
                ) {
                    dropzoneContainer.classList.add('empty')
                }
            }
        },

        // activates when tab is dropped in dropzone
        ondrop: function (event) {
            const tab = event.relatedTarget.parentElement
            const dropzone = event.target
            const dropzoneContainer = dropzone.parentElement.parentElement

            if (
                tab instanceof HTMLElement
                && dropzoneContainer instanceof HTMLElement
                && dropzone.classList.contains('empty')
            ) {
                dropzone.classList.remove('empty')
                dropzone.classList.remove('drop-hover')
                dropzoneContainer.classList.remove('empty')
                tab.classList.add('docked')
                tab.setAttribute('docked', dropzone.getAttribute('dropzone'))

                positionAndSizeTab(tab, dropzone)
            }
        },
    })

    interact('.dropzone-size-wrapper').resizable({
        manualStart: false,
        inertia: false,
        autoScroll: false,

        edges: {
            left: false,
            right: false,
            bottom: '.dropzone-resize',
            top: false,
        },

        listeners: {
            start() {
                document.body.style.userSelect = 'none'
            },

            end() {
                document.body.style.userSelect = 'auto'
            },

            move(event: Interact.InteractEvent) {
                const dropzoneWrapper = event.target
                const dropzoneCont =
                    dropzoneWrapper.parentElement?.parentElement

                if (
                    dropzoneWrapper instanceof HTMLElement
                    && dropzoneCont instanceof HTMLElement
                ) {
                    const dropContRect = dropzoneCont.getBoundingClientRect()

                    dropzoneWrapper.style.height =
                        Math.min(
                            event.rect.height,
                            dropContRect.height - 90
                        ) + 'px'
                    dropzoneWrapper.classList.add('resized')
                    positionAndSizeAllTabs()
                }
            },
        },
        modifiers: [
            // keep the edges inside the screen
            interact.modifiers.restrictEdges({
                outer: '#speciment-container',
            }),

            // minimum size
            interact.modifiers.restrictSize({
                min: {width: 700, height: 90},
            }),
        ],
    })
</script>

<style scoped lang="scss">
    // mobile styles
    .navbar {
        display: unset;
    }
    #specimen-bar-desktop {
        display: none;
    }
    #main {
        display: flex;
        height: 100%;
    }
    #specimen-container {
        height: calc(100vh - 54px);
        position: relative;
    }
    #main {
        display: flex;
        height: 100%;
    }

    #canvas-container {
        flex: 1;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dropzone-container {
        display: flex;
        flex-direction: column;
        min-height: fit-content;
        padding-left: auto;
        padding-right: auto;
        z-index: 0;
    }
    .dropzone-container {
        display: none;
    }
    #canvas-container {
        order: 1;
        border-bottom: 1px solid var(--ns-color-black);
        height: 301px;
        width: 100%;
        z-index: -1;
    }
    #sequenceTab {
        width: 100%;
        padding-left: auto;
        padding-right: auto;
        order: 3;
        border-bottom: 1px solid var(--ns-color-black);
        height: fit-content;
    }
    #visualiserTab {
        width: 100%;
        padding-left: auto;
        padding-right: auto;
        order: 4;
        border-bottom: 1px solid var(--ns-color-black);
        height: fit-content;
    }
    #specimen-bar-phone {
        order: 2;
        padding-left: auto;
        padding-right: auto;
        border-bottom: 1px solid var(--ns-color-black);
    }
    // desktop styles
    @media (min-width: 700px) {
        #specimen-bar-desktop {
            display: flex;
        }
        .navbar {
            display: unset;
        }
        #specimen-bar-phone {
            display: none;
            border: 0px;
        }
        #sequenceTab,
        #visualiserTab {
            width: var(--ns-desktop-tab-width);
        }
        #specimen-container {
            height: calc(100vh - 54px);
            position: relative;
        }
        #main {
            display: flex;
            height: 100%;
        }

        #canvas-container {
            height: unset;
            order: unset;
            flex: 1;
            position: relative;
            overflow: hidden;
        }

        .dropzone-container {
            display: flex;
            flex-direction: column;
            width: var(--ns-desktop-tab-width);
            height: 100%;

            &#right-dropzone-container {
                right: 0;
                top: 0;
            }

            &#left-dropzone-container {
                left: 0;
                top: 0;
            }

            &.empty {
                position: absolute;
                pointer-events: none;

                .dropzone-resize.material-icons-sharp {
                    display: none;
                }
            }

            .dropzone-size-wrapper {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                max-height: calc(100% - 90px);

                &.resized {
                    flex-grow: unset;
                }

                .dropzone-resize {
                    height: 16px;
                    font-size: 16px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: ns-resize;
                }

                .dropzone {
                    flex-grow: 1;

                    &.drop-hover {
                        background-color: var(--ns-color-primary);
                        filter: brightness(120%);
                    }
                }
            }
        }

        .tab {
            width: 300px;
            position: absolute;
            order: unset;
        }
    }
</style>
