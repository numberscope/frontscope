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
                <div class="switcher-title-bar">
                    <h1>Choose {{ category }}</h1>

                    <div v-if="category === 'sequence'" id="search-bar">
                        <div>
                            <label for="oeis">Search the OEIS</label><br />
                            <input
                                type="text"
                                id="oeis"
                                placeholder="A037161" />
                        </div>
                        <button class="material-icons-sharp">search</button>
                    </div>
                </div>
                <SpecimensGallery
                    class="results"
                    :specimens="altered(category)"
                    :canDelete="false" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import SpecimensGallery from '../components/SpecimensGallery.vue'
    import type {CardSpecimen} from '../components/SpecimensGallery.vue'
    import seqMODULES from '../sequences/sequences'
    import vizMODULES from '../visualizers/visualizers'
    import {Specimen} from '../shared/Specimen'
    import type {PropType, UnwrapNestedRefs} from 'vue'

    function descriptions(mods: {[key: string]: {description: string}}) {
        return Object.fromEntries(
            Object.keys(mods).map(k => [k, mods[k].description])
        )
    }
    const modules = {
        sequence: descriptions(seqMODULES),
        visualizer: descriptions(vizMODULES),
    }

    const emit = defineEmits(['close'])
    type Categories = 'sequence' | 'visualizer'

    const props = defineProps({
        category: {
            type: String as PropType<Categories>,
            required: true,
        },
        specimen: {
            type: Object as PropType<UnwrapNestedRefs<Specimen>>,
            required: true,
        },
    })

    function altered(cat: Categories): CardSpecimen[] {
        const cards: CardSpecimen[] = []
        const options = modules[cat]
        for (const module in options) {
            const visKey =
                cat === 'sequence' ? props.specimen.visualizerKey : module
            const seqKey =
                cat === 'sequence' ? module : props.specimen.sequenceKey
            const vis64 =
                cat === 'sequence' ? props.specimen.visualizer.toBase64() : ''
            const seq64 =
                cat === 'sequence' ? '' : props.specimen.sequence.toBase64()
            // TODO: Way to produce Specimen _encodings_ without having to
            // actually construct the Specimen; maybe do this if/when we
            // switch to human-readable encodings
            const alteredSpec = new Specimen(
                module,
                visKey,
                seqKey,
                vis64,
                seq64
            )
            const newCard: CardSpecimen = {
                base64: alteredSpec.encode64(),
                subtitle: options[module],
            }
            cards.push(newCard)
        }
        return cards
    }
</script>

<style scoped lang="scss">
    .switcher-title-bar {
        display: flex;
        justify-content: space-between;
    }
    h1 {
        font-size: var(--ns-size-title);
        margin-bottom: 16px;
        margin-top: 0;
    }

    .switch-option {
        width: 216px;
        height: 268px;
        background-color: black;
        padding: 10px;
        color: white;
        cursor: pointer;
    }
    .switch-option p {
        font-size: var(--ns-size-subheading);
        color: white;
    }
    .switch-option h2 {
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

    .results {
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        flex: 1;
        gap: 16px;
    }

    @media (min-width: $tablet-breakpoint) {
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
