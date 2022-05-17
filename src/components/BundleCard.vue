<template>
    <div class="col-4-sm">
        <div class="card" style="width: 18rem">
            <div class="card-body">
                <h5 class="card-title">{{ seq.name + ' + ' + viz.name }}</h5>
                <p class="card-text">
                    This is a bundle of {{ seq.name + ' + ' + viz.name }}.
                </p>
                <!-- this.uid comes from vue-unique-id package -->
                <div :id="this.uid"></div>
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
    import p5 from 'p5'
    export default {
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
                    viz.draw()
                    console.log(sketch.frameCount)
                    if (sketch.frameCount >= 50) {
                        sketch.noLoop()
                    }
                }
                // this.uid comes from vue-unique-id package
            }, document.getElementById(this.uid) as HTMLElement)
            thumb.setup()
            thumb.draw()
        },
        methods: {},
        props: {
            seq: Object,
            viz: Object,
        },
    }
</script>

<style scoped>
    .card {
        margin: 1em;
        min-height: 250px;
    }
</style>
