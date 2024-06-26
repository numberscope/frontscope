<template>
    <div id="background" @click.self="emit('close')">
        <div id="modal">
            <div id="bar">
                <button class="material-icons-sharp" @click="emit('close')">
                    close
                </button>
            </div>

            <div id="content">
                <h1>Change Sequence</h1>

                <div id="search-bar">
                    <div>
                        <label for="oeis">Search the OEIS</label><br />
                        <input type="text" id="oeis" placeholder="A037161" />
                    </div>
                    <button class="material-icons-sharp">search</button>
                </div>

                <div id="results">
                    <div
                        class="sequence"
                        v-for="(sequence, name) in seqMODULES"
                        :key="name"
                        @click="
                            changeSequence(name as string), emit('close')
                        ">
                        <h2>{{ sequence.name }}</h2>
                        <p>{{ sequence.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import seqMODULES from '../sequences/sequences'
    const emit = defineEmits(['close', 'change'])

    const props = defineProps(['specimen'])
    function changeSequence(key: string) {
        props.specimen!.sequence = key
        emit('change')
    }
</script>

<style scoped lang="scss">
    h1 {
        font-size: var(--ns-size-title);
        margin-bottom: 16px;
        margin-top: 0;
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

    #content {
        padding: 16px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100% - 48px);
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

    #search-bar {
        display: flex;
        align-items: center;

        div {
            margin-right: 8px;
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
        }
        input[type='text']:focus {
            outline: none;
            border-bottom-color: var(--ns-color-primary);
        }
        input[type='text']::placeholder {
            color: var(--ns-color-light);
        }

        button {
            font-size: 24px;
            border: 1px solid var(--ns-color-black);
            background: none;
            aspect-ratio: 1 / 1;
        }
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
