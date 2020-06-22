<template>
    <div class="modal">
    <div v-on:click="$emit('closeModal')" class="modal-backdrop"></div>
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Set Parameters</h5>
            <button v-on:click="$emit('closeModal')" type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <form>
                <div v-for="param in params" v-bind:key="param.name">
                    <div v-if="param.type == 'number' || param.type == 'text'" class="form-group">
                        <label v-bind:for="param.name">{{param.displayName}}</label>
                        <input class="form-control" v-bind:id="param.name" v-model="param.value" />
                    </div>
                    <div v-if="param.type == 'boolean'" class="form-check">
                        <input type="checkbox" class="form-check-input" :id="param.name" v-model="param.value">
                        <label class="form-check-label" :for="param.name">{{param.displayName}}</label>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button v-on:click="$emit('submitParams')" type="button" class="btn btn-primary">Save changes</button>
            <button v-on:click="$emit('closeModal')" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
        </div>
    </div>
    </div>
</template>

<script>
export default {
    name: 'SeqVizParamsModal',
    methods: {
    },
    props: {
        params: Array
    }
}
</script>

<style scoped>
    .modal{
        display: block;
    }

    .modal-backdrop {
        position: absolute;
        background: rgba(0,0,0,0.5);
        z-index: -1;
    }
</style>
