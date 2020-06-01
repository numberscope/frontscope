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
            <form>
                <div v-for="param in params" v-bind:key="param.name">
                    <div v-if="param.type == 'number' || param.type == 'text'" class="form-group">
                        <label :for="param.name">{{param.displayName}}</label>
                        <input type="email" class="form-control" :id="param.name" aria-describedby="emailHelp" placeholder="Enter email">
                        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                    </div>
                    <div v-if="param.type == 'boolean'" class="form-check">
                        <input type="checkbox" class="form-check-input" :id="param.name" v-model="param.value">
                        <label class="form-check-label" :for="param.name">{{param.displayName}}</label>
                    </div>
                </div>
            </form>
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
