<template>
    <div class="col-4-sm">
        <div class="card" style="width: 18rem">
            <div class="card-body">
                <h5 class="card-title">{{ seq.name + ' + ' + viz.name }}</h5>
                <p class="card-text">
                    This is a bundle of {{ seq.name + ' + ' + viz.name }}.
                </p>
                <div :id="cid"></div>
                <a
                    v-on:click="$emit('drawBundle', {seq: seq, viz: viz})"
                    href="#"
                    class="btn btn-primary mr-2">
                    Draw
                </a>
                <a
                    v-on:click="$emit('removeBundle', {seq: seq, viz: viz})"
                    href="#"
                    class="btn btn-danger">
                    Remove
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import p5 from 'p5'
    import {CachingError} from '../sequences/Cached'
    // we need a unique id for each canvas
    // see https://github.com/vuejs/vue/issues/5886#issuecomment-308647738
    let cid_count = 0
    export default defineComponent({
        name: 'BundleCard',
        mounted() {
            const seq = this.seq
            seq.initialize()
            const viz = this.viz
            const thumb = new p5(function (sketch) {
                viz.initialize(sketch, seq)
                sketch.setup = function () {
                    sketch.createCanvas(200, 200)
                    sketch.background('white')
                    viz.setup()
                }
                sketch.draw = function () {
                    try {
                        viz.draw()
                    } catch (e) {
                        if (e instanceof CachingError) {
                            sketch.cursor('progress')
                            return
                        } else {
                            throw e
                        }
                    }
                    sketch.cursor(sketch.ARROW)
                    if (sketch.frameCount >= 50) {
                        sketch.noLoop()
                    }
                }
            }, document.getElementById(this.cid) as HTMLElement)
            thumb.setup()
            thumb.draw()
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
        min-height: 250px;
    }
</style>
