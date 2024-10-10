<template>
    <div class="tab" @click="selected">
        <div class="drag">
            <div class="buttons">
                <span
                    class="minimize material-icons-sharp"
                    @click="minMaxWindow">
                    minimize
                </span>
                <span
                    class="docking material-symbols-sharp"
                    @click="dockWindow">
                    dock_to_right
                </span>
            </div>
        </div>
        <div class="content">
            <slot />
        </div>
        <div class="resize" />
    </div>
</template>

<script setup lang="ts">
    import interact from 'interactjs'
    import type {InteractEvent} from '@interactjs/types'
    import {
        positionAndSizeTab,
        positionAndSizeAllTabs,
        selectTab,
    } from '../views/Scope.vue'

    const minimizedTabHeight = 110

    // every element with draggable class can be dragged
    interact('.tab').resizable({
        // no inertia for resizing
        inertia: false,
        // Only want bottom resizing and only when the tab isn't docked
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
                ) {
                    // select the tab when it is resized
                    selectTab(tab)
                    // update the classlist with "minimized"
                    // if the height is less or equal than the
                    // minimized tab height
                    tab.style.height = event.rect.height + 'px'
                    if (event.rect.height <= minimizedTabHeight) {
                        tab.classList.add('minimized')
                    } else {
                        tab.classList.remove('minimized')
                    }
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

    interact('.drag').draggable({
        inertia: false,
        autoScroll: false,

        listeners: {
            start: () => {
                document.body.style.userSelect = 'none'
            },
            move: dragMoveListener,

            // This function is called when a user stops dragging a tab
            // It checks whether the tab is docked, and if it is, returns
            // it to its place.
            end: (event: InteractEvent) => {
                document.body.style.userSelect = 'auto'

                const tab = event.target.parentElement
                if (!(tab instanceof HTMLElement)) return
                const zoneName = tab.getAttribute('docked')
                if (!zoneName || zoneName === 'none') return

                const dropzone = document.querySelector(
                    `#${zoneName}-dropzone`
                )
                if (!(dropzone instanceof HTMLElement)) return

                tab.setAttribute('last-dropzone', zoneName)
                positionAndSizeTab(tab, dropzone)
            },
        },
    })

    function dragMoveListener(event: InteractEvent) {
        const target = event.target.parentElement
        const container = document.querySelector('#specimen-container')
        if (
            target instanceof HTMLElement
            && container instanceof HTMLElement
        ) {
            selectTab(target)

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

        selectTab(tab)

        const content = tab.querySelector('.content')
        if (!(content instanceof HTMLElement)) return

        // if the tab is docked, we have a different behavior
        if (tab.classList.contains('docked')) {
            // vertical and horizontal position of the tab
            // (eg. top-right, where vert is top and side is right)
            const [vert, side] = (tab.getAttribute('docked') ?? '').split('-')
            // get the correct dropzone wrapper
            const dropzoneWrapper = tab.parentElement?.querySelector(
                '#' + side + '-dropzone-container'
            )?.firstChild
            if (!(dropzoneWrapper instanceof HTMLElement)) return

            if (dropzoneWrapper instanceof HTMLElement) {
                if (tab.classList.contains('minimized')) {
                    // if we want to maximize top tab,
                    // set height of wrapper to 400px,
                    // if we want to maximize bottom tab,
                    // set height (of top tab wrapper) to 100% - 400px
                    if (vert === 'top') {
                        dropzoneWrapper.style.height = '400px'
                    } else {
                        dropzoneWrapper.style.height = 'calc(100% - 400px)'
                    }
                    content.style.overflowY = 'scroll'
                    tab.classList.remove('minimized')
                    // update the size and position of all tabs
                    positionAndSizeAllTabs()
                } else {
                    // if we want to minimize top tab,
                    // set height of wrapper to the minimized tab height,
                    // if we want to minimize bottom tab,
                    // set height (of top tab wrapper) to 100% - XXXpx,
                    // where XXX is a bit less than the minimized tab height
                    if (vert === 'top') {
                        dropzoneWrapper.style.height = `${minimizedTabHeight}px`
                    } else {
                        // Temp variable to beat lint's line length limits :(
                        const h = `calc(100% - ${minimizedTabHeight - 20}px)`
                        dropzoneWrapper.style.height = h
                    }
                    content.style.overflowY = 'hidden'
                    tab.classList.add('minimized')
                    dropzoneWrapper.classList.add('resized')
                    // update the size and position of all tabs
                    positionAndSizeAllTabs()
                }
            }
            return
        }
        // If the tab is minimized, maximize it
        if (tab.classList.contains('minimized')) {
            tab.style.height = '400px'
            content.style.overflowY = 'scroll'
            tab.classList.remove('minimized')
            return
        }
        // If the tab is maximized, minimize it
        else {
            tab.style.height = '90px'
            content.style.overflowY = 'hidden'
            tab.classList.add('minimized')
        }
    }
    // helper to choose docking site
    function zoneOrder(preferred: string) {
        const zoneParts = preferred.split('-')
        const otherVert = zoneParts[0] === 'top' ? 'bottom' : 'top'
        return [preferred, `${otherVert}-${zoneParts[1]}`]
    }

    function dockWindow(event: MouseEvent) {
        const tab = (event.currentTarget as HTMLElement).closest('.tab')
        if (!(tab instanceof HTMLElement)) return
        // if the tab is docked, different behavior
        if (tab.classList.contains('docked')) {
            // get the last undocked position of the tab
            const x =
                (tab.getAttribute('last-coords-x') || 0).toString() + 'px'
            const y =
                (tab.getAttribute('last-coords-y') || 0).toString() + 'px'

            // move the tab to the last undocked position
            tab.style.left = x
            tab.style.top = y
            // update attributes
            tab.setAttribute('data-x', x)
            tab.setAttribute('data-y', y)

            // update the classlist with "docked" if the tab is docked
            const dropzone = document.querySelector(
                '#' + tab.getAttribute('docked') + '-dropzone'
            )
            const dropzoneContainer = dropzone?.parentElement?.parentElement
            if (
                tab instanceof HTMLElement
                && dropzone instanceof HTMLElement
                && dropzoneContainer instanceof HTMLElement
                && tab.classList.contains('docked')
            ) {
                // update classlists when undocking
                dropzone.classList.add('empty')
                tab.classList.remove('docked')
                tab.setAttribute('docked', 'none')
                // if both dropzones are empty,
                // make the dropzone container empty aswell
                if (
                    dropzoneContainer.querySelectorAll('.empty').length == 2
                ) {
                    dropzoneContainer.classList.add('empty')
                }
            }
            return
        }

        selectTab(tab)

        // get current position
        const x = parseFloat(tab.getAttribute('data-x') || '0')
        const y = parseFloat(tab.getAttribute('data-y') || '0')

        // save current position before docking
        tab.setAttribute('last-coords-x', x.toString())
        tab.setAttribute('last-coords-y', y.toString())

        const preferredZone = tab.getAttribute('last-dropzone') || 'top-right'
        const zonesToTry = zoneOrder(preferredZone)
        for (const zoneName of zonesToTry) {
            const zone = document.querySelector(`#${zoneName}-dropzone`)
            if (!(zone instanceof HTMLElement)) continue
            if (zone.classList.contains('empty')) {
                positionAndSizeTab(tab, zone)
                tab.setAttribute('last-dropzone', zoneName)
                break
            }
        }
    }
    // select the tab when it is clicked
    function selected(event: MouseEvent) {
        const tab = (event.currentTarget as HTMLElement).closest('.tab')
        if (!(tab instanceof HTMLElement)) return

        selectTab(tab)
    }
</script>

<style scoped lang="scss">
    // mobile styles
    .buttons {
        display: none;
    }
    .tab {
        width: 300px;
        height: fit-content;
    }
    .content {
        padding: 0px 16px 16px 16px;
        width: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        max-width: 500px;
    }
    // tablet & desktop styles
    @media (min-width: $tablet-breakpoint) {
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
            width: var(--ns-desktop-tab-width);
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
            position: absolute;
            top: 16px;
            background-color: var(--ns-color-white);
            width: 100%;
            height: calc(100% - 16px);
            overflow-y: scroll;
            overflow-x: hidden;
        }
    }
</style>
