<template>
    <div>
        <tab id="sequenceTab" class="tab" />
        <tab id="visualiserTab" class="tab" />

        <div id="main">
            <div id="left-dropzone" class="dropzone" />
            <div id="right-dropzone" class="dropzone" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import Tab from '@/components/Tab.vue'
    import interact from 'interactjs'

    // enable draggables to be dropped into this
    interact('.dropzone').dropzone({
        accept: '.dragAndResize',
        // amount of required overlap for drop
        overlap: 0.5,

        // activates when tab is dropped in dropzone
        ondrop: function (event) {
            const dragElem = event.relatedTarget
            const dropzoneElement = event.target

            const x = dropzoneElement.getBoundingClientRect().left
            const y = parseFloat(dragElem.getAttribute('data-y') || '0')

            // move the element to the dropzone with a smooth transition
            dragElem.style.transitionDuration = '0.3s'
            dragElem.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

            // reset transition after it's done
            dragElem.addEventListener(
                'transitionend',
                function resetTransition() {
                    dragElem.style.transitionDuration = '0s'
                    dragElem.removeEventListener(
                        'transitionend',
                        resetTransition
                    )
                }
            )
            // update attributes
            dragElem.setAttribute('data-x', x.toString())

            event.relatedTarget.textContent = 'Dropped'
        },
    })
</script>

<style>
    #main {
        display: flex;
        justify-content: space-between;
        height: 100vh;
    }

    .dropzone {
        width: 300px;
        height: 90%;
        padding: 10px;
        background-color: #cbe7ff;
        display: inline-block;
    }
    .tab {
        position: absolute;
    }
    #visualiserTab {
        top: 500px;
    }
</style>
@/components/Tab.vue
