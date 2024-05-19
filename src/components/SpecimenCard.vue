<template>
    <div class="col-4-sm">
        <div class="card" style="width: 18rem">
            <div class="card-body">
                <h5 class="card-title">
                    {{ `${card.name}` }}
                </h5>
                <p class="card-text">
                    Display {{ seq.name }}
                    visualization.
                </p>
                <div class="card-preview" :id="cid"></div>
                <div class="card-buttons">
                    <a
                        v-on:click="
                            $emit('drawSpecimen', {seq: seq, viz: viz})
                        "
                        href="#"
                        class="btn btn-primary mr-2">
                        Draw
                    </a>
                    <a
                        v-on:click="
                            $emit('removeSpecimen', {seq: seq, viz: viz})
                        "
                        href="#"
                        class="btn btn-danger">
                        Remove
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    let cid_count = 0
    export default defineComponent({
        name: 'SpecimenCard',
        mounted() {
            this.seq.initialize()
            this.viz.view(this.seq)
            this.viz.inhabit(document.getElementById(this.cid) as HTMLElement)
            this.viz.show()
            setTimeout(() => this.viz.stop(), 500)
        },
        beforeUnmount() {
            this.viz.depart(document.getElementById(this.cid) as HTMLElement)
        },
        methods: {},
        props: {
            seq: {type: Object, required: true},
            viz: {type: Object, required: true},
            card: {type: Object, required: true},
            cid: {
                type: String,
                default: function () {
                    return 'Card-' + cid_count++
                },
            },
        },
    })
</script>

<style scoped>
    .card {
        margin: 1em;
        min-height: 350px;
    }
    .card-body {
        display: flex;
        flex-direction: column;
    }
    .card-preview {
        flex: 1;
        width: 100%;
    }
</style>
