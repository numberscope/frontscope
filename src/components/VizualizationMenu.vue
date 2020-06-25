<template>
  <div>
    <h2>Visualizers</h2>
    <ul class="list-group">
        <VizSelector
            v-for="viz in vizualizers"
            v-bind:title="viz.name"
            v-bind:key="viz.id"
            v-on:set-viz-params="setParams(viz)"
            >
            </VizSelector>
    </ul>
    <SeqVizParamsModal
        v-if="showModal"
        v-bind:params="liveVizualizer.params"
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
    vizualizers: Array,
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
              this.liveVizualizer = new viz.vizualizer();
              this.openParamsModal();  
    },
    createViz: function() {
      const validationResult = this.liveVizualizer.validate();
      if(validationResult.isValid) {
          this.errors = [];
          this.closeParamsModal();
          this.$emit("createViz", this.liveVizualizer);
      } else {
        this.errors = validationResult.errors;
      }

    }
  },
  data: function(){
    return {
        showModal: false,
        liveVizualizer: { paramsSchema: []},
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
