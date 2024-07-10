<template>
    <div id="background" class="filler" @click.self="emit('close')">
        <div
            ref="aligner"
            id="canvas-overlay"
            class="filler"
            @click.self="emit('close')">
            <div ref="switcher" id="modal">
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
                                <label for="oeis">Search the OEIS</label>
                                <br />
                                <input
                                    type="text"
                                    id="oeis"
                                    placeholder="A037161" />
                            </div>
                            <button class="material-icons-sharp">
                                search
                            </button>
                        </div>
                    </div>
                    <div ref="galleryWrap" class="results">
                        <SpecimensGallery
                            class="results"
                            :specimens="altered(category)"
                            :canDelete="false" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import SpecimensGallery from '../components/SpecimensGallery.vue'
    import type {CardSpecimen} from '../components/SpecimensGallery.vue'
    import seqMODULES from '../sequences/sequences'
    import vizMODULES from '../visualizers/visualizers'
    import {isMobile} from '../shared/layoutUtilities'
    import {Specimen} from '../shared/Specimen'

    import {ref, onMounted} from 'vue'
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

    const switcher = ref<HTMLElement | null>(null)
    const galleryWrap = ref<HTMLElement | null>(null)
    const aligner = ref<HTMLElement | null>(null)
    onMounted(() => {
        // On mobile the switchers just cover the screen, so nothing to do:
        if (isMobile()) return
        // Keep TypeScript happy:
        if (!aligner.value || !switcher.value || !galleryWrap.value) return

        // Ok, time to position the switcher. First, align with the canvas
        // container:
        const canvasContainer = document.getElementById('canvas-container')
        if (!canvasContainer) return
        const canvasRect = canvasContainer.getBoundingClientRect()
        aligner.value.style.width = `${canvasRect.width}px`
        aligner.value.style.left = `${canvasRect.left}px`

        // Now re-dimension the modal to be (roughly) a whole number of cards
        // wide, and either just tall enough to fit all cards, or if it
        // can't be made that tall, ensure that it's _not_ roughly a
        // whole number of cards tall so that it's clear that it will be
        // necessary to scroll.
        const specGallery = galleryWrap.value.firstChild
        if (!specGallery) return

        const switchSty = window.getComputedStyle(switcher.value)
        const switchWidth = parseInt(switchSty.getPropertyValue('width'))
        const switchHeight = parseInt(switchSty.getPropertyValue('height'))

        const specSty = window.getComputedStyle(specGallery as HTMLElement)
        const specWidth = parseInt(specSty.getPropertyValue('width'))
        const specHeight = parseInt(specSty.getPropertyValue('height'))

        const gapWidth = parseInt(specSty.getPropertyValue('gap'))
        const cardWidth = parseInt(
            specSty.getPropertyValue('--ns-specimen-card-width')
        )

        const cardsWide = specWidth / (gapWidth + cardWidth)
        const fracCards = cardsWide - Math.floor(cardsWide)
        if (fracCards > 0.1) {
            // Pare it down to a nearest integer number of cards
            const extra = Math.floor(fracCards * (gapWidth + cardWidth))
            switcher.value.style.width = `${switchWidth - extra}px`
        }

        const cardHeight = 300 + gapWidth // approximate; they are not fixed
        const cardsHigh = specHeight / cardHeight
        const nCards = Object.keys(modules[props.category]).length
        const needsHeight = Math.ceil(nCards / Math.floor(cardsWide))
        if (needsHeight < cardsHigh) {
            const extra = Math.floor((cardsHigh - needsHeight) * cardHeight)
            switcher.value.style.height = `${switchHeight - extra}px`
            return
        }
        if (cardsHigh < 1.8) return // No need to adjust
        const fracHigh = cardsHigh - Math.floor(cardsHigh)
        if (fracHigh < 0.2 || fracHigh > 0.8) {
            // too near an integer
            const goalHeight = Math.round(cardsHigh) - 0.5
            const extra = Math.floor((cardsHigh - goalHeight) * cardHeight)
            switcher.value.style.height = `${switchHeight - extra}px`
        }
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
        margin-bottom: 0;
        margin-top: 0;
    }

    .filler {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    #background {
        z-index: 999;
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

    #content {
        padding: 16px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100% - 48px);
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
            margin-bottom: 8px;
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
        #modal {
            max-height: 90%;
            max-width: 90%;
        }

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
    }
</style>
