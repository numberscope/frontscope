<template>
    <div>
    <h2>Select a sequence and visualizer to create a bundle.</h2>
    <p>You can set up several bundles and then inspect them more closely to compare.</p>
    <div class="row">
        <div class="col-sm-6">
            <div v-if="activeSeq === null || activeSeq.isValid === undefined"
                 class="alert alert-warning">
                Select a sequence
            </div>
            <div v-else class="alert alert-primary">
                Active sequence: {{activeSeq.name}}
            </div>
        </div>
        <div class="col-sm-6">
            <div v-if="activeViz === null || activeViz.isValid === undefined"
                 class="alert alert-warning">
                Select a visualizer
            </div>
            <div v-else class="alert alert-primary">
                Active visualizer: {{activeViz.name}}
            </div>
        </div>
    </div>
    <button v-if="readyToBundle" class="btn btn-primary"
            v-on:click="$emit('createBundle')">
        Create Bundle
    </button>
    <div class="row">
        <BundleCard
            v-for="bundle in bundles"
            v-bind:key="bundle.uid"
            v-bind:seq="bundle.seq"
            v-bind:viz="bundle.viz"
            v-on:drawBundle="$emit('drawBundle', $event)"
        />
    </div>
        <!--<button v-if="readyToDraw" type="button" class="btn btn-warning" v-on:click="draw">Draw</button>-->
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import BundleCard from '@/components/bundleCard.vue';

export default Vue.extend({
    components: {
        BundleCard
    },
    props: {
        activeSeq: Object,
        activeViz: Object,
        bundles: Array
    },
    computed: {
        readyToBundle: function(): boolean {
            return this.activeSeq !== null && this.activeSeq.isValid !== undefined
               && this.activeViz !== null && this.activeViz.isValid !== undefined;
        }
    }
})
</script>
