<template>
    <div class="col-4-sm">
        <div class="card" style="width: 18rem">
            <div class="card-body">
                <h5 class="card-title">{{ seq.name + ' + ' + viz.name }}</h5>
                <p class="card-text">
                    This is a bundle of {{ seq.name + ' + ' + viz.name }}.
                </p>
                <div class="card-preview" :id="cid"></div>
                <div class="card-buttons">
                    <a
                        v-on:click="$emit('drawBundle', {seq: seq, viz: viz})"
                        href="#"
                        class="btn btn-primary mr-2">
                        Draw
                    </a>
                    <a
                        v-on:click="
                            $emit('removeBundle', {seq: seq, viz: viz})
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
    // we need a unique id for each canvas
    // see https://github.com/vuejs/vue/issues/5886#issuecomment-308647738
    let cid_count = 0
    export default defineComponent({
        name: 'BundleCard',
        mounted() {
            this.seq.initialize()
            this.viz.view(this.seq)
            this.viz.inhabit(document.getElementById(this.cid) as HTMLElement)
            this.viz.show()
            setTimeout(() => this.viz.stop(), 500)
        },
        unmounted() {
            this.viz.dispose()
        },
        methods: {},
        props: {
            seq: {type: Object, required: true},
            viz: {type: Object, required: true},
            // we need a unique id for each canvas
            // see https://github.com/vuejs/vue/issues/5886
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
