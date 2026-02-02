<template>
    <span class="titlespan">
        <span
            ref="cardTitle"
            v-safe-html="specimenName"
            class="wrappable" /><a
                v-if="specimenName.match(/A\d{6}\s*$/)"
                :href="oeisLinkFor(specimenName)"
                target="_blank"
                @click.stop>
                <div class="info material-icons-sharp external">launch</div>
            </a>
    </span>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'

    import type {CardSpecimen} from './SpecimenCard.vue'

    import {nameOfQuery, oeisLinkFor} from '@/shared/browserCaching'

    export default defineComponent({
        props: {
            spec: {
                type: Object as PropType<CardSpecimen>,
                required: true,
            },
        },
        data() {
            return {specimenName: ''}
        },
        mounted() {
            this.specimenName =
                this.spec.title || nameOfQuery(this.spec.query)
        },
        methods: {oeisLinkFor},
    })
</script>

<style scoped lang="scss">
    .titlespan {
        white-space: nowrap;

        .wrappable {
            white-space: normal;
        }
        a {
            color: var(--ns-color-grey);
            .info {
                transform: scale(0.6);
            }
            .info:hover {
                transform: scale(0.75);
            }
        }
        a:hover {
            color: var(--ns-color-fg);
        }
    }
</style>
