<script setup lang="ts">
    import {showChangeModal} from '@/shared/showChangeModal'
    import seqMODULES from '@/sequences/sequences'
    import {specimen} from '@/views/Scope.vue'
    import type {SequenceInterface} from '@/sequences/SequenceInterface'
    import vizMODULES from '@/visualizers/visualizers'
    import type {VisualizerInterface} from '@/visualizers/VisualizerInterface'

    const sequences: SequenceInterface[] = []
    for (const name in seqMODULES) {
        sequences.push(new seqMODULES[name].sequence(0))
    }

    const visualizers: VisualizerInterface[] = []
    for (const name in vizMODULES) {
        visualizers.push(
            new vizMODULES[name].visualizer(specimen.getSequence())
        )
    }
</script>

<script lang="ts">
    import {defineComponent, type PropType} from 'vue'
    import type {ModalType} from '@/shared/modalType'

    export default defineComponent({
        name: 'ChangeButton',
        props: {
            modalType: {type: Number as PropType<ModalType>, required: true},
        },
    })
</script>

<template>
    <div id="background" @click.self="showChangeModal.close">
        <div id="modal">
            <div id="bar">
                <img
                    src="../assets/img/close.svg"
                    alt="Close button"
                    @click="showChangeModal.close" />
            </div>

            <div id="content">
                <h1>
                    Change {{ modalType === 0 ? 'Sequence' : 'Visualizer' }}
                </h1>
                <div>
                    <button class="active">Browse</button>
                    <button>
                        Saved
                        {{ modalType === 0 ? 'Sequences' : 'Visualizers' }}
                    </button>
                </div>

                <div v-if="modalType === 0">
                    <label for="oeis">Search the OEIS</label><br />
                    <input type="text" id="oeis" placeholder="A037161" />
                    <img
                        src="../assets/img/search.svg"
                        alt="Search button"
                        id="search" />
                </div>

                <div id="results" v-if="modalType === 0">
                    <div
                        class="sequence"
                        v-for="sequence in sequences"
                        :key="sequence.name"
                        @click="
                            specimen.setSequence(sequence)
                            showChangeModal.close()
                        ">
                        <h2>{{ sequence.name }}</h2>
                        <p>{{ sequence.description }}</p>
                    </div>
                </div>
                <div id="results" v-else-if="modalType === 1">
                    <div
                        class="sequence"
                        v-for="visualizer in visualizers"
                        :key="visualizer.name"
                        @click="
                            specimen.setVisualizer(visualizer)
                            showChangeModal.close()
                        ">
                        <h2>{{ visualizer.name }}</h2>
                        <p>{{ visualizer.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    * {
        margin: 0;
        padding: 0;
    }
    h1 {
        font-size: var(--ns-size-title);
        margin-bottom: 16px;
    }
    button {
        font-size: var(--ns-size-heading-2);
        margin-bottom: 16px;
        background-color: var(--ns-color-white);
        border: none;
        padding: 4px;
        margin-right: 16px;
        cursor: pointer;
    }
    .active {
        border-bottom: var(--ns-color-black);
        border-bottom-width: 1px;
        border-bottom-style: solid;
    }
    label {
        font-size: var(--ns-size-subheading);
    }
    input[type='text'] {
        font-size: var(--ns-size-heading-2);
        margin-bottom: 16px;
        margin-right: 8px;
        border: none;
        border-bottom: var(--ns-color-black);
        border-bottom-width: 1px;
        border-bottom-style: solid;
        padding: 6px 8px;
        width: 328px;
    }
    input[type='text']:focus {
        outline: none;
        border-bottom-color: var(--ns-color-primary);
    }
    input[type='text']::placeholder {
        color: var(--ns-color-light);
    }

    .sequence {
        width: 216px;
        height: 268px;
        background-color: black;
        padding: 10px;
        color: white;
        cursor: pointer;
    }
    .sequence p {
        font-size: var(--ns-size-subheading);
        color: white;
    }
    .sequence h2 {
        color: white;
        font-size: var(--ns-size-heading);
    }

    #background {
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        flex: 1;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
    }

    #modal {
        width: 990px;
        height: 647px;
        background-color: var(--ns-color-white);
        margin: 32px;
    }

    #bar {
        height: 24px;
        background-color: var(--ns-color-primary);
    }
    #bar img {
        float: right;
        margin-top: 4px;
        margin-right: 4px;
        cursor: pointer;
    }

    #content {
        padding: 32px;
        display: flex;
        flex-direction: column;
        height: 623px;
    }

    #search {
        display: inline-block;
        vertical-align: top;
        border-style: solid;
        border-width: 1px;
        cursor: pointer;
    }

    #results {
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        flex: 1;
        gap: 16px;
    }
</style>
