<template>
  <div>
    <h2>Visualizers</h2>
    <ul class="list-group">
        <VizSelector
            v-for="viz in visualizers"
            v-bind:title="viz.name"
            v-bind:key="viz.id"
            v-on:set-viz-params="setParams(viz)"
            >
            </VizSelector>
    </ul>
    <SeqVizParamsModal
        v-if="showModal"
        v-bind:params="livevisualizer.params"
        v-bind:errors="errors"
        v-on:closeModal="closeParamsModal"
        v-on:submitParams="createViz" >
    </SeqVizParamsModal>
  </div>
</template>

<script>
import VizSelector from '@/components/ToolSelector.vue'
import SeqVizParamsModal from '@/components/SeqVizParamsModal.vue'

export default {
  name: 'VizualizationMenu',
  props: {
    visualizers: Array,
    activeViz: Object,
    activeSeq: Object
  },
  components: {
    VizSelector,
    SeqVizParamsModal
  },
  methods: {
    openParamsModal: function() {
      this.showModal = true;
    },
    closeParamsModal: function() {
      this.showModal = false;
    },
    setParams: function(viz) {
      this.livevisualizer = new viz.visualizer();
      this.openParamsModal();  
    },
    createViz: function() {
      const validationResult = this.livevisualizer.validate();
      if(validationResult.isValid) {
        this.errors = [];
        this.closeParamsModal();
        this.$emit("createViz", this.livevisualizer);
      } else {
        this.errors = validationResult.errors;
      }

    }
  },
  data: function(){
    return {
        showModal: false,
        livevisualizer: { paramsSchema: []},
        errors: []
    } 
  }
}

</script>

<style scoped>
ul {
    list-style: none;
    }
</style>
