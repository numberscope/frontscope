<script setup lang="ts">
    import interact from 'interactjs'

    // every element with draggable class can be dragged
    interact('.tab').resizable({
        // no inertia for resizing (better imo)
        inertia: false,
        // not sure if we want horizontal resizing or not,
        // maybe we even want resizing to be only available from the bottom
        edges: {
            left: false,
            right: false,
            bottom: '.tab:not(.docked) .resize',
            top: false,
        },

        listeners: {
            start() {
                document.body.style.userSelect = 'none'
            },

            end() {
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
            // keep the edges inside the parent
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
            start: () => {
                document.body.style.userSelect = 'none'
            },
            move: dragMoveListener,
            end: (event: Interact.InteractEvent) => {
                document.body.style.userSelect = 'auto'

                const tab = event.target.parentElement
                if (!(tab instanceof HTMLElement)) return
                if (tab.getAttribute('docked') === 'none') return

                const dropzone = document.querySelector(
                    '#' + tab.getAttribute('docked') + '-dropzone'
                )
                if (!(dropzone instanceof HTMLElement)) return

                const dropzoneRect = dropzone.getBoundingClientRect()

                tab.style.top = dropzoneRect.top + 'px'
                tab.style.left = dropzoneRect.left + 'px'
                tab.style.height = dropzoneRect.height + 'px'

                tab.setAttribute('data-x', dropzoneRect.left.toString())
                tab.setAttribute('data-y', dropzoneRect.top.toString())
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
                Math.min(x, containerRect.right - targetRect.width),
                0
            )
            const boundedY = Math.max(
                Math.min(y, containerRect.bottom - targetRect.height),
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
</script>

<template>
    <div class="tab">
        <div class="drag"></div>
        <div class="content">
            <p>parameters and stuff would go here</p>
        </div>
        <div class="resize"></div>
    </div>
</template>

<style scoped lang="scss">
    .tab {
        border: 1px solid var(--ns-color-black);
        width: 300px;
        height: 200px;
        z-index: 999;
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
    }
</style>
