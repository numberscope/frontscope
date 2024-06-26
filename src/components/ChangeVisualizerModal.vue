<template>
    <div id="background" @click.self="emit('close')">
        <div id="modal">
            <div id="bar">
                <button
                    class="material-icons-sharp"
                    alt="Close button"
                    @click="emit('close')">
                    close
                </button>
            </div>

            <div id="content">
                <h1>Change Visualizer</h1>

                <div id="results">
                    <div
                        class="sequence"
                        v-for="(visualizer, name) in vizMODULES"
                        :key="name"
                        @click="
                            changeVisualizer(name as string), emit('close')
                        ">
                        <h2>{{ visualizer.name }}</h2>
                        <p>{{ visualizer.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import vizMODULES from '../visualizers/visualizers'
    const emit = defineEmits(['close', 'change'])

    const props = defineProps(['specimen'])

    function changeVisualizer(key: string) {
        props.specimen!.visualizer = key
        emit('change')
    }
</script>

<style scoped>
    h1 {
        font-size: var(--ns-size-title);
        margin-bottom: 16px;
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
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
    }

    #modal {
        max-width: 900px;
        width: 100%;
        height: 100%;
        background-color: var(--ns-color-white);
        display: flex;
        flex-direction: column;
    }

    #bar {
        height: 48px;
        padding: 16px;
        background-color: var(--ns-color-white);
        display: flex;
        justify-content: end;
        align-items: center;

        button {
            font-size: 24px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: var(--ns-color-black);
        }
    }

    #content {
        padding: 16px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100% - 48px);
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

    @media (min-width: 850px) {
        #bar {
            display: flex;
            background-color: var(--ns-color-primary);
            height: 24px;
            padding: 0;

            button {
                color: var(--ns-color-white);
                font-size: 16px;
            }
        }

        #content {
            height: calc(100% - 24px);
            padding-top: 16px;
        }

        #modal {
            max-height: 80%;
        }
    }
</style>
