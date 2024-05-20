<script setup lang="ts">
    import interact from 'interactjs'

    // every element with draggable class can be dragged
    interact('.dragAndResize')
        .draggable({
            inertia: true,
            // keep the element on screen
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true,
                }),
            ],
            autoScroll: true,

            listeners: {
                move: dragMoveListener,
            },
        })
        .resizable({
            // no inertia for resizing (better imo)
            inertia: false,
            // not sure if we want horizontal resizing or not,
            // maybe we even want resizing to be only available from the bottom
            edges: {left: true, right: true, bottom: true, top: true},

            listeners: {
                move(event) {
                    const target = event.target
                    let x = parseFloat(target.getAttribute('data-x')) || 0
                    let y = parseFloat(target.getAttribute('data-y')) || 0

                    x += event.deltaRect.left
                    y += event.deltaRect.top

                    // update element lengths
                    target.style.width = event.rect.width + 'px'
                    target.style.height = event.rect.height + 'px'

                    target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)'

                    target.setAttribute('data-x', x)
                    target.setAttribute('data-y', y)
                },
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent',
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: {width: 0, height: 1},
                }),
            ],
        })

    function dragMoveListener(event: Interact.InteractEvent) {
        const target = event.target
        // keep position in attributes
        const x = parseFloat(target.getAttribute('data-x') || '0') + event.dx
        const y = parseFloat(target.getAttribute('data-y') || '0') + event.dy

        // move element
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

        // update attributes
        target.setAttribute('data-x', x.toString())
        target.setAttribute('data-y', y.toString())
    }
</script>

<template>
    <div class="dragAndResize">
        <p>parameters and stuff would go here</p>
    </div>
</template>

<style scoped>
    .dragAndResize {
        display: inline-block;
        width: 300px;
        height: 400px;
        background-color: transparent;
        z-index: 999;
        color: black;
        border: 1px solid black;
        padding: 10px;
        touch-action: none;
        user-select: none;
        transform: translate(0px, 0px);
    }
</style>
