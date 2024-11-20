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
                            @selected="madeSelection" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {ref, nextTick, onMounted} from 'vue'
    import type {PropType, UnwrapNestedRefs} from 'vue'

    import SpecimensGallery from './SpecimensGallery.vue'
    import OEISbar from './OEISbar.vue'
    import type {CardSpecimen} from './SpecimensGallery.vue'

    import type {OEIS} from '@/sequences/OEIS'
    import {
        standardSequences,
        getSequences,
        addSequence,
        deleteSequence,
    } from '@/shared/browserCaching'
    import {isMobile} from '@/shared/layoutUtilities'
    import {Specimen} from '@/shared/Specimen'
    import {
        specimenQuery,
        parseSpecimenQuery,
    } from '@/shared/specimenEncoding'
    import vizMODULES from '@/visualizers/visualizers'

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

    const cards = ref([] as CardSpecimen[])

    const switcher = ref<HTMLElement | null>(null)
    const galleryWrap = ref<HTMLElement | null>(null)
    const aligner = ref<HTMLElement | null>(null)

    async function setupCards(cat: Categories) {
        if (cat === 'visualizer') {
            for (const module in vizMODULES) {
                const query = specimenQuery(
                    module,
                    module,
                    props.specimen.sequenceKey,
                    '',
                    props.specimen.sequence.query
                )
                cards.value.push({
                    query,
                    subtitle: vizMODULES[module].description,
                })
            }
        } else {
            for (const [seq, seqQuery] of getSequences()) {
                const sequence = Specimen.makeSequence(seq, seqQuery)
                const query = specimenQuery(
                    sequence.name,
                    props.specimen.visualizerKey,
                    seq,
                    props.specimen.visualizer.query,
                    seqQuery
                )
                const subtitle = sequence.description
                let canDelete = true
                for (const [sseq, ssQuery] of standardSequences) {
                    if (seq === sseq && seqQuery === ssQuery) {
                        canDelete = false
                        break
                    }
                }
                const seqCard = {query, subtitle, canDelete}
                if (seq.startsWith('OEIS')) {
                    await (sequence as OEIS).cacheValues(0n)
                    seqCard.subtitle = sequence.description
                }
                cards.value.push(seqCard)
            }
        }
    }

    onMounted(async () => {
        await setupCards(props.category)
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
        const nCards = cards.value.length
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

    function scrollToID(id: string) {
        const myElement = document.getElementById(`SC-OEIS ${id}`)
        if (myElement) {
            myElement.scrollIntoView()
            myElement.classList.add('high-card')
            setTimeout(() => {
                myElement.classList.add('fade-card')
            }, 50)
        }
    }

    function madeSelection() {
        emit('close')
    }

    async function addModule(id: string) {
        addSequence(`OEIS ${id}`, '')
        const nCards = cards.value.length
        cards.value.splice(0, nCards)
        await setupCards(props.category)
        nextTick(() => scrollToID(id))
    }

    function deleteModule(index: number) {
        if (props.category !== 'sequence') return
        const doomedQuery = cards.value[index].query
        cards.value.splice(index, 1)
        const {sequenceKind, sequenceQuery} = parseSpecimenQuery(doomedQuery)
        deleteSequence(sequenceKind, sequenceQuery)
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
