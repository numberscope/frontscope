<template>
    <div id="specimen-container">
        <tab id="sequenceTab" class="tab docked" docked="top-right">
            <ParamEditor
                title="Sequence"
                :paramable="specimen.getSequence()" />
        </tab>
        <tab id="visualiserTab" class="tab docked" docked="bottom-right">
            <ParamEditor
                title="Visualizer"
                :paramable="specimen.getVisualizer()" />
        </tab>

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
    export function positionAndSizeTab(
        tab: HTMLElement,
        dropzone: HTMLElement
    ): void {
        const dropzoneRect = dropzone.getBoundingClientRect()

        const {x, y} = translateCoords(dropzoneRect.x, dropzoneRect.y)

        tab.style.top = y + 'px'
        tab.style.left = x + 'px'
        tab.style.height = dropzoneRect.height + 'px'

        tab.setAttribute('data-x', x.toString())
        tab.setAttribute('data-y', y.toString())
    }

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
</script>

<script setup lang="ts">
    import Tab from '@/components/Tab.vue'
    import interact from 'interactjs'
    import {onMounted} from 'vue'
    import ParamEditor from '@/components/ParamEditor.vue'
    import vizMODULES from '@/visualizers/visualizers'
    import {exportModule} from '@/sequences/Naturals'
    import {reactive} from 'vue'
    import {Specimen} from '@/shared/Specimen'

    const sequence = new exportModule.sequence(0)
    const visualizer = new vizMODULES['ModFill'].visualizer(sequence)

    const specimen = reactive(new Specimen(visualizer, sequence))

    // This function makes sure that the tabs remain in their docked position
    // when the window is resized
    function positionAndSizeAllTabs(): void {
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

    onMounted(() => {
        positionAndSizeAllTabs()

        window.addEventListener('resize', () => {
            positionAndSizeAllTabs()
        })
        specimen.setup(document.getElementById('canvas-container')!)
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
                console.log(dropzone)
                tab.classList.remove('docked')
                tab.setAttribute('docked', 'none')

                if (
                    dropzoneContainer.querySelectorAll('.empty').length == 2
                ) {
                    dropzoneContainer.classList.add('empty')
                    console.log('bassl')
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
                            dropContRect.height - 144
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
                min: {width: 0, height: 128},
            }),
        ],
    })
</script>

<style scoped lang="scss">
    #specimen-container {
        height: 100%;
        position: relative;
    }
    #main {
        display: flex;
        height: 100%;
    }

    #canvas-container {
        flex-grow: 1;
    }

    .dropzone-container {
        display: flex;
        flex-direction: column;
        width: 300px;
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
            max-height: calc(100% - 128px);

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
        position: absolute;
    }
</style>
