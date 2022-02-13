<template>
    <div class="modal">
        <div v-on:click="$emit('closeModal')" class="modal-backdrop"></div>
        <div class="modal-dialog modal-content" role="document">
            <div class="modal-header">
                <h5 class="modal-title">Set Parameters</h5>
                <button
                    v-on:click="$emit('closeModal')"
                    type="button"
                    class="close"
                    aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form>
                    <div v-if="errors.length > 0" class="text-danger">
                        <h4>Validation Errors</h4>
                        <p>
                            Please fix the following errors and try submitting
                            again.
                        </p>
                        <ul>
                            <li v-for="error in errors" v-bind:key="error">
                                {{ error }}
                            </li>
                        </ul>
                    </div>
                    <div v-for="(param, name) in params" v-bind:key="name">
                        <div v-if="paramVisible[name]">
                            <div
                                v-if="paramType[name] === 'bigint'"
                                class="form-group">
                                <label v-bind:for="name">
                                    <span class="redtext">{{
                                        param.required ? '*' : ''
                                    }}</span
                                    >{{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="name"
                                    v-bind:value="param.value"
                                    v-on:input="setBigint($event, param)" />
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'number'"
                                class="form-group">
                                <label v-bind:for="name">
                                    <span class="redtext">{{
                                        param.required ? '*' : ''
                                    }}</span
                                    >{{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="name"
                                    v-model.number="param.value" />
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'enum'"
                                class="form-group">
                                <label v-bind:for="name">
                                    {{ param.displayName }}
                                </label>
                                <select
                                    class="form-select"
                                    v-bind:id="name"
                                    v-model.number="param.value">
                                    <option
                                        v-for="(
                                            optval, optname
                                        ) in param.from"
                                        v-bind:key="optname"
                                        v-bind:value="optval">
                                        {{ optname }}
                                    </option>
                                </select>
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'string'"
                                class="form-group">
                                <label v-bind:for="name">
                                    <span class="redtext">{{
                                        param.required ? '*' : ''
                                    }}</span
                                    >{{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="name"
                                    v-model="param.value" />
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'array'"
                                class="form-group">
                                <label v-bind:for="name">
                                    <span class="redtext">{{
                                        param.required ? '*' : ''
                                    }}</span
                                    >{{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="name"
                                    v-bind:value="param.value"
                                    v-on:input="
                                        setArray($event, param.value)
                                    " />
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'object'"
                                class="form-group">
                                <label v-bind:for="name">
                                    <span class="redtext">{{
                                        param.required ? '*' : ''
                                    }}</span
                                    >{{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="name"
                                    v-bind:value="param.value" />
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'vector'"
                                class="form-group">
                                <label v-bind:for="name">
                                    <span class="redtext">{{
                                        param.required ? '*' : ''
                                    }}</span
                                    >{{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="name"
                                    v-bind:value="getVector(param.value)"
                                    v-on:input="
                                        setVector($event, param.value)
                                    " />
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="
                                    param.type == ParamType.number ||
                                    param.type == ParamType.text
                                "
                                class="form-group">
                                <label v-bind:for="param.name">
                                    {{ param.displayName }}
                                </label>
                                <input
                                    class="form-control"
                                    v-bind:id="param.name"
                                    v-model="param.value" />
                                <small
                                    v-bind:id="param.name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'boolean'"
                                class="form-check">
                                <input
                                    type="checkbox"
                                    class="form-check-input"
                                    :id="name"
                                    v-model="param.value" />
                                <label class="form-check-label" :for="name">
                                    {{ param.displayName }}
                                </label>
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                            <div
                                v-if="paramType[name] === 'color'"
                                class="form-group">
                                <input
                                    type="color"
                                    class="form-color-input"
                                    :id="name"
                                    v-model="param.value" />
                                <label
                                    class="form-check-label"
                                    v-bind:for="name">
                                    {{ param.displayName }}
                                </label>
                                <small
                                    v-bind:id="name + '-help-text'"
                                    class="form-text text-muted">
                                    {{ param.description }}
                                </small>
                            </div>
                        </div>
                    </div>
                    <small v-if="Object.values(params).some(v => v.required)">
                        <span class="redtext">*</span>Parameters with an
                        asterisk are required.
                    </small>
                </form>
            </div>
            <div class="modal-footer">
                <button
                    v-if="!loadingInstance"
                    v-on:click="$emit('submitParams')"
                    type="button"
                    :disabled="requiredMissing"
                    class="btn btn-primary">
                    Save changes
                </button>
                <button
                    v-if="loadingInstance"
                    v-on:click="$emit('submitInstance')"
                    type="button"
                    :disabled="requiredMissing"
                    class="btn btn-primary">
                    Add this sequence
                </button>
                <button
                    v-on:click="$emit('closeModal')"
                    type="button"
                    class="btn btn-secondary"
                    data-dismiss="modal">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {ParamType} from '@/shared/ParamType'
    import p5 from 'p5'

    export default Vue.extend({
        name: 'SeqVizParamsModal',
        methods: {
            setBigint(e: Event, p: {value: BigInt}) {
                const target = e.target as HTMLInputElement
                try {
                    p.value = BigInt(target.value)
                } catch {
                    // Continue with old value
                }
                // Give user a beat to see that they typed something before it
                // is possibly deleted because not of correct format
                setTimeout(() => this.$forceUpdate(), 500)
            },
            getVector(vec: p5.Vector) {
                let retval = vec.x.toString()
                if (!isNaN(vec.y)) retval += `,${vec.y}`
                return retval
            },
            setVector(e: Event, vec: p5.Vector) {
                const target = e.target as HTMLInputElement
                const part = target.value.split(',')
                vec.x = Number(part[0])
                vec.y = Number(part[1])
            },
            setArray(e: Event, a: [number | BigInt]) {
                const target = e.target as HTMLInputElement
                const parts = target.value.split(',')
                if (typeof a[0] === 'number') {
                    for (let ix = 0; ix < parts.length; ++ix) {
                        a[ix] = Number(parts[ix])
                    }
                } else {
                    for (let ix = 0; ix < parts.length; ++ix) {
                        a[ix] = BigInt(parts[ix])
                    }
                }
                while (a.length > parts.length) {
                    a.pop()
                }
            },
        },
        props: {
            params: Object,
            errors: Array,
            loadingInstance: Boolean,
        },
        data() {
            const types: {[key: string]: string} = {}
            for (const name in this.params) {
                let type = ''
                if (this.params[name].value instanceof p5.Vector) {
                    type = 'vector'
                } else if (Array.isArray(this.params[name].value)) {
                    type = 'array'
                } else if (this.params[name].from) {
                    type = 'enum'
                } else {
                    type = typeof this.params[name].value
                }
                types[name] = this.params[name].forceType || type
                console.log('Concluded', name, 'is', types[name])
            }
            return {paramType: types}
        },
        computed: {
            requiredMissing() {
                for (const name in this.params) {
                    if (
                        this.params[name].required
                        && (this.params[name].value === undefined
                            || this.params[name].value === null
                            || this.params[name].value === '')
                    ) {
                        return true
                    }
                }
                return false
            },
            paramVisible() {
                const viz: {[key: string]: boolean} = {}
                for (const name in this.params) {
                    if (this.params[name].visibleDependency) {
                        const dependsOn
                            = this.params[this.params[name].visibleDependency]
                        viz[name]
                            = dependsOn.value === this.params[name].visibleValue
                    } else {
                        viz[name] = true
                    }
                }
                console.log(viz)
                return viz
            },
            ParamType: () => ParamType,
        },
    })
</script>

<style scoped>
    .modal {
        display: block;
    }

    .modal-backdrop {
        position: absolute;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
    }

    .modal-content {
        max-height: 90vh;
        overflow: scroll;
    }

    .redtext {
        color: red;
    }

    .btn:disabled {
        background: #dddddd;
    }

    .form-color-input {
        margin-right: 0.5em;
    }

    .form-select {
        margin-left: 0.5em;
    }
</style>
