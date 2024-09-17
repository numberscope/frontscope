<template>
    <div>
        <div v-if="status.defective()" class="error-box">
            <p
                v-for="error in status.errors"
                :key="error"
                class="error-message">
                {{ error }}
            </p>
            <p
                v-for="warning in status.warnings"
                :key="warning"
                class="warning-message">
                {{ warning }}
            </p>
        </div>
        <div
            class="title-and-button-bar button-container"
            @click="openSwitcher">
            <div class="visualizer-info" style="flex-grow: 1">
                <h1>Current {{ title }}</h1>
                <div class="item-name">{{ paramable.name }}</div>
            </div>
            <div class="change-tooltip tooltip-anchor button">
                <MageExchangeA id="change-icon" />
                <div class="desc-tooltip-text help-box">
                    Change {{ title }}
                </div>
            </div>
        </div>
        <p class="description">{{ paramable.description }}</p>
        <div v-for="(hierarchy, name) in sortedParams" :key="name">
            <ParamField
                :param="hierarchy.param"
                :value="paramable.tentativeValues[name]"
                :param-name="name as string"
                :status="paramStatuses[name]"
                @update-param="updateParam(name as string, $event)" />
            <div class="sub-param-box">
                <div
                    v-for="(subParam, subName) in hierarchy.children"
                    :key="subName">
                    <ParamField
                        v-if="checkDependency(subParam)"
                        :param="subParam"
                        :value="paramable.tentativeValues[subName]"
                        :param-name="subName as string"
                        :status="paramStatuses[subName]"
                        @update-param="
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
        ParamInterface,
        ParamableInterface,
    } from '../shared/Paramable'
    import typeFunctions, {ParamType} from '../shared/ParamType'
    import {ValidationStatus} from '../shared/ValidationStatus'
    import MageExchangeA from './MageExchangeA.vue'
    import ParamField from './ParamField.vue'

    interface ParamHierarchy {
        param: ParamInterface<ParamType>
        children: {[key: string]: ParamInterface<ParamType>}
    }

    type Paramable = () => ParamableInterface

    function resetStatuses(
        items: {[key: string]: unknown},
        statuses: {[key: string]: ValidationStatus}
    ) {
        for (const item in items) statuses[item] = ValidationStatus.ok()
    }

    export default defineComponent({
        name: 'ParamEditor',
        components: {
            MageExchangeA,
            ParamField,
        },
        props: {
            title: {type: String, required: true},
            paramable: {
                type: Object as Paramable,
                required: true,
            },
        },
        emits: ['changed', 'openSwitcher'],
        data() {
            const status = ValidationStatus.ok()
            const paramStatuses: {[key: string]: ValidationStatus} = {}
            resetStatuses(this.paramable.params, paramStatuses)
            return {paramStatuses, status}
        },
        computed: {
            sortedParams() {
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
                return sortedParams
            },
        },
        watch: {
            paramable() {
                resetStatuses(this.paramable.params, this.paramStatuses)
            },
        },
        async created() {
            const pstatus = this.paramStatuses
            resetStatuses(this.paramable.params, pstatus)
            let good = true
            for (const param in this.paramable.params) {
                this.paramable.validateIndividual(param, pstatus[param])
                good &&= pstatus[param].isValid()
            }
            if (good) {
                // The argument '.' to validate below skips all
                // individual validation because we just checked them
                this.status = await this.paramable.validate('.')
            }
            this.$emit('changed')
        },
        methods: {
            async updateParam(paramName: string, value: string) {
                const paramable = this.paramable
                paramable.tentativeValues[paramName] = value
                const newStatus = ValidationStatus.ok()
                paramable.validateIndividual(paramName, newStatus)
                this.paramStatuses[paramName] = newStatus
                if (newStatus.invalid()) return
                this.status = await paramable.validate()
                if (paramable.isValid) this.$emit('changed')
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
            openSwitcher() {
                this.$emit('openSwitcher')
            },
        },
    })
</script>

<style scoped lang="scss">
    /* Note some classes are used from SpecimenBar.vue, e.g.
       title-and-button-bar
     */
    h1 {
        font-size: var(--ns-size-subheading); // sizes inverted in ParamEditor
        // because the name of the item is more important than the title
        margin: 0;
    }

    .item-name {
        // designed to mimic input areas
        border-bottom: 1.5px solid var(--ns-color-black);
        font-size: var(--ns-size-heading);
        padding: 6px 8px 6px 8px;
        width: 100%;
    }

    .change-tooltip {
        position: relative;
        cursor: pointer;
    }

    #change-icon {
        position: relative;
        top: 2px;
    }

    .description {
        font-size: 12px;
        margin-top: 0px;
        margin-bottom: 24px;
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
    }

    .error-message {
        color: red;
    }

    .warning-message {
        color: orange;
    }
</style>
