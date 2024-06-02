<script setup lang="ts">
    import interact from 'interactjs'
    import {positionAndSizeTab} from '../views/Scope.vue'

    // every element with draggable class can be dragged
    interact('.tab').resizable({
        // no inertia for resizing (better imo)
        inertia: false,
        // Only want bootom resizing and only when the tab isn't docked
        edges: {
            left: false,
            right: false,
            bottom: '.tab:not(.docked) .resize',
            top: false,
        },

        listeners: {
            start() {
                // prevent text selection
                document.body.style.userSelect = 'none'
            },

            end() {
                // allow text selection
                document.body.style.userSelect = 'auto'
            },

            move(event) {
                const tab = event.target

                if (
                    tab instanceof HTMLElement
                    && !tab.classList.contains('docked')
                )
                    tab.style.height = event.rect.height + 'px'
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

    interact('.drag').draggable({
        inertia: false,
        autoScroll: false,

        listeners: {
            start: (event: Interact.InteractEvent) => {
                document.body.style.userSelect = 'none'
                event.target.parentElement!.style.zIndex += 10
            },
            move: dragMoveListener,

            // This function is called when a user stops dragging a tab
            // It checks whether the tab is docked, and if it is, returns
            // it to its place.
            end: (event: Interact.InteractEvent) => {
                document.body.style.userSelect = 'auto'

                const tab = event.target.parentElement
                if (!(tab instanceof HTMLElement)) return
                if (tab.getAttribute('docked') === 'none') return

                const dropzone = document.querySelector(
                    '#' + tab.getAttribute('docked') + '-dropzone'
                )
                if (!(dropzone instanceof HTMLElement)) return

                positionAndSizeTab(tab, dropzone)
            },
        },
    })

    function dragMoveListener(event: Interact.InteractEvent) {
        const target = event.target.parentElement
        const container = document.querySelector('#specimen-container')
        if (
            target instanceof HTMLElement
            && container instanceof HTMLElement
        ) {
            const containerRect = container.getBoundingClientRect()
            const targetRect = target.getBoundingClientRect()
            // keep position in attributes
            const x =
                parseFloat(target.getAttribute('data-x') || '0') + event.dx
            const y =
                parseFloat(target.getAttribute('data-y') || '0') + event.dy

            const boundedX = Math.max(
                Math.min(x, containerRect.width - targetRect.width),
                0
            )
            const boundedY = Math.max(
                Math.min(y, containerRect.height - targetRect.height),
                0
            )

            // move element
            target.style.left = boundedX.toString() + 'px'
            target.style.top = boundedY.toString() + 'px'

            // update attributes
            target.setAttribute('data-x', boundedX.toString())
            target.setAttribute('data-y', boundedY.toString())
        }
    }
    function minMaxWindow(event: MouseEvent) {
        const tab = (event.currentTarget as HTMLElement).closest('.tab')
        if (!(tab instanceof HTMLElement)) return
        const content = tab.querySelector('.content')
        if (!(content instanceof HTMLElement)) return

        // If the tab is minimized, maximize it
        if (tab.classList.contains('minimized')) {
            tab.style.height = '500px'
            content.style.overflowY = 'scroll'
            tab.classList.remove('minimized')
            return
        }
        // If the tab is maximized, minimize it
        else {
            tab.style.height = '30px'
            content.style.overflowY = 'hidden'
            tab.classList.add('minimized')
        }
    }
    function dockWindow(event: MouseEvent) {
        const tab = (event.currentTarget as HTMLElement).closest('.tab')
        if (!(tab instanceof HTMLElement)) return
        if (tab.classList.contains('docked')) return

        const firstDropzone = document.querySelector('#top-right-dropzone')
        const secondDropzone = document.querySelector(
            '#bottom-right-dropzone'
        )

        if (!(firstDropzone instanceof HTMLElement)) return
        if (!(secondDropzone instanceof HTMLElement)) return

        // if top right dropzone is empty, dock there
        if (firstDropzone.classList.contains('empty')) {
            positionAndSizeTab(tab, firstDropzone)
        }
        // otherwise dock in the bottom right dropzone
        else {
            positionAndSizeTab(tab, secondDropzone)
        }
    }
</script>

<template>
    <div class="tab">
        <div class="drag">
            <div class="buttons">
                <span
                    class="minimize material-icons-sharp"
                    @click="minMaxWindow">
                    minimize
                </span>
                <span
                    class="docking material-icons-sharp"
                    @click="dockWindow">
                    dock
                </span>
            </div>
        </div>
        <div class="content">
            <slot></slot>
        </div>
        <div class="resize"></div>
    </div>
</template>

<style scoped lang="scss">
    .buttons {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-right: 8px;
        padding-top: 2px;
        padding-bottom: 2px;
    }
    .minimize,
    .docking {
        cursor: pointer;
        color: var(--ns-color-white);
        font-size: 12px;
    }
    .tab {
        border: 1px solid var(--ns-color-black);
        width: 300px;
        height: 200px;
        z-index: 50;
    }

    .resize {
        height: 16px;
        width: 100%;
        position: absolute;
        bottom: 0;
    }

    // The drag element is actually underneath the entire window
    // This is so that dropping is more intuitive
    .drag {
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: var(--ns-color-black);
    }

    .content {
        padding: 16px;
        position: absolute;
        top: 16px;
        background-color: var(--ns-color-white);
        width: 100%;
        height: calc(100% - 16px);
        overflow-y: scroll;
        overflow-x: hidden;
    }
</style>
