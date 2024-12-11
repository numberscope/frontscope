<template>
    <div>
        <div v-if="paramable.validationStatus.defective()" class="error-box">
            <p
                v-if="paramable.validationStatus.invalid()"
                class="error-message">
                Errors:
            </p>
            <p
                v-for="error in paramable.validationStatus.errors"
                :key="error"
                class="error-message">
                {{ error }}
            </p>
            <p
                v-if="paramable.validationStatus.isWarned()"
                class="warning-message">
                Warnings:
            </p>
            <p
                v-for="warning in paramable.validationStatus.warnings"
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
                <div ref="itemName" class="item-name">
                    <span v-safe-html="paramable.htmlName" /><a
                        v-if="paramable.name.match(/A\d{6}\s*$/)"
                        :href="oeisLinkFor(paramable.name)"
                        target="_blank"
                        @click.stop>
                        <div class="info material-icons-sharp external">
                            launch
                        </div>
                    </a>
                </div>
            </div>
            <div class="change-tooltip tooltip-anchor button">
                <MageExchangeA id="change-icon" />
                <div class="desc-tooltip-text help-box shadowed">
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
                :status="paramable.statusOf[name]"
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
                        :status="paramable.statusOf[subName]"
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
    import {oeisLinkFor} from '@/shared/browserCaching'
    import {realizeOne} from '@/shared/Paramable'
    import type {ParamInterface, ParamableInterface} from '@/shared/Paramable'
    import {ParamType} from '@/shared/ParamType'

    import MageExchangeA from './MageExchangeA.vue'
    import ParamField from './ParamField.vue'

    interface ParamHierarchy {
        param: ParamInterface<ParamType>
        children: {[key: string]: ParamInterface<ParamType>}
    }

    type Paramable = () => ParamableInterface

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
        methods: {
            async updateParam(paramName: string, value: string) {
                const paramable = this.paramable
                paramable.tentativeValues[paramName] = value
                paramable.validateIndividual(paramName)
                if (paramable.statusOf[paramName].invalid()) return
                await paramable.validate()
                if (paramable.validationStatus.isValid()) {
                    this.$emit('changed')
                }
            },
            checkDependency(param: ParamInterface<ParamType>): boolean {
                const dep = param.visibleDependency
                if (!dep) return true
                if (this.paramable.statusOf[dep].invalid()) return false
                const parent = this.paramable.params[dep]
                const v = realizeOne(
                    parent,
                    this.paramable.tentativeValues[dep]
                )
                if (param.visiblePredicate) {
                    return param.visiblePredicate(v as never)
                } else return param.visibleValue! === v
            },
            openSwitcher() {
                this.$emit('openSwitcher')
            },
            oeisLinkFor,
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
        cursor: pointer;

        a {
            color: var(--ns-color-grey);
            .info {
                transform: scale(0.7);
            }
            .info:hover {
                transform: scale(0.85);
            }
        }
        a:hover {
            color: var(--ns-color-black);
        }
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
        color: #f08000;
    }
</style>
