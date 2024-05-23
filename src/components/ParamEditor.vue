<template>
    <div>
        <p>{{ title }}</p>
        <p v-if="subtitle">{{ subtitle }}</p>
        <p v-if="description">{{ description }}</p>
        <div v-for="(param, name) in paramable.params" v-bind:key="name">
            <ParamField
                v-bind:param="param"
                v-bind:paramName="name as string"
                v-bind:status="paramStatuses[name]"
                @updateParam="updateParam(name as string, $event)" />
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'
    import type {ParamableInterface} from '../shared/Paramable'
    import typeFunctions from '../shared/ParamType'
    import {ValidationStatus} from '../shared/ValidationStatus'
    import ParamField from './ParamField.vue'

    export default defineComponent({
        name: 'ParamEditor',
        props: {
            title: {type: String, required: true},
            subtitle: {type: String, required: false},
            description: {type: String, required: false},
            paramable: {
                type: Object as () => ParamableInterface,
                required: true,
            },
        },
        components: {
            ParamField,
        },
        data() {
            const paramStatuses: {[key: string]: ValidationStatus} = {}
            const status = new ValidationStatus()

            Object.keys(this.paramable.params).forEach(
                key => (paramStatuses[key] = new ValidationStatus())
            )

            return {paramStatuses, status}
        },
        methods: {
            updateParam(paramName: string, value: string) {
                const param = this.paramable.params[paramName]
                param.value = value

                let paramStatus = typeFunctions[param.type].validate(value)
                if (paramStatus.isValid())
                    paramStatus =
                        param.validate !== undefined
                            ? param.validate(
                                  typeFunctions[param.type].realize(value)
                              )
                            : ValidationStatus.ok()

                this.paramStatuses[paramName] = paramStatus

                const statusValues = Object.keys(this.paramStatuses).map(
                    key => this.paramStatuses[key]
                )
                if (statusValues.every(status => status.isValid())) {
                    this.status = this.paramable.validate()
                    if (this.status.isValid())
                        this.paramable.assignParameters()
                }
            },
        },
    })
</script>

<style scoped></style>
