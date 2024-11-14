<template>
    <!-- md
### Choosing Sequences

When you click on the name of the current sequence, a Sequence Switcher
panel will pop up. There will be preview cards for a number of different
sequences; click on a card to make that the active sequence. Often a
sequence can be further customized once it has been activated. For example,
you can define a sequence by nearly any algebraic Formula you can think
of (for example, the nth term of the sequence might be given by
`n^2 + round(100*sin(n))`). You can change that formula to whatever you
like once the Formula sequence is chosen.

     -->
    <div id="background" class="filler" @click.self="emit('close')">
        <div
            id="canvas-overlay"
            ref="aligner"
            class="filler"
            @click.self="emit('close')">
            <div id="modal" ref="switcher">
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
                        <!-- md
#### Accessing sequences from the Online Encyclopedia (OEIS)

You will also see at least a few OEIS Sequences that you can select. To choose
one not on the list, use the search bar at the top right of the popup. You
can enter any word or part of a word or OEIS ID, and a list of the
most-frequently-mentioned sequences connected with that search term will
appear. Click on any one of the results, and a new preview card for that
sequence will be added to the switcher panel. Numberscope will also remember
to include the sequence you just added when the switcher panel is reopened.
If you're done looking at a sequence and want to remove it from the panel,
click on the trash button on its preview card.
                         -->
                        <OEISbar
                            v-if="category === 'sequence'"
                            @add-sequence="addModule" />
                    </div>
                    <div ref="galleryWrap" class="results">
                        <SpecimensGallery
                            class="results"
                            :specimens="cards"
                            @remove-specimen="deleteModule"
                            @selected="emit('close')" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {ref, onMounted} from 'vue'
    import type {PropType, UnwrapNestedRefs} from 'vue'

    import SpecimensGallery from './SpecimensGallery.vue'
    import OEISbar from './OEISbar.vue'
    import type {CardSpecimen} from './SpecimensGallery.vue'

    import {seqMODULES, enableOEIS, disableOEIS} from '@/sequences/sequences'
    import {getIDs} from '@/shared/browserCaching'
    import {isMobile} from '@/shared/layoutUtilities'
    import {Specimen} from '@/shared/Specimen'
    import {specimenQuery} from '@/shared/specimenEncoding'
    import vizMODULES from '@/visualizers/visualizers'

    function descriptions(
        mods: {[key: string]: {description: string}},
        order?: string[]
    ) {
        // The control over the order is needed so that Sequences appear
        // with the "always-there" ones first, followed by the OEIS ones
        // in order from most recently added to longest-ago added.
        const descArray: [string, string][] = []
        for (const key in mods) {
            if (order && order.includes(key)) break
            descArray.push([key, mods[key].description])
        }
        if (order)
            // Add the rest of the keys in order
            for (const key of order)
                if (key in mods) descArray.push([key, mods[key].description])
        return Object.fromEntries(descArray)
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

    function getSequences() {
        return descriptions(
            seqMODULES,
            getIDs().map(id => `OEIS ${id}`)
        )
    }
    const modules = {
        sequence: getSequences(),
        visualizer: descriptions(vizMODULES),
    }
    const cards = ref(altered(props.category))

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
            const visQ =
                cat === 'sequence' ? props.specimen.visualizer.query : ''
            const seqQ =
                cat === 'sequence' ? '' : props.specimen.sequence.query
            const newCard: CardSpecimen = {
                query: specimenQuery(module, visKey, seqKey, visQ, seqQ),
                subtitle: options[module],
                canDelete: cat === 'sequence' && module.startsWith('OEIS'),
            }
            cards.push(newCard)
        }
        return cards
    }

    function addModule(id: string) {
        const seqLoad = enableOEIS(id)
        modules.sequence = getSequences()
        const nCards = cards.value.length
        cards.value.splice(0, nCards, ...altered(props.category))
        // Redo once we have the description of the sequence:
        if (seqLoad)
            seqLoad.then(() => {
                modules.sequence = getSequences()
                const newCards = altered(props.category)
                const nCards = cards.value.length
                cards.value.splice(0, nCards, ...newCards)
            })
    }

    function deleteModule(name: string) {
        if (props.category !== 'sequence' || !name.startsWith('OEIS')) return
        disableOEIS(name)
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

    .results {
        display: flex;
        height: min-content;
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
