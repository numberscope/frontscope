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
                    <div
                        v-for="(param, name) in visibleParams"
                        v-bind:class="groupClass(param.visibleDependency)"
                        v-bind:key="name">
                        <div class="labeled-input">
                            <input
                                v-if="paramType[name] === 'boolean'"
                                type="checkbox"
                                class="left-input"
                                :id="name as string"
                                v-model="param.value as boolean" />
                            <input
                                v-if="paramType[name] === 'color'"
                                type="color"
                                class="left-input"
                                :id="name as string"
                                v-model="param.value" />
                            <label
                                class="form-label"
                                v-bind:for="name as string">
                                <span
                                    v-if="
                                        param.required &&
                                        !boxes.includes(paramType[name])
                                    "
                                    class="redtext"
                                    >*</span
                                >{{ param.displayName
                                }}{{
                                    boxes.includes(paramType[name]) ? '' : ':'
                                }}
                            </label>
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'bigint'"
                                v-bind:id="name as string"
                                v-bind:value="param.value"
                                v-on:input="setBigint($event, param)" />
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'integer'"
                                v-bind:id="name as string"
                                v-bind:value="param.value"
                                v-on:input="setInteger($event, param)" />
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'number'"
                                v-bind:id="name as string"
                                v-model.number="param.value" />
                            <select
                                class="form-select"
                                v-if="paramType[name] === 'enum'"
                                v-bind:id="name as string"
                                v-model.number="param.value">
                                <option
                                    v-for="(optval, optname) in stringsOf(
                                        param.from
                                    )"
                                    v-bind:key="optname"
                                    v-bind:value="optval">
                                    {{ optname }}
                                </option>
                            </select>
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'string'"
                                v-bind:id="name as string"
                                v-model="param.value" />
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'array'"
                                v-bind:id="name as string"
                                v-bind:value="param.value"
                                v-on:input="
                                    setArray(
                                        $event,
                                        param.value as [number | BigInt]
                                    )
                                " />
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'object'"
                                v-bind:id="name as string"
                                v-bind:value="param.value" />
                            <input
                                class="form-control"
                                v-if="paramType[name] === 'vector'"
                                v-bind:id="name as string"
                                v-bind:value="getVector(param)"
                                v-on:input="setVector($event, param)" />
                        </div>
                        <small
                            v-bind:id="name + '-help-text'"
                            class="form-text text-muted">
                            {{ param.description }}
                        </small>
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
    import {defineComponent} from 'vue'
    import type {PropType} from 'vue'
    import p5 from 'p5'
    import type {ParamInterface} from '../shared/Paramable'
    const reminder = '(Note: must be an integer.) '
    export default defineComponent({
        name: 'SeqVizParamsModal',
        methods: {
            groupClass(dependency: undefined | string): string {
                let retval = 'form-group'
                if (dependency) {
                    retval += ` dependent`
                }
                return retval
            },
            integerReminder(is: string, was: string, p: ParamInterface) {
                // differing by initial 0 is ok:
                is = is.replace(/^0/, '')
                was = was.replace(/^0/, '')
                if (is === was) {
                    // all is well, display immediately
                    if (
                        p.description
                        && p.description.substring(0, reminder.length)
                            === reminder
                    ) {
                        p.description = p.description.substring(
                            reminder.length
                        )
                    }
                    this.$forceUpdate()
                } else {
                    // Give user a beat to see that they typed something
                    // before it is deleted because not of correct format
                    setTimeout(() => {
                        // Make sure there is a description
                        if (!p.description) p.description = ''
                        if (
                            p.description.substring(0, reminder.length)
                            !== reminder
                        ) {
                            p.description = reminder + p.description
                        }
                        this.$forceUpdate()
                    }, 500)
                }
            },
            setBigint(e: Event, p: ParamInterface) {
                const target = e.target as HTMLInputElement
                try {
                    p.value = BigInt(target.value)
                } catch {
                    // Continue with old value
                }
                this.integerReminder(
                    (p.value as BigInt).toString(),
                    target.value,
                    p
                )
            },
            setInteger(e: Event, p: ParamInterface) {
                const target = e.target as HTMLInputElement
                try {
                    p.value = parseInt(target.value, 10)
                    if (isNaN(p.value as number)) p.value = 0
                } catch {
                    // Continue with old value
                }
                this.integerReminder(
                    (p.value as number).toString(),
                    target.value,
                    p
                )
            },
            getVector(p: ParamInterface) {
                const vec = p.value as p5.Vector
                let retval = vec.x.toString()
                if (!isNaN(vec.y)) retval += `,${vec.y}`
                return retval
            },
            setVector(e: Event, p: ParamInterface) {
                const target = e.target as HTMLInputElement
                const part = target.value.split(',')
                ;(p.value as p5.Vector).x = Number(part[0])
                ;(p.value as p5.Vector).y = Number(part[1])
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
            stringsOf(
                enumObj: {[key: string]: string | number} | undefined
            ): {
                [key: string]: number
            } {
                if (!enumObj) return {}
                const retval: {[key: string]: number} = {}
                for (const prop in enumObj) {
                    if (typeof enumObj[prop] === 'number') {
                        retval[prop] = enumObj[prop] as number
                    }
                }
                return retval
            },
        },
        props: {
            params: {type: Object, required: true},
            errors: {type: Array as PropType<string[]>, required: true},
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
            }
            // We supply our own type designations for all of the
            // params; and `boxes` is a constant giving the types
            // for which the controls are small boxes that come to
            // the left of the label, as opposed to the right
            return {paramType: types, boxes: ['boolean', 'color']}
        },
        computed: {
            requiredMissing(): boolean {
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
            visibleParams(): {[key: string]: ParamInterface} {
                const viz: {[key: string]: ParamInterface} = {}
                for (const name in this.params) {
                    if (this.params[name].visibleDependency) {
                        const dependsOn =
                            this.params[this.params[name].visibleDependency]
                        if ('visiblePredicate' in this.params[name]) {
                            if (
                                !this.params[name].visiblePredicate(
                                    dependsOn.value
                                )
                            ) {
                                continue
                            }
                        } else {
                            if (
                                dependsOn.value
                                !== this.params[name].visibleValue
                            ) {
                                continue
                            }
                        }
                    }
                    viz[name] = this.params[name]
                }
                return viz
            },
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
    .labeled-input {
        display: flex;
        align-items: baseline;
    }
    .dependent {
        margin-left: 1.5em;
        background-color: ghostwhite;
    }
    .form-control {
        flex: 1;
    }
    .form-label {
        margin-right: 0.5em;
    }
    .left-input {
        margin-right: 0.5em;
    }
</style>
