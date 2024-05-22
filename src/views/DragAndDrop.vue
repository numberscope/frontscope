<template>
    <div id="specimen-container">
        <tab id="sequenceTab" class="tab docked" docked="top-right" />
        <tab id="visualiserTab" class="tab docked" docked="bottom-right" />

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
                <div
                    id="top-left-dropzone"
                    class="dropzone empty"
                    dropzone="top-left"></div>
                <div
                    id="bottom-left-dropzone"
                    class="dropzone empty"
                    dropzone="bottom-left"></div>
            </div>
            <div id="canvas-container"></div>
            <div id="right-dropzone-container" class="dropzone-container">
                <div
                    id="top-right-dropzone"
                    class="dropzone"
                    dropzone="top-right"></div>
                <div
                    id="bottom-right-dropzone"
                    class="dropzone"
                    dropzone="bottom-right"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import Tab from '@/components/Tab.vue'
    import interact from 'interactjs'
    import {onMounted} from 'vue'

    // Assigns a dropzone's position and size to a tab
    function positionAndSizeTab(tab: HTMLElement, dropzone: HTMLElement) {
        const dropzoneRect = dropzone.getBoundingClientRect()

        tab.style.top = dropzoneRect.top + 'px'
        tab.style.left = dropzoneRect.left + 'px'
        tab.style.height = dropzoneRect.height + 'px'

        tab.setAttribute('data-x', dropzoneRect.left.toString())
        tab.setAttribute('data-y', dropzoneRect.top.toString())
    }

    // This function makes sure that the tabs remain in their docked position
    // when the window is resized
    function positionAndSizeAllTabs() {
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
            const dropzoneContainer = dropzone.parentElement
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

                let allEmpty = true
                dropzoneContainer.childNodes.forEach((child: ChildNode) => {
                    if (
                        child instanceof HTMLElement
                        && !child.classList.contains('empty')
                    )
                        allEmpty = false
                })

                if (allEmpty) dropzoneContainer.classList.add('empty')
            }
        },

        // activates when tab is dropped in dropzone
        ondrop: function (event) {
            const tab = event.relatedTarget.parentElement
            const dropzone = event.target
            const dropzoneContainer = dropzone.parentElement

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
</script>

<style scoped lang="scss">
    #specimen-container {
        height: 100%;
    }
    #main {
        display: flex;
        height: 100%;
    }

    #canvas-container {
        background-color: #cbe7ff;
        flex-grow: 1;
    }

    .dropzone-container {
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 100%;

        &#right-dropzone-container {
            right: 0;
        }

        &#left-dropzone-container {
            left: 0;
        }

        &.empty {
            position: absolute;
            pointer-events: none;
        }

        .dropzone {
            height: 50%;

            &.drop-hover {
                background-color: var(--ns-color-primary);
                filter: brightness(120%);
            }
        }
    }

    .tab {
        position: absolute;
    }
</style>
