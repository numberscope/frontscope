<template>
    <div>
        <div class="error-box" v-if="!status.isValid()">
            <p v-for="error in status.errors" v-bind:key="error">
                {{ error }}
            </p>
        </div>
        <h1>{{ title }}</h1>
        <span class="subheading">{{ paramable.name }}</span>
        <p class="description">{{ paramable.description }}</p>
        <div v-for="(hierarchy, name) in sortedParams" v-bind:key="name">
            <ParamField
                v-bind:param="hierarchy.param"
                v-bind:value="paramable.tentativeValues[name]"
                v-bind:paramName="name as string"
                v-bind:status="paramStatuses[name]"
                @updateParam="updateParam(name as string, $event)" />
            <div class="sub-param-box">
                <div
                    v-for="(subParam, subName) in hierarchy.children"
                    v-bind:key="subName">
                    <ParamField
                        v-if="checkDependency(subParam)"
                        v-bind:param="subParam"
                        v-bind:value="paramable.tentativeValues[name]"
                        v-bind:paramName="subName as string"
                        v-bind:status="paramStatuses[subName]"
                        @updateParam="
                            updateParam(subName as string, $event)
                        " />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {
        GenericParamDescription,
        ParamInterface,
        ParamableInterface,
    } from '../shared/Paramable'
    import typeFunctions, {ParamType} from '../shared/ParamType'
    import {ValidationStatus} from '../shared/ValidationStatus'
    import ParamField from './ParamField.vue'

    interface ParamHierarchy {
        param: ParamInterface<ParamType>
        children: {[key: string]: ParamInterface<ParamType>}
    }

    type Paramable = () => ParamableInterface<GenericParamDescription>

    export default defineComponent({
        name: 'ParamEditor',
        props: {
            title: {type: String, required: true},
            paramable: {
                type: Object as Paramable,
                required: true,
            },
        },
        components: {
            ParamField,
        },
        data() {
            const paramStatuses: {[key: string]: ValidationStatus} = {}
            const status = ValidationStatus.ok()

            Object.keys(this.paramable.params).forEach(
                key => (paramStatuses[key] = ValidationStatus.ok())
            )

            const sortedParams: {[key: string]: ParamHierarchy} = {}
            Object.keys(this.paramable.params).forEach(key => {
                const param = this.paramable.params[key]
                if (!param.visibleDependency)
                    sortedParams[key] = {param, children: {}}
            })
            Object.keys(this.paramable.params).forEach(key => {
                const param = this.paramable.params[key]
                if (param.visibleDependency)
                    sortedParams[param.visibleDependency].children[key] =
                        param
            })

            return {paramStatuses, status, sortedParams}
        },
        created() {
            Object.keys(this.paramable.params).forEach(key =>
                this.validateIndependent(key)
            )
            if (this.validateAggregate()) this.paramable.assignParameters()
            this.$emit('changed')
        },
        methods: {
            updateParam(paramName: string, value: string) {
                const paramable = this.paramable
                paramable.tentativeValues[paramName] = value

                this.validateIndependent(paramName)
                if (this.validateAggregate()) {
                    this.paramable.assignParameters()
                    this.$emit('changed')
                }
            },
            validateIndependent(paramName: string): boolean {
                const param = this.paramable.params[paramName]
                const value = this.paramable.tentativeValues[paramName]

                // Handle non-required parameters
                if (!param.required && value === '') {
                    this.paramStatuses[paramName] = ValidationStatus.ok()
                    return true
                }

                let paramStatus = typeFunctions[param.type].validate(value)
                if (paramStatus.isValid())
                    paramStatus =
                        param.validate !== undefined
                            ? param.validate(
                                  typeFunctions[param.type].realize(value)
                              )
                            : ValidationStatus.ok()

                this.paramStatuses[paramName] = paramStatus
                return paramStatus.isValid()
            },
            validateAggregate() {
                const paramable = this.paramable
                const statusValues = Object.keys(this.paramStatuses).map(
                    key => this.paramStatuses[key]
                )
                if (statusValues.every(status => status.isValid())) {
                    this.status = paramable.validate()
                    paramable.isValid = this.status.isValid()
                    return this.status.isValid()
                } else {
                    paramable.isValid = false
                    return false
                }
            },
            checkDependency(param: ParamInterface<ParamType>): boolean {
                if (!this.paramStatuses[param.visibleDependency!].isValid())
                    return false
                const parent = this.paramable.params[param.visibleDependency!]
                const v = typeFunctions[parent.type].realize(
                    this.paramable.tentativeValues[param.visibleDependency!]
                )
                if (param.visiblePredicate)
                    return param.visiblePredicate(v as never)
                else return param.visibleValue! === v
            },
        },
    })
</script>

<style scoped lang="scss">
    h1 {
        font-size: 16px;
        margin-bottom: 0;
    }

    .subheading {
        color: var(--ns-color-grey);
        font-size: 14px;
    }

    .description {
        font-size: 12px;
        margin-bottom: 32px;
    }

    .sub-param-box {
        border-left: 1px solid var(--ns-color-black);
        margin-left: 8px;
        padding-left: 8px;
    }

    .error-box {
        border: 1px solid #ff2222;
        background: var(--ns-color-white);
        padding: 2px 8px;
    }

    .error-box p {
        font-size: var(--ns-size-body);
        margin: 8px 0;
        color: red;
    }
</style>
