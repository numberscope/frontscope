<template>
    <div class="modal">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Set Parameters</h5>
            <button type="button" class="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <ul>
                <li v-for="param in params" v-bind:key="param.name">{{param.name}}</li>
            </ul>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary">Save changes</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
        </div>
    </div>
    </div>
</template>

<script>
export default {
    name: 'SequenceParamsModal',
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
</style>
